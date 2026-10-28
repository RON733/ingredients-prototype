<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\Recipe;
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
            'pin' => '1111',
            'phone' => '09685002301',
            'address' => 'BLK 6 LOT 22 BSRV1, Brgy. Pooc, Santa Rosa, Laguna',
            'status' => 'active',
        ]);

        $admin = User::create([
            'name' => 'Jefferson Anore Alulod',
            'email' => 'admin@gshotteas.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'pin' => '2222',
            'phone' => '+63 912 345 6789',
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

        // 2. Seed Ingredients (Prototype Inventory)
        $ingredients = [
            ['id' => 'brioche-bun',    'name' => 'Brioche Bun',       'category' => 'Bakery',  'stock' => 35, 'unit' => 'pcs',    'low_threshold' => 10],
            ['id' => 'beef-patty',     'name' => 'Beef Patty',        'category' => 'Meat',    'stock' => 45, 'unit' => 'pcs',    'low_threshold' => 12],
            ['id' => 'cheddar-slice',  'name' => 'Cheddar Slice',     'category' => 'Dairy',   'stock' => 50, 'unit' => 'slices', 'low_threshold' => 15],
            ['id' => 'lettuce',        'name' => 'Fresh Lettuce',     'category' => 'Produce', 'stock' => 25, 'unit' => 'pcs',    'low_threshold' => 8],
            ['id' => 'pizza-dough',    'name' => 'Pizza Dough Base',  'category' => 'Bakery',  'stock' => 20, 'unit' => 'pcs',    'low_threshold' => 5],
            ['id' => 'mozzarella',     'name' => 'Mozzarella Cheese', 'category' => 'Dairy',   'stock' => 30, 'unit' => 'slices', 'low_threshold' => 10],
            ['id' => 'tomato-sauce',   'name' => 'Italian Pizza Sauce','category' => 'Produce', 'stock' => 40, 'unit' => 'cups',   'low_threshold' => 10],
            ['id' => 'pepperoni',      'name' => 'Pepperoni Slices',  'category' => 'Meat',    'stock' => 60, 'unit' => 'slices', 'low_threshold' => 15],
            ['id' => 'potato-fries',   'name' => 'Cut Potato Fries',  'category' => 'Produce', 'stock' => 30, 'unit' => 'portions','low_threshold' => 8],
            ['id' => 'chicken-wings',  'name' => 'Crispy Wings Cut',  'category' => 'Meat',    'stock' => 50, 'unit' => 'pcs',    'low_threshold' => 12],
            ['id' => 'cooked-rice',    'name' => 'Steamed Rice',      'category' => 'Produce', 'stock' => 60, 'unit' => 'cups',   'low_threshold' => 15],
            ['id' => 'tea-base',       'name' => 'Brewed Tea Base',   'category' => 'Produce', 'stock' => 50, 'unit' => 'cups',   'low_threshold' => 12],
            ['id' => 'fresh-milk',     'name' => 'Fresh Dairy Milk',  'category' => 'Dairy',   'stock' => 45, 'unit' => 'cups',   'low_threshold' => 10],
            ['id' => 'tapioca-pearls', 'name' => 'Chewy Tapioca Pearls','category' => 'Bakery','stock' => 55, 'unit' => 'cups',   'low_threshold' => 15],
            ['id' => 'brown-sugar',    'name' => 'Brown Sugar Syrup', 'category' => 'Produce', 'stock' => 35, 'unit' => 'cups',   'low_threshold' => 8],
            ['id' => 'matcha-powder',  'name' => 'Matcha Powder',      'category' => 'Produce', 'stock' => 25, 'unit' => 'scoops', 'low_threshold' => 6],
            ['id' => 'taro-powder',    'name' => 'Taro Flavor Powder','category' => 'Produce', 'stock' => 25, 'unit' => 'scoops', 'low_threshold' => 6],
            ['id' => 'cream-cheese',   'name' => 'Cream Cheese Puff', 'category' => 'Dairy',   'stock' => 30, 'unit' => 'scoops', 'low_threshold' => 8],
            ['id' => 'coffee-beans',   'name' => 'Espresso Roast',    'category' => 'Produce', 'stock' => 40, 'unit' => 'shots',  'low_threshold' => 10],
        ];

        foreach ($ingredients as $ing) {
            Ingredient::create($ing);
        }

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

        // 4. Seed Recipes (Product Ingredients)
        $recipes = [
            // Cheese Burger
            ['product_id' => 'classic-cheeseburger', 'ingredient_id' => 'brioche-bun',   'qty' => 1],
            ['product_id' => 'classic-cheeseburger', 'ingredient_id' => 'beef-patty',    'qty' => 1],
            ['product_id' => 'classic-cheeseburger', 'ingredient_id' => 'cheddar-slice', 'qty' => 1],
            ['product_id' => 'classic-cheeseburger', 'ingredient_id' => 'lettuce',       'qty' => 1],

            // Double Cheese Burger
            ['product_id' => 'double-cheeseburger', 'ingredient_id' => 'brioche-bun',   'qty' => 1],
            ['product_id' => 'double-cheeseburger', 'ingredient_id' => 'beef-patty',    'qty' => 2],
            ['product_id' => 'double-cheeseburger', 'ingredient_id' => 'cheddar-slice', 'qty' => 2],

            // Pepperoni Pizza
            ['product_id' => 'pepperoni-pizza', 'ingredient_id' => 'pizza-dough',  'qty' => 1],
            ['product_id' => 'pepperoni-pizza', 'ingredient_id' => 'tomato-sauce', 'qty' => 1],
            ['product_id' => 'pepperoni-pizza', 'ingredient_id' => 'mozzarella',   'qty' => 2],
            ['product_id' => 'pepperoni-pizza', 'ingredient_id' => 'pepperoni',    'qty' => 6],

            // All Cheese Pizza
            ['product_id' => 'all-cheese-pizza', 'ingredient_id' => 'pizza-dough',  'qty' => 1],
            ['product_id' => 'all-cheese-pizza', 'ingredient_id' => 'tomato-sauce', 'qty' => 1],
            ['product_id' => 'all-cheese-pizza', 'ingredient_id' => 'mozzarella',   'qty' => 3],
            ['product_id' => 'all-cheese-pizza', 'ingredient_id' => 'cheddar-slice', 'qty' => 2],

            // Chicken Wings Rice Meal
            ['product_id' => 'chicken-wings-rice', 'ingredient_id' => 'chicken-wings', 'qty' => 4],
            ['product_id' => 'chicken-wings-rice', 'ingredient_id' => 'cooked-rice',   'qty' => 1],

            // Loaded Fries
            ['product_id' => 'loaded-fries', 'ingredient_id' => 'potato-fries',  'qty' => 1],
            ['product_id' => 'loaded-fries', 'ingredient_id' => 'cheddar-slice', 'qty' => 2],

            // Milktea Classic
            ['product_id' => 'classic-milktea', 'ingredient_id' => 'tea-base',       'qty' => 1],
            ['product_id' => 'classic-milktea', 'ingredient_id' => 'fresh-milk',     'qty' => 1],
            ['product_id' => 'classic-milktea', 'ingredient_id' => 'tapioca-pearls', 'qty' => 1],

            // Brown Sugar Boba Milk
            ['product_id' => 'brown-sugar-milktea', 'ingredient_id' => 'fresh-milk',     'qty' => 1],
            ['product_id' => 'brown-sugar-milktea', 'ingredient_id' => 'brown-sugar',    'qty' => 1],
            ['product_id' => 'brown-sugar-milktea', 'ingredient_id' => 'tapioca-pearls', 'qty' => 1],

            // Matcha Latte
            ['product_id' => 'matcha-latte', 'ingredient_id' => 'matcha-powder',  'qty' => 2],
            ['product_id' => 'matcha-latte', 'ingredient_id' => 'fresh-milk',     'qty' => 1],
            ['product_id' => 'matcha-latte', 'ingredient_id' => 'tapioca-pearls', 'qty' => 1],

            // Taro Sweet Milktea
            ['product_id' => 'taro-milktea', 'ingredient_id' => 'taro-powder',    'qty' => 2],
            ['product_id' => 'taro-milktea', 'ingredient_id' => 'tea-base',       'qty' => 1],
            ['product_id' => 'taro-milktea', 'ingredient_id' => 'fresh-milk',     'qty' => 1],
            ['product_id' => 'taro-milktea', 'ingredient_id' => 'tapioca-pearls', 'qty' => 1],

            // Caramel Macchiato
            ['product_id' => 'caramel-macchiato', 'ingredient_id' => 'coffee-beans', 'qty' => 1],
            ['product_id' => 'caramel-macchiato', 'ingredient_id' => 'fresh-milk',   'qty' => 1],
        ];

        foreach ($recipes as $r) {
            Recipe::create($r);
        }

        // 5. Seed Historical / Initial Orders (Matches Figure 14 & 16 in document)
        $order1 = Order::create([
            'order_number' => '#30',
            'user_id' => $customer->id,
            'customer_name' => 'Jane Doe',
            'customer_phone' => '09989109529',
            'order_type' => 'Delivery',
            'delivery_address' => 'Phase 1 Mabuhay City, Cabuyao, Laguna, Marinig, Gulod, Cabuyao, Laguna, Calabarzon 4025, Philippines',
            'payment_method' => 'GCash',
            'payment_status' => 'Pending',
            'gcash_ref' => '908234819023',
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
                'payment_method' => ($i % 2 == 0) ? 'GCash' : 'Cash',
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
            'store_email' => 'info@gshotcafe.com',
            'business_hours' => 'Monday - Saturday: 9:00 AM - 10:00 PM',
            'delivery_fee' => '40.00',
            'gcash_account_name' => 'Jefferson A.',
            'gcash_account_number' => '0912 345 6789',
            'store_open' => 'true',
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
            'details' => 'Initial 12 menu items and raw ingredient inventory mapped.',
            'ip_address' => '127.0.0.1',
        ]);
        AuditLog::create([
            'user_name' => 'Mhar Anthony Lirio',
            'user_role' => 'staff',
            'action' => 'Inventory Audit Completed',
            'details' => 'Opening stock levels verified for brioche buns, tea bags, and syrups.',
            'ip_address' => '127.0.0.1',
        ]);
    }
}
