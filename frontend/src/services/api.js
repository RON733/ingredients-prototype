import axios from 'axios';

// Get base URL dynamically or fallback to relative API path
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.GST_BACKEND_URL) {
      return window.GST_BACKEND_URL;
    }
    if (window.location.protocol === 'file:') {
      return 'http://127.0.0.1:8000/api';
    }
    // In production (Render, Railway) and local Vite dev proxy / Laravel serve:
    // always use relative '/api' so all requests stay same-origin (no CORS, no Mixed Content)
    return '/api';
  }
  return '/api';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach Authorization Bearer token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gst_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global responses & authentication expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthCheck = error.config.url.includes('/auth/me');
      const isVerifyPassword = error.config.url.includes('/verify-password');
      if (!isAuthCheck && !isVerifyPassword) {
        localStorage.removeItem('gst_auth_token');
        localStorage.removeItem('gst_user');
      }
    }
    return Promise.reject(error);
  }
);

export const GST_API = {
  // Products & Menu
  getProducts: (params) => apiClient.get('/products', { params }),
  getProduct: (id) => apiClient.get(`/products/${id}`),
  createProduct: (data) => apiClient.post('/products', data),
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
  toggleProductAvailability: (id) => apiClient.patch(`/products/${id}/toggle-availability`),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),

  // Ingredients & Inventory
  getIngredients: () => apiClient.get('/ingredients'),
  createIngredient: (data) => apiClient.post('/ingredients', data),
  updateIngredient: (id, data) => apiClient.put(`/ingredients/${id}`, data),
  adjustStock: (id, amount) => apiClient.post(`/ingredients/${id}/adjust`, { amount }),
  restockIngredient: (id, data) => apiClient.post(`/ingredients/${id}/restock`, data),
  setStockIngredient: (id, data) => apiClient.put(`/ingredients/${id}/set-stock`, data),
  deleteIngredient: (id) => apiClient.delete(`/ingredients/${id}`),

  // Orders
  getOrders: (params) => apiClient.get('/orders', { params }),
  getOrder: (id) => apiClient.get(`/orders/${encodeURIComponent(String(id).replace('#', '').trim())}`),
  getActiveOrder: (userId) => apiClient.get('/orders/active', { params: { user_id: userId } }),
  createOrder: (data) => apiClient.post('/orders', data),
  placeOrder: (data) => apiClient.post('/orders', data),
  updateOrderStatus: (id, status, notes = '') => apiClient.patch(`/orders/${id}/status`, { status, notes }),
  verifyPayment: (id) => apiClient.patch(`/orders/${id}/verify-payment`),
  updateDriverLocation: (id, coords) => apiClient.patch(`/orders/${id}/driver-location`, coords),
  updateCustomerLocation: (id, data) => apiClient.patch(`/orders/${id}/customer-location`, data),
  assignDriver: (id, driverId) => apiClient.patch(`/orders/${id}/assign-driver`, { driver_id: driverId }),
  getDrivers: () => apiClient.get('/drivers'),
  toggleDriverAvailability: (isAvailable, driverId) => apiClient.patch('/driver/toggle-availability', { is_available: isAvailable, driver_id: driverId }),
  submitRiderNotice: (data) => apiClient.post('/driver/notice', data),
  getRiderNotices: (params) => apiClient.get('/driver/notices', { params }),
  acknowledgeRiderNotice: (id) => apiClient.patch('/driver/notices/' + id + '/acknowledge'),
  getDriverOrders: (params) => apiClient.get('/driver/orders', { params }),

  // Authentication & Verification
  login: (email, password, portal = 'customer') => apiClient.post('/auth/login', { email, password, portal }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  register: (data) => apiClient.post('/auth/register', data),
  verifyRegister: (data) => apiClient.post('/auth/register-verify', data),
  resendRegisterOtp: (data) => apiClient.post('/auth/register-resend', data),
  googleLogin: (data, portal = 'customer') => {
    const payload = typeof data === 'string' ? { credential: data, portal } : { ...data, portal };
    return apiClient.post('/auth/google', payload);
  },
  getGoogleConfig: () => apiClient.get('/auth/google/config'),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  quickPinLogin: (pin, userId) => apiClient.post('/auth/pin-switch', { pin, user_id: userId }),
  verifyPassword: (data) => apiClient.post('/auth/verify-password', data),

  // Settings & Audit Logs
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data) => apiClient.post('/settings', data),
  getAuditLogs: (params) => apiClient.get('/audit-logs', { params }),
  getStaffList: () => apiClient.get('/auth/staff-list'),

  // Analytics & Dashboard Stats
  getAnalytics: (params) => apiClient.get('/analytics/overview', { params }),
  getUsers: (params) => apiClient.get('/users', { params }),
  createUser: (data) => apiClient.post('/users', data),
  updateUser: (id, data) => apiClient.patch(`/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),

  // Announcements & Event Bookings
  getAnnouncements: (params) => apiClient.get('/announcements', { params }),
  getAllAnnouncements: () => apiClient.get('/announcements', { params: { all: 1 } }),
  createAnnouncement: (data) => apiClient.post('/announcements', data),
  updateAnnouncement: (id, data) => apiClient.put(`/announcements/${id}`, data),
  toggleAnnouncement: (id) => apiClient.patch(`/announcements/${id}/toggle`),
  deleteAnnouncement: (id) => apiClient.delete(`/announcements/${id}`),

  getBookings: (params) => apiClient.get('/bookings', { params }),
  createBooking: (data) => apiClient.post('/bookings', data),
  updateBookingStatus: (id, status) => apiClient.patch(`/bookings/${id}/status`, { status }),

  // Chatbot Support
  chatWithBot: (message, history = []) => apiClient.post('/chatbot', { message, history }),
  sendChatbot: (message) => apiClient.post('/chatbot', { message }),

  // Loyverse POS Integration
  getLoyverseStatus: () => apiClient.get('/loyverse/status'),
  syncLoyverse: (params) => apiClient.post('/loyverse/sync', params || {}),
  exportMenuToLoyverse: () => apiClient.post('/loyverse/export-menu'),
  registerLoyverseWebhook: (url) => apiClient.post('/loyverse/register-webhook', { url }),
};

export default GST_API;
