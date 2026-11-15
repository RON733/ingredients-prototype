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
}
