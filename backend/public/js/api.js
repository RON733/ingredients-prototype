// G Shot Teas — Axios API Client & Network Service
(function () {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_BASE_URL = window.GST_BACKEND_URL || (isLocal ? (window.location.port === '8000' ? '/api' : 'http://127.0.0.1:8000/api') : '/api');

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    timeout: 60000,
  });

  // Attach auth token if available
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('gst_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => Promise.reject(error));

  window.API_BASE_URL = API_BASE_URL;
  window.apiClient = apiClient;

  window.GST_API = {
    // Auth
    login: (email, password) => apiClient.post('/auth/login', { email, password }),
    register: (data) => apiClient.post('/auth/register', data),
    googleLogin: (data) => apiClient.post('/auth/google', data),
    getGoogleConfig: () => apiClient.get('/auth/google/config'),
    getMe: () => apiClient.get('/auth/me'),
    logout: () => apiClient.post('/auth/logout'),
    updateProfile: (data) => apiClient.put('/auth/profile', data),
    getUsers: () => apiClient.get('/v1/users'),
    createUser: (data) => apiClient.post('/v1/users', data),
    updateUser: (id, data) => apiClient.patch(`/v1/users/${id}`, data),
    getStaffList: () => apiClient.get('/v1/auth/staff-list'),
    quickPinLogin: (pin, userId) => apiClient.post('/v1/auth/pin-switch', { pin, user_id: userId }),

    // Products & Menu
    getProducts: (params) => apiClient.get('/products', { params }),
    getProduct: (id) => apiClient.get(`/products/${id}`),
    createProduct: (data) => apiClient.post('/v1/products', data),
    updateProduct: (id, data) => apiClient.put(`/v1/products/${id}`, data),
    toggleProductAvailability: (id) => apiClient.patch(`/v1/products/${id}/toggle-availability`),
    deleteProduct: (id) => apiClient.delete(`/v1/products/${id}`),

    // Ingredients & Kitchen Inventory (Prototype Addition)
    getIngredients: () => apiClient.get('/ingredients'),
    createIngredient: (data) => apiClient.post('/v1/ingredients', data),
    updateIngredient: (id, data) => apiClient.put(`/v1/ingredients/${id}`, data),
    adjustStock: (id, amount) => apiClient.post(`/v1/ingredients/${id}/adjust`, { amount }),
    deleteIngredient: (id) => apiClient.delete(`/v1/ingredients/${id}`),

    // Orders
    getOrders: (params) => apiClient.get('/v1/orders', { params }),
    getOrder: (id) => apiClient.get(`/orders/${encodeURIComponent(String(id).replace('#', '').trim())}`),
    getActiveOrder: (userId) => apiClient.get('/orders/active', { params: { user_id: userId } }),
    placeOrder: (data) => apiClient.post('/orders', data),
    updateOrderStatus: (id, status) => apiClient.patch(`/v1/orders/${id}/status`, { status }),
    verifyPayment: (id) => apiClient.patch(`/v1/orders/${id}/verify-payment`),
    updateDriverLocation: (id, coords) => apiClient.patch(`/v1/orders/${id}/driver-location`, coords),
    updateCustomerLocation: (id, data) => apiClient.patch(`/v1/orders/${id}/customer-location`, data),
    assignDriver: (id, driverId) => apiClient.patch(`/v1/orders/${id}/assign-driver`, { driver_id: driverId }),
    getDrivers: () => apiClient.get('/v1/drivers'),
    toggleDriverAvailability: (isAvailable, driverId) => apiClient.patch('/v1/driver/toggle-availability', { is_available: isAvailable, driver_id: driverId }),
    getDriverOrders: (params) => apiClient.get('/v1/driver/orders', { params }),

    // Bookings
    getBookings: () => apiClient.get('/v1/bookings'),
    createBooking: (data) => apiClient.post('/bookings', data),
    updateBookingStatus: (id, status) => apiClient.patch(`/v1/bookings/${id}/status`, { status }),

    // Announcements (Promos, New Menus, Store Advisories)
    getAnnouncements: (params) => apiClient.get('/announcements', { params }),
    getAllAnnouncements: () => apiClient.get('/v1/announcements', { params: { all: 1 } }),
    createAnnouncement: (data) => apiClient.post('/v1/announcements', data),
    updateAnnouncement: (id, data) => apiClient.put(`/v1/announcements/${id}`, data),
    toggleAnnouncement: (id) => apiClient.patch(`/v1/announcements/${id}/toggle`),
    deleteAnnouncement: (id) => apiClient.delete(`/v1/announcements/${id}`),

    // Analytics & System
    getAnalytics: (params) => apiClient.get('/v1/analytics/overview', { params }),
    getSettings: () => apiClient.get('/settings'),
    updateSettings: (data) => apiClient.post('/v1/settings', data),
    getAuditLogs: (params) => apiClient.get('/v1/audit-logs', { params }),
    sendChatbot: (message) => apiClient.post('/chatbot', { message }),
  };
})();
