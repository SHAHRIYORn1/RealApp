// mobile-app/src/screens/admin/AdminOrdersScreen.js
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

const AdminOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      const ordersData = response.data?.data?.orders || [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Buyurtmalarni yuklashda xato:', error);
      Alert.alert('Xato', 'Buyurtmalarni yuklab bo\'lmadi');
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

  const updateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      Alert.alert('Muvaffaqiyat', `Status "${newStatus}" ga o'zgartirildi`);
      fetchOrders();
    } catch (error) {
      Alert.alert('Xato', 'Status o\'zgartirishda xato');
    }
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

      <View style={styles.customerInfo}>
        <Text style={styles.customerLabel}>Mijoz</Text>
        <Text style={styles.customerValue}>{item.user?.name || 'Noma\'lum'}</Text>
        <Text style={styles.customerPhone}>{item.phone}</Text>
        <Text style={styles.customerAddress}>{item.address}</Text>
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
        <Text style={styles.totalLabel}>Jami:</Text>
        <Text style={styles.totalAmount}>{item.totalAmount?.toLocaleString()} so'm</Text>
      </View>

      {item.status === 'PENDING' && (
        <View style={styles.statusActions}>
          <TouchableOpacity style={[styles.statusButton, { backgroundColor: '#3B82F6' }]} onPress={() => updateStatus(item.id, 'CONFIRMED')}>
            <Text style={styles.statusButtonText}>Tasdiqlash</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statusButton, { backgroundColor: '#EF4444' }]} onPress={() => updateStatus(item.id, 'CANCELLED')}>
            <Text style={styles.statusButtonText}>Bekor qilish</Text>
          </TouchableOpacity>
        </View>
      )}
      {item.status === 'CONFIRMED' && (
        <TouchableOpacity style={[styles.statusButton, { backgroundColor: '#8B5CF6' }]} onPress={() => updateStatus(item.id, 'PREPARING')}>
          <Text style={styles.statusButtonText}>Tayyorlashni boshlash</Text>
        </TouchableOpacity>
      )}
      {item.status === 'PREPARING' && (
        <TouchableOpacity style={[styles.statusButton, { backgroundColor: '#10B981' }]} onPress={() => updateStatus(item.id, 'DELIVERED')}>
          <Text style={styles.statusButtonText}>Yetkazildi deb belgilash</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && orders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Buyurtmalar yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buyurtmalarni Boshqarish</Text>
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
            <Text style={styles.emptySubtitle}>Hozircha buyurtmalar mavjud emas</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginRight: 24 },
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
  customerInfo: {
    paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: '#F3F4F6', marginBottom: 12,
  },
  customerLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  customerValue: { fontSize: 15, fontWeight: '500', color: '#1F2937', marginBottom: 2 },
  customerPhone: { fontSize: 14, color: '#3B82F6', marginBottom: 2 },
  customerAddress: { fontSize: 14, color: '#4B5563' },
  itemsList: { marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  itemName: { fontSize: 14, color: '#1F2937', flex: 1 },
  itemQty: { fontSize: 14, color: '#6B7280', marginHorizontal: 12 },
  itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#FF6B6B' },
  orderFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderColor: '#F3F4F6' },
  totalLabel: { fontSize: 14, color: '#6B7280', marginRight: 8 },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#FF6B6B' },
  statusActions: { flexDirection: 'row', marginTop: 12, gap: 8 },
  statusButton: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
  },
  statusButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
});

export default AdminOrdersScreen;