<?php

namespace App\Services;

use App\Models\Order;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayMongoService
{
    protected ?string $secretKey;
    protected ?string $publicKey;
    protected string $apiUrl;
    protected ?string $webhookSecret;

    public function __construct()
    {
        $this->secretKey = config('services.paymongo.secret_key') 
            ?: SystemSetting::where('key', 'paymongo_secret_key')->value('value');
        $this->publicKey = config('services.paymongo.public_key')
            ?: SystemSetting::where('key', 'paymongo_public_key')->value('value');
        $this->apiUrl = rtrim(config('services.paymongo.api_url', 'https://api.paymongo.com/v1'), '/');
        $this->webhookSecret = config('services.paymongo.webhook_secret')
            ?: SystemSetting::where('key', 'paymongo_webhook_secret')->value('value');
    }

    public function isConfigured(): bool
    {
        return !empty($this->secretKey);
    }

    public function getPublicKey(): ?string
    {
        return $this->publicKey;
    }

    /**
     * Create a PayMongo hosted checkout session for an order
     */
    public function createCheckoutSession(Order $order, string $successUrl, string $cancelUrl): array
    {
        if (!$this->isConfigured()) {
            throw new \Exception('PayMongo Secret Key is not configured.');
        }

        $order->loadMissing('items');

        $lineItems = [];
        $runningTotalCents = 0;

        foreach ($order->items as $item) {
            $unitCents = (int) round(((float) $item->unit_price) * 100);
            $qty = (int) $item->quantity;
            $runningTotalCents += ($unitCents * $qty);

            $descParts = [];
            if (!empty($item->customization)) {
                $c = is_array($item->customization) ? $item->customization : (json_decode($item->customization, true) ?: []);
                if (!empty($c['size'])) $descParts[] = ucfirst($c['size']);
                if (!empty($c['sugar'])) $descParts[] = $c['sugar'];
                if (!empty($c['ice'])) $descParts[] = $c['ice'];
                if (!empty($c['toppings']) && is_array($c['toppings'])) $descParts[] = implode(', ', $c['toppings']);
            }

            $lineItems[] = [
                'currency' => 'PHP',
                'amount' => $unitCents,
                'name' => $item->product_name ?: 'G Shot Tea Item',
                'quantity' => $qty,
                'description' => !empty($descParts) ? implode(' • ', $descParts) : 'Standard serving',
            ];
        }

        // Add Delivery Fee if applicable
        if ((float) $order->delivery_fee > 0) {
            $deliveryCents = (int) round(((float) $order->delivery_fee) * 100);
            $runningTotalCents += $deliveryCents;

            $lineItems[] = [
                'currency' => 'PHP',
                'amount' => $deliveryCents,
                'name' => 'Doorstep Delivery Fee',
                'quantity' => 1,
                'description' => 'Local courier dispatch to ' . ($order->delivery_address ?: 'Santa Rosa, Laguna'),
            ];
        }

        // Fallback safety: If for any reason line items don't exist or sum mismatch
        $expectedTotalCents = (int) round(((float) $order->total_amount) * 100);
        if (empty($lineItems) || $runningTotalCents !== $expectedTotalCents) {
            $lineItems = [
                [
                    'currency' => 'PHP',
                    'amount' => $expectedTotalCents,
                    'name' => "G Shot Teas Order {$order->order_number}",
                    'quantity' => 1,
                    'description' => "Complete order total ({$order->order_type})",
                ]
            ];
        }

        $payload = [
            'data' => [
                'attributes' => [
                    'send_email_receipt' => true,
                    'show_description' => true,
                    'show_line_items' => true,
                    'payment_method_types' => [
                        'card',
                        'gcash',
                        'paymaya',
                        'grab_pay',
                        'dob',
                        'billease',
                    ],
                    'line_items' => $lineItems,
                    'description' => "Order {$order->order_number} — G Shot Teas",
                    'reference_number' => (string) $order->order_number,
                    'success_url' => $successUrl,
                    'cancel_url' => $cancelUrl,
                    'billing' => [
                        'name' => $order->customer_name ?: 'Valued Customer',
                        'phone' => $order->customer_phone ?: null,
                    ],
                ],
            ],
        ];

        $response = Http::withBasicAuth($this->secretKey, '')
            ->acceptJson()
            ->post("{$this->apiUrl}/checkout_sessions", $payload);

        if (!$response->successful()) {
            $errorJson = $response->json();
            $errorMessage = $errorJson['errors'][0]['detail'] ?? $response->body();
            Log::error('PayMongo Checkout Session Creation Failed', [
                'order_id' => $order->id,
                'status' => $response->status(),
                'error' => $errorMessage,
            ]);
            throw new \Exception("PayMongo API error: {$errorMessage}");
        }

        $data = $response->json('data');
        return [
            'session_id' => $data['id'],
            'checkout_url' => $data['attributes']['checkout_url'],
            'raw' => $data,
        ];
    }

    /**
     * Retrieve a PayMongo checkout session
     */
    public function getCheckoutSession(string $sessionId): ?array
    {
        if (!$this->isConfigured()) return null;

        $response = Http::withBasicAuth($this->secretKey, '')
            ->acceptJson()
            ->get("{$this->apiUrl}/checkout_sessions/{$sessionId}");

        if (!$response->successful()) {
            Log::warning("PayMongo retrieve session {$sessionId} failed: " . $response->body());
            return null;
        }

        return $response->json('data');
    }

    /**
     * Verify whether a checkout session has been paid
     */
    public function verifyCheckoutSession(string $sessionId): array
    {
        $session = $this->getCheckoutSession($sessionId);
        if (!$session) {
            return [
                'paid' => false,
                'message' => 'Checkout session not found on PayMongo.',
                'payment_id' => null,
            ];
        }

        $attributes = $session['attributes'] ?? [];
        $status = strtolower((string) ($attributes['status'] ?? ''));
        $intentStatus = strtolower((string) ($attributes['payment_intent']['attributes']['status'] ?? ''));

        $payments = $attributes['payments'] ?? [];
        $paidPayment = null;
        foreach ($payments as $p) {
            if (strtolower((string) ($p['attributes']['status'] ?? '')) === 'paid') {
                $paidPayment = $p;
                break;
            }
        }

        $isPaid = ($status === 'paid' || $intentStatus === 'succeeded' || !empty($paidPayment));
        $paymentId = $paidPayment['id'] ?? ($attributes['payment_intent']['id'] ?? null);

        return [
            'paid' => $isPaid,
            'status' => $status,
            'intent_status' => $intentStatus,
            'payment_id' => $paymentId,
            'amount_cents' => $paidPayment['attributes']['amount'] ?? ($attributes['payment_intent']['attributes']['amount'] ?? null),
            'method_type' => $paidPayment['attributes']['source']['type'] ?? ($paidPayment['attributes']['payment_method_type'] ?? 'online'),
            'session' => $session,
        ];
    }

    /**
     * Verify an Order's payment status using PayMongo
     */
    public function verifyOrderPayment(Order $order): array
    {
        if (empty($order->paymongo_session_id)) {
            return [
                'paid' => false,
                'message' => 'No PayMongo session attached to this order.',
            ];
        }

        $verification = $this->verifyCheckoutSession($order->paymongo_session_id);

        if ($verification['paid']) {
            if ($order->payment_status !== 'Paid' && $order->payment_status !== 'Verified') {
                $order->payment_status = 'Paid';
                if (!empty($verification['payment_id'])) {
                    $order->paymongo_payment_id = $verification['payment_id'];
                }
                $order->save();

                // Auto-push order to Loyverse POS upon online payment confirmation
                try {
                    app(\App\Services\LoyverseService::class)->pushOrderToLoyverse($order);
                } catch (\Throwable $e) {
                    Log::warning("Loyverse auto-sync warning for paid PayMongo order #{$order->order_number}: " . $e->getMessage());
                }
            }
        }

        return $verification;
    }
}
