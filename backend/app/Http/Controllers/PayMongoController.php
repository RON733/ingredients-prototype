<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Order;
use App\Models\SystemSetting;
use App\Services\PayMongoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PayMongoController extends Controller
{
    protected PayMongoService $paymongo;

    public function __construct(PayMongoService $paymongo)
    {
        $this->paymongo = $paymongo;
    }

    /**
     * Get public configuration for frontend checkout
     */
    public function config(Request $request)
    {
        $settingAvail = SystemSetting::where('key', 'paymongo_available')->value('value');
        $isAvailable = $settingAvail === null || in_array(strtolower((string)$settingAvail), ['true', '1', 'yes', 'on'], true);

        return response()->json([
            'enabled' => $this->paymongo->isConfigured() && $isAvailable,
            'public_key' => $this->paymongo->getPublicKey(),
            'methods' => [
                'gcash' => 'GCash',
                'paymaya' => 'Maya',
                'card' => 'Credit / Debit Card (Visa, Mastercard)',
                'grab_pay' => 'GrabPay',
                'billease' => 'BillEase',
                'dob' => 'Online Banking',
            ],
        ]);
    }

    /**
     * Create or regenerate a checkout session for an order
     */
    public function createCheckout(Request $request, $orderId)
    {
        $order = Order::with('items')->where('id', $orderId)
            ->orWhere('order_number', $orderId)
            ->orWhere('order_number', '#' . ltrim((string)$orderId, '#'))
            ->firstOrFail();

        if (in_array($order->payment_status, ['Paid', 'Verified'])) {
            return response()->json([
                'message' => 'This order has already been paid.',
                'order' => $order,
            ], 400);
        }

        if ($order->payment_method !== 'PayMongo') {
            $order->payment_method = 'PayMongo';
            $order->save();
        }

        // Determine base frontend URL for redirects
        $origin = $request->header('origin') 
            ?: $request->header('referer') 
            ?: config('app.url', 'http://127.0.0.1:8000');
        $origin = rtrim($origin, '/');

        // Clean out path from referer if referer was provided
        if (filter_var($origin, FILTER_VALIDATE_URL)) {
            $parsed = parse_url($origin);
            $port = !empty($parsed['port']) ? ':' . $parsed['port'] : '';
            $origin = "{$parsed['scheme']}://{$parsed['host']}{$port}";
        }

        $successUrl = "{$origin}/?paymongo_status=success&order_id={$order->id}";
        $cancelUrl = "{$origin}/?paymongo_status=cancelled&order_id={$order->id}";

        try {
            // Generate QR Ph dynamic QR code
            $qrData = $this->paymongo->createQrPhPayment($order);
            if ($qrData && !empty($qrData['qr_image'])) {
                $order->paymongo_qr_image = $qrData['qr_image'];
                $order->paymongo_payment_id = $qrData['payment_intent_id'];
            }

            // Generate hosted checkout URL
            $sessionData = $this->paymongo->createCheckoutSession($order, $successUrl, $cancelUrl);

            $order->paymongo_session_id = $sessionData['session_id'];
            $order->paymongo_checkout_url = $sessionData['checkout_url'];
            $order->save();

            return response()->json([
                'message' => 'Checkout session created successfully.',
                'checkout_url' => $sessionData['checkout_url'],
                'session_id' => $sessionData['session_id'],
                'qr_image' => $order->paymongo_qr_image,
                'order' => $order,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to create PayMongo checkout: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to initialize PayMongo checkout: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify payment status for an order
     */
    public function verifyPayment(Request $request, $orderId)
    {
        $order = Order::with('items')->where('id', $orderId)
            ->orWhere('order_number', $orderId)
            ->orWhere('order_number', '#' . ltrim((string)$orderId, '#'))
            ->firstOrFail();

        if (in_array($order->payment_status, ['Paid', 'Verified'])) {
            return response()->json([
                'paid' => true,
                'message' => 'Payment has already been confirmed.',
                'order' => $order,
            ]);
        }

        if (empty($order->paymongo_session_id) && empty($order->paymongo_payment_id)) {
            return response()->json([
                'paid' => false,
                'message' => 'No active PayMongo session or QR payment found for this order.',
                'order' => $order,
            ], 404);
        }

        try {
            $result = $this->paymongo->verifyOrderPayment($order);
            $order->refresh();

            if ($result['paid']) {
                $method = strtoupper((string) ($result['method_type'] ?? 'ONLINE'));
                AuditLog::create([
                    'user_name' => $order->customer_name ?: 'Online Customer',
                    'user_role' => 'customer',
                    'action' => 'PayMongo Payment Verified',
                    'details' => "Online payment of PHP " . number_format($order->total_amount, 2) . " confirmed via PayMongo ({$method}) for order {$order->order_number}.",
                    'ip_address' => $request->ip(),
                ]);

                return response()->json([
                    'paid' => true,
                    'message' => 'Payment verified successfully! Your order is being prepared.',
                    'order' => $order,
                    'details' => $result,
                ]);
            }

            return response()->json([
                'paid' => false,
                'message' => 'Payment has not yet been completed.',
                'order' => $order,
                'details' => $result,
            ]);
        } catch (\Throwable $e) {
            Log::error("PayMongo verification failed for order {$order->id}: " . $e->getMessage());
            return response()->json([
                'paid' => false,
                'message' => 'Failed to verify payment with PayMongo: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle PayMongo server-to-server webhook
     */
    public function webhook(Request $request)
    {
        $payload = $request->all();
        $eventType = $payload['data']['attributes']['type'] ?? null;
        $eventData = $payload['data']['attributes']['data'] ?? [];

        Log::info("PayMongo Webhook Received: {$eventType}", ['payload' => $payload]);

        $order = null;

        if ($eventType === 'checkout_session.payment.paid') {
            // Find session ID from webhook data
            $sessionId = $eventData['id'] ?? null;
            if ($sessionId) {
                $order = Order::where('paymongo_session_id', $sessionId)->first();
            }

            // Fallback by reference number (e.g. #31)
            if (!$order) {
                $ref = $eventData['attributes']['reference_number'] ?? null;
                if ($ref) {
                    $order = Order::where('order_number', $ref)
                        ->orWhere('order_number', '#' . ltrim((string)$ref, '#'))
                        ->first();
                }
            }

            if ($order) {
                $order->payment_status = 'Paid';
                $payments = $eventData['attributes']['payments'] ?? [];
                if (!empty($payments[0]['id'])) {
                    $order->paymongo_payment_id = $payments[0]['id'];
                }
                $order->save();

                try {
                    app(\App\Services\LoyverseService::class)->pushOrderToLoyverse($order);
                } catch (\Throwable $e) {
                    Log::warning("Loyverse auto-push from PayMongo webhook failed: " . $e->getMessage());
                }

                AuditLog::create([
                    'user_name' => 'PayMongo Webhook',
                    'user_role' => 'system',
                    'action' => 'Webhook Payment Paid',
                    'details' => "PayMongo verified payment for Order {$order->order_number} (PHP " . number_format($order->total_amount, 2) . ")",
                    'ip_address' => $request->ip(),
                ]);
            }
        }

        return response()->json(['status' => 'success'], 200);
    }
}
