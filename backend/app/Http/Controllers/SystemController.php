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
                'paymongo_available' => 'true',
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
        } elseif (isset($data['paymongo_available'])) {
            $isAvail = in_array($data['paymongo_available'], ['true', true, '1', 1], true);
            $action = $isAvail ? 'PayMongo Marked Available' : 'PayMongo Flagged Unavailable';
            $details = $isAvail 
                ? 'PayMongo online payment gateway enabled for customer checkout.' 
                : 'PayMongo online payment gateway flagged unavailable. Customers restricted to Cash on Delivery / Counter.';
        } elseif (isset($data['order_area_note']) || isset($data['order_area_note_enabled'])) {
            $action = 'Order Area Notice Updated';
            $noteText = $data['order_area_note'] ?? 'Santa Rosa Bayan notice';
            $details = 'Updated customer order availability note: ' . $noteText;
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

        // Live menu context with real-time stock/availability status
        $products = Product::with('recipes.ingredient')->orderBy('name', 'asc')->get();
        $menuList = [];
        $outOfStockItems = [];
        $inStockItems = [];

        foreach ($products as $p) {
            $stockStatus = $p->stock_status;
            $maxPortions = $p->max_portions;

            if ($stockStatus === 'unavailable' || $stockStatus === 'soldout') {
                $statusTag = '[OUT OF STOCK]';
                $outOfStockItems[] = $p->name;
            } elseif ($stockStatus === 'low') {
                $statusTag = "[LOW STOCK - {$maxPortions} left]";
                $inStockItems[] = $p->name;
            } else {
                $statusTag = '[IN STOCK]';
                $inStockItems[] = $p->name;
            }

            $priceStr = '₱' . number_format($p->price, 2);
            if ($p->is_discounted && $p->original_price) {
                $priceStr .= ' (was ₱' . number_format($p->original_price, 2) . ')';
            }

            $menuList[] = "- {$p->name} ({$p->category}) {$statusTag}: {$priceStr} — {$p->description}";
        }
        $menuSummary = !empty($menuList) ? implode("\n", $menuList) : "No menu items available.";
        $outOfStockSummary = !empty($outOfStockItems)
            ? implode(', ', $outOfStockItems)
            : 'None (all menu items are currently in stock)';

        // Live announcements
        $announcements = \App\Models\Announcement::where('is_active', true)->get();
        $announcementList = [];
        foreach ($announcements as $a) {
            $announcementList[] = "- [{$a->badge}] {$a->title}: {$a->description}";
        }
        $announcementsSummary = !empty($announcementList) ? implode("\n", $announcementList) : "None at the moment.";

        // Live event booking packages
        \App\Models\BookingPackage::seedDefaultsIfEmpty();
        $bookingPackages = \App\Models\BookingPackage::where('is_active', true)->orderBy('sort_order')->orderBy('id')->get();
        $bookingPackageLines = [];
        foreach ($bookingPackages as $pkg) {
            $priceStr = '₱' . number_format($pkg->price, 0);
            if ($pkg->pricing_type === 'per_pack') {
                $priceStr .= " per {$pkg->base_pax} pax";
            } elseif ($pkg->pricing_type === 'per_guest') {
                $priceStr .= " per pax";
            } else {
                $priceStr .= " flat rate";
            }
            $bookingPackageLines[] = "{$pkg->name} ({$priceStr}" . ($pkg->description ? " — {$pkg->description}" : '') . ")";
        }
        $bookingPackagesSummary = !empty($bookingPackageLines)
            ? implode('; ', $bookingPackageLines)
            : "Coffee Package (₱3,500 for 50 pax) and Fruity Float Package (₱3,500 for 50 pax)";

        // Build comprehensive knowledge context for Gemini AI
        $systemPrompt = "You are G Shot Assistant, the official, intelligent, and friendly AI assistant for 'G Shot Teas' (a premier milk tea, burger, pizza, and coffee destination in Santa Rosa, Laguna).\n"
            . "You think freely, converse warmly, and answer customer inquiries accurately and naturally (in friendly English or Taglish).\n\n"
            . "KEY STORE PROFILE:\n"
            . "- Store Owner & Proprietor: {$owner} (Jefferson Anore Alulod)\n"
            . "- Official Address / Location: {$address}\n"
            . "- Contact / Phone: {$phone} (Direct to Jefferson Alulod) or +63 912 345 6789\n"
            . "- Business Hours: Monday to Saturday, 9:00 AM – 10:00 PM (Closed on Sundays)\n"
            . "- Walk-In Orders: YES! Walk-in orders for dine-in and takeout are 100% welcomed directly at our physical store at {$address}. Customers can also order online through this website for delivery or pickup!\n"
            . "- Payment Methods: PayMongo Online Payment (QR Ph, E-Wallets & Online Banking) and Cash on Delivery (COD) / Cash at Counter for walk-ins.\n"
            . "- Event Catering & Mobile Bar: {$bookingPackagesSummary}. Inquiries handled directly by {$owner} ({$phone}).\n\n"
            . "CURRENT STORE MENU, PRICES & LIVE STOCK STATUS:\n{$menuSummary}\n\n"
            . "CURRENTLY OUT OF STOCK ITEMS:\n{$outOfStockSummary}\n\n"
            . "LIVE PROMOTIONS & ANNOUNCEMENTS:\n{$announcementsSummary}\n\n"
            . "GUIDELINES FOR YOUR RESPONSE:\n"
            . "1. Answer the customer's specific query directly and intelligently.\n"
            . "2. If asked 'can I order walk in' or about visiting, warmly confirm that walk-ins are welcomed and provide the address: {$address}.\n"
            . "3. If asked who owns the store, state proudly that G Shot Teas is owned and operated by {$owner}.\n"
            . "4. Keep answers engaging, helpful, and concise with clean Markdown formatting when listing recommendations.\n"
            . "5. ALWAYS check each menu item's stock tag ([IN STOCK], [LOW STOCK - X left], or [OUT OF STOCK]) before answering.\n"
            . "6. If a customer asks about an item marked [OUT OF STOCK], clearly inform them that it is currently out of stock / unavailable right now, and suggest similar [IN STOCK] alternatives from the menu.\n"
            . "7. Never recommend [OUT OF STOCK] items as available to order; when listing menu items or best sellers, clearly note if an item is [OUT OF STOCK] or [LOW STOCK].\n"
            . "8. Do not invent products not listed in the menu.";

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

        if (str_contains($message, 'out of stock') || str_contains($message, 'available') || str_contains($message, 'stock') || str_contains($message, 'menu')) {
            $matchedProducts = $products->filter(fn($p) => str_contains($message, strtolower($p->name)));
            if ($matchedProducts->isNotEmpty()) {
                $lines = $matchedProducts->map(function ($p) {
                    $isOos = in_array($p->stock_status, ['unavailable', 'soldout'], true);
                    if ($isOos) {
                        return "❌ **{$p->name}** is currently **Out of Stock**.";
                    }
                    if ($p->stock_status === 'low') {
                        return "⚠️ **{$p->name}** is **In Stock** (Low stock: {$p->max_portions} left) — ₱" . number_format($p->price, 2) . ".";
                    }
                    return "✅ **{$p->name}** is **In Stock** — ₱" . number_format($p->price, 2) . ".";
                })->implode("\n");

                return response()->json([
                    'reply' => $lines,
                    'ai_powered' => false
                ]);
            }

            $reply = "Here is our current menu availability at **G Shot Teas**:\n\n";
            if (!empty($outOfStockItems)) {
                $reply .= "❌ **Currently Out of Stock:** " . implode(', ', $outOfStockItems) . "\n\n";
            } else {
                $reply .= "✅ **All menu items are currently in stock!**\n\n";
            }
            if (!empty($inStockItems)) {
                $reply .= "✅ **Available Now:** " . implode(', ', array_slice($inStockItems, 0, 12));
                if (count($inStockItems) > 12) {
                    $reply .= " (and " . (count($inStockItems) - 12) . " more on our Menu section)";
                }
            }
            return response()->json([
                'reply' => $reply,
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

        $cacheKey = 'rev_geo_v2_' . round($lat, 4) . '_' . round($lng, 4);
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



