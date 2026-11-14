<?php

namespace Tests\Feature;

use App\Models\User;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AuthRegistrationOtpTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_rejects_weak_passwords(): void
    {
        $weakPasswords = [
            'Ab1!xyz',     // < 8 chars
            'teashop1!',   // missing uppercase
            'TEASHOP1!',   // missing lowercase
            'TeaShop!!',   // missing number
            'TeaShop12',   // missing special character
        ];

        foreach ($weakPasswords as $index => $password) {
            $response = $this->postJson('/api/auth/register', [
                'name' => 'Test Customer',
                'email' => "customer{$index}@gmail.com",
                'password' => $password,
            ]);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
        }
    }

    public function test_registration_sends_otp_and_verifies_account_with_strong_password(): void
    {
        Mail::fake();

        $email = 'newcustomer@gmail.com';

        $registerResponse = $this->postJson('/api/auth/register', [
            'name' => 'New Customer',
            'email' => $email,
            'password' => 'TeaShop@2026',
        ]);

        $registerResponse->assertStatus(200)
            ->assertJsonPath('requires_verification', true)
            ->assertJsonPath('mail_sent', true);

        $pending = Cache::get('pending_reg_' . md5($email));
        $this->assertNotNull($pending);
        $this->assertNotEmpty($pending['plain_code']);

        $verifyResponse = $this->postJson('/api/auth/register-verify', [
            'email' => $email,
            'code' => $pending['plain_code'],
        ]);

        $verifyResponse->assertStatus(201)
            ->assertJsonPath('user.email', $email);

        $this->assertDatabaseHas('users', [
            'email' => $email,
            'role' => 'customer',
        ]);
    }

    public function test_production_mail_failure_returns_503_instead_of_faking_otp_sent(): void
    {
        config([
            'app.debug' => false,
            'mail.default' => 'smtp',
        ]);
        $this->app->detectEnvironment(fn () => 'production');

        Mail::shouldReceive('send')
            ->andThrow(new \RuntimeException('535-5.7.8 BadCredentials'));

        $email = 'produser@gmail.com';

        // 1. Register fails explicitly with 503 and cleans pending cache
        $this->postJson('/api/auth/register', [
            'name' => 'Prod User',
            'email' => $email,
            'password' => 'TeaShop@2026',
        ])->assertStatus(503)
          ->assertJsonPath('mail_sent', false);

        $this->assertNull(Cache::get('pending_reg_' . md5($email)));

        // 2. Resend OTP fails explicitly with 503 when pending session exists
        Cache::put('pending_reg_' . md5($email), [
            'name' => 'Prod User',
            'email' => $email,
            'password' => Hash::make('TeaShop@2026'),
            'code' => Hash::make('123456'),
            'plain_code' => '123456',
            'attempts' => 0,
        ], now()->addMinutes(15));

        $this->postJson('/api/auth/register-resend', [
            'email' => $email,
        ])->assertStatus(503)
          ->assertJsonPath('mail_sent', false);

        // 3. Forgot password fails explicitly with 503 and deletes token
        User::create([
            'name' => 'Prod User',
            'email' => $email,
            'password' => Hash::make('TeaShop@2026'),
            'role' => 'customer',
            'status' => 'active',
        ]);

        $this->postJson('/api/auth/forgot-password', [
            'email' => $email,
        ])->assertStatus(503)
          ->assertJsonPath('mail_sent', false);

        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => $email,
        ]);
    }

    public function test_reset_password_enforces_strong_password_policy(): void
    {
        $email = 'resetuser@gmail.com';
        User::create([
            'name' => 'Reset User',
            'email' => $email,
            'password' => Hash::make('TeaShop@2026'),
            'role' => 'customer',
            'status' => 'active',
        ]);

        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make('654321'),
            'created_at' => now(),
        ]);

        $this->postJson('/api/auth/reset-password', [
            'email' => $email,
            'code' => '654321',
            'password' => 'weakpass',
            'password_confirmation' => 'weakpass',
        ])->assertStatus(422)
          ->assertJsonValidationErrors(['password']);

        $this->postJson('/api/auth/reset-password', [
            'email' => $email,
            'code' => '654321',
            'password' => 'NewTeaShop#2026',
            'password_confirmation' => 'NewTeaShop#2026',
        ])->assertStatus(200)
          ->assertJsonPath('user.email', $email);
    }
}
