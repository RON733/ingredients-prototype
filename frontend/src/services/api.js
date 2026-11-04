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
  getProducts: () => apiClient.get('/products'),
  getProduct: (id) => apiClient.get(`/products/${id}`),
  createProduct: (data) => apiClient.post('/products', data),
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),

  // Ingredients & Inventory
  getIngredients: () => apiClient.get('/ingredients'),
  restockIngredient: (id, data) => apiClient.post(`/ingredients/${id}/restock`, data),
  setStockIngredient: (id, data) => apiClient.put(`/ingredients/${id}/set-stock`, data),

  // Orders
  getOrders: (params) => apiClient.get('/orders', { params }),
  createOrder: (data) => apiClient.post('/orders', data),
  getOrder: (id) => apiClient.get(`/orders/${id}`),
  updateOrderStatus: (id, status, notes = '') => apiClient.put(`/orders/${id}/status`, { status, notes }),

  // Authentication & Verification
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (data) => apiClient.post('/auth/register', data),
  googleLogin: (data) => apiClient.post('/auth/google', data),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
  quickPinLogin: (pin, userId) => apiClient.post('/auth/pin-switch', { pin, user_id: userId }),
  verifyPassword: (data) => apiClient.post('/auth/verify-password', data),

  // Settings & Audit Logs
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data) => apiClient.post('/settings', data),
  getAuditLogs: (params) => apiClient.get('/audit-logs', { params }),
  getStaffList: () => apiClient.get('/auth/staff-list'),

  // Analytics & Dashboard Stats
  getAnalytics: () => apiClient.get('/analytics/dashboard'),
  getUsers: (params) => apiClient.get('/users', { params }),
  updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),

  // Announcements & Event Bookings
  getAnnouncements: () => apiClient.get('/announcements'),
  createAnnouncement: (data) => apiClient.post('/announcements', data),
  updateAnnouncement: (id, data) => apiClient.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => apiClient.delete(`/announcements/${id}`),

  getBookings: (params) => apiClient.get('/bookings', { params }),
  createBooking: (data) => apiClient.post('/bookings', data),
  updateBookingStatus: (id, status) => apiClient.put(`/bookings/${id}/status`, { status }),

  // Chatbot Support
  chatWithBot: (message, history = []) => apiClient.post('/chatbot', { message, history }),
};

export default GST_API;
