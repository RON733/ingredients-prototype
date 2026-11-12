<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DriverDepartureDispatchTest extends TestCase
{
    use RefreshDatabase;

    private function createOrder(string $orderNumber): Order
    {
        return Order::create([
            'order_number' => $orderNumber,
            'customer_name' => 'Test Customer',
            'customer_phone' => '09171234567',
            'order_type' => 'Delivery',
            'delivery_address' => 'Santa Rosa, Laguna',
            'payment_method' => 'Cash',
            'payment_status' => 'Pending',
            'status' => 'Preparing',
            'subtotal' => 150,
            'delivery_fee' => 20,
            'total_amount' => 170,
        ]);
    }

    public function test_rider_can_batch_orders_then_lock_dispatch_when_on_delivery_and_auto_unlock_after_last_delivery(): void
    {
        $staff = User::create([
            'name' => 'Staff One',
            'email' => 'staff1@test.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
            'pin' => '1234',
            'status' => 'active',
        ]);

        $driver = User::create([
            'name' => 'Rider Juan',
            'email' => 'juan@test.com',
            'password' => Hash::make('password123'),
            'role' => 'driver',
            'status' => 'active',
            'is_available' => true,
            'driver_status' => 'available',
        ]);

        $order1 = $this->createOrder('GST-1001');
        $order2 = $this->createOrder('GST-1002');
        $order3 = $this->createOrder('GST-1003');

        // 1. Rider cannot mark on_delivery without any dispatched orders
        $this->actingAs($driver, 'sanctum')
            ->patchJson('/api/driver/delivery-status', [
                'driver_status' => 'on_delivery',
            ])
            ->assertStatus(422);

        // 2. Staff dispatches multiple orders to the same rider before takeoff
        $this->actingAs($staff, 'sanctum')
            ->patchJson("/api/orders/{$order1->id}/assign-driver", [
                'driver_id' => $driver->id,
            ])
            ->assertStatus(200);

        $this->actingAs($staff, 'sanctum')
            ->patchJson("/api/orders/{$order2->id}/assign-driver", [
                'driver_id' => $driver->id,
            ])
            ->assertStatus(200);

        // 3. Rider taps Taking Off / Mark On Delivery before leaving
        $this->actingAs($driver, 'sanctum')
            ->patchJson('/api/driver/delivery-status', [
                'driver_status' => 'on_delivery',
            ])
            ->assertStatus(200)
            ->assertJsonPath('driver_status', 'on_delivery')
            ->assertJsonPath('is_on_delivery', true);

        // Staff/Admin fleet list shows rider is on_delivery
        $driversRes = $this->actingAs($staff, 'sanctum')
            ->getJson('/api/drivers')
            ->assertStatus(200);
        $this->assertSame('on_delivery', $driversRes->json('0.driver_status'));
        $this->assertTrue($driversRes->json('0.is_on_delivery'));

        // 4. Staff cannot dispatch order3 while rider is already on delivery
        $this->actingAs($staff, 'sanctum')
            ->patchJson("/api/orders/{$order3->id}/assign-driver", [
                'driver_id' => $driver->id,
            ])
            ->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Cannot dispatch order to Rider Juan. Rider is already on delivery.',
            ]);

        // 5. Completing only the first order keeps rider on_delivery
        $this->actingAs($driver, 'sanctum')
            ->patchJson("/api/orders/{$order1->id}/status", [
                'status' => 'Completed',
            ])
            ->assertStatus(200);

        $driver->refresh();
        $this->assertSame('on_delivery', $driver->driver_status);

        $this->actingAs($staff, 'sanctum')
            ->patchJson("/api/orders/{$order3->id}/assign-driver", [
                'driver_id' => $driver->id,
            ])
            ->assertStatus(422);

        // 6. Completing the last active order automatically unlocks rider for dispatch
        $this->actingAs($driver, 'sanctum')
            ->patchJson("/api/orders/{$order2->id}/status", [
                'status' => 'Completed',
            ])
            ->assertStatus(200);

        $driver->refresh();
        $this->assertSame('available', $driver->driver_status);

        $this->actingAs($staff, 'sanctum')
            ->patchJson("/api/orders/{$order3->id}/assign-driver", [
                'driver_id' => $driver->id,
            ])
            ->assertStatus(200);
    }

    public function test_rider_can_switch_back_to_available_if_still_at_store(): void
    {
        $driver = User::create([
            'name' => 'Rider Pedro',
            'email' => 'pedro@test.com',
            'password' => Hash::make('password123'),
            'role' => 'driver',
            'status' => 'active',
            'is_available' => true,
            'driver_status' => 'available',
        ]);

        $order = $this->createOrder('GST-2001');
        $order->driver_id = $driver->id;
        $order->status = 'Out for Delivery';
        $order->save();

        $this->actingAs($driver, 'sanctum')
            ->patchJson('/api/driver/delivery-status', [
                'driver_status' => 'on_delivery',
            ])
            ->assertStatus(200)
            ->assertJsonPath('driver_status', 'on_delivery');

        $this->actingAs($driver, 'sanctum')
            ->patchJson('/api/driver/delivery-status', [
                'driver_status' => 'available',
            ])
            ->assertStatus(200)
            ->assertJsonPath('driver_status', 'available')
            ->assertJsonPath('is_on_delivery', false);
    }
}
