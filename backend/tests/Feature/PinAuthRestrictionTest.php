<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PinAuthRestrictionTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_staff_can_authenticate_with_four_digit_pin(): void
    {
        $staff = User::create([
            'name' => 'Staff Member',
            'email' => 'staff@test.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
            'pin' => '1234',
            'status' => 'active',
        ]);

        $admin = User::create([
            'name' => 'Admin Member',
            'email' => 'admin@test.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'pin' => '2222',
            'status' => 'active',
        ]);

        $superAdmin = User::create([
            'name' => 'Super Admin Member',
            'email' => 'superadmin@test.com',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
            'pin' => '1111',
            'status' => 'active',
        ]);

        $driver = User::create([
            'name' => 'Driver Member',
            'email' => 'driver@test.com',
            'password' => Hash::make('password123'),
            'role' => 'driver',
            'pin' => '3333',
            'status' => 'active',
        ]);

        // Staff PIN login succeeds
        $this->postJson('/api/auth/pin-switch', [
            'user_id' => $staff->id,
            'pin' => '1234',
        ])->assertStatus(200)->assertJsonPath('user.role', 'staff');

        // Admin, Super Admin, and Driver PIN logins are rejected (both with user_id and without)
        foreach ([
            [$admin->id, '2222'],
            [$superAdmin->id, '1111'],
            [$driver->id, '3333'],
        ] as [$userId, $pin]) {
            $this->postJson('/api/auth/pin-switch', [
                'user_id' => $userId,
                'pin' => $pin,
            ])->assertStatus(401);

            $this->postJson('/api/auth/pin-switch', [
                'user_id' => $staff->id,
                'pin' => $pin,
            ])->assertStatus(401);
        }
    }

    public function test_pin_is_only_assigned_for_staff_and_cleared_on_role_change(): void
    {
        $admin = User::create([
            'name' => 'Admin Actor',
            'email' => 'actor@test.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->actingAs($admin, 'sanctum');

        $staffRes = $this->postJson('/api/users', [
            'name' => 'New Barista',
            'email' => 'barista@test.com',
            'password' => 'password123',
            'role' => 'staff',
            'pin' => '5678',
        ])->assertStatus(201);
        $this->assertSame('5678', $staffRes->json('user.pin'));

        $driverRes = $this->postJson('/api/users', [
            'name' => 'New Rider',
            'email' => 'rider@test.com',
            'password' => 'password123',
            'role' => 'driver',
            'pin' => '9999',
        ])->assertStatus(201);
        $this->assertNull($driverRes->json('user.pin'));

        $adminRes = $this->postJson('/api/users', [
            'name' => 'New Admin',
            'email' => 'newadmin@test.com',
            'password' => 'password123',
            'role' => 'admin',
            'pin' => '8888',
        ])->assertStatus(201);
        $this->assertNull($adminRes->json('user.pin'));

        // Promoting staff to admin clears their PIN
        $staffId = $staffRes->json('user.id');
        $promoteRes = $this->patchJson("/api/users/{$staffId}", [
            'role' => 'admin',
        ])->assertStatus(200);
        $this->assertNull($promoteRes->json('user.pin'));
    }
}
