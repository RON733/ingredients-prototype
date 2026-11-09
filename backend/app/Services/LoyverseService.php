<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Ingredient;
use App\Models\AuditLog;

class LoyverseService
{
    protected string $token;
    protected string $storeId;
    protected string $apiUrl;

    public function __construct()
    {
        $this->token = (string) config('services.loyverse.token', env('LOYVERSE_API_TOKEN', ''));
        $this->storeId = (string) config('services.loyverse.store_id', env('LOYVERSE_STORE_ID', ''));
        $this->apiUrl = rtrim((string) config('services.loyverse.api_url', 'https://api.loyverse.com/v1.0'), '/');
    }

    protected function headers(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->token,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];
    }

    /**
     * Test connection and retrieve store information.
     */
    public function getStores(): array
    {
        $response = Http::withHeaders($this->headers())->get("{$this->apiUrl}/stores");
        if (!$response->successful()) {
            throw new \Exception("Loyverse API Error: " . $response->body());
        }
        return $response->json('stores') ?? [];
    }

    /**
     * Get store ID, falling back to first store if not explicitly set.
     */
    public function getEffectiveStoreId(): string
    {
        if (!empty($this->storeId)) {
            return $this->storeId;
        }

        $stores = $this->getStores();
        if (!empty($stores) && isset($stores[0]['id'])) {
            $this->storeId = $stores[0]['id'];
            return $this->storeId;
        }

        throw new \Exception("No active store found in Loyverse account.");
    }

    /**
     * Fetch list of items currently in Loyverse.
     */
    public function getItems(int $limit = 250): array
    {
        $allItems = [];
        $cursor = null;

        do {
            $params = ['limit' => $limit];
            if ($cursor) {
                $params['cursor'] = $cursor;
            }

            $response = Http::withHeaders($this->headers())->get("{$this->apiUrl}/items", $params);
            if (!$response->successful()) {
                throw new \Exception("Loyverse Items Error: " . $response->body());
            }

            $data = $response->json();
            $items = $data['items'] ?? [];
            $allItems = array_merge($allItems, $items);
            $cursor = $data['cursor'] ?? null;
        } while ($cursor && count($items) === $limit && count($allItems) < 1000);

        return $allItems;
    }

    /**
     * Fetch categories in Loyverse.
     */
    public function getCategories(): array
    {
        $response = Http::withHeaders($this->headers())->get("{$this->apiUrl}/categories");
        return $response->json('categories') ?? [];
    }

    /**
     * Create or retrieve Loyverse category by name.
     */
    public function findOrCreateCategory(string $name, string $color = 'ORANGE'): ?string
    {
        $validColors = ['GREY', 'RED', 'PINK', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE'];
        $color = in_array(strtoupper($color), $validColors) ? strtoupper($color) : 'ORANGE';

        $existing = $this->getCategories();
        foreach ($existing as $cat) {
            if (strcasecmp(trim($cat['name']), trim($name)) === 0 && empty($cat['deleted_at'])) {
                return $cat['id'];
            }
        }

        $res = Http::withHeaders($this->headers())->post("{$this->apiUrl}/categories", [
            'name' => $name,
            'color' => $color,
        ]);

        return $res->json('id');
    }

    /**
     * ==========================================
     * SUPPLIERS (Loyverse Advanced Inventory)
     * ==========================================
     */
    public function getSuppliers(int $limit = 100): array
    {
        $response = Http::withHeaders($this->headers())->get("{$this->apiUrl}/suppliers", [
            'limit' => $limit
        ]);
        if (!$response->successful()) {
            throw new \Exception("Loyverse Suppliers Error: " . $response->body());
        }
        return $response->json('suppliers') ?? [];
    }

    public function createOrUpdateSupplier(array $data): array
    {
        $response = Http::withHeaders($this->headers())->post("{$this->apiUrl}/suppliers", $data);
        if (!$response->successful()) {
            throw new \Exception("Loyverse Supplier Save Error: " . $response->body());
        }
        return $response->json();
    }

    public function findOrCreateSupplier(string $name, ?string $contact = null, ?string $phone = null): ?string
    {
        $suppliers = $this->getSuppliers();
        foreach ($suppliers as $s) {
            if (strcasecmp(trim($s['name']), trim($name)) === 0 && empty($s['deleted_at'])) {
                return $s['id'];
            }
        }

        $payload = ['name' => $name];
        if ($contact) $payload['contact'] = $contact;
        if ($phone) $payload['phone_number'] = $phone;

        $created = $this->createOrUpdateSupplier($payload);
        return $created['id'] ?? null;
    }

    /**
     * ==============================================================
     * RAW INGREDIENTS EXPORT (Loyverse Advanced Inventory Components)
     * ==============================================================
     * Exports all kitchen raw ingredients to Loyverse with track_stock = true
     * so they are immediately available for:
     * - Purchase Orders
     * - Stock Adjustments
     * - Inventory Counts
     * - Productions
     * - Inventory Valuation & History
     */
    public function exportIngredientsToLoyverse(): array
    {
        $storeId = $this->getEffectiveStoreId();
        $ingredients = Ingredient::all();
        $existingItems = collect($this->getItems());
        $catId = $this->findOrCreateCategory('Raw Ingredients', 'GREY');

        $results = [
            'total' => $ingredients->count(),
            'created' => 0,
            'updated' => 0,
            'stocks_updated' => 0,
            'errors' => []
        ];

        $stockLevelsToPush = [];

        foreach ($ingredients as $ing) {
            try {
                // Find existing item by SKU or name
                $matchedItem = $existingItems->first(function ($it) use ($ing) {
                    if (strcasecmp(trim($it['item_name']), trim($ing->name)) === 0) return true;
                    if (!empty($it['variants'])) {
                        foreach ($it['variants'] as $v) {
                            if (($v['sku'] ?? '') === $ing->id) return true;
                        }
                    }
                    return false;
                });

                $itemId = $matchedItem['id'] ?? $ing->loyverse_item_id;
                $variantId = null;
                if ($matchedItem && !empty($matchedItem['variants'])) {
                    $variantId = $matchedItem['variants'][0]['variant_id'];
                }

                $cost = (float) ($ing->cost ?? 0.0);
                $lowStock = (float) ($ing->low_threshold ?? 5.0);
                $optimalStock = $lowStock * 3.0;

                $supplierId = null;
                if (!empty($ing->supplier_name)) {
                    $supplierId = $this->findOrCreateSupplier($ing->supplier_name);
                }

                $descParts = ["Kitchen Raw Ingredient ({$ing->unit})"];
                if (!empty($ing->supplier_name)) {
                    $descParts[] = "Supplier: {$ing->supplier_name}";
                }
                if (!empty($ing->expiration_date)) {
                    $expStr = is_string($ing->expiration_date) ? $ing->expiration_date : (is_object($ing->expiration_date) ? $ing->expiration_date->format('Y-m-d') : (string)$ing->expiration_date);
                    $descParts[] = "Exp: {$expStr}";
                }
                $descParts[] = "Category: {$ing->category}";

                $itemPayload = [
                    'item_name' => $ing->name,
                    'category_id' => $catId,
                    'description' => implode(' | ', $descParts),
                    'track_stock' => true,
                    'primary_supplier_id' => $supplierId,
                    'variants' => [
                        [
                            'variant_name' => $ing->unit ?: 'Regular',
                            'sku' => $ing->id,
                            'cost' => $cost > 0 ? $cost : 0.00,
                            'default_pricing_type' => 'FIXED',
                            'default_price' => 0.00,
                            'stores' => [
                                [
                                    'store_id' => $storeId,
                                    'pricing_type' => 'FIXED',
                                    'price' => 0.00,
                                    'available_for_sale' => false, // Hidden from cashier checkout, active in Back Office Inventory
                                    'low_stock' => $lowStock,
                                    'optimal_stock' => $optimalStock,
                                ]
                            ]
                        ]
                    ]
                ];

                if ($itemId) {
                    $itemPayload['id'] = $itemId;
                    if ($variantId) {
                        $itemPayload['variants'][0]['variant_id'] = $variantId;
                    }
                }

                $res = Http::withHeaders($this->headers())->post("{$this->apiUrl}/items", $itemPayload);

                if ($res->successful()) {
                    $savedItem = $res->json();
                    $savedItemId = $savedItem['id'] ?? $itemId;
                    $savedVariantId = $savedItem['variants'][0]['variant_id'] ?? $variantId;

                    // Update model with IDs
                    $ing->loyverse_item_id = $savedItemId;
                    $ing->loyverse_variant_id = $savedVariantId;
                    $ing->saveQuietly();

                    if ($itemId) {
                        $results['updated']++;
                    } else {
                        $results['created']++;
                    }

                    if ($savedVariantId) {
                        $stockLevelsToPush[] = [
                            'variant_id' => $savedVariantId,
                            'store_id' => $storeId,
                            'stock_after' => (float) $ing->stock
                        ];
                    }
                } else {
                    $results['errors'][] = "Failed ingredient '{$ing->name}': " . $res->body();
                }
            } catch (\Exception $e) {
                $results['errors'][] = "Error ingredient '{$ing->name}': " . $e->getMessage();
            }
        }

        // Batch update inventory levels for all raw ingredients
        if (!empty($stockLevelsToPush)) {
            try {
                $invRes = Http::withHeaders($this->headers())->post("{$this->apiUrl}/inventory", [
                    'inventory_levels' => $stockLevelsToPush
                ]);
                if ($invRes->successful()) {
                    $results['stocks_updated'] = count($stockLevelsToPush);
                } else {
                    $results['errors'][] = "Inventory level batch sync error: " . $invRes->body();
                }
            } catch (\Exception $e) {
                $results['errors'][] = "Inventory level push error: " . $e->getMessage();
            }
        }

        return $results;
    }

    /**
     * ==============================================================
     * MENU PRODUCTS & COMPOSITE RECIPES EXPORT
     * ==============================================================
     * Exports all menu items as Composite Items linking their exact
     * component raw ingredients with quantities.
     */
    public function exportMenuToLoyverse(): array
    {
        $storeId = $this->getEffectiveStoreId();

        // 1. First ensure all raw ingredients are synced to have their Loyverse variant IDs
        $ingResults = $this->exportIngredientsToLoyverse();

        $products = Product::with('recipes.ingredient')->get();
        $existingItems = collect($this->getItems());
        $allIngredients = Ingredient::all()->keyBy('id');

        $categoryMap = [];
        $results = [
            'total' => $products->count(),
            'created' => 0,
            'updated' => 0,
            'composite_recipes_linked' => 0,
            'ingredients_synced' => $ingResults,
            'errors' => []
        ];

        foreach ($products as $prod) {
            try {
                // Determine category
                $catName = $prod->category ?? 'General';
                if (!isset($categoryMap[$catName])) {
                    $categoryMap[$catName] = $this->findOrCreateCategory($catName);
                }
                $catId = $categoryMap[$catName];

                // Check if item already exists by SKU or name
                $matchedItem = $existingItems->first(function ($it) use ($prod) {
                    if (strcasecmp(trim($it['item_name']), trim($prod->name)) === 0) return true;
                    if (!empty($it['variants'])) {
                        foreach ($it['variants'] as $v) {
                            if (($v['sku'] ?? '') === $prod->id) return true;
                        }
                    }
                    return false;
                });

                $variantId = null;
                $itemId = null;

                if ($matchedItem) {
                    $itemId = $matchedItem['id'];
                    if (!empty($matchedItem['variants'])) {
                        $variantId = $matchedItem['variants'][0]['variant_id'] ?? null;
                    }
                } elseif (!empty($prod->loyverse_item_id)) {
                    $itemId = $prod->loyverse_item_id;
                    $variantId = $prod->loyverse_variant_id;
                }

                // Build components list from recipes
                $components = [];
                foreach ($prod->recipes as $recipe) {
                    $ing = $allIngredients->get($recipe->ingredient_id);
                    if ($ing && !empty($ing->loyverse_variant_id)) {
                        $components[] = [
                            'variant_id' => $ing->loyverse_variant_id,
                            'quantity' => (float) $recipe->qty
                        ];
                    }
                }

                $isComposite = count($components) > 0;

                $itemPayload = [
                    'item_name' => $prod->name,
                    'category_id' => $catId,
                    'description' => $prod->description ?? '',
                    'is_composite' => $isComposite,
                    'use_production' => false,
                    'components' => $isComposite ? $components : [],
                    'variants' => [
                        [
                            'variant_name' => 'Regular',
                            'sku' => $prod->id,
                            'default_pricing_type' => 'FIXED',
                            'default_price' => (float) $prod->price,
                            'stores' => [
                                [
                                    'store_id' => $storeId,
                                    'pricing_type' => 'FIXED',
                                    'price' => (float) $prod->price,
                                    'available_for_sale' => (bool) $prod->is_available
                                ]
                            ]
                        ]
                    ]
                ];

                if ($itemId) {
                    $itemPayload['id'] = $itemId;
                    if ($variantId) {
                        $itemPayload['variants'][0]['variant_id'] = $variantId;
                    }
                }

                $res = Http::withHeaders($this->headers())->post("{$this->apiUrl}/items", $itemPayload);

                if ($res->successful()) {
                    $savedItem = $res->json();
                    $prod->loyverse_item_id = $savedItem['id'] ?? $itemId;
                    $prod->loyverse_variant_id = $savedItem['variants'][0]['variant_id'] ?? $variantId;
                    $prod->saveQuietly();

                    if ($itemId) {
                        $results['updated']++;
                    } else {
                        $results['created']++;
                    }
                    if ($isComposite) {
                        $results['composite_recipes_linked']++;
                    }
                } else {
                    $results['errors'][] = "Failed product '{$prod->name}': " . $res->body();
                }
            } catch (\Exception $e) {
                $results['errors'][] = "Error product '{$prod->name}': " . $e->getMessage();
            }
        }

        return $results;
    }

    /**
     * ==============================================================
     * INVENTORY LEVELS: PULL FROM LOYVERSE (Loyverse -> Website)
     * ==============================================================
     * Pulls stock levels from Loyverse (which might have changed due to
     * Purchase Orders received, Stock Adjustments, or Inventory Counts)
     * and updates the local website ingredients stock!
     */
    public function pullInventoryFromLoyverse(): array
    {
        $response = Http::withHeaders($this->headers())->get("{$this->apiUrl}/inventory");
        if (!$response->successful()) {
            throw new \Exception("Loyverse Inventory Fetch Error: " . $response->body());
        }

        $levels = $response->json('inventory_levels') ?? [];
        $ingredients = Ingredient::all();

        // Map variant_id to ingredient
        $varToIng = [];
        foreach ($ingredients as $ing) {
            if (!empty($ing->loyverse_variant_id)) {
                $varToIng[$ing->loyverse_variant_id] = $ing;
            }
        }

        // If some ingredients don't have loyverse_variant_id, match via items list
        if (count($varToIng) < $ingredients->count()) {
            $loyverseItems = $this->getItems();
            foreach ($loyverseItems as $it) {
                if (!empty($it['variants'])) {
                    foreach ($it['variants'] as $v) {
                        $sku = $v['sku'] ?? '';
                        $varId = $v['variant_id'] ?? '';
                        $matched = $ingredients->firstWhere('id', $sku) ?? $ingredients->first(function ($i) use ($it) {
                            return strcasecmp(trim($i->name), trim($it['item_name'])) === 0;
                        });
                        if ($matched && $varId) {
                            $matched->loyverse_variant_id = $varId;
                            $matched->loyverse_item_id = $it['id'];
                            $matched->saveQuietly();
                            $varToIng[$varId] = $matched;
                        }
                    }
                }
            }
        }

        $updated = [];
        $changes = [];

        foreach ($levels as $lvl) {
            $varId = $lvl['variant_id'] ?? null;
            if (!$varId || !isset($varToIng[$varId])) {
                continue;
            }

            $ing = $varToIng[$varId];
            $newStock = (float) ($lvl['in_stock'] ?? 0);
            $oldStock = (float) $ing->stock;

            if (abs($newStock - $oldStock) > 0.001) {
                $ing->stock = $newStock;
                $ing->saveQuietly();

                $updated[] = [
                    'id' => $ing->id,
                    'name' => $ing->name,
                    'old_stock' => $oldStock,
                    'new_stock' => $newStock,
                    'unit' => $ing->unit
                ];

                $diff = $newStock - $oldStock;
                $diffText = ($diff > 0 ? "+{$diff}" : "{$diff}") . " {$ing->unit}";
                $changes[] = "{$ing->name}: {$oldStock} -> {$newStock} {$ing->unit} ({$diffText})";
            }
        }

        if (!empty($changes)) {
            Cache::forget('ingredients_all');
            Cache::forget('products_catalog_default');

            AuditLog::create([
                'user_name' => 'Loyverse Inventory Sync',
                'user_role' => 'system',
                'action' => 'Stock Levels Synced from Loyverse',
                'details' => "Updated " . count($changes) . " ingredient(s) from Loyverse Inventory: " . implode('; ', $changes),
                'ip_address' => request()->ip() ?? '127.0.0.1',
            ]);
        }

        return [
            'total_levels_received' => count($levels),
            'updated_count' => count($updated),
            'updated_ingredients' => $updated
        ];
    }

    /**
     * ==============================================================
     * INVENTORY LEVELS: PUSH TO LOYVERSE (Website -> Loyverse)
     * ==============================================================
     * Pushes current website ingredient stock levels to Loyverse.
     */
    public function pushInventoryToLoyverse(?array $ingredientIds = null): array
    {
        $storeId = $this->getEffectiveStoreId();
        $query = Ingredient::query();
        if ($ingredientIds) {
            $query->whereIn('id', $ingredientIds);
        }
        $ingredients = $query->get();

        $levels = [];
        foreach ($ingredients as $ing) {
            if (!empty($ing->loyverse_variant_id)) {
                $levels[] = [
                    'variant_id' => $ing->loyverse_variant_id,
                    'store_id' => $storeId,
                    'stock_after' => (float) $ing->stock
                ];
            }
        }

        if (empty($levels)) {
            // Need to export ingredients first so variant IDs exist
            $this->exportIngredientsToLoyverse();
            return $this->pushInventoryToLoyverse($ingredientIds);
        }

        $res = Http::withHeaders($this->headers())->post("{$this->apiUrl}/inventory", [
            'inventory_levels' => $levels
        ]);

        if (!$res->successful()) {
            throw new \Exception("Failed to push inventory to Loyverse: " . $res->body());
        }

        return [
            'success' => true,
            'pushed_count' => count($levels),
            'response' => $res->json()
        ];
    }

    /**
     * Instantly push a single ingredient's updated stock to Loyverse
     */
    public function pushSingleIngredientStock(Ingredient $ingredient): bool
    {
        if (empty($this->token)) return false;

        try {
            $storeId = $this->getEffectiveStoreId();
            $variantId = $ingredient->loyverse_variant_id;

            if (!$variantId) {
                // Try to find variant in Loyverse
                $items = $this->getItems();
                foreach ($items as $it) {
                    if (strcasecmp(trim($it['item_name']), trim($ingredient->name)) === 0) {
                        $variantId = $it['variants'][0]['variant_id'] ?? null;
                        if ($variantId) {
                            $ingredient->loyverse_item_id = $it['id'];
                            $ingredient->loyverse_variant_id = $variantId;
                            $ingredient->saveQuietly();
                            break;
                        }
                    }
                }
            }

            if (!$variantId) {
                return false;
            }

            $res = Http::withHeaders($this->headers())->post("{$this->apiUrl}/inventory", [
                'inventory_levels' => [
                    [
                        'variant_id' => $variantId,
                        'store_id' => $storeId,
                        'stock_after' => (float) $ingredient->stock
                    ]
                ]
            ]);

            return $res->successful();
        } catch (\Exception $e) {
            Log::warning("Could not sync single ingredient to Loyverse: " . $e->getMessage());
            return false;
        }
    }

    /**
     * ==============================================================
     * FULL ADVANCED INVENTORY SYNCHRONIZATION
     * ==============================================================
     * Master button action that synchronizes everything:
     * 1. Raw Ingredients with stock tracking & cost
     * 2. Stock levels pushed to Loyverse inventory
     * 3. Products and composite recipes with exact components
     * 4. Automatic Webhooks subscription for inventory & receipts
     */
    public function fullAdvancedSync(?string $webhookBaseUrl = null): array
    {
        $storeId = $this->getEffectiveStoreId();

        // 1. Export Ingredients
        $ingredientsSync = $this->exportIngredientsToLoyverse();

        // 2. Export Products with Composite Recipes
        $menuSync = $this->exportMenuToLoyverse();

        // 3. Register Webhooks if URL provided
        $webhookResult = null;
        if ($webhookBaseUrl) {
            try {
                $webhookResult = $this->registerAllWebhooks($webhookBaseUrl);
            } catch (\Exception $e) {
                $webhookResult = ['error' => $e->getMessage()];
            }
        }

        // 4. Also sync any recent receipts
        $receiptsSync = null;
        try {
            $receiptsSync = $this->syncRecentReceipts();
        } catch (\Exception $e) {
            $receiptsSync = ['error' => $e->getMessage()];
        }

        return [
            'store_id' => $storeId,
            'ingredients' => $ingredientsSync,
            'menu_recipes' => $menuSync,
            'webhooks' => $webhookResult,
            'recent_receipts' => $receiptsSync,
            'completed_at' => now()->toIso8601String()
        ];
    }

    /**
     * Fetch recent receipts from Loyverse REST API.
     */
    public function getReceipts(?string $since = null, int $limit = 50): array
    {
        $params = ['limit' => $limit];
        if ($since) {
            $params['since'] = $since;
        }

        $response = Http::withHeaders($this->headers())->get("{$this->apiUrl}/receipts", $params);
        if (!$response->successful()) {
            throw new \Exception("Loyverse Receipts Error: " . $response->body());
        }

        return $response->json('receipts') ?? [];
    }

    /**
     * Process a Loyverse receipt into the website database and deduct kitchen raw ingredients.
     */
    public function processReceipt(array $receipt): array
    {
        $receiptNumber = $receipt['receipt_number'] ?? null;
        if (!$receiptNumber) {
            return ['status' => 'skipped', 'reason' => 'Missing receipt_number'];
        }

        // Loop protection: ignore receipts that originated from our website
        if (!empty($receipt['source']) && stripos($receipt['source'], 'Kitchen Inventory') !== false) {
            return ['status' => 'ignored', 'reason' => 'Receipt originated from website'];
        }

        $receiptType = strtoupper($receipt['receipt_type'] ?? 'SALE');
        if ($receiptType !== 'SALE') {
            return ['status' => 'ignored', 'reason' => "Non-sale receipt type: {$receiptType}"];
        }

        // Avoid duplicate sync
        $orderNumber = 'LV-' . $receiptNumber;
        $existingOrder = Order::where('loyverse_receipt_id', $receiptNumber)
            ->orWhere('order_number', $orderNumber)
            ->first();

        if ($existingOrder) {
            return ['status' => 'already_synced', 'order_id' => $existingOrder->id, 'order_number' => $existingOrder->order_number];
        }

        $lineItems = $receipt['line_items'] ?? [];
        if (empty($lineItems)) {
            return ['status' => 'skipped', 'reason' => 'Empty line items'];
        }

        return DB::transaction(function () use ($receipt, $receiptNumber, $orderNumber, $lineItems) {
            // 1. Match products and calculate ingredient deductions
            $ingredientDeductions = [];
            $orderItemsData = [];
            $allProducts = Product::with('recipes.ingredient')->get();

            foreach ($lineItems as $item) {
                $sku = $item['sku'] ?? '';
                $name = $item['item_name'] ?? '';
                $qty = (float)($item['quantity'] ?? 1);
                $price = (float)($item['price'] ?? 0);
                $grossTotal = (float)($item['gross_total_money'] ?? $item['total_money'] ?? $item['gross_total'] ?? ($price * $qty));

                // Find matching product in DB
                $matchedProduct = null;
                if (!empty($sku)) {
                    $matchedProduct = $allProducts->firstWhere('id', $sku);
                }
                if (!$matchedProduct && !empty($name)) {
                    $matchedProduct = $allProducts->first(function ($p) use ($name) {
                        return strcasecmp(trim($p->name), trim($name)) === 0;
                    });
                }

                if ($matchedProduct) {
                    foreach ($matchedProduct->recipes as $recipe) {
                        $ingId = $recipe->ingredient_id;
                        $needed = (float)$recipe->qty * $qty;
                        $ingredientDeductions[$ingId] = ($ingredientDeductions[$ingId] ?? 0) + $needed;
                    }

                    $orderItemsData[] = [
                        'product_id' => $matchedProduct->id,
                        'product_name' => $matchedProduct->name,
                        'unit_price' => $price > 0 ? $price : $matchedProduct->price,
                        'quantity' => (int) ceil($qty),
                        'subtotal' => $grossTotal,
                        'customization' => [
                            'source' => 'loyverse',
                            'variant_name' => $item['variant_name'] ?? 'Regular',
                            'loyverse_item_id' => $item['item_id'] ?? null
                        ],
                    ];
                } else {
                    $fallbackId = $allProducts->first()?->id ?? 'unknown';
                    $orderItemsData[] = [
                        'product_id' => $fallbackId,
                        'product_name' => $name ?: 'POS Product',
                        'unit_price' => $price,
                        'quantity' => (int) ceil($qty),
                        'subtotal' => $grossTotal,
                        'customization' => [
                            'source' => 'loyverse',
                            'unmatched' => true,
                            'variant_name' => $item['variant_name'] ?? 'Regular'
                        ],
                    ];
                }
            }

            // 2. High-Performance Kitchen Stock Deductions
            $deductedSummary = [];
            if (!empty($ingredientDeductions)) {
                $ingIds = array_keys($ingredientDeductions);
                $ingredients = Ingredient::whereIn('id', $ingIds)->get()->keyBy('id');

                $cases = [];
                $bindings = [];
                foreach ($ingredientDeductions as $ingId => $totalNeeded) {
                    $ingredient = $ingredients->get($ingId);
                    if ($ingredient) {
                        $newStock = max(0, (float)$ingredient->stock - (float)$totalNeeded);
                        $cases[] = "WHEN id = ? THEN ?::numeric";
                        $bindings[] = (string)$ingId;
                        $bindings[] = $newStock;
                        $deductedSummary[] = "{$ingredient->name}: -{$totalNeeded} {$ingredient->unit}";
                    }
                }

                if (!empty($cases)) {
                    $caseSql = implode(' ', $cases);
                    $placeholders = implode(',', array_fill(0, count($ingIds), '?'));
                    $bindings = array_merge($bindings, $ingIds);
                    DB::update("UPDATE ingredients SET stock = CASE {$caseSql} ELSE stock END, updated_at = NOW() WHERE id IN ({$placeholders})", $bindings);
                }

                Cache::forget('ingredients_all');
                Cache::forget('products_catalog_default');
            }

            // 3. Payment Method detection
            $payMethod = 'Cash';
            if (!empty($receipt['payments'])) {
                $firstPay = $receipt['payments'][0]['name'] ?? '';
                if (stripos($firstPay, 'card') !== false) {
                    $payMethod = 'Card';
                } elseif (stripos($firstPay, 'gcash') !== false) {
                    $payMethod = 'GCash';
                }
            }

            $totalMoney = (float)($receipt['total_money'] ?? 0);
            $rawDate = $receipt['receipt_date'] ?? $receipt['created_at'] ?? null;
            $receiptDate = !empty($rawDate) ? date('Y-m-d H:i:s', strtotime($rawDate)) : now();

            // 4. Create Order
            $order = Order::create([
                'order_number' => $orderNumber,
                'source' => 'loyverse_pos',
                'loyverse_receipt_id' => $receiptNumber,
                'customer_name' => 'Walk-in POS Customer',
                'customer_phone' => '09000000000',
                'order_type' => 'Walk-in',
                'delivery_address' => 'In-Store POS (Loyverse)',
                'payment_method' => $payMethod,
                'payment_status' => 'Paid',
                'status' => 'Completed',
                'subtotal' => $totalMoney,
                'delivery_fee' => 0.00,
                'total_amount' => $totalMoney,
                'notes' => "Loyverse POS Receipt #{$receiptNumber} | Created: {$receiptDate}",
                'created_at' => $receiptDate,
                'updated_at' => now(),
            ]);

            $order->items()->createMany($orderItemsData);

            // 5. Audit Log
            AuditLog::create([
                'user_name' => 'Loyverse POS Sync',
                'user_role' => 'system',
                'action' => 'POS Order Synced',
                'details' => "Loyverse Sale #{$receiptNumber} recorded for â‚±{$totalMoney}. Kitchen inventory deducted: " . (empty($deductedSummary) ? 'None (no recipe matches)' : implode(', ', $deductedSummary)),
                'ip_address' => request()->ip() ?? '127.0.0.1',
            ]);

            return [
                'status' => 'success',
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'total' => $totalMoney,
                'deductions' => $deductedSummary
            ];
        });
    }

    /**
     * Push a completed website order to Loyverse POS.
     */
    public function pushOrderToLoyverse(Order $order): ?array
    {
        if ($order->source === 'loyverse_pos' || !empty($order->loyverse_receipt_id)) {
            return null;
        }

        if ($order->status !== 'Completed' && !in_array($order->payment_status, ['Paid', 'Verified'])) {
            Log::info("Skipping Loyverse push for non-completed order #{$order->order_number} (Status: {$order->status}, Payment: {$order->payment_status})");
            return null;
        }

        $storeId = $this->getEffectiveStoreId();

        $loyverseItems = $this->getItems();
        $variantMap = [];
        foreach ($loyverseItems as $it) {
            $nameKey = strtolower(trim($it['item_name']));
            if (!empty($it['variants'])) {
                foreach ($it['variants'] as $v) {
                    if (!empty($v['sku'])) {
                        $variantMap[strtolower(trim($v['sku']))] = $v['variant_id'];
                    }
                    if (!isset($variantMap[$nameKey])) {
                        $variantMap[$nameKey] = $v['variant_id'];
                    }
                }
            }
        }

        $lineItemsPayload = [];
        $order->loadMissing('items');

        foreach ($order->items as $item) {
            $prodIdKey = strtolower(trim($item->product_id));
            $prodNameKey = strtolower(trim($item->product_name));

            $variantId = $variantMap[$prodIdKey] ?? $variantMap[$prodNameKey] ?? null;

            if ($variantId) {
                $lineItemsPayload[] = [
                    'variant_id' => $variantId,
                    'quantity' => (float) $item->quantity,
                    'price' => (float) $item->unit_price,
                ];
            }
        }

        if (empty($lineItemsPayload) && !empty($variantMap)) {
            $firstVariant = reset($variantMap);
            $lineItemsPayload[] = [
                'variant_id' => $firstVariant,
                'quantity' => 1,
                'price' => (float) $order->total_amount,
            ];
        }

        if (empty($lineItemsPayload)) {
            Log::warning("Cannot push order #{$order->order_number} to Loyverse: No matching product variants found.");
            return null;
        }

        $paymentTypeId = (strcasecmp($order->payment_method, 'Cash') === 0)
            ? '13ac5a1f-4d0a-48f8-b162-9004f0f701b7'
            : '7130f409-fcb4-442f-8fc5-0f6da70dce3f';

        $note = "Website Order {$order->order_number} ({$order->order_type}) - {$order->customer_name}";
        if (!empty($order->gcash_ref)) {
            $note .= " | GCash Ref: {$order->gcash_ref}";
        }

        $orderDate = $order->created_at ? $order->created_at->toIso8601String() : now()->toIso8601String();

        $receiptPayload = [
            'store_id' => $storeId,
            'receipt_date' => $orderDate,
            'note' => $note,
            'dining_option' => $order->order_type === 'Delivery' ? 'DELIVERY' : 'TAKEAWAY',
            'line_items' => $lineItemsPayload,
            'payments' => [
                [
                    'payment_type_id' => $paymentTypeId,
                    'money_amount' => (float) $order->total_amount,
                    'paid_at' => $orderDate,
                ]
            ]
        ];

        $response = Http::withHeaders($this->headers())->post("{$this->apiUrl}/receipts", $receiptPayload);

        if (!$response->successful()) {
            Log::error("Failed to push order #{$order->order_number} to Loyverse: " . $response->body());
            return null;
        }

        $receiptData = $response->json();
        $receiptNumber = $receiptData['receipt_number'] ?? null;

        if ($receiptNumber) {
            $order->loyverse_receipt_id = (string) $receiptNumber;
            $order->saveQuietly();

            AuditLog::create([
                'user_name' => 'Website POS Sync',
                'user_role' => 'system',
                'action' => 'Pushed to Loyverse POS',
                'details' => "Website order {$order->order_number} synchronized to Loyverse POS as Receipt #{$receiptNumber} for â‚±{$order->total_amount}.",
                'ip_address' => request()->ip() ?? '127.0.0.1',
            ]);
        }

        return $receiptData;
    }

    public function pushAllPendingWebsiteOrders(): array
    {
        $orders = Order::where('source', 'web')
            ->whereNull('loyverse_receipt_id')
            ->where('status', 'Completed')
            ->whereIn('payment_status', ['Paid', 'Verified'])
            ->get();

        $results = [
            'total' => $orders->count(),
            'pushed' => 0,
            'failed' => 0,
        ];

        foreach ($orders as $order) {
            try {
                $res = $this->pushOrderToLoyverse($order);
                if ($res) {
                    $results['pushed']++;
                } else {
                    $results['failed']++;
                }
            } catch (\Exception $e) {
                Log::error("Error pushing order #{$order->order_number} to Loyverse: " . $e->getMessage());
                $results['failed']++;
            }
        }

        return $results;
    }

    public function syncRecentReceipts(?string $since = null): array
    {
        if (!$since) {
            $lastOrder = Order::where('source', 'loyverse_pos')->latest('created_at')->first();
            if ($lastOrder && $lastOrder->created_at) {
                $since = $lastOrder->created_at->subHours(2)->toIso8601String();
            } else {
                $since = now()->subDays(7)->toIso8601String();
            }
        }

        $receipts = $this->getReceipts($since);
        $results = [
            'total_found' => count($receipts),
            'synced' => 0,
            'already_synced' => 0,
            'skipped' => 0,
            'details' => []
        ];

        foreach ($receipts as $r) {
            $res = $this->processReceipt($r);
            if (($res['status'] ?? '') === 'success') {
                $results['synced']++;
            } elseif (($res['status'] ?? '') === 'already_synced') {
                $results['already_synced']++;
            } else {
                $results['skipped']++;
            }
            $results['details'][] = $res;
        }

        $pushRes = $this->pushAllPendingWebsiteOrders();
        $results['pushed_to_loyverse'] = $pushRes;

        return $results;
    }

    /**
     * ==========================================
     * WEBHOOKS (Receipts & Inventory Levels)
     * ==========================================
     */
    public function registerWebhook(string $webhookUrl, string $type = 'receipts.update'): array
    {
        $response = Http::withHeaders($this->headers())->post("{$this->apiUrl}/webhooks", [
            'url' => $webhookUrl,
            'type' => $type,
            'status' => 'ENABLED'
        ]);

        if (!$response->successful()) {
            throw new \Exception("Failed to register webhook '{$type}': " . $response->body());
        }

        return $response->json();
    }

    public function registerAllWebhooks(string $webhookUrl): array
    {
        $results = [];
        $types = ['receipts.update', 'inventory_levels.update'];

        foreach ($types as $type) {
            try {
                $results[$type] = $this->registerWebhook($webhookUrl, $type);
            } catch (\Exception $e) {
                $results[$type] = ['error' => $e->getMessage()];
            }
        }

        return $results;
    }

    public function getRegisteredWebhooks(): array
    {
        $response = Http::withHeaders($this->headers())->get("{$this->apiUrl}/webhooks");
        return $response->json('webhooks') ?? [];
    }

    /**
     * Centralized Webhook Handler for all incoming Loyverse event types
     */
    public function processWebhookPayload(array $payload): array
    {
        $type = $payload['type'] ?? null;

        // 1. Inventory Level Update Webhook (from Purchase orders, Stock Adjustments, Inventory Counts)
        if ($type === 'inventory_levels.update' || isset($payload['inventory_levels'])) {
            $levels = $payload['inventory_levels'] ?? [];
            $updated = [];

            foreach ($levels as $lvl) {
                $varId = $lvl['variant_id'] ?? null;
                $newStock = (float) ($lvl['in_stock'] ?? 0);

                if (!$varId) continue;

                $ing = Ingredient::where('loyverse_variant_id', $varId)->first();
                if (!$ing) {
                    // Try to match through Loyverse item list
                    $items = $this->getItems();
                    foreach ($items as $it) {
                        foreach ($it['variants'] ?? [] as $v) {
                            if (($v['variant_id'] ?? '') === $varId) {
                                $sku = $v['sku'] ?? '';
                                $ing = Ingredient::where('id', $sku)->first() ?? Ingredient::where('name', $it['item_name'])->first();
                                if ($ing) {
                                    $ing->loyverse_variant_id = $varId;
                                    $ing->loyverse_item_id = $it['id'];
                                    $ing->saveQuietly();
                                    break 2;
                                }
                            }
                        }
                    }
                }

                if ($ing) {
                    $oldStock = (float) $ing->stock;
                    $ing->stock = $newStock;
                    $ing->saveQuietly();

                    $diff = $newStock - $oldStock;
                    $diffFormatted = ($diff > 0 ? "+{$diff}" : "{$diff}") . " {$ing->unit}";

                    AuditLog::create([
                        'user_name' => 'Loyverse Live Webhook',
                        'user_role' => 'system',
                        'action' => 'Live Stock Update',
                        'details' => "Ingredient '{$ing->name}' updated from {$oldStock} to {$newStock} {$ing->unit} ({$diffFormatted}) via Loyverse Inventory event.",
                        'ip_address' => request()->ip() ?? '127.0.0.1',
                    ]);

                    $updated[] = [
                        'ingredient' => $ing->name,
                        'old_stock' => $oldStock,
                        'new_stock' => $newStock,
                    ];
                }
            }

            if (!empty($updated)) {
                Cache::forget('ingredients_all');
                Cache::forget('products_catalog_default');
            }

            return [
                'type' => 'inventory_levels.update',
                'updated_count' => count($updated),
                'updated' => $updated
            ];
        }

        // 2. Receipt Update Webhook (POS Sales)
        $receipts = [];
        if (isset($payload['receipts']) && is_array($payload['receipts'])) {
            $receipts = $payload['receipts'];
        } elseif (isset($payload['receipt_number'])) {
            $receipts = [$payload];
        }

        if (!empty($receipts)) {
            $processed = [];
            foreach ($receipts as $r) {
                try {
                    $processed[] = $this->processReceipt($r);
                } catch (\Exception $e) {
                    $processed[] = ['error' => $e->getMessage()];
                }
            }
            return [
                'type' => 'receipts.update',
                'processed_count' => count($processed),
                'processed' => $processed
            ];
        }

        return [
            'type' => $type ?? 'unknown',
            'status' => 'unhandled_event'
        ];
    }
}

