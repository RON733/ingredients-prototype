<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\AuditLog;

class LoyverseService
{
    protected string $token;
    protected string $storeId;
    protected string $apiUrl;

    protected ?array $cachedSuppliers = null;
    protected ?array $cachedCategories = null;
    protected ?array $cachedStores = null;
    protected ?array $cachedItems = null;
    protected ?array $cachedDiscounts = null;

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
    public function getStores(bool $fresh = false): array
    {
        if (!$fresh && $this->cachedStores !== null) {
            return $this->cachedStores;
        }

        $response = Http::withHeaders($this->headers())->get("{$this->apiUrl}/stores");
        if (!$response->successful()) {
            throw new \Exception("Loyverse API Error: " . $response->body());
        }
        $this->cachedStores = $response->json('stores') ?? [];
        return $this->cachedStores;
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
    public function getItems(int $limit = 250, bool $fresh = false): array
    {
        if (!$fresh && $this->cachedItems !== null) {
            return $this->cachedItems;
        }

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

        $this->cachedItems = $allItems;
        return $allItems;
    }

    /**
     * Fetch categories in Loyverse.
     */
    public function getCategories(bool $fresh = false): array
    {
        if (!$fresh && $this->cachedCategories !== null) {
            return $this->cachedCategories;
        }

        $response = Http::withHeaders($this->headers())->get("{$this->apiUrl}/categories");
        $this->cachedCategories = $response->json('categories') ?? [];
        return $this->cachedCategories;
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
            if (strcasecmp(trim($cat['name'] ?? ''), trim($name)) === 0 && empty($cat['deleted_at'])) {
                return $cat['id'];
            }
        }

        $res = Http::withHeaders($this->headers())->post("{$this->apiUrl}/categories", [
            'name' => $name,
            'color' => $color,
        ]);

        $createdId = $res->json('id');
        if ($createdId) {
            if ($this->cachedCategories === null) {
                $this->cachedCategories = [];
            }
            $this->cachedCategories[] = [
                'id' => $createdId,
                'name' => $name,
                'color' => $color,
                'deleted_at' => null,
            ];
        }

        return $createdId;
    }

    /**
     * ==========================================
     * SUPPLIERS (Loyverse Advanced Inventory)
     * ==========================================
     */
    public function getSuppliers(int $limit = 100, bool $fresh = false): array
    {
        if (!$fresh && $this->cachedSuppliers !== null) {
            return $this->cachedSuppliers;
        }

        $response = Http::withHeaders($this->headers())->get("{$this->apiUrl}/suppliers", [
            'limit' => $limit
        ]);
        if (!$response->successful()) {
            throw new \Exception("Loyverse Suppliers Error: " . $response->body());
        }
        $this->cachedSuppliers = $response->json('suppliers') ?? [];
        return $this->cachedSuppliers;
    }

    public function createOrUpdateSupplier(array $data): array
    {
        $response = Http::withHeaders($this->headers())->post("{$this->apiUrl}/suppliers", $data);
        if (!$response->successful()) {
            throw new \Exception("Loyverse Supplier Save Error: " . $response->body());
        }
        $supplier = $response->json();
        if (!empty($supplier['id'])) {
            if ($this->cachedSuppliers === null) {
                $this->cachedSuppliers = [];
            }
            $this->cachedSuppliers[] = $supplier;
        }
        return $supplier;
    }

    public function findOrCreateSupplier(string $name, ?string $contact = null, ?string $phone = null): ?string
    {
        $suppliers = $this->getSuppliers();
        foreach ($suppliers as $s) {
            if (strcasecmp(trim($s['name'] ?? ''), trim($name)) === 0 && empty($s['deleted_at'])) {
                return $s['id'];
            }
        }

        $payload = ['name' => $name];
        if ($contact) $payload['contact'] = $contact;
        if ($phone) $payload['phone_number'] = $phone;

        $created = $this->createOrUpdateSupplier($payload);
        return $created['id'] ?? null;
    }

    public function getDiscounts(bool $fresh = false): array
    {
        if (!$fresh && $this->cachedDiscounts !== null) {
            return $this->cachedDiscounts;
        }

        if (empty($this->token)) {
            return [];
        }

        $res = Http::withHeaders($this->headers())->get("{$this->apiUrl}/discounts");
        if ($res->successful()) {
            $this->cachedDiscounts = $res->json('discounts') ?? [];
            return $this->cachedDiscounts;
        }

        return [];
    }

