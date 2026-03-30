// mobile-app/src/screens/admin/AdminDashboardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,  // ✅ SHU MUHIM!
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { cakeAPI, orderAPI } from '../../services/api';

const AdminDashboardScreen = ({ navigation }) => {
  const { logout } = useAuth();
  
  const [stats, setStats] = useState({
    totalCakes: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  // ✅ Statistika yuklash funksiyasi
  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Tortlar soni
      const cakesRes = await cakeAPI.getAll({ limit: 1 });
      const cakes = cakesRes.data?.data?.cakes || [];
      const totalCakes = cakes.length > 0 ? cakesRes.data?.data?.pagination?.total || 1 : 0;
      
      // Buyurtmalar
      const ordersRes = await orderAPI.getAll();
      const orders = ordersRes.data?.data?.orders || [];
      
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      setStats({ totalCakes, totalOrders, pendingOrders, totalRevenue });
    } catch (error) {
      console.error('Statistika xatosi:', error);
      // Xato bo'lsa ham, default qiymatlar bilan davom etamiz
      setStats({ totalCakes: 0, totalOrders: 0, pendingOrders: 0, totalRevenue: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // ✅ Stat Card komponenti
  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: color }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </TouchableOpacity>
  );

  // ✅ Loading holati
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <TouchableOpacity onPress={() => {
          Alert.alert('Chiqish', 'Rostdan ham chiqmoqchimisiz?', [
            { text: 'Bekor qilish', style: 'cancel' },
            { text: 'Ha', style: 'destructive', onPress: logout }
          ]);
        }}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Stats Grid */}
        <View style={styles.grid}>
          <StatCard
            title="Jami Tortlar"
            value={stats.totalCakes}
            icon="restaurant"
            color="#FF6B6B"
            onPress={() => navigation.navigate('AdminCakes')}
          />
          <StatCard
            title="Buyurtmalar"
            value={stats.totalOrders}
            icon="cart"
            color="#3B82F6"
            onPress={() => navigation.navigate('AdminOrders')}
          />
          <StatCard
            title="Kutilayotgan"
            value={stats.pendingOrders}
            icon="time"
            color="#F59E0B"
            onPress={() => navigation.navigate('AdminOrders')}
          />
          <StatCard
            title="Daromad"
            value={`${stats.totalRevenue.toLocaleString()} so'm`}
            icon="cash"
            color="#10B981"
            onPress={() => navigation.navigate('AdminRevenue')}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tezkor Amallar</Text>
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => navigation.navigate('AdminCakes')}
            >
              <Ionicons name="add-circle" size={36} color="#FF6B6B" />
              <Text style={styles.actionText}>Yangi Tort</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => navigation.navigate('AdminOrders')}
            >
              <Ionicons name="list" size={36} color="#3B82F6" />
              <Text style={styles.actionText}>Buyurtmalar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => navigation.navigate('AdminRevenue')}
            >
              <Ionicons name="cash" size={36} color="#10B981" />
              <Text style={styles.actionText}>Daromad</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>
            Barcha ma'lumotlar real vaqtda yangilanadi. 
            {'\n'}Yangilash uchun sahifani tortib qo'ying.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  
  // Center
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
  
  // Scroll
  scroll: { flex: 1, padding: 16 },
  
  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  value: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  
  // Section
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  
  // Actions
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: {
    width: '31%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  
  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});

export default AdminDashboardScreen;