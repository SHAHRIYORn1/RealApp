// mobile-app/src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import CakeDetailScreen from '../screens/home/CakeDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import OrdersScreen from '../screens/order/OrdersScreen';
import CartScreen from '../screens/order/CartScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminCakesScreen from '../screens/admin/AdminCakesScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 🔐 Auth Stack (Login/Register)
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// 🏠 Main Tab Navigator (Home, Orders, Profile)
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// 🛠 Admin Stack
const AdminStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminCakes" component={AdminCakesScreen} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
    </Stack.Navigator>
  );
};

// 🎯 Asosiy App Navigator
const AppNavigator = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Loading holatida
  if (loading) {
    return null; // Yoki LoadingScreen komponenti
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        // Agar login qilinmagan bo'lsa - Auth stack
        <AuthStack />
      ) : isAdmin ? (
        // Agar admin bo'lsa - Admin stack
        <AdminStack />
      ) : (
        // Oddiy user - Main tabs + Detail screens
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen 
            name="CakeDetail" 
            component={CakeDetailScreen}
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen 
            name="Cart" 
            component={CartScreen}
            options={{
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;