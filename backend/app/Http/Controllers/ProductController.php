<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\AuditLog;

class ProductController extends Controller
{
    public function index(Request $request)
    {
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

        return response()->json($products);
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
            'recipes' => 'nullable|array', // array of { ingredient_id, qty }
        ]);

        $product = Product::create([
            'id' => $validated['id'],
            'name' => $validated['name'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'description' => $validated['description'] ?? '',
            'emoji' => $validated['emoji'] ?? '🍽️',
            'image' => $validated['image'] ?? '/assets/hero-banner.png',
            'is_available' => $validated['is_available'] ?? true,
        ]);

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
        ]);

        $product->update($validated);

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

        return response()->json($product->load('recipes.ingredient'));
    }

    public function toggleAvailability(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->is_available = !$product->is_available;
        $product->save();

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Staff',
            'user_role' => $request->user()?->role ?? 'staff',
            'action' => 'Menu Availability Toggled',
            'details' => "{$product->name} is now marked " . ($product->is_available ? 'Available' : 'Out of Stock'),
            'ip_address' => $request->ip(),
        ]);

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

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Admin',
            'user_role' => $request->user()?->role ?? 'admin',
            'action' => 'Product Removed',
            'details' => "Removed product {$name} from catalog",
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
