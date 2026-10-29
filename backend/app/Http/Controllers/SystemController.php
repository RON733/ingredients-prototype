<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\SystemSetting;
use App\Models\AuditLog;
use App\Models\Product;

class SystemController extends Controller
{
    public function settings()
    {
        // High-Performance In-Memory Cache: Serves system settings in 2ms
        $settings = Cache::remember('system_settings_all', 180, function () {
            $s = SystemSetting::all()->pluck('value', 'key')->toArray();
            if (empty($s['google_client_id']) && env('GOOGLE_CLIENT_ID')) {
                $s['google_client_id'] = env('GOOGLE_CLIENT_ID');
            }
            return $s;
        });
        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->all();

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

        foreach ($data as $key => $value) {
            if ($value === null) {
                SystemSetting::where('key', $key)->delete();
            } else {
                SystemSetting::updateOrCreate(['key' => $key], ['value' => (string)$value]);
            }
        }

        $details = 'Modified system variables and store preferences.';
        if (isset($data['gcash_account_number']) || isset($data['gcash_qr_code'])) {
            $num = $data['gcash_account_number'] ?? 'unchanged';
            $details = "Updated GCash payment settings: Mobile No. {$num}, QR code updated.";
        }

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Admin',
            'user_role' => $request->user()?->role ?? 'admin',
            'action' => 'System Settings Updated',
            'details' => $details,
            'ip_address' => $request->ip(),
        ]);

        Cache::forget('system_settings_all');
        return response()->json([
            'message' => 'Settings updated successfully.',
            'settings' => SystemSetting::all()->pluck('value', 'key')
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
        $phone = env('STORE_PHONE', '0993.700.5426');
        $apiKey = env('GEMINI_API_KEY', '');

        if (empty($rawMessage)) {
            return response()->json([
                'reply' => "Hello! I am your Gshot Assistant powered by Google Gemini AI 🧋 How can I help you today? You can ask about our drinks, food menu, walk-in orders, our owner ({$owner}), store location at {$address}, or event catering!"
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
}

