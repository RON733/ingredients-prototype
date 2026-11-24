<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\SystemSetting;
use App\Models\AuditLog;
use App\Models\Product;
use App\Services\SantaRosaDeliveryService;

class SystemController extends Controller
{
    private function loadAllSettings(): array
    {
        return Cache::remember('system_settings_all', 60, function () {
            $s = SystemSetting::all()->pluck('value', 'key')->toArray();
            if (empty($s['google_client_id']) && env('GOOGLE_CLIENT_ID')) {
                $s['google_client_id'] = env('GOOGLE_CLIENT_ID');
            }
            $defaults = [
                'maintenance_mode' => 'false',
                'maintenance_title' => 'Website Under Scheduled Maintenance',
                'maintenance_message' => 'G Shot Teas is currently undergoing essential system updates and performance enhancements. Customer ordering is temporarily paused. We will be back online shortly!',
                'maintenance_until' => '',
                'order_area_note' => 'Orders are only available in Santa Rosa bayan.',
                'order_area_note_enabled' => 'true',
                'booking_downpayment_percent' => '50',
                'booking_payment_deadline_hours' => '48',
                'booking_gcash_number' => '0994 612 1933',
                'booking_gcash_name' => 'Jefferson Alulod / G Shot Teas',
                'booking_maya_number' => '',
                'booking_maya_name' => '',
                'booking_bank_name' => '',
                'booking_bank_account' => '',
                'booking_bank_account_name' => '',
                'booking_payment_qr' => '',
                'delivery_barangays' => json_encode(SantaRosaDeliveryService::BARANGAYS),
            ];
            foreach ($defaults as $key => $val) {
                if (!isset($s[$key])) {
                    $s[$key] = $val;
                }
            }
            return $s;
        });
    }

    public function settings()
    {
        // High-Performance In-Memory Cache: Serves system settings in 2ms
        return response()->json($this->loadAllSettings());
    }

