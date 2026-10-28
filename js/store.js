// G Shot Teas — Pinia Central Store
const { defineStore } = Pinia;

const DEFAULT_PRODUCTS = [
  {
    id: 'classic-cheeseburger',
    name: 'Cheese Burger',
    category: 'Burgers',
    price: 89,
    description: 'Juicy grilled beef patty, golden brioche bun, fresh lettuce, and melted rich cheddar cheese.',
    emoji: '🍔',
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
    emoji: '🍔',
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
    emoji: '🍕',
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
    emoji: '🍕',
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
    emoji: '🍗',
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
    emoji: '🍟',
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
    emoji: '🧋',
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
    emoji: '🧋',
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
    emoji: '🍵',
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
    emoji: '🧋',
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
    emoji: '☕',
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
    emoji: '🍧',
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
    title: 'Weekend Fiesta: Free Loaded Fries on Orders ₱350+',
    badge: 'Limited Promo',
    badge_color: 'orange',
    description: 'Celebrate this weekend with G Shot Teas! Spend a minimum of ₱350 on any milk tea and burgers to automatically receive a complimentary box of warm Crispy Loaded Cheese Fries.',
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
    currentView: 'customer', // 'customer' | 'admin' | 'checkout' | 'track' | 'history'
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

    // Shopping Cart
    cart: JSON.parse(localStorage.getItem('gst_cart') || '[]'),

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

    // Shared POS Terminal Quick Staff PIN Switcher
    staffPinModalOpen: false,
  }),

  getters: {
    activeAnnouncements: (state) => state.announcements.filter(a => a.is_active),
    cartCount: (state) => state.cart.reduce((sum, item) => sum + item.quantity, 0),
    cartSubtotal: (state) => state.cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),
    cartDeliveryFee: (state) => (state.cart.length > 0 ? 40 : 0),
    cartTotal: (state) => state.cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0) + (state.cart.length > 0 ? 40 : 0),

    isStaffOrAdmin: (state) => ['staff', 'admin', 'super_admin'].includes(state.user?.role),
    isAdminOrSuper: (state) => ['admin', 'super_admin'].includes(state.user?.role),
    isSuperAdmin: (state) => state.user?.role === 'super_admin',

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
  },

  actions: {
    // Notifications
    notify(msg, type = 'success') {
      const id = Date.now() + Math.random();
      this.toasts.push({ id, msg, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, 3500);
    },

    // Initialize Store
    async init() {
      await this.refreshAllData();
      // Periodically refresh active order & inventory
      setInterval(() => {
        if (this.currentView === 'track' && this.activeOrder) {
          this.refreshActiveOrder(this.activeOrder.id || this.activeOrder.order_number);
        }
      }, 5000);
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
          this.products = prodRes.value.data;
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
        this.products = res.data;
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
        if (res.data) {
          this.activeOrder = res.data;
        }
      } catch (err) {
        // quiet
      }
    },

    async refreshActiveOrder(id) {
      try {
        const res = await GST_API.getOrder(id);
        if (res.data) {
          this.activeOrder = res.data;
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
          emoji: product.emoji,
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
      this.staffPinModalOpen = true;
    },
    closeStaffPinModal() {
      this.staffPinModalOpen = false;
    },

    // Fast 4-Digit PIN Switcher for Shared POS Terminal
    async switchStaffPin(pin, userId) {
      try {
        const res = await GST_API.quickPinLogin(pin, userId);
        this.user = res.data.user;
        this.token = res.data.token;
        localStorage.setItem('gst_user', JSON.stringify(this.user));
        if (this.token) {
          localStorage.setItem('gst_auth_token', this.token);
        }
        this.staffPinModalOpen = false;
        this.notify(`Operator on duty: ${this.user.name} (${this.user.role.toUpperCase()})`, 'success');
        if (['staff', 'admin', 'super_admin'].includes(this.user.role)) {
          this.currentView = 'admin';
        }
        return this.user;
      } catch (err) {
        const msg = err.response?.data?.message || 'Invalid 4-digit PIN code. Please try again.';
        this.notify(msg, 'error');
        throw err;
      }
    },

    // Authentication Actions
    async login(email, password) {
      try {
        const res = await GST_API.login(email, password);
        this.user = res.data.user;
        this.token = res.data.token;
        localStorage.setItem('gst_user', JSON.stringify(this.user));
        localStorage.setItem('gst_auth_token', this.token);
        this.authModalOpen = false;

        this.notify(`Welcome back, ${this.user.name}!`);

        // Role-based redirection from Capstone document (page 26, 49):
        // "Customers are directed to the ordering module, while administrators are redirected to the administrative dashboard"
        if (['staff', 'admin', 'super_admin'].includes(this.user.role)) {
          this.currentView = 'admin';
        } else {
          this.currentView = 'customer';
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
        this.notify(msg, 'error');
        throw err;
      }
    },

    async register(data) {
      try {
        const res = await GST_API.register(data);
        this.user = res.data.user;
        this.token = res.data.token;
        localStorage.setItem('gst_user', JSON.stringify(this.user));
        localStorage.setItem('gst_auth_token', this.token);
        this.authModalOpen = false;

        this.notify(`Account created successfully! Welcome to G Shot Teas.`);
        this.currentView = 'customer';
      } catch (err) {
        const msg = err.response?.data?.message || 'Registration failed.';
        this.notify(msg, 'error');
        throw err;
      }
    },

    async loginWithGoogle(credentialOrData) {
      try {
        const payload = typeof credentialOrData === 'string'
          ? { credential: credentialOrData }
          : credentialOrData;
        const res = await GST_API.googleLogin(payload);
        this.user = res.data.user;
        this.token = res.data.token;
        localStorage.setItem('gst_user', JSON.stringify(this.user));
        localStorage.setItem('gst_auth_token', this.token);
        this.authModalOpen = false;

        this.notify(res.data.message || `Welcome, ${this.user.name}!`);

        if (['staff', 'admin', 'super_admin'].includes(this.user.role)) {
          this.currentView = 'admin';
        } else {
          this.currentView = 'customer';
        }
        return res.data;
      } catch (err) {
        const msg = err.response?.data?.message || (err.message && err.message.includes('Network') ? 'Backend server unreachable. Please verify server is running on 127.0.0.1:8000.' : 'Google Sign-In failed.');
        this.notify(msg, 'error');
        throw err;
      }
    },

    logout() {
      GST_API.logout().catch(() => {});
      this.user = null;
      this.token = '';
      localStorage.removeItem('gst_user');
      localStorage.removeItem('gst_auth_token');
      this.currentView = 'customer';
      this.notify('Logged out successfully.');
    },

    // Store Status Toggle (Staff, Admin, Super Admin)
    async toggleStoreStatus() {
      const next = !this.isStoreOpen;
      const valStr = next ? 'true' : 'false';
      this.settings.store_open = valStr;
      try {
        await GST_API.updateSettings({ store_open: valStr });
        this.notify(next ? '🟢 Store is now OPEN for customer orders!' : '🔴 Store is now CLOSED. Ordering paused.', next ? 'success' : 'info');
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
        this.notify(isOpen ? '🟢 Store is now OPEN!' : '🔴 Store is now CLOSED.', isOpen ? 'success' : 'info');
      } catch (err) {
        console.error('Failed to update store status:', err);
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
  },
});

window.useGShotStore = useGShotStore;





