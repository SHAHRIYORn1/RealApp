// mobile-app/src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  if (Platform.OS === 'android') {
    return 'http://192.168.1.7:5000/api';
  }
  return 'http://192.168.1.7:5000/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Token xato:', error);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('🔌 Backendga ulanib bo\'lmadi. URL:', API_URL);
    } else {
      console.error('API Config Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 🔐 Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// 🍰 Cake API
export const cakeAPI = {
  getAll: (params) => api.get('/cakes', { params }),
  getById: (id) => api.get(`/cakes/${id}`),
  create: (data) => api.post('/cakes', data),
  update: (id, data) => api.put(`/cakes/${id}`, data),
  delete: (id) => api.delete(`/cakes/${id}`),
};

// 💬 Comment API
export const commentAPI = {
  getByCake: (cakeId, params) => api.get(`/cakes/${cakeId}/comments`, { params }),
  create: (cakeId, data) => api.post(`/cakes/${cakeId}/comments`, data),
  delete: (id) => api.delete(`/comments/${id}`),
};

// ❤️ Like API
export const likeAPI = {
  check: (cakeId) => api.get(`/likes/cake/${cakeId}`),
  toggle: (cakeId) => api.post(`/likes/cake/${cakeId}`),
  getMyLikes: (params) => api.get('/likes/my', { params }),
};

// 🛒 Order API
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: (params) => api.get('/orders/admin', { params }),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// 👤 User API
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
};

export default api;