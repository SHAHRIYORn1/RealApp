// mobile-app/src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Sizning IP manzilingiz
const API_URL = 'http://192.168.43.147:5000/api';

// Axios instance yaratish
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 soniya timeout
});

// Request interceptor: Har so'rovga token qo'shish
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Token olishda xato:', error);
  }
  return config;
});

// Response interceptor: Xatolarni markaziy ushlash
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server javob berdi, lekin status code 2xx emas
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // So'rov yuborildi, lekin javob kelmadi
      console.error('API No Response:', error.request);
    } else {
      // So'rov sozlashda xato
      console.error('API Config Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 🔐 Auth API Functions
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// 🍰 Cake API Functions
export const cakeAPI = {
  getAll: (params) => api.get('/cakes', { params }),
  getById: (id) => api.get(`/cakes/${id}`),
  create: (data) => api.post('/cakes', data),
  update: (id, data) => api.put(`/cakes/${id}`, data),
  delete: (id) => api.delete(`/cakes/${id}`),
};

// 💬 Comment API Functions
export const commentAPI = {
  getByCake: (cakeId, params) => api.get(`/cakes/${cakeId}/comments`, { params }),
  create: (cakeId, data) => api.post(`/cakes/${cakeId}/comments`, data),
  delete: (id) => api.delete(`/comments/${id}`),
};

// ❤️ Like API Functions
export const likeAPI = {
  check: (cakeId) => api.get(`/cakes/${cakeId}/like`),
  toggle: (cakeId) => api.post(`/cakes/${cakeId}/like`),
  getMyLikes: (params) => api.get('/users/me/likes', { params }),
};

// 🛒 Order API Functions
// Order API
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: () => api.get('/orders/admin'),  // ✅ To'g'ri - paramsiz
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};
export default api;