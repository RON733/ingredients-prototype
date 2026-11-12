// G Shot Teas - Pinia Central Store
import { defineStore } from 'pinia';
import GST_API from '../services/api.js';
import initEcho from '../services/echo.js';

const DEFAULT_PRODUCTS = [
  {
    id: 'classic-cheeseburger',
    name: 'Cheese Burger',
    category: 'Burgers',
    price: 89,
    description: 'Juicy grilled beef patty, golden brioche bun, fresh lettuce, and melted rich cheddar cheese.',
    emoji: '🍔',
    image: '/assets/hero-banner.png',
    is_available: true,
    max_portions: 23,
    stock_status: 'available',
    recipes: [
      { id: 1, ingredient_id: 'brioche-bun', qty: 1, ingredient: { id: 'brioche-bun', name: 'Brioche Bun', category: 'Bakery', stock: 33, unit: 'pcs' } },
      { id: 2, ingredient_id: 'beef-patty', qty: 1, ingredient: { id: 'beef-patty', name: 'Beef Patty', category: 'Meat', stock: 43, unit: 'pcs' } },
      { id: 3, ingredient_id: 'cheddar-slice', qty: 1, ingredient: { id: 'cheddar-slice', name: 'Cheddar Slice', category: 'Dairy', stock: 48, unit: 'slices' } },
      { id: 4, ingredient_id: 'lettuce', qty: 1, ingredient: { id: 'lettuce', name: 'Fresh Lettuce', category: 'Produce', stock: 23, unit: 'pcs' } },
    ]
  },
  {
    id: 'double-cheeseburger',
    name: 'Double Cheese Burger',
    category: 'Burgers',
    price: 149,
    description: 'Double-stacked beef smash patties with double layers of cheddar and toasted brioche.',
    emoji: '🍔',
    image: '/assets/hero-banner.png',
    is_available: true,
    max_portions: 21,
    stock_status: 'available',
    recipes: [
      { id: 5, ingredient_id: 'brioche-bun', qty: 1, ingredient: { id: 'brioche-bun', name: 'Brioche Bun', category: 'Bakery', stock: 33, unit: 'pcs' } },
      { id: 6, ingredient_id: 'beef-patty', qty: 2, ingredient: { id: 'beef-patty', name: 'Beef Patty', category: 'Meat', stock: 43, unit: 'pcs' } },
      { id: 7, ingredient_id: 'cheddar-slice', qty: 2, ingredient: { id: 'cheddar-slice', name: 'Cheddar Slice', category: 'Dairy', stock: 48, unit: 'slices' } },
    ]
  },
  {
    id: 'pepperoni-pizza',
    name: 'Pepperoni Pizza',
    category: 'Pizzas',
    price: 169,
    description: 'Loaded with savory pepperoni cuts, premium mozzarella cheese blend, and signature Italian sauce.',
    emoji: '🍕',
    image: '/assets/menu-pizza.png',
    is_available: true,
    max_portions: 10,
    stock_status: 'available',
    recipes: [
      { id: 8, ingredient_id: 'pizza-dough', qty: 1, ingredient: { id: 'pizza-dough', name: 'Pizza Dough Base', category: 'Bakery', stock: 20, unit: 'pcs' } },
      { id: 9, ingredient_id: 'tomato-sauce', qty: 1, ingredient: { id: 'tomato-sauce', name: 'Italian Pizza Sauce', category: 'Produce', stock: 40, unit: 'cups' } },
      { id: 10, ingredient_id: 'mozzarella', qty: 2, ingredient: { id: 'mozzarella', name: 'Mozzarella Cheese', category: 'Dairy', stock: 30, unit: 'slices' } },
      { id: 11, ingredient_id: 'pepperoni', qty: 6, ingredient: { id: 'pepperoni', name: 'Pepperoni Slices', category: 'Meat', stock: 60, unit: 'slices' } },
    ]
  },
  {
    id: 'all-cheese-pizza',
    name: 'All Cheese Pizza',
    category: 'Pizzas',
    price: 159,
    description: 'A cheesy paradise featuring melted mozzarella and cheddar cheese over seasoned tomato sauce.',
    emoji: '🧀',
    image: '/assets/menu-pizza.png',
    is_available: true,
    max_portions: 10,
    stock_status: 'available',
    recipes: [
      { id: 12, ingredient_id: 'pizza-dough', qty: 1, ingredient: { id: 'pizza-dough', name: 'Pizza Dough Base', category: 'Bakery', stock: 20, unit: 'pcs' } },
      { id: 13, ingredient_id: 'tomato-sauce', qty: 1, ingredient: { id: 'tomato-sauce', name: 'Italian Pizza Sauce', category: 'Produce', stock: 40, unit: 'cups' } },
      { id: 14, ingredient_id: 'mozzarella', qty: 3, ingredient: { id: 'mozzarella', name: 'Mozzarella Cheese', category: 'Dairy', stock: 30, unit: 'slices' } },
      { id: 15, ingredient_id: 'cheddar-slice', qty: 2, ingredient: { id: 'cheddar-slice', name: 'Cheddar Slice', category: 'Dairy', stock: 48, unit: 'slices' } },
    ]
  },
  {
    id: 'chicken-wings-rice',
    name: 'Chicken Wings Rice Meal',
    category: 'RiceMeals',
    price: 129,
    description: 'Crispy flavorful glazed chicken wings served with fragrant steamed rice and dipping sauce.',
    emoji: '🍗',
    image: '/assets/hero-banner.png',
    is_available: true,
    max_portions: 12,
    stock_status: 'available',
    recipes: [
      { id: 16, ingredient_id: 'chicken-wings', qty: 4, ingredient: { id: 'chicken-wings', name: 'Crispy Wings Cut', category: 'Meat', stock: 50, unit: 'pcs' } },
      { id: 17, ingredient_id: 'cooked-rice', qty: 1, ingredient: { id: 'cooked-rice', name: 'Steamed Rice', category: 'Produce', stock: 60, unit: 'cups' } },
    ]
  },
  {
    id: 'loaded-fries',
    name: 'Loaded Cheese Fries',
    category: 'Sides',
    price: 79,
    description: 'Crispy golden fries generously topped with warm melted cheddar cheese sauce.',
    emoji: '🍟',
    image: '/assets/hero-banner.png',
    is_available: true,
    max_portions: 24,
    stock_status: 'available',
    recipes: [
      { id: 18, ingredient_id: 'potato-fries', qty: 1, ingredient: { id: 'potato-fries', name: 'Cut Potato Fries', category: 'Produce', stock: 30, unit: 'portions' } },
      { id: 19, ingredient_id: 'cheddar-slice', qty: 2, ingredient: { id: 'cheddar-slice', name: 'Cheddar Slice', category: 'Dairy', stock: 48, unit: 'slices' } },
    ]
  },
  {
    id: 'classic-milktea',
    name: 'Milktea Classic',
    category: 'Drinks',
    price: 49,
    description: 'Timeless brewed black tea infused with creamy milk and loaded with chewy brown sugar tapioca pearls.',
    emoji: '🧋',
    image: '/assets/menu-coffee.png',
    is_available: true,
    max_portions: 44,
    stock_status: 'available',
    recipes: [
      { id: 20, ingredient_id: 'tea-base', qty: 1, ingredient: { id: 'tea-base', name: 'Brewed Tea Base', category: 'Produce', stock: 50, unit: 'cups' } },
      { id: 21, ingredient_id: 'fresh-milk', qty: 1, ingredient: { id: 'fresh-milk', name: 'Fresh Dairy Milk', category: 'Dairy', stock: 44, unit: 'cups' } },
      { id: 22, ingredient_id: 'tapioca-pearls', qty: 1, ingredient: { id: 'tapioca-pearls', name: 'Chewy Tapioca Pearls', category: 'Bakery', stock: 54, unit: 'cups' } },
    ]
  },
  {
    id: 'brown-sugar-milktea',
    name: 'Brown Sugar Boba Milk',
    category: 'Drinks',
    price: 69,
    description: 'Warm tiger-striped brown sugar drizzle, fresh dairy milk, and slow-cooked boba pearls.',
    emoji: '🧋',
    image: '/assets/menu-coffee.png',
    is_available: true,
    max_portions: 34,
    stock_status: 'available',
    recipes: [
      { id: 23, ingredient_id: 'fresh-milk', qty: 1, ingredient: { id: 'fresh-milk', name: 'Fresh Dairy Milk', category: 'Dairy', stock: 44, unit: 'cups' } },
      { id: 24, ingredient_id: 'brown-sugar', qty: 1, ingredient: { id: 'brown-sugar', name: 'Brown Sugar Syrup', category: 'Produce', stock: 34, unit: 'cups' } },
      { id: 25, ingredient_id: 'tapioca-pearls', qty: 1, ingredient: { id: 'tapioca-pearls', name: 'Chewy Tapioca Pearls', category: 'Bakery', stock: 54, unit: 'cups' } },
    ]
  },
  {
    id: 'matcha-latte',
    name: 'Matcha Latte Series',
    category: 'Drinks',
    price: 79,
    description: 'Fine Japanese ceremonial matcha layered over cold fresh milk and sweet pearls.',
    emoji: '🍵',
    image: '/assets/menu-coffee.png',
    is_available: true,
    max_portions: 12,
    stock_status: 'available',
    recipes: [
      { id: 26, ingredient_id: 'matcha-powder', qty: 2, ingredient: { id: 'matcha-powder', name: 'Matcha Powder', category: 'Produce', stock: 25, unit: 'scoops' } },
      { id: 27, ingredient_id: 'fresh-milk', qty: 1, ingredient: { id: 'fresh-milk', name: 'Fresh Dairy Milk', category: 'Dairy', stock: 44, unit: 'cups' } },
      { id: 28, ingredient_id: 'tapioca-pearls', qty: 1, ingredient: { id: 'tapioca-pearls', name: 'Chewy Tapioca Pearls', category: 'Bakery', stock: 54, unit: 'cups' } },
    ]
  },
  {
    id: 'taro-milktea',
    name: 'Taro Sweet Milktea',
    category: 'Drinks',
    price: 69,
    description: 'Rich velvety purple taro with tea essence, creamy dairy, and bouncy pearls.',
    emoji: '🧋',
    image: '/assets/menu-coffee.png',
    is_available: true,
    max_portions: 12,
    stock_status: 'available',
    recipes: [
      { id: 29, ingredient_id: 'taro-powder', qty: 2, ingredient: { id: 'taro-powder', name: 'Taro Flavor Powder', category: 'Produce', stock: 25, unit: 'scoops' } },
      { id: 30, ingredient_id: 'tea-base', qty: 1, ingredient: { id: 'tea-base', name: 'Brewed Tea Base', category: 'Produce', stock: 50, unit: 'cups' } },
      { id: 31, ingredient_id: 'fresh-milk', qty: 1, ingredient: { id: 'fresh-milk', name: 'Fresh Dairy Milk', category: 'Dairy', stock: 44, unit: 'cups' } },
      { id: 32, ingredient_id: 'tapioca-pearls', qty: 1, ingredient: { id: 'tapioca-pearls', name: 'Chewy Tapioca Pearls', category: 'Bakery', stock: 54, unit: 'cups' } },
    ]
  },
  {
    id: 'caramel-macchiato',
    name: 'Iced Caramel Macchiato',
    category: 'Coffee',
    price: 89,
    description: 'Freshly extracted espresso shot combined with vanilla-infused milk and buttery caramel drizzle.',
    emoji: '☕',
    image: '/assets/menu-coffee.png',
    is_available: true,
    max_portions: 40,
    stock_status: 'available',
    recipes: [
      { id: 33, ingredient_id: 'coffee-beans', qty: 1, ingredient: { id: 'coffee-beans', name: 'Espresso Roast', category: 'Produce', stock: 40, unit: 'shots' } },
      { id: 34, ingredient_id: 'fresh-milk', qty: 1, ingredient: { id: 'fresh-milk', name: 'Fresh Dairy Milk', category: 'Dairy', stock: 44, unit: 'cups' } },
    ]
  },
  {
    id: 'halo-halo-deluxe',
    name: 'G Shot Halo-Halo',
    category: 'Sides',
    price: 99,
    description: 'Filipino shaved ice delicacy loaded with sweet jellies, leche flan, ube, and rich milk.',
    emoji: '🍧',
    image: '/assets/hero-banner.png',
    is_available: true,
    max_portions: 30,
    stock_status: 'available',
    recipes: []
  }
];

