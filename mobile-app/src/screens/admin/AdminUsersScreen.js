// mobile-app/src/screens/admin/AdminUsersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { userAPI, cakeAPI } from '../../services/api';

const AdminUsersScreen = ({ navigation }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('likes'); // 'likes' | 'comments' | 'orders'

  const fetchUsers = async (query = '') => {
    try {
      setLoading(true);
      const response = await userAPI.getAll({ limit: 50, search: query });
      const usersData = response.data?.data?.users || [];
      setUsers(usersData);
    } catch (error) {
      console.error('Userlarni yuklashda xato:', error);
      Alert.alert('Xato', 'Userlarni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    fetchUsers(text);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers(searchQuery);
  };

  const openUserDetails = async (userId) => {
    try {
      setDetailsLoading(true);
      const response = await userAPI.getById(userId);
      setUserDetails(response.data?.data?.user);
      setSelectedUser(response.data?.data?.user);
      setModalVisible(true);
    } catch (error) {
      console.error('User details yuklashda xato:', error);
      Alert.alert('Xato', 'Foydalanuvchi ma\'lumotlarini yuklab bo\'lmadi');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteUser = (userId, userName) => {
    if (userId === currentUser?.id) {
      Alert.alert('Xato', 'O\'zingizni o\'chira olmaysiz');
      return;
    }

    Alert.alert(
      'Foydalanuvchini o\'chirish',
      `"${userName}" foydalanuvchisini o\'chirmoqchimisiz?\n\n⚠️ Barcha buyurtmalari, like va commentlari ham o\'chiriladi!`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Ha, o\'chirish',
          style: 'destructive',
          onPress: async () => {
            try {
              await userAPI.delete(userId);
              Alert.alert('O\'chirildi', 'Foydalanuvchi o\'chirildi');
              setUsers(users.filter(u => u.id !== userId));
              if (selectedUser?.id === userId) {
                setModalVisible(false);
              }
              fetchUsers(searchQuery);
            } catch (error) {
              Alert.alert('Xato', error.response?.data?.message || 'O\'chirishda xato');
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => openUserDetails(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.userAvatar}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color="#6B7280" />
          </View>
        )}
      </View>
      
      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
          {item.role === 'ADMIN' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          )}
        </View>
        <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
        {item.phone && <Text style={styles.userPhone}>{item.phone}</Text>}
        
        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Ionicons name="cart" size={14} color="#6B7280" />
            <Text style={styles.statText}>{item._count?.orders || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={14} color="#6B7280" />
            <Text style={styles.statText}>{item._count?.likes || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={14} color="#6B7280" />
            <Text style={styles.statText}>{item._count?.comments || 0}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => openUserDetails(item.id)}
        >
          <Ionicons name="eye" size={18} color="#3B82F6" />
        </TouchableOpacity>
        {item.id !== currentUser?.id && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteUser(item.id, item.name)}
          >
            <Ionicons name="trash" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTabButton = (tab, icon, label) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons 
        name={icon} 
        size={18} 
        color={activeTab === tab ? '#fff' : '#6B7280'} 
      />
      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderLikesList = () => {
    if (!userDetails?.likes?.length) {
      return <Text style={styles.emptyText}>Hozircha like bosilmagan</Text>;
    }
    return userDetails.likes.map((like) => (
      <View key={like.id} style={styles.activityItem}>
        {like.cake?.imageUrl && (
          <Image source={{ uri: like.cake.imageUrl }} style={styles.cakeThumb} />
        )}
        <View style={styles.activityInfo}>
          <Text style={styles.cakeName}>{like.cake?.name || 'Noma\'lum'}</Text>
          <Text style={styles.activityDate}>
            {new Date(like.createdAt).toLocaleDateString('uz-UZ')}
          </Text>
        </View>
      </View>
    ));
  };

  const renderCommentsList = () => {
    if (!userDetails?.comments?.length) {
      return <Text style={styles.emptyText}>Hozircha comment yozilmagan</Text>;
    }
    return userDetails.comments.map((comment) => (
      <View key={comment.id} style={styles.activityItem}>
        {comment.cake?.imageUrl && (
          <Image source={{ uri: comment.cake.imageUrl }} style={styles.cakeThumb} />
        )}
        <View style={styles.activityInfo}>
          <Text style={styles.cakeName}>{comment.cake?.name || 'Noma\'lum'}</Text>
          <Text style={styles.commentText} numberOfLines={2}>{comment.text}</Text>
          {comment.rating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{comment.rating}/5</Text>
            </View>
          )}
          <Text style={styles.activityDate}>
            {new Date(comment.createdAt).toLocaleDateString('uz-UZ')}
          </Text>
        </View>
      </View>
    ));
  };

  const renderOrdersList = () => {
    if (!userDetails?.orders?.length) {
      return <Text style={styles.emptyText}>Hozircha buyurtma yo'q</Text>;
    }
    return userDetails.orders.map((order) => (
      <View key={order.id} style={styles.orderItem}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>#{order.id}</Text>
          <View style={[styles.statusBadge, { 
            backgroundColor: order.status === 'DELIVERED' ? '#10B981' : 
                           order.status === 'CANCELLED' ? '#EF4444' : '#F59E0B' 
          }]}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>
        
        {order.items?.slice(0, 3).map((item, idx) => (
          <View key={idx} style={styles.orderCakeRow}>
            {item.cake?.imageUrl && (
              <Image source={{ uri: item.cake.imageUrl }} style={styles.cakeThumbSmall} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.cakeNameSmall}>{item.cake?.name}</Text>
              <Text style={styles.orderQty}>x{item.quantity} • {(item.price * item.quantity).toLocaleString()} so'm</Text>
            </View>
          </View>
        ))}
        
        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>Jami: {order.totalAmount?.toLocaleString()} so'm</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
          </Text>
        </View>
      </View>
    ));
  };

  if (loading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Foydalanuvchilar yuklanmoqda...</Text>
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
        <Text style={styles.headerTitle}>Foydalanuvchilar</Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <Ionicons name="refresh" size={24} color={refreshing ? '#9CA3AF' : '#FF6B6B'} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Ism, email yoki telefon..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Foydalanuvchilar topilmadi</Text>
          </View>
        }
      />

      {/* User Details Modal */}
      <Modal 
        visible={modalVisible} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Foydalanuvchi Ma'lumotlari</Text>
            <View style={{ width: 40 }} />
          </View>

          {detailsLoading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color="#FF6B6B" />
              <Text style={styles.loadingText}>Yuklanmoqda...</Text>
            </View>
          ) : userDetails ? (
            <ScrollView style={styles.modalContent}>
              {/* User Profile */}
              <View style={styles.userProfile}>
                <View style={styles.modalAvatar}>
                  {userDetails.avatar ? (
                    <Image source={{ uri: userDetails.avatar }} style={styles.avatarImageLarge} />
                  ) : (
                    <View style={styles.avatarPlaceholderLarge}>
                      <Ionicons name="person" size={40} color="#6B7280" />
                    </View>
                  )}
                </View>
                <Text style={styles.modalUserName}>{userDetails.name}</Text>
                <Text style={styles.modalUserEmail}>{userDetails.email}</Text>
                {userDetails.phone && <Text style={styles.modalUserPhone}>{userDetails.phone}</Text>}
                {userDetails.address && <Text style={styles.modalUserAddress}>{userDetails.address}</Text>}
                <Text style={styles.modalUserJoined}>
                  Ro'yxatdan o'tgan: {new Date(userDetails.createdAt).toLocaleDateString('uz-UZ')}
                </Text>
              </View>

              {/* Activity Tabs */}
              <View style={styles.tabsContainer}>
                {renderTabButton('likes', 'heart', `Like (${userDetails.likes?.length || 0})`)}
                {renderTabButton('comments', 'chatbubble', `Comment (${userDetails.comments?.length || 0})`)}
                {renderTabButton('orders', 'cart', `Buyurtma (${userDetails.orders?.length || 0})`)}
              </View>

              {/* Activity Content */}
              <View style={styles.activityContent}>
                {activeTab === 'likes' && renderLikesList()}
                {activeTab === 'comments' && renderCommentsList()}
                {activeTab === 'orders' && renderOrdersList()}
              </View>

              {/* Delete Button */}
              {userDetails.id !== currentUser?.id && (
                <TouchableOpacity 
                  style={styles.deleteUserButton}
                  onPress={() => handleDeleteUser(userDetails.id, userDetails.name)}
                >
                  <Ionicons name="trash" size={20} color="#fff" />
                  <Text style={styles.deleteUserButtonText}>Foydalanuvchini O'chirish</Text>
                </TouchableOpacity>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          ) : (
            <View style={styles.modalError}>
              <Ionicons name="alert-circle" size={40} color="#EF4444" />
              <Text style={styles.errorText}>Ma'lumotlarni yuklab bo'lmadi</Text>
            </View>
          )}
        </View>
      </Modal>
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
  searchContainer: { backgroundColor: '#fff', padding: 16 },
  searchInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1F2937' },
  listContent: { padding: 16, paddingBottom: 100 },
  userCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16,
    padding: 12, marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  userAvatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 25 },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', flex: 1 },
  adminBadge: { backgroundColor: '#3B82F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  adminBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  userEmail: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
  userPhone: { fontSize: 13, color: '#3B82F6' },
  userStats: { flexDirection: 'row', marginTop: 6 },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  statText: { fontSize: 12, color: '#6B7280', marginLeft: 2 },
  userActions: { flexDirection: 'row' },
  actionButton: { padding: 8 },
  // Modal
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 50, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  modalCloseButton: { padding: 4 },
  modalTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginRight: 24 },
  modalLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { flex: 1, padding: 20 },
  modalError: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorText: { fontSize: 14, color: '#6B7280', marginTop: 12, textAlign: 'center' },
  // User Profile in Modal
  userProfile: { alignItems: 'center', marginBottom: 24 },
  modalAvatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarImageLarge: { width: '100%', height: '100%', borderRadius: 40 },
  avatarPlaceholderLarge: { justifyContent: 'center', alignItems: 'center' },
  modalUserName: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  modalUserEmail: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  modalUserPhone: { fontSize: 14, color: '#3B82F6', marginBottom: 4 },
  modalUserAddress: { fontSize: 14, color: '#4B5563', textAlign: 'center', marginBottom: 8 },
  modalUserJoined: { fontSize: 12, color: '#9CA3AF' },
  // Tabs
  tabsContainer: { flexDirection: 'row', marginBottom: 16 },
  tabButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, backgroundColor: '#F9FAFB', borderRadius: 10, marginHorizontal: 4,
  },
  tabButtonActive: { backgroundColor: '#FF6B6B' },
  tabText: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  // Activity Content
  activityContent: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', padding: 20 },
  activityItem: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10,
    padding: 10, marginBottom: 8,
  },
  cakeThumb: { width: 50, height: 50, borderRadius: 8, marginRight: 10 },
  activityInfo: { flex: 1 },
  cakeName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  commentText: { fontSize: 13, color: '#4B5563', marginBottom: 4 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 4 },
  ratingText: { fontSize: 11, color: '#F59E0B', marginLeft: 2 },
  activityDate: { fontSize: 11, color: '#9CA3AF' },
  // Orders
  orderItem: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 8 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  orderCakeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cakeThumbSmall: { width: 40, height: 40, borderRadius: 6, marginRight: 8 },
  cakeNameSmall: { fontSize: 13, fontWeight: '500', color: '#1F2937' },
  orderQty: { fontSize: 12, color: '#6B7280' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#F3F4F6' },
  orderTotal: { fontSize: 14, fontWeight: 'bold', color: '#FF6B6B' },
  orderDate: { fontSize: 11, color: '#9CA3AF' },
  // Delete Button
  deleteUserButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 12,
    marginTop: 20, marginHorizontal: 20,
  },
  deleteUserButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
});

export default AdminUsersScreen;
