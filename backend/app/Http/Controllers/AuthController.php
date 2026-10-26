<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\AuditLog;
use App\Models\SystemSetting;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'customer',
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'status' => 'active',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        AuditLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => $user->role,
            'action' => 'Customer Registered',
            'details' => 'New account created for ' . $user->email,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
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

        $token = $user->createToken('auth-token')->plainTextToken;

        AuditLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => $user->role,
            'action' => 'User Logged In',
            'details' => 'Signed in with role: ' . $user->role,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function googleConfig()
    {
        $clientId = env('GOOGLE_CLIENT_ID') ?: SystemSetting::where('key', 'google_client_id')->value('value');
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

        // 1. Verify with Google's public tokeninfo endpoint if token was passed
        if (!empty($credential)) {
            try {
                $response = Http::timeout(8)->get('https://oauth2.googleapis.com/tokeninfo', [
                    'id_token' => $credential,
                ]);

                if ($response->successful()) {
                    $googleData = $response->json();
                    $googleId = $googleData['sub'] ?? null;
                    $email = $googleData['email'] ?? null;
                    $name = $googleData['name'] ?? null;
                    $avatar = $googleData['picture'] ?? null;

                    // Verify audience if GOOGLE_CLIENT_ID is configured
                    $expectedClientId = env('GOOGLE_CLIENT_ID') ?: SystemSetting::where('key', 'google_client_id')->value('value');
                    if ($expectedClientId && isset($googleData['aud']) && $googleData['aud'] !== $expectedClientId) {
                        return response()->json([
                            'message' => 'Invalid Google token audience.',
                        ], 401);
                    }
                }
            } catch (\Throwable $e) {
                // If network verification failed, check for local dev payload decoding below
            }

            // Fallback decoding if tokeninfo verification failed or was unreachable (only in local environment)
            if (!$email && app()->environment('local')) {
                $parts = explode('.', $credential);
                if (count($parts) >= 2) {
                    $payloadJson = base64_decode(strtr($parts[1], '-_', '+/'));
                    $payload = json_decode($payloadJson, true);
                    if (is_array($payload) && !empty($payload['email'])) {
                        $googleId = $payload['sub'] ?? null;
                        $email = $payload['email'];
                        $name = $payload['name'] ?? null;
                        $avatar = $payload['picture'] ?? null;
                    }
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

        if ($googleId) {
            $user = User::where('google_id', $googleId)->first();
        }

        if (!$user) {
            $user = User::where('email', $email)->first();
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

        $token = $user->createToken('auth-token')->plainTextToken;

        AuditLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => $user->role,
            'action' => $isNew ? 'Customer Registered via Google' : 'User Logged In via Google',
            'details' => 'Signed in with Google account (' . $user->email . ')',
            'ip_address' => $request->ip(),
        ]);

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
        $users = User::latest()->get();
        return response()->json($users);
    }

    public function updateUserRole(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'role' => 'sometimes|string|in:super_admin,admin,staff,customer',
            'status' => 'sometimes|string|in:active,deactivated',
        ]);

        if (isset($validated['role'])) $user->role = $validated['role'];
        if (isset($validated['status'])) $user->status = $validated['status'];
        $user->save();

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'user_name' => $request->user()?->name ?? 'Admin',
            'user_role' => $request->user()?->role ?? 'admin',
            'action' => 'User Role / Status Updated',
            'details' => "Updated user #{$user->id} ({$user->name}) role to {$user->role}, status to {$user->status}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }
}