const DEFAULT_INGREDIENTS = [
  { id: 'brioche-bun', name: 'Brioche Bun', category: 'Bakery', stock: 33, unit: 'pcs', low_threshold: 10 },
  { id: 'beef-patty', name: 'Beef Patty', category: 'Meat', stock: 43, unit: 'pcs', low_threshold: 12 },
  { id: 'cheddar-slice', name: 'Cheddar Slice', category: 'Dairy', stock: 48, unit: 'slices', low_threshold: 15 },
  { id: 'lettuce', name: 'Fresh Lettuce', category: 'Produce', stock: 23, unit: 'pcs', low_threshold: 8 },
  { id: 'pizza-dough', name: 'Pizza Dough Base', category: 'Bakery', stock: 20, unit: 'pcs', low_threshold: 5 },
  { id: 'mozzarella', name: 'Mozzarella Cheese', category: 'Dairy', stock: 30, unit: 'slices', low_threshold: 10 },
  { id: 'tomato-sauce', name: 'Italian Pizza Sauce', category: 'Produce', stock: 40, unit: 'cups', low_threshold: 10 },
  { id: 'pepperoni', name: 'Pepperoni Slices', category: 'Meat', stock: 60, unit: 'slices', low_threshold: 15 },
  { id: 'potato-fries', name: 'Cut Potato Fries', category: 'Produce', stock: 30, unit: 'portions', low_threshold: 8 },
  { id: 'chicken-wings', name: 'Crispy Wings Cut', category: 'Meat', stock: 50, unit: 'pcs', low_threshold: 12 },
  { id: 'cooked-rice', name: 'Steamed Rice', category: 'Produce', stock: 60, unit: 'cups', low_threshold: 15 },
  { id: 'tea-base', name: 'Brewed Tea Base', category: 'Produce', stock: 50, unit: 'cups', low_threshold: 12 },
  { id: 'fresh-milk', name: 'Fresh Dairy Milk', category: 'Dairy', stock: 44, unit: 'cups', low_threshold: 10 },
  { id: 'tapioca-pearls', name: 'Chewy Tapioca Pearls', category: 'Bakery', stock: 54, unit: 'cups', low_threshold: 15 },
  { id: 'brown-sugar', name: 'Brown Sugar Syrup', category: 'Produce', stock: 34, unit: 'cups', low_threshold: 8 },
  { id: 'matcha-powder', name: 'Matcha Powder', category: 'Produce', stock: 25, unit: 'scoops', low_threshold: 6 },
  { id: 'taro-powder', name: 'Taro Flavor Powder', category: 'Produce', stock: 25, unit: 'scoops', low_threshold: 6 },
  { id: 'cream-cheese', name: 'Cream Cheese Puff', category: 'Dairy', stock: 30, unit: 'scoops', low_threshold: 8 },
  { id: 'coffee-beans', name: 'Espresso Roast', category: 'Produce', stock: 40, unit: 'shots', low_threshold: 10 }
];

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Taro & Matcha Cloud Series Launch',
    badge: 'New Menu',
    badge_color: 'purple',
    description: 'Try our freshly crafted Velvet Taro Sweet Milk Tea and Ceremonial Matcha Latte crowned with rich cream cheese foam. Available now in store and online delivery!',
    image_url: '/assets/menu-coffee.png',
    cta_text: 'Order New Drinks',
    cta_action: 'menu',
    is_active: true,
    priority: 10,
    created_by: 'Store Manager',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Weekend Fiesta: Free Loaded Fries on Orders ?350+',
    badge: 'Limited Promo',
    badge_color: 'yellow',
    description: 'Celebrate this weekend with G Shot Teas! Spend a minimum of ?350 on any milk tea and burgers to automatically receive a complimentary box of warm Crispy Loaded Cheese Fries.',
    image_url: null, // Photo optional! Automatically morphs into rich typographic glass card layout
    cta_text: 'Browse Menu & Claim',
    cta_action: 'menu',
    is_active: true,
    priority: 5,
    created_by: 'Admin',
    created_at: new Date().toISOString(),
  }
];

const DEFAULT_BOOKING_PACKAGES = [
  {
    id: 1,
    slug: 'coffee-package',
    name: 'Coffee Package',
    subtitle: 'Featuring Coldbrew & Signature Artisan Brews',
    badge: 'COFFEE PACKAGE',
    accent_color: 'amber',
    price: 3500,
    pricing_type: 'per_pack',
    base_pax: 50,
    option_label: 'Coffee Package (₱3,500 • 50 cups 12oz • 5 choices • 3 hrs)',
    description: 'Includes: 50 cups of 12oz, 3 hours of on-site service, 5 choices of drinks (Coldbrew & specialty blends), and trained barista staff.',
    inclusions: [
      '50 Cups of 12oz servings',
      '3 Hours of Service with on-site barista staff',
      '5 Choices of Drinks (Coldbrew & Specialty Coffee selections)',
    ],
    image_url: '/assets/booking-coffee-package.jpg',
    show_in_banner: true,
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    slug: 'fruity-float-package',
    name: 'Fruity Float Package',
    subtitle: 'Featuring Sparkling Sodas & Ice Cream Floats',
    badge: 'FRUITY FLOAT PACKAGE',
    accent_color: 'rose',
    price: 3500,
    pricing_type: 'per_pack',
    base_pax: 50,
    option_label: 'Fruity Float Package (₱3,500 • 50 cups 16oz • 7 choices • 3 hrs)',
    description: 'Includes: 50 cups of 16oz, 3 hours of on-site service, 7 choices of drinks (Sparkling sodas & ice cream fruity floats), and trained barista staff.',
    inclusions: [
      '50 Cups of 16oz servings (larger size!)',
      '3 Hours of Service with on-site barista staff',
      '7 Choices of Drinks (Fruity float & sparkling refreshers)',
    ],
    image_url: '/assets/booking-fruity-float.jpg',
    show_in_banner: true,
    is_active: true,
    sort_order: 2,
  },
  {
    id: 3,
    slug: 'mobile-bar-milktea-booth',
    name: 'Mobile Bar & Milktea Booth',
    subtitle: 'Custom Event & Mobile Bar Booth',
    badge: 'MOBILE BAR BOOTH',
    accent_color: 'amber',
    price: 95,
    pricing_type: 'per_guest',
    base_pax: 1,
    option_label: 'Custom Mobile Bar & Milktea Booth',
    description: 'Includes custom milk tea & snack booth setup, drink cups, straws, pearls, and on-site staff. Transpo fee varies by location.',
    inclusions: [
      'Custom milk tea & drink bar setup',
      'Cups, straws, pearls & sinkers included',
      'On-site trained service staff',
    ],
    image_url: null,
    show_in_banner: false,
    is_active: true,
    sort_order: 3,
  },
  {
    id: 4,
    slug: 'comfort-food-catering',
    name: 'Comfort Food Catering',
    subtitle: 'Burgers & Pizza Party Catering',
    badge: 'FOOD CATERING',
    accent_color: 'emerald',
    price: 95,
    pricing_type: 'per_guest',
    base_pax: 1,
    option_label: 'Comfort Food Catering (Burgers & Pizza)',
    description: 'Includes freshly prepared burgers, pizzas, and party food packs with serving setup. Transpo fee varies by location.',
    inclusions: [
      'Freshly grilled burgers & artisan pizzas',
      'Party food packaging & serving setup',
      'Dedicated event coordination',
    ],
    image_url: null,
    show_in_banner: false,
    is_active: true,
    sort_order: 4,
  },
  {
    id: 5,
    slug: 'bulk-order-delivery',
    name: 'Bulk Order Delivery',
    subtitle: 'Bulk Party Pack Delivery',
    badge: 'BULK PARTY PACK',
    accent_color: 'sky',
    price: 95,
    pricing_type: 'per_guest',
    base_pax: 1,
    option_label: 'Bulk Party Pack Delivery',
    description: 'Includes bulk drink and snack party packs delivered straight to your venue. Delivery fee varies by location.',
    inclusions: [
      'Bulk milk tea, coffee & snack packs',
      'Individually sealed & labeled cups',
      'Scheduled venue delivery',
    ],
    image_url: null,
    show_in_banner: false,
    is_active: true,
    sort_order: 5,
  },
];

