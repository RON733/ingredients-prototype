<?php

namespace Tests\Feature;

use App\Models\EventBooking;
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
}
