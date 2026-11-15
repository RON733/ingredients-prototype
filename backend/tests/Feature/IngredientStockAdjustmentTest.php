<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\User;
use App\Services\LoyverseService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IngredientStockAdjustmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_quick_adjust_only_updates_target_ingredient_and_clamps_prior_negative_stock(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $bun = Ingredient::create([
            'id' => 'brioche-bun',
            'name' => 'Brioche Bun',
            'category' => 'Bakery',
            'unit' => 'pcs',
            'stock' => 20,
            'low_threshold' => 10,
            'loyverse_variant_id' => 'var-bun',
        ]);

        $cheese = Ingredient::create([
            'id' => 'cheddar-slice',
            'name' => 'Cheddar Slice',
            'category' => 'Dairy',
            'unit' => 'slices',
            'stock' => -38,
            'low_threshold' => 15,
            'loyverse_variant_id' => 'var-cheese',
        ]);

        $patty = Ingredient::create([
            'id' => 'beef-patty',
            'name' => 'Beef Patty',
            'category' => 'Meat',
            'unit' => 'pcs',
            'stock' => 11,
            'low_threshold' => 12,
            'loyverse_variant_id' => 'var-patty',
        ]);

        Http::fake([
            'https://api.loyverse.com/v1.0/stores*' => Http::response(['stores' => [['id' => 'store-1', 'name' => 'Main']]], 200),
            'https://api.loyverse.com/v1.0/inventory*' => Http::response(['inventory_levels' => []], 200),
        ]);

        // Add +25 to Brioche Bun
        $res = $this->postJson("/api/v1/ingredients/{$bun->id}/adjust", ['amount' => 25]);
        $res->assertStatus(200);
        $this->assertEquals(45, (float) $res->json('stock'));

        // Other ingredients remain untouched
        $this->assertEquals(11, (float) $patty->fresh()->stock);

        // Restocking a previously negative ingredient starts from 0
        $res2 = $this->postJson("/api/v1/ingredients/{$cheese->id}/adjust", ['amount' => 25]);
        $res2->assertStatus(200);
        $this->assertEquals(25, (float) $res2->json('stock'));
        $this->assertEquals(11, (float) $patty->fresh()->stock);
    }

    public function test_pull_inventory_from_loyverse_filters_by_store_and_clamps_negative_stock(): void
    {
        $bun = Ingredient::create([
            'id' => 'brioche-bun',
            'name' => 'Brioche Bun',
            'category' => 'Bakery',
            'unit' => 'pcs',
            'stock' => 20,
            'low_threshold' => 10,
            'loyverse_variant_id' => 'var-bun',
        ]);

        $cheese = Ingredient::create([
            'id' => 'cheddar-slice',
            'name' => 'Cheddar Slice',
            'category' => 'Dairy',
            'unit' => 'slices',
            'stock' => 10,
            'low_threshold' => 15,
            'loyverse_variant_id' => 'var-cheese',
        ]);

        Http::fake([
            'https://api.loyverse.com/v1.0/stores*' => Http::response(['stores' => [['id' => 'store-1', 'name' => 'Main']]], 200),
            'https://api.loyverse.com/v1.0/inventory*' => Http::response([
                'inventory_levels' => [
                    ['variant_id' => 'var-bun', 'store_id' => 'store-2', 'in_stock' => 3],
                    ['variant_id' => 'var-bun', 'store_id' => 'store-1', 'in_stock' => 25],
                    ['variant_id' => 'var-cheese', 'store_id' => 'store-1', 'in_stock' => -38],
                ],
            ], 200),
        ]);

        config(['services.loyverse.store_id' => 'store-1']);
        $service = app(LoyverseService::class);
        $service->pullInventoryFromLoyverse();

        $this->assertEquals(25, (float) $bun->fresh()->stock);
        $this->assertEquals(0, (float) $cheese->fresh()->stock);
    }

    public function test_webhook_inventory_update_filters_by_store_and_clamps_negative_stock(): void
    {
        $bun = Ingredient::create([
            'id' => 'brioche-bun',
            'name' => 'Brioche Bun',
            'category' => 'Bakery',
            'unit' => 'pcs',
            'stock' => 20,
            'low_threshold' => 10,
            'loyverse_variant_id' => 'var-bun',
        ]);

        Http::fake([
            'https://api.loyverse.com/v1.0/stores*' => Http::response(['stores' => [['id' => 'store-1', 'name' => 'Main']]], 200),
        ]);

        config(['services.loyverse.store_id' => 'store-1']);
        $service = app(LoyverseService::class);

        // Other store update should be ignored
        $service->processWebhookPayload([
            'type' => 'inventory_levels.update',
            'inventory_levels' => [
                ['variant_id' => 'var-bun', 'store_id' => 'store-2', 'in_stock' => 2],
            ],
        ]);
        $this->assertEquals(20, (float) $bun->fresh()->stock);

        // Negative update on active store should be clamped to 0
        $service->processWebhookPayload([
            'type' => 'inventory_levels.update',
            'inventory_levels' => [
                ['variant_id' => 'var-bun', 'store_id' => 'store-1', 'in_stock' => -8],
            ],
        ]);
        $this->assertEquals(0, (float) $bun->fresh()->stock);
    }

    public function test_manual_stock_edit_sets_exact_number_and_ignores_echo_webhook(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $bun = Ingredient::create([
            'id' => 'brioche-bun',
            'name' => 'Brioche Bun',
            'category' => 'Bakery',
            'unit' => 'pcs',
            'stock' => 20,
            'low_threshold' => 10,
            'loyverse_variant_id' => 'var-bun',
        ]);

        $cheese = Ingredient::create([
            'id' => 'cheddar-slice',
            'name' => 'Cheddar Slice',
            'category' => 'Dairy',
            'unit' => 'slices',
            'stock' => 15,
            'low_threshold' => 15,
            'loyverse_variant_id' => 'var-cheese',
        ]);

        Http::fake([
            'https://api.loyverse.com/v1.0/stores*' => Http::response(['stores' => [['id' => 'store-1', 'name' => 'Main']]], 200),
            'https://api.loyverse.com/v1.0/inventory*' => Http::response(['inventory_levels' => []], 200),
        ]);

        // Manually set Brioche Bun to exact number 42
        $res = $this->patchJson("/api/ingredients/{$bun->id}", ['stock' => 42]);
        $res->assertStatus(200);
        $this->assertEquals(42, (float) $res->json('stock'));
        $this->assertEquals(42, (float) $bun->fresh()->stock);
        $this->assertEquals(15, (float) $cheese->fresh()->stock);

        // Manually set Brioche Bun to 0
        $resZero = $this->patchJson("/api/ingredients/{$bun->id}", ['stock' => 0]);
        $resZero->assertStatus(200);
        $this->assertEquals(0, (float) $resZero->json('stock'));
        $this->assertEquals(0, (float) $bun->fresh()->stock);

        // Manually set Brioche Bun to 67 and verify index reflects 67 immediately
        $res67 = $this->patchJson("/api/ingredients/{$bun->id}", ['stock' => 67]);
        $res67->assertStatus(200);
        $this->assertEquals(67, (float) $res67->json('stock'));

        $indexRes = $this->getJson('/api/ingredients');
        $indexRes->assertStatus(200);
        $bunRow = collect($indexRes->json())->firstWhere('id', 'brioche-bun');
        $this->assertEquals(67, (float) $bunRow['stock']);

        // Delayed Loyverse echo webhook for Brioche Bun within local push window should NOT overwrite 67
        $service = app(LoyverseService::class);
        $service->processWebhookPayload([
            'type' => 'inventory_levels.update',
            'inventory_levels' => [
                ['variant_id' => 'var-bun', 'store_id' => 'store-1', 'in_stock' => 12],
            ],
        ]);
        $this->assertEquals(67, (float) $bun->fresh()->stock);
    }

    public function test_push_all_pending_orders_skips_historical_gs_orders_and_resyncs_affected_ingredients(): void
    {
        $bun = Ingredient::create([
            'id' => 'brioche-bun',
            'name' => 'Brioche Bun',
            'category' => 'Bakery',
            'unit' => 'pcs',
            'stock' => 24,
            'low_threshold' => 10,
            'loyverse_variant_id' => 'var-bun',
        ]);

        $product = \App\Models\Product::create([
            'id' => 'classic-cheeseburger',
            'name' => 'Cheese Burger',
            'category' => 'Burgers',
            'price' => 89.00,
            'is_available' => true,
            'loyverse_item_id' => 'lv-burger',
            'loyverse_variant_id' => 'lv-var-burger',
        ]);
        \App\Models\Recipe::create([
            'product_id' => $product->id,
            'ingredient_id' => $bun->id,
            'qty' => 1,
        ]);

        // Historical seeded #GS- order should be ignored by pushAllPendingWebsiteOrders
        $historicalOrder = \App\Models\Order::create([
            'order_number' => '#GS-2571',
            'source' => 'web',
            'customer_name' => 'Maria Andrada',
            'customer_phone' => '09180376701',
            'order_type' => 'Delivery',
            'payment_method' => 'PayMongo',
            'payment_status' => 'Paid',
            'status' => 'Completed',
            'subtotal' => 89,
            'delivery_fee' => 50,
            'total_amount' => 139,
        ]);
        $historicalOrder->created_at = now()->subDays(10);
        $historicalOrder->saveQuietly();

        // Recent live order should be pushed once and re-sync Brioche Bun (24) to Loyverse
        $liveOrder = \App\Models\Order::create([
            'order_number' => '#104',
            'source' => 'web',
            'customer_name' => 'Juan',
            'customer_phone' => '09171234567',
            'order_type' => 'Pickup',
            'payment_method' => 'Cash',
            'payment_status' => 'Paid',
            'status' => 'Completed',
            'subtotal' => 89,
            'delivery_fee' => 0,
            'total_amount' => 89,
        ]);
        \App\Models\OrderItem::create([
            'order_id' => $liveOrder->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => 89,
            'quantity' => 1,
            'subtotal' => 89,
        ]);

        Http::fake([
            'https://api.loyverse.com/v1.0/stores*' => Http::response(['stores' => [['id' => 'store-1', 'name' => 'Main']]], 200),
            'https://api.loyverse.com/v1.0/items*' => Http::response([
                'items' => [
                    [
                        'id' => 'lv-burger',
                        'item_name' => 'Cheese Burger',
                        'variants' => [['variant_id' => 'lv-var-burger', 'sku' => 'classic-cheeseburger']],
                    ],
                ],
            ], 200),
            'https://api.loyverse.com/v1.0/receipts' => Http::response(['receipt_number' => '5001'], 200),
            'https://api.loyverse.com/v1.0/inventory' => Http::response(['inventory_levels' => []], 200),
        ]);

        config(['services.loyverse.store_id' => 'store-1']);
        $service = app(LoyverseService::class);
        $res = $service->pushAllPendingWebsiteOrders();

        $this->assertEquals(1, $res['total']);
        $this->assertEquals(1, $res['pushed']);
        $this->assertNull($historicalOrder->fresh()->loyverse_receipt_id);
        $this->assertEquals('5001', $liveOrder->fresh()->loyverse_receipt_id);

        // Second call pushes nothing
        $res2 = $service->pushAllPendingWebsiteOrders();
        $this->assertEquals(0, $res2['total']);

        // Affected ingredient Brioche Bun was re-pushed to Loyverse with stock_after = 24
        Http::assertSent(function ($request) {
            if ($request->method() === 'POST' && str_ends_with($request->url(), '/inventory')) {
                $levels = $request->data()['inventory_levels'] ?? [];
                return !empty($levels)
                    && $levels[0]['variant_id'] === 'var-bun'
                    && (float) $levels[0]['stock_after'] === 24.0;
            }
            return false;
        });
    }
}