const useGShotStore = defineStore('gshot', {
  state: () => ({
    // User & Session
    user: JSON.parse(localStorage.getItem('gst_user') || 'null'),
    token: localStorage.getItem('gst_auth_token') || '',

    // Navigation & Modals
    currentView: (typeof window !== 'undefined' && (
      window.location.pathname.includes('admin') || 
      window.location.pathname.includes('staff') || 
      window.location.pathname.includes('superadmin') || 
      window.location.pathname.includes('super-admin') || 
      window.location.pathname.includes('dashboard') ||
      window.location.pathname.includes('operation') ||
      window.location.pathname.includes('ops') ||
      window.location.pathname.includes('terminal') ||
      window.location.pathname.includes('portal') ||
      window.location.pathname.includes('driver') ||
      window.location.pathname.includes('rider')
    )) ? (
      (window.location.pathname.includes('driver') || window.location.pathname.includes('rider')) ? 'driver' : 'admin'
    ) : (
      (function() {
        try {
          const u = JSON.parse(localStorage.getItem('gst_user') || 'null');
          if (u && ['staff', 'admin', 'super_admin', 'superadmin', 'driver', 'rider'].includes(u.role)) {
            return (u.role === 'driver' || u.role === 'rider') ? 'driver' : 'admin';
          }
        } catch (e) {}
        return 'customer';
      })()
    ), // 'customer' | 'admin' | 'driver' | 'checkout' | 'track' | 'history'
    activeSection: 'home',   // 'home' | 'menu' | 'about' | 'contact'
    adminTab: 'orders',      // 'orders' | 'analytics' | 'products' | 'inventory' | 'recipes' | 'bookings' | 'users' | 'audit'
    cartOpen: false,
    authModalOpen: false,
    authMode: 'login', // 'login' | 'register'
    pendingCheckout: false,
    customizeModalOpen: false,
    selectedProductForCustomize: null,
    customizeInitialQty: 1,
    bookingModalOpen: false,
    bookingModalTab: 'form', // 'form' | 'history'
    lastSubmittedBookingId: null,
    profileDropdownOpen: false,

    // Data from Backend API (Pre-populated with rich defaults so menu never disappears)
    products: JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)),
    ingredients: JSON.parse(JSON.stringify(DEFAULT_INGREDIENTS)),
    orders: [],
    activeOrder: null,
    settings: {
      order_area_note: 'Orders are only available in Santa Rosa bayan.',
      order_area_note_enabled: 'true',
    },
    auditLogs: [],
    usersList: [],
    bookingsList: [],
    analytics: null,
    googleConfig: { client_id: '373451248580-gkci5qsn9j0euan2hafq5v01bhborvlo.apps.googleusercontent.com', configured: true },

    // Shopping Cart (sanitizing corrupted '??' emojis from previous sessions)
    cart: (() => {
      try {
        const raw = JSON.parse(localStorage.getItem('gst_cart') || '[]');
        return Array.isArray(raw) ? raw.map(item => ({
          ...item,
          emoji: (typeof item.emoji === 'string' && !item.emoji.includes('?')) ? item.emoji : ''
        })) : [];
      } catch (e) {
        return [];
      }
    })(),

    // UI Toasts & Status
    toasts: [],
    loading: false,
    backendConnected: false,

    // Announcements (Promos, New Menus, Advisories)
    announcements: JSON.parse(JSON.stringify(DEFAULT_ANNOUNCEMENTS)),
    announcementModalOpen: false,
    editingAnnouncement: null,

    // Booking & Flyer Preview
    bookingPackages: JSON.parse(JSON.stringify(DEFAULT_BOOKING_PACKAGES)),
    selectedBookingPackage: null,
    previewFlyerImage: null,
    previewFlyerPackage: null,

    // Food & Drink Menu Item Photo Lightbox Preview
    previewProduct: null,

    // Shared POS Terminal Quick Staff PIN Switcher
    staffPinModalOpen: false,

    // Delivery Fleet & Rider Notices
    riderNotices: [],
    unreadRiderNoticesCount: 0,
    showRiderNoticesModal: false,
    remittances: [],
    pendingRemittancesCount: 0,
    remittanceSummary: null,
    previewProofImage: null,

    // Terminal & Staff Security Lock State
    isTerminalLocked: localStorage.getItem("gst_terminal_locked") === "true",
    lockedUser: JSON.parse(localStorage.getItem("gst_locked_user") || "null"),
    lockedStaffIds: JSON.parse(localStorage.getItem("gst_locked_staff_ids") || "[]"),
  }),

  getters: {
    activeAnnouncements: (state) => state.announcements.filter(a => a.is_active),
    activeBookingPackages: (state) => (state.bookingPackages || []).filter(p => p.is_active !== false),
    cartCount: (state) => state.cart.reduce((sum, item) => sum + item.quantity, 0),
    cartSubtotal: (state) => state.cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),
    cartDeliveryFee: (state) => (state.cart.length > 0 ? 40 : 0),
    cartTotal: (state) => state.cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0) + (state.cart.length > 0 ? 40 : 0),

    isDriver: (state) => state.user?.role === 'driver',
    isStaffOnly: (state) => state.user?.role === 'staff',
    isStaffOrAdmin: (state) => ['staff', 'admin', 'super_admin', 'superadmin'].includes(state.user?.role),
    isAdminOrSuper: (state) => ['admin', 'super_admin'].includes(state.user?.role),
    isSuperAdmin: (state) => state.user?.role === 'super_admin',

    isMaintenanceMode: (state) => {
      if (state.settings && state.settings.maintenance_mode !== undefined) {
        return state.settings.maintenance_mode === 'true' || state.settings.maintenance_mode === true || state.settings.maintenance_mode === '1';
      }
      return false;
    },
    maintenanceTitle: (state) => state.settings?.maintenance_title || 'Website Under Scheduled Maintenance',
    maintenanceMessage: (state) => state.settings?.maintenance_message || 'G Shot Teas is currently undergoing essential system updates and performance enhancements. Customer ordering is temporarily paused. We will be back online shortly!',
    maintenanceUntil: (state) => state.settings?.maintenance_until || '',

    orderAreaNote: (state) => state.settings?.order_area_note || 'Orders are only available in Santa Rosa bayan.',
    isOrderAreaNoteEnabled: (state) => {
      if (state.settings && state.settings.order_area_note_enabled !== undefined && state.settings.order_area_note_enabled !== null) {
        return state.settings.order_area_note_enabled === 'true' || state.settings.order_area_note_enabled === true || state.settings.order_area_note_enabled === '1' || state.settings.order_area_note_enabled === 1;
      }
      return true;
    },

    isStoreOpen: (state) => {
      if (state.settings && state.settings.store_open !== undefined) {
        return state.settings.store_open === 'true' || state.settings.store_open === true;
      }
      return true;
    },

    ingredientMap: (state) => {
      const map = {};
      const list = Array.isArray(state.ingredients) ? state.ingredients : [];
      list.forEach(ing => { if (ing && ing.id) map[ing.id] = ing; });
      return map;
    },

    lowStockAlerts: (state) => {
      if (!Array.isArray(state.ingredients)) return [];
      return state.ingredients.filter(ing => ing && Number(ing.stock) <= Number(ing.low_threshold));
    },

    isPaymongoAvailable: (state) => {
      if (state.settings && state.settings.paymongo_available !== undefined && state.settings.paymongo_available !== null) {
        return state.settings.paymongo_available === 'true' || state.settings.paymongo_available === true || state.settings.paymongo_available === '1' || state.settings.paymongo_available === 1;
      }
      return true;
    },


    discountedProductsCount: (state) => state.products.filter(p => (p.original_price && Number(p.original_price) > Number(p.price)) || (p.discount_percent && Number(p.discount_percent) > 0)).length,
    discountedProducts: (state) => state.products.filter(p => (p.original_price && Number(p.original_price) > Number(p.price)) || (p.discount_percent && Number(p.discount_percent) > 0)),
  },

  actions: {
    // Notifications
    notify(msg, type = 'success') {
      const id = Date.now() + Math.random();
      this.toasts.push({ id, msg, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, 4000);
    },

    removeToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    },

    addToast(msg, type = 'success') {
      this.notify(msg, type);
    },

    // Initialize Store
    async init() {
      // Immediate Guard: Operational personnel (staff, driver, admin, super admin) only need the dashboard
      if (this.user && ['staff', 'admin', 'super_admin', 'superadmin', 'driver', 'rider'].includes(this.user.role)) {
        const isOpsPath = typeof window !== 'undefined' && (
          window.location.pathname.includes('admin') || 
          window.location.pathname.includes('staff') || 
          window.location.pathname.includes('superadmin') || 
          window.location.pathname.includes('super-admin') || 
          window.location.pathname.includes('dashboard') ||
          window.location.pathname.includes('operation') ||
          window.location.pathname.includes('ops') ||
          window.location.pathname.includes('terminal') ||
          window.location.pathname.includes('portal') ||
          window.location.pathname.includes('driver') ||
          window.location.pathname.includes('rider')
        );
        if (!isOpsPath) {
          const target = (this.user.role === 'driver' || this.user.role === 'rider') ? '/driver' : '/admin';
          window.location.replace(target);
          return;
        }
      }

      await this.refreshAllData();
      // Non-blocking single-flight periodic refresh for active order & event booking status
      let isPollInFlight = false;
      let isBookingPollInFlight = false;
      setInterval(async () => {
        if (this.currentView === 'track' && this.activeOrder && !isPollInFlight) {
          isPollInFlight = true;
          try {
            await this.refreshActiveOrder(this.activeOrder.id || this.activeOrder.order_number);
          } catch (e) {
            // Silently ignore transient network drops
          } finally {
            isPollInFlight = false;
          }
        }
        if ((this.currentView === 'bookings' || (this.bookingModalOpen && this.bookingModalTab === 'history')) && !isBookingPollInFlight) {
          isBookingPollInFlight = true;
          try {
            await this.fetchMyBookings();
          } catch (e) {
            // Silently ignore transient network drops
          } finally {
            isBookingPollInFlight = false;
          }
        }
      }, 7000);

      // Periodic automatic background synchronization with Loyverse POS
      setInterval(async () => {
        if (this.currentView === 'admin' || this.isStaffOrAdmin) {
          try {
            await GST_API.syncLoyverse();
          } catch (e) {
            // silent background sync
          }
        }
      }, 30000);
    },

    async refreshAllData() {
      try {
        const [prodRes, ingRes, setRes, googRes, annRes, pkgRes] = await Promise.allSettled([
          GST_API.getProducts(),
          GST_API.getIngredients(),
          GST_API.getSettings(),
          GST_API.getGoogleConfig(),
          this.isStaffOrAdmin ? GST_API.getAllAnnouncements() : GST_API.getAnnouncements(),
          this.isStaffOrAdmin ? GST_API.getAllBookingPackages() : GST_API.getBookingPackages(),
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value.data) {
          if (Array.isArray(prodRes.value.data) && prodRes.value.data.length > 0) {
            this.products = prodRes.value.data;
          }
          this.backendConnected = true;
        }
        if (ingRes.status === 'fulfilled' && ingRes.value.data) {
          const ingPayload = ingRes.value.data;
          const ingList = Array.isArray(ingPayload) ? ingPayload : (Array.isArray(ingPayload?.data) ? ingPayload.data : null);
          if (ingList) {
            this.ingredients = ingList;
          }
        }
        if (setRes.status === 'fulfilled' && setRes.value.data) {
          this.settings = setRes.value.data;
        }
        if (googRes.status === 'fulfilled' && googRes.value.data) {
          this.googleConfig = googRes.value.data;
        }
        if (annRes.status === 'fulfilled' && annRes.value.data) {
          this.announcements = annRes.value.data;
        }
        if (pkgRes.status === 'fulfilled' && Array.isArray(pkgRes.value.data) && pkgRes.value.data.length > 0) {
          this.bookingPackages = pkgRes.value.data;
        }

        // Fetch user's active order and event booking history
        if (this.user) {
          this.fetchUserActiveOrder();
        }
        if (this.user || this.getLocalBookingIds().length > 0) {
          this.fetchMyBookings();
        }
      } catch (err) {
        console.warn('Backend sync failed, using fallback mode:', err);
      }
    },

    async fetchProducts(params = {}) {
      try {
        const res = await GST_API.getProducts(params);
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.products = res.data;
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    },

    async fetchIngredients() {
      try {
        const res = await GST_API.getIngredients();
        const payload = res.data;
        const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : null);
        if (list) {
          this.ingredients = list;
        }
      } catch (err) {
        console.error('Error fetching ingredients:', err);
      }
    },

    async fetchRiderNotices(silent = false) {
      try {
        const res = await GST_API.getRiderNotices();
        const prevCount = this.unreadRiderNoticesCount;
        this.riderNotices = res.data.notices || [];
        this.unreadRiderNoticesCount = res.data.unread_count ?? this.riderNotices.filter(n => !n.is_acknowledged).length;

        if (!silent && this.unreadRiderNoticesCount > prevCount && prevCount >= 0 && (this.isAdminOrSuper || this.isStaffOnly)) {
          const newest = this.riderNotices[0];
          if (newest && !newest.is_acknowledged) {
            this.notify('Rider Notice: ' + newest.driver_name + ' is ' + (newest.status === 'available' ? 'Available' : 'Unavailable') + ' - ' + newest.reason, 'warning');
          }
        }
      } catch (err) {
        console.warn('Failed to fetch rider notices:', err);
      }
    },

    async submitRiderNotice(payload) {
      try {
        const res = await GST_API.submitRiderNotice(payload);
        if (this.user) {
          const updatedUser = res.data.driver || res.data.user;
          if (updatedUser) {
            this.user.is_available = updatedUser.is_available;
            this.user.driver_status = updatedUser.driver_status;
            this.user.availability_reason = updatedUser.availability_reason;
            this.user.availability_proof_image = updatedUser.availability_proof_image;
          } else {
            this.user.is_available = payload.is_available;
            this.user.driver_status = payload.is_available ? 'available' : 'offline';
            this.user.availability_reason = payload.reason;
            this.user.availability_proof_image = payload.proof_image;
          }
          localStorage.setItem('gst_user', JSON.stringify(this.user));
        }
        await this.fetchRiderNotices(true);
        return res.data;
      } catch (err) {
        throw err;
      }
    },

    async acceptRiderNotice(id) {
      try {
        const res = await GST_API.acceptRiderNotice(id);
        const notice = this.riderNotices.find(n => n.id == id);
        if (notice) {
          notice.is_acknowledged = true;
          notice.status = 'unavailable';
          notice.acknowledged_at = new Date().toISOString();
        }
        this.unreadRiderNoticesCount = Math.max(0, this.unreadRiderNoticesCount - 1);

        if (this.user && notice && this.user.id == notice.driver_id) {
          this.user.is_available = false;
          this.user.driver_status = 'offline';
          this.user.availability_reason = notice.reason;
          this.user.availability_proof_image = notice.proof_image;
          localStorage.setItem('gst_user', JSON.stringify(this.user));
        }

        this.notify('Notice accepted! Rider ' + (notice ? notice.driver_name : 'account') + ' is now flagged unavailable. Kitchen workers will not dispatch orders to him.', 'success');
        await this.fetchRiderNotices(true);
        return res.data;
      } catch (err) {
        this.notify(err.response?.data?.message || 'Failed to accept notice.', 'error');
        throw err;
      }
    },

    async acknowledgeRiderNotice(id) {
      return this.acceptRiderNotice(id);
    },

    async cancelRiderNotice(id) {
      try {
        const res = await GST_API.cancelRiderNotice(id);
        this.riderNotices = this.riderNotices.filter(n => n.id != id);
        this.unreadRiderNoticesCount = Math.max(0, this.unreadRiderNoticesCount - 1);
        if (this.user) {
          this.user.availability_reason = null;
          this.user.availability_proof_image = null;
          localStorage.setItem('gst_user', JSON.stringify(this.user));
        }
        this.notify('Pending unavailability notice cancelled.', 'info');
        await this.fetchRiderNotices(true);
        return res.data;
      } catch (err) {
        this.notify(err.response?.data?.message || 'Could not cancel notice.', 'error');
        throw err;
      }
    },

    async fetchRemittances(params = {}, silent = true) {
      try {
        const res = await GST_API.getRemittances(params);
        const prevCount = this.pendingRemittancesCount;
        this.remittances = res.data.remittances || [];
        this.pendingRemittancesCount = res.data.pending_count ?? this.remittances.filter(r => r.status === 'pending').length;
        this.remittanceSummary = res.data.summary || null;

        if (!silent && this.pendingRemittancesCount > prevCount && prevCount >= 0 && (this.isAdminOrSuper || this.isStaffOnly)) {
          const newest = this.remittances.find(r => r.status === 'pending');
          if (newest) {
            this.notify('COD Remittance Handover: ' + newest.driver_name + ' submitted ₱' + Number(newest.amount).toFixed(2) + ' (' + newest.reference_number + ')', 'warning');
          }
        }
        return res.data;
      } catch (err) {
        console.warn('Failed to fetch remittances:', err);
        return null;
      }
    },

    async acceptRemittance(id, staffNotes = '') {
      try {
        const res = await GST_API.acceptRemittance(id, staffNotes ? { staff_notes: staffNotes } : {});
        this.notify(res.data?.message || 'Remittance accepted and rider balance cleared!', 'success');
        await Promise.all([this.fetchRemittances({}, true), this.fetchOrders()]);
        return res.data;
      } catch (err) {
        this.notify(err.response?.data?.message || 'Failed to accept remittance.', 'error');
        throw err;
      }
    },

    async rejectRemittance(id, staffNotes = '') {
      try {
        const res = await GST_API.rejectRemittance(id, staffNotes ? { staff_notes: staffNotes } : {});
        this.notify(res.data?.message || 'Remittance returned for verification.', 'info');
        await Promise.all([this.fetchRemittances({}, true), this.fetchOrders()]);
        return res.data;
      } catch (err) {
        this.notify(err.response?.data?.message || 'Failed to reject remittance.', 'error');
        throw err;
      }
    },

    async fetchOrders(params = {}) {
      try {
        const res = await GST_API.getOrders(params);
        this.orders = res.data.data || res.data;
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    },

    async fetchUserActiveOrder() {
      try {
        const res = await GST_API.getActiveOrder(this.user?.id);
        const orderData = (res.data && res.data.data && Array.isArray(res.data.data)) ? null : (res.data?.order || res.data);
        if (orderData && (orderData.id || orderData.order_number)) {
          this.activeOrder = orderData;
          localStorage.setItem('gst_active_order_id', orderData.id);
          try {
            const list = JSON.parse(localStorage.getItem('gst_local_order_history') || '[]');
            const idStr = String(orderData.id);
            if (!list.includes(idStr)) {
              list.unshift(idStr);
              localStorage.setItem('gst_local_order_history', JSON.stringify(list.slice(0, 50)));
            }
          } catch (e) {}
          return;
        }
      } catch (err) {
        // quiet
      }
      const cachedId = localStorage.getItem('gst_active_order_id');
      if (cachedId) {
        await this.refreshActiveOrder(cachedId);
      }
    },

    async refreshActiveOrder(id) {
      if (!id) return;
      const cleanId = String(id).replace('#', '').trim();
      if (!cleanId || cleanId === 'undefined' || cleanId === 'null') return;
      try {
        const res = await GST_API.getOrder(cleanId);
        const orderData = (res.data && res.data.data && Array.isArray(res.data.data)) ? null : (res.data?.order || res.data);
        if (orderData && (orderData.id || orderData.order_number)) {
          this.activeOrder = orderData;
          localStorage.setItem('gst_active_order_id', orderData.id);
        }
      } catch (err) {
        // quiet
      }
    },

    getLocalBookingIds() {
      try {
        const raw = JSON.parse(localStorage.getItem('gst_local_booking_history') || '[]');
        return Array.isArray(raw) ? raw.map(id => String(id)).filter(Boolean) : [];
      } catch (e) {
        return [];
      }
    },

    saveLocalBookingId(id) {
      if (!id) return;
      try {
        const idStr = String(id);
        const list = this.getLocalBookingIds().filter(x => x !== idStr);
        list.unshift(idStr);
        localStorage.setItem('gst_local_booking_history', JSON.stringify(list.slice(0, 50)));
      } catch (e) {}
    },

    async fetchMyBookings(extraParams = {}) {
      try {
        const params = { ...extraParams };
        if (this.user?.id) params.user_id = this.user.id;
        const localIds = this.getLocalBookingIds();
        if (localIds.length > 0) params.ids = localIds.join(',');
        if (!params.user_id && !params.ids && !params.search) {
          this.bookingsList = [];
          return [];
        }
        const res = await GST_API.getMyBookings(params);
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        this.bookingsList = list;
        return list;
      } catch (err) {
        console.error('Error fetching event bookings:', err);
        return this.bookingsList || [];
      }
    },

    async fetchAnalytics(params = {}) {
      try {
        const res = await GST_API.getAnalytics(params);
        this.analytics = res.data;
      } catch (err) {
        console.error('Error fetching analytics:', err);
      }
    },

    // Stock & Cart Limit Helpers
    getProductMaxStock(productOrId) {
      const id = typeof productOrId === 'string' ? productOrId : productOrId?.id;
      const liveProduct = (id ? this.products.find(p => p.id === id) : null)
        || (typeof productOrId === 'object' ? productOrId : null);

      if (!liveProduct || liveProduct.is_available === false) {
        return 0;
      }
      if (liveProduct.max_portions !== undefined && liveProduct.max_portions !== null) {
        return Math.max(0, Math.floor(Number(liveProduct.max_portions) || 0));
      }
      return 999;
    },

    getProductCartQty(productId) {
      if (!productId) return 0;
      return this.cart.reduce((sum, item) => {
        return item.product_id === productId ? sum + (Number(item.quantity) || 0) : sum;
      }, 0);
    },

    getRemainingStock(productOrId) {
      const id = typeof productOrId === 'string' ? productOrId : productOrId?.id;
      const maxStock = this.getProductMaxStock(productOrId);
      const inCart = this.getProductCartQty(id);
      return Math.max(0, maxStock - inCart);
    },

    canIncrementCartItem(cartItem) {
      if (!cartItem) return false;
      const maxStock = this.getProductMaxStock(cartItem.product_id);
      const currentTotal = this.getProductCartQty(cartItem.product_id);
      return currentTotal < maxStock;
    },

    getCartStockViolations() {
      const totalsByProduct = {};
      for (const item of this.cart) {
        const pid = item.product_id;
        if (!totalsByProduct[pid]) {
          totalsByProduct[pid] = { product_id: pid, name: item.name, cartQty: 0 };
        }
        totalsByProduct[pid].cartQty += Number(item.quantity) || 0;
      }
      const violations = [];
      for (const entry of Object.values(totalsByProduct)) {
        const maxStock = this.getProductMaxStock(entry.product_id);
        if (entry.cartQty > maxStock) {
          violations.push({ ...entry, maxStock });
        }
      }
      return violations;
    },

    // Cart Management
    addToCart(product, customization = null, qty = 1) {
      if (!product) return false;
      const liveProduct = this.products.find(p => p.id === product.id) || product;
      const maxStock = this.getProductMaxStock(liveProduct);
      const currentInCart = this.getProductCartQty(liveProduct.id);
      const addQty = Math.max(1, Math.floor(Number(qty) || 1));

      if (maxStock <= 0) {
        this.notify(`${liveProduct.name} is currently sold out.`, 'error');
        return false;
      }

      if (currentInCart + addQty > maxStock) {
        const remaining = Math.max(0, maxStock - currentInCart);
        if (remaining <= 0) {
          this.notify(`Cannot add more ${liveProduct.name}. Only ${maxStock} stock${maxStock === 1 ? '' : 's'} available and you already have ${currentInCart} in your cart.`, 'warning');
        } else {
          this.notify(`Only ${remaining} more ${liveProduct.name} available (${maxStock} total in stock).`, 'warning');
        }
        return false;
      }

      let unitPrice = Number(liveProduct.price ?? product.price ?? 0);
      if (customization) {
        if (customization.size === 'Large') unitPrice += 20;
        if (customization.toppings && customization.toppings.length) {
          unitPrice += customization.toppings.length * 15;
        }
      }

      const cartItemId = customization
        ? `${liveProduct.id}-${customization.size}-${customization.sugar}-${customization.ice}-${(customization.toppings || []).join(',')}`
        : liveProduct.id;

      const existingIndex = this.cart.findIndex(i => i.cartItemId === cartItemId);

      if (existingIndex > -1) {
        this.cart[existingIndex].quantity += addQty;
      } else {
        this.cart.push({
          cartItemId,
          product_id: liveProduct.id,
          name: liveProduct.name,
          category: liveProduct.category,
          emoji: (liveProduct.emoji && !liveProduct.emoji.includes('?')) ? liveProduct.emoji : '',
          image: liveProduct.image,
          unit_price: unitPrice,
          quantity: addQty,
          customization: customization || { size: 'Regular' },
        });
      }

      this.saveCart();
      this.notify(`Added ${liveProduct.name} to cart!`);
      return true;
    },

    updateCartQty(cartItemId, delta) {
      const idx = this.cart.findIndex(i => i.cartItemId === cartItemId);
      if (idx === -1) return false;

      if (delta > 0) {
        const item = this.cart[idx];
        const maxStock = this.getProductMaxStock(item.product_id);
        const currentTotal = this.getProductCartQty(item.product_id);
        if (currentTotal + delta > maxStock) {
          this.notify(`Cannot add more ${item.name}. Only ${maxStock} stock${maxStock === 1 ? '' : 's'} available.`, 'warning');
          return false;
        }
      }

      this.cart[idx].quantity += delta;
      if (this.cart[idx].quantity <= 0) {
        this.cart.splice(idx, 1);
      }
      this.saveCart();
      return true;
    },

    removeFromCart(cartItemId) {
      this.cart = this.cart.filter(i => i.cartItemId !== cartItemId);
      this.saveCart();
    },

    decrementProductCart(productId) {
      if (!productId) return false;
      for (let i = this.cart.length - 1; i >= 0; i--) {
        if (this.cart[i].product_id === productId) {
          return this.updateCartQty(this.cart[i].cartItemId, -1);
        }
      }
      return false;
    },

    clearCart() {
      this.cart = [];
      this.saveCart();
    },

    saveCart() {
      localStorage.setItem('gst_cart', JSON.stringify(this.cart));
    },

    

    openStaffPinModal() {
      if (this.isStaffOnly) {
        this.staffPinModalOpen = true;
      }
    },
    closeStaffPinModal() {
      this.staffPinModalOpen = false;
    },

    // Fast 4-Digit PIN Switcher for Shared POS Terminal
    async switchStaffPin(pin, userId) {
      try {
        const previousStaffId = (this.user && this.user.role === 'staff' && Number(this.user.id) !== Number(userId)) ? Number(this.user.id) : null;
        const res = await GST_API.quickPinLogin(pin, userId);
        this.user = res.data.user;
        this.token = res.data.token;
        localStorage.setItem('gst_user', JSON.stringify(this.user));
        if (this.token) {
          localStorage.setItem('gst_auth_token', this.token);
        }
        document.cookie = `gst_role=${this.user.role}; path=/; max-age=${30 * 86400}; SameSite=Lax`;

        // Auto-lock previous staff account upon PIN handoff
        if (previousStaffId) {
          this.lockStaffAccount(previousStaffId);
        }

        this.staffPinModalOpen = false;
        this.notify(`Operator on duty: ${this.user.name} (${this.user.role.toUpperCase()})`, 'success');
        if (['staff', 'admin', 'super_admin'].includes(this.user.role)) {
          this.currentView = 'admin';
          if (!window.location.pathname.includes('admin') && !window.location.pathname.includes('staff') && !window.location.pathname.includes('superadmin') && !window.location.pathname.includes('super-admin') && !window.location.pathname.includes('dashboard')) {
            window.location.href = '/admin';
          }
        }
        return this.user;
      } catch (err) {
        const msg = err.response?.data?.message || 'Invalid 4-digit PIN code. Please try again.';
        this.notify(msg, 'error');
        throw err;
      }
    },

    // Terminal Lock & Unlock Actions
    lockTerminal() {
      if (!this.user) return;
      this.isTerminalLocked = true;
      this.lockedUser = { ...this.user };
      localStorage.setItem('gst_terminal_locked', 'true');
      localStorage.setItem('gst_locked_user', JSON.stringify(this.lockedUser));
      this.notify(`Terminal locked for ${this.user.name}. Password required to unlock.`, 'info');
    },

    async unlockTerminal(password) {
      const targetUser = this.lockedUser || this.user;
      if (!targetUser) {
        this.isTerminalLocked = false;
        localStorage.removeItem('gst_terminal_locked');
        localStorage.removeItem('gst_locked_user');
        return;
      }
      try {
        const res = await GST_API.verifyPassword({
          user_id: targetUser.id,
          email: targetUser.email,
          password: password,
        });
        this.user = res.data.user;
        if (res.data.token) {
          this.token = res.data.token;
          localStorage.setItem('gst_auth_token', this.token);
        }
        localStorage.setItem('gst_user', JSON.stringify(this.user));
        this.isTerminalLocked = false;
        this.lockedUser = null;
        localStorage.removeItem('gst_terminal_locked');
        localStorage.removeItem('gst_locked_user');
        this.notify(`Terminal unlocked. Welcome back, ${this.user.name}!`, 'success');
        return res.data;
      } catch (err) {
        const msg = err.response?.data?.message || 'Incorrect password. Only the true account owner can unlock this terminal.';
        this.notify(msg, 'error');
        throw new Error(msg);
      }
    },

    // Staff Account Auto-Lock & Password Unlock
    lockStaffAccount(userId) {
      if (!userId) return;
      const numId = Number(userId);
      if (!this.lockedStaffIds.includes(numId)) {
        this.lockedStaffIds.push(numId);
        localStorage.setItem('gst_locked_staff_ids', JSON.stringify(this.lockedStaffIds));
      }
    },

    isStaffAccountLocked(userId) {
      if (!userId) return false;
      return this.lockedStaffIds.includes(Number(userId));
    },

    async unlockStaffAccount(userId, password) {
      try {
        const res = await GST_API.verifyPassword({
          user_id: userId,
          password: password,
        });
        const numId = Number(userId);
        this.lockedStaffIds = this.lockedStaffIds.filter(id => id !== numId);
        localStorage.setItem('gst_locked_staff_ids', JSON.stringify(this.lockedStaffIds));

        // Shift handoff: If previous operator was another staff, lock that previous staff
        if (this.user && this.user.role === 'staff' && Number(this.user.id) !== numId) {
          this.lockStaffAccount(this.user.id);
        }

        this.user = res.data.user;
        if (res.data.token) {
          this.token = res.data.token;
          localStorage.setItem('gst_auth_token', this.token);
        }
        localStorage.setItem('gst_user', JSON.stringify(this.user));
        this.staffPinModalOpen = false;
        this.notify(`Account unlocked! Operator on duty: ${this.user.name}`, 'success');
        return res.data;
      } catch (err) {
        const msg = err.response?.data?.message || 'Incorrect password. Only the true account owner can unlock this staff account.';
        this.notify(msg, 'error');
        throw new Error(msg);
      }
    },

    // Authentication Actions
    async login(email, password, portal = 'customer') {
      try {
        const res = await GST_API.login(email, password, portal);
        const loggedUser = res.data.user;

        // Strict Enforcement: Operational accounts are forbidden on the customer storefront
        if (portal === 'customer' && ['staff', 'admin', 'super_admin', 'driver'].includes(loggedUser.role)) {
          this.logout();
          throw new Error('Staff, Admin, Super Admin, and Delivery Rider accounts cannot log in to the customer storefront. Please log in through the Operations Portal (/admin).');
        }

        this.user = loggedUser;
        this.token = res.data.token;
        localStorage.setItem('gst_user', JSON.stringify(this.user));
        localStorage.setItem('gst_auth_token', this.token);
        if (['staff', 'admin', 'super_admin', 'driver'].includes(this.user.role)) {
          document.cookie = `gst_role=${this.user.role}; path=/; max-age=${30 * 86400}; SameSite=Lax`;
        } else {
          document.cookie = `gst_role=customer; path=/; max-age=${30 * 86400}; SameSite=Lax`;
        }
        this.authModalOpen = false;

        this.notify(`Welcome back, ${this.user.name}!`);

        // Role-based redirection from Capstone document:
        if (['staff', 'admin', 'super_admin'].includes(this.user.role)) {
          this.currentView = 'admin';
          if (!window.location.pathname.includes('admin') && !window.location.pathname.includes('staff') && !window.location.pathname.includes('superadmin') && !window.location.pathname.includes('super-admin') && !window.location.pathname.includes('dashboard') && !window.location.pathname.includes('driver') && !window.location.pathname.includes('rider')) {
            window.location.replace('/admin');
            return;
          }
        } else if (this.user.role === 'driver') {
          this.currentView = 'driver';
          if (!window.location.pathname.includes('admin') && !window.location.pathname.includes('staff') && !window.location.pathname.includes('superadmin') && !window.location.pathname.includes('super-admin') && !window.location.pathname.includes('dashboard') && !window.location.pathname.includes('driver') && !window.location.pathname.includes('rider')) {
            window.location.replace('/admin');
            return;
          }
        } else {
          if (this.pendingCheckout && this.cart.length > 0) {
            this.currentView = 'checkout';
            this.pendingCheckout = false;
            if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            this.currentView = 'customer';
          }
        }
        this.fetchUserActiveOrder();
        this.fetchMyBookings();
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
        this.notify(msg, 'error');
        throw err;
      }
    },

    async register(data) {
      try {
        const res = await GST_API.register(data);
        return res.data;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Registration failed.';
        this.notify(msg, 'error');
        throw new Error(msg);
      }
    },

    async verifyRegister(data) {
      try {
        const res = await GST_API.verifyRegister(data);
        this.user = res.data.user;
        this.token = res.data.token;
        localStorage.setItem('gst_user', JSON.stringify(this.user));
        localStorage.setItem('gst_auth_token', this.token);
        this.authModalOpen = false;

        this.notify(res.data.message || 'Account verified! Welcome to G Shot Teas.');
        if (this.pendingCheckout && this.cart.length > 0) {
          this.currentView = 'checkout';
          this.pendingCheckout = false;
          if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          this.currentView = 'customer';
        }
        return res.data;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Verification failed.';
        this.notify(msg, 'error');
        throw new Error(msg);
      }
    },

    async resendRegisterOtp(email) {
      try {
        const res = await GST_API.resendRegisterOtp({ email });
        return res.data;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to resend code.';
        this.notify(msg, 'error');
        throw new Error(msg);
      }
    },

    async forgotPassword(email) {
      try {
        const res = await GST_API.forgotPassword(email);
        return res.data;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to send verification code.';
        throw new Error(msg);
      }
    },

    async resetPassword(data) {
      try {
        const res = await GST_API.resetPassword(data);
        if (res.data.token && res.data.user) {
          this.user = res.data.user;
          this.token = res.data.token;
          localStorage.setItem('gst_user', JSON.stringify(this.user));
          localStorage.setItem('gst_auth_token', this.token);
          this.authModalOpen = false;
          this.notify(res.data.message || 'Password reset successfully! Welcome back.');
          if (this.pendingCheckout && this.cart.length > 0) {
            this.currentView = 'checkout';
            this.pendingCheckout = false;
            if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            this.currentView = 'customer';
          }
          this.fetchUserActiveOrder();
        this.fetchMyBookings();
        }
        return res.data;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to reset password.';
        throw new Error(msg);
      }
    },

    async loginWithGoogle(credentialOrData, portal = 'customer') {
      try {
        const payload = typeof credentialOrData === 'string'
          ? { credential: credentialOrData, portal }
          : { ...credentialOrData, portal };
        const res = await GST_API.googleLogin(payload, portal);
        const loggedUser = res.data.user;

        if (portal === 'customer' && ['staff', 'admin', 'super_admin', 'driver'].includes(loggedUser.role)) {
          this.logout();
          throw new Error('Staff, Admin, Super Admin, and Delivery Rider accounts cannot log in to the customer storefront. Please log in through the Operations Portal (/admin).');
        }

        this.user = loggedUser;
        this.token = res.data.token;
        localStorage.setItem('gst_user', JSON.stringify(this.user));
        localStorage.setItem('gst_auth_token', this.token);
        if (['staff', 'admin', 'super_admin', 'driver'].includes(this.user.role)) {
          document.cookie = `gst_role=${this.user.role}; path=/; max-age=${30 * 86400}; SameSite=Lax`;
        } else {
          document.cookie = `gst_role=customer; path=/; max-age=${30 * 86400}; SameSite=Lax`;
        }
        this.authModalOpen = false;

        this.notify(res.data.message || `Welcome, ${this.user.name}!`);

        if (['staff', 'admin', 'super_admin'].includes(this.user.role)) {
          this.currentView = 'admin';
          if (!window.location.pathname.includes('admin') && !window.location.pathname.includes('staff') && !window.location.pathname.includes('superadmin') && !window.location.pathname.includes('super-admin') && !window.location.pathname.includes('dashboard') && !window.location.pathname.includes('driver') && !window.location.pathname.includes('rider')) {
            window.location.replace('/admin');
            return;
          }
        } else if (this.user.role === 'driver') {
          this.currentView = 'driver';
          if (!window.location.pathname.includes('admin') && !window.location.pathname.includes('driver') && !window.location.pathname.includes('rider')) {
            window.location.replace('/admin');
            return;
          }
        } else {
          if (this.pendingCheckout && this.cart.length > 0) {
            this.currentView = 'checkout';
            this.pendingCheckout = false;
            if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            this.currentView = 'customer';
          }
        }
        this.fetchUserActiveOrder();
        this.fetchMyBookings();
        return res.data;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || (err.message && err.message.includes('Network') ? 'Backend server unreachable. Please verify server is running on 127.0.0.1:8000.' : 'Google Sign-In failed.');
        this.notify(msg, 'error');
        throw err;
      }
    },

    logout() {
      GST_API.logout().catch(() => {});
      this.user = null;
      this.token = '';
      this.activeOrder = null;
      this.bookingsList = [];
      localStorage.removeItem('gst_user');
      localStorage.removeItem('gst_auth_token');
      document.cookie = 'gst_role=; path=/; max-age=0; SameSite=Lax';
      localStorage.removeItem('gst_active_order_id');
      sessionStorage.removeItem('gst_admin_unlocked');
      const isAdminRoute = typeof window !== 'undefined' && (window.location.pathname.includes('admin') || window.location.pathname.includes('staff') || window.location.pathname.includes('superadmin') || window.location.pathname.includes('super-admin') || window.location.pathname.includes('dashboard'));
      this.currentView = isAdminRoute ? 'admin' : 'customer';
      this.notify('Logged out successfully.');
    },

    async fetchSettings() {
      try {
        const res = await GST_API.getSettings();
        if (res?.data) {
          this.settings = { ...this.settings, ...res.data };
        }
        return res?.data;
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    },

    // Super Admin: Website Emergency Shutdown / Maintenance Mode Controls
    async toggleMaintenanceMode(options = {}) {
      if (!this.isSuperAdmin) {
        this.notify('Access Denied: Only Super Admin has permission to shut down the website or toggle Maintenance Mode.', 'error');
        return false;
      }
      const next = !this.isMaintenanceMode;
      return await this.setMaintenanceMode(next, options);
    },

    async setMaintenanceMode(enable, options = {}) {
      if (!this.isSuperAdmin) {
        this.notify('Access Denied: Only Super Admin has permission to shut down the website or toggle Maintenance Mode.', 'error');
        return false;
      }
      const valStr = enable ? 'true' : 'false';
      this.settings.maintenance_mode = valStr;
      if (options.title) this.settings.maintenance_title = options.title;
      if (options.message) this.settings.maintenance_message = options.message;
      if (options.until !== undefined) this.settings.maintenance_until = options.until;

      try {
        const payload = {
          maintenance_mode: valStr,
          ...(options.title ? { maintenance_title: options.title } : {}),
          ...(options.message ? { maintenance_message: options.message } : {}),
          ...(options.until !== undefined ? { maintenance_until: options.until } : {}),
        };
        const res = await GST_API.updateSettings(payload);
        if (res.data?.settings) {
          this.settings = { ...this.settings, ...res.data.settings };
        }
        this.notify(
          enable ? 'WEBSITE SHUTDOWN ACTIVATED! Customers now see the Under Maintenance screen.' : 'WEBSITE RESTORED ONLINE! Customer store ordering and access are back live.', enable ? 'info' : 'success'
        );
        return true;
      } catch (err) {
        console.error('Failed to update maintenance mode:', err);
        const errMsg = err.response?.data?.message || 'Failed to update website status on server.';
        this.notify(errMsg, 'error');
        return false;
      }
    },

    // Store Status Toggle (Staff, Admin, Super Admin)
    async toggleStoreStatus() {
      const next = !this.isStoreOpen;
      const valStr = next ? 'true' : 'false';
      this.settings.store_open = valStr;
      try {
        await GST_API.updateSettings({ store_open: valStr });
        this.notify(next ? 'Store is now OPEN for customer orders!' : 'Store is now CLOSED. Ordering paused.', next ? 'success' : 'info');
      } catch (err) {
        console.error('Failed to update store status on backend:', err);
        this.notify(next ? 'Store opened locally.' : 'Store closed locally.', 'info');
      }
    },

    async setStoreStatus(isOpen) {
      const valStr = isOpen ? 'true' : 'false';
      this.settings.store_open = valStr;
      try {
        await GST_API.updateSettings({ store_open: valStr });
        this.notify(isOpen ? 'Store is now OPEN!' : 'Store is now CLOSED.', isOpen ? 'success' : 'info');
      } catch (err) {
        console.error('Failed to update store status:', err);
      }
    },

    async setPaymongoAvailability(isAvailable) {
      const valStr = isAvailable ? 'true' : 'false';
      if (!this.settings) this.settings = {};
      this.settings.paymongo_available = valStr;
      try {
        await GST_API.updateSettings({ paymongo_available: valStr });
        this.notify(
          isAvailable 
            ? 'PayMongo online payments marked as AVAILABLE for customer checkout.' 
            : 'PayMongo online payments flagged as UNAVAILABLE for customer checkout.', 
          isAvailable ? 'success' : 'info'
        );
        return true;
      } catch (err) {
        console.error('Failed to update PayMongo availability on backend:', err);
        const msg = err.response?.data?.message || 'Failed to update PayMongo availability.';
        this.notify(msg, 'error');
        throw err;
      }
    },

    async updateOrderAreaNote(note, enabled = true) {
      return await this.updateStoreSettings({
        order_area_note: note,
        order_area_note_enabled: enabled ? 'true' : 'false',
      });
    },

    async updateStoreSettings(newSettings) {
      try {
        const res = await GST_API.updateSettings(newSettings);
        if (res.data?.settings) {
          this.settings = { ...this.settings, ...res.data.settings };
        } else {
          this.settings = { ...this.settings, ...newSettings };
        }
        this.notify('Settings updated successfully!', 'success');
        return true;
      } catch (err) {
        console.error('Failed to update settings:', err);
        const msg = err.response?.data?.message || 'Failed to update settings.';
        this.notify(msg, 'error');
        throw err;
      }
    },

    openBookingWithPackage(pkg) {
      this.selectedBookingPackage = pkg;
      this.bookingModalTab = 'form';
      this.bookingModalOpen = true;
    },

    openBookingModal(tab = 'form') {
      this.bookingModalTab = tab === 'history' ? 'history' : 'form';
      this.bookingModalOpen = true;
    },

    viewFlyer(imgUrl, pkg = null) {
      this.previewFlyerImage = imgUrl;
      this.previewFlyerPackage = pkg;
    },

    closeFlyer() {
      this.previewFlyerImage = null;
      this.previewFlyerPackage = null;
    },

    async fetchBookingPackages(all = null) {
      try {
        const useAll = all !== null ? Boolean(all) : this.isStaffOrAdmin;
        const res = useAll ? await GST_API.getAllBookingPackages() : await GST_API.getBookingPackages();
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.bookingPackages = res.data;
        }
        return this.bookingPackages;
      } catch (err) {
        console.error('Error fetching booking packages:', err);
        return this.bookingPackages;
      }
    },

    async createBookingPackage(data) {
      try {
        const res = await GST_API.createBookingPackage(data);
        await this.fetchBookingPackages(true);
        this.notify(res.data?.message || 'Booking package created!', 'success');
        return res.data?.package;
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to create booking package.';
        this.notify(msg, 'error');
        throw err;
      }
    },

    async updateBookingPackage(id, data) {
      try {
        const res = await GST_API.updateBookingPackage(id, data);
        await this.fetchBookingPackages(true);
        this.notify(res.data?.message || 'Booking package updated!', 'success');
        return res.data?.package;
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update booking package.';
        this.notify(msg, 'error');
        throw err;
      }
    },

    async toggleBookingPackage(id) {
      try {
        const res = await GST_API.toggleBookingPackage(id);
        await this.fetchBookingPackages(true);
        this.notify(res.data?.message || 'Booking package visibility updated!', 'success');
        return res.data?.package;
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update package visibility.';
        this.notify(msg, 'error');
        throw err;
      }
    },

    async deleteBookingPackage(id) {
      try {
        const res = await GST_API.deleteBookingPackage(id);
        await this.fetchBookingPackages(true);
        this.notify(res.data?.message || 'Booking package deleted!', 'success');
        return true;
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to delete booking package.';
        this.notify(msg, 'error');
        throw err;
      }
    },

    async updateBooking(id, data) {
      try {
        const res = await GST_API.updateBooking(id, data);
        this.notify(res.data?.message || 'Booking updated successfully!', 'success');
        return res.data?.booking;
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update booking.';
        this.notify(msg, 'error');
        throw err;
      }
    },

    openProductPreview(item) {
      if (!item) return;
      if (typeof item === 'string') {
        this.previewProduct = {
          name: 'Menu Item',
          image: item,
          category: 'Menu',
          price: null,
          description: '',
          emoji: '',
          max_portions: 99,
          recipes: [],
        };
        return;
      }
      const matched = this.products.find(p => p.id === item.id) || {};
      const safeEmoji = (item.emoji && !item.emoji.includes('?')) 
        ? item.emoji 
        : ((matched.emoji && !matched.emoji.includes('?')) ? matched.emoji : '');
      this.previewProduct = {
        id: item.id || matched.id,
        name: item.name || matched.name || 'Menu Item',
        category: item.category || matched.category || 'Menu',
        price: item.price !== undefined ? item.price : (matched.price !== undefined ? matched.price : null),
        description: item.description || item.desc || matched.description || '',
        emoji: safeEmoji,
        image: item.image || item.image_url || matched.image || '/assets/hero-banner.png',
        max_portions: matched.max_portions !== undefined ? matched.max_portions : (item.max_portions !== undefined ? item.max_portions : 99),
        recipes: matched.recipes || item.recipes || [],
        is_available: matched.is_available !== undefined ? matched.is_available : (item.is_available !== false),
        badge: item.badge || null,
        rating: item.rating || null,
      };
    },

    closeProductPreview() {
      this.previewProduct = null;
    },

    // Announcements Management
    async fetchAnnouncements(includeAll = false) {
      try {
        const res = (includeAll || this.isStaffOrAdmin)
          ? await GST_API.getAllAnnouncements()
          : await GST_API.getAnnouncements();
        if (res && res.data) {
          this.announcements = res.data;
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
      }
    },

    openCreateAnnouncementModal() {
      this.editingAnnouncement = null;
      this.announcementModalOpen = true;
    },

    openEditAnnouncementModal(announcement) {
      this.editingAnnouncement = JSON.parse(JSON.stringify(announcement));
      this.announcementModalOpen = true;
    },

    closeAnnouncementModal() {
      this.announcementModalOpen = false;
      this.editingAnnouncement = null;
    },

    async saveAnnouncement(payload) {
      this.loading = true;
      try {
        if (payload.id) {
          const res = await GST_API.updateAnnouncement(payload.id, payload);
          const updated = res.data?.announcement || payload;
          const idx = this.announcements.findIndex(a => a.id === payload.id);
          if (idx !== -1) {
            this.announcements[idx] = { ...this.announcements[idx], ...updated };
          }
          this.notify('Announcement updated successfully!');
        } else {
          const res = await GST_API.createAnnouncement(payload);
          const created = res.data?.announcement || { ...payload, id: Date.now(), is_active: true };
          this.announcements.unshift(created);
          this.notify('Announcement published successfully!');
        }
        this.closeAnnouncementModal();
        await this.fetchAnnouncements(true);
      } catch (err) {
        console.error('Failed to save announcement:', err);
        if (payload.id) {
          const idx = this.announcements.findIndex(a => a.id === payload.id);
          if (idx !== -1) this.announcements[idx] = { ...this.announcements[idx], ...payload };
          this.notify('Announcement updated locally.', 'info');
        } else {
          this.announcements.unshift({ ...payload, id: Date.now(), is_active: true });
          this.notify('Announcement published locally.', 'info');
        }
        this.closeAnnouncementModal();
      } finally {
        this.loading = false;
      }
    },

    async toggleAnnouncementStatus(id) {
      const item = this.announcements.find(a => a.id === id);
      if (!item) return;
      const prev = item.is_active;
      item.is_active = !prev;
      try {
        await GST_API.toggleAnnouncement(id);
        this.notify(item.is_active ? 'Announcement is now visible to customers.' : 'Announcement hidden (draft).', 'info');
      } catch (err) {
        console.error('Failed to toggle announcement status on API:', err);
        this.notify(item.is_active ? 'Announcement visible (local).' : 'Announcement hidden (local).', 'info');
      }
    },

    async deleteAnnouncement(id) {
      const idx = this.announcements.findIndex(a => a.id === id);
      if (idx === -1) return;
      this.announcements.splice(idx, 1);
      try {
        await GST_API.deleteAnnouncement(id);
        this.notify('Announcement removed.');
      } catch (err) {
        console.error('Failed to delete announcement via API:', err);
        this.notify('Announcement removed locally.', 'info');
      }
    },

    // Menu Promotional Discount Actions
    async applyDiscount(payload) {
      try {
        const res = await GST_API.applyDiscount(payload);
        if (res.data?.products) {
          this.products = res.data.products;
        } else {
          await this.fetchProducts();
        }
        this.notify(res.data?.message || 'Discount applied successfully!', 'success');
        return res.data;
      } catch (err) {
        console.error('Failed to apply discount:', err);
        const msg = err.response?.data?.message || 'Failed to apply discount.';
        this.notify(msg, 'error');
        throw err;
      }
    },

    async removeDiscount(payload) {
      try {
        const res = await GST_API.removeDiscount(payload);
        if (res.data?.products) {
          this.products = res.data.products;
        } else {
          await this.fetchProducts();
        }
        this.notify(res.data?.message || 'Discounts removed successfully.', 'success');
        return res.data;
      } catch (err) {
        console.error('Failed to remove discount:', err);
        const msg = err.response?.data?.message || 'Failed to remove discount.';
        this.notify(msg, 'error');
        throw err;
      }
    },

    // Loyverse POS Integration Actions
    async getLoyverseStatus() {
      try {
        const res = await GST_API.getLoyverseStatus();
        return res.data;
      } catch (err) {
        console.error('Failed to get Loyverse status:', err);
        return { connected: false, error: err.message };
      }
    },

    async syncLoyverseSales() {
      this.loading = true;
      try {
        const res = await GST_API.syncLoyverse();
        const count = res.data?.results?.synced ?? 0;
        await Promise.all([
          this.fetchOrders(),
          this.fetchIngredients(),
          this.fetchProducts(),
        ]);
        if (count > 0) {
          this.notify(`Synced ${count} new sale(s) from Loyverse POS! Kitchen ingredients deducted.`, 'success');
        } else {
          this.notify('Loyverse POS is up to date. No new un-synced sales.', 'info');
        }
        return res.data;
      } catch (err) {
        console.error('Loyverse sync failed:', err);
        this.notify(err.response?.data?.message || 'Failed to sync with Loyverse POS.', 'error');
        throw err;
      } finally {
        this.loading = false;
      }
    },

        async exportMenuToLoyverse() {
      this.loading = true;
      try {
        const res = await GST_API.exportMenuToLoyverse();
        const total = res.data?.results?.total ?? 0;
        this.notify(`Successfully exported/synced ${total} menu items to Loyverse POS!`, 'success');
        return res.data;
      } catch (err) {
        console.error('Loyverse export failed:', err);
        this.notify(err.response?.data?.message || 'Failed to export menu to Loyverse.', 'error');
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async exportIngredientsToLoyverse() {
      this.loading = true;
      try {
        const res = await GST_API.exportIngredientsToLoyverse();
        const created = res.data?.results?.created ?? 0;
        const updated = res.data?.results?.updated ?? 0;
        await this.fetchIngredients();
        this.notify(`Synced ${created + updated} raw ingredients & stock levels to Loyverse Advanced Inventory!`, 'success');
        return res.data;
      } catch (err) {
        console.error('Loyverse ingredients export failed:', err);
        this.notify(err.response?.data?.message || 'Failed to export ingredients to Loyverse.', 'error');
        throw err;
      } finally {
        this.loading = false;
      }
    },

        async pullLoyverseItems() {
      this.loading = true;
      try {
        const res = await GST_API.pullLoyverseItems();
        const created = res.data?.results?.created_count ?? 0;
        const updated = res.data?.results?.updated_count ?? 0;
        await this.fetchProducts();
        if (created > 0 || updated > 0) {
          this.notify(`Imported ${created} new and updated ${updated} item(s) from Loyverse POS!`, 'success');
        } else {
          this.notify('Website menu is already in sync with Loyverse POS.', 'info');
        }
        return res.data;
      } catch (err) {
        console.error('Loyverse pull items failed:', err);
        this.notify(err.response?.data?.message || 'Failed to pull menu items from Loyverse.', 'error');
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async pullLoyverseInventory() {
      this.loading = true;
      try {
        const res = await GST_API.pullLoyverseInventory();
        const count = res.data?.results?.updated_count ?? 0;
        await Promise.all([
          this.fetchIngredients(),
          this.fetchProducts(),
        ]);
        if (count > 0) {
          this.notify(`Updated ${count} ingredient stock level(s) from Loyverse Inventory!`, 'success');
        } else {
          this.notify('Website inventory is already in sync with Loyverse.', 'info');
        }
        return res.data;
      } catch (err) {
        console.error('Loyverse pull inventory failed:', err);
        this.notify(err.response?.data?.message || 'Failed to pull inventory from Loyverse.', 'error');
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async pushLoyverseInventory() {
      this.loading = true;
      try {
        const res = await GST_API.pushLoyverseInventory();
        const count = res.data?.results?.pushed_count ?? 0;
        this.notify(`Pushed ${count} ingredient stock levels to Loyverse!`, 'success');
        return res.data;
      } catch (err) {
        console.error('Loyverse push inventory failed:', err);
        this.notify(err.response?.data?.message || 'Failed to push inventory to Loyverse.', 'error');
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fullLoyverseSync() {
      this.loading = true;
      try {
        const res = await GST_API.fullLoyverseSync();
        await Promise.all([
          this.fetchIngredients(),
          this.fetchProducts(),
          this.fetchOrders(),
        ]);
        this.notify('Full Advanced Inventory sync complete! Ingredients, Recipes & Stocks are synchronized.', 'success');
        return res.data;
      } catch (err) {
        console.error('Loyverse full sync failed:', err);
        const errorMsg = err.response?.data?.message || (err.code === 'ECONNABORTED' ? 'Sync timed out. Loyverse took too long to respond.' : 'Failed to full sync with Loyverse.');
        this.notify(errorMsg, 'error');
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});

export { useGShotStore, DEFAULT_PRODUCTS, DEFAULT_INGREDIENTS };
export default useGShotStore;
if (typeof window !== 'undefined') window.useGShotStore = useGShotStore;





