<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\Recipe;

class MenuCatalogSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Complete G'Shot Teas Ingredients Inventory (preserves existing IDs & tops up depleted stocks)
        $ingredients = [
            // Existing core ingredients
            ['id' => 'brioche-bun',            'name' => 'Brioche Bun',                 'category' => 'Bakery',  'stock' => 60,  'unit' => 'pcs',      'low_threshold' => 15, 'cost' => 12.00],
            ['id' => 'beef-patty',             'name' => 'Beef Patty',                  'category' => 'Meat',    'stock' => 80,  'unit' => 'pcs',      'low_threshold' => 20, 'cost' => 28.50],
            ['id' => 'cheddar-slice',          'name' => 'Cheddar Slice',               'category' => 'Dairy',   'stock' => 90,  'unit' => 'slices',   'low_threshold' => 20, 'cost' => 6.50],
            ['id' => 'lettuce',                'name' => 'Fresh Lettuce',               'category' => 'Produce', 'stock' => 60,  'unit' => 'pcs',      'low_threshold' => 15, 'cost' => 4.00],
            ['id' => 'pizza-dough',            'name' => 'Pizza Dough Base',            'category' => 'Bakery',  'stock' => 60,  'unit' => 'pcs',      'low_threshold' => 12, 'cost' => 22.00],
            ['id' => 'mozzarella',             'name' => 'Mozzarella Cheese',           'category' => 'Dairy',   'stock' => 90,  'unit' => 'slices',   'low_threshold' => 20, 'cost' => 14.00],
            ['id' => 'tomato-sauce',           'name' => 'Italian Pizza Sauce',         'category' => 'Produce', 'stock' => 80,  'unit' => 'cups',     'low_threshold' => 15, 'cost' => 12.50],
            ['id' => 'pepperoni',              'name' => 'Pepperoni Slices',            'category' => 'Meat',    'stock' => 120, 'unit' => 'slices',   'low_threshold' => 25, 'cost' => 3.50],
            ['id' => 'potato-fries',           'name' => 'Cut Potato Fries',            'category' => 'Produce', 'stock' => 80,  'unit' => 'portions', 'low_threshold' => 15, 'cost' => 15.00],
            ['id' => 'chicken-wings',          'name' => 'Crispy Wings Cut',            'category' => 'Meat',    'stock' => 120, 'unit' => 'pcs',      'low_threshold' => 24, 'cost' => 18.00],
            ['id' => 'cooked-rice',            'name' => 'Steamed Rice',                'category' => 'Produce', 'stock' => 90,  'unit' => 'cups',     'low_threshold' => 20, 'cost' => 6.00],
            ['id' => 'tea-base',               'name' => 'Brewed Tea Base',             'category' => 'Produce', 'stock' => 120, 'unit' => 'cups',     'low_threshold' => 25, 'cost' => 5.00],
            ['id' => 'fresh-milk',             'name' => 'Fresh Dairy Milk',            'category' => 'Dairy',   'stock' => 120, 'unit' => 'cups',     'low_threshold' => 25, 'cost' => 14.00],
            ['id' => 'tapioca-pearls',         'name' => 'Chewy Tapioca Pearls',        'category' => 'Bakery',  'stock' => 100, 'unit' => 'cups',     'low_threshold' => 20, 'cost' => 8.50],
            ['id' => 'brown-sugar',            'name' => 'Brown Sugar Syrup',           'category' => 'Produce', 'stock' => 80,  'unit' => 'cups',     'low_threshold' => 15, 'cost' => 7.00],
            ['id' => 'matcha-powder',          'name' => 'Matcha Powder',               'category' => 'Produce', 'stock' => 80,  'unit' => 'scoops',   'low_threshold' => 15, 'cost' => 15.00],
            ['id' => 'taro-powder',            'name' => 'Taro Flavor Powder',          'category' => 'Produce', 'stock' => 60,  'unit' => 'scoops',   'low_threshold' => 12, 'cost' => 9.00],
            ['id' => 'cream-cheese',           'name' => 'Cream Cheese Puff',           'category' => 'Dairy',   'stock' => 80,  'unit' => 'scoops',   'low_threshold' => 15, 'cost' => 16.00],
            ['id' => 'coffee-beans',           'name' => 'Espresso Roast',              'category' => 'Produce', 'stock' => 100, 'unit' => 'shots',    'low_threshold' => 20, 'cost' => 8.00],

            // New G'Shot Menu Ingredients
            ['id' => 'bacon-strips',           'name' => 'Crispy Bacon Strips',         'category' => 'Meat',    'stock' => 70,  'unit' => 'slices',   'low_threshold' => 15, 'cost' => 12.00],
            ['id' => 'ham-slices',             'name' => 'Sweet Ham Slices',            'category' => 'Meat',    'stock' => 80,  'unit' => 'slices',   'low_threshold' => 20, 'cost' => 6.00],
            ['id' => 'pineapple-tidbits',      'name' => 'Pineapple Tidbits',           'category' => 'Produce', 'stock' => 60,  'unit' => 'portions', 'low_threshold' => 12, 'cost' => 8.00],
            ['id' => 'ground-beef',            'name' => 'Seasoned Ground Beef',        'category' => 'Meat',    'stock' => 60,  'unit' => 'portions', 'low_threshold' => 12, 'cost' => 24.00],
            ['id' => 'bell-pepper-onion',      'name' => 'Bell Peppers & Onions',       'category' => 'Produce', 'stock' => 70,  'unit' => 'portions', 'low_threshold' => 15, 'cost' => 6.00],
            ['id' => 'chicken-fillet',         'name' => 'Crispy Chicken Fillet',       'category' => 'Meat',    'stock' => 60,  'unit' => 'pcs',      'low_threshold' => 15, 'cost' => 28.00],
            ['id' => 'chicken-poppers-nuggets','name' => 'Chicken Poppers & Nuggets',   'category' => 'Meat',    'stock' => 60,  'unit' => 'portions', 'low_threshold' => 12, 'cost' => 25.00],
            ['id' => 'hotdog-sausage',         'name' => 'Jumbo Hotdog Sausage',        'category' => 'Meat',    'stock' => 70,  'unit' => 'pcs',      'low_threshold' => 15, 'cost' => 14.00],
            ['id' => 'hotdog-bun',             'name' => 'Soft Hotdog Bun',             'category' => 'Bakery',  'stock' => 70,  'unit' => 'pcs',      'low_threshold' => 15, 'cost' => 8.00],
            ['id' => 'corndog-batter',         'name' => 'Corndog Batter Mix',          'category' => 'Bakery',  'stock' => 60,  'unit' => 'portions', 'low_threshold' => 12, 'cost' => 10.00],
            ['id' => 'nachos-chips',           'name' => 'Crispy Tortilla Nacho Chips', 'category' => 'Bakery',  'stock' => 60,  'unit' => 'portions', 'low_threshold' => 12, 'cost' => 15.00],
            ['id' => 'onion-rings-raw',        'name' => 'Breaded Onion Rings',         'category' => 'Produce', 'stock' => 60,  'unit' => 'portions', 'low_threshold' => 12, 'cost' => 18.00],
            ['id' => 'mushroom-gravy',         'name' => 'Savory Mushroom Gravy',       'category' => 'Produce', 'stock' => 60,  'unit' => 'cups',     'low_threshold' => 12, 'cost' => 8.00],
            ['id' => 'wings-glaze-sauce',      'name' => 'Signature Wings Glaze',       'category' => 'Produce', 'stock' => 120, 'unit' => 'portions', 'low_threshold' => 25, 'cost' => 6.00],
            ['id' => 'cheese-sauce',           'name' => 'Melted Cheddar Cheese Sauce', 'category' => 'Dairy',   'stock' => 90,  'unit' => 'portions', 'low_threshold' => 20, 'cost' => 9.00],
            ['id' => 'fries-seasoning',        'name' => 'Flavored Fries Powder & Mayo','category' => 'Produce', 'stock' => 100, 'unit' => 'portions', 'low_threshold' => 20, 'cost' => 4.00],
            ['id' => 'fruit-syrup',            'name' => 'Fruit Series Syrup Blend',    'category' => 'Produce', 'stock' => 140, 'unit' => 'pumps',    'low_threshold' => 30, 'cost' => 7.00],
            ['id' => 'yakult-bottle',          'name' => 'Yakult Probiotic Drink',      'category' => 'Dairy',   'stock' => 70,  'unit' => 'bottles',  'low_threshold' => 15, 'cost' => 12.00],
            ['id' => 'soda-water',             'name' => 'Sparkling Soda Water',        'category' => 'Produce', 'stock' => 90,  'unit' => 'cups',     'low_threshold' => 20, 'cost' => 6.00],
            ['id' => 'thai-tea-mix',           'name' => 'Thai Tea & Condensed Mix',    'category' => 'Produce', 'stock' => 60,  'unit' => 'cups',     'low_threshold' => 12, 'cost' => 12.00],
            ['id' => 'chocolate-syrup',        'name' => 'Rich Chocolate & Mocha Sauce','category' => 'Produce', 'stock' => 100, 'unit' => 'pumps',    'low_threshold' => 20, 'cost' => 8.00],
            ['id' => 'caramel-syrup',          'name' => 'Salted Caramel Syrup',        'category' => 'Produce', 'stock' => 100, 'unit' => 'pumps',    'low_threshold' => 20, 'cost' => 8.00],
            ['id' => 'white-choco-sauce',      'name' => 'White Chocolate Sauce',       'category' => 'Dairy',   'stock' => 80,  'unit' => 'pumps',    'low_threshold' => 15, 'cost' => 9.00],
            ['id' => 'coldbrew-concentrate',   'name' => 'Coldbrew Coffee Concentrate', 'category' => 'Produce', 'stock' => 80,  'unit' => 'cups',     'low_threshold' => 15, 'cost' => 12.00],
            ['id' => 'frappe-base-powder',     'name' => 'Creamy Frappe Base & Cream',  'category' => 'Dairy',   'stock' => 100, 'unit' => 'scoops',   'low_threshold' => 20, 'cost' => 11.00],
            ['id' => 'java-oreo-chips',        'name' => 'Java Chip & Oreo Crumbs',     'category' => 'Bakery',  'stock' => 70,  'unit' => 'scoops',   'low_threshold' => 15, 'cost' => 10.00],
            ['id' => 'ube-avocado-mango-puree','name' => 'Ube, Avocado & Mango Puree',  'category' => 'Produce', 'stock' => 70,  'unit' => 'scoops',   'low_threshold' => 15, 'cost' => 14.00],
        ];

        foreach ($ingredients as $ing) {
            $existing = Ingredient::find($ing['id']);
            if ($existing) {
                $existing->name = $ing['name'];
                $existing->category = $ing['category'];
                $existing->unit = $ing['unit'];
                $existing->low_threshold = $ing['low_threshold'];
                if ($existing->cost === null || (float) $existing->cost <= 0) {
                    $existing->cost = $ing['cost'];
                }
                if ((float) $existing->stock < 30) {
                    $existing->stock = $ing['stock'];
                }
                $existing->save();
            } else {
                Ingredient::create($ing);
            }
        }

        // Shared Customization Templates matching the 3 G'Shot Menu Boards
        $wingsFlavours = [
            ['name' => 'Fireball Buffalo',  'price' => 0],
            ['name' => 'Spicy Honey Glaze', 'price' => 0],
            ['name' => 'Sweet Chili',       'price' => 0],
            ['name' => 'Japanese Teriyaki', 'price' => 0],
            ['name' => 'Sweet Barbeque',    'price' => 0],
            ['name' => 'Honey Garlic',      'price' => 0],
            ['name' => 'Orange Glaze',      'price' => 0],
            ['name' => 'Garlic Parmesan',   'price' => 0],
        ];

        $milkteaFlavours = [
            ['name' => 'Okinawa',          'price' => 0],
            ['name' => 'Chocolate',        'price' => 0],
            ['name' => 'Matcha',           'price' => 0],
            ['name' => 'Cookies & Cream',  'price' => 0],
            ['name' => 'Choco Strawberry', 'price' => 0],
            ['name' => 'Salted Caramel',   'price' => 0],
            ['name' => 'Taro',             'price' => 0],
        ];

        $fruitFlavours = [
            ['name' => 'Watermelon',     'price' => 0],
            ['name' => 'Mango',          'price' => 0],
            ['name' => 'Raspberry',      'price' => 0],
            ['name' => 'Strawberry',     'price' => 0],
            ['name' => 'Lychee',         'price' => 0],
            ['name' => 'Lemon',          'price' => 0],
            ['name' => 'Blue Raspberry', 'price' => 0],
            ['name' => 'Green Apple',    'price' => 0],
        ];

        $sodaFlavours = [
            ['name' => 'Watermelon',     'price' => 0],
            ['name' => 'Mango',          'price' => 0],
            ['name' => 'Raspberry',      'price' => 0],
            ['name' => 'Strawberry',     'price' => 0],
            ['name' => 'Blue Raspberry', 'price' => 0],
            ['name' => 'Green Apple',    'price' => 0],
        ];

        $drinkAddOns = [
            ['name' => 'Black Pearl',   'price' => 10],
            ['name' => 'Crystals',      'price' => 10],
            ['name' => 'Fruit Jelly',   'price' => 10],
            ['name' => 'Cream Cheese',  'price' => 30],
            ['name' => 'Espresso Shot', 'price' => 30],
        ];

        $coffeeAddOns = [
            ['name' => 'Espresso Shot', 'price' => 30],
            ['name' => 'Cream Cheese',  'price' => 30],
            ['name' => 'Black Pearl',   'price' => 10],
            ['name' => 'Crystals',      'price' => 10],
        ];

        $pizzaBaseAddOns = [
            ['name' => 'Extra Mozzarella', 'price' => 35],
            ['name' => 'Garlic Mayo Dip',  'price' => 15],
            ['name' => 'Chili Flakes',     'price' => 0],
        ];

        $friesFlavours = [
            ['name' => 'Sour & Cream', 'price' => 0],
            ['name' => 'BBQ',          'price' => 0],
            ['name' => 'Cheese',       'price' => 0],
        ];

        $flavoramaSauces = [
            ['name' => 'Glace Mayo Sauce',  'price' => 10],
            ['name' => 'Garlic Mayo Sauce', 'price' => 10],
        ];

        // 2. Complete Menu Products (All 3 Menu Boards + Existing Signature Items Preserved)
        $catalog = [
            // ================= PIZZAS (8 items) =================
            [
                'id' => 'all-cheese-pizza',
                'name' => 'All Cheese Pizza',
                'category' => 'Pizzas',
                'price' => 179.00,
                'description' => 'Cheesy paradise loaded with melted mozzarella and rich cheddar cheese over savory Italian pizza sauce. Sizes: 10", 12", 14".',
                'emoji' => '🍕',
                'image' => '/assets/menu/pizza_all_cheese.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '10"', 'price' => 0],
                        ['name' => '12"', 'price' => 40],
                        ['name' => '14"', 'price' => 90],
                    ],
                    'options' => $pizzaBaseAddOns,
                ],
                'recipes' => [['pizza-dough', 1], ['tomato-sauce', 1], ['mozzarella', 3], ['cheddar-slice', 2]],
            ],
            [
                'id' => 'hawaiian-pizza',
                'name' => 'Hawaiian Pizza',
                'category' => 'Pizzas',
                'price' => 99.00,
                'description' => 'Sweet golden pineapple tidbits paired with savory ham slices and bubbling mozzarella cheese. Sizes: 6", 10", 12", 14".',
                'emoji' => '🍕',
                'image' => '/assets/menu/pizza_hawaiian.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '6"',  'price' => 0],
                        ['name' => '10"', 'price' => 70],
                        ['name' => '12"', 'price' => 110],
                        ['name' => '14"', 'price' => 150],
                    ],
                    'options' => array_merge([['name' => 'Extra Pineapple', 'price' => 20]], $pizzaBaseAddOns),
                ],
                'recipes' => [['pizza-dough', 1], ['tomato-sauce', 1], ['mozzarella', 2], ['ham-slices', 3], ['pineapple-tidbits', 1]],
            ],
            [
                'id' => 'ham-and-cheese-pizza',
                'name' => 'Ham and Cheese Pizza',
                'category' => 'Pizzas',
                'price' => 99.00,
                'description' => 'Classic family favorite topped with tender sweet ham slices and generous melted mozzarella and cheddar cheese. Sizes: 6", 10", 12", 14".',
                'emoji' => '🍕',
                'image' => '/assets/menu/pizza_ham_cheese.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '6"',  'price' => 0],
                        ['name' => '10"', 'price' => 70],
                        ['name' => '12"', 'price' => 110],
                        ['name' => '14"', 'price' => 140],
                    ],
                    'options' => array_merge([['name' => 'Extra Ham', 'price' => 25]], $pizzaBaseAddOns),
                ],
                'recipes' => [['pizza-dough', 1], ['tomato-sauce', 1], ['mozzarella', 2], ['ham-slices', 4]],
            ],
            [
                'id' => 'all-meat-pizza',
                'name' => 'All Meat Pizza',
                'category' => 'Pizzas',
                'price' => 109.00,
                'description' => 'Meaty feast loaded with pepperoni, crispy bacon, sweet ham, seasoned ground beef, and melted mozzarella. Sizes: 6", 10", 12", 14".',
                'emoji' => '🍕',
                'image' => '/assets/menu/pizza_all_meat.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '6"',  'price' => 0],
                        ['name' => '10"', 'price' => 80],
                        ['name' => '12"', 'price' => 130],
                        ['name' => '14"', 'price' => 180],
                    ],
                    'options' => array_merge([['name' => 'Extra Bacon', 'price' => 25]], $pizzaBaseAddOns),
                ],
                'recipes' => [['pizza-dough', 1], ['tomato-sauce', 1], ['mozzarella', 2], ['pepperoni', 4], ['ham-slices', 2], ['bacon-strips', 2], ['ground-beef', 1]],
            ],
            [
                'id' => 'pepperoni-pizza',
                'name' => 'Pepperoni Pizza',
                'category' => 'Pizzas',
                'price' => 99.00,
                'description' => 'Loaded with savory pepperoni slices, premium mozzarella cheese blend, and signature Italian sauce. Sizes: 6", 10", 12", 14".',
                'emoji' => '🍕',
                'image' => '/assets/menu/pizza_pepperoni.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '6"',  'price' => 0],
                        ['name' => '10"', 'price' => 90],
                        ['name' => '12"', 'price' => 120],
                        ['name' => '14"', 'price' => 150],
                    ],
                    'options' => array_merge([['name' => 'Extra Pepperoni', 'price' => 25]], $pizzaBaseAddOns),
                ],
                'recipes' => [['pizza-dough', 1], ['tomato-sauce', 1], ['mozzarella', 2], ['pepperoni', 6]],
            ],
            [
                'id' => 'supreme-pizza',
                'name' => 'Supreme Pizza',
                'category' => 'Pizzas',
                'price' => 199.00,
                'description' => 'Balanced medley of pepperoni, ham, seasoned beef, crisp bell peppers, onions, and mozzarella. Sizes: 10", 12", 14".',
                'emoji' => '🍕',
                'image' => '/assets/menu/pizza_supreme.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '10"', 'price' => 0],
                        ['name' => '12"', 'price' => 40],
                        ['name' => '14"', 'price' => 80],
                    ],
                    'options' => $pizzaBaseAddOns,
                ],
                'recipes' => [['pizza-dough', 1], ['tomato-sauce', 1], ['mozzarella', 2], ['pepperoni', 4], ['ham-slices', 2], ['bell-pepper-onion', 1]],
            ],
            [
                'id' => 'gshot-overload-pizza',
                'name' => 'GShot Overload Pizza',
                'category' => 'Pizzas',
                'price' => 229.00,
                'description' => 'Our signature G\'Shot Overload Pizza stacked with meats, veggies, extra mozzarella, and signature garlic mayo drizzle! Sizes: 10", 12", 14".',
                'emoji' => '🍕',
                'image' => '/assets/menu/gshot_pizza.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '10"', 'price' => 0],
                        ['name' => '12"', 'price' => 40],
                        ['name' => '14"', 'price' => 100],
                    ],
                    'options' => $pizzaBaseAddOns,
                ],
                'recipes' => [['pizza-dough', 1], ['tomato-sauce', 1], ['mozzarella', 3], ['pepperoni', 4], ['bacon-strips', 2], ['ground-beef', 1], ['bell-pepper-onion', 1]],
            ],
            [
                'id' => 'beef-supreme-pizza',
                'name' => 'Beef Supreme Pizza',
                'category' => 'Pizzas',
                'price' => 109.00,
                'description' => 'Hearty seasoned ground beef, crisp bell peppers, onions, and melted mozzarella cheese on golden crust. Sizes: 6", 10", 12", 14".',
                'emoji' => '🍕',
                'image' => '/assets/menu/pizza_beef_supreme.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '6"',  'price' => 0],
                        ['name' => '10"', 'price' => 80],
                        ['name' => '12"', 'price' => 130],
                        ['name' => '14"', 'price' => 180],
                    ],
                    'options' => array_merge([['name' => 'Extra Ground Beef', 'price' => 30]], $pizzaBaseAddOns),
                ],
                'recipes' => [['pizza-dough', 1], ['tomato-sauce', 1], ['mozzarella', 2], ['ground-beef', 1], ['bell-pepper-onion', 1]],
            ],

            // ================= RICE MEALS & CHICKEN WINGS (5 items) =================
            [
                'id' => 'chicken-wings-rice',
                'name' => '2pcs Wings with Rice',
                'category' => 'RiceMeals',
                'price' => 99.00,
                'description' => '2pcs crispy glazed chicken wings served with steamed rice. Pick from 8 signature G\'Shot wing flavors!',
                'emoji' => '🍗',
                'image' => '/assets/menu/chicken_wings.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $wingsFlavours,
                    'options' => [
                        ['name' => 'Extra Steamed Rice', 'price' => 20],
                        ['name' => 'Garlic Mayo Sauce',  'price' => 10],
                        ['name' => 'Glace Mayo Sauce',   'price' => 10],
                    ],
                ],
                'recipes' => [['chicken-wings', 2], ['cooked-rice', 1], ['wings-glaze-sauce', 1]],
            ],
            [
                'id' => 'chicken-wings-4pcs',
                'name' => '4pcs Wings (1 Flavor)',
                'category' => 'RiceMeals',
                'price' => 149.00,
                'description' => '4pcs crispy fried chicken wings tossed in your choice of 1 signature glaze.',
                'emoji' => '🍗',
                'image' => '/assets/menu/chicken_wings.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $wingsFlavours,
                    'options' => [
                        ['name' => 'Add Steamed Rice',   'price' => 20],
                        ['name' => 'Garlic Mayo Sauce',  'price' => 10],
                        ['name' => 'Glace Mayo Sauce',   'price' => 10],
                    ],
                ],
                'recipes' => [['chicken-wings', 4], ['wings-glaze-sauce', 1]],
            ],
            [
                'id' => 'chicken-wings-6pcs',
                'name' => '6pcs Wings (2 Flavors)',
                'category' => 'RiceMeals',
                'price' => 199.00,
                'description' => '6pcs crispy fried chicken wings tossed in 2 different signature G\'Shot flavors of your choice!',
                'emoji' => '🍗',
                'image' => '/assets/menu/chicken_wings.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $wingsFlavours,
                    'second_flavours' => $wingsFlavours,
                    'options' => [
                        ['name' => 'Add Steamed Rice',   'price' => 20],
                        ['name' => 'Garlic Mayo Sauce',  'price' => 10],
                        ['name' => 'Glace Mayo Sauce',   'price' => 10],
                    ],
                ],
                'recipes' => [['chicken-wings', 6], ['wings-glaze-sauce', 2]],
            ],
            [
                'id' => 'burger-steak-1pc',
                'name' => 'Burger Steak (1pc with Rice)',
                'category' => 'RiceMeals',
                'price' => 89.00,
                'description' => 'Juicy 1pc grilled beef burger patty smothered in savory mushroom gravy served with steamed rice.',
                'emoji' => '🥩',
                'image' => '/assets/menu/burger_steak.webp',
                'customizations' => [
                    'sizes' => [],
                    'options' => [
                        ['name' => 'Extra Steamed Rice',   'price' => 20],
                        ['name' => 'Extra Mushroom Gravy', 'price' => 15],
                        ['name' => 'Add Cheddar Cheese',   'price' => 15],
                    ],
                ],
                'recipes' => [['beef-patty', 1], ['cooked-rice', 1], ['mushroom-gravy', 1]],
            ],
            [
                'id' => 'burger-steak-2pcs',
                'name' => 'Burger Steak (2pcs with Rice)',
                'category' => 'RiceMeals',
                'price' => 129.00,
                'description' => 'Double 2pcs juicy grilled beef patties drenched in rich mushroom gravy with steamed rice.',
                'emoji' => '🥩',
                'image' => '/assets/menu/burger_steak.webp',
                'customizations' => [
                    'sizes' => [],
                    'options' => [
                        ['name' => 'Extra Steamed Rice',   'price' => 20],
                        ['name' => 'Extra Mushroom Gravy', 'price' => 15],
                        ['name' => 'Add Cheddar Cheese',   'price' => 15],
                    ],
                ],
                'recipes' => [['beef-patty', 2], ['cooked-rice', 1], ['mushroom-gravy', 1]],
            ],

            // ================= BURGERS (4 items) =================
            [
                'id' => 'classic-cheeseburger',
                'name' => 'GS Classic Burger',
                'category' => 'Burgers',
                'price' => 89.00,
                'description' => 'Juicy grilled beef patty, toasted brioche bun, fresh lettuce, melted cheddar cheese, and signature dressing.',
                'emoji' => '🍔',
                'image' => '/assets/menu/burger_classic.webp',
                'customizations' => [
                    'sizes' => [],
                    'options' => [
                        ['name' => 'Extra Cheddar Cheese', 'price' => 15],
                        ['name' => 'Add Crispy Bacon',     'price' => 20],
                        ['name' => 'Extra Beef Patty',     'price' => 35],
                        ['name' => 'Garlic Mayo Sauce',    'price' => 10],
                    ],
                ],
                'recipes' => [['brioche-bun', 1], ['beef-patty', 1], ['cheddar-slice', 1], ['lettuce', 1]],
            ],
            [
                'id' => 'gs-bacon-burger',
                'name' => 'GS Bacon Burger',
                'category' => 'Burgers',
                'price' => 99.00,
                'description' => 'Savory beef patty stacked with crispy smoky bacon strips, melted cheddar cheese, lettuce, and brioche bun.',
                'emoji' => '🍔',
                'image' => '/assets/menu/burger_bacon.webp',
                'customizations' => [
                    'sizes' => [],
                    'options' => [
                        ['name' => 'Extra Cheddar Cheese', 'price' => 15],
                        ['name' => 'Extra Crispy Bacon',   'price' => 20],
                        ['name' => 'Extra Beef Patty',     'price' => 35],
                        ['name' => 'Garlic Mayo Sauce',    'price' => 10],
                    ],
                ],
                'recipes' => [['brioche-bun', 1], ['beef-patty', 1], ['bacon-strips', 2], ['cheddar-slice', 1], ['lettuce', 1]],
            ],
            [
                'id' => 'double-cheeseburger',
                'name' => 'Double Cheese Burger',
                'category' => 'Burgers',
                'price' => 149.00,
                'description' => 'Double-stacked beef smash patties with double layers of cheddar cheese and toasted brioche bun.',
                'emoji' => '🍔',
                'image' => '/assets/menu/burger_classic.webp',
                'customizations' => [
                    'sizes' => [],
                    'options' => [
                        ['name' => 'Extra Cheddar Cheese', 'price' => 15],
                        ['name' => 'Add Crispy Bacon',     'price' => 20],
                        ['name' => 'Garlic Mayo Sauce',    'price' => 10],
                    ],
                ],
                'recipes' => [['brioche-bun', 1], ['beef-patty', 2], ['cheddar-slice', 2]],
            ],
            [
                'id' => 'b1t1-burger',
                'name' => 'Buy 1 Take 1 Burger',
                'category' => 'Burgers',
                'price' => 109.00,
                'description' => 'Two freshly grilled classic beef burgers on soft toasted buns — perfect for sharing or double cravings!',
                'emoji' => '🍔',
                'image' => '/assets/menu/b1t1_burger.webp',
                'customizations' => [
                    'sizes' => [],
                    'options' => [
                        ['name' => 'Add Cheese (2pcs)', 'price' => 25],
                        ['name' => 'Garlic Mayo Sauce', 'price' => 10],
                        ['name' => 'Glace Mayo Sauce',  'price' => 10],
                    ],
                ],
                'recipes' => [['brioche-bun', 2], ['beef-patty', 2], ['lettuce', 2]],
            ],

            // ================= GBITES SNACKS / SIDES (11 items) =================
            [
                'id' => 'kerimoto',
                'name' => 'Kerimoto Snack Cup',
                'category' => 'Sides',
                'price' => 49.00,
                'description' => '2-in-1 crispy fries & refreshing drink in one handy G\'Shot cup! Available in GK1 (₱49), GK2 (₱59), GK3 (₱59), and GK4 (₱69).',
                'emoji' => '🍟',
                'image' => '/assets/menu/kerimoto.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => 'GK1 (Classic)',      'price' => 0],
                        ['name' => 'GK2 (Flavored)',     'price' => 10],
                        ['name' => 'GK3 (Special)',      'price' => 10],
                        ['name' => 'GK4 (Overload Cup)', 'price' => 20],
                    ],
                    'flavours' => $friesFlavours,
                    'options' => $flavoramaSauces,
                ],
                'recipes' => [['potato-fries', 1], ['fruit-syrup', 1], ['fries-seasoning', 1]],
            ],
            [
                'id' => 'regular-fries',
                'name' => 'Regular Fries',
                'category' => 'Sides',
                'price' => 40.00,
                'description' => 'Crispy golden cut potato fries lightly salted. Available in ₱40 (Regular), ₱60 (Medium), and ₱110 (Large).',
                'emoji' => '🍟',
                'image' => '/assets/menu/regular_fries.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => 'Regular (₱40)', 'price' => 0],
                        ['name' => 'Medium (₱60)',  'price' => 20],
                        ['name' => 'Large (₱110)',  'price' => 70],
                    ],
                    'options' => array_merge($flavoramaSauces, [['name' => 'Cheese Dip', 'price' => 15]]),
                ],
                'recipes' => [['potato-fries', 1]],
            ],
            [
                'id' => 'flavored-fries',
                'name' => 'Flavored Fries',
                'category' => 'Sides',
                'price' => 40.00,
                'description' => 'Crispy golden fries shaken in Sour & Cream, BBQ, or Cheese powder. Sizes: ₱40, ₱60, and ₱110.',
                'emoji' => '🍟',
                'image' => '/assets/menu/flavored_fries.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => 'Regular (₱40)', 'price' => 0],
                        ['name' => 'Medium (₱60)',  'price' => 20],
                        ['name' => 'Large (₱110)',  'price' => 70],
                    ],
                    'flavours' => $friesFlavours,
                    'options' => $flavoramaSauces,
                ],
                'recipes' => [['potato-fries', 1], ['fries-seasoning', 1]],
            ],
            [
                'id' => 'flavorama',
                'name' => 'Flavorama Fries & Sauce',
                'category' => 'Sides',
                'price' => 60.00,
                'description' => 'Crispy flavored fries (Sour & Cream, BBQ, or Cheese) drizzled with our signature Glace Mayo or Garlic Mayo Sauce!',
                'emoji' => '🍟',
                'image' => '/assets/menu/flavored_fries.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => 'Medium (₱60)', 'price' => 0],
                        ['name' => 'Large (₱110)', 'price' => 50],
                    ],
                    'flavours' => [
                        ['name' => '1. Glace Mayo Sauce',  'price' => 0],
                        ['name' => '2. Garlic Mayo Sauce', 'price' => 0],
                    ],
                    'second_flavours' => $friesFlavours,
                    'options' => [
                        ['name' => 'Extra Sauce Drizzle', 'price' => 15],
                        ['name' => 'Cheese Sauce Add-on', 'price' => 15],
                    ],
                ],
                'recipes' => [['potato-fries', 1], ['fries-seasoning', 2]],
            ],
            [
                'id' => 'b1t1-hotdog',
                'name' => 'Buy 1 Take 1 Hotdog',
                'category' => 'Sides',
                'price' => 109.00,
                'description' => 'Two savory grilled hotdog sandwiches in soft buns topped with classic dressing!',
                'emoji' => '🌭',
                'image' => '/assets/menu/hotdog_b1t1.webp',
                'customizations' => [
                    'sizes' => [],
                    'options' => array_merge([['name' => 'Cheese Sauce', 'price' => 15]], $flavoramaSauces),
                ],
                'recipes' => [['hotdog-sausage', 2], ['hotdog-bun', 2]],
            ],
            [
                'id' => 'cheesy-corndog',
                'name' => 'Cheesy Corndog',
                'category' => 'Sides',
                'price' => 89.00,
                'description' => 'Golden crispy battered hotdog corndog generously drizzled with warm melted cheese sauce.',
                'emoji' => '🌭',
                'image' => '/assets/menu/corndog_cheesy.webp',
                'customizations' => [
                    'sizes' => [],
                    'options' => array_merge([['name' => 'Extra Cheese Sauce', 'price' => 15]], $flavoramaSauces),
                ],
                'recipes' => [['hotdog-sausage', 1], ['corndog-batter', 1], ['cheese-sauce', 1]],
            ],
            [
                'id' => 'mozza-corndog',
                'name' => 'Mozza Corndog',
                'category' => 'Sides',
                'price' => 89.00,
                'description' => 'Stretchy mozzarella cheese stuffed inside golden crunchy Korean-style corndog batter!',
                'emoji' => '🧀',
                'image' => '/assets/menu/corndog.webp',
                'customizations' => [
                    'sizes' => [],
                    'options' => array_merge([['name' => 'Sugar Coat', 'price' => 0]], $flavoramaSauces),
                ],
                'recipes' => [['mozzarella', 2], ['hotdog-sausage', 1], ['corndog-batter', 1]],
            ],
            [
                'id' => 'loaded-fries',
                'name' => 'Overload Fries',
                'category' => 'Sides',
                'price' => 90.00,
                'description' => 'Crispy golden fries overloaded with warm cheddar cheese sauce, savory beef bits, and signature mayo drizzle.',
                'emoji' => '🍟',
                'image' => '/assets/menu/overload_fries_real.webp',
                'customizations' => [
                    'sizes' => [],
                    'options' => array_merge([
                        ['name' => 'Extra Cheese Sauce', 'price' => 20],
                        ['name' => 'Extra Bacon Bits',   'price' => 20],
                    ], $flavoramaSauces),
                ],
                'recipes' => [['potato-fries', 1], ['cheese-sauce', 1], ['ground-beef', 1]],
            ],
            [
                'id' => 'nachos',
                'name' => 'Nachos',
                'category' => 'Sides',
                'price' => 90.00,
                'description' => 'Crunchy tortilla nacho chips loaded with melted cheese sauce, seasoned beef, veggies, and dressing.',
                'emoji' => '🌮',
                'image' => '/assets/menu/nachos_real.webp',
                'customizations' => [
                    'sizes' => [],
                    'options' => array_merge([
                        ['name' => 'Extra Cheese Sauce', 'price' => 20],
                        ['name' => 'Extra Ground Beef',  'price' => 25],
                    ], $flavoramaSauces),
                ],
                'recipes' => [['nachos-chips', 1], ['cheese-sauce', 1], ['ground-beef', 1], ['bell-pepper-onion', 1]],
            ],
            [
                'id' => 'chicken-poppers',
                'name' => 'Chicken Poppers',
                'category' => 'Sides',
                'price' => 140.00,
                'description' => 'Bite-sized golden crispy chicken poppers served with your choice of signature glaze or dipping sauce.',
                'emoji' => '🍗',
                'image' => '/assets/menu/chicken_poppers_real.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => array_merge([['name' => 'Classic Crispy', 'price' => 0]], $wingsFlavours),
                    'options' => array_merge([['name' => 'Add Steamed Rice', 'price' => 20]], $flavoramaSauces),
                ],
                'recipes' => [['chicken-poppers-nuggets', 1], ['wings-glaze-sauce', 1]],
            ],
            [
                'id' => 'onion-rings',
                'name' => 'Onion Rings',
                'category' => 'Sides',
                'price' => 110.00,
                'description' => 'Crunchy golden breaded onion rings served hot with creamy dipping sauce.',
                'emoji' => '🧅',
                'image' => '/assets/menu/onion_rings.webp',
                'customizations' => [
                    'sizes' => [],
                    'options' => array_merge([['name' => 'Cheese Dip', 'price' => 15]], $flavoramaSauces),
                ],
                'recipes' => [['onion-rings-raw', 1], ['fries-seasoning', 1]],
            ],

            // ================= BUNDLES (14 items) =================
            [
                'id' => 'gs1-bundle',
                'name' => 'GS1 Bundle',
                'category' => 'Bundles',
                'price' => 139.00,
                'description' => 'GS Classic Burger + Crispy Fries + 16oz Fruit Series drink! Customize your drink flavor.',
                'emoji' => '🎁',
                'image' => '/assets/menu/gs_burger_combo.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $fruitFlavours,
                    'options' => [
                        ['name' => 'Upgrade Drink to 22oz', 'price' => 10],
                        ['name' => 'Extra Cheddar Cheese',  'price' => 15],
                    ],
                ],
                'recipes' => [['brioche-bun', 1], ['beef-patty', 1], ['cheddar-slice', 1], ['potato-fries', 1], ['fruit-syrup', 1]],
            ],
            [
                'id' => 'gs2-bundle',
                'name' => 'GS2 Bundle',
                'category' => 'Bundles',
                'price' => 149.00,
                'description' => 'GS Bacon Burger + Crispy Fries + 16oz Fruit Series drink! Customize your drink flavor.',
                'emoji' => '🎁',
                'image' => '/assets/menu/gs_burger_combo.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $fruitFlavours,
                    'options' => [
                        ['name' => 'Upgrade Drink to 22oz', 'price' => 10],
                        ['name' => 'Extra Cheddar Cheese',  'price' => 15],
                    ],
                ],
                'recipes' => [['brioche-bun', 1], ['beef-patty', 1], ['bacon-strips', 2], ['cheddar-slice', 1], ['potato-fries', 1], ['fruit-syrup', 1]],
            ],
            [
                'id' => 'gs3-bundle',
                'name' => 'GS3 Bundle',
                'category' => 'Bundles',
                'price' => 279.00,
                'description' => '2 GS Classic Burgers + Loaded Fries/Nachos + 2 Fruit Series 16oz drinks!',
                'emoji' => '🎁',
                'image' => '/assets/menu/barkada_foodtreat.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $fruitFlavours,
                    'second_flavours' => $fruitFlavours,
                    'options' => [
                        ['name' => 'Upgrade Both Drinks to 22oz', 'price' => 20],
                        ['name' => 'Extra Cheese Sauce',          'price' => 15],
                    ],
                ],
                'recipes' => [['brioche-bun', 2], ['beef-patty', 2], ['cheddar-slice', 2], ['potato-fries', 1], ['cheese-sauce', 1], ['fruit-syrup', 2]],
            ],
            [
                'id' => 'gs4-bundle',
                'name' => 'GS4 Bundle',
                'category' => 'Bundles',
                'price' => 299.00,
                'description' => '2 GS Bacon Burgers + Loaded Fries/Nachos + 2 Fruit Series 16oz drinks!',
                'emoji' => '🎁',
                'image' => '/assets/menu/barkada_foodtreat.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $fruitFlavours,
                    'second_flavours' => $fruitFlavours,
                    'options' => [
                        ['name' => 'Upgrade Both Drinks to 22oz', 'price' => 20],
                        ['name' => 'Extra Cheese Sauce',          'price' => 15],
                    ],
                ],
                'recipes' => [['brioche-bun', 2], ['beef-patty', 2], ['bacon-strips', 4], ['cheddar-slice', 2], ['potato-fries', 1], ['cheese-sauce', 1], ['fruit-syrup', 2]],
            ],
            [
                'id' => 'barkada-foodtreat',
                'name' => 'Barkada Foodtreat',
                'category' => 'Bundles',
                'price' => 509.00,
                'description' => '4 Burgers + Nachos Overload + Crispy Fries + 4 Fruit Series Drinks! Built for sharing with the squad.',
                'emoji' => '🎉',
                'image' => '/assets/menu/barkada_foodtreat.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => [
                        ['name' => 'Assorted Fruit Series Mix', 'price' => 0],
                        ['name' => 'Mango & Strawberry Mix',    'price' => 0],
                        ['name' => 'Watermelon & Lychee Mix',   'price' => 0],
                        ['name' => 'Blue Raspberry & Lemon',    'price' => 0],
                    ],
                    'options' => [
                        ['name' => 'Extra Cheese Sauce', 'price' => 20],
                        ['name' => 'Garlic Mayo Sauce',  'price' => 10],
                    ],
                ],
                'recipes' => [['brioche-bun', 4], ['beef-patty', 4], ['cheddar-slice', 4], ['nachos-chips', 1], ['potato-fries', 1], ['cheese-sauce', 2], ['fruit-syrup', 4]],
            ],
            [
                'id' => 'bm1-bundle',
                'name' => 'BM1 Bundle',
                'category' => 'Bundles',
                'price' => 159.00,
                'description' => 'GS Classic Burger + Crispy Fries + 16oz Classic Milktea with pearls!',
                'emoji' => '🧋',
                'image' => '/assets/menu/milktea_bundle.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $milkteaFlavours,
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['brioche-bun', 1], ['beef-patty', 1], ['cheddar-slice', 1], ['potato-fries', 1], ['tea-base', 1], ['fresh-milk', 1], ['tapioca-pearls', 1]],
            ],
            [
                'id' => 'bm2-bundle',
                'name' => 'BM2 Bundle',
                'category' => 'Bundles',
                'price' => 169.00,
                'description' => 'GS Bacon Burger + Crispy Fries + 16oz Classic Milktea with pearls!',
                'emoji' => '🧋',
                'image' => '/assets/menu/milktea_bundle.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $milkteaFlavours,
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['brioche-bun', 1], ['beef-patty', 1], ['bacon-strips', 2], ['cheddar-slice', 1], ['potato-fries', 1], ['tea-base', 1], ['fresh-milk', 1], ['tapioca-pearls', 1]],
            ],
            [
                'id' => 'bm3-bundle',
                'name' => 'BM3 Bundle',
                'category' => 'Bundles',
                'price' => 319.00,
                'description' => '2 GS Classic Burgers + Loaded Fries/Nachos + 2 Classic Milkteas (16oz)!',
                'emoji' => '🧋',
                'image' => '/assets/menu/milktea_bundle.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $milkteaFlavours,
                    'second_flavours' => $milkteaFlavours,
                    'options' => [
                        ['name' => 'Extra Black Pearl (2 cups)', 'price' => 20],
                        ['name' => 'Cream Cheese (2 cups)',      'price' => 60],
                    ],
                ],
                'recipes' => [['brioche-bun', 2], ['beef-patty', 2], ['cheddar-slice', 2], ['potato-fries', 1], ['cheese-sauce', 1], ['tea-base', 2], ['fresh-milk', 2], ['tapioca-pearls', 2]],
            ],
            [
                'id' => 'bm4-bundle',
                'name' => 'BM4 Bundle',
                'category' => 'Bundles',
                'price' => 349.00,
                'description' => '2 GS Bacon Burgers + Loaded Fries/Nachos + 2 Classic Milkteas (16oz)!',
                'emoji' => '🧋',
                'image' => '/assets/menu/milktea_bundle.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $milkteaFlavours,
                    'second_flavours' => $milkteaFlavours,
                    'options' => [
                        ['name' => 'Extra Black Pearl (2 cups)', 'price' => 20],
                        ['name' => 'Cream Cheese (2 cups)',      'price' => 60],
                    ],
                ],
                'recipes' => [['brioche-bun', 2], ['beef-patty', 2], ['bacon-strips', 4], ['cheddar-slice', 2], ['potato-fries', 1], ['cheese-sauce', 1], ['tea-base', 2], ['fresh-milk', 2], ['tapioca-pearls', 2]],
            ],
            [
                'id' => 'bm-barkada-foodtreat',
                'name' => 'BM Barkada Foodtreat',
                'category' => 'Bundles',
                'price' => 609.00,
                'description' => '4 Burgers + Nachos Overload + Fries + 4 Classic Milktea Drinks! Ultimate barkada milktea feast.',
                'emoji' => '🎉',
                'image' => '/assets/menu/milktea_bundle.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => [
                        ['name' => 'Assorted Classic Milktea', 'price' => 0],
                        ['name' => 'All Okinawa',              'price' => 0],
                        ['name' => 'All Matcha',               'price' => 0],
                        ['name' => 'All Chocolate',            'price' => 0],
                        ['name' => 'All Taro',                 'price' => 0],
                    ],
                    'options' => [
                        ['name' => 'Extra Black Pearl (4 cups)', 'price' => 40],
                        ['name' => 'Extra Cheese Sauce',         'price' => 20],
                    ],
                ],
                'recipes' => [['brioche-bun', 4], ['beef-patty', 4], ['cheddar-slice', 4], ['nachos-chips', 1], ['potato-fries', 1], ['cheese-sauce', 2], ['tea-base', 4], ['fresh-milk', 4], ['tapioca-pearls', 4]],
            ],
            [
                'id' => 'bundle-feast',
                'name' => 'Bundle Feast',
                'category' => 'Bundles',
                'price' => 509.00,
                'description' => 'Big Meal. Big Flavor! Includes 10" All Meat Pizza + 2 Regular Burgers + 2 Fruit Series 16oz + Nachos Overload.',
                'emoji' => '🍕',
                'image' => '/assets/menu/bundle_feast.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => [
                        ['name' => 'Assorted Fruit Series',    'price' => 0],
                        ['name' => 'Mango & Strawberry',       'price' => 0],
                        ['name' => 'Watermelon & Lychee',      'price' => 0],
                        ['name' => 'Blue Raspberry & Lemon',   'price' => 0],
                    ],
                    'options' => [
                        ['name' => 'Extra Cheese Sauce', 'price' => 20],
                        ['name' => 'Garlic Mayo Dip',    'price' => 15],
                    ],
                ],
                'recipes' => [['pizza-dough', 1], ['tomato-sauce', 1], ['mozzarella', 2], ['pepperoni', 4], ['brioche-bun', 2], ['beef-patty', 2], ['nachos-chips', 1], ['cheese-sauce', 1], ['fruit-syrup', 2]],
            ],
            [
                'id' => 'cb1-gshot-classic',
                'name' => 'CB1 GShot Classic',
                'category' => 'Bundles',
                'price' => 149.00,
                'description' => 'NEW! 1pc Crispy Chicken Burger, golden Fries, and refreshing 16oz Fruit Series Drink!',
                'emoji' => '🍔',
                'image' => '/assets/menu/cb1_classic.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $fruitFlavours,
                    'options' => [
                        ['name' => 'Upgrade Drink to 22oz', 'price' => 10],
                        ['name' => 'Extra Cheddar Cheese',  'price' => 15],
                        ['name' => 'Garlic Mayo Sauce',     'price' => 10],
                    ],
                ],
                'recipes' => [['brioche-bun', 1], ['chicken-fillet', 1], ['lettuce', 1], ['potato-fries', 1], ['fruit-syrup', 1]],
            ],
            [
                'id' => 'cb2-gshot-loaded',
                'name' => "CB2 G'Shot Loaded",
                'category' => 'Bundles',
                'price' => 189.00,
                'description' => 'NEW! 1pc Crispy Chicken Burger, savory Chicken Nuggets, golden Fries, and refreshing Drink!',
                'emoji' => '🍗',
                'image' => '/assets/menu/cb2_loaded.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $fruitFlavours,
                    'options' => [
                        ['name' => 'Upgrade Drink to 22oz', 'price' => 10],
                        ['name' => 'Extra Cheddar Cheese',  'price' => 15],
                        ['name' => 'Garlic Mayo Sauce',     'price' => 10],
                    ],
                ],
                'recipes' => [['brioche-bun', 1], ['chicken-fillet', 1], ['lettuce', 1], ['chicken-poppers-nuggets', 1], ['potato-fries', 1], ['fruit-syrup', 1]],
            ],
            [
                'id' => 'cb3-gshot-crunch',
                'name' => 'CB3 GShot Crunch',
                'category' => 'Bundles',
                'price' => 199.00,
                'description' => 'NEW! 1pc Crispy Chicken Burger, crunchy Onion Rings, golden Fries, and refreshing Drink!',
                'emoji' => '🧅',
                'image' => '/assets/menu/cb3_crunch.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $fruitFlavours,
                    'options' => [
                        ['name' => 'Upgrade Drink to 22oz', 'price' => 10],
                        ['name' => 'Extra Cheddar Cheese',  'price' => 15],
                        ['name' => 'Garlic Mayo Sauce',     'price' => 10],
                    ],
                ],
                'recipes' => [['brioche-bun', 1], ['chicken-fillet', 1], ['lettuce', 1], ['onion-rings-raw', 1], ['potato-fries', 1], ['fruit-syrup', 1]],
            ],

            // ================= DRINKS (14 items) =================
            [
                'id' => 'classic-milktea',
                'name' => 'Classic Milktea',
                'category' => 'Drinks',
                'price' => 49.00,
                'description' => 'Signature brewed milktea with chewy pearls! Choose from Okinawa, Chocolate, Matcha, Cookies & Cream, Choco Strawberry, Salted Caramel, or Taro. Sizes: 12oz (₱49), 16oz (₱69), 22oz (₱79).',
                'emoji' => '🧋',
                'image' => '/assets/menu/classic_milktea.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '12oz', 'price' => 0],
                        ['name' => '16oz', 'price' => 20],
                        ['name' => '22oz', 'price' => 30],
                    ],
                    'flavours' => $milkteaFlavours,
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['tea-base', 1], ['fresh-milk', 1], ['tapioca-pearls', 1]],
            ],
            [
                'id' => 'creamcheese-series',
                'name' => 'Creamcheese Series',
                'category' => 'Drinks',
                'price' => 110.00,
                'description' => 'Rich milktea crowned with thick velvety salted cream cheese foam! Flavors: Okinawa, Chocolate, Matcha, Cookies & Cream, Choco Strawberry, Salted Caramel, Taro.',
                'emoji' => '🧀',
                'image' => '/assets/menu/creamcheese_series.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $milkteaFlavours,
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['tea-base', 1], ['fresh-milk', 1], ['cream-cheese', 1], ['tapioca-pearls', 1]],
            ],
            [
                'id' => 'thai-tea-series',
                'name' => 'Thai Tea Series',
                'category' => 'Drinks',
                'price' => 80.00,
                'description' => 'Aromatic authentic Thai tea blends: Classic Thai Tea, Chocolate Thai Tea, Citrus Thai Pop, or Thai Tea Breeze.',
                'emoji' => '🧡',
                'image' => '/assets/menu/thai_tea_series.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => [
                        ['name' => 'Classic Thai Tea',   'price' => 0],
                        ['name' => 'Chocolate Thai Tea', 'price' => 0],
                        ['name' => 'Citrus Thai Pop',    'price' => 0],
                        ['name' => 'Thai Tea Breeze',    'price' => 0],
                    ],
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['thai-tea-mix', 1], ['fresh-milk', 1]],
            ],
            [
                'id' => 'fruit-series',
                'name' => 'Fruit Series',
                'category' => 'Drinks',
                'price' => 59.00,
                'description' => 'Refreshing chilled fruit tea coolers in 16oz (₱59) and 22oz (₱69)! Pick from 8 fruity flavors.',
                'emoji' => '🍓',
                'image' => '/assets/menu/fruit_series.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '16oz', 'price' => 0],
                        ['name' => '22oz', 'price' => 10],
                    ],
                    'flavours' => $fruitFlavours,
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['tea-base', 1], ['fruit-syrup', 1]],
            ],
            [
                'id' => 'yakult-series',
                'name' => 'Yakult Series',
                'category' => 'Drinks',
                'price' => 80.00,
                'description' => 'Tangy sweet probiotic Yakult blended with your choice of 8 refreshing fruit flavors!',
                'emoji' => '🥤',
                'image' => '/assets/menu/yakult_series.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $fruitFlavours,
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['yakult-bottle', 1], ['fruit-syrup', 1]],
            ],
            [
                'id' => 'soda-based-series',
                'name' => 'Soda Based Series',
                'category' => 'Drinks',
                'price' => 70.00,
                'description' => 'Crisp sparkling fruit sodas bursting with Watermelon, Mango, Raspberry, Strawberry, Blue Raspberry, or Green Apple!',
                'emoji' => '🫧',
                'image' => '/assets/menu/soda_series.webp',
                'customizations' => [
                    'sizes' => [],
                    'flavours' => $sodaFlavours,
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['soda-water', 1], ['fruit-syrup', 1]],
            ],
            [
                'id' => 'brown-sugar-milktea',
                'name' => 'Brown Sugar Boba Milk',
                'category' => 'Drinks',
                'price' => 69.00,
                'description' => 'Warm tiger-striped brown sugar drizzle, fresh dairy milk, and slow-cooked boba pearls.',
                'emoji' => '🧋',
                'image' => '/assets/menu/classic_milktea.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '16oz', 'price' => 0],
                        ['name' => '22oz', 'price' => 10],
                    ],
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['fresh-milk', 1], ['brown-sugar', 1], ['tapioca-pearls', 1]],
            ],
            [
                'id' => 'matcha-latte',
                'name' => 'Matcha Latte Series',
                'category' => 'Drinks',
                'price' => 79.00,
                'description' => 'Fine Japanese ceremonial matcha layered over cold fresh milk and sweet pearls.',
                'emoji' => '🍵',
                'image' => '/assets/menu/coffee_matcha.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '16oz', 'price' => 0],
                        ['name' => '22oz', 'price' => 20],
                    ],
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['matcha-powder', 2], ['fresh-milk', 1], ['tapioca-pearls', 1]],
            ],
            [
                'id' => 'taro-milktea',
                'name' => 'Taro Sweet Milktea',
                'category' => 'Drinks',
                'price' => 69.00,
                'description' => 'Rich velvety purple taro with tea essence, creamy dairy, and bouncy pearls.',
                'emoji' => '🧋',
                'image' => '/assets/menu/creamcheese_series.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '16oz', 'price' => 0],
                        ['name' => '22oz', 'price' => 10],
                    ],
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['taro-powder', 2], ['tea-base', 1], ['fresh-milk', 1], ['tapioca-pearls', 1]],
            ],
            [
                'id' => 'frappe-ube-cheese',
                'name' => 'Ube Cheese Frappe',
                'category' => 'Drinks',
                'price' => 110.00,
                'description' => 'Non-coffee ice-blended Filipino purple yam frappe topped with creamy cheese goodness and whipped cream.',
                'emoji' => '🍨',
                'image' => '/assets/menu/frappe_ube.webp',
                'customizations' => [
                    'sizes' => [],
                    'hide_sugar_ice' => true,
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['ube-avocado-mango-puree', 1], ['cream-cheese', 1], ['frappe-base-powder', 1], ['fresh-milk', 1]],
            ],
            [
                'id' => 'frappe-strawberry',
                'name' => 'Strawberry Frappe',
                'category' => 'Drinks',
                'price' => 100.00,
                'description' => 'Non-coffee creamy ice-blended sweet strawberry frappe topped with smooth whipped cream.',
                'emoji' => '🍓',
                'image' => '/assets/menu/frappe_strawberry.webp',
                'customizations' => [
                    'sizes' => [],
                    'hide_sugar_ice' => true,
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['fruit-syrup', 1], ['frappe-base-powder', 1], ['fresh-milk', 1]],
            ],
            [
                'id' => 'frappe-avocado',
                'name' => 'Avocado Frappe',
                'category' => 'Drinks',
                'price' => 100.00,
                'description' => 'Non-coffee rich, velvety ice-blended avocado shake crafted with fresh milk and creamy frappe base.',
                'emoji' => '🥑',
                'image' => '/assets/menu/frappe_avocado.webp',
                'customizations' => [
                    'sizes' => [],
                    'hide_sugar_ice' => true,
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['ube-avocado-mango-puree', 1], ['frappe-base-powder', 1], ['fresh-milk', 1]],
            ],
            [
                'id' => 'frappe-chocolate',
                'name' => 'Chocolate Frappe',
                'category' => 'Drinks',
                'price' => 100.00,
                'description' => 'Non-coffee indulgent chocolate ice-blended frappe drizzled with cocoa and cream.',
                'emoji' => '🍫',
                'image' => '/assets/menu/frappe_dark_choco.webp',
                'customizations' => [
                    'sizes' => [],
                    'hide_sugar_ice' => true,
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['chocolate-syrup', 2], ['frappe-base-powder', 1], ['fresh-milk', 1]],
            ],
            [
                'id' => 'frappe-cheesy-mango',
                'name' => 'Cheesy Mango Frappe',
                'category' => 'Drinks',
                'price' => 100.00,
                'description' => 'Non-coffee tropical sweet mango frappe crowned with savory-sweet cream cheese topping!',
                'emoji' => '🥭',
                'image' => '/assets/menu/frappe_mango.webp',
                'customizations' => [
                    'sizes' => [],
                    'hide_sugar_ice' => true,
                    'options' => $drinkAddOns,
                ],
                'recipes' => [['ube-avocado-mango-puree', 1], ['cream-cheese', 1], ['frappe-base-powder', 1], ['fresh-milk', 1]],
            ],

            // ================= COFFEE: ESPRESSO, COLDBREW, COFFEE FRAPPE (19 items) =================
            [
                'id' => 'caramel-macchiato',
                'name' => 'Caramel Macchiato (Espresso)',
                'category' => 'Coffee',
                'price' => 100.00,
                'description' => 'Freshly pulled espresso over velvety milk and rich buttery caramel drizzle. Sizes: 16oz (₱100), 22oz (₱130), Hot (₱100).',
                'emoji' => '☕',
                'image' => '/assets/menu/espresso_coffee.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '16oz', 'price' => 0],
                        ['name' => '22oz', 'price' => 30],
                        ['name' => 'Hot',  'price' => 0],
                    ],
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coffee-beans', 1], ['fresh-milk', 1], ['caramel-syrup', 1]],
            ],
            [
                'id' => 'espresso-salted-caramel',
                'name' => 'Salted Caramel (Espresso)',
                'category' => 'Coffee',
                'price' => 100.00,
                'description' => 'Bold espresso balanced with creamy dairy and sweet-salty caramel notes. Sizes: 16oz (₱100), 22oz (₱120), Hot (₱100).',
                'emoji' => '☕',
                'image' => '/assets/menu/espresso_coffee.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '16oz', 'price' => 0],
                        ['name' => '22oz', 'price' => 20],
                        ['name' => 'Hot',  'price' => 0],
                    ],
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coffee-beans', 1], ['fresh-milk', 1], ['caramel-syrup', 1]],
            ],
            [
                'id' => 'espresso-sea-salt-latte',
                'name' => 'Sea Salt Latte (Espresso)',
                'category' => 'Coffee',
                'price' => 100.00,
                'description' => 'Smooth espresso latte topped with whipped sea salt cream foam. Sizes: 16oz (₱100), 22oz (₱120), Hot (₱100).',
                'emoji' => '☕',
                'image' => '/assets/menu/coffee_sea_salt.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '16oz', 'price' => 0],
                        ['name' => '22oz', 'price' => 20],
                        ['name' => 'Hot',  'price' => 0],
                    ],
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coffee-beans', 1], ['fresh-milk', 1], ['cream-cheese', 1]],
            ],
            [
                'id' => 'espresso-mocha-latte',
                'name' => 'Mocha Latte (Espresso)',
                'category' => 'Coffee',
                'price' => 100.00,
                'description' => 'Rich chocolate sauce fused with freshly brewed espresso and cold or hot milk. Sizes: 16oz (₱100), 22oz (₱120), Hot (₱100).',
                'emoji' => '☕',
                'image' => '/assets/menu/coffee_mocha.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '16oz', 'price' => 0],
                        ['name' => '22oz', 'price' => 20],
                        ['name' => 'Hot',  'price' => 0],
                    ],
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coffee-beans', 1], ['fresh-milk', 1], ['chocolate-syrup', 1]],
            ],
            [
                'id' => 'espresso-spanish-latte',
                'name' => 'Spanish Latte (Espresso)',
                'category' => 'Coffee',
                'price' => 100.00,
                'description' => 'Creamy, sweet Spanish-style espresso latte crafted with condensed milk richness. Sizes: 16oz (₱100), 22oz (₱110), Hot (₱100).',
                'emoji' => '☕',
                'image' => '/assets/menu/coffee_spanish.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '16oz', 'price' => 0],
                        ['name' => '22oz', 'price' => 10],
                        ['name' => 'Hot',  'price' => 0],
                    ],
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coffee-beans', 1], ['fresh-milk', 1], ['white-choco-sauce', 1]],
            ],
            [
                'id' => 'espresso-dirty-matcha',
                'name' => 'Dirty Matcha (Espresso)',
                'category' => 'Coffee',
                'price' => 100.00,
                'description' => 'Earthy Japanese matcha layered with fresh milk and a bold espresso shot! Sizes: 16oz (₱100), 22oz (₱110), Hot (₱100).',
                'emoji' => '🍵',
                'image' => '/assets/menu/coffee_matcha.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '16oz', 'price' => 0],
                        ['name' => '22oz', 'price' => 10],
                        ['name' => 'Hot',  'price' => 0],
                    ],
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coffee-beans', 1], ['matcha-powder', 2], ['fresh-milk', 1]],
            ],
            [
                'id' => 'espresso-white-chocolate',
                'name' => 'White Chocolate (Espresso)',
                'category' => 'Coffee',
                'price' => 100.00,
                'description' => 'Silky white chocolate blended with espresso roast and creamy milk. Sizes: 16oz (₱100), 22oz (₱130), Hot (₱100).',
                'emoji' => '☕',
                'image' => '/assets/menu/coffee_white_choco.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '16oz', 'price' => 0],
                        ['name' => '22oz', 'price' => 30],
                        ['name' => 'Hot',  'price' => 0],
                    ],
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coffee-beans', 1], ['fresh-milk', 1], ['white-choco-sauce', 1]],
            ],
            [
                'id' => 'espresso-americano',
                'name' => 'Americano (Espresso)',
                'category' => 'Coffee',
                'price' => 70.00,
                'description' => 'Pure, bold G\'Shot Café espresso over water. Available Hot (₱70), Iced 16oz (₱80), or Iced 22oz (₱90).',
                'emoji' => '☕',
                'image' => '/assets/menu/coffee_americano.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => 'Hot',  'price' => 0],
                        ['name' => '16oz', 'price' => 10],
                        ['name' => '22oz', 'price' => 20],
                    ],
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coffee-beans', 2]],
            ],

            // COLDBREW
            [
                'id' => 'coldbrew-caramel-macchiato',
                'name' => 'Coldbrew Caramel Macchiato',
                'category' => 'Coffee',
                'price' => 60.00,
                'description' => 'Smooth slow-steeped coldbrew layered with milk and caramel drizzle. Sizes: 12oz (₱60), 16oz (₱70).',
                'emoji' => '🧊',
                'image' => '/assets/menu/coldbrew_coffee.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '12oz', 'price' => 0],
                        ['name' => '16oz', 'price' => 10],
                    ],
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coldbrew-concentrate', 1], ['fresh-milk', 1], ['caramel-syrup', 1]],
            ],
            [
                'id' => 'coldbrew-salted-caramel',
                'name' => 'Coldbrew Salted Caramel',
                'category' => 'Coffee',
                'price' => 60.00,
                'description' => 'Refreshing coldbrew infused with creamy milk and salted caramel syrup. Sizes: 12oz (₱60), 16oz (₱70).',
                'emoji' => '🧊',
                'image' => '/assets/menu/coldbrew_coffee.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '12oz', 'price' => 0],
                        ['name' => '16oz', 'price' => 10],
                    ],
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coldbrew-concentrate', 1], ['fresh-milk', 1], ['caramel-syrup', 1]],
            ],
            [
                'id' => 'coldbrew-mocha-latte',
                'name' => 'Coldbrew Mocha Latte',
                'category' => 'Coffee',
                'price' => 60.00,
                'description' => 'Velvety coldbrew coffee swirled with rich chocolate mocha sauce and milk. Sizes: 12oz (₱60), 16oz (₱70).',
                'emoji' => '🧊',
                'image' => '/assets/menu/coffee_mocha.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '12oz', 'price' => 0],
                        ['name' => '16oz', 'price' => 10],
                    ],
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coldbrew-concentrate', 1], ['fresh-milk', 1], ['chocolate-syrup', 1]],
            ],
            [
                'id' => 'coldbrew-dirty-matcha',
                'name' => 'Coldbrew Dirty Matcha',
                'category' => 'Coffee',
                'price' => 60.00,
                'description' => 'Vibrant matcha green tea topped with smooth G\'Shot coldbrew coffee! Sizes: 12oz (₱60), 16oz (₱70).',
                'emoji' => '🍵',
                'image' => '/assets/menu/coldbrew_coffee.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '12oz', 'price' => 0],
                        ['name' => '16oz', 'price' => 10],
                    ],
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coldbrew-concentrate', 1], ['matcha-powder', 2], ['fresh-milk', 1]],
            ],
            [
                'id' => 'coldbrew-white-chocolate',
                'name' => 'Coldbrew White Chocolate',
                'category' => 'Coffee',
                'price' => 60.00,
                'description' => 'Crisp coldbrew sweetened with creamy white chocolate sauce and milk. Sizes: 12oz (₱60), 16oz (₱70).',
                'emoji' => '🧊',
                'image' => '/assets/menu/coffee_white_choco.webp',
                'customizations' => [
                    'sizes' => [
                        ['name' => '12oz', 'price' => 0],
                        ['name' => '16oz', 'price' => 10],
                    ],
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coldbrew-concentrate', 1], ['fresh-milk', 1], ['white-choco-sauce', 1]],
            ],

            // FRAPPE COFFEE BASED
            [
                'id' => 'frappe-java-chip',
                'name' => 'Java Chip Frappe',
                'category' => 'Coffee',
                'price' => 150.00,
                'description' => 'Coffee-based blended mocha frappe loaded with crunchy java chocolate chips and topped with whipped cream.',
                'emoji' => '🥤',
                'image' => '/assets/menu/frappe_coffee.webp',
                'customizations' => [
                    'sizes' => [],
                    'hide_sugar_ice' => true,
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coffee-beans', 1], ['chocolate-syrup', 1], ['java-oreo-chips', 1], ['frappe-base-powder', 1], ['fresh-milk', 1]],
            ],
            [
                'id' => 'frappe-caramel-macchiato',
                'name' => 'Caramel Macchiato Frappe',
                'category' => 'Coffee',
                'price' => 130.00,
                'description' => 'Coffee-based ice-blended espresso caramel frappe finished with whipped cream and caramel drizzle.',
                'emoji' => '🥤',
                'image' => '/assets/menu/frappe_coffee.webp',
                'customizations' => [
                    'sizes' => [],
                    'hide_sugar_ice' => true,
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coffee-beans', 1], ['caramel-syrup', 1], ['frappe-base-powder', 1], ['fresh-milk', 1]],
            ],
            [
                'id' => 'frappe-matcha-coffee',
                'name' => 'Matcha Coffee Frappe',
                'category' => 'Coffee',
                'price' => 130.00,
                'description' => 'Coffee-based frosty blend of ceremonial matcha green tea, espresso kick, milk, and whipped cream.',
                'emoji' => '🍵',
                'image' => '/assets/menu/frappe_matcha.webp',
                'customizations' => [
                    'sizes' => [],
                    'hide_sugar_ice' => true,
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coffee-beans', 1], ['matcha-powder', 2], ['frappe-base-powder', 1], ['fresh-milk', 1]],
            ],
            [
                'id' => 'frappe-white-chocolate',
                'name' => 'White Chocolate Frappe',
                'category' => 'Coffee',
                'price' => 130.00,
                'description' => 'Coffee-based creamy white chocolate espresso frappe crowned with fluffy whipped cream.',
                'emoji' => '🥤',
                'image' => '/assets/menu/coffee_white_choco.webp',
                'customizations' => [
                    'sizes' => [],
                    'hide_sugar_ice' => true,
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coffee-beans', 1], ['white-choco-sauce', 1], ['frappe-base-powder', 1], ['fresh-milk', 1]],
            ],
            [
                'id' => 'frappe-dark-chocolate',
                'name' => 'Dark Chocolate Frappe',
                'category' => 'Coffee',
                'price' => 130.00,
                'description' => 'Coffee-based rich dark chocolate espresso frappe for true cocoa and coffee lovers.',
                'emoji' => '🍫',
                'image' => '/assets/menu/frappe_dark_choco.webp',
                'customizations' => [
                    'sizes' => [],
                    'hide_sugar_ice' => true,
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coffee-beans', 1], ['chocolate-syrup', 2], ['frappe-base-powder', 1], ['fresh-milk', 1]],
            ],
            [
                'id' => 'frappe-cookies-and-cream',
                'name' => 'Cookies and Cream Frappe',
                'category' => 'Coffee',
                'price' => 130.00,
                'description' => 'Coffee-based ice-blended espresso mixed with crushed chocolate cookies and creamy whipped topping.',
                'emoji' => '🍪',
                'image' => '/assets/menu/frappe_cookies_cream.webp',
                'customizations' => [
                    'sizes' => [],
                    'hide_sugar_ice' => true,
                    'options' => $coffeeAddOns,
                ],
                'recipes' => [['coffee-beans', 1], ['java-oreo-chips', 1], ['frappe-base-powder', 1], ['fresh-milk', 1]],
            ],
        ];

        foreach ($catalog as $entry) {
            $recipes = $entry['recipes'] ?? [];
            unset($entry['recipes']);
            $entry['is_available'] = true;

            $existing = Product::find($entry['id']);
            if ($existing) {
                $existing->update($entry);
            } else {
                Product::create($entry);
            }

            Recipe::where('product_id', $entry['id'])->delete();
            foreach ($recipes as [$ingId, $qty]) {
                Recipe::create([
                    'product_id' => $entry['id'],
                    'ingredient_id' => $ingId,
                    'qty' => $qty,
                ]);
            }
        }

        Cache::forget('ingredients_all');
        Cache::forget('products_catalog_default');
    }
}
