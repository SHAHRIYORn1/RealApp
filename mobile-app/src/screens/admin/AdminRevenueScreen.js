// mobile-app/src/screens/admin/AdminRevenueScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderAPI } from '../../services/api';

const AdminRevenueScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    deliveredRevenue: 0,
    cancelledRevenue: 0,
    pendingRevenue: 0,
    orderCount: 0,
    deliveredCount: 0,
    cancelledCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      const allOrders = response.data?.data?.orders || [];
      
      const delivered = allOrders.filter(o => o.status === 'DELIVERED');
      const cancelled = allOrders.filter(o => o.status === 'CANCELLED');
      const pending = allOrders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status));
      
      const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const deliveredRevenue = delivered.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const cancelledRevenue = cancelled.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pendingRevenue = pending.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      setOrders(allOrders);
      setStats({
        totalRevenue, deliveredRevenue, cancelledRevenue, pendingRevenue,
        orderCount: allOrders.length,
        deliveredCount: delivered.length,
        cancelledCount: cancelled.length,
      });
    } catch (error) {
      console.error('Daromad ma\'lumotlarini yuklashda xato:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRevenueData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return '#10B981';
      case 'CANCELLED': return '#EF4444';
      case 'PENDING': return '#F59E0B';
      case 'CONFIRMED': return '#3B82F6';
      case 'PREPARING': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'DELIVERED': return 'Yetkazildi ✅';
      case 'CANCELLED': return 'Bekor qilindi ❌';
      case 'PENDING': return 'Kutilmoqda ⏳';
      case 'CONFIRMED': return 'Tasdiqlandi ✓';
      case 'PREPARING': return 'Tayyorlanmoqda 🔄';
      default: return status;
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>#{item.id}</Text>
          <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString('uz-UZ')}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <View style={styles.customerRow}>
        <Ionicons name="person" size={16} color="#6B7280" />
        <Text style={styles.customerName}>{item.user?.name || 'Noma\'lum'}</Text>
        <Text style={styles.customerPhone}>{item.phone}</Text>
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Jami:</Text>
        <Text style={[styles.totalAmount, item.status === 'CANCELLED' && styles.cancelledAmount]}>
          {item.totalAmount?.toLocaleString()} so'm
        </Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Daromad ma'lumotlari yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💰 Daromad</Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <Ionicons name="refresh" size={24} color={refreshing ? '#9CA3AF' : '#FF6B6B'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
      >
        <View style={styles.statsGrid}>
          <StatCard title="Jami Tushum" value={`${stats.totalRevenue.toLocaleString()} so'm`} subtitle={`${stats.orderCount} ta buyurtma`} icon="cash" color="#3B82F6" />
          <StatCard title="✅ Haqiqiy Daromad" value={`${stats.deliveredRevenue.toLocaleString()} so'm`} subtitle={`${stats.deliveredCount} ta yetkazildi`} icon="checkmark-circle" color="#10B981" />
          <StatCard title="❌ Yo'qotilgan" value={`${stats.cancelledRevenue.toLocaleString()} so'm`} subtitle={`${stats.cancelledCount} ta bekor qilindi`} icon="close-circle" color="#EF4444" />
          <StatCard title="⏳ Kutilayotgan" value={`${stats.pendingRevenue.toLocaleString()} so'm`} subtitle="Hali yetkazilmagan" icon="time" color="#F59E0B" />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📊 Daromad Xulosasi</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Umumiy aylanma:</Text>
            <Text style={styles.summaryValue}>{stats.totalRevenue.toLocaleString()} so'm</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Haqiqiy foyda (yetkazilgan):</Text>
            <Text style={[styles.summaryValue, styles.positive]}>{stats.deliveredRevenue.toLocaleString()} so'm</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Yo'qotilgan (bekor qilingan):</Text>
            <Text style={[styles.summaryValue, styles.negative]}>-{stats.cancelledRevenue.toLocaleString()} so'm</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Net foyda:</Text>
            <Text style={[styles.summaryValue, styles.netProfit]}>
              {(stats.deliveredRevenue - stats.cancelledRevenue).toLocaleString()} so'm
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Buyurtmalar Tarixi</Text>
            <Text style={styles.sectionCount}>{orders.length} ta</Text>
          </View>
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={50} color="#D1D5DB" />
                <Text style={styles.emptyText}>Hozircha buyurtmalar yo'q</Text>
              </View>
            }
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  scrollView: { flex: 1 },
  statsGrid: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12,
    borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  statIcon: {
    width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  statInfo: { flex: 1 },
  statTitle: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  statSubtitle: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  summaryCard: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  positive: { color: '#10B981' },
  negative: { color: '#EF4444' },
  netProfit: { fontSize: 18, color: '#3B82F6' },
  summaryDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  section: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  sectionCount: { fontSize: 14, color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  orderCard: {
    backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 10,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
  orderDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  customerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  customerName: { fontSize: 13, fontWeight: '500', color: '#1F2937' },
  customerPhone: { fontSize: 12, color: '#6B7280' },
  orderFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderColor: '#E5E7EB' },
  totalLabel: { fontSize: 13, color: '#6B7280', marginRight: 8 },
  totalAmount: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
  cancelledAmount: { color: '#EF4444', textDecorationLine: 'line-through' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  emptyText: { fontSize: 14, color: '#6B7280', marginTop: 10, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 15 },
});

export default AdminRevenueScreen;