<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SystemSetting;
use App\Models\AuditLog;
use App\Models\Product;

class SystemController extends Controller
{
    public function settings()
    {
        $settings = SystemSetting::all()->pluck('value', 'key')->toArray();
        if (empty($settings['google_client_id']) && env('GOOGLE_CLIENT_ID')) {
            $settings['google_client_id'] = env('GOOGLE_CLIENT_ID');
        }
        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->all();
        foreach ($data as $key => $value) {
            SystemSetting::updateOrCreate(['key' => $key], ['value' => (string)$value]);
        }

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Super Admin',
            'user_role' => $request->user()?->role ?? 'super_admin',
            'action' => 'System Settings Updated',
            'details' => 'Modified system variables and store preferences.',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Settings updated successfully.',
            'settings' => SystemSetting::all()->pluck('value', 'key')
        ]);
    }

    public function auditLogs(Request $request)
    {
        $logs = AuditLog::latest()->paginate($request->input('per_page', 50));
        return response()->json($logs);
    }

    public function chatbot(Request $request)
    {
        $message = strtolower(trim($request->input('message', '')));

        // Get live menu highlights to answer pricing / bestsellers
        $products = Product::where('is_available', true)->get();

        if (empty($message)) {
            return response()->json([
                'reply' => "Hello! I am your G Shot Assistant 🧋 How can I help you today? You can ask about our menu, prices, best sellers, store location, or how to place an order!"
            ]);
        }

        // 1. Best sellers / recommendations
        if (str_contains($message, 'best') || str_contains($message, 'recommend') || str_contains($message, 'popular') || str_contains($message, 'favorite')) {
            return response()->json([
                'reply' => "🌟 Our top customer favorites are:\n\n1. **Cheese Burger** (₱89.00) — Juicy beef patty with golden brioche & melted cheddar.\n2. **Pepperoni Pizza** (₱169.00) — Crispy crust with mozzarella & savory pepperoni.\n3. **Chicken Wings Rice Meal** (₱129.00) — Glazed wings with fragrant steamed rice.\n4. **Milktea Classic** (₱49.00) & **Brown Sugar Boba** (₱69.00) — Chewy brown sugar pearls with fresh milk!\n\nWould you like to add any of these to your cart?"
            ]);
        }

        // 2. Menu inquiries
        if (str_contains($message, 'menu') || str_contains($message, 'food') || str_contains($message, 'drink') || str_contains($message, 'offer')) {
            $categories = $products->pluck('category')->unique()->implode(', ');
            return response()->json([
                'reply' => "We offer a delicious selection of **{$categories}**!\n\n• **Milktea & Drinks**: From ₱49 (Classic, Brown Sugar, Matcha, Taro)\n• **Burgers**: From ₱89 (Cheese Burger, Double Cheese)\n• **Pizzas**: From ₱159 (Pepperoni, All Cheese)\n• **Rice Meals**: ₱129 (Crispy Chicken Wings Rice)\n• **Snacks & Sides**: Loaded Cheese Fries (₱79) & Halo-Halo (₱99)!\n\nClick on the 'Menu' tab to browse full ingredients and customize your drink."
            ]);
        }

        // 3. Price inquiry
        if (str_contains($message, 'price') || str_contains($message, 'how much') || str_contains($message, 'cost')) {
            // Check if user named a specific product
            foreach ($products as $p) {
                if (str_contains($message, strtolower($p->name)) || str_contains($message, strtolower($p->id))) {
                    return response()->json([
                        'reply' => "The **{$p->name}** is priced at **₱" . number_format($p->price, 2) . "**! You can customize toppings and sizes in the menu."
                    ]);
                }
            }
            return response()->json([
                'reply' => "Our prices are student and family-friendly! Drinks start at just ₱49, burgers at ₱89, and pizzas at ₱159. Which item's price would you like to know?"
            ]);
        }

        // 4. Payment / GCash / COD
        if (str_contains($message, 'payment') || str_contains($message, 'pay') || str_contains($message, 'gcash') || str_contains($message, 'cod') || str_contains($message, 'cash')) {
            return response()->json([
                'reply' => "💳 We accept two convenient payment options:\n\n1. **GCash**: Scan or transfer to 0912 345 6789 (Jefferson A.) and input your reference number or upload your screenshot upon checkout.\n2. **Cash on Delivery (COD)**: Pay our rider upon delivery or pay at the counter during store pickup."
            ]);
        }

        // 5. Location / Store hours / Contact
        if (str_contains($message, 'where') || str_contains($message, 'location') || str_contains($message, 'address') || str_contains($message, 'hours') || str_contains($message, 'open') || str_contains($message, 'contact')) {
            return response()->json([
                'reply' => "📍 **Location**: Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna.\n⏰ **Operating Hours**: Monday to Saturday, 9:00 AM – 10:00 PM.\n📞 **Contact**: +63 912 345 6789 | info@gshotcafe.com"
            ]);
        }

        // 6. Catering / Events / Mobile bar
        if (str_contains($message, 'event') || str_contains($message, 'catering') || str_contains($message, 'mobile bar') || str_contains($message, 'party') || str_contains($message, 'bulk')) {
            return response()->json([
                'reply' => "🎉 Yes! We provide Mobile Bar, Milktea Booth, and Catering packages for birthdays, school events, and weddings! You can submit an event booking directly through our **Book Event** button on the website, or contact Mr. Jefferson directly at +63 912 345 6789."
            ]);
        }

        // 7. How to order
        if (str_contains($message, 'order') || str_contains($message, 'how to') || str_contains($message, 'buy')) {
            return response()->json([
                'reply' => "Ordering is quick and easy!\n1. Browse our **Menu** and click 'Add to Cart' or customize size and toppings.\n2. Open your Cart and proceed to **Checkout**.\n3. Enter your address (Delivery) or select Store Pickup.\n4. Choose **GCash** or **COD** and submit your order!\nYou can then track its live preparation progress on the Track Order page."
            ]);
        }

        // Default friendly response
        return response()->json([
            'reply' => "Thank you for messaging G Shot Teas! 😊 I can assist you with our menu items, prices, best-selling milk teas and burgers, store hours, GCash payments, and event bookings. What would you like to know?"
        ]);
    }
}
