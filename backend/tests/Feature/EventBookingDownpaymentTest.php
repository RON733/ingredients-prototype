<?php

namespace Tests\Feature;

use App\Models\EventBooking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventBookingDownpaymentTest extends TestCase
{
    use RefreshDatabase;

    private function samplePngDataUrl(): string
    {
        // Valid 1x1 transparent PNG
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    }

    public function test_option_a_full_downpayment_lifecycle_from_pending_to_completed(): void
    {
        $customer = User::factory()->create([
            'name' => 'Maria Client',
            'email' => 'maria@example.com',
            'phone' => '09171234567',
            'role' => 'customer',
        ]);

        $admin = User::factory()->create([
            'name' => 'Owner Jeff',
            'email' => 'jeff@example.com',
            'role' => 'admin',
        ]);

        $futureDate = now('Asia/Manila')->addDays(14)->toDateString();

        // 1. Customer submits booking -> Pending
        Sanctum::actingAs($customer);
        $createRes = $this->postJson('/api/bookings', [
            'client_name' => 'Maria Client',
            'client_phone' => '09171234567',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $futureDate,
            'event_time' => '2:00 PM - 5:00 PM',
            'guest_count' => 50,
            'location' => 'Nuvali Clubhouse, Santa Rosa',
        ]);
        $createRes->assertStatus(201)
            ->assertJsonPath('booking.status', 'Pending')
            ->assertJsonPath('booking.payment_status', 'Unpaid');

        $bookingId = $createRes->json('booking.id');

        // 2. Admin approves booking -> Approved (Discussion phase, payment still locked)
        Sanctum::actingAs($admin);
        $this->patchJson("/api/bookings/{$bookingId}/status", [
            'status' => 'Approved',
        ])->assertOk()
          ->assertJsonPath('booking.status', 'Approved')
          ->assertJsonPath('booking.payment_status', 'Unpaid');

        // Customer cannot submit downpayment while still in Approved (Option A)
        Sanctum::actingAs($customer);
        $this->postJson("/api/bookings/{$bookingId}/submit-downpayment", [
            'payment_method' => 'GCash',
            'payment_reference' => 'GCASH123456',
            'payment_proof' => $this->samplePngDataUrl(),
        ])->assertStatus(422);

        // 3. After discussion, Admin updates final price (+500 transport fee = 4000) and requests 50% DP (2000)
        Sanctum::actingAs($admin);
        $reqDpRes = $this->postJson("/api/bookings/{$bookingId}/request-downpayment", [
            'final_cost' => 4000,
            'downpayment_percentage' => 50,
            'deadline_hours' => 48,
            'payment_notes' => 'Includes ₱500 transport fee to Nuvali.',
        ]);
        $reqDpRes->assertOk()
            ->assertJsonPath('booking.status', 'Awaiting Downpayment')
            ->assertJsonPath('booking.payment_status', 'Requested');
        $this->assertEquals(4000, (float) $reqDpRes->json('booking.final_cost'));
        $this->assertEquals(2000, (float) $reqDpRes->json('booking.downpayment_amount'));
        $this->assertEquals(4000, (float) $reqDpRes->json('booking.remaining_balance'));

        // 4. Customer submits downpayment proof
        Sanctum::actingAs($customer);
        $submitRes = $this->postJson("/api/bookings/{$bookingId}/submit-downpayment", [
            'payment_method' => 'GCash',
            'payment_reference' => 'GCASH-99887766',
            'payment_proof' => $this->samplePngDataUrl(),
        ]);
        $submitRes->assertOk()
            ->assertJsonPath('booking.status', 'Downpayment Submitted')
            ->assertJsonPath('booking.payment_status', 'For Verification');

        // 5. Admin verifies downpayment -> Confirmed (slot locked, balance = 2000)
        Sanctum::actingAs($admin);
        $verifyRes = $this->postJson("/api/bookings/{$bookingId}/verify-downpayment");
        $verifyRes->assertOk()
            ->assertJsonPath('booking.status', 'Confirmed')
            ->assertJsonPath('booking.payment_status', 'Downpayment Paid');
        $this->assertEquals(2000, (float) $verifyRes->json('booking.amount_paid'));
        $this->assertEquals(2000, (float) $verifyRes->json('booking.remaining_balance'));

        // 6. Event day: Admin completes & settles remaining balance
        $completeRes = $this->postJson("/api/bookings/{$bookingId}/complete", [
            'final_payment_method' => 'Cash',
        ]);
        $completeRes->assertOk()
            ->assertJsonPath('booking.status', 'Completed')
            ->assertJsonPath('booking.payment_status', 'Fully Paid');
        $this->assertEquals(4000, (float) $completeRes->json('booking.amount_paid'));
        $this->assertEquals(0, (float) $completeRes->json('booking.remaining_balance'));
    }

    public function test_anti_loophole_guards_prevent_bypass_idor_fake_images_and_duplicate_refs(): void
    {
        $owner = User::factory()->create(['role' => 'customer', 'phone' => '09171112222']);
        $stranger = User::factory()->create(['role' => 'customer', 'phone' => '09179998888']);
        $staff = User::factory()->create(['role' => 'staff', 'name' => 'Staff Ace']);

        $futureDate = now('Asia/Manila')->addDays(16)->toDateString();

        $booking = EventBooking::create([
            'user_id' => $owner->id,
            'client_name' => 'Owner Client',
            'client_phone' => '09171112222',
            'event_type' => 'Coffee Package (₱3,500 / 50 pax)',
            'event_date' => $futureDate,
            'event_time' => '2:00 PM – 5:00 PM (3 Hours)',
            'guest_count' => 50,
            'location' => 'Santa Rosa, Laguna',
            'package_name' => 'Coffee Package',
            'estimated_cost' => 3500,
            'final_cost' => 3500,
            'remaining_balance' => 3500,
            'status' => 'Pending',
        ]);

        // Unauthenticated caller cannot request/verify/complete
        $this->postJson("/api/bookings/{$booking->id}/request-downpayment", [
            'final_cost' => 3500,
            'downpayment_percentage' => 50,
        ])->assertStatus(401);

        // Customer cannot request or verify downpayment
        Sanctum::actingAs($owner);
        $this->postJson("/api/bookings/{$booking->id}/request-downpayment", [
            'final_cost' => 3500,
            'downpayment_percentage' => 50,
        ])->assertStatus(403);

        // Staff cannot skip Pending -> Awaiting Downpayment / Confirmed / Completed
        Sanctum::actingAs($staff);
        $this->postJson("/api/bookings/{$booking->id}/request-downpayment", [
            'final_cost' => 3500,
            'downpayment_percentage' => 50,
        ])->assertStatus(422);

        $this->patchJson("/api/bookings/{$booking->id}/status", [
            'status' => 'Confirmed',
        ])->assertStatus(422);

        $this->patchJson("/api/bookings/{$booking->id}/status", [
            'status' => 'Completed',
        ])->assertStatus(422);

        // Approve -> Request DP
        $this->patchJson("/api/bookings/{$booking->id}/status", ['status' => 'Approved'])->assertOk();
        $this->postJson("/api/bookings/{$booking->id}/request-downpayment", [
            'final_cost' => 3500,
            'downpayment_percentage' => 50,
        ])->assertOk();

        // Active Awaiting Downpayment slot blocks conflicting new bookings
        $this->postJson('/api/bookings', [
            'client_name' => 'Conflict Booker',
            'client_phone' => '09173334444',
            'event_type' => 'Coffee Package',
            'event_date' => $futureDate,
            'event_time' => '3:00 PM - 6:00 PM',
            'guest_count' => 50,
            'location' => 'Clubhouse',
        ])->assertStatus(422)->assertJsonPath('reason', 'time_conflict');

        // IDOR check: Stranger cannot submit downpayment for owner's booking
        Sanctum::actingAs($stranger);
        $this->postJson("/api/bookings/{$booking->id}/submit-downpayment", [
            'payment_method' => 'GCash',
            'payment_reference' => 'STRANGER1234',
            'payment_proof' => $this->samplePngDataUrl(),
        ])->assertStatus(403);

        // Fake / malicious non-image data URL rejected
        Sanctum::actingAs($owner);
        $this->postJson("/api/bookings/{$booking->id}/submit-downpayment", [
            'payment_method' => 'GCash',
            'payment_reference' => 'VALIDREF123',
            'payment_proof' => 'data:image/png;base64,' . base64_encode('<script>alert(1)</script>'),
        ])->assertStatus(422);

        // Valid submission succeeds
        $this->postJson("/api/bookings/{$booking->id}/submit-downpayment", [
            'payment_method' => 'GCash',
            'payment_reference' => 'REF-UNIQUE-777',
            'payment_proof' => $this->samplePngDataUrl(),
        ])->assertOk();

        // Duplicate reference on another booking is blocked
        $booking2 = EventBooking::create([
            'user_id' => $stranger->id,
            'client_name' => 'Second Client',
            'client_phone' => '09179998888',
            'event_type' => 'Coffee Package',
            'event_date' => now('Asia/Manila')->addDays(20)->toDateString(),
            'event_time' => '2:00 PM – 5:00 PM (3 Hours)',
            'guest_count' => 50,
            'location' => 'Santa Rosa',
            'estimated_cost' => 3500,
            'final_cost' => 3500,
            'downpayment_amount' => 1750,
            'remaining_balance' => 3500,
            'status' => 'Awaiting Downpayment',
            'payment_status' => 'Requested',
        ]);

        Sanctum::actingAs($stranger);
        $this->postJson("/api/bookings/{$booking2->id}/submit-downpayment", [
            'payment_method' => 'GCash',
            'payment_reference' => 'ref-unique-777',
            'payment_proof' => $this->samplePngDataUrl(),
        ])->assertStatus(422)->assertJsonValidationErrors(['payment_reference']);
    }

    public function test_rejection_and_reupload_and_confirmed_price_adjustment(): void
    {
        $owner = User::factory()->create(['role' => 'customer', 'phone' => '09174445555']);
        $admin = User::factory()->create(['role' => 'admin', 'name' => 'Admin Boss']);

        $booking = EventBooking::create([
            'user_id' => $owner->id,
            'client_name' => 'Reupload Client',
            'client_phone' => '09174445555',
            'event_type' => 'Coffee Package',
            'event_date' => now('Asia/Manila')->addDays(18)->toDateString(),
            'event_time' => '2:00 PM – 5:00 PM (3 Hours)',
            'guest_count' => 50,
            'location' => 'Santa Rosa',
            'estimated_cost' => 3500,
            'final_cost' => 3500,
            'downpayment_percentage' => 50,
            'downpayment_amount' => 1750,
            'remaining_balance' => 3500,
            'status' => 'Awaiting Downpayment',
            'payment_status' => 'Requested',
        ]);

        Sanctum::actingAs($owner);
        $this->postJson("/api/bookings/{$booking->id}/submit-downpayment", [
            'payment_method' => 'Maya',
            'payment_reference' => 'MAYA-BAD-111',
            'payment_proof' => $this->samplePngDataUrl(),
        ])->assertOk();

        // Admin rejects without valid reason -> 422
        Sanctum::actingAs($admin);
        $this->postJson("/api/bookings/{$booking->id}/reject-downpayment", [
            'rejection_reason' => 'No',
        ])->assertStatus(422);

        // Cannot modify price while Downpayment Submitted
        $this->patchJson("/api/bookings/{$booking->id}", [
            'final_cost' => 4000,
        ])->assertStatus(422);

        // Admin rejects with clear reason -> back to Awaiting Downpayment
        $this->postJson("/api/bookings/{$booking->id}/reject-downpayment", [
            'rejection_reason' => 'Reference number is unreadable in screenshot.',
        ])->assertOk()
          ->assertJsonPath('booking.status', 'Awaiting Downpayment')
          ->assertJsonPath('booking.payment_status', 'Rejected');

        // Client re-uploads via multipart file upload
        Sanctum::actingAs($owner);
        $pngBytes = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=');
        $tmpPath = storage_path('framework/receipt_test.png');
        file_put_contents($tmpPath, $pngBytes);
        $tmpFile = new UploadedFile($tmpPath, 'receipt.png', 'image/png', null, true);

        try {
            $this->post("/api/bookings/{$booking->id}/submit-downpayment", [
                'payment_method' => 'Maya',
                'payment_reference' => 'MAYA-GOOD-222',
                'payment_proof_file' => $tmpFile,
            ], ['Accept' => 'application/json'])->assertOk()
              ->assertJsonPath('booking.status', 'Downpayment Submitted');
        } finally {
            @unlink($tmpPath);
        }

        // Admin verifies
        Sanctum::actingAs($admin);
        $this->postJson("/api/bookings/{$booking->id}/verify-downpayment")->assertOk();

        // Cannot lower final_cost below already-paid 1750
        $this->patchJson("/api/bookings/{$booking->id}", [
            'final_cost' => 1500,
        ])->assertStatus(422);

        // Increasing final_cost to 4500 recalculates remaining_balance = 4500 - 1750 = 2750
        $adjRes = $this->patchJson("/api/bookings/{$booking->id}", [
            'final_cost' => 4500,
        ]);
        $adjRes->assertOk();
        $this->assertEquals(2750, (float) $adjRes->json('booking.remaining_balance'));

        // Non-cash completion requires reference number
        $this->postJson("/api/bookings/{$booking->id}/complete", [
            'final_payment_method' => 'GCash',
        ])->assertStatus(422);

        // With reference number, completes cleanly
        $this->postJson("/api/bookings/{$booking->id}/complete", [
            'final_payment_method' => 'GCash',
            'final_payment_reference' => 'FINAL-GCASH-555',
        ])->assertOk()
          ->assertJsonPath('booking.status', 'Completed')
          ->assertJsonPath('booking.payment_status', 'Fully Paid');
    }
}