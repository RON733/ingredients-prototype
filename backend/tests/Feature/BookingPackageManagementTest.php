<?php

namespace Tests\Feature;

use App\Models\BookingPackage;
use App\Models\EventBooking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingPackageManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_fetch_seeded_booking_packages_and_staff_or_admin_can_edit_them(): void
    {
        $publicRes = $this->getJson('/api/booking-packages');
        $publicRes->assertOk();
        $packages = $publicRes->json();
        $this->assertGreaterThanOrEqual(5, count($packages));

        $coffeePkg = collect($packages)->firstWhere('slug', 'coffee-package');
        $this->assertNotNull($coffeePkg);
        $this->assertEquals(3500, (float) $coffeePkg['price']);

        // Customer must not be allowed to edit booking packages
        $customer = User::factory()->create(['role' => 'customer']);
        Sanctum::actingAs($customer);
        $this->patchJson("/api/booking-packages/{$coffeePkg['id']}", [
            'price' => 100,
        ])->assertStatus(403);

        // Staff CAN edit package selection, price, picture, and description
        $staff = User::factory()->create(['name' => 'Staff Bea', 'role' => 'staff']);
        Sanctum::actingAs($staff);

        $staffUpdate = $this->patchJson("/api/booking-packages/{$coffeePkg['id']}", [
            'name' => 'Signature Coldbrew Bar',
            'price' => 4200,
            'base_pax' => 50,
            'pricing_type' => 'per_pack',
            'description' => 'Updated barista coffee setup with 6 signature blends.',
            'image_url' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'inclusions' => ['50 Cups of 12oz', '6 Signature Coffee Choices', '3 Hours Service'],
        ]);

        $staffUpdate->assertOk()
            ->assertJsonPath('package.name', 'Signature Coldbrew Bar')
            ->assertJsonPath('package.description', 'Updated barista coffee setup with 6 signature blends.');
        $this->assertEquals(4200, (float) $staffUpdate->json('package.price'));

        // Admin CAN create a new package and edit it
        $admin = User::factory()->create(['name' => 'Admin Leo', 'role' => 'admin']);
        Sanctum::actingAs($admin);

        $createRes = $this->postJson('/api/booking-packages', [
            'name' => 'Matcha & Boba Cart',
            'subtitle' => 'Ceremonial Matcha Mobile Bar',
            'badge' => '🍵 MATCHA BAR',
            'accent_color' => 'emerald',
            'price' => 5000,
            'pricing_type' => 'per_pack',
            'base_pax' => 60,
            'description' => '60 cups of Matcha and Boba drinks with 2 baristas.',
            'inclusions' => "60 Cups of 16oz\n2 Baristas\n4 Hours Service",
            'image_url' => '/assets/menu-coffee.png',
            'show_in_banner' => true,
            'is_active' => true,
        ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('package.name', 'Matcha & Boba Cart')
            ->assertJsonPath('package.base_pax', 60);
        $newPkgId = $createRes->json('package.id');

        // Booking with the edited Coffee Package uses the updated 4,200 price per 50 pax
        $futureDate = now()->addDays(7)->toDateString();
        $bookingRes = $this->postJson('/api/bookings', [
            'client_name' => 'Carlo Reyes',
            'client_phone' => '09171234567',
            'booking_package_id' => $coffeePkg['id'],
            'event_type' => 'Signature Coldbrew Bar (₱4,200 / 50 pax)',
            'package_name' => 'Signature Coldbrew Bar',
            'event_date' => $futureDate,
            'guest_count' => 100,
            'location' => 'Nuvali, Santa Rosa',
        ]);

        $bookingRes->assertStatus(201);
        $this->assertEquals(8400, (float) $bookingRes->json('booking.estimated_cost'));

        // Toggle visibility & delete created package
        $this->patchJson("/api/booking-packages/{$newPkgId}/toggle")
            ->assertOk()
            ->assertJsonPath('package.is_active', false);

        $this->deleteJson("/api/booking-packages/{$newPkgId}")->assertOk();
        $this->assertNull(BookingPackage::find($newPkgId));
    }

    public function test_staff_and_admin_can_edit_individual_event_booking_details(): void
    {
        $booking = EventBooking::create([
            'client_name' => 'Ana Santos',
            'client_phone' => '09181112233',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => now()->addDays(8)->toDateString(),
            'event_time' => '2:00 PM',
            'guest_count' => 50,
            'location' => 'Sinalhan, Santa Rosa',
            'package_name' => 'Coffee Package',
            'estimated_cost' => 3500,
            'status' => 'Pending',
        ]);

        $customer = User::factory()->create(['role' => 'customer']);
        Sanctum::actingAs($customer);
        $this->patchJson("/api/bookings/{$booking->id}", [
            'estimated_cost' => 100,
        ])->assertStatus(403);

        $staff = User::factory()->create(['name' => 'Staff Mia', 'role' => 'staff']);
        Sanctum::actingAs($staff);

        $res = $this->patchJson("/api/bookings/{$booking->id}", [
            'event_type' => 'Fruity Float Package (₱3,500 / 50 pax)',
            'package_name' => 'Fruity Float Package',
            'guest_count' => 80,
            'estimated_cost' => 6500,
            'location' => 'Paseo de Santa Rosa',
            'notes' => 'Upgraded package with custom flavor mix',
            'status' => 'Approved',
        ]);

        $res->assertOk()
            ->assertJsonPath('booking.event_type', 'Fruity Float Package (₱3,500 / 50 pax)')
            ->assertJsonPath('booking.guest_count', 80)
            ->assertJsonPath('booking.location', 'Paseo de Santa Rosa')
            ->assertJsonPath('booking.status', 'Approved')
            ->assertJsonPath('booking.reviewed_by_name', 'Staff Mia');

        $this->assertEquals(6500, (float) $res->json('booking.estimated_cost'));
    }
}