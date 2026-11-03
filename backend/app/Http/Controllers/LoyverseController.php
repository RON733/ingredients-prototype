<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\LoyverseService;
use App\Models\Order;

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
            $stores = $this->loyverse->getStores();
            $items = $this->loyverse->getItems(10);
            $webhooks = $this->loyverse->getRegisteredWebhooks();

            $lastOrder = Order::where('source', 'loyverse_pos')->latest('created_at')->first();

            $webhookUrl = url('/api/loyverse/webhook');

            return response()->json([
                'success' => true,
                'connected' => true,
                'stores' => $stores,
                'active_store' => !empty($stores) ? $stores[0] : null,
                'items_count' => count($items),
                'registered_webhooks' => $webhooks,
                'webhook_url' => $webhookUrl,
                'last_order' => $lastOrder ? [
                    'order_number' => $lastOrder->order_number,
                    'receipt_id' => $lastOrder->loyverse_receipt_id,
                    'total' => $lastOrder->total_amount,
                    'created_at' => $lastOrder->created_at?->toIso8601String(),
                ] : null,
            ]);
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
     * Export all products from website menu to Loyverse POS.
     */
    public function exportMenu(Request $request)
    {
        try {
            $results = $this->loyverse->exportMenuToLoyverse();

            return response()->json([
                'success' => true,
                'message' => "Exported {$results['created']} items, updated {$results['updated']} items to Loyverse POS.",
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
     * Webhook receiver for Loyverse events (receipts.update).
     */
    public function webhook(Request $request)
    {
        Log::info('Loyverse webhook payload received', [
            'headers' => $request->headers->all(),
            'body' => $request->all()
        ]);

        $payload = $request->all();

        // Receipts can arrive in multiple formats:
        // Format A: { "receipts": [ { ... } ] }
        // Format B: Direct single receipt { "receipt_number": "1-1001", ... }
        $receipts = [];

        if (isset($payload['receipts']) && is_array($payload['receipts'])) {
            $receipts = $payload['receipts'];
        } elseif (isset($payload['receipt_number'])) {
            $receipts = [$payload];
        }

        $processed = [];
        foreach ($receipts as $r) {
            try {
                $res = $this->loyverse->processReceipt($r);
                $processed[] = $res;
            } catch (\Exception $e) {
                Log::error("Loyverse webhook processing error: " . $e->getMessage(), ['receipt' => $r]);
                $processed[] = ['error' => $e->getMessage()];
            }
        }

        // Always return 200 OK so Loyverse knows delivery was acknowledged
        return response()->json([
            'status' => 'ok',
            'received' => count($receipts),
            'processed' => $processed
        ], 200);
    }

    /**
     * Register the webhook endpoint with Loyverse.
     */
    public function registerWebhook(Request $request)
    {
        try {
            $webhookUrl = $request->input('url', url('/api/loyverse/webhook'));
            $res = $this->loyverse->registerWebhook($webhookUrl);

            return response()->json([
                'success' => true,
                'message' => "Webhook registered successfully for {$webhookUrl}",
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
