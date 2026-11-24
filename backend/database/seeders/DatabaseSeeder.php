<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\EventBooking;
use App\Models\SystemSetting;
use App\Models\AuditLog;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Users (Roles: Super Admin, Admin, Staff, Customer)
        $superAdmin = User::create([
            'name' => 'Tyron Erick Rico',
            'email' => 'superadmin@gshotteas.com',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
            'phone' => '09685002301',
            'address' => 'BLK 6 LOT 22 BSRV1, Brgy. Pooc, Santa Rosa, Laguna',
            'status' => 'active',
        ]);

        $admin = User::create([
            'name' => 'Jefferson Anore Alulod',
            'email' => 'admin@gshotteas.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'phone' => '0994 612 1933',
            'address' => 'Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna',
            'status' => 'active',
        ]);

        $staff = User::create([
            'name' => 'Mhar Anthony Lirio',
            'email' => 'staff@gshotteas.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
            'pin' => '1234',
            'phone' => '09497564031',
            'address' => 'Purok 5 387, Brgy. Marinig, Cabuyao, Laguna',
            'status' => 'active',
        ]);

        $staff2 = User::create([
            'name' => 'Sarah Mae Santos',
            'email' => 'barista2@gshotteas.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
            'pin' => '5678',
            'phone' => '09171234567',
            'address' => 'Brgy. Tagapo, Santa Rosa, Laguna',
            'status' => 'active',
        ]);

        $customer = User::create([
            'name' => 'Jane Doe',
            'email' => 'customer@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'customer',
            'phone' => '09989109529',
            'address' => 'Phase 1 Mabuhay City, Cabuyao, Laguna',
            'status' => 'active',
        ]);

        $customer2 = User::create([
            'name' => 'Kurt Xyler Munoz',
            'email' => 'kurt@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'customer',
            'phone' => '09985677725',
            'address' => 'Phase 2 Annex A, St. Joseph Village 6, Cabuyao, Laguna',
            'status' => 'active',
        ]);

        // 3. Seed Menu Products
        $products = [
            [
                'id' => 'classic-cheeseburger',
                'name' => 'Cheese Burger',
                'category' => 'Burgers',
                'price' => 89.00,
                'description' => 'Juicy grilled beef patty, golden brioche bun, fresh lettuce, and melted rich cheddar cheese.',
                'emoji' => '🍔',
                'image' => '/assets/hero-banner.png',
                'is_available' => true,
            ],
            [
                'id' => 'double-cheeseburger',
                'name' => 'Double Cheese Burger',
                'category' => 'Burgers',
                'price' => 149.00,
                'description' => 'Double-stacked beef smash patties with double layers of cheddar and toasted brioche.',
                'emoji' => '🍔',
                'image' => '/assets/hero-banner.png',
                'is_available' => true,
            ],
            [
                'id' => 'pepperoni-pizza',
                'name' => 'Pepperoni Pizza',
                'category' => 'Pizzas',
                'price' => 169.00,
                'description' => 'Loaded with savory pepperoni cuts, premium mozzarella cheese blend, and signature Italian sauce.',
                'emoji' => '🍕',
                'image' => '/assets/menu-pizza.png',
                'is_available' => true,
            ],
            [
                'id' => 'all-cheese-pizza',
                'name' => 'All Cheese Pizza',
                'category' => 'Pizzas',
                'price' => 159.00,
                'description' => 'A cheesy paradise featuring melted mozzarella and cheddar cheese over seasoned tomato sauce.',
                'emoji' => '🍕',
                'image' => '/assets/menu-pizza.png',
                'is_available' => true,
            ],
            [
                'id' => 'chicken-wings-rice',
                'name' => 'Chicken Wings Rice Meal',
                'category' => 'RiceMeals',
                'price' => 129.00,
                'description' => 'Crispy flavorful glazed chicken wings served with fragrant steamed rice and dipping sauce.',
                'emoji' => '🍗',
                'image' => '/assets/hero-banner.png',
                'is_available' => true,
            ],
            [
                'id' => 'loaded-fries',
                'name' => 'Loaded Cheese Fries',
                'category' => 'Sides',
                'price' => 79.00,
                'description' => 'Crispy golden fries generously topped with warm melted cheddar cheese sauce.',
                'emoji' => '🍟',
                'image' => '/assets/hero-banner.png',
                'is_available' => true,
            ],
            [
                'id' => 'classic-milktea',
                'name' => 'Milktea Classic',
                'category' => 'Drinks',
                'price' => 49.00,
                'description' => 'Timeless brewed black tea infused with creamy milk and loaded with chewy brown sugar tapioca pearls.',
                'emoji' => '🧋',
                'image' => '/assets/menu-coffee.png',
                'is_available' => true,
            ],
            [
                'id' => 'brown-sugar-milktea',
                'name' => 'Brown Sugar Boba Milk',
                'category' => 'Drinks',
                'price' => 69.00,
                'description' => 'Warm tiger-striped brown sugar drizzle, fresh dairy milk, and slow-cooked boba pearls.',
                'emoji' => '🧋',
                'image' => '/assets/menu-coffee.png',
                'is_available' => true,
            ],
            [
                'id' => 'matcha-latte',
                'name' => 'Matcha Latte Series',
                'category' => 'Drinks',
                'price' => 79.00,
                'description' => 'Fine Japanese ceremonial matcha layered over cold fresh milk and sweet pearls.',
                'emoji' => '🍵',
                'image' => '/assets/menu-coffee.png',
                'is_available' => true,
            ],
            [
                'id' => 'taro-milktea',
                'name' => 'Taro Sweet Milktea',
                'category' => 'Drinks',
                'price' => 69.00,
                'description' => 'Rich velvety purple taro with tea essence, creamy dairy, and bouncy pearls.',
                'emoji' => '🧋',
                'image' => '/assets/menu-coffee.png',
                'is_available' => true,
            ],
            [
                'id' => 'caramel-macchiato',
                'name' => 'Iced Caramel Macchiato',
                'category' => 'Coffee',
                'price' => 89.00,
                'description' => 'Freshly extracted espresso shot combined with vanilla-infused milk and buttery caramel drizzle.',
                'emoji' => '☕',
                'image' => '/assets/menu-coffee.png',
                'is_available' => true,
            ],
            [
                'id' => 'halo-halo-deluxe',
                'name' => 'G Shot Halo-Halo',
                'category' => 'Sides',
                'price' => 99.00,
                'description' => 'Filipino shaved ice delicacy loaded with sweet jellies, leche flan, ube, and rich milk.',
                'emoji' => '🍧',
                'image' => '/assets/hero-banner.png',
                'is_available' => true,
            ],
        ];

        foreach ($products as $prod) {
            Product::create($prod);
        }

        $this->call(MenuCatalogSeeder::class);

        // 5. Seed Historical / Initial Orders (Matches Figure 14 & 16 in document)
        $order1 = Order::create([
            'order_number' => '#30',
            'user_id' => $customer->id,
            'customer_name' => 'Jane Doe',
            'customer_phone' => '09989109529',
            'order_type' => 'Delivery',
            'delivery_address' => 'Phase 1 Mabuhay City, Cabuyao, Laguna, Marinig, Gulod, Cabuyao, Laguna, Calabarzon 4025, Philippines',
            'payment_method' => 'Cash',
            'payment_status' => 'Pending',
            'status' => 'Pending',
            'subtotal' => 436.00,
            'delivery_fee' => 40.00,
            'total_amount' => 476.00,
            'notes' => 'Please deliver hot and ring the doorbell.',
            'created_at' => now()->subMinutes(15),
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => 'classic-cheeseburger',
            'product_name' => 'Cheese Burger',
            'unit_price' => 89.00,
            'quantity' => 1,
            'subtotal' => 89.00,
            'customization' => ['size' => 'Regular'],
        ]);
        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => 'pepperoni-pizza',
            'product_name' => 'Pepperoni Pizza',
            'unit_price' => 169.00,
            'quantity' => 1,
            'subtotal' => 169.00,
            'customization' => ['crust' => 'Crispy'],
        ]);
        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => 'chicken-wings-rice',
            'product_name' => 'Chicken Wings Rice Meal',
            'unit_price' => 129.00,
            'quantity' => 1,
            'subtotal' => 129.00,
            'customization' => ['sauce' => 'Sweet Spicy'],
        ]);
        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => 'classic-milktea',
            'product_name' => 'Milktea Classic',
            'unit_price' => 49.00,
            'quantity' => 1,
            'subtotal' => 49.00,
            'customization' => ['size' => 'Large', 'sugar' => '50%', 'ice' => 'Less Ice', 'toppings' => ['Tapioca Pearls']],
        ]);

        // Completed Order #29
        $order2 = Order::create([
            'order_number' => '#29',
            'user_id' => $customer->id,
            'customer_name' => 'Jane Doe',
            'customer_phone' => '09989109529',
            'order_type' => 'Store Pickup',
            'delivery_address' => 'Store Pickup - G Shot Teas Counter',
            'payment_method' => 'Cash',
            'payment_status' => 'Paid',
            'status' => 'Completed',
            'subtotal' => 436.00,
            'delivery_fee' => 0.00,
            'total_amount' => 436.00,
            'created_at' => now()->subDays(1),
        ]);
        OrderItem::create([
            'order_id' => $order2->id,
            'product_id' => 'classic-cheeseburger',
            'product_name' => 'Cheese Burger',
            'unit_price' => 89.00,
            'quantity' => 1,
            'subtotal' => 89.00,
        ]);
        OrderItem::create([
            'order_id' => $order2->id,
            'product_id' => 'pepperoni-pizza',
            'product_name' => 'Pepperoni Pizza',
            'unit_price' => 169.00,
            'quantity' => 1,
            'subtotal' => 169.00,
        ]);
        OrderItem::create([
            'order_id' => $order2->id,
            'product_id' => 'chicken-wings-rice',
            'product_name' => 'Chicken Wings Rice Meal',
            'unit_price' => 129.00,
            'quantity' => 1,
            'subtotal' => 129.00,
        ]);
        OrderItem::create([
            'order_id' => $order2->id,
            'product_id' => 'classic-milktea',
            'product_name' => 'Milktea Classic',
            'unit_price' => 49.00,
            'quantity' => 1,
            'subtotal' => 49.00,
        ]);

        // Completed Order #28
        $order3 = Order::create([
            'order_number' => '#28',
            'user_id' => $customer->id,
            'customer_name' => 'Jane Doe',
            'customer_phone' => '09989109529',
            'order_type' => 'Store Pickup',
            'delivery_address' => 'Store Pickup',
            'payment_method' => 'Cash',
            'payment_status' => 'Paid',
            'status' => 'Completed',
            'subtotal' => 129.00,
            'delivery_fee' => 0.00,
            'total_amount' => 129.00,
            'created_at' => now()->subDays(2),
        ]);
        OrderItem::create([
            'order_id' => $order3->id,
            'product_id' => 'chicken-wings-rice',
            'product_name' => 'Chicken Wings Rice Meal',
            'unit_price' => 129.00,
            'quantity' => 1,
            'subtotal' => 129.00,
        ]);

        // Additional completed orders for realistic analytics curve
        for ($i = 3; $i <= 7; $i++) {
            $amt = rand(150, 480);
            Order::create([
                'order_number' => '#' . (28 - $i),
                'user_id' => $customer2->id,
                'customer_name' => 'Kurt Xyler Munoz',
                'customer_phone' => '09985677725',
                'order_type' => ($i % 2 == 0) ? 'Delivery' : 'Store Pickup',
                'delivery_address' => 'St. Joseph Village 6, Cabuyao, Laguna',
                'payment_method' => 'Cash',
                'payment_status' => 'Paid',
                'status' => 'Completed',
                'subtotal' => $amt,
                'delivery_fee' => ($i % 2 == 0) ? 40 : 0,
                'total_amount' => $amt + (($i % 2 == 0) ? 40 : 0),
                'created_at' => now()->subDays($i)->setHour(14),
            ]);
        }

        // 6. Seed Event Bookings
        EventBooking::create([
            'user_id' => $customer->id,
            'client_name' => 'Jane Doe',
            'client_phone' => '09989109529',
            'client_email' => 'customer@gmail.com',
            'event_type' => 'Mobile Bar & Milktea Booth',
            'event_date' => now()->addDays(12)->toDateString(),
            'event_time' => '3:00 PM - 7:00 PM',
            'guest_count' => 80,
            'location' => 'Villa Caceres Clubhouse, Santa Rosa, Laguna',
            'package_name' => 'Premium Unlimited Milk Tea & Coffee Package',
            'estimated_cost' => 8500.00,
            'status' => 'Pending',
            'notes' => '18th Birthday Celebration. Would love Matcha and Brown Sugar flavors highlighted.',
        ]);

        // 7. Seed System Settings
        $settings = [
            'store_name' => 'G Shot Teas',
            'store_tagline' => 'Satisfy Yourself',
            'store_address' => 'Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna',
            'store_phone' => '+63 912 345 6789',
            'store_email' => 'gshotteas2@gmail.com',
            'business_hours' => 'Monday - Saturday: 9:00 AM - 10:00 PM',
            'delivery_fee' => '40.00',
            'store_open' => 'true',
            'order_area_note' => 'Orders are only available in Santa Rosa bayan.',
            'order_area_note_enabled' => 'true',
            'announcement' => 'Welcome to G Shot Teas! Free delivery on orders over ₱500.',
        ];
        foreach ($settings as $k => $v) {
            SystemSetting::create(['key' => $k, 'value' => $v]);
        }

        // 8. Seed Audit Log (Exclusively Staff, Admin, and Super Admin)
        AuditLog::create([
            'user_name' => 'Tyron Erick Rico',
            'user_role' => 'super_admin',
            'action' => 'System Initialized',
            'details' => 'Database migrations and core seeders successfully populated.',
            'ip_address' => '127.0.0.1',
        ]);
        AuditLog::create([
            'user_name' => 'Jefferson Anore Alulod',
            'user_role' => 'admin',
            'action' => 'Menu Updated',
            'details' => 'Initial menu items mapped.',
            'ip_address' => '127.0.0.1',
        ]);
    }
}