    public function updateSettings(Request $request)
    {
        $data = $request->all();
        $user = $request->user('sanctum') ?? $request->user();

        // Strict Authorization: Modifying supported delivery barangays is restricted to Owner / Admin
        if (array_key_exists('delivery_barangays', $data)) {
            if ($user && !in_array($user->role, ['admin', 'super_admin'], true)) {
                return response()->json([
                    'message' => 'Access Denied: Only the Owner / Admin can modify supported delivery barangays.'
                ], 403);
            }

            $rawBarangays = $data['delivery_barangays'];
            if (is_string($rawBarangays)) {
                $decodedBarangays = json_decode($rawBarangays, true);
            } elseif (is_array($rawBarangays)) {
                $decodedBarangays = $rawBarangays;
            } else {
                $decodedBarangays = null;
            }

            if (!is_array($decodedBarangays)) {
                return response()->json([
                    'message' => 'Invalid delivery_barangays payload. Expected a JSON array.'
                ], 422);
            }

            $normalizedBarangays = SantaRosaDeliveryService::normalizeBarangayList($decodedBarangays);
            $data['delivery_barangays'] = json_encode($normalizedBarangays, JSON_UNESCAPED_UNICODE);
            Cache::put('delivery_barangays_version', (int) Cache::get('delivery_barangays_version', 1) + 1, 86400 * 30);
        }

        // Strict Authorization: If modifying maintenance mode, ONLY Super Admin is permitted
        if (isset($data['maintenance_mode'])) {
            if ($user && $user->role !== 'super_admin') {
                return response()->json([
                    'message' => 'Access Denied: Only Super Admin has permission to shut down the website or toggle Maintenance Mode.'
                ], 403);
            }
        }

        $records = [];
        $keysToDelete = [];
        $now = now();

        foreach ($data as $key => $value) {
            if (is_array($value) || is_object($value)) {
                continue;
            }
            if ($value === null) {
                $keysToDelete[] = $key;
            } else {
                $records[] = [
                    'key' => (string)$key,
                    'value' => (string)$value,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if (!empty($keysToDelete)) {
            SystemSetting::whereIn('key', $keysToDelete)->delete();
        }

        if (!empty($records)) {
            SystemSetting::upsert($records, ['key'], ['value', 'updated_at']);
        }

        $action = 'System Settings Updated';
        $details = 'Modified system variables and store preferences.';

        if (isset($data['maintenance_mode'])) {
            $isShutdown = in_array($data['maintenance_mode'], ['true', true, '1', 1], true);
            $action = $isShutdown ? 'Website Emergency Shutdown' : 'Website Restored Online';
            $details = $isShutdown 
                ? 'EMERGENCY: Super Admin initiated website shutdown. Customer access placed into Maintenance Mode.' 
                : 'Super Admin deactivated Maintenance Mode. Public website and customer ordering restored.';
        } elseif (isset($data['order_area_note']) || isset($data['order_area_note_enabled'])) {
            $action = 'Order Area Notice Updated';
            $noteText = $data['order_area_note'] ?? 'Santa Rosa Bayan notice';
            $details = 'Updated customer order availability note: ' . $noteText;
        } elseif (array_key_exists('delivery_barangays', $data)) {
            $action = 'Delivery Barangays Updated';
            $list = json_decode($data['delivery_barangays'], true) ?: [];
            $names = array_map(fn ($b) => $b['name'] ?? '', $list);
            $details = 'Updated supported delivery barangays (' . count($list) . '): ' . (count($names) ? implode(', ', $names) : 'None');
        } elseif (isset($data['booking_downpayment_percent']) || isset($data['booking_gcash_number']) || isset($data['booking_payment_qr'])) {
            $action = 'Booking Downpayment Settings Updated';
            $details = 'Updated event booking downpayment percentage, deadline, or payment receiving accounts.';
        }

        try {
            AuditLog::create([
                'user_name' => $user?->name ?? 'Admin',
                'user_role' => $user?->role ?? 'admin',
                'action' => $action,
                'details' => $details,
                'ip_address' => $request->ip(),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Could not record audit log: " . $e->getMessage());
        }

        Cache::forget('system_settings_all');
        $allSettings = $this->loadAllSettings();

        return response()->json([
            'message' => 'Settings updated successfully.',
            'settings' => $allSettings,
        ]);
    }

    public function auditLogs(Request $request)
    {
        // Strict Authorization: ONLY the Super Admin has access to the System Audit Trail
        $user = $request->user('sanctum') ?? $request->user();
        if ($user && $user->role !== 'super_admin') {
            return response()->json([
                'message' => 'Access Denied: The System Audit Trail is strictly restricted to Super Admin.'
            ], 403);
        }

        // Audit trail records and displays staff, admin, super_admin, and driver operations
        $query = AuditLog::whereIn('user_role', ['staff', 'admin', 'super_admin', 'driver']);

        if ($request->filled('role')) {
            $role = strtolower(trim($request->input('role')));
            if (in_array($role, ['staff', 'admin', 'super_admin', 'driver'])) {
                $query->where('user_role', $role);
            }
        }

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('user_name', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('details', 'like', "%{$search}%");
            });
        }

        $logs = $query->latest()->paginate($request->input('per_page', 50));
        return response()->json($logs);
    }

    public function reverseGeocode(Request $request)
    {
        $lat = filter_var($request->query('lat'), FILTER_VALIDATE_FLOAT);
        $lng = filter_var($request->query('lng') ?? $request->query('lon'), FILTER_VALIDATE_FLOAT);

        if ($lat === false || $lng === false || $lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            return response()->json(['error' => 'Invalid coordinates provided.'], 422);
        }

        $brgyVer = Cache::get('delivery_barangays_version', 1);
        $cacheKey = 'rev_geo_v2_' . $brgyVer . '_' . round($lat, 4) . '_' . round($lng, 4);
        $cached = Cache::get($cacheKey);
        if ($cached) {
            return response()->json($cached);
        }

        $resolvedAddress = null;
        $shortAddress = null;
        $detectedCity = null;

        // 1. OpenStreetMap Nominatim with valid User-Agent
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'GShotTeas/1.0 (sti-santa-rosa-capstone; info@gshotteas.ph)',
                'Accept-Language' => 'en',
            ])->timeout(4)->get('https://nominatim.openstreetmap.org/reverse', [
                'format' => 'json',
                'lat' => $lat,
                'lon' => $lng,
                'zoom' => 18,
                'addressdetails' => 1,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (!empty($data['address'])) {
                    $addr = $data['address'];
                    $road = $addr['road'] ?? $addr['pedestrian'] ?? $addr['street'] ?? $addr['suburb'] ?? '';
                    $subdivision = $addr['neighbourhood'] ?? $addr['residential'] ?? '';
                    $brgy = $addr['quarter'] ?? $addr['village'] ?? $addr['hamlet'] ?? '';
                    $city = $addr['city'] ?? $addr['town'] ?? $addr['municipality'] ?? '';
                    $state = $addr['state'] ?? $addr['province'] ?? 'Laguna';
                    $detectedCity = $city ?: null;

                    $parts = array_unique(array_filter([$road, $subdivision, $brgy, $city, $state]));
                    if (!empty($parts)) {
                        $resolvedAddress = implode(', ', $parts);
                        $shortAddress = implode(', ', array_filter([$road ?: $subdivision, $brgy ?: $city]));
                    }
                }
                if (!$resolvedAddress && !empty($data['display_name'])) {
                    $resolvedAddress = $data['display_name'];
                    $shortAddress = explode(',', $resolvedAddress)[0] ?? $resolvedAddress;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Nominatim reverse geocode error: ' . $e->getMessage());
        }

        // 2. High-speed Fallback: Photon Komoot
        if (!$resolvedAddress) {
            try {
                $pRes = Http::timeout(3)->get('https://photon.komoot.io/reverse', [
                    'lat' => $lat,
                    'lon' => $lng,
                ]);
                if ($pRes->successful()) {
                    $pData = $pRes->json();
                    $props = $pData['features'][0]['properties'] ?? null;
                    if ($props) {
                        $name = $props['name'] ?? '';
                        $street = $props['street'] ?? '';
                        $locality = $props['locality'] ?? $props['district'] ?? '';
                        $city = $props['city'] ?? '';
                        $state = $props['state'] ?? 'Laguna';
                        $detectedCity = $city ?: $detectedCity;
                        $parts = array_unique(array_filter([$name, $street, $locality, $city, $state]));
                        if (!empty($parts)) {
                            $resolvedAddress = implode(', ', $parts);
                            $shortAddress = $name ?: ($street ?: $city);
                        }
                    }
                }
            } catch (\Throwable $e) {
                // Ignore fallback error
            }
        }

        // 3. Fallback: BigDataCloud Reverse Geocoder
        if (!$resolvedAddress) {
            try {
                $bdcRes = Http::timeout(3)->get('https://api.bigdatacloud.net/data/reverse-geocode-client', [
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'localityLanguage' => 'en',
                ]);
                if ($bdcRes->successful()) {
                    $bdc = $bdcRes->json();
                    $locality = $bdc['locality'] ?? $bdc['city'] ?? '';
                    $city = $bdc['city'] ?? '';
                    $state = $bdc['principalSubdivision'] ?? 'Laguna';
                    $detectedCity = $city ?: $detectedCity;
                    $parts = array_unique(array_filter([$locality, $city, $state]));
                    if (!empty($parts)) {
                        $resolvedAddress = implode(', ', $parts);
                        $shortAddress = $locality ?: $city;
                    }
                }
            } catch (\Throwable $e) {
                // Ignore fallback error
            }
        }

        // 4. Validate against hardcoded 18 Santa Rosa Barangays
        $detection = SantaRosaDeliveryService::detectFromCoordinates($lat, $lng, $resolvedAddress, $detectedCity);
        $matchedBarangay = $detection['matched'] ? $detection['barangay'] : null;

        if (!$resolvedAddress) {
            if ($matchedBarangay) {
                $resolvedAddress = "Brgy. {$matchedBarangay['name']}, Santa Rosa, Laguna";
                $shortAddress = "Brgy. {$matchedBarangay['name']}";
            } else {
                $resolvedAddress = sprintf('Outside Delivery Area (%.5f, %.5f)', $lat, $lng);
                $shortAddress = 'Outside Delivery Area';
            }
        } elseif ($matchedBarangay && !SantaRosaDeliveryService::detectFromText($resolvedAddress)['matched']) {
            // Ensure the detected Santa Rosa barangay is explicitly included in the resolved address
            $resolvedAddress = rtrim($resolvedAddress, ', ') . ", Brgy. {$matchedBarangay['name']}";
        }

        $result = [
            'address' => $resolvedAddress,
            'short_address' => $shortAddress ?: $resolvedAddress,
            'city' => $detectedCity,
            'is_serviceable' => $matchedBarangay !== null,
            'detected_barangay' => $matchedBarangay['name'] ?? null,
            'estimated_delivery_time' => $matchedBarangay['eta'] ?? null,
            'rejection_reason' => $matchedBarangay ? null : SantaRosaDeliveryService::rejectionMessage($detection),
            'lat' => $lat,
            'lng' => $lng,
        ];

        Cache::put($cacheKey, $result, 3600);

        return response()->json($result);
    }

    public function searchAddress(Request $request)
    {
        $q = trim($request->query('q', ''));
        if (!$q) {
            return response()->json([]);
        }

        $queryWithContext = str_contains(strtolower($q), 'santa rosa') ? $q : "{$q}, Santa Rosa, Laguna";
        $cacheKey = 'geo_search_' . md5(strtolower($queryWithContext));
        $cached = Cache::get($cacheKey);
        if ($cached) {
            return response()->json($cached);
        }

        $results = [];

        try {
            $res = Http::withHeaders([
                'User-Agent' => 'GShotTeas/1.0 (sti-santa-rosa-capstone; info@gshotteas.ph)',
                'Accept-Language' => 'en',
            ])->timeout(4)->get('https://nominatim.openstreetmap.org/search', [
                'format' => 'json',
                'q' => $queryWithContext,
                'addressdetails' => 1,
                'limit' => 5,
            ]);

            if ($res->successful()) {
                $list = $res->json();
                if (!empty($list)) {
                    $results = $list;
                }
            }

            if (empty($results) && $queryWithContext !== $q) {
                $res2 = Http::withHeaders([
                    'User-Agent' => 'GShotTeas/1.0 (sti-santa-rosa-capstone; info@gshotteas.ph)',
                    'Accept-Language' => 'en',
                ])->timeout(4)->get('https://nominatim.openstreetmap.org/search', [
                    'format' => 'json',
                    'q' => $q,
                    'addressdetails' => 1,
                    'limit' => 5,
                ]);
                if ($res2->successful()) {
                    $results = $res2->json();
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Nominatim search error: ' . $e->getMessage());
        }

        if (!empty($results)) {
            Cache::put($cacheKey, $results, 3600);
        }

        return response()->json($results);
    }
}



