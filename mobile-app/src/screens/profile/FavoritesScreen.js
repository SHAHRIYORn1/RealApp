import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,  // ✅ QO'SHING!
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cakeAPI, likeAPI } from '../../services/api';
const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await likeAPI.getMyLikes({ limit: 50 });
      const likedCakes = response.data?.data?.likes || [];
      setFavorites(likedCakes);
    } catch (error) {
      console.error('Sevimlilarni yuklashda xato:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const handleUnlike = async (cakeId) => {
    Alert.alert(
      'Sevimlilardan o\'chirish',
      'Bu tortni sevimlilardan o\'chirmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Ha, o\'chirish',
          onPress: async () => {
            try {
              await likeAPI.toggle(cakeId);
              setFavorites(prev => prev.filter(cake => cake.id !== cakeId));
              Alert.alert('O\'chirildi', 'Tort sevimlilardan o\'chirildi');
            } catch (error) {
              Alert.alert('Xato', 'O\'chirishda xato yuz berdi');
            }
          },
        },
      ]
    );
  };

  const renderCakeCard = ({ item }) => (
    <TouchableOpacity
      style={styles.cakeCard}
      onPress={() => navigation.navigate('CakeDetail', { cakeId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cakeImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cakeImage} resizeMode="cover" />
        ) : (
          <View style={styles.cakeImagePlaceholder}>
            <Ionicons name="restaurant-outline" size={40} color="#9CA3AF" />
          </View>
        )}
        <TouchableOpacity
          style={styles.unlikeButton}
          onPress={(e) => { e.stopPropagation(); handleUnlike(item.id); }}
        >
          <Ionicons name="close-circle" size={28} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <View style={styles.cakeInfo}>
        <Text style={styles.cakeName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cakePrice}>{item.price?.toLocaleString()} so'm</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Yuklanmoqda...</Text>
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
        <Text style={styles.headerTitle}>Sevimlilar</Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <Ionicons name="refresh" size={24} color={refreshing ? '#9CA3AF' : '#FF6B6B'} />
        </TouchableOpacity>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-dislike-outline" size={60} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyTitle}>Sevimlilar bo'sh</Text>
          <Text style={styles.emptySubtitle}>
            Hozircha sevimli tortlaringiz yo'q.
            {'\n'}Yoqtirgan tortlaringizni like qiling!
          </Text>
          <TouchableOpacity
  style={styles.browseButton}
  onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
>
  <Text style={styles.browseButtonText}>Tortlarni ko'rish</Text>
</TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderCakeCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
          }
          numColumns={2}
        />
      )}
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
  listContent: { padding: 16 },
  cakeCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, margin: 8,
    overflow: 'hidden', minWidth: '47%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  cakeImageContainer: { position: 'relative', height: 140 },
  cakeImage: { width: '100%', height: '100%' },
  cakeImagePlaceholder: {
    flex: 1, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  unlikeButton: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#fff', borderRadius: 14,
  },
  cakeInfo: { padding: 12 },
  cakeName: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  cakePrice: { fontSize: 16, fontWeight: 'bold', color: '#FF6B6B' },
  // Empty
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
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

export default FavoritesScreen;