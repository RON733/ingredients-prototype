<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductManualAvailabilityTest extends TestCase
{
    use RefreshDatabase;
    public function test_staff_can_toggle_product_availability_manually_and_unavailable_orders_are_blocked(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $customer = User::factory()->create(['role' => 'customer']);

        $product = Product::create([
            'id' => 'classic-milktea',
            'name' => 'Milktea Classic',
            'category' => 'Drinks',
            'price' => 49.00,
            'is_available' => true,
        ]);

        // Available product reports 999 portions and 'available' status
        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonPath('0.is_available', true)
            ->assertJsonPath('0.max_portions', 999)
            ->assertJsonPath('0.stock_status', 'available');

        // Staff flags the product unavailable in Product Menu
        Sanctum::actingAs($staff);
        $this->patchJson("/api/products/{$product->id}/toggle-availability")
            ->assertOk()
            ->assertJsonPath('product.is_available', false);

        $this->assertFalse((bool) $product->fresh()->is_available);
        $this->assertSame(0, $product->fresh()->max_portions);
        $this->assertSame('unavailable', $product->fresh()->stock_status);

        // Customer cannot place an order for an unavailable product
        Sanctum::actingAs($customer);
        $this->postJson('/api/orders', [
            'customer_name' => 'Jane Doe',
            'customer_phone' => '09171234567',
            'order_type' => 'Store Pickup',
            'payment_method' => 'Cash',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Cannot place order: Milktea Classic is currently unavailable.');

        // Staff flags the product available again
        Sanctum::actingAs($staff);
        $this->patchJson("/api/products/{$product->id}/toggle-availability")
            ->assertOk()
            ->assertJsonPath('product.is_available', true);

        // Customer can now place the order without ingredient/recipe restrictions
        Sanctum::actingAs($customer);
        $this->postJson('/api/orders', [
            'customer_name' => 'Jane Doe',
            'customer_phone' => '09171234567',
            'order_type' => 'Store Pickup',
            'payment_method' => 'Cash',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 3],
            ],
        ])
            ->assertStatus(201)
            ->assertJsonPath('order.status', 'Pending');
    }
}
