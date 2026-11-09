<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Services\LoyverseService;
use App\Models\Order;
use App\Models\Ingredient;
use App\Models\Product;

class LoyverseController extends Controller
{
    protected LoyverseService $loyverse;

    public function __construct(LoyverseService $loyverse)
    {
        $this->loyverse = $loyverse;
    }

    /**
     * Get integration status & connection info.
     */
    public function status(Request $request)
    {
        try {
            if (!$request->boolean('fresh')) {
                $cached = Cache::get('loyverse_status_overview');
                if ($cached) {
                    return response()->json($cached);
                }
            }

            $stores = $this->loyverse->getStores();
            $items = $this->loyverse->getItems(10);
            $webhooks = $this->loyverse->getRegisteredWebhooks();

            $lastOrder = Order::where('source', 'loyverse_pos')->latest('created_at')->first();
            $webhookUrl = url('/api/loyverse/webhook');

            $ingredientsCount = Ingredient::count();
            $productsCount = Product::count();
            $trackedIngredients = Ingredient::whereNotNull('loyverse_variant_id')->count();

            $suppliers = [];
            try {
                $suppliers = $this->loyverse->getSuppliers(50);
            } catch (\Exception $e) {
                // Ignore if suppliers error
            }

            $data = [
                'success' => true,
                'connected' => true,
                'stores' => $stores,
                'active_store' => !empty($stores) ? $stores[0] : null,
                'items_count' => count($items),
                'ingredients_count' => $ingredientsCount,
                'products_count' => $productsCount,
                'tracked_ingredients' => $trackedIngredients,
                'suppliers_count' => count($suppliers),
                'suppliers' => $suppliers,
                'registered_webhooks' => $webhooks,
                'webhook_url' => $webhookUrl,
                'last_order' => $lastOrder ? [
                    'order_number' => $lastOrder->order_number,
                    'receipt_id' => $lastOrder->loyverse_receipt_id,
                    'total' => $lastOrder->total_amount,
                    'created_at' => $lastOrder->created_at?->toIso8601String(),
                ] : null,
            ];

            Cache::put('loyverse_status_overview', $data, 25);
            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'connected' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Manually sync recent receipts from Loyverse.
     */
    public function sync(Request $request)
    {
        set_time_limit(300);
        ini_set('max_execution_time', '300');
        try {
            $since = $request->input('since');
            $results = $this->loyverse->syncRecentReceipts($since);

            return response()->json([
                'success' => true,
                'message' => "Synced {$results['synced']} new receipt(s) from Loyverse POS.",
                'results' => $results
            ]);
        } catch (\Exception $e) {
            Log::error("Loyverse manual sync error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Pull menu items from Loyverse into website catalog.
     */
    public function pullItems(Request $request)
    {
        set_time_limit(300);
        ini_set('max_execution_time', '300');
        try {
            $forceFresh = $request->boolean('fresh', true);
            $results = $this->loyverse->pullItemsFromLoyverse($forceFresh);

            return response()->json([
                'success' => true,
                'message' => "Imported {$results['created_count']} new item(s) and updated {$results['updated_count']} item(s) from Loyverse POS.",
                'results' => $results
            ]);
        } catch (\Exception $e) {
            Log::error("Loyverse pull items error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export raw ingredients to Loyverse with track_stock = true.
     */
    public function exportIngredients(Request $request)
    {
        set_time_limit(300);
        ini_set('max_execution_time', '300');
        try {
            $results = $this->loyverse->exportIngredientsToLoyverse();

            return response()->json([
                'success' => true,
                'message' => "Exported {$results['created']} ingredients, updated {$results['updated']}, synced {$results['stocks_updated']} stock levels to Loyverse.",
                'results' => $results
            ]);
        } catch (\Exception $e) {
            Log::error("Loyverse ingredient export error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export all products from website menu to Loyverse POS with Composite Recipes.
     */
    public function exportMenu(Request $request)
    {
        set_time_limit(300);
        ini_set('max_execution_time', '300');
        try {
            $results = $this->loyverse->exportMenuToLoyverse();

            return response()->json([
                'success' => true,
                'message' => "Exported {$results['created']} items, updated {$results['updated']} items, linked {$results['composite_recipes_linked']} composite recipes to Loyverse POS.",
                'results' => $results
            ]);
        } catch (\Exception $e) {
            Log::error("Loyverse export error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Pull inventory levels from Loyverse into website ingredients stock.
     */
    public function pullInventory(Request $request)
    {
        set_time_limit(300);
        ini_set('max_execution_time', '300');
        try {
            $results = $this->loyverse->pullInventoryFromLoyverse();

            return response()->json([
                'success' => true,
                'message' => "Pulled inventory from Loyverse: updated {$results['updated_count']} ingredient stock levels.",
                'results' => $results
            ]);
        } catch (\Exception $e) {
            Log::error("Loyverse pull inventory error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Push current website ingredient stock levels to Loyverse.
     */
    public function pushInventory(Request $request)
    {
        set_time_limit(300);
        ini_set('max_execution_time', '300');
        try {
            $ids = $request->input('ingredient_ids');
            $results = $this->loyverse->pushInventoryToLoyverse($ids);

            return response()->json([
                'success' => true,
                'message' => "Pushed {$results['pushed_count']} ingredient stock levels to Loyverse.",
                'results' => $results
            ]);
        } catch (\Exception $e) {
            Log::error("Loyverse push inventory error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Master Full Advanced Inventory Sync.
     */
    public function fullSync(Request $request)
    {
        set_time_limit(300);
        ini_set('max_execution_time', '300');
        try {
            $webhookUrl = $request->input('webhook_url', url('/api/loyverse/webhook'));
            $results = $this->loyverse->fullAdvancedSync($webhookUrl);

            return response()->json([
                'success' => true,
                'message' => "Full Advanced Inventory synchronized successfully with Loyverse!",
                'results' => $results
            ]);
        } catch (\Exception $e) {
            Log::error("Loyverse full sync error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * List suppliers from Loyverse.
     */
    public function suppliers(Request $request)
    {
        try {
            $suppliers = $this->loyverse->getSuppliers();
            return response()->json([
                'success' => true,
                'suppliers' => $suppliers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create or update a supplier in Loyverse.
     */
    public function saveSupplier(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string',
                'contact' => 'nullable|string',
                'phone_number' => 'nullable|string',
                'email' => 'nullable|email',
                'note' => 'nullable|string'
            ]);

            $res = $this->loyverse->createOrUpdateSupplier($validated);

            return response()->json([
                'success' => true,
                'message' => "Supplier saved in Loyverse successfully.",
                'supplier' => $res
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Webhook receiver for Loyverse events (receipts.update, inventory_levels.update, items.update).
     */
    public function webhook(Request $request)
    {
        Log::info('Loyverse webhook payload received', [
            'headers' => $request->headers->all(),
            'body' => $request->all()
        ]);

        try {
            $result = $this->loyverse->processWebhookPayload($request->all());

            return response()->json([
                'status' => 'ok',
                'processed' => $result
            ], 200);
        } catch (\Exception $e) {
            Log::error("Loyverse webhook processing error: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 200); // Return 200 so Loyverse does not spam retries on edge errors
        }
    }

    /**
     * Register webhook endpoints with Loyverse.
     */
    public function registerWebhook(Request $request)
    {
        try {
            $webhookUrl = $request->input('url', url('/api/loyverse/webhook'));
            $res = $this->loyverse->registerAllWebhooks($webhookUrl);

            return response()->json([
                'success' => true,
                'message' => "Webhooks registered successfully for {$webhookUrl}",
                'response' => $res
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
