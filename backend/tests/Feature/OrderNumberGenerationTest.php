<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OrderNumberGenerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_sequential_orders_generate_unique_incrementing_order_numbers(): void
    {
        $customer = User::create([
            'name' => 'Customer User',
            'email' => 'customer-order-num@test.com',
            'password' => Hash::make('Password123!'),
            'role' => 'customer',
            'status' => 'active',
        ]);

        $product = Product::create([
            'id' => 'prod-test-1',
            'name' => 'Classic Milk Tea',
            'category' => 'Milk Tea',
            'price' => 100,
            'is_available' => true,
        ]);

        // Seed an existing order at #30 (matching DatabaseSeeder baseline)
        Order::create([
            'order_number' => '#30',
            'customer_name' => 'Seeded Customer',
            'customer_phone' => '09171234567',
            'order_type' => 'Store Pickup',
            'delivery_address' => 'Store Pickup',
            'payment_method' => 'Cash',
            'payment_status' => 'Pending',
            'status' => 'Pending',
            'subtotal' => 100,
            'delivery_fee' => 0,
            'total_amount' => 100,
        ]);

        $payload = [
            'customer_name' => 'Customer User',
            'customer_phone' => '09171234567',
            'order_type' => 'Store Pickup',
            'payment_method' => 'Cash',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ],
            ],
        ];

        $first = $this->actingAs($customer, 'sanctum')
            ->postJson('/api/orders', $payload)
            ->assertStatus(201);

        $second = $this->actingAs($customer, 'sanctum')
            ->postJson('/api/orders', $payload)
            ->assertStatus(201);

        $this->assertSame('#31', $first->json('order.order_number'));
        $this->assertSame('#32', $second->json('order.order_number'));
    }
}