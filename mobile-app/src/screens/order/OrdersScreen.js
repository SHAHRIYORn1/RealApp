// mobile-app/src/screens/order/OrdersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/api';

const OrdersScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders({ page: 1, limit: 20 });
      const ordersData = response.data?.data?.orders || response.data?.orders || [];
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
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('CakeDetail', { cakeId: item.items?.[0]?.cakeId })}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {item.items?.slice(0, 2).map((orderItem, index) => (
          <View key={index} style={styles.orderItemRow}>
            {orderItem.cake?.imageUrl ? (
              <Image source={{ uri: orderItem.cake.imageUrl }} style={styles.itemImage} resizeMode="cover" />
            ) : (
              <View style={styles.itemImagePlaceholder}>
                <Ionicons name="restaurant-outline" size={20} color="#9CA3AF" />
              </View>
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{orderItem.cake?.name || 'Noma\'lum'}</Text>
              <Text style={styles.itemQty}>x{orderItem.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>{(orderItem.price * orderItem.quantity).toLocaleString()} so'm</Text>
          </View>
        ))}
        {item.items?.length > 2 && (
          <Text style={styles.moreItems}>+{item.items.length - 2} ta yana...</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.footerLabel}>Manzil</Text>
          <Text style={styles.footerValue} numberOfLines={1}>{item.address}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.footerLabel}>Jami</Text>
          <Text style={styles.totalAmount}>{item.totalAmount?.toLocaleString()} so'm</Text>
        </View>
      </View>

      <Text style={styles.orderDate}>
        {new Date(item.createdAt).toLocaleDateString('uz-UZ', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })}
      </Text>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Buyurtmalarim</Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <Ionicons name="refresh" size={24} color={refreshing ? '#9CA3AF' : '#FF6B6B'} />
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart-outline" size={60} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>Buyurtmalar yo'q</Text>
          <Text style={styles.emptySubtitle}>Hozircha buyurtmangiz yo'q</Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.browseButtonText}>Tortlarni ko'rish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  listContent: { padding: 16, paddingBottom: 100 },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  orderItems: { marginBottom: 12 },
  orderItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemImage: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F3F4F6' },
  itemImagePlaceholder: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  itemQty: { fontSize: 12, color: '#6B7280' },
  itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#FF6B6B' },
  moreItems: { fontSize: 12, color: '#6B7280', marginLeft: 52 },
  orderFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  footerLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  footerValue: { fontSize: 13, color: '#1F2937', maxWidth: 150 },
  totalAmount: { fontSize: 16, fontWeight: 'bold', color: '#FF6B6B' },
  orderDate: { fontSize: 12, color: '#9CA3AF', textAlign: 'right' },
  // Empty State
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  browseButton: {
    backgroundColor: '#FF6B6B', paddingHorizontal: 40, paddingVertical: 16,
    borderRadius: 14, shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  browseButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
});

export default OrdersScreen;