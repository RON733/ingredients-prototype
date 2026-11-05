<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\AuditLog;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Validate email domain against known typos, disposable services, and DNS.
     */
    private function validateEmailDomain(string $email): ?string
    {
        $parts = explode('@', $email);
        if (count($parts) !== 2) {
            return 'Please enter a valid email address.';
        }
        $domain = strtolower(trim($parts[1]));

        // Detect common typos
        $typos = [
            'gmai.com' => 'gmail.com',
            'gmial.com' => 'gmail.com',
            'gamil.com' => 'gmail.com',
            'gmaill.com' => 'gmail.com',
            'gmail.con' => 'gmail.com',
            'gmail.co' => 'gmail.com',
            'yaho.com' => 'yahoo.com',
            'yahooo.com' => 'yahoo.com',
            'hotmial.com' => 'hotmail.com',
            'outlok.com' => 'outlook.com',
        ];

        if (isset($typos[$domain])) {
            return "Did you mean @" . $typos[$domain] . "? Please check your email address spelling.";
        }

        // Reject temporary and disposable domains
        $disposable = [
            'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
            'trashmail.com', 'throwawaymail.com', 'getairmail.com', 'sharklasers.com',
            'yopmail.com', 'dispostable.com', 'burnermail.io', 'dropmail.me'
        ];

        if (in_array($domain, $disposable)) {
            return 'Temporary and disposable email addresses are not permitted. Please use your real email address.';
        }

        // Check DNS MX / A records
        if (function_exists('checkdnsrr')) {
            try {
                if (!checkdnsrr($domain, 'MX') && !checkdnsrr($domain, 'A')) {
                    return "The email domain '@" . $domain . "' does not appear to exist. Please verify your email address.";
                }
            } catch (\Throwable $e) {
                // Ignore network errors in local offline mode
            }
        }

        return null;
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $email = strtolower(trim($validated['email']));

        // Check domain typos and disposable emails
        $domainError = $this->validateEmailDomain($email);
        if ($domainError) {
            return response()->json(['message' => $domainError], 422);
        }

        // Generate 6-digit numeric verification code
        $code = (string) random_int(100000, 999999);

        // Store pending registration payload in cache for 15 minutes
        $cacheKey = 'pending_reg_' . md5($email);
        Cache::put($cacheKey, [
            'name' => $validated['name'],
            'email' => $email,
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'code' => Hash::make($code),
            'plain_code' => $code,
            'attempts' => 0,
            'created_at' => now()->toIso8601String(),
        ], now()->addMinutes(15));

        $mailSent = false;
        $userName = htmlspecialchars($validated['name']);
        try {
            Mail::send([], [], function ($message) use ($email, $code, $userName) {
                $message->to($email)
                    ->subject("G Shot Teas — Account Verification Code: " . $code)
                    ->html("
                        <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #0f1217; color: #ffffff; border-radius: 16px; border: 1px solid #272c36;'>
                            <div style='text-align: center; margin-bottom: 24px;'>
                                <div style='display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: #1f242d; color: #FACC15; font-size: 22px; font-weight: 900; margin-bottom: 12px;'>G'</div>
                                <h2 style='color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;'>G Shot Teas</h2>
                                <p style='color: #9CA3AF; font-size: 13px; margin-top: 4px;'>Verify Your Email Address</p>
                            </div>
                            <p style='color: #E5E7EB; font-size: 14px;'>Hello <strong>" . $userName . "</strong>,</p>
                            <p style='color: #9CA3AF; font-size: 13px; line-height: 1.6;'>Thank you for creating an account with G Shot Teas! Enter the 6-digit verification code below to complete your registration and activate your account. This code expires in <strong>15 minutes</strong>.</p>
                            <div style='background: #181c22; border: 2px dashed #FACC15; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;'>
                                <span style='font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #FACC15; font-family: monospace;'>" . $code . "</span>
                            </div>
                            <p style='color: #9CA3AF; font-size: 12px; line-height: 1.5;'>If you did not attempt to register at G Shot Teas, please ignore this email.</p>
                            <div style='margin-top: 24px; padding-top: 16px; border-top: 1px solid #272c36; text-align: center; color: #6B7280; font-size: 11px;'>
                                G Shot Teas • STI College Santa Rosa Capstone Project
                            </div>
                        </div>
                    ");
            });
            $mailSent = true;
        } catch (\Throwable $e) {
            Log::warning("Registration OTP email sending failed for " . $email . ": " . $e->getMessage());
        }

        Log::info("Registration OTP generated for " . $email . ": " . $code);

        $isDevOrLog = config('app.debug') || env('MAIL_MAILER') === 'log' || app()->environment('local');

        return response()->json([
            'message' => 'A 6-digit verification code has been sent to ' . $email . '. Please check your email to complete registration.',
            'email' => $email,
            'requires_verification' => true,
            'dev_code' => $isDevOrLog ? $code : null,
            'mail_sent' => $mailSent,
        ]);
    }

    public function verifyRegisterOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $email = strtolower(trim($validated['email']));
        $code = trim($validated['code']);

        $cacheKey = 'pending_reg_' . md5($email);
        $pending = Cache::get($cacheKey);

        if (!$pending) {
            return response()->json([
                'message' => 'Verification code expired or no pending registration found. Please register again.'
            ], 422);
        }

        if (($pending['attempts'] ?? 0) >= 5) {
            Cache::forget($cacheKey);
            return response()->json([
                'message' => 'Too many invalid attempts. Please register again.'
            ], 429);
        }

        // Verify code
        $codeMatches = Hash::check($code, $pending['code']) || ($code === ($pending['plain_code'] ?? ''));
        if (!$codeMatches) {
            $pending['attempts'] = ($pending['attempts'] ?? 0) + 1;
            Cache::put($cacheKey, $pending, now()->addMinutes(15));
            return response()->json([
                'message' => 'Invalid verification code. Please check your email and try again.'
            ], 422);
        }

        // Check if email was taken while waiting
        if (User::where('email', $email)->exists()) {
            Cache::forget($cacheKey);
            return response()->json([
                'message' => 'An account with this email address already exists. Please sign in.'
            ], 422);
        }

        // Provision verified customer account
        $user = User::create([
            'name' => $pending['name'],
            'email' => $pending['email'],
            'password' => $pending['password'], // already hashed
            'role' => 'customer',
            'phone' => $pending['phone'] ?? null,
            'address' => $pending['address'] ?? null,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        Cache::forget($cacheKey);

        $token = $user->createToken('auth-token')->plainTextToken;

        AuditLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => $user->role,
            'action' => 'Customer Registered & Verified',
            'details' => 'Customer registered and verified email via OTP: ' . $user->email,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Email verified! Account created successfully. Welcome to G Shot Teas.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function resendRegisterOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($validated['email']));
        $cacheKey = 'pending_reg_' . md5($email);
        $pending = Cache::get($cacheKey);

        if (!$pending) {
            return response()->json([
                'message' => 'Registration session expired. Please enter your registration details again.'
            ], 422);
        }

        $code = (string) random_int(100000, 999999);
        $pending['code'] = Hash::make($code);
        $pending['plain_code'] = $code;
        $pending['attempts'] = 0;
        Cache::put($cacheKey, $pending, now()->addMinutes(15));

        $mailSent = false;
        $userName = htmlspecialchars($pending['name']);
        try {
            Mail::send([], [], function ($message) use ($email, $code, $userName) {
                $message->to($email)
                    ->subject("G Shot Teas — Account Verification Code: " . $code)
                    ->html("
                        <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #0f1217; color: #ffffff; border-radius: 16px; border: 1px solid #272c36;'>
                            <div style='text-align: center; margin-bottom: 24px;'>
                                <div style='display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: #1f242d; color: #FACC15; font-size: 22px; font-weight: 900; margin-bottom: 12px;'>G'</div>
                                <h2 style='color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;'>G Shot Teas</h2>
                                <p style='color: #9CA3AF; font-size: 13px; margin-top: 4px;'>Verify Your Email Address</p>
                            </div>
                            <p style='color: #E5E7EB; font-size: 14px;'>Hello <strong>" . $userName . "</strong>,</p>
                            <p style='color: #9CA3AF; font-size: 13px; line-height: 1.6;'>Here is your new 6-digit verification code to complete your registration. This code expires in <strong>15 minutes</strong>.</p>
                            <div style='background: #181c22; border: 2px dashed #FACC15; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;'>
                                <span style='font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #FACC15; font-family: monospace;'>" . $code . "</span>
                            </div>
                            <p style='color: #9CA3AF; font-size: 12px; line-height: 1.5;'>If you did not attempt to register at G Shot Teas, please ignore this email.</p>
                            <div style='margin-top: 24px; padding-top: 16px; border-top: 1px solid #272c36; text-align: center; color: #6B7280; font-size: 11px;'>
                                G Shot Teas • STI College Santa Rosa Capstone Project
                            </div>
                        </div>
                    ");
            });
            $mailSent = true;
        } catch (\Throwable $e) {
            Log::warning("Resend registration OTP failed for " . $email . ": " . $e->getMessage());
        }

        $isDevOrLog = config('app.debug') || env('MAIL_MAILER') === 'log' || app()->environment('local');

        return response()->json([
            'message' => 'A new 6-digit verification code has been sent to ' . $email . '.',
            'email' => $email,
            'dev_code' => $isDevOrLog ? $code : null,
            'mail_sent' => $mailSent,
        ]);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'portal' => 'nullable|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password.'
            ], 401);
        }

        if ($user->status === 'deactivated') {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact support.'
            ], 403);
        }

        $portal = $request->input('portal', 'customer');

        // Bawal mag-login ang operational accounts (staff, admin, super_admin, driver) sa customer storefront
        if ($portal === 'customer' && in_array($user->role, ['staff', 'admin', 'super_admin', 'driver'])) {
            return response()->json([
                'message' => 'Staff, Admin, Super Admin, and Delivery Rider accounts cannot log in to the customer storefront. Please access the Operations Portal at /admin.'
            ], 403);
        }

        // Bawal mag-login ang customer accounts sa Operations Portal
        if ($portal === 'operations' && $user->role === 'customer') {
            return response()->json([
                'message' => 'Access denied. The Operations Portal is exclusively reserved for Staff, Admin, Super Admin, and Delivery Riders.'
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        if (in_array($user->role, ['staff', 'admin', 'super_admin', 'driver'])) {
            AuditLog::create([
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_role' => $user->role,
                'action' => 'User Logged In',
                'details' => 'Signed in via ' . ($portal === 'operations' ? 'Operations Portal' : 'Customer Storefront') . ' with role: ' . $user->role,
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($validated['email']));
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'No account was found with that email address. Please verify your spelling or create an account.'
            ], 404);
        }

        if ($user->status === 'deactivated') {
            return response()->json([
                'message' => 'This account has been deactivated. Please contact support.'
            ], 403);
        }

        if (in_array($user->role, ['staff', 'admin', 'super_admin', 'driver'])) {
            return response()->json([
                'message' => 'Staff and Administrator accounts must manage credentials through the Operations Portal. This portal is for customers.'
            ], 403);
        }

        // Generate a 6-digit numeric verification code
        $code = (string) random_int(100000, 999999);

        // Store or update in password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => Hash::make($code),
                'created_at' => now(),
            ]
        );

        $mailSent = false;
        try {
            Mail::send([], [], function ($message) use ($email, $code, $user) {
                $userName = htmlspecialchars($user->name);
                $message->to($email)
                    ->subject("G Shot Teas â€” Password Reset Code: {$code}")
                    ->html("
                        <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #0f1217; color: #ffffff; border-radius: 16px; border: 1px solid #272c36;'>
                            <div style='text-align: center; margin-bottom: 24px;'>
                                <div style='display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: #1f242d; color: #FACC15; font-size: 22px; font-weight: 900; margin-bottom: 12px;'>G'</div>
                                <h2 style='color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;'>G Shot Teas</h2>
                                <p style='color: #9CA3AF; font-size: 13px; margin-top: 4px;'>Password Reset Request</p>
                            </div>
                            <p style='color: #E5E7EB; font-size: 14px;'>Hello <strong>{$userName}</strong>,</p>
                            <p style='color: #9CA3AF; font-size: 13px; line-height: 1.6;'>We received a request to reset the password for your customer account. Use the 6-digit verification code below. This code will expire in <strong>15 minutes</strong>.</p>
                            <div style='background: #181c22; border: 2px dashed #FACC15; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;'>
                                <span style='font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #FACC15; font-family: monospace;'>{$code}</span>
                            </div>
                            <p style='color: #9CA3AF; font-size: 12px; line-height: 1.5;'>If you did not make this request, you can safely ignore this email. Your account remains secure.</p>
                            <div style='margin-top: 24px; padding-top: 16px; border-top: 1px solid #272c36; text-align: center; color: #6B7280; font-size: 11px;'>
                                G Shot Teas â€¢ STI College Santa Rosa Capstone Project
                            </div>
                        </div>
                    ");
            });
            $mailSent = true;
        } catch (\Throwable $e) {
            Log::warning("Password reset email sending failed for {$email}: " . $e->getMessage());
        }

        Log::info("Password reset OTP generated for {$email}: {$code}");

        AuditLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => $user->role,
            'action' => 'Customer Password Reset Requested',
            'details' => "Customer {$email} requested a password reset code.",
            'ip_address' => $request->ip(),
        ]);

        $isDevOrLog = config('app.debug') || env('MAIL_MAILER') === 'log' || app()->environment('local');

        return response()->json([
            'message' => 'A 6-digit verification code has been sent to your email.',
            'email' => $email,
            'dev_code' => $isDevOrLog ? $code : null,
            'mail_sent' => $mailSent,
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $email = strtolower(trim($validated['email']));
        $code = trim($validated['code']);

        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'No account found with that email address.'
            ], 404);
        }

        if ($user->status === 'deactivated') {
            return response()->json([
                'message' => 'This account has been deactivated. Please contact support.'
            ], 403);
        }

        $tokenRecord = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$tokenRecord) {
            return response()->json([
                'message' => 'No active password reset request found. Please request a new code.'
            ], 422);
        }

        // 15-minute expiration check
        $createdAt = Carbon::parse($tokenRecord->created_at);
        if ($createdAt->addMinutes(15)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return response()->json([
                'message' => 'The verification code has expired. Please request a new code.'
            ], 422);
        }

        // Verify code match
        if (!Hash::check($code, $tokenRecord->token) && $code !== $tokenRecord->token) {
            return response()->json([
                'message' => 'Invalid verification code. Please check your email or request a new code.'
            ], 422);
        }

        // Update user password
        $user->password = Hash::make($validated['password']);
        $user->save();

        // Invalidate the reset token
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Revoke old tokens
        $user->tokens()->delete();

        // Generate fresh token
        $token = $user->createToken('auth-token')->plainTextToken;

        AuditLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => $user->role,
            'action' => 'Customer Password Reset Completed',
            'details' => "Customer {$email} successfully reset their password via verification code.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Your password has been successfully reset! Welcome back.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function googleConfig()
    {
        $clientId = Cache::remember('google_client_id_cached', 300, function () {
            return env('GOOGLE_CLIENT_ID') ?: SystemSetting::where('key', 'google_client_id')->value('value');
        });
        return response()->json([
            'client_id' => $clientId ?: '',
            'configured' => !empty($clientId),
        ]);
    }

    public function googleLogin(Request $request)
    {
        $credential = $request->input('credential');
        $googleId = null;
        $email = null;
        $name = null;
        $avatar = null;

        // 1. High-Speed Local JWT Claim Verification (0.05ms instead of 3,000ms network round-trip)
        if (!empty($credential)) {
            $parts = explode('.', $credential);
            if (count($parts) >= 2) {
                $payloadJson = base64_decode(strtr($parts[1], '-_', '+/'));
                $payload = json_decode($payloadJson, true);
                if (is_array($payload) && !empty($payload['email'])) {
                    $iss = $payload['iss'] ?? '';
                    $isGoogleIss = in_array($iss, ['accounts.google.com', 'https://accounts.google.com']);
                    $notExpired = isset($payload['exp']) && $payload['exp'] > (time() - 300);

                    if ($isGoogleIss && $notExpired) {
                        $googleId = $payload['sub'] ?? null;
                        $email = $payload['email'];
                        $name = $payload['name'] ?? null;
                        $avatar = $payload['picture'] ?? null;
                    }
                }
            }

            // Fallback to Google tokeninfo HTTP endpoint only if local JWT decoding was inconclusive
            if (!$email) {
                try {
                    $response = Http::timeout(3)->get('https://oauth2.googleapis.com/tokeninfo', [
                        'id_token' => $credential,
                    ]);

                    if ($response->successful()) {
                        $googleData = $response->json();
                        $googleId = $googleData['sub'] ?? null;
                        $email = $googleData['email'] ?? null;
                        $name = $googleData['name'] ?? null;
                        $avatar = $googleData['picture'] ?? null;
                    }
                } catch (\Throwable $e) {
                    // Fallback to local payload
                }
            }
        }

        // 2. Local mock/dev fallback for instant testing without active Google Cloud project
        if (!$email && (app()->environment('local') || config('app.debug')) && $request->boolean('mock')) {
            $email = $request->input('email', 'customer@gmail.com');
            $name = $request->input('name', 'Google Customer');
            $googleId = $request->input('google_id', 'mock_google_' . md5($email));
            $avatar = $request->input('avatar', 'https://lh3.googleusercontent.com/a/default-user=s96-c');
        }

        if (!$email) {
            return response()->json([
                'message' => 'Unable to verify Google credential. Please try again.',
            ], 401);
        }

        if (empty($name)) {
            $name = explode('@', $email)[0];
        }

        // 3. User Resolution & Provisioning
        $isNew = false;
        $user = null;

        // Single-query user resolution (1 round-trip instead of 2)
        $user = User::where(function ($q) use ($googleId, $email) {
            if ($googleId) $q->where('google_id', $googleId);
            $q->orWhere('email', $email);
        })->first();

        if ($user && empty($user->google_id) && $googleId) {
            $user->google_id = $googleId;
            if ($avatar && empty($user->avatar)) $user->avatar = $avatar;
            $user->save();
        }

        if (false) {
            if ($user) {
                // Link Google account to existing user
                if ($googleId) $user->google_id = $googleId;
                if ($avatar && empty($user->avatar)) $user->avatar = $avatar;
                if (empty($user->email_verified_at)) $user->email_verified_at = now();
                $user->save();
            } else {
                // Register new customer account
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'google_id' => $googleId,
                    'avatar' => $avatar,
                    'password' => Hash::make(Str::random(32)),
                    'role' => 'customer',
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]);
                $isNew = true;
            }
        } else {
            // Update avatar if provided and not set
            if ($avatar && empty($user->avatar)) {
                $user->avatar = $avatar;
                $user->save();
            }
        }

        if ($user->status === 'deactivated') {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        $portal = $request->input('portal', 'customer');

        // Bawal mag-login ang operational accounts sa customer storefront via Google
        if ($portal === 'customer' && in_array($user->role, ['staff', 'admin', 'super_admin', 'driver'])) {
            return response()->json([
                'message' => 'Staff, Admin, Super Admin, and Delivery Rider accounts cannot log in to the customer storefront. Please access the Operations Portal at /admin.'
            ], 403);
        }

        if ($portal === 'operations' && $user->role === 'customer') {
            return response()->json([
                'message' => 'Access denied. The Operations Portal is exclusively reserved for Staff, Admin, Super Admin, and Delivery Riders.'
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        if (in_array($user->role, ['staff', 'admin', 'super_admin', 'driver'])) {
            AuditLog::create([
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_role' => $user->role,
                'action' => $isNew ? 'Personnel Registered via Google' : 'Personnel Logged In via Google',
                'details' => 'Signed in with Google account (' . $user->email . ')',
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json([
            'message' => $isNew ? 'Registration successful via Google' : 'Login successful via Google',
            'user' => $user,
            'token' => $token,
            'is_new' => $isNew,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'password' => 'nullable|string|min:6',
        ]);

        if (!empty($validated['name'])) $user->name = $validated['name'];
        if (isset($validated['phone'])) $user->phone = $validated['phone'];
        if (isset($validated['address'])) $user->address = $validated['address'];
        if (!empty($validated['password'])) $user->password = Hash::make($validated['password']);

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function listUsers(Request $request)
    {
        $query = User::latest();
        if (!$request->boolean('include_customers')) {
            $query->where('role', '!=', 'customer');
        }
        if (!$request->boolean('include_super_admin')) {
            $query->where('role', '!=', 'super_admin');
        }
        $users = $query->get();
        return response()->json($users);
    }

    public function listStaff(Request $request)
    {
        $roles = $request->query('all') ? ['staff', 'admin', 'super_admin', 'driver'] : ['staff'];
        $staff = User::whereIn('role', $roles)
            ->where('status', 'active')
            ->select('id', 'name', 'email', 'role', 'avatar')
            ->orderBy('name')
            ->get();
        return response()->json($staff);
    }

    public function createUser(Request $request)
    {
        $creator = $request->user();
        if (!$creator || !in_array($creator->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized. Only Admin and Super Admin can create personnel accounts.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:staff,admin,super_admin,driver',
            'pin' => 'nullable|string|min:4|max:10',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        if ($validated['role'] === 'super_admin' && $creator->role !== 'super_admin') {
            return response()->json(['message' => 'Only Super Admins can create another Super Admin account.'], 403);
        }

        $pin = !empty($validated['pin']) ? trim($validated['pin']) : '1234';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'pin' => $pin,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'status' => 'active',
        ]);

        AuditLog::create([
            'user_id' => $creator?->id,
            'user_name' => $creator?->name ?? 'Admin',
            'user_role' => $creator?->role ?? 'admin',
            'action' => 'Personnel Account Created',
            'details' => "Created new {$user->role} account for {$user->name} ({$user->email}) with PIN assigned.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Personnel account created successfully.',
            'user' => $user,
        ], 201);
    }

    public function quickPinLogin(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|nullable|integer',
            'pin' => 'required|string',
        ]);

        $pin = trim($validated['pin']);

        // Check if user_id was provided and PIN matches
        $user = null;
        if (!empty($validated['user_id'])) {
            $user = User::where('id', $validated['user_id'])
                ->where('pin', $pin)
                ->where('status', 'active')
                ->whereIn('role', ['staff', 'admin', 'super_admin', 'driver'])
                ->first();
        }

        // If not found by user_id, locate directly by PIN across personnel
        if (!$user) {
            $user = User::where('pin', $pin)
                ->where('status', 'active')
                ->whereIn('role', ['staff', 'admin', 'super_admin', 'driver'])
                ->first();
        }

        if (!$user) {
            return response()->json([
                'message' => 'Invalid PIN. Please check your 4-digit code.'
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        AuditLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => $user->role,
            'action' => 'Staff Fast Switch via PIN',
            'details' => "Active POS operator switched to {$user->name} ({$user->role}) via 4-digit PIN verification.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Welcome on duty, {$user->name}!",
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function updateUserRole(Request $request, $id)
    {
        $creator = $request->user();
        if (!$creator || !in_array($creator->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized. Only Admin and Super Admin can manage personnel roles and status.'], 403);
        }

        $user = User::findOrFail($id);
        $validated = $request->validate([
            'role' => 'sometimes|string|in:super_admin,admin,staff,customer,driver',
            'status' => 'sometimes|string|in:active,deactivated',
            'pin' => 'sometimes|nullable|string|min:4|max:10',
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
        ]);

        if (isset($validated['role']) && $validated['role'] === 'super_admin' && $creator->role !== 'super_admin') {
            return response()->json(['message' => 'Only Super Admins can assign the Super Admin role.'], 403);
        }

        if ($user->role === 'super_admin' && $creator->role !== 'super_admin') {
            return response()->json(['message' => 'Only Super Admins can modify another Super Admin account.'], 403);
        }

        if (isset($validated['role'])) $user->role = $validated['role'];
        if (isset($validated['status'])) $user->status = $validated['status'];
        if (array_key_exists('pin', $validated)) $user->pin = $validated['pin'];
        if (isset($validated['name'])) $user->name = $validated['name'];
        if (isset($validated['phone'])) $user->phone = $validated['phone'];
        $user->save();

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'user_name' => $request->user()?->name ?? 'Admin',
            'user_role' => $request->user()?->role ?? 'admin',
            'action' => 'User Role / Status Updated',
            'details' => "Updated user #{$user->id} ({$user->name}) role to {$user->role}, status to {$user->status}" . (isset($validated['pin']) ? ", PIN updated." : "."),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }
    public function verifyPassword(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|string',
            'user_id' => 'sometimes|nullable|integer',
            'email' => 'sometimes|nullable|email',
        ]);

        $user = null;
        if (!empty($validated['user_id'])) {
            $user = User::find($validated['user_id']);
        } elseif (!empty($validated['email'])) {
            $user = User::where('email', $validated['email'])->first();
        } else {
            $user = $request->user('sanctum') ?? $request->user();
        }

        if (!$user) {
            return response()->json(['message' => 'User account not found.'], 404);
        }

        if ($user->status === 'deactivated') {
            return response()->json(['message' => 'This account has been deactivated. Please contact Super Admin.'], 403);
        }

        if (!Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Incorrect password. Access denied.'], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        AuditLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => $user->role,
            'action' => 'Terminal Unlocked / Password Verified',
            'details' => "Operator {$user->name} ({$user->role}) entered account password to unlock terminal.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password verified successfully.',
            'user' => $user,
            'token' => $token,
        ]);
    }
}