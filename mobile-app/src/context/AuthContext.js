import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ✅ StyleSheet bu yerda KERAK EMAS (chunki bu context fayl)
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Auth ma'lumotlarini yuklash
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('user')
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('❌ Auth load error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAuthData();
  }, []);

  // ✅ Login funksiyasi
  const login = async (userData, authToken) => {
    try {
      await AsyncStorage.setItem('token', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      console.log('✅ Login successful:', userData);
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  // ✅ Logout funksiyasi
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  // ✅ YANGI: User ma'lumotlarini yangilash (UI darhol yangilanishi uchun)
  const updateUser = async (updatedData) => {
    try {
      if (!user) return;
      
      // Yangi user obyekti yaratish
      const newUser = { ...user, ...updatedData };
      
      // AsyncStorage ga saqlash
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      // State ni yangilash (UI darhol o'zgaradi)
      setUser(newUser);
      
      console.log('✅ User updated in context:', newUser);
      return newUser;
    } catch (error) {
      console.error('❌ updateUser error:', error);
      throw error;
    }
  };

  // ✅ Refresh user data from AsyncStorage (ixtiyoriy)
  const refreshUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('❌ refreshUser error:', error);
    }
  };

  // ✅ Context value
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,  // ✅ Yangi funksiya
    refreshUser, // ✅ Ixtiyoriy
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};