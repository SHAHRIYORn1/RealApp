// ✅ TO'G'RI:
import React, { useState, useEffect, useCallback } from 'react';  
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,  // ✅ Borligiga ishonch hosil qiling!
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { cakeAPI, likeAPI } from '../../services/api';

// ✅ CakeCard — Alohida komponent
const CakeCard = React.memo(({ item, navigation, isAuthenticated, onAddToCart }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  // Like holatini yuklash
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        if (isAuthenticated) {
          const response = await likeAPI.check(item.id);
          setIsLiked(response.data?.data?.isLiked || false);
          setLikeCount(response.data?.data?.totalLikes || 0);
        } else {
          setLikeCount(item._count?.likes || 0);
        }
      } catch (error) {
        setLikeCount(item._count?.likes || 0);
      }
    };
    fetchLikeStatus();
  }, [item.id, isAuthenticated, item._count?.likes]);

  // Like tugmasi
  const handleLike = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Kirish kerak',
        'Like bosish uchun tizimga kiring',
        [
          { text: 'Bekor qilish', style: 'cancel' },
          { text: 'Kirish', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    if (liking) return;
    setLiking(true);

    try {
      const response = await likeAPI.toggle(item.id);
      const newIsLiked = response.data?.data?.isLiked ?? !isLiked;
      const newCount = response.data?.data?.totalLikes ?? (isLiked ? likeCount - 1 : likeCount + 1);
      
      setIsLiked(newIsLiked);
      setLikeCount(newCount);
    } catch (error) {
      console.error('Like xatosi:', error);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } finally {
      setLiking(false);
    }
  };

  // Savatchaga qo'shish
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Kirish kerak',
        'Savatchaga qo\'shish uchun tizimga kiring',
        [
          { text: 'Bekor qilish', style: 'cancel' },
          { text: 'Kirish', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    
    onAddToCart(item);
  };

  return (
    <TouchableOpacity
      style={styles.cakeCard}
      onPress={() => navigation.navigate('CakeDetail', { cakeId: item.id })}
      activeOpacity={0.7}
    >
      {/* Rasm */}
      <View style={styles.cakeImageContainer}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.cakeImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={styles.cakeImagePlaceholder}>
            <Ionicons name="restaurant-outline" size={50} color="#9CA3AF" />
          </View>
        )}
        
        {/* Like tugmasi */}
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={(e) => { e.stopPropagation(); handleLike(); }}
          activeOpacity={0.7}
          disabled={liking}
        >
          <Ionicons 
            name={isLiked ? 'heart' : 'heart-outline'} 
            size={22} 
            color={isLiked ? '#EF4444' : '#fff'} 
          />
          <Text style={[styles.likeCount, isLiked && styles.likeCountActive]}>
            {likeCount}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ma'lumotlar */}
      <View style={styles.cakeInfo}>
        <Text style={styles.cakeName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cakeDescription} numberOfLines={2}>
          {item.description || ''}
        </Text>
        
        <View style={styles.cakeFooter}>
          <View>
            <Text style={styles.cakePrice}>{item.price?.toLocaleString()} so'm</Text>
            {item.rating > 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={(e) => { e.stopPropagation(); handleAddToCart(); }}
            activeOpacity={0.7}
          >
            <Ionicons name="cart" size={18} color="#fff" />
            <Text style={styles.addToCartText}>Buyurtma</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// 🏠 Asosiy HomeScreen komponenti
const HomeScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Tortlarni yuklash
  const fetchCakes = useCallback(async (query = '') => {
    try {
      setLoading(true);
      const response = await cakeAPI.getAll({ 
        limit: 20, 
        search: query,
      });
      
      const cakesData = response.data?.data?.cakes || response.data?.cakes || [];
      setCakes(cakesData);
    } catch (error) {
      console.error('Tortlarni yuklashda xato:', error);
      Alert.alert('Xato', 'Tortlarni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCakes();
  }, [fetchCakes]);

  // Qidiruv
  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    fetchCakes(text);
  }, [fetchCakes]);

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCakes(searchQuery);
  }, [fetchCakes, searchQuery]);

  // Savatchaga qo'shish
  const handleAddToCart = (cake) => {
    addToCart(cake, 1);
    Alert.alert(
      'Savatchaga qo\'shildi',
      `${cake.name} savatchaga qo'shildi!`,
      [
        { text: 'Davom etish', style: 'cancel' },
        { text: 'Savatchaga o\'tish', onPress: () => navigation.navigate('Cart') },
      ]
    );
  };

  // Loading holati
  if (loading && cakes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Tortlar yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Olaja To'rt Markazi</Text>
        {isAuthenticated && (
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle" size={32} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tort qidiring..."
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

      {/* Cakes List */}
      <FlatList
        data={cakes}
        renderItem={({ item }) => (
          <CakeCard
            item={item}
            navigation={navigation}
            isAuthenticated={isAuthenticated}
            onAddToCart={handleAddToCart}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="restaurant-outline" size={60} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>Tortlar topilmadi</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Boshqa so\'z bilan qidirib ko\'ring' : 'Hozircha tortlar yo\'q'}
            </Text>
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  // Search
  searchContainer: { backgroundColor: '#fff', padding: 16 },
  searchInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1F2937' },
  // List
  listContent: { padding: 16, paddingBottom: 100 },
  // Cake Card
  cakeCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16,
    marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  cakeImageContainer: { width: 120, height: 120, backgroundColor: '#F3F4F6', position: 'relative' },
  cakeImage: { width: '100%', height: '100%' },
  cakeImagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  likeButton: {
    position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  likeCount: { marginLeft: 4, fontSize: 12, color: '#fff', fontWeight: '600' },
  likeCountActive: { color: '#EF4444' },
  cakeInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cakeName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  cakeDescription: { fontSize: 13, color: '#6B7280', marginBottom: 8, lineHeight: 18 },
  cakeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cakePrice: { fontSize: 18, fontWeight: 'bold', color: '#FF6B6B' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingText: { marginLeft: 2, fontSize: 12, color: '#6B7280' },
  addToCartButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B6B',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  addToCartText: { color: '#fff', fontWeight: '600', fontSize: 13, marginLeft: 4 },
  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyIcon: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
});

export default HomeScreen;