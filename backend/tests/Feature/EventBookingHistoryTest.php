<?php

namespace Tests\Feature;

use App\Models\EventBooking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventBookingHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_customer_can_see_their_booking_history_and_staff_approval(): void
    {
        $customer = User::factory()->create([
            'name' => 'Juan Customer',
            'email' => 'juan@example.com',
            'role' => 'customer',
        ]);

        $otherCustomer = User::factory()->create([
            'name' => 'Other Customer',
            'email' => 'other@example.com',
            'role' => 'customer',
        ]);

        $staff = User::factory()->create([
            'name' => 'Manager Ana',
            'email' => 'ana@example.com',
            'role' => 'admin',
        ]);

        $futureDate = now()->addDays(10)->toDateString();

        // Another customer's booking should remain private
        EventBooking::create([
            'user_id' => $otherCustomer->id,
            'client_name' => 'Other Customer',
            'client_phone' => '09998887777',
            'client_email' => 'other@example.com',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $futureDate,
            'event_time' => '9:00 AM – 12:00 PM (3 Hours)',
            'guest_count' => 50,
            'location' => 'Other Venue',
            'package_name' => 'Coffee Package',
            'estimated_cost' => 3500,
            'status' => 'Pending',
        ]);

        // Customer books an event while authenticated
        Sanctum::actingAs($customer);
        $createRes = $this->postJson('/api/bookings', [
            'client_name' => 'Juan Customer',
            'client_phone' => '09171234567',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $futureDate,
            'event_time' => '2:00 PM – 5:00 PM (3 Hours)',
            'guest_count' => 50,
            'location' => 'Santa Rosa, Laguna',
        ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('booking.user_id', $customer->id)
            ->assertJsonPath('booking.status', 'Pending');

        $bookingId = $createRes->json('booking.id');

        // Customer fetches their booking history (should see only their own)
        $myRes = $this->getJson('/api/bookings/my');
        $myRes->assertOk()->assertJsonCount(1);
        $myRes->assertJsonPath('0.id', $bookingId);
        $myRes->assertJsonPath('0.status', 'Pending');

        // Admin approves the booking
        Sanctum::actingAs($staff);
        $approveRes = $this->patchJson("/api/bookings/{$bookingId}/status", [
            'status' => 'Approved',
        ]);

        $approveRes->assertOk()
            ->assertJsonPath('booking.status', 'Approved')
            ->assertJsonPath('booking.reviewed_by_name', 'Manager Ana')
            ->assertJsonPath('booking.reviewed_by_role', 'admin');

        // Customer checks their booking history again and sees approval
        Sanctum::actingAs($customer);
        $afterRes = $this->getJson('/api/bookings/my');
        $afterRes->assertOk()->assertJsonCount(1);
        $afterRes->assertJsonPath('0.status', 'Approved');
        $afterRes->assertJsonPath('0.reviewed_by_name', 'Manager Ana');
        $afterRes->assertJsonPath('0.reviewed_by_role', 'admin');
    }

    public function test_guest_customer_can_lookup_bookings_by_device_ids_or_phone(): void
    {
        $futureDate = now()->addDays(5)->toDateString();

        $booking = EventBooking::create([
            'client_name' => 'Guest Client',
            'client_phone' => '09181112233',
            'event_type' => 'Fruity Float Package (₱3,500 / 50 pax)',
            'event_date' => $futureDate,
            'event_time' => '3:00 PM',
            'guest_count' => 50,
            'location' => 'Sinalhan, Santa Rosa',
            'package_name' => 'Fruity Float Package',
            'estimated_cost' => 3500,
            'status' => 'Approved',
            'reviewed_by_name' => 'Staff Leo',
            'reviewed_by_role' => 'staff',
            'reviewed_at' => now(),
        ]);

        // No ids or search -> empty
        $this->getJson('/api/bookings/my')->assertOk()->assertJsonCount(0);

        // By local device id
        $this->getJson("/api/bookings/my?ids={$booking->id}")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.status', 'Approved');

        // By phone lookup
        $this->getJson('/api/bookings/my?search=09181112233')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $booking->id);
    }
}