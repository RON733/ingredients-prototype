<?php

namespace Tests\Feature;

use App\Models\BookingPackage;
use App\Models\EventBooking;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventBookingValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_rejects_excessive_guest_count_invalid_phone_short_fields_and_overlong_fields(): void
    {
        $futureDate = now('Asia/Manila')->addDays(7)->toDateString();

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
            'client_name' => 'A',
            'client_phone' => '09123456789',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $futureDate,
            'guest_count' => 50,
            'location' => 'Santa Rosa, Laguna',
        ])->assertStatus(422)->assertJsonValidationErrors(['client_name']);

        $this->postJson('/api/bookings', [
            'client_name' => 'Test Client',
            'client_phone' => '09123456789',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $futureDate,
            'guest_count' => 50,
            'location' => 'Home',
        ])->assertStatus(422)->assertJsonValidationErrors(['location']);

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
        $futureDate = now('Asia/Manila')->addDays(7)->toDateString();

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

    public function test_occupied_date_enforces_2_hour_prep_buffer_and_blocks_conflicts(): void
    {
        $targetDate = now('Asia/Manila')->addDays(14)->toDateString();

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

        // Availability endpoint exposes slot + 2h buffer without PII
        $availRes = $this->getJson("/api/bookings/availability?date={$targetDate}");
        $availRes->assertOk()
            ->assertJsonPath('date', $targetDate)
            ->assertJsonPath('is_occupied', true)
            ->assertJsonPath('occupied_count', 1)
            ->assertJsonPath('occupied_slots.0.start_minutes', 840)
            ->assertJsonPath('occupied_slots.0.end_minutes', 1020)
            ->assertJsonPath('occupied_slots.0.buffer_start_minutes', 720)
            ->assertJsonPath('occupied_slots.0.buffer_end_minutes', 1140)
            ->assertJsonMissing(['client_name' => 'Secret Client'])
            ->assertJsonMissing(['client_phone' => '09170001111']);

        // Overlapping custom typed time (15:00 - 18:00 = 3:00 PM - 6:00 PM) is rejected
        $this->postJson('/api/bookings', [
            'client_name' => 'Another Client',
            'client_phone' => '09172223333',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '15:00 - 18:00',
            'guest_count' => 50,
            'location' => 'Clubhouse',
        ])->assertStatus(422)
          ->assertJsonPath('reason', 'time_conflict')
          ->assertJsonValidationErrors(['event_time']);

        // Back-to-back without 2h prep buffer (5:00 PM - 8:00 PM) is rejected
        $this->postJson('/api/bookings', [
            'client_name' => 'BackToBack Client',
            'client_phone' => '09172224444',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '17:00 - 20:00',
            'guest_count' => 50,
            'location' => 'Clubhouse',
        ])->assertStatus(422)
          ->assertJsonPath('reason', 'prep_buffer_conflict')
          ->assertJsonValidationErrors(['event_time']);

        // Ending within 2h before 2:00 PM (11:00 AM - 2:00 PM) is rejected
        $this->postJson('/api/bookings', [
            'client_name' => 'TooCloseMorning Client',
            'client_phone' => '09172225555',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '11:00 AM - 2:00 PM',
            'guest_count' => 50,
            'location' => 'Clubhouse',
        ])->assertStatus(422)
          ->assertJsonPath('reason', 'prep_buffer_conflict');

        // 9:00 AM - 12:00 PM leaves full 2h prep buffer before 2:00 PM -> succeeds
        $this->postJson('/api/bookings', [
            'client_name' => 'Morning Client',
            'client_phone' => '09174445555',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '9:00 AM - 12:00 PM',
            'guest_count' => 50,
            'location' => 'Tagaytay Hall',
        ])->assertStatus(201)
          ->assertJsonPath('booking.event_time', '9:00 AM – 12:00 PM (3 Hours)');

        // 7:00 PM - 10:00 PM leaves full 2h turnaround buffer after 5:00 PM -> succeeds
        $this->postJson('/api/bookings', [
            'client_name' => 'Evening Client',
            'client_phone' => '09176667777',
            'event_type' => 'Fruity Float Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '19:00 - 22:00',
            'guest_count' => 50,
            'location' => 'Nuvali Pavilion',
        ])->assertStatus(201)
          ->assertJsonPath('booking.event_time', '7:00 PM – 10:00 PM (3 Hours)');
    }

    public function test_same_day_requires_2_hour_prep_and_blocks_8pm_to_12am_and_late_evening_bookings(): void
    {
        // Case 1: At 2:00 PM today
        Carbon::setTestNow(Carbon::create(2026, 11, 16, 14, 0, 0, 'Asia/Manila'));
        try {
            // 1:00 PM - 4:00 PM already started -> past_time
            $this->postJson('/api/bookings', [
                'client_name' => 'Past Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-16',
                'event_time' => '1:00 PM - 4:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(422)->assertJsonPath('reason', 'past_time');

            // 3:00 PM - 6:00 PM is only 1h away -> blocked by 2h prep time
            $this->postJson('/api/bookings', [
                'client_name' => 'ShortNotice Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-16',
                'event_time' => '3:00 PM - 6:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(422)->assertJsonPath('reason', 'prep_time');

            // 8:00 PM - 11:00 PM today -> blocked by same-day 8 PM - 12 AM cutoff
            $this->postJson('/api/bookings', [
                'client_name' => 'NightToday Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-16',
                'event_time' => '8:00 PM - 11:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(422)->assertJsonPath('reason', 'same_day_night_cutoff');

            // 8:00 PM - 12:00 AM today -> blocked by same-day 8 PM - 12 AM cutoff
            $this->postJson('/api/bookings', [
                'client_name' => 'MidnightToday Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-16',
                'event_time' => '8:00 PM - 12:00 AM',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(422)->assertJsonPath('reason', 'same_day_night_cutoff');

            // 7:30 PM - 10:30 PM today extends past 10:00 PM -> blocked
            $this->postJson('/api/bookings', [
                'client_name' => 'SpillNight Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-16',
                'event_time' => '7:30 PM - 10:30 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(422)->assertJsonPath('reason', 'same_day_night_cutoff');

            // 4:00 PM - 7:00 PM today (exact 2h prep, ends before 8 PM) -> allowed
            $this->postJson('/api/bookings', [
                'client_name' => 'ValidSameDay Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-16',
                'event_time' => '4:00 PM - 7:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(201);

            // Future date (tomorrow) CAN book 8:00 PM - 11:00 PM -> allowed
            $this->postJson('/api/bookings', [
                'client_name' => 'FutureNight Client',
                'client_phone' => '09179998888',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-17',
                'event_time' => '8:00 PM - 11:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(201);
        } finally {
            Carbon::setTestNow();
        }

        // Case 2: At 6:00 PM today (evening / mag-gagabi na), same-day bookings are completely closed
        Carbon::setTestNow(Carbon::create(2026, 11, 16, 18, 0, 0, 'Asia/Manila'));
        try {
            $this->getJson('/api/bookings/availability')
                ->assertOk()
                ->assertJsonPath('same_day_closed', true);

            $this->postJson('/api/bookings', [
                'client_name' => 'EveningSameDay Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-16',
                'event_time' => '8:00 PM - 11:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(422)->assertJsonPath('reason', 'same_day_closed');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_manila_midnight_boundary_and_service_hours_and_max_advance_days(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 11, 17, 1, 30, 0, 'Asia/Manila'));
        try {
            $this->getJson('/api/bookings/availability')
                ->assertOk()
                ->assertJsonPath('server_date', '2026-11-17')
                ->assertJsonPath('server_minutes', 90);

            // Yesterday in Manila
            $this->postJson('/api/bookings', [
                'client_name' => 'Past Manila Day',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-16',
                'event_time' => '6:00 PM - 9:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa',
            ])->assertStatus(422)->assertJsonPath('reason', 'past_date');

            // Unreasonable 3:00 AM start time -> rejected by service_hours
            $this->postJson('/api/bookings', [
                'client_name' => 'TooEarly Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-18',
                'event_time' => '3:00 AM - 6:00 AM',
                'guest_count' => 50,
                'location' => 'Santa Rosa',
            ])->assertStatus(422)->assertJsonPath('reason', 'service_hours');

            // Under 2 hours duration (1 hour) -> rejected
            $this->postJson('/api/bookings', [
                'client_name' => 'TooShort Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2026-11-18',
                'event_time' => '2:00 PM - 3:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa',
            ])->assertStatus(422)->assertJsonValidationErrors(['event_time']);

            // Over 1 year ahead -> rejected
            $this->postJson('/api/bookings', [
                'client_name' => 'FarFuture Client',
                'client_phone' => '09171234567',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => '2028-01-01',
                'event_time' => '2:00 PM - 5:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa',
            ])->assertStatus(422)->assertJsonPath('reason', 'too_far');

            // Valid 9:00 AM - 12:00 PM today
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

    public function test_declined_booking_does_not_block_date_and_unrecognizable_time_is_rejected(): void
    {
        $targetDate = now('Asia/Manila')->addDays(20)->toDateString();

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

        $this->postJson('/api/bookings', [
            'client_name' => 'Vague Client',
            'client_phone' => '09171112222',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => 'sometime afternoon',
            'guest_count' => 50,
            'location' => 'Test Venue',
        ])->assertStatus(422)->assertJsonValidationErrors(['event_time']);

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

    public function test_admin_update_and_status_approval_prevent_time_conflicts_and_tbd_on_active(): void
    {
        $targetDate = now('Asia/Manila')->addDays(12)->toDateString();

        EventBooking::create([
            'client_name' => 'Occupied Slot',
            'client_phone' => '09170001111',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '2:00 PM – 5:00 PM (3 Hours)',
            'guest_count' => 50,
            'location' => 'Hall A, Santa Rosa',
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
            'location' => 'Hall B, Santa Rosa',
            'package_name' => 'Coffee Package',
            'estimated_cost' => 3500,
            'status' => 'Pending',
        ]);

        $declinedBufferConflict = EventBooking::create([
            'client_name' => 'Previously Declined',
            'client_phone' => '09170003333',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $targetDate,
            'event_time' => '5:00 PM – 8:00 PM (3 Hours)',
            'guest_count' => 50,
            'location' => 'Hall C, Santa Rosa',
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

        // Admin cannot re-approve declinedBufferConflict (5-8 PM violates 2h buffer after 2-5 PM)
        $this->patchJson("/api/bookings/{$declinedBufferConflict->id}/status", [
            'status' => 'Approved',
        ])->assertStatus(422)->assertJsonPath('reason', 'prep_buffer_conflict');

        // Non-conflicting morningBooking approval succeeds (9 AM - 12 PM has 2h gap before 2 PM)
        $this->patchJson("/api/bookings/{$morningBooking->id}/status", [
            'status' => 'Approved',
        ])->assertOk()->assertJsonPath('booking.status', 'Approved');
    }

    public function test_overnight_booking_with_2h_buffer_prevents_next_day_morning_overlap(): void
    {
        $day1 = now('Asia/Manila')->addDays(15)->toDateString();
        $day2 = now('Asia/Manila')->addDays(16)->toDateString();

        // 10:00 PM - 6:00 AM (8 hours) + 2h turnaround buffer = blocked until 8:00 AM on day2
        $this->postJson('/api/bookings', [
            'client_name' => 'Overnight Gala',
            'client_phone' => '09171110000',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $day1,
            'event_time' => '10:00 PM - 6:00 AM',
            'guest_count' => 50,
            'location' => 'Clubhouse',
        ])->assertStatus(201);

        $this->getJson("/api/bookings/availability?date={$day2}")
            ->assertOk()
            ->assertJsonPath('is_occupied', true)
            ->assertJsonPath('occupied_slots.0.buffer_end_minutes', 480);

        // 7:00 AM - 10:00 AM on day2 violates 2h buffer ending at 8:00 AM -> rejected
        $this->postJson('/api/bookings', [
            'client_name' => 'Early Overlap',
            'client_phone' => '09172220000',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $day2,
            'event_time' => '7:00 AM - 10:00 AM',
            'guest_count' => 50,
            'location' => 'Clubhouse',
        ])->assertStatus(422)->assertJsonPath('reason', 'prep_buffer_conflict');

        // 8:00 AM - 11:00 AM starts right after 2h turnaround buffer -> allowed
        $this->postJson('/api/bookings', [
            'client_name' => 'After Turnaround',
            'client_phone' => '09173330000',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $day2,
            'event_time' => '8:00 AM - 11:00 AM',
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
            'event_date' => now('Asia/Manila')->addDays(9)->toDateString(),
            'event_time' => '2:00 PM - 5:00 PM',
            'guest_count' => 50,
            'location' => 'Santa Rosa, Laguna',
        ])->assertStatus(422)->assertJsonValidationErrors(['booking_package_id']);
    }

    public function test_customer_pending_booking_limit_and_cancel_releases_slot(): void
    {
        $baseDate = now('Asia/Manila')->addDays(21);
        $ids = [];

        for ($i = 0; $i < 3; $i++) {
            $res = $this->postJson('/api/bookings', [
                'client_name' => 'Repeat Booker',
                'client_phone' => '09175551234',
                'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
                'event_date' => $baseDate->copy()->addDays($i)->toDateString(),
                'event_time' => '2:00 PM - 5:00 PM',
                'guest_count' => 50,
                'location' => 'Santa Rosa, Laguna',
            ])->assertStatus(201);
            $ids[] = $res->json('booking.id');
        }

        // 4th pending booking by same customer is blocked
        $this->postJson('/api/bookings', [
            'client_name' => 'Repeat Booker',
            'client_phone' => '09175551234',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $baseDate->copy()->addDays(4)->toDateString(),
            'event_time' => '2:00 PM - 5:00 PM',
            'guest_count' => 50,
            'location' => 'Santa Rosa, Laguna',
        ])->assertStatus(422)->assertJsonPath('reason', 'pending_limit');

        // Stranger with wrong phone cannot cancel
        $this->postJson("/api/bookings/{$ids[0]}/cancel", [
            'client_phone' => '09179999999',
        ])->assertStatus(403);

        // Matching phone cancels Pending booking -> frees pending quota & slot
        $this->postJson("/api/bookings/{$ids[0]}/cancel", [
            'client_phone' => '09175551234',
        ])->assertOk()->assertJsonPath('booking.status', 'Cancelled');

        // Slot on first date can now be rebooked
        $secondRes = $this->postJson('/api/bookings', [
            'client_name' => 'Rebooker',
            'client_phone' => '09176661234',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $baseDate->toDateString(),
            'event_time' => '2:00 PM - 5:00 PM',
            'guest_count' => 50,
            'location' => 'Santa Rosa, Laguna',
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
