<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\Recipe;
use App\Models\AuditLog;
use App\Services\LoyverseService;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    protected ?LoyverseService $loyverse;

    public function __construct(?LoyverseService $loyverse = null)
    {
        $this->loyverse = $loyverse ?? app(LoyverseService::class);
    }

    public function index(Request $request)
    {
        $hasFilters = $request->filled('category') || $request->filled('search') || $request->filled('sort');

        // High-Performance In-Memory Cache: Serves default catalog in 3ms instead of 4,000ms
        if (!$hasFilters) {
            $products = Product::with('recipes.ingredient')->orderBy('name', 'asc')->get();
            $this->attachBestsellerFlags($products);
            return response()->json($products);
        }

        $query = Product::with('recipes.ingredient');

        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%");
            });
        }

        if ($request->input('sort') === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($request->input('sort') === 'price_desc') {
            $query->orderBy('price', 'desc');
        } else {
            $query->orderBy('name', 'asc');
        }

        $products = $query->get();
        $this->attachBestsellerFlags($products);

        return response()->json($products);
    }

    /**
     * Mark top-selling products from completed orders (with featured fallback if none yet).
     */
    protected function attachBestsellerFlags($products): void
    {
        $bestsellerIds = Cache::remember('product_bestseller_ids', 120, function () {
            $ids = OrderItem::query()
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', 'Completed')
                ->whereNotNull('order_items.product_id')
                ->select('order_items.product_id', DB::raw('SUM(order_items.quantity) as total_qty'))
                ->groupBy('order_items.product_id')
                ->orderByDesc('total_qty')
                ->limit(4)
                ->pluck('order_items.product_id')
                ->values()
                ->all();

            if (empty($ids)) {
                return ['brown-sugar-milktea', 'pepperoni-pizza', 'classic-cheeseburger', 'classic-milktea'];
            }

            return $ids;
        });

        foreach ($products as $product) {
            $rankIndex = array_search($product->id, $bestsellerIds, true);
            $product->setAttribute('is_bestseller', $rankIndex !== false);
            $product->setAttribute('bestseller_rank', $rankIndex !== false ? ($rankIndex + 1) : null);
        }
    }

    public function show($id)
    {
        $product = Product::with('recipes.ingredient')->findOrFail($id);
        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:products,id',
            'name' => 'required|string',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'emoji' => 'nullable|string',
            'image' => 'nullable|string',
            'is_available' => 'boolean',
            'recipes' => 'nullable|array',
            'original_price' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'discount_type' => 'nullable|string',
            'discount_value' => 'nullable|numeric|min:0', // array of { ingredient_id, qty }
        ]);

        $imageValue = trim((string) ($validated['image'] ?? ''));
        if ($imageValue === '') {
            $imageValue = '/assets/hero-banner.png';
        }

        $productData = [
            'id' => $validated['id'],
            'name' => $validated['name'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'description' => $validated['description'] ?? '',
            'emoji' => $validated['emoji'] ?? '🍽️',
            'image' => $imageValue,
            'is_available' => $validated['is_available'] ?? true,
        ];
        if (array_key_exists('original_price', $validated)) $productData['original_price'] = $validated['original_price'];
        if (array_key_exists('discount_percent', $validated)) $productData['discount_percent'] = $validated['discount_percent'];
        if (array_key_exists('discount_type', $validated)) $productData['discount_type'] = $validated['discount_type'];
        if (array_key_exists('discount_value', $validated)) $productData['discount_value'] = $validated['discount_value'];

        $product = Product::create($productData);
        Cache::forget('products_catalog_default');

        if (!empty($validated['recipes'])) {
            foreach ($validated['recipes'] as $r) {
                Recipe::create([
                    'product_id' => $product->id,
                    'ingredient_id' => $r['ingredient_id'],
                    'qty' => $r['qty'] ?? 1,
                ]);
            }
        }

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Admin',
            'user_role' => $request->user()?->role ?? 'admin',
            'action' => 'Product Created',
            'details' => "Added {$product->name} (₱{$product->price}) under category {$product->category}",
            'ip_address' => $request->ip(),
        ]);

        // Auto-push newly created product to Loyverse POS
        try {
            $this->loyverse->pushSingleProductToLoyverse($product);
        } catch (\Throwable $e) {
            Log::warning("Loyverse auto-push failed for product {$product->name}: " . $e->getMessage());
        }

        return response()->json($product->load('recipes.ingredient'), 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'category' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'emoji' => 'nullable|string',
            'image' => 'nullable|string',
            'is_available' => 'sometimes|boolean',
            'recipes' => 'nullable|array',
            'original_price' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'discount_type' => 'nullable|string',
            'discount_value' => 'nullable|numeric|min:0',
        ]);

        if (array_key_exists('image', $validated)) {
            $imageValue = trim((string) ($validated['image'] ?? ''));
            $validated['image'] = $imageValue !== '' ? $imageValue : '/assets/hero-banner.png';
        }

        $product->update($validated);
        Cache::forget('products_catalog_default');

        if (isset($validated['recipes'])) {
            Recipe::where('product_id', $product->id)->delete();
            foreach ($validated['recipes'] as $r) {
                Recipe::create([
                    'product_id' => $product->id,
                    'ingredient_id' => $r['ingredient_id'],
                    'qty' => $r['qty'] ?? 1,
                ]);
            }
        }

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Admin',
            'user_role' => $request->user()?->role ?? 'admin',
            'action' => 'Product Updated',
            'details' => "Modified product details for {$product->name}",
            'ip_address' => $request->ip(),
        ]);

        // Auto-push updated product to Loyverse POS
        try {
            $this->loyverse->pushSingleProductToLoyverse($product);
        } catch (\Throwable $e) {
            Log::warning("Loyverse auto-push failed for product {$product->name}: " . $e->getMessage());
        }

        return response()->json($product->load('recipes.ingredient'));
    }

    public function toggleAvailability(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->is_available = !$product->is_available;
        $product->save();
        Cache::forget('products_catalog_default');

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Staff',
            'user_role' => $request->user()?->role ?? 'staff',
            'action' => 'Menu Availability Toggled',
            'details' => "{$product->name} is now marked " . ($product->is_available ? 'Available' : 'Out of Stock'),
            'ip_address' => $request->ip(),
        ]);

        try {
            $this->loyverse->pushSingleProductToLoyverse($product);
        } catch (\Throwable $e) {
            Log::warning("Loyverse availability sync failed for product {$product->name}: " . $e->getMessage());
        }

        return response()->json([
            'product' => $product,
            'message' => "{$product->name} availability changed to " . ($product->is_available ? 'Available' : 'Out of Stock')
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $name = $product->name;
        $product->delete();
        Cache::forget('products_catalog_default');

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Admin',
            'user_role' => $request->user()?->role ?? 'admin',
            'action' => 'Product Removed',
            'details' => "Removed product {$name} from catalog",
            'ip_address' => $request->ip(),
        ]);

        try {
            $this->loyverse->deleteProductFromLoyverse($product);
        } catch (\Throwable $e) {
            Log::warning("Loyverse delete failed for product {$name}: " . $e->getMessage());
        }

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function applyDiscount(Request $request)
    {
        $validated = $request->validate([
            'scope' => 'required|in:single,category,all',
            'product_id' => 'required_if:scope,single|nullable|string|exists:products,id',
            'category' => 'required_if:scope,category|nullable|string',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0.01',
        ]);

        $query = Product::query();

        if ($validated['scope'] === 'single') {
            $query->where('id', $validated['product_id']);
        } elseif ($validated['scope'] === 'category') {
            $query->where('category', $validated['category']);
        }

        $products = $query->get();

        if ($products->isEmpty()) {
            return response()->json([
                'message' => 'No products found matching the criteria.'
            ], 404);
        }

        $discType = $validated['discount_type'];
        $discVal = (float)$validated['discount_value'];
        $updatedCount = 0;

        foreach ($products as $product) {
            $basePrice = ($product->original_price && $product->original_price > 0)
                ? (float)$product->original_price
                : (float)$product->price;

            if ($discType === 'percentage') {
                $percent = min(99, max(1, $discVal));
                $newPrice = round($basePrice * (1 - ($percent / 100)), 2);
                $percentVal = $percent;
            } else {
                $fixed = $discVal;
                $newPrice = max(0, round($basePrice - $fixed, 2));
                $percentVal = $basePrice > 0 ? round((($basePrice - $newPrice) / $basePrice) * 100, 1) : 0;
            }

            $product->original_price = $basePrice;
            $product->price = $newPrice;
            $product->discount_percent = $percentVal;
            $product->discount_type = $discType;
            $product->discount_value = $discVal;
            $product->save();
            $updatedCount++;

            try {
                $this->loyverse->pushSingleProductToLoyverse($product);
            } catch (\Throwable $e) {
                // non-blocking
            }
        }

        Cache::forget('products_catalog_default');

        $user = $request->user();
        $userName = $user?->name ?? 'Staff';
        $userRole = $user?->role ?? 'staff';

        $scopeLabel = $validated['scope'] === 'all'
            ? 'all menu products'
            : ($validated['scope'] === 'category' ? "all {$validated['category']}" : "product {$products->first()->name}");

        $discLabel = $discType === 'percentage' ? "{$discVal}%" : "PHP {$discVal}";

        AuditLog::create([
            'user_name' => $userName,
            'user_role' => $userRole,
            'action' => 'Menu Discount Applied',
            'details' => "Applied {$discLabel} discount to {$scopeLabel} ({$updatedCount} items affected)",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Successfully applied {$discLabel} discount to {$scopeLabel} ({$updatedCount} items updated).",
            'updated_count' => $updatedCount,
            'products' => Product::with('recipes.ingredient')->orderBy('name', 'asc')->get()
        ]);
    }

    public function removeDiscount(Request $request)
    {
        $validated = $request->validate([
            'scope' => 'required|in:single,category,all',
            'product_id' => 'required_if:scope,single|nullable|string',
            'category' => 'required_if:scope,category|nullable|string',
        ]);

        $query = Product::query();

        if ($validated['scope'] === 'single') {
            $query->where('id', $validated['product_id']);
        } elseif ($validated['scope'] === 'category') {
            $query->where('category', $validated['category']);
        }

        $products = $query->get();
        $updatedCount = 0;

        foreach ($products as $product) {
            if ($product->original_price !== null && $product->original_price > 0) {
                $product->price = (float)$product->original_price;
            }
            $product->original_price = null;
            $product->discount_percent = 0;
            $product->discount_type = null;
            $product->discount_value = 0;
            $product->save();
            $updatedCount++;

            try {
                $this->loyverse->pushSingleProductToLoyverse($product);
            } catch (\Throwable $e) {
                // non-blocking
            }
        }

        Cache::forget('products_catalog_default');

        $user = $request->user();
        $userName = $user?->name ?? 'Staff';
        $userRole = $user?->role ?? 'staff';

        $scopeLabel = $validated['scope'] === 'all'
            ? 'all products'
            : ($validated['scope'] === 'category' ? "all {$validated['category']}" : 'selected product');

        AuditLog::create([
            'user_name' => $userName,
            'user_role' => $userRole,
            'action' => 'Menu Discount Removed',
            'details' => "Removed discounts from {$scopeLabel} ({$updatedCount} items restored to base prices)",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Discounts successfully removed from {$scopeLabel} ({$updatedCount} items restored).",
            'updated_count' => $updatedCount,
            'products' => Product::with('recipes.ingredient')->orderBy('name', 'asc')->get()
        ]);
    }
}
