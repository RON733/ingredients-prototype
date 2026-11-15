<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OrderCancellationReasonTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_and_admin_must_provide_a_reason_when_cancelling_an_order(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin-cancel@test.com',
            'password' => Hash::make('Password123!'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $order = Order::create([
            'order_number' => '#999',
            'customer_name' => 'Test Customer',
            'customer_phone' => '09171234567',
            'order_type' => 'Delivery',
            'delivery_address' => 'Santa Rosa, Laguna',
            'payment_method' => 'Cash',
            'payment_status' => 'Pending',
            'status' => 'Pending',
            'subtotal' => 100,
            'delivery_fee' => 40,
            'total_amount' => 140,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/orders/{$order->id}/status", [
                'status' => 'Cancelled',
                'cancellation_reason' => '   ',
            ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Please provide a reason for cancelling this order.');

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/orders/{$order->id}/status", [
                'status' => 'Cancelled',
                'cancellation_reason' => 'Customer requested cancellation via phone',
            ])
            ->assertStatus(200)
            ->assertJsonPath('order.status', 'Cancelled')
            ->assertJsonPath('order.cancellation_reason', 'Customer requested cancellation via phone');

        $order->refresh();
        $this->assertSame('Cancelled', $order->status);
        $this->assertSame('Customer requested cancellation via phone', $order->cancellation_reason);

        $log = AuditLog::latest('id')->first();
        $this->assertNotNull($log);
        $this->assertStringContainsString('Customer requested cancellation via phone', $log->details);
    }
}
