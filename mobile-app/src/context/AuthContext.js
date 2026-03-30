// mobile-app/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // App yuklanganda user va token ni yuklash
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
        console.error('Auth load error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAuthData();
  }, []);

  // Login funksiyasi
  const login = async (userData, authToken) => {
    try {
      await AsyncStorage.setItem('token', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Login save error:', error);
    }
  };

  // Register funksiyasi (login bilan bir xil)
  const register = async (userData, authToken) => {
    return login(userData, authToken);
  };

  // Logout funksiyasi
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // isAdmin tekshiruvi
  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isAdmin,
      loading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};