// G Shot Teas — Axios API Client & Network Service
(function () {
  const isLaravelHost = window.location.port === '8000';
  const API_BASE_URL = isLaravelHost ? '/api' : 'http://127.0.0.1:8000/api';

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    timeout: 10000,
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
    updateUser: (id, data) => apiClient.patch(`/v1/users/${id}`, data),

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
    getOrder: (id) => apiClient.get(`/orders/${id}`),
    getActiveOrder: (userId) => apiClient.get('/orders/active', { params: { user_id: userId } }),
    placeOrder: (data) => apiClient.post('/orders', data),
    updateOrderStatus: (id, status) => apiClient.patch(`/v1/orders/${id}/status`, { status }),
    verifyPayment: (id) => apiClient.patch(`/v1/orders/${id}/verify-payment`),

    // Bookings
    getBookings: () => apiClient.get('/v1/bookings'),
    createBooking: (data) => apiClient.post('/bookings', data),
    updateBookingStatus: (id, status) => apiClient.patch(`/v1/bookings/${id}/status`, { status }),

    // Analytics & System
    getAnalytics: (params) => apiClient.get('/v1/analytics/overview', { params }),
    getSettings: () => apiClient.get('/settings'),
    updateSettings: (data) => apiClient.post('/v1/settings', data),
    getAuditLogs: (params) => apiClient.get('/v1/audit-logs', { params }),
    sendChatbot: (message) => apiClient.post('/chatbot', { message }),
  };
})();
