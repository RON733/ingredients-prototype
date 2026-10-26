// G Shot Teas — Pinia Central Store
const { defineStore } = Pinia;

const useGShotStore = defineStore('gshot', {
  state: () => ({
    // User & Session
    user: JSON.parse(localStorage.getItem('gst_user') || 'null') || {
      id: 4,
      name: 'Jane Doe',
      email: 'customer@gmail.com',
      role: 'customer',
      phone: '09989109529',
      address: 'Phase 1 Mabuhay City, Cabuyao, Laguna',
    },
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

    // Data from Backend API
    products: [],
    ingredients: [],
    orders: [],
    activeOrder: null,
    settings: {},
    auditLogs: [],
    usersList: [],
    bookingsList: [],
    analytics: null,
    googleConfig: { client_id: '', configured: false },

    // Shopping Cart
    cart: JSON.parse(localStorage.getItem('gst_cart') || '[]'),

    // UI Toasts & Status
    toasts: [],
    loading: false,
    backendConnected: false,

    // Booking & Flyer Preview
    selectedBookingPackage: null,
    previewFlyerImage: null,
  }),

  getters: {
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
        const [prodRes, ingRes, setRes, googRes] = await Promise.allSettled([
          GST_API.getProducts(),
          GST_API.getIngredients(),
          GST_API.getSettings(),
          GST_API.getGoogleConfig(),
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

    // Quick Role Switcher for Demo & Defense Presentation!
    switchRole(role) {
      const demoUsers = {
        customer: {
          id: 4,
          name: 'Jane Doe',
          email: 'customer@gmail.com',
          role: 'customer',
          phone: '09989109529',
          address: 'Phase 1 Mabuhay City, Cabuyao, Laguna',
        },
        staff: {
          id: 3,
          name: 'Mhar Anthony Lirio',
          email: 'staff@gshotteas.com',
          role: 'staff',
          phone: '09497564031',
          address: 'Purok 5 387, Brgy. Marinig, Cabuyao, Laguna',
        },
        admin: {
          id: 2,
          name: 'Jefferson Anore Alulod',
          email: 'admin@gshotteas.com',
          role: 'admin',
          phone: '+63 912 345 6789',
          address: 'Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna',
        },
        super_admin: {
          id: 1,
          name: 'Tyron Erick Rico',
          email: 'superadmin@gshotteas.com',
          role: 'super_admin',
          phone: '09685002301',
          address: 'BLK 6 LOT 22 BSRV1, Brgy. Pooc, Santa Rosa, Laguna',
        },
      };

      this.user = demoUsers[role] || demoUsers.customer;
      localStorage.setItem('gst_user', JSON.stringify(this.user));

      if (['staff', 'admin', 'super_admin'].includes(role)) {
        this.currentView = 'admin';
      } else {
        this.currentView = 'customer';
      }

      this.notify(`Switched session to ${this.user.name} (${role.toUpperCase()})`, 'info');
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
        const msg = err.response?.data?.message || 'Google Sign-In failed.';
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
  },
});

window.useGShotStore = useGShotStore;
