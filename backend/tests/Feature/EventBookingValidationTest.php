<?php

namespace Tests\Feature;

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
}
