// mobile-app/src/screens/order/OrdersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderAPI } from '../../services/api';

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      const ordersData = response.data?.data?.orders || [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Buyurtmalarni yuklashda xato:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // ✅ Buyurtmani o'chirish
  const handleDeleteOrder = (orderId) => {
    Alert.alert(
      'Buyurtmani o\'chirish',
      'Bu buyurtmani o\'chirmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Ha, o\'chirish',
          style: 'destructive',
          onPress: async () => {
            try {
              await orderAPI.delete(orderId);
              Alert.alert('O\'chirildi', 'Buyurtma o\'chirildi');
              fetchOrders(); // Ro'yxatni yangilash
            } catch (error) {
              Alert.alert('Xato', 'O\'chirishda xato yuz berdi');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'CONFIRMED': return '#3B82F6';
      case 'PREPARING': return '#8B5CF6';
      case 'DELIVERED': return '#10B981';
      case 'CANCELLED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Kutilmoqda';
      case 'CONFIRMED': return 'Tasdiqlandi';
      case 'PREPARING': return 'Tayyorlanmoqda';
      case 'DELIVERED': return 'Yetkazildi';
      case 'CANCELLED': return 'Bekor qilindi';
      default: return status;
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>#{item.id}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.itemsList}>
        {item.items?.map((orderItem, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>{orderItem.cake?.name || 'Noma\'lum'}</Text>
            <Text style={styles.itemQty}>x{orderItem.quantity}</Text>
            <Text style={styles.itemPrice}>{(orderItem.price * orderItem.quantity).toLocaleString()} so'm</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.footerLeft}>
          <Text style={styles.totalLabel}>Jami:</Text>
          <Text style={styles.totalAmount}>{item.totalAmount?.toLocaleString()} so'm</Text>
        </View>
        
        {/* ✅ O'chirish tugmasi */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteOrder(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Buyurtmalar yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buyurtmalarim</Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <Ionicons name="refresh" size={24} color={refreshing ? '#9CA3AF' : '#FF6B6B'} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Buyurtmalar yo'q</Text>
            <Text style={styles.emptySubtitle}>Hozircha buyurtmalaringiz yo'q</Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopButtonText}>Xarid qilish</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginRight: 24 },
  // List
  listContent: { padding: 16, paddingBottom: 100 },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  orderDate: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  itemsList: { marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  itemName: { fontSize: 14, color: '#1F2937', flex: 1 },
  itemQty: { fontSize: 14, color: '#6B7280', marginHorizontal: 12 },
  itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#FF6B6B' },
  orderFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderColor: '#F3F4F6' 
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#6B7280', marginRight: 8 },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#FF6B6B' },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  // Empty
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  shopButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
});

export default OrdersScreen;