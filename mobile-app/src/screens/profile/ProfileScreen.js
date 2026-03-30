// mobile-app/src/screens/profile/ProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Chiqish',
      'Rostdan ham chiqmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Ha, chiqish',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uz-UZ');
  };

  const MenuItem = ({ icon, iconColor, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={50} color="#fff" />
        </View>
        <Text style={styles.userName}>{user?.name || 'Foydalanuvchi'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Personal Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Shaxsiy ma'lumotlar</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Telefon</Text>
            </View>
            <Text style={styles.infoValue}>
              {user?.phone || 'Kiritilmagan'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Manzil</Text>
            </View>
            <Text style={styles.infoValue}>
              {user?.address || 'Kiritilmagan'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Ro'yxatdan o'tgan</Text>
            </View>
            <Text style={styles.infoValue}>
              {user?.createdAt ? formatDate(user.createdAt) : '-'}
            </Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Menu</Text>
          
          <MenuItem
            icon="cart"
            iconColor="#3B82F6"
            title="Buyurtmalarim"
            subtitle="Barcha buyurtmalaringiz"
            onPress={() => navigation.navigate('Orders')}
          />

          <MenuItem
            icon="heart"
            iconColor="#EF4444"
            title="Sevimlilar"
            subtitle="Like qilgan tortlaringiz"
            onPress={() => navigation.navigate('Favorites')}
          />

          <MenuItem
            icon="location"
            iconColor="#10B981"
            title="Mening manzillarim"
            subtitle="Yetkazib berish manzillari"
            onPress={() => navigation.navigate('MyAddresses')}
          />

          <MenuItem
            icon="settings"
            iconColor="#8B5CF6"
            title="Sozlamalar"
            subtitle="Profil sozlamalari"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Chiqish</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  // Header
  header: {
    backgroundColor: '#FF6B6B',
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  // Scroll
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  // Info Card
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    color: '#6B7280',
    maxWidth: 200,
    textAlign: 'right',
  },
  // Menu Section
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: { flex: 1 },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
});

export default ProfileScreen;