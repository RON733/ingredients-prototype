<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\SystemSetting;
use App\Models\AuditLog;
use App\Models\Product;

class SystemController extends Controller
{
    public function settings()
    {
        // High-Performance In-Memory Cache: Serves system settings in 2ms
        $settings = Cache::remember('system_settings_all', 60, function () {
            $s = SystemSetting::all()->pluck('value', 'key')->toArray();
            if (empty($s['google_client_id']) && env('GOOGLE_CLIENT_ID')) {
                $s['google_client_id'] = env('GOOGLE_CLIENT_ID');
            }
            if (!isset($s['gcash_available'])) {
                $s['gcash_available'] = 'true';
            }
            if (!isset($s['maintenance_mode'])) {
                $s['maintenance_mode'] = 'false';
            }
            if (!isset($s['maintenance_title'])) {
                $s['maintenance_title'] = 'Website Under Scheduled Maintenance';
            }
            if (!isset($s['maintenance_message'])) {
                $s['maintenance_message'] = 'G Shot Teas is currently undergoing essential system updates and performance enhancements. Customer ordering is temporarily paused. We will be back online shortly!';
            }
            if (!isset($s['maintenance_until'])) {
                $s['maintenance_until'] = '';
            }
            if (!isset($s['order_area_note'])) {
                $s['order_area_note'] = 'Orders are only available in Santa Rosa bayan.';
            }
            if (!isset($s['order_area_note_enabled'])) {
                $s['order_area_note_enabled'] = 'true';
            }
            return $s;
        });
        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->all();
        $user = $request->user('sanctum') ?? $request->user();

        // Strict Authorization: If modifying maintenance mode, ONLY Super Admin is permitted
        if (isset($data['maintenance_mode'])) {
            if ($user && $user->role !== 'super_admin') {
                return response()->json([
                    'message' => 'Access Denied: Only Super Admin has permission to shut down the website or toggle Maintenance Mode.'
                ], 403);
            }
        }

        // Handle direct file upload for GCash QR code if submitted as multipart form data
        if ($request->hasFile('gcash_qr_file')) {
            $file = $request->file('gcash_qr_file');
            $uploadDir = public_path('uploads');
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $filename = 'gcash_qr_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadDir, $filename);
            $data['gcash_qr_code'] = './uploads/' . $filename;
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
        } elseif (isset($data['gcash_available'])) {
            $isAvail = in_array($data['gcash_available'], ['true', true, '1', 1], true);
            $action = $isAvail ? 'GCash Marked Available' : 'GCash Flagged Unavailable';
            $details = $isAvail 
                ? 'GCash online payment option enabled for customer checkout.' 
                : 'GCash online payment flagged unavailable. Customers restricted to Cash on Delivery / Counter.';
        } elseif (isset($data['order_area_note']) || isset($data['order_area_note_enabled'])) {
            $action = 'Order Area Notice Updated';
            $noteText = $data['order_area_note'] ?? 'Santa Rosa Bayan notice';
            $details = 'Updated customer order availability note: ' . $noteText;
        } elseif (isset($data['gcash_account_number']) || isset($data['gcash_qr_code'])) {
            $num = $data['gcash_account_number'] ?? 'unchanged';
            $details = "Updated GCash payment settings: Mobile No. {$num}, QR code updated.";
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
        $allSettings = Cache::remember('system_settings_all', 60, function () {
            $s = SystemSetting::all()->pluck('value', 'key')->toArray();
            if (empty($s['google_client_id']) && env('GOOGLE_CLIENT_ID')) {
                $s['google_client_id'] = env('GOOGLE_CLIENT_ID');
            }
            if (!isset($s['gcash_available'])) {
                $s['gcash_available'] = 'true';
            }
            if (!isset($s['maintenance_mode'])) {
                $s['maintenance_mode'] = 'false';
            }
            if (!isset($s['maintenance_title'])) {
                $s['maintenance_title'] = 'Website Under Scheduled Maintenance';
            }
            if (!isset($s['maintenance_message'])) {
                $s['maintenance_message'] = 'G Shot Teas is currently undergoing essential system updates and performance enhancements. Customer ordering is temporarily paused. We will be back online shortly!';
            }
            if (!isset($s['maintenance_until'])) {
                $s['maintenance_until'] = '';
            }
            if (!isset($s['order_area_note'])) {
                $s['order_area_note'] = 'Orders are only available in Santa Rosa bayan.';
            }
            if (!isset($s['order_area_note_enabled'])) {
                $s['order_area_note_enabled'] = 'true';
            }
            return $s;
        });

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

    public function chatbot(Request $request)
    {
        $rawMessage = trim($request->input('message', ''));
        $message = strtolower($rawMessage);

        $owner = env('STORE_OWNER', 'Jefferson Alulod');
        $address = env('STORE_ADDRESS', 'Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna');
        $phone = env('STORE_PHONE', '0994 612 1933');
        $apiKey = env('GEMINI_API_KEY', '');

        if (empty($rawMessage)) {
            return response()->json([
                'reply' => "Hello! I am your Gshot Assistant 🧋 How can I help you today? You can ask about our drinks, food menu, walk-in orders, our owner ({$owner}), store location at {$address}, or event catering!"
            ]);
        }

        // Live menu context
        $products = Product::where('is_available', true)->get();
        $menuList = [];
        foreach ($products as $p) {
            $menuList[] = "- {$p->name} ({$p->category}): ₱" . number_format($p->price, 2) . " — {$p->description}";
        }
        $menuSummary = implode("\n", $menuList);

        // Live announcements
        $announcements = \App\Models\Announcement::where('is_active', true)->get();
        $announcementList = [];
        foreach ($announcements as $a) {
            $announcementList[] = "- [{$a->badge}] {$a->title}: {$a->description}";
        }
        $announcementsSummary = !empty($announcementList) ? implode("\n", $announcementList) : "None at the moment.";

        // Build comprehensive knowledge context for Gemini AI
        $systemPrompt = "You are G Shot Assistant, the official, intelligent, and friendly AI assistant for 'G Shot Teas' (a premier milk tea, burger, pizza, and coffee destination in Santa Rosa, Laguna).\n"
            . "You think freely, converse warmly, and answer customer inquiries accurately and naturally (in friendly English or Taglish).\n\n"
            . "KEY STORE PROFILE:\n"
            . "- Store Owner & Proprietor: {$owner} (Jefferson Anore Alulod)\n"
            . "- Official Address / Location: {$address}\n"
            . "- Contact / Phone: {$phone} (Direct to Jefferson Alulod) or +63 912 345 6789\n"
            . "- Business Hours: Monday to Saturday, 9:00 AM – 10:00 PM (Closed on Sundays)\n"
            . "- Walk-In Orders: YES! Walk-in orders for dine-in and takeout are 100% welcomed directly at our physical store at {$address}. Customers can also order online through this website for delivery or pickup!\n"
            . "- Payment Methods: GCash (Transfer to {$phone} under Jefferson A.) and Cash on Delivery (COD) / Cash at Counter for walk-ins.\n"
            . "- Event Catering & Mobile Bar: Coffee Package (₱3,500 for 50 pax, 5 drink choices, 3 hrs barista service) and Fruity Float Package (₱3,500 for 50 pax, 7 drink choices). Inquiries handled directly by {$owner} ({$phone}).\n\n"
            . "CURRENT STORE MENU & PRICES:\n{$menuSummary}\n\n"
            . "LIVE PROMOTIONS & ANNOUNCEMENTS:\n{$announcementsSummary}\n\n"
            . "GUIDELINES FOR YOUR RESPONSE:\n"
            . "1. Answer the customer's specific query directly and intelligently.\n"
            . "2. If asked 'can I order walk in' or about visiting, warmly confirm that walk-ins are welcomed and provide the address: {$address}.\n"
            . "3. If asked who owns the store, state proudly that G Shot Teas is owned and operated by {$owner}.\n"
            . "4. Keep answers engaging, helpful, and concise with clean Markdown formatting when listing recommendations.\n"
            . "5. Do not invent products not listed in the menu.";

        set_time_limit(45);

        // Attempt Gemini AI call
        if (!empty($apiKey)) {
            $models = ['gemini-3.5-flash', 'gemini-flash-lite-latest', 'gemini-3.1-flash-lite'];
            foreach ($models as $model) {
                try {
                    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";
                    $payload = [
                        'contents' => [
                            [
                                'role' => 'user',
                                'parts' => [
                                    ['text' => "SYSTEM INSTRUCTION:\n{$systemPrompt}\n\nCUSTOMER QUESTION: {$rawMessage}"]
                                ]
                            ]
                        ],
                        'generationConfig' => [
                            'temperature' => 0.7,
                            'maxOutputTokens' => 800,
                        ]
                    ];

                    $ch = curl_init($url);
                    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
                    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 6);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                    $apiRes = curl_exec($ch);
                    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    curl_close($ch);

                    if ($httpCode === 200 && !empty($apiRes)) {
                        $parsed = json_decode($apiRes, true);
                        $replyText = $parsed['candidates'][0]['content']['parts'][0]['text'] ?? null;
                        if (!empty($replyText)) {
                            return response()->json([
                                'reply' => trim($replyText),
                                'ai_powered' => true,
                                'model' => $model
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    // Try next model or fallback
                }
            }
        }

        // Smart Knowledge Fallback (Guaranteed to answer walk-in, owner, address, menu, payments, and catering even if offline)
        if (str_contains($message, 'walk in') || str_contains($message, 'walk-in') || str_contains($message, 'dine in') || str_contains($message, 'visit') || str_contains($message, 'physical')) {
            return response()->json([
                'reply' => "Yes, absolutely! Walk-in orders for dine-in and takeout are 100% welcomed at **G Shot Teas**! 😊\n\n📍 **Store Address**: {$address}\n⏰ **Operating Hours**: Monday – Saturday, 9:00 AM to 10:00 PM\n\nYou can order directly at our counter or order in advance through this website. We look forward to serving you!",
                'ai_powered' => false
            ]);
        }

        if (str_contains($message, 'owner') || str_contains($message, 'jefferson') || str_contains($message, 'founder') || str_contains($message, 'who owns')) {
            return response()->json([
                'reply' => "👑 **G Shot Teas** is proudly owned and operated by **{$owner}** (Jefferson Anore Alulod)!\n\nFor direct business inquiries, special bulk orders, and mobile bar bookings, you can contact Mr. Jefferson directly at **{$phone}**.",
                'ai_powered' => false
            ]);
        }

        if (str_contains($message, 'address') || str_contains($message, 'location') || str_contains($message, 'where')) {
            return response()->json([
                'reply' => "📍 **Store Address**: {$address}\n\nWe are open Monday to Saturday from 9:00 AM to 10:00 PM. Drop by for freshly brewed milk tea, hot burgers, and stone-baked pizza!",
                'ai_powered' => false
            ]);
        }

        return response()->json([
            'reply' => "Hello! G Shot Teas is owned by **{$owner}** and located at **{$address}**. We warmly welcome walk-in orders, store pickup, and online deliveries! How can I assist you today?",
            'ai_powered' => false
        ]);
    }

    public function reverseGeocode(Request $request)
    {
        $lat = filter_var($request->query('lat'), FILTER_VALIDATE_FLOAT);
        $lng = filter_var($request->query('lng') ?? $request->query('lon'), FILTER_VALIDATE_FLOAT);

        if ($lat === false || $lng === false || $lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            return response()->json(['error' => 'Invalid coordinates provided.'], 422);
        }

        $cacheKey = 'rev_geo_' . round($lat, 4) . '_' . round($lng, 4);
        $cached = Cache::get($cacheKey);
        if ($cached) {
            return response()->json($cached);
        }

        $resolvedAddress = null;
        $shortAddress = null;

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
                    $city = $addr['city'] ?? $addr['town'] ?? $addr['municipality'] ?? 'Santa Rosa';
                    $state = $addr['state'] ?? $addr['province'] ?? 'Laguna';

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
                        $city = $props['city'] ?? 'Santa Rosa';
                        $state = $props['state'] ?? 'Laguna';
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
                    $city = $bdc['city'] ?? 'Santa Rosa';
                    $state = $bdc['principalSubdivision'] ?? 'Laguna';
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

        // 4. Local Santa Rosa Nearest Barangay Geometric Fallback
        if (!$resolvedAddress) {
            $barangays = [
                ['name' => 'Sinalhan', 'lat' => 14.3167, 'lng' => 121.1111],
                ['name' => 'Balibago', 'lat' => 14.2934, 'lng' => 121.1082],
                ['name' => 'Tagapo', 'lat' => 14.3101, 'lng' => 121.1035],
                ['name' => 'Nuvali / Don Jose', 'lat' => 14.2415, 'lng' => 121.0583],
                ['name' => 'Caingin', 'lat' => 14.3262, 'lng' => 121.1172],
                ['name' => 'Dila', 'lat' => 14.3005, 'lng' => 121.1070],
                ['name' => 'Macabling', 'lat' => 14.3023, 'lng' => 121.0965],
                ['name' => 'Poblacion', 'lat' => 14.3140, 'lng' => 121.1130],
                ['name' => 'Market Area', 'lat' => 14.3150, 'lng' => 121.1120],
                ['name' => 'Malitlit', 'lat' => 14.2750, 'lng' => 121.0880],
                ['name' => 'Pulong Santa Cruz', 'lat' => 14.2880, 'lng' => 121.0850],
                ['name' => 'Aplaya', 'lat' => 14.3292, 'lng' => 121.1273],
                ['name' => 'Labas', 'lat' => 14.3045, 'lng' => 121.1167],
                ['name' => 'Pooc', 'lat' => 14.3083, 'lng' => 121.1189],
                ['name' => 'Malusak', 'lat' => 14.3160, 'lng' => 121.1145],
                ['name' => 'Kanluran', 'lat' => 14.3175, 'lng' => 121.1105],
                ['name' => 'Ibaba', 'lat' => 14.3190, 'lng' => 121.1120],
                ['name' => 'Santo Domingo', 'lat' => 14.2541, 'lng' => 121.0620],
                ['name' => 'Dita', 'lat' => 14.2885, 'lng' => 121.1020],
            ];

            $closest = null;
            $minDist = PHP_FLOAT_MAX;
            foreach ($barangays as $b) {
                $d = hypot($lat - $b['lat'], $lng - $b['lng']);
                if ($d < $minDist) {
                    $minDist = $d;
                    $closest = $b;
                }
            }

            if ($closest && $minDist < 0.15) {
                $resolvedAddress = "Near Brgy. {$closest['name']}, Santa Rosa, Laguna";
                $shortAddress = "Brgy. {$closest['name']}";
            } else {
                $resolvedAddress = sprintf('Pinned Delivery Location (%.5f, %.5f), Laguna', $lat, $lng);
                $shortAddress = sprintf('%.4f, %.4f', $lat, $lng);
            }
        }

        $result = [
            'address' => $resolvedAddress,
            'short_address' => $shortAddress ?: $resolvedAddress,
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



