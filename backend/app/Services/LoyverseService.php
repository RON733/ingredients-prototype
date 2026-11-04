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
        $response = Http::withHeaders($this->headers())->get("{$this->apiUrl}/items", [
            'limit' => $limit
        ]);
        return $response->json('items') ?? [];
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
     * Export all active products from website database into Loyverse POS.
     * This populates the cashier tablet/app with prices and items immediately!
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
                }

                $itemPayload = [
                    'item_name' => $prod->name,
                    'category_id' => $catId,
                    'description' => $prod->description ?? '',
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
                    if ($itemId) {
                        $results['updated']++;
                    } else {
                        $results['created']++;
                    }
                } else {
                    $results['errors'][] = "Failed '{$prod->name}': " . $res->body();
                }
            } catch (\Exception $e) {
                $results['errors'][] = "Error '{$prod->name}': " . $e->getMessage();
            }
        }

        return $results;
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
                'details' => "Loyverse Sale #{$receiptNumber} recorded for ₱{$totalMoney}. Kitchen inventory deducted: " . (empty($deductedSummary) ? 'None (no recipe matches)' : implode(', ', $deductedSummary)),
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
     * Push a completed website order to Loyverse POS so it immediately updates
     * the Sales Summary and revenue reports in the Loyverse Back Office.
     */
    public function pushOrderToLoyverse(Order $order): ?array
    {
        // 1. Skip if order already came from Loyverse POS or already pushed
        if ($order->source === 'loyverse_pos' || !empty($order->loyverse_receipt_id)) {
            return null;
        }

        // Only push real completed / paid sales to Loyverse POS
        // Prevents cancelled or abandoned cart / pending orders from polluting Loyverse revenue!
        if ($order->status !== 'Completed' && !in_array($order->payment_status, ['Paid', 'Verified'])) {
            Log::info("Skipping Loyverse push for non-completed order #{$order->order_number} (Status: {$order->status}, Payment: {$order->payment_status})");
            return null;
        }

        $storeId = $this->getEffectiveStoreId();

        // 2. Map line items to Loyverse variant IDs
        $loyverseItems = $this->getItems();
        $variantMap = []; // sku or name => variant_id
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

        // If no matching variant found in Loyverse (e.g. newly added item), use first available variant
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

        // 3. Select payment type ID: Cash or Card
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
                'details' => "Website order {$order->order_number} synchronized to Loyverse POS as Receipt #{$receiptNumber} for ₱{$order->total_amount}.",
                'ip_address' => request()->ip() ?? '127.0.0.1',
            ]);
        }

        return $receiptData;
    }

    /**
     * Push all unpushed completed website orders to Loyverse POS in bulk.
     */
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

    /**
     * Poll recent receipts and synchronize them.
     */
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

        // Also push any pending website orders to Loyverse so both sides are in sync
        $pushRes = $this->pushAllPendingWebsiteOrders();
        $results['pushed_to_loyverse'] = $pushRes;

        return $results;
    }

    /**
     * Register Webhook subscription with Loyverse API for instant push events.
     */
    public function registerWebhook(string $webhookUrl): array
    {
        $response = Http::withHeaders($this->headers())->post("{$this->apiUrl}/webhooks", [
            'url' => $webhookUrl,
            'type' => 'receipts.update',
            'status' => 'ENABLED'
        ]);

        if (!$response->successful()) {
            throw new \Exception("Failed to register webhook: " . $response->body());
        }

        return $response->json();
    }

    /**
     * List active webhooks registered on this Loyverse account.
     */
    public function getRegisteredWebhooks(): array
    {
        $response = Http::withHeaders($this->headers())->get("{$this->apiUrl}/webhooks");
        return $response->json('webhooks') ?? [];
    }
}