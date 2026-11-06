// G Shot Teas ÃƒÂ¯Ã‚Â¿Ã‚Â½ Pinia Central Store
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
    emoji: 'ÃƒÂ°Ã…Â¸Ã‚ÂÃ¢â‚¬Â',
    image: './assets/hero-banner.png',
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
    emoji: 'ÃƒÂ°Ã…Â¸Ã‚ÂÃ¢â‚¬Â',
    image: './assets/hero-banner.png',
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
    emoji: 'ÃƒÂ°Ã…Â¸Ã‚ÂÃ¢â‚¬Â¢',
    image: './assets/menu-pizza.png',
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
    emoji: 'ÃƒÂ°Ã…Â¸Ã‚Â§Ã¢â€šÂ¬',
    image: './assets/menu-pizza.png',
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
    emoji: 'ÃƒÂ°Ã…Â¸Ã‚ÂÃ¢â‚¬â€',
    image: './assets/hero-banner.png',
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
    emoji: 'ÃƒÂ°Ã…Â¸Ã‚ÂÃ…Â¸',
    image: './assets/hero-banner.png',
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
    emoji: 'ÃƒÂ°Ã…Â¸Ã‚Â§Ã¢â‚¬Â¹',
    image: './assets/menu-coffee.png',
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
    emoji: 'ÃƒÂ°Ã…Â¸Ã‚Â§Ã¢â‚¬Â¹',
    image: './assets/menu-coffee.png',
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
    emoji: 'ÃƒÂ°Ã…Â¸Ã‚ÂÃ‚Âµ',
    image: './assets/menu-coffee.png',
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
    emoji: 'ÃƒÂ°Ã…Â¸Ã‚Â§Ã¢â‚¬Â¹',
    image: './assets/menu-coffee.png',
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
    emoji: 'ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â¢',
    image: './assets/menu-coffee.png',
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
    emoji: 'ÃƒÂ°Ã…Â¸Ã‚ÂÃ‚Â§',
    image: './assets/hero-banner.png',
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
    image_url: './assets/menu-coffee.png',
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

const useGShotStore = defineStore('gshot', {
  state: () => ({
    // User & Session
    user: JSON.parse(localStorage.getItem('gst_user') || 'null'),
    token: localStorage.getItem('gst_auth_token') || '',

    // Navigation & Modals
    currentView: (typeof window !== 'undefined' && (window.location.pathname.includes('admin') || window.location.pathname.includes('staff') || window.location.pathname.includes('superadmin') || window.location.pathname.includes('super-admin') || window.location.pathname.includes('dashboard'))) ? 'admin' : 'customer', // 'customer' | 'admin' | 'checkout' | 'track' | 'history'
    activeSection: 'home',   // 'home' | 'menu' | 'about' | 'contact'
    adminTab: 'orders',      // 'orders' | 'analytics' | 'products' | 'inventory' | 'recipes' | 'bookings' | 'users' | 'audit'
    cartOpen: false,
    authModalOpen: false,
    authMode: 'login', // 'login' | 'register'
    customizeModalOpen: false,
    selectedProductForCustomize: null,
    bookingModalOpen: false,
    profileDropdownOpen: false,

    // Data from Backend API (Pre-populated with rich defaults so menu never disappears)
    products: JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)),
    ingredients: JSON.parse(JSON.stringify(DEFAULT_INGREDIENTS)),
    orders: [],
    activeOrder: null,
    settings: {},
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
    selectedBookingPackage: null,
    previewFlyerImage: null,

    // Food & Drink Menu Item Photo Lightbox Preview
    previewProduct: null,

    // Shared POS Terminal Quick Staff PIN Switcher
    staffPinModalOpen: false,

    // Delivery Fleet & Rider Notices
    riderNotices: [],
    unreadRiderNoticesCount: 0,
    showRiderNoticesModal: false,
    previewProofImage: null,

    // Terminal & Staff Security Lock State
    isTerminalLocked: localStorage.getItem("gst_terminal_locked") === "true",
    lockedUser: JSON.parse(localStorage.getItem("gst_locked_user") || "null"),
    lockedStaffIds: JSON.parse(localStorage.getItem("gst_locked_staff_ids") || "[]"),
  }),

  getters: {
    activeAnnouncements: (state) => state.announcements.filter(a => a.is_active),
    cartCount: (state) => state.cart.reduce((sum, item) => sum + item.quantity, 0),
    cartSubtotal: (state) => state.cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),
    cartDeliveryFee: (state) => (state.cart.length > 0 ? 40 : 0),
    cartTotal: (state) => state.cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0) + (state.cart.length > 0 ? 40 : 0),

    isDriver: (state) => state.user?.role === 'driver',
    isStaffOnly: (state) => state.user?.role === 'staff',
    isStaffOrAdmin: (state) => ['staff', 'admin', 'super_admin'].includes(state.user?.role),
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

    isStoreOpen: (state) => {
      if (state.settings && state.settings.store_open !== undefined) {
        return state.settings.store_open === 'true' || state.settings.store_open === true;
      }
      return true;
    },

    ingredientMap: (state) => {
      const map = {};
      state.ingredients.forEach(ing => { map[ing.id] = ing; });
      return map;
    },

    lowStockAlerts: (state) => {
      return state.ingredients.filter(ing => ing.stock <= ing.low_threshold);
    },

    gcashQrCode: (state) => state.settings?.gcash_qr_code || './assets/gcash-qr-default.png',
    gcashAccountNumber: (state) => state.settings?.gcash_account_number || '0912 345 6789',
    gcashAccountName: (state) => state.settings?.gcash_account_name || 'Jefferson A.',
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

    // Initialize Store
    async init() {
      await this.refreshAllData();
      // Non-blocking single-flight periodic refresh for active order
      let isPollInFlight = false;
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
        const [prodRes, ingRes, setRes, googRes, annRes] = await Promise.allSettled([
          GST_API.getProducts(),
          GST_API.getIngredients(),
          GST_API.getSettings(),
          GST_API.getGoogleConfig(),
          this.isStaffOrAdmin ? GST_API.getAllAnnouncements() : GST_API.getAnnouncements(),
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value.data) {
          if (Array.isArray(prodRes.value.data) && prodRes.value.data.length > 0) {
            this.products = prodRes.value.data;
          }
          this.backendConnected = true;
        }
        if (ingRes.status === 'fulfilled' && ingRes.value.data) {
          this.ingredients = ingRes.value.data;
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

        // Fetch user's active order if logged in
        if (this.user) {
          this.fetchUserActiveOrder();
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
        this.ingredients = res.data;
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

    async acknowledgeRiderNotice(id) {
      try {
        const res = await GST_API.acknowledgeRiderNotice(id);
        const notice = this.riderNotices.find(n => n.id === id);
        if (notice) {
          notice.is_acknowledged = true;
          notice.acknowledged_at = new Date().toISOString();
        }
        this.unreadRiderNoticesCount = Math.max(0, this.unreadRiderNoticesCount - 1);
        this.notify('Notice marked as reviewed.', 'success');
        return res.data;
      } catch (err) {
        this.notify('Failed to acknowledge notice.', 'error');
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

    async fetchAnalytics(params = {}) {
      try {
        const res = await GST_API.getAnalytics(params);
        this.analytics = res.data;
      } catch (err) {
        console.error('Error fetching analytics:', err);
      }
    },

    // Cart Management
    addToCart(product, customization = null) {
      let unitPrice = product.price;
      if (customization) {
        if (customization.size === 'Large') unitPrice += 20;
        if (customization.toppings && customization.toppings.length) {
          unitPrice += customization.toppings.length * 15;
        }
      }

      const cartItemId = customization
        ? `${product.id}-${customization.size}-${customization.sugar}-${customization.ice}-${(customization.toppings || []).join(',')}`
        : product.id;

      const existingIndex = this.cart.findIndex(i => i.cartItemId === cartItemId);

      if (existingIndex > -1) {
        this.cart[existingIndex].quantity += 1;
      } else {
        this.cart.push({
          cartItemId,
          product_id: product.id,
          name: product.name,
          category: product.category,
          emoji: (product.emoji && !product.emoji.includes('?')) ? product.emoji : '',
          image: product.image,
          unit_price: unitPrice,
          quantity: 1,
          customization: customization || { size: 'Regular' },
        });
      }

      this.saveCart();
      this.notify(`Added ${product.name} to cart!`);
    },

    updateCartQty(cartItemId, delta) {
      const idx = this.cart.findIndex(i => i.cartItemId === cartItemId);
      if (idx === -1) return;

      this.cart[idx].quantity += delta;
      if (this.cart[idx].quantity <= 0) {
        this.cart.splice(idx, 1);
      }
      this.saveCart();
    },

    removeFromCart(cartItemId) {
      this.cart = this.cart.filter(i => i.cartItemId !== cartItemId);
      this.saveCart();
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
          this.currentView = 'customer';
        }
        this.fetchUserActiveOrder();
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
        this.currentView = 'customer';
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
          this.currentView = 'customer';
          this.fetchUserActiveOrder();
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
          this.currentView = 'customer';
        }
        this.fetchUserActiveOrder();
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
      localStorage.removeItem('gst_user');
      localStorage.removeItem('gst_auth_token');
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
          enable 
            ? 'ÃƒÂ°Ã…Â¸Ã…Â¡Ã‚Â¨ WEBSITE SHUTDOWN ACTIVATED! Customers now see the Under Maintenance screen.' 
            : 'ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ WEBSITE RESTORED ONLINE! Customer store ordering and access are back live.',
          enable ? 'info' : 'success'
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
        this.notify(next ? 'ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Store is now OPEN for customer orders!' : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â´ Store is now CLOSED. Ordering paused.', next ? 'success' : 'info');
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
        this.notify(isOpen ? 'ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Store is now OPEN!' : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â´ Store is now CLOSED.', isOpen ? 'success' : 'info');
      } catch (err) {
        console.error('Failed to update store status:', err);
      }
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
      this.bookingModalOpen = true;
    },

    viewFlyer(imgUrl) {
      this.previewFlyerImage = imgUrl;
    },

    closeFlyer() {
      this.previewFlyerImage = null;
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
        image: item.image || item.image_url || matched.image || './assets/hero-banner.png',
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
          this.notify(`ÃƒÂ¢Ã…Â¡Ã‚Â¡ Synced ${count} new sale(s) from Loyverse POS! Kitchen ingredients deducted.`, 'success');
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
        this.notify(`ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¤ Successfully exported/synced ${total} menu items to Loyverse POS!`, 'success');
        return res.data;
      } catch (err) {
        console.error('Loyverse export failed:', err);
        this.notify(err.response?.data?.message || 'Failed to export menu to Loyverse.', 'error');
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





