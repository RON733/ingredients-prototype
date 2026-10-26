// G Shot Teas — Shared data constants (loaded first, global scope)

const INITIAL_INGREDIENTS = [
  { id: 'brioche-bun',    name: 'Brioche Bun',       category: 'Bakery',  stock: 12, unit: 'pcs',    lowThreshold: 4 },
  { id: 'beef-patty',     name: 'Beef Patty',         category: 'Meat',    stock: 15, unit: 'pcs',    lowThreshold: 5 },
  { id: 'cheddar-slice',  name: 'Cheddar Slice',      category: 'Dairy',   stock: 20, unit: 'slices', lowThreshold: 5 },
  { id: 'lettuce',        name: 'Lettuce',             category: 'Produce', stock: 8,  unit: 'pcs',    lowThreshold: 3 },
  { id: 'pizza-dough',    name: 'Pizza Dough',         category: 'Bakery',  stock: 5,  unit: 'pcs',    lowThreshold: 2 },
  { id: 'mozzarella',     name: 'Mozzarella',          category: 'Dairy',   stock: 10, unit: 'slices', lowThreshold: 4 },
  { id: 'tomato-sauce',   name: 'Tomato Sauce',        category: 'Produce', stock: 15, unit: 'pcs',    lowThreshold: 4 },
  { id: 'potato-fries',   name: 'Potato Fries',        category: 'Produce', stock: 4,  unit: 'pcs',    lowThreshold: 2 },
  // Milk Tea ingredients
  { id: 'tapioca-pearls', name: 'Tapioca Pearls',     category: 'Bakery',  stock: 20, unit: 'cups',   lowThreshold: 5 },
  { id: 'fresh-milk',     name: 'Fresh Milk',          category: 'Dairy',   stock: 15, unit: 'cups',   lowThreshold: 4 },
  { id: 'tea-base',       name: 'Tea Base',            category: 'Produce', stock: 12, unit: 'cups',   lowThreshold: 3 },
  { id: 'brown-sugar',    name: 'Brown Sugar Syrup',   category: 'Produce', stock: 10, unit: 'cups',   lowThreshold: 3 },
  { id: 'matcha-powder',  name: 'Matcha Powder',       category: 'Produce', stock: 8,  unit: 'scoops', lowThreshold: 2 },
  { id: 'taro-powder',    name: 'Taro Powder',         category: 'Produce', stock: 8,  unit: 'scoops', lowThreshold: 2 },
];

const MENU_ITEMS = [
  {
    id: 'classic-cheeseburger',
    name: 'Classic Cheeseburger',
    category: 'Burgers',
    price: 9.99,
    description: 'Juicy beef patty, golden brioche bun, fresh lettuce & melted cheddar.',
    emoji: '🍔',
    recipe: [
      { ingredientId: 'brioche-bun',   qty: 1 },
      { ingredientId: 'beef-patty',    qty: 1 },
      { ingredientId: 'cheddar-slice', qty: 1 },
      { ingredientId: 'lettuce',       qty: 1 },
    ],
  },
  {
    id: 'double-cheeseburger',
    name: 'Double Cheeseburger',
    category: 'Burgers',
    price: 13.49,
    description: 'Double-stacked smash patties with two layers of gooey melted cheddar.',
    emoji: '🍔',
    recipe: [
      { ingredientId: 'brioche-bun',   qty: 1 },
      { ingredientId: 'beef-patty',    qty: 2 },
      { ingredientId: 'cheddar-slice', qty: 2 },
    ],
  },
  {
    id: 'margherita-pizza',
    name: 'Margherita Pizza',
    category: 'Pizza',
    price: 11.99,
    description: 'Hand-stretched dough, rich tomato sauce & fresh buffalo mozzarella.',
    emoji: '🍕',
    recipe: [
      { ingredientId: 'pizza-dough',  qty: 1 },
      { ingredientId: 'mozzarella',   qty: 2 },
      { ingredientId: 'tomato-sauce', qty: 1 },
    ],
  },
  {
    id: 'loaded-fries',
    name: 'Loaded Fries',
    category: 'Sides',
    price: 5.99,
    description: 'Crispy golden fries smothered in melted cheddar cheese sauce.',
    emoji: '🍟',
    recipe: [
      { ingredientId: 'potato-fries',  qty: 1 },
      { ingredientId: 'cheddar-slice', qty: 1 },
    ],
  },
  // ── Drinks / Milk Tea ──
  {
    id: 'brown-sugar-milk-tea',
    name: 'Brown Sugar Milk Tea',
    category: 'Drinks',
    price: 5.49,
    description: 'Tiger-striped brown sugar with fresh milk and chewy tapioca pearls.',
    emoji: '🧋',
    recipe: [
      { ingredientId: 'tea-base',       qty: 1 },
      { ingredientId: 'fresh-milk',     qty: 1 },
      { ingredientId: 'tapioca-pearls', qty: 1 },
      { ingredientId: 'brown-sugar',    qty: 1 },
    ],
  },
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    category: 'Drinks',
    price: 5.99,
    description: 'Premium Japanese matcha blended with creamy fresh milk and QQ pearls.',
    emoji: '🍵',
    recipe: [
      { ingredientId: 'matcha-powder',  qty: 2 },
      { ingredientId: 'fresh-milk',     qty: 1 },
      { ingredientId: 'tapioca-pearls', qty: 1 },
    ],
  },
  {
    id: 'taro-milk-tea',
    name: 'Taro Milk Tea',
    category: 'Drinks',
    price: 5.49,
    description: 'Creamy purple taro with tea base, fresh milk and chewy pearls.',
    emoji: '🧋',
    recipe: [
      { ingredientId: 'taro-powder',    qty: 2 },
      { ingredientId: 'tea-base',       qty: 1 },
      { ingredientId: 'fresh-milk',     qty: 1 },
      { ingredientId: 'tapioca-pearls', qty: 1 },
    ],
  },
  {
    id: 'classic-milk-tea',
    name: 'Classic Milk Tea',
    category: 'Drinks',
    price: 4.49,
    description: 'Timeless black tea with fresh milk and QQ tapioca pearls.',
    emoji: '🧋',
    recipe: [
      { ingredientId: 'tea-base',       qty: 1 },
      { ingredientId: 'fresh-milk',     qty: 1 },
      { ingredientId: 'tapioca-pearls', qty: 1 },
    ],
  },
];

const CATEGORY_COLORS = {
  Burgers: 'from-orange-600 to-amber-500',
  Pizza:   'from-red-600 to-orange-500',
  Sides:   'from-yellow-500 to-lime-500',
  Drinks:  'from-purple-600 to-pink-500',
};

const CATEGORY_BADGE = {
  Meat:    'bg-red-900/50 text-red-400 border-red-700/40',
  Dairy:   'bg-blue-900/50 text-blue-400 border-blue-700/40',
  Produce: 'bg-green-900/50 text-green-400 border-green-700/40',
  Bakery:  'bg-amber-900/50 text-amber-400 border-amber-700/40',
};
