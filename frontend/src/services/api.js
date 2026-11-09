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
  timeout: 15000,
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach Authorization Bearer token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('gst_auth_token') || localStorage.getItem('gshot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
  updateProduct: (id, data) => apiClient.patch(`/products/${id}`, data),
  toggleProductAvailability: (id, is_available) => apiClient.patch(`/products/${id}/toggle-availability`, is_available !== undefined ? { is_available } : {}),
  applyDiscount: (data) => apiClient.post('/products/discount', data),
  removeDiscount: (data) => apiClient.post('/products/discount/remove', data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),

  // Ingredients & Inventory
  getIngredients: () => apiClient.get('/ingredients'),
  createIngredient: (data) => apiClient.post('/ingredients', data),
  updateIngredient: (id, data) => apiClient.patch(`/ingredients/${id}`, data),
  adjustStock: (id, amount) => apiClient.post(`/ingredients/${id}/adjust`, { amount }),
  adjustIngredientStock: (id, amount) => apiClient.post(`/ingredients/${id}/adjust`, { amount }),
  restockIngredient: (id, data) => apiClient.post(`/ingredients/${id}/restock`, data),
  setStockIngredient: (id, data) => apiClient.put(`/ingredients/${id}/set-stock`, data),
  deleteIngredient: (id) => apiClient.delete(`/ingredients/${id}`),

  // Orders
  getOrders: (params) => apiClient.get('/orders', { params }),
  getOrder: (id) => apiClient.get(`/orders/${encodeURIComponent(String(id).replace('#', '').trim())}`),
  getActiveOrder: (userId) => apiClient.get('/orders/active', typeof userId === 'object' ? { params: userId } : { params: { user_id: userId } }),
  createOrder: (data) => apiClient.post('/orders', data),
  placeOrder: (data) => apiClient.post('/orders', data),
  updateOrderStatus: (id, status, notes = '') => apiClient.patch(`/orders/${id}/status`, { status, notes }),
  verifyPayment: (id) => apiClient.patch(`/orders/${id}/verify-payment`),
  updateDriverLocation: (id, coords) => apiClient.patch(`/orders/${id}/driver-location`, coords),
  updateCustomerLocation: (id, data) => apiClient.patch(`/orders/${id}/customer-location`, data),
  assignDriver: (id, driverId) => apiClient.patch(`/orders/${id}/assign-driver`, { driver_id: driverId }),
  getDrivers: () => apiClient.get('/drivers'),
  toggleDriverAvailability: (isAvailable, driverId) => {
    const payload = typeof isAvailable === 'object'
      ? isAvailable
      : (isAvailable !== undefined ? { is_available: isAvailable, driver_id: driverId } : {});
    return apiClient.patch('/driver/toggle-availability', payload);
  },
  submitRiderNotice: (data) => apiClient.post('/driver/notice', data),
  getRiderNotices: (params) => apiClient.get('/driver/notices', { params }),
  acknowledgeRiderNotice: (id) => apiClient.post('/driver/notices/' + id + '/accept'),
  acceptRiderNotice: (id) => apiClient.post('/driver/notices/' + id + '/accept'),
  cancelRiderNotice: (id) => apiClient.delete('/driver/notices/' + id),
  getActiveRiderNotice: (params) => apiClient.get('/driver/active-notice', { params }),
  getDriverOrders: (params) => apiClient.get('/driver/orders', { params }),

  // Authentication & Verification
  login: (emailOrData, password, portal = 'customer') => {
    const payload = typeof emailOrData === 'object'
      ? emailOrData
      : { email: emailOrData, password, portal };
    return apiClient.post('/auth/login', payload);
  },
  forgotPassword: (emailOrData) => {
    const payload = typeof emailOrData === 'object' ? emailOrData : { email: emailOrData };
    return apiClient.post('/auth/forgot-password', payload);
  },
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  register: (data) => apiClient.post('/auth/register', data),
  registerVerify: (data) => apiClient.post('/auth/register-verify', data),
  verifyRegister: (data) => apiClient.post('/auth/register-verify', data),
  registerResend: (data) => apiClient.post('/auth/register-resend', data),
  resendRegisterOtp: (data) => apiClient.post('/auth/register-resend', data),
  googleLogin: (data, portal = 'customer') => {
    let payload = {};
    if (typeof data === 'string') {
      payload = { credential: data, token: data, portal };
    } else {
      payload = { ...data };
      if (!payload.credential && payload.token) payload.credential = payload.token;
      if (portal && !payload.portal) payload.portal = portal;
    }
    return apiClient.post('/auth/google', payload);
  },
  getGoogleConfig: () => apiClient.get('/auth/google/config'),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  quickPinLogin: (pin, userId) => apiClient.post('/auth/pin-switch', { pin, user_id: userId }),
  pinLogin: (pin, userId) => apiClient.post('/auth/pin-switch', { pin, user_id: userId }),
  verifyPassword: (data) => {
    const payload = typeof data === 'object' ? data : { password: data };
    return apiClient.post('/auth/verify-password', payload);
  },

  // Settings & Audit Logs
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data) => apiClient.post('/settings', data),
  getAuditLogs: (params) => apiClient.get('/audit-logs', { params }),
  getStaffList: () => apiClient.get('/auth/staff-list'),

  // Analytics & Dashboard Stats
  getAnalytics: (params) => apiClient.get('/analytics/overview', { params }),
  getUsers: (params) => apiClient.get('/users', { params }),
  createUser: (data) => apiClient.post('/users', data),
  updateUser: (id, data) => apiClient.patch(`/users/${id}`, typeof data === 'object' ? data : { role: data }),
  updateUserRole: (id, data) => apiClient.patch(`/users/${id}`, typeof data === 'object' ? data : { role: data }),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),

  // Announcements & Event Bookings
  getAnnouncements: (params) => apiClient.get('/announcements', { params }),
  getAllAnnouncements: () => apiClient.get('/announcements', { params: { all: 1 } }),
  createAnnouncement: (data) => apiClient.post('/announcements', data),
  updateAnnouncement: (id, data) => apiClient.patch(`/announcements/${id}`, data),
  toggleAnnouncement: (id) => apiClient.patch(`/announcements/${id}/toggle`),
  deleteAnnouncement: (id) => apiClient.delete(`/announcements/${id}`),

  getBookings: (params) => apiClient.get('/bookings', { params }),
  createBooking: (data) => apiClient.post('/bookings', data),
  updateBookingStatus: (id, status) => apiClient.patch(`/bookings/${id}/status`, { status }),

  // Chatbot Support
  chatWithBot: (message, history = []) => apiClient.post('/chatbot', { message, history }),
  sendChatbot: (message) => apiClient.post('/chatbot', { message }),

  // Loyverse Advanced Inventory Integration
  getLoyverseStatus: (params) => apiClient.get('/loyverse/status', { params }),
  syncLoyverse: (params) => apiClient.post('/loyverse/sync', params || {}, { timeout: 60000 }),
  exportMenuToLoyverse: () => apiClient.post('/loyverse/export-menu', {}, { timeout: 120000 }),
  exportIngredientsToLoyverse: () => apiClient.post('/loyverse/export-ingredients', {}, { timeout: 120000 }),
  pullLoyverseInventory: () => apiClient.post('/loyverse/pull-inventory', {}, { timeout: 60000 }),
  pullLoyverseItems: (params) => apiClient.post('/loyverse/pull-items', params || {}, { timeout: 60000 }),
  pushLoyverseInventory: (data) => apiClient.post('/loyverse/push-inventory', data || {}, { timeout: 60000 }),
  fullLoyverseSync: (data) => apiClient.post('/loyverse/full-sync', data || {}, { timeout: 180000 }),
  getLoyverseSuppliers: () => apiClient.get('/loyverse/suppliers'),
  saveLoyverseSupplier: (data) => apiClient.post('/loyverse/suppliers', data),
  registerLoyverseWebhook: (url) => apiClient.post('/loyverse/register-webhook', { url }),
};

export default GST_API;