    public function findOrCreateDiscount(string $name, string $type = 'VARIABLE_AMOUNT', ?float $value = null): ?string
    {
        if (empty($this->token)) {
            return null;
        }

        $cleanName = mb_substr(trim($name), 0, 40);
        if ($cleanName === '') {
            $cleanName = 'Website Promo Discount';
        }

        $discounts = $this->getDiscounts();
        foreach ($discounts as $d) {
            if (!empty($d['deleted_at'])) {
                continue;
            }
            if (($d['type'] ?? '') !== $type) {
                continue;
            }

            if ($type === 'FIXED_PERCENT' && $value !== null) {
                if (abs((float) ($d['discount_percent'] ?? -1) - $value) < 0.01) {
                    return $d['id'] ?? null;
                }
            } elseif ($type === 'FIXED_AMOUNT' && $value !== null) {
                if (abs((float) ($d['discount_amount'] ?? -1) - $value) < 0.01) {
                    return $d['id'] ?? null;
                }
            } elseif (strcasecmp(trim($d['name'] ?? ''), $cleanName) === 0) {
                return $d['id'] ?? null;
            }
        }

        $payload = [
            'name' => $cleanName,
            'type' => $type,
            'restricted_access' => false,
        ];

        $storeId = $this->getEffectiveStoreId();
        if (!empty($storeId)) {
            $payload['stores'] = [$storeId];
        }

        if ($type === 'FIXED_PERCENT' && $value !== null) {
            $payload['discount_percent'] = round($value, 2);
        } elseif ($type === 'FIXED_AMOUNT' && $value !== null) {
            $payload['discount_amount'] = round($value, 2);
        }

        $res = Http::withHeaders($this->headers())->post("{$this->apiUrl}/discounts", $payload);
        if ($res->successful()) {
            $created = $res->json();
            if (is_array($this->cachedDiscounts)) {
                $this->cachedDiscounts[] = $created;
            } else {
                $this->cachedDiscounts = [$created];
            }
            return $created['id'] ?? null;
        }

        Log::warning("Failed to create Loyverse discount '{$cleanName}': " . $res->body());
        return null;
    }

    public function syncProductDiscountToLoyverse(Product $product): ?string
    {
        if (empty($this->token)) {
            return null;
        }

        $isDiscounted = $product->original_price !== null
            && (float) $product->original_price > (float) $product->price;

        if (!$isDiscounted) {
            if (!empty($product->loyverse_discount_id)) {
                $product->loyverse_discount_id = null;
                $product->saveQuietly();
            }
            return null;
        }

        if ($product->discount_type === 'fixed' && (float) $product->discount_value > 0) {
            $val = round((float) $product->discount_value, 2);
            $fmt = rtrim(rtrim(number_format($val, 2, '.', ''), '0'), '.');
            $name = "Promo PHP {$fmt} Off";
            $type = 'FIXED_AMOUNT';
        } else {
            $pct = (float) ($product->discount_percent ?: (($product->original_price - $product->price) / $product->original_price * 100));
            $val = round($pct, 2);
            $fmt = rtrim(rtrim(number_format($val, 2, '.', ''), '0'), '.');
            $name = "Promo {$fmt}% Off";
            $type = 'FIXED_PERCENT';
        }

        $discountId = $this->findOrCreateDiscount($name, $type, $val);
        if ($discountId && $product->loyverse_discount_id !== $discountId) {
            $product->loyverse_discount_id = $discountId;
            $product->saveQuietly();
        }

        return $discountId;
    }

