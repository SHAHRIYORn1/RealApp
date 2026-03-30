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

// User Screens
import HomeScreen from '../screens/home/HomeScreen';
import CakeDetailScreen from '../screens/home/CakeDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import OrdersScreen from '../screens/order/OrdersScreen';
import CartScreen from '../screens/order/CartScreen';

// Profile Screens
import FavoritesScreen from '../screens/profile/FavoritesScreen';
import MyAddressesScreen from '../screens/profile/MyAddressesScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminCakesScreen from '../screens/admin/AdminCakesScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminRevenueScreen from '../screens/admin/AdminRevenueScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Orders') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
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
}

function UserStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs" component={UserTabs} />
      <Stack.Screen name="CakeDetail" component={CakeDetailScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="MyAddresses" component={MyAddressesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminCakes" component={AdminCakesScreen} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
      <Stack.Screen name="AdminRevenue" component={AdminRevenueScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer independent={true}>
      {!isAuthenticated ? (
        <AuthStack />
      ) : isAdmin ? (
        <AdminStack />
      ) : (
        <UserStack />
      )}
    </NavigationContainer>
  );
}