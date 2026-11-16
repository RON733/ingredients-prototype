<?php

namespace Tests\Feature;

use App\Models\BookingPackage;
use App\Models\EventBooking;
use App\Models\User;
use Carbon\Carbon;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventBookingValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_rejects_excessive_guest_count_invalid_phone_and_overlong_fields(): void
    {
        $futureDate = now()->addDays(7)->toDateString();

        $this->postJson('/api/bookings', [
            'client_name' => 'Test Client',
            'client_phone' => '09123456789',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $futureDate,
            'guest_count' => 501,
            'location' => 'Santa Rosa, Laguna',
        ])->assertStatus(422)->assertJsonValidationErrors(['guest_count']);

        $this->postJson('/api/bookings', [
            'client_name' => 'Test Client',
            'client_phone' => '09123456789',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $futureDate,
            'guest_count' => 9,
            'location' => 'Santa Rosa, Laguna',
        ])->assertStatus(422)->assertJsonValidationErrors(['guest_count']);

        $this->postJson('/api/bookings', [
            'client_name' => 'Test Client',
            'client_phone' => 'q12222daaaaaaaaa',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $futureDate,
            'guest_count' => 50,
            'location' => 'Santa Rosa, Laguna',
        ])->assertStatus(422);

        $this->postJson('/api/bookings', [
            'client_name' => 'Test Client',
            'client_phone' => '09123456789',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $futureDate,
            'guest_count' => 50,
            'location' => str_repeat('a', 201),
            'notes' => str_repeat('a', 501),
        ])->assertStatus(422)->assertJsonValidationErrors(['location', 'notes']);
    }

    public function test_valid_booking_succeeds_and_computes_server_estimated_cost(): void
    {
        $futureDate = now()->addDays(7)->toDateString();

        $response = $this->postJson('/api/bookings', [
            'client_name' => 'Maria Clara',
            'client_phone' => '09171234567',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $futureDate,
            'event_time' => '2:00 PM – 5:00 PM (3 Hours)',
            'guest_count' => 120,
            'location' => 'Clubhouse, Santa Rosa, Laguna',
            'estimated_cost' => 99999,
            'notes' => 'Less ice please',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('booking.guest_count', 120);

        $this->assertEquals(10500, (float) $response->json('booking.estimated_cost'));
    }

    public function test_occupied_date_allows_different_time_but_blocks_conflicting_time(): void
    {
        $targetDate = now()->addDays(14)->toDateString();

        EventBooking::create([
            'client_name' => 'Secret Client',
            'client_phone' => '09170001111',
            'client_email' => 'secret@example.com',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '2:00 PM – 5:00 PM (3 Hours)',
            'guest_count' => 50,
            'location' => 'Private Residence',
            'package_name' => 'Coffee Package',
            'estimated_cost' => 3500,
            'status' => 'Approved',
        ]);

        // Availability endpoint notifies date is occupied with non-PII slot details
        $availRes = $this->getJson("/api/bookings/availability?date={$targetDate}");
        $availRes->assertOk()
            ->assertJsonPath('date', $targetDate)
            ->assertJsonPath('is_occupied', true)
            ->assertJsonPath('occupied_count', 1)
            ->assertJsonPath('occupied_slots.0.start_minutes', 840)
            ->assertJsonPath('occupied_slots.0.end_minutes', 1020)
            ->assertJsonMissing(['client_name' => 'Secret Client'])
            ->assertJsonMissing(['client_phone' => '09170001111']);

        // Overlapping custom typed time (15:00 - 18:00 = 3:00 PM - 6:00 PM) is rejected
        $conflictRes = $this->postJson('/api/bookings', [
            'client_name' => 'Another Client',
            'client_phone' => '09172223333',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '15:00 - 18:00',
            'guest_count' => 50,
            'location' => 'Clubhouse',
        ]);
        $conflictRes->assertStatus(422)
            ->assertJsonValidationErrors(['event_time']);

        // Exact same time slot is rejected
        $this->postJson('/api/bookings', [
            'client_name' => 'Another Client',
            'client_phone' => '09172223333',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '2pm to 5pm',
            'guest_count' => 50,
            'location' => 'Clubhouse',
        ])->assertStatus(422)->assertJsonValidationErrors(['event_time']);

        // Different non-overlapping time on the same date (9:00 AM - 12:00 PM) succeeds
        $nonConflictRes = $this->postJson('/api/bookings', [
            'client_name' => 'Morning Client',
            'client_phone' => '09174445555',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '9:00 AM - 12:00 PM',
            'guest_count' => 50,
            'location' => 'Tagaytay Hall',
        ]);
        $nonConflictRes->assertStatus(201)
            ->assertJsonPath('booking.event_time', '9:00 AM – 12:00 PM (3 Hours)');

        // Back-to-back after 5:00 PM (5:00 PM - 8:00 PM) also succeeds
        $eveningRes = $this->postJson('/api/bookings', [
            'client_name' => 'Evening Client',
            'client_phone' => '09176667777',
            'event_type' => 'Fruity Float Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '17:00 - 20:00',
            'guest_count' => 50,
            'location' => 'Nuvali Pavilion',
        ]);
        $eveningRes->assertStatus(201)
            ->assertJsonPath('booking.event_time', '5:00 PM – 8:00 PM (3 Hours)');
    }

    public function test_declined_booking_does_not_block_date_and_unrecognizable_time_is_rejected(): void
    {
        $targetDate = now()->addDays(20)->toDateString();

        EventBooking::create([
            'client_name' => 'Declined Client',
            'client_phone' => '09170009999',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '2:00 PM – 5:00 PM (3 Hours)',
            'guest_count' => 50,
            'location' => 'Test Venue',
            'package_name' => 'Coffee Package',
            'estimated_cost' => 3500,
            'status' => 'Declined',
        ]);

        // Unrecognizable text time is rejected
        $this->postJson('/api/bookings', [
            'client_name' => 'Vague Client',
            'client_phone' => '09171112222',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => 'sometime afternoon',
            'guest_count' => 50,
            'location' => 'Test Venue',
        ])->assertStatus(422)->assertJsonValidationErrors(['event_time']);

        // Same slot as Declined booking succeeds
        $this->postJson('/api/bookings', [
            'client_name' => 'New Client',
            'client_phone' => '09171112222',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '2:00 PM – 5:00 PM (3 Hours)',
            'guest_count' => 50,
            'location' => 'Test Venue',
        ])->assertStatus(201);
    }

    public function test_booking_today_blocks_already_passed_or_started_time_slots_in_manila_timezone(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 11, 16, 17, 0, 0, 'Asia/Manila'));
        try {
            // 2:00 PM - 5:00 PM has already passed at 5:00 PM
            $this->postJson('/api/bookings', [
                'client_name' => 'Late Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-16',
                'event_time' => '2:00 PM – 5:00 PM (3 Hours)',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(422)
              ->assertJsonPath('reason', 'past_time')
              ->assertJsonValidationErrors(['event_time']);

            // 3:00 PM - 6:00 PM already started at 3:00 PM
            $this->postJson('/api/bookings', [
                'client_name' => 'Late Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-16',
                'event_time' => '3:00 PM - 6:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(422)->assertJsonValidationErrors(['event_time']);

            // 5:00 PM - 8:00 PM starts at exact current minute (5:00 PM) -> blocked
            $this->postJson('/api/bookings', [
                'client_name' => 'Exact Minute Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-16',
                'event_time' => '5:00 PM - 8:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(422)->assertJsonValidationErrors(['event_time']);

            // Past date (yesterday) -> blocked
            $this->postJson('/api/bookings', [
                'client_name' => 'Yesterday Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-15',
                'event_time' => '6:00 PM - 9:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(422)
              ->assertJsonPath('reason', 'past_date')
              ->assertJsonValidationErrors(['event_date']);

            // Later today (6:00 PM - 9:00 PM) -> allowed
            $this->postJson('/api/bookings', [
                'client_name' => 'Tonight Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-16',
                'event_time' => '6:00 PM - 9:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(201);

            // Tomorrow at 2:00 PM - 5:00 PM -> allowed
            $this->postJson('/api/bookings', [
                'client_name' => 'Tomorrow Client',
                'client_phone' => '09179998888',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-17',
                'event_time' => '2:00 PM - 5:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(201);
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_manila_midnight_boundary_does_not_fall_back_to_utc_yesterday(): void
    {
        // 1:30 AM Manila on Nov 17 is 5:30 PM UTC on Nov 16
        Carbon::setTestNow(Carbon::create(2026, 11, 17, 1, 30, 0, 'Asia/Manila'));
        try {
            $this->getJson('/api/bookings/availability')
                ->assertOk()
                ->assertJsonPath('server_date', '2026-11-17')
                ->assertJsonPath('server_minutes', 90);

            $this->postJson('/api/bookings', [
                'client_name' => 'Past Manila Day',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-16',
                'event_time' => '6:00 PM - 9:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa',
            ])->assertStatus(422)->assertJsonPath('reason', 'past_date');

            $this->postJson('/api/bookings', [
                'client_name' => 'Morning Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-17',
                'event_time' => '9:00 AM - 12:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa',
            ])->assertStatus(201);
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_admin_update_and_status_approval_prevent_time_conflicts_and_tbd_on_active(): void
    {
        $targetDate = now()->addDays(12)->toDateString();

        EventBooking::create([
            'client_name' => 'Occupied Slot',
            'client_phone' => '09170001111',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '2:00 PM – 5:00 PM (3 Hours)',
            'guest_count' => 50,
            'location' => 'Hall A',
            'package_name' => 'Coffee Package',
            'estimated_cost' => 3500,
            'status' => 'Approved',
        ]);

        $morningBooking = EventBooking::create([
            'client_name' => 'Morning Slot',
            'client_phone' => '09170002222',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '9:00 AM – 12:00 PM (3 Hours)',
            'guest_count' => 50,
            'location' => 'Hall B',
            'package_name' => 'Coffee Package',
            'estimated_cost' => 3500,
            'status' => 'Pending',
        ]);

        $declinedConflict = EventBooking::create([
            'client_name' => 'Previously Declined',
            'client_phone' => '09170003333',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '3:00 PM – 6:00 PM (3 Hours)',
            'guest_count' => 50,
            'location' => 'Hall C',
            'package_name' => 'Coffee Package',
            'estimated_cost' => 3500,
            'status' => 'Declined',
        ]);

        $staff = User::factory()->create(['role' => 'admin', 'name' => 'Admin Test']);
        Sanctum::actingAs($staff);

        // Admin cannot move morningBooking into conflicting 2:00 PM - 5:00 PM
        $this->patchJson("/api/bookings/{$morningBooking->id}", [
            'event_time' => '2:00 PM - 5:00 PM',
        ])->assertStatus(422)->assertJsonValidationErrors(['event_time']);

        // Admin cannot clear event_time to TBD on active booking
        $this->patchJson("/api/bookings/{$morningBooking->id}", [
            'event_time' => 'TBD',
        ])->assertStatus(422)->assertJsonValidationErrors(['event_time']);

        // Admin cannot re-approve declinedConflict because it overlaps Approved 2-5 PM
        $this->patchJson("/api/bookings/{$declinedConflict->id}/status", [
            'status' => 'Approved',
        ])->assertStatus(422);

        // Non-conflicting morningBooking approval succeeds
        $this->patchJson("/api/bookings/{$morningBooking->id}/status", [
            'status' => 'Approved',
        ])->assertOk()->assertJsonPath('booking.status', 'Approved');
    }

    public function test_overnight_booking_prevents_next_day_early_morning_overlap(): void
    {
        $day1 = now()->addDays(15)->toDateString();
        $day2 = now()->addDays(16)->toDateString();

        $this->postJson('/api/bookings', [
            'client_name' => 'Night Party',
            'client_phone' => '09171110000',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $day1,
            'event_time' => '10:00 PM - 1:00 AM',
            'guest_count' => 50,
            'location' => 'Clubhouse',
        ])->assertStatus(201);

        $this->getJson("/api/bookings/availability?date={$day2}")
            ->assertOk()
            ->assertJsonPath('is_occupied', true)
            ->assertJsonPath('occupied_slots.0.start_minutes', 0)
            ->assertJsonPath('occupied_slots.0.end_minutes', 60);

        // 12:30 AM - 3:30 AM overlaps the 12:00 AM - 1:00 AM overnight tail
        $this->postJson('/api/bookings', [
            'client_name' => 'Early Overlap',
            'client_phone' => '09172220000',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $day2,
            'event_time' => '12:30 AM - 3:30 AM',
            'guest_count' => 50,
            'location' => 'Clubhouse',
        ])->assertStatus(422)->assertJsonValidationErrors(['event_time']);

        // 1:00 AM - 4:00 AM starts right when overnight ends -> allowed
        $this->postJson('/api/bookings', [
            'client_name' => 'After Overnight',
            'client_phone' => '09173330000',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $day2,
            'event_time' => '1:00 AM - 4:00 AM',
            'guest_count' => 50,
            'location' => 'Clubhouse',
        ])->assertStatus(201);
    }

    public function test_inactive_booking_package_cannot_be_booked(): void
    {
        BookingPackage::seedDefaultsIfEmpty();
        $pkg = BookingPackage::first();
        $pkg->is_active = false;
        $pkg->save();

        $this->postJson('/api/bookings', [
            'client_name' => 'Test Client',
            'client_phone' => '09171234567',
            'booking_package_id' => $pkg->id,
            'event_type' => $pkg->name,
            'event_date' => now()->addDays(9)->toDateString(),
            'event_time' => '2:00 PM - 5:00 PM',
            'guest_count' => 50,
            'location' => 'Santa Rosa',
        ])->assertStatus(422)->assertJsonValidationErrors(['booking_package_id']);
    }

    public function test_customer_can_cancel_pending_booking_and_release_slot(): void
    {
        $targetDate = now()->addDays(18)->toDateString();

        $createRes = $this->postJson('/api/bookings', [
            'client_name' => 'Cancel Tester',
            'client_phone' => '09175551234',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '2:00 PM - 5:00 PM',
            'guest_count' => 50,
            'location' => 'Santa Rosa',
        ])->assertStatus(201);

        $bookingId = $createRes->json('booking.id');

        // Stranger with wrong phone cannot cancel
        $this->postJson("/api/bookings/{$bookingId}/cancel", [
            'client_phone' => '09179999999',
        ])->assertStatus(403);

        // Matching phone cancels Pending booking
        $this->postJson("/api/bookings/{$bookingId}/cancel", [
            'client_phone' => '09175551234',
        ])->assertOk()->assertJsonPath('booking.status', 'Cancelled');

        // Slot is now free for another booking
        $secondRes = $this->postJson('/api/bookings', [
            'client_name' => 'Rebooker',
            'client_phone' => '09176661234',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '2:00 PM - 5:00 PM',
            'guest_count' => 50,
            'location' => 'Santa Rosa',
        ])->assertStatus(201);

        // Approved booking cannot be cancelled online
        $secondId = $secondRes->json('booking.id');
        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);
        $this->patchJson("/api/bookings/{$secondId}/status", ['status' => 'Approved'])->assertOk();

        $this->postJson("/api/bookings/{$secondId}/cancel", [
            'client_phone' => '09176661234',
        ])->assertStatus(422);
    }
}