    /**
     * ==============================================================
     * MENU PRODUCTS EXPORT
     * ==============================================================
     * Exports all menu items from website catalog to Loyverse POS.
     */
    public function exportMenuToLoyverse(): array
    {
        $storeId = $this->getEffectiveStoreId();

        $products = Product::all();
        $existingItems = collect($this->getItems());

        $categoryMap = [];
        $results = [
            'total' => $products->count(),
            'created' => 0,
            'updated' => 0,
            'errors' => []
        ];

        foreach ($products as $prod) {
            try {
                $catName = $prod->category ?? 'General';
                if (!isset($categoryMap[$catName])) {
                    $categoryMap[$catName] = $this->findOrCreateCategory($catName);
                }
                $catId = $categoryMap[$catName];

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

                $itemPayload = [
                    'item_name' => $prod->name,
                    'category_id' => $catId,
                    'description' => $prod->description ?? '',
                    'is_composite' => false,
                    'use_production' => false,
                    'components' => [],
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
                    $this->syncProductDiscountToLoyverse($prod);

                    if ($itemId) {
                        $results['updated']++;
                    } else {
                        $results['created']++;
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
     * Instantly push a single product created/updated on website to Loyverse POS.
     */
    public function pushSingleProductToLoyverse(Product $product): ?array
    {
        if (empty($this->token)) return null;

        try {
            $storeId = $this->getEffectiveStoreId();

            $catName = $product->category ?: 'General';
            $catId = $this->findOrCreateCategory($catName);

            $components = [];
            $isComposite = false;
            $itemId = $product->loyverse_item_id;
            $variantId = $product->loyverse_variant_id;

            if (!$itemId) {
                $existing = $this->getItems();
                foreach ($existing as $it) {
                    if (strcasecmp(trim($it['item_name']), trim($product->name)) === 0) {
                        $itemId = $it['id'];
                        $variantId = $it['variants'][0]['variant_id'] ?? null;
                        break;
                    }
                    foreach ($it['variants'] ?? [] as $v) {
                        if (($v['sku'] ?? '') === $product->id) {
                            $itemId = $it['id'];
                            $variantId = $v['variant_id'] ?? null;
                            break 2;
                        }
                    }
                }
            }

            $itemPayload = [
                'item_name' => $product->name,
                'category_id' => $catId,
                'description' => $product->description ?? '',
                'is_composite' => $isComposite,
                'use_production' => false,
                'components' => $isComposite ? $components : [],
                'variants' => [
                    [
                        'variant_name' => 'Regular',
                        'sku' => $product->id,
                        'default_pricing_type' => 'FIXED',
                        'default_price' => (float) $product->price,
                        'stores' => [
                            [
                                'store_id' => $storeId,
                                'pricing_type' => 'FIXED',
                                'price' => (float) $product->price,
                                'available_for_sale' => (bool) $product->is_available
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
                $product->loyverse_item_id = $savedItem['id'] ?? $itemId;
                $product->loyverse_variant_id = $savedItem['variants'][0]['variant_id'] ?? $variantId;
                $product->saveQuietly();
                $this->cachedItems = null;
                $this->syncProductDiscountToLoyverse($product);

                Log::info("Loyverse Auto-Push: Product '{" . $product->name . "}' successfully synced to Loyverse POS.");
                return $savedItem;
            } else {
                Log::error("Loyverse Auto-Push error for '{" . $product->name . "}': " . $res->body());
                return null;
            }
        } catch (\Exception $e) {
            Log::error("Loyverse Auto-Push exception for '{" . $product->name . "}': " . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete or archive a product in Loyverse when removed from the website catalog.
     */
    public function deleteProductFromLoyverse(Product $product): bool
    {
        if (empty($this->token) || empty($product->loyverse_item_id)) {
            return false;
        }

        try {
            $res = Http::withHeaders($this->headers())->delete("{$this->apiUrl}/items/{$product->loyverse_item_id}");
            $this->cachedItems = null;
            return $res->successful();
        } catch (\Exception $e) {
            Log::warning("Could not delete product '{" . $product->name . "}' from Loyverse: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Pulls and imports new or updated products from Loyverse into the website catalog.
     * Raw ingredients are automatically excluded.
     */
    public function pullItemsFromLoyverse(bool $forceFresh = false): array
    {
        if (empty($this->token)) {
            return ['created' => [], 'updated' => [], 'created_count' => 0, 'updated_count' => 0, 'skipped_count' => 0];
        }

        $loyverseItems = $this->getItems(250, $forceFresh);
        $categories = collect($this->getCategories($forceFresh))->keyBy('id');

        $rawIngredientItemIds = [];
        $rawIngredientVariantIds = [];
        $rawIngredientNames = [];

        // Identify 'Raw Ingredients' category ID in Loyverse
        $rawCategory = $categories->first(function ($c) {
            return strcasecmp(trim($c['name'] ?? ''), 'Raw Ingredients') === 0;
        });
        $rawCategoryId = $rawCategory['id'] ?? null;

        $created = [];
        $updated = [];
        $skipped = 0;

        foreach ($loyverseItems as $item) {
            // Skip deleted items
            if (!empty($item['deleted_at'])) {
                $skipped++;
                continue;
            }

            // Skip raw ingredients category
            if ($rawCategoryId && ($item['category_id'] ?? null) === $rawCategoryId) {
                $skipped++;
                continue;
            }

            // Skip if this item or variant is tracked as a raw ingredient
            if (in_array($item['id'], $rawIngredientItemIds)) {
                $skipped++;
                continue;
            }

            if (in_array(strtolower(trim($item['item_name'] ?? '')), $rawIngredientNames)) {
                $skipped++;
                continue;
            }

            $primaryVariant = $item['variants'][0] ?? null;
            if ($primaryVariant && in_array($primaryVariant['variant_id'] ?? '', $rawIngredientVariantIds)) {
                $skipped++;
                continue;
            }

            // Determine price
            $price = (float) ($primaryVariant['default_price'] ?? 0);
            if (!empty($primaryVariant['stores'])) {
                $effStoreId = $this->getEffectiveStoreId();
                foreach ($primaryVariant['stores'] as $st) {
                    if (($st['store_id'] ?? '') === $effStoreId && isset($st['price'])) {
                        $price = (float) $st['price'];
                        break;
                    }
                }
            }

            // Determine category
            $catId = $item['category_id'] ?? null;
            $catName = ($catId && isset($categories[$catId])) ? $categories[$catId]['name'] : 'Specialties';

            $sku = $primaryVariant['sku'] ?? null;

            // Match product in website DB
            $product = Product::where('loyverse_item_id', $item['id'])->first();
            if (!$product && !empty($sku)) {
                $product = Product::where('id', $sku)->first();
            }
            if (!$product) {
                $product = Product::whereRaw('LOWER(name) = ?', [strtolower(trim($item['item_name']))])->first();
            }

            if ($product) {
                // Update product details
                $changed = false;
                if ($product->loyverse_item_id !== $item['id']) {
                    $product->loyverse_item_id = $item['id'];
                    $changed = true;
                }
                if ($primaryVariant && $product->loyverse_variant_id !== ($primaryVariant['variant_id'] ?? null)) {
                    $product->loyverse_variant_id = $primaryVariant['variant_id'] ?? null;
                    $changed = true;
                }
                if (strcasecmp(trim($product->name), trim($item['item_name'])) !== 0) {
                    $product->name = trim($item['item_name']);
                    $changed = true;
                }
                if ($price > 0 && abs((float)$product->price - $price) > 0.01) {
                    $product->price = $price;
                    $changed = true;
                }
                if ($changed) {
                    $product->saveQuietly();
                    $updated[] = $product->name;
                }
            } else {
                // Create brand new product!
                $baseId = !empty($sku) ? preg_replace('/[^a-zA-Z0-9_\-]/', '', strtolower($sku)) : '';
                if (empty($baseId)) {
                    $baseId = \Illuminate\Support\Str::slug($item['item_name']);
                }
                if (empty($baseId)) {
                    $baseId = 'prod-' . substr(md5($item['id']), 0, 8);
                }

                $newId = $baseId;
                $c = 1;
                while (Product::where('id', $newId)->exists()) {
                    $newId = "{" . $baseId . "}-{" . $c . "}";
                    $c++;
                }

                $emoji = $this->detectEmoji($item['item_name'], $catName);

                $newProduct = Product::create([
                    'id' => $newId,
                    'name' => trim($item['item_name']),
                    'category' => $catName,
                    'price' => $price,
                    'description' => $item['description'] ?? ("Freshly prepared " . $item['item_name'] . "."),
                    'emoji' => $emoji,
                    'image' => '/assets/hero-banner.png',
                    'is_available' => true,
                    'loyverse_item_id' => $item['id'],
                    'loyverse_variant_id' => $primaryVariant['variant_id'] ?? null,
                ]);

                AuditLog::create([
                    'user_name' => 'Loyverse Auto-Sync',
                    'user_role' => 'system',
                    'action' => 'Product Auto-Imported',
                    'details' => "Auto-imported new menu item '" . $newProduct->name . "' (₱" . $newProduct->price . ") under category '" . $newProduct->category . "' from Loyverse POS.",
                    'ip_address' => request()->ip() ?? '127.0.0.1',
                ]);

                $created[] = $newProduct->name;
            }
        }

        if (!empty($created) || !empty($updated)) {
            Cache::forget('products_catalog_default');
        }

        return [
            'created' => $created,
            'updated' => $updated,
            'created_count' => count($created),
            'updated_count' => count($updated),
            'skipped_count' => $skipped
        ];
    }

    /**
     * Choose an appropriate emoji based on food/drink name and category.
     */
    public function detectEmoji(string $name, string $category = ''): string
    {
        $text = strtolower($name . ' ' . $category);
        if (str_contains($text, 'boba') || str_contains($text, 'milk tea') || str_contains($text, 'milktea')) {
            return '🧋';
        }
        if (str_contains($text, 'coffee') || str_contains($text, 'espresso') || str_contains($text, 'latte') || str_contains($text, 'macchiato') || str_contains($text, 'cappuccino')) {
            return '☕';
        }
        if (str_contains($text, 'matcha') || str_contains($text, 'tea') || str_contains($text, 'green tea')) {
            return '🍵';
        }
        if (str_contains($text, 'pizza')) {
            return '🍕';
        }
        if (str_contains($text, 'burger')) {
            return '🍔';
        }
        if (str_contains($text, 'fries') || str_contains($text, 'potato')) {
            return '🍟';
        }
        if (str_contains($text, 'chicken') || str_contains($text, 'wing')) {
            return '🍗';
        }
        if (str_contains($text, 'rice') || str_contains($text, 'meal') || str_contains($text, 'bowl')) {
            return '🍱';
        }
        if (str_contains($text, 'dessert') || str_contains($text, 'cake') || str_contains($text, 'halo') || str_contains($text, 'sweet')) {
            return '🍧';
        }
        if (str_contains($text, 'shake') || str_contains($text, 'smoothie') || str_contains($text, 'juice')) {
            return '🥤';
        }
        return '🍽️';
    }

    /**
     * ==============================================================
     * FULL SYNCHRONIZATION
     * ==============================================================
     * Synchronizes menu products, webhooks, and recent POS receipts.
     */
    public function fullAdvancedSync(?string $webhookBaseUrl = null): array
    {
        $storeId = $this->getEffectiveStoreId();

        $menuSync = $this->exportMenuToLoyverse();

        $webhookResult = null;
        if ($webhookBaseUrl && str_starts_with(strtolower($webhookBaseUrl), 'https://') && !str_contains($webhookBaseUrl, 'localhost') && !str_contains($webhookBaseUrl, '127.0.0.1')) {
            try {
                $webhookResult = $this->registerAllWebhooks($webhookBaseUrl);
            } catch (\Exception $e) {
                $webhookResult = ['error' => $e->getMessage()];
            }
        } else {
            $webhookResult = [
                'skipped' => true,
                'reason' => 'Webhooks require a public HTTPS URL (localhost/HTTP skipped)'
            ];
        }

        $receiptsSync = null;
        try {
            $receiptsSync = $this->syncRecentReceipts();
        } catch (\Exception $e) {
            $receiptsSync = ['error' => $e->getMessage()];
        }

        return [
            'store_id' => $storeId,
            'menu' => $menuSync,
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
            $orderItemsData = [];
            $allProducts = Product::all();

            foreach ($lineItems as $item) {
                $sku = $item['sku'] ?? '';
                $name = $item['item_name'] ?? '';
                $qty = (float)($item['quantity'] ?? 1);
                $price = (float)($item['price'] ?? 0);
                $grossTotal = (float)($item['gross_total_money'] ?? $item['total_money'] ?? $item['gross_total'] ?? ($price * $qty));

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

            $deductedSummary = [];

            // 3. Payment Method detection
            $payMethod = 'Cash';
            if (!empty($receipt['payments'])) {
                $firstPay = $receipt['payments'][0]['name'] ?? '';
                if (stripos($firstPay, 'card') !== false) {
                    $payMethod = 'Card';
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
                'details' => "Loyverse Sale #{$receiptNumber} recorded for ₱{$totalMoney}.",
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

        // Atomic claim prevents concurrent sync polls / status updates from pushing duplicate receipts
        $claimed = Order::where('id', $order->id)
            ->whereNull('loyverse_receipt_id')
            ->update(['loyverse_receipt_id' => 'SYNCING']);
        if ($claimed === 0) {
            return null;
        }

        $receiptSaved = false;
        try {
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
        $netLinePrices = [];
        $order->loadMissing('items.product');
        $totalDiscountAmount = 0.0;

        foreach ($order->items as $item) {
            $prodIdKey = strtolower(trim($item->product_id));
            $prodNameKey = strtolower(trim($item->product_name));

            $variantId = $variantMap[$prodIdKey] ?? $variantMap[$prodNameKey] ?? null;

            if ($variantId) {
                $qty = (float) $item->quantity;
                $itemDiscountTotal = (float) ($item->discount_amount ?? 0);
                $linePrice = (float) $item->unit_price;

                if ($itemDiscountTotal > 0 && $qty > 0) {
                    $linePrice = (float) ($item->original_unit_price ?: ($item->unit_price + ($itemDiscountTotal / $qty)));
                    $totalDiscountAmount += $itemDiscountTotal;
                } elseif ($item->original_unit_price === null && $item->product && $item->product->original_price !== null && (float) $item->product->original_price > (float) $item->product->price) {
                    $perUnitDisc = round((float) $item->product->original_price - (float) $item->product->price, 2);
                    if ($perUnitDisc > 0) {
                        $linePrice = (float) $item->unit_price + $perUnitDisc;
                        $totalDiscountAmount += round($perUnitDisc * $qty, 2);
                    }
                }

                $lineItemsPayload[] = [
                    'variant_id' => $variantId,
                    'quantity' => $qty,
                    'price' => round($linePrice, 2),
                ];
                $netLinePrices[] = round((float) $item->unit_price, 2);
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

        $totalDiscountAmount = round($totalDiscountAmount, 2);
        if ($totalDiscountAmount > 0) {
            $discountId = $this->findOrCreateDiscount('Website Promo Discount', 'VARIABLE_AMOUNT');
            if ($discountId) {
                $receiptPayload['total_discounts'] = [
                    [
                        'id' => $discountId,
                        'scope' => 'RECEIPT',
                        'money_amount' => $totalDiscountAmount,
                    ]
                ];
            } else {
                // Fallback if Loyverse discount creation failed: keep net unit_price so totals still match
                foreach ($receiptPayload['line_items'] as $idx => $li) {
                    if (isset($netLinePrices[$idx])) {
                        $receiptPayload['line_items'][$idx]['price'] = $netLinePrices[$idx];
                    }
                }
            }
        }

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
            $receiptSaved = true;

            AuditLog::create([
                'user_name' => 'Website POS Sync',
                'user_role' => 'system',
                'action' => 'Pushed to Loyverse POS',
                'details' => "Website order {$order->order_number} synchronized to Loyverse POS as Receipt #{$receiptNumber} for ₱{$order->total_amount}.",
                'ip_address' => request()->ip() ?? '127.0.0.1',
            ]);


        }

        return $receiptData;
        } finally {
            if (!$receiptSaved) {
                Order::where('id', $order->id)
                    ->where('loyverse_receipt_id', 'SYNCING')
                    ->update(['loyverse_receipt_id' => null]);
            }
        }
    }

    public function pushAllPendingWebsiteOrders(): array
    {
        // Only sync recent live website orders; never backfill thousands of seeded #GS-* analytics orders
        $orders = Order::where('source', 'web')
            ->whereNull('loyverse_receipt_id')
            ->where('order_number', 'not like', '#GS-%')
            ->where('created_at', '>=', now()->subHours(24))
            ->where('status', 'Completed')
            ->whereIn('payment_status', ['Paid', 'Verified'])
            ->orderByDesc('id')
            ->limit(15)
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
        $lock = Cache::lock('loyverse_sync_recent_receipts', 25);
        if (!$lock->get()) {
            return [
                'total_found' => 0,
                'synced' => 0,
                'already_synced' => 0,
                'skipped' => 0,
                'details' => [],
                'locked' => true,
            ];
        }

        try {
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
        } finally {
            $lock->release();
        }
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
        $types = ['receipts.update', 'inventory_levels.update', 'items.update'];

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

        // 0. Items Update Webhook (Real-time Loyverse item added / modified)
        if ($type === 'items.update' || isset($payload['items'])) {
            $pullRes = $this->pullItemsFromLoyverse(true);
            return [
                'type' => 'items.update',
                'status' => 'processed',
                'results' => $pullRes
            ];
        }

        // 1. Inventory Level Update Webhook (kitchen inventory tracking removed)
        if ($type === 'inventory_levels.update' || isset($payload['inventory_levels'])) {
            return [
                'type' => 'inventory_levels.update',
                'status' => 'ignored_inventory_disabled',
                'updated_count' => 0,
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

