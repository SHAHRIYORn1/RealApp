// mobile-app/src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ✅ IP manzilni to'g'ri sozlash (ifconfig dan)
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  if (Platform.OS === 'android') {
    // ✅ Android emulator uchun: 10.0.2.2 = localhost
    // ✅ Haqiqiy Android telefon uchun: laptop IP si
    return 'http://192.168.1.7:5000/api';
  }
  // iOS simulator
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000, // 30 soniya timeout
});

// ✅ Request interceptor — Token qo'shish
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('❌ Token olishda xato:', error);
  }
  return config;
}, (error) => {
  console.error('❌ Request xatosi:', error);
  return Promise.reject(error);
});

// ✅ Response interceptor — Xatolarni ushlab, 401 da logout qilish
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 🔐 401 — Avtorizatsiya xatosi (token yaroqsiz yoki user yo'q)
    if (error.response && error.response.status === 401) {
      console.log('🔐 401 xato: Token yaroqsiz, logout qilinmoqda...');
      
      try {
        // Token va user ni o'chirish
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        console.log('✅ Token va user ma\'lumotlari o\'chirildi');
      } catch (e) {
        console.error('❌ Storage xatosi:', e);
      }
    }
    
    // 📡 Network xatosi — Backendga ulanib bo'lmadi
    if (!error.response && error.request) {
      console.error('🔌 Backendga ulanib bo\'lmadi!');
      console.error('   URL:', error.config?.baseURL || API_URL);
      console.error('   Laptop IP: 192.168.1.7');
      console.error('   Tekshirish:');
      console.error('   1. Telefon va laptop bir xil WiFi da mi?');
      console.error('   2. Backend ishlayaptimi? (npm run dev)');
      console.error('   3. Firewall 5000-portni bloklayaptimi?');
    }
    
    // Boshqa xatolar
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error:', error.message);
    } else {
      console.error('❌ Config Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// 🔐 AUTH API
// ============================================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// ============================================
// 🍰 CAKE API
// ============================================
export const cakeAPI = {
  getAll: (params) => api.get('/cakes', { params }),
  getById: (id) => api.get(`/cakes/${id}`),
  create: (data) => api.post('/cakes', data),
  update: (id, data) => api.put(`/cakes/${id}`, data),
  delete: (id) => api.delete(`/cakes/${id}`),
};

// ============================================
// 💬 COMMENT API
// ============================================
export const commentAPI = {
  getByCake: (cakeId, params) => api.get(`/cakes/${cakeId}/comments`, { params }),
  create: (cakeId, data) => api.post(`/cakes/${cakeId}/comments`, data),
  delete: (id) => api.delete(`/comments/${id}`),
  report: (id, reason) => api.post(`/comments/${id}/report`, { reason }),
  getReported: () => api.get('/comments/reported'),
};

// ============================================
// ❤️ LIKE API
// ============================================
export const likeAPI = {
  check: (cakeId) => api.get(`/likes/cake/${cakeId}`),
  toggle: (cakeId) => api.post(`/likes/cake/${cakeId}`),
  getMyLikes: (params) => api.get('/likes/my', { params }),
};

// ============================================
// 🛒 ORDER API
// ============================================
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: () => api.get('/orders/admin'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

// ============================================
// 👤 USER API
// ============================================
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  // Admin functions
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get('/users/' + id),
  delete: (id) => api.delete('/users/' + id),
};

// ============================================
// 🖼️ UPLOAD API
// ============================================
export const uploadAPI = {
  uploadCakeImage: (imageUri) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload_' + Date.now() + '.jpg',
    });
    return api.post('/upload/cake-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // Rasm yuklash uchun ko'proq vaqt
    });
  },
};

export default api;