<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\LoyverseService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LoyverseDiscountSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_applying_and_removing_discount_syncs_discount_catalog_to_loyverse(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@gshotteas.com',
        ]);
        Sanctum::actingAs($admin);

        Product::create([
            'id' => 'classic-milktea',
            'name' => 'Classic Milk Tea',
            'category' => 'Drinks',
            'price' => 100.00,
            'is_available' => true,
            'loyverse_item_id' => 'lv-item-1',
            'loyverse_variant_id' => 'lv-var-1',
        ]);

        Http::fake([
            'https://api.loyverse.com/v1.0/stores*' => Http::response(['stores' => [['id' => 'store-1', 'name' => 'Main']]], 200),
            'https://api.loyverse.com/v1.0/categories*' => Http::response(['categories' => [['id' => 'lv-cat-1', 'name' => 'Drinks']]], 200),
            'https://api.loyverse.com/v1.0/items*' => Http::response([
                'id' => 'lv-item-1',
                'variants' => [['variant_id' => 'lv-var-1']],
            ], 200),
            'https://api.loyverse.com/v1.0/discounts' => Http::sequence()
                ->push(['discounts' => []], 200)
                ->push([
                    'id' => 'lv-disc-20',
                    'name' => 'Promo 20% Off',
                    'type' => 'FIXED_PERCENT',
                    'discount_percent' => 20.0,
                ], 200),
        ]);

        $res = $this->postJson('/api/v1/products/discount', [
            'scope' => 'single',
            'product_id' => 'classic-milktea',
            'discount_type' => 'percentage',
            'discount_value' => 20,
        ]);

        $res->assertStatus(200);

        $this->assertDatabaseHas('products', [
            'id' => 'classic-milktea',
            'price' => 80.00,
            'original_price' => 100.00,
            'discount_percent' => 20,
            'loyverse_discount_id' => 'lv-disc-20',
        ]);

        Http::assertSent(function ($request) {
            if ($request->method() === 'POST' && str_ends_with($request->url(), '/discounts')) {
                $data = $request->data();
                return $data['type'] === 'FIXED_PERCENT'
                    && $data['name'] === 'Promo 20% Off'
                    && (float) $data['discount_percent'] === 20.0;
            }
            return false;
        });

        $removeRes = $this->postJson('/api/v1/products/discount/remove', [
            'scope' => 'single',
            'product_id' => 'classic-milktea',
        ]);

        $removeRes->assertStatus(200);

        $this->assertDatabaseHas('products', [
            'id' => 'classic-milktea',
            'price' => 100.00,
            'original_price' => null,
            'discount_percent' => 0,
            'loyverse_discount_id' => null,
        ]);
    }

    public function test_order_snapshots_discount_and_pushes_total_discounts_to_loyverse_receipt(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
            'name' => 'Juan Dela Cruz',
            'phone' => '09171234567',
        ]);
        Sanctum::actingAs($customer);

        $product = Product::create([
            'id' => 'brown-sugar-boba',
            'name' => 'Brown Sugar Boba',
            'category' => 'Drinks',
            'price' => 80.00,
            'original_price' => 100.00,
            'discount_percent' => 20,
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'is_available' => true,
            'loyverse_item_id' => 'lv-item-boba',
            'loyverse_variant_id' => 'lv-var-boba',
        ]);

        $orderRes = $this->postJson('/api/orders', [
            'customer_name' => 'Juan Dela Cruz',
            'customer_phone' => '09171234567',
            'order_type' => 'Store Pickup',
            'payment_method' => 'Cash',
            'items' => [
                [
                    'product_id' => 'brown-sugar-boba',
                    'quantity' => 2,
                    'customization' => ['size' => 'Large'], // +20 per unit => net 100, orig 120
                ],
            ],
        ]);

        $orderRes->assertStatus(201);
        $orderId = $orderRes->json('order.id') ?? $orderRes->json('id');
        $order = Order::with('items')->findOrFail($orderId);

        $this->assertEquals(100.00, $order->items[0]->unit_price);
        $this->assertEquals(120.00, $order->items[0]->original_unit_price);
        $this->assertEquals(40.00, $order->items[0]->discount_amount);
        $this->assertEquals('Promo 20% Off', $order->items[0]->discount_label);
        $this->assertEquals(200.00, $order->total_amount);

        // Simulate promo ending before order is marked completed
        $product->update([
            'price' => 100.00,
            'original_price' => null,
            'discount_percent' => 0,
            'discount_type' => null,
            'discount_value' => 0,
        ]);

        $order->update(['status' => 'Completed', 'payment_status' => 'Paid']);

        Http::fake([
            'https://api.loyverse.com/v1.0/stores*' => Http::response([
                'stores' => [['id' => 'store-1', 'name' => 'Main']],
            ], 200),
            'https://api.loyverse.com/v1.0/items*' => Http::response([
                'items' => [
                    [
                        'id' => 'lv-item-boba',
                        'item_name' => 'Brown Sugar Boba',
                        'variants' => [['variant_id' => 'lv-var-boba', 'sku' => 'brown-sugar-boba']],
                    ],
                ],
            ], 200),
            'https://api.loyverse.com/v1.0/discounts' => Http::sequence()
                ->push(['discounts' => []], 200)
                ->push([
                    'id' => 'lv-var-disc-1',
                    'name' => 'Website Promo Discount',
                    'type' => 'VARIABLE_AMOUNT',
                ], 200),
            'https://api.loyverse.com/v1.0/receipts' => Http::response([
                'receipt_number' => '0099',
            ], 200),
        ]);

        $service = app(LoyverseService::class);
        $receipt = $service->pushOrderToLoyverse($order->fresh('items'));

        $this->assertNotNull($receipt);
        $this->assertEquals('0099', $order->fresh()->loyverse_receipt_id);

        Http::assertSent(function ($request) {
            if ($request->method() === 'POST' && str_ends_with($request->url(), '/receipts')) {
                $data = $request->data();
                return (float) $data['line_items'][0]['price'] === 120.00
                    && (float) $data['line_items'][0]['quantity'] === 2.0
                    && $data['total_discounts'][0]['id'] === 'lv-var-disc-1'
                    && $data['total_discounts'][0]['scope'] === 'RECEIPT'
                    && (float) $data['total_discounts'][0]['money_amount'] === 40.00
                    && (float) $data['payments'][0]['money_amount'] === 200.00;
            }
            return false;
        });
    }
}
