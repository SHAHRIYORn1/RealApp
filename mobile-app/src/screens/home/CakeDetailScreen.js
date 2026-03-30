// ✅ TO'G'RI:
import React, { useState, useEffect, useCallback } from 'react';  // ← useCallback bor!
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,  // ✅ QO'SHING!
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { cakeAPI, likeAPI, commentAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
const CakeDetailScreen = ({ route, navigation }) => {
  const { cakeId } = route.params || {};
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const [cake, setCake] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchCakeData = useCallback(async () => {
    if (!cakeId) return;
    
    try {
      setLoading(true);
      
      // Cake ma'lumoti
      const cakeResponse = await cakeAPI.getById(cakeId);
      const cakeData = cakeResponse.data?.data?.cake || null;
      setCake(cakeData);

      // Comments
      const commentsResponse = await commentAPI.getByCake(cakeId);
      const commentsData = commentsResponse.data?.data?.comments || [];
      setComments(commentsData);

      // Like status
      if (isAuthenticated && cakeData) {
        try {
          const likeResponse = await likeAPI.check(cakeId);
          setIsLiked(likeResponse.data?.data?.isLiked || false);
          setTotalLikes(likeResponse.data?.data?.totalLikes || 0);
        } catch (e) {
          setIsLiked(false);
          setTotalLikes(0);
        }
      }
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xato:', error);
      Alert.alert('Xato', 'Ma\'lumotlarni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
    }
  }, [cakeId, isAuthenticated]);

  useEffect(() => {
    fetchCakeData();
  }, [fetchCakeData]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      Alert.alert('Kirish kerak', 'Like bosish uchun tizimga kiring', [
        { text: 'Bekor qilish' },
        { text: 'Kirish', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    try {
      const response = await likeAPI.toggle(cakeId);
      setIsLiked(response.data?.data?.isLiked ?? !isLiked);
      setTotalLikes(response.data?.data?.totalLikes ?? totalLikes);
    } catch (error) {
      console.error('Like xatosi:', error);
      // Optimistic update
      setIsLiked(!isLiked);
      setTotalLikes(prev => isLiked ? prev - 1 : prev + 1);
    }
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      Alert.alert('Kirish kerak', 'Comment yozish uchun tizimga kiring');
      return;
    }
    if (!newComment.trim()) {
      Alert.alert('Xato', 'Comment matnini kiriting');
      return;
    }

    setCommentLoading(true);
    try {
      await commentAPI.create(cakeId, {
        text: newComment.trim(),
        rating: commentRating,
      });
      setNewComment('');
      setCommentRating(5);
      fetchCakeData();
      Alert.alert('Muvaffaqiyat', 'Fikringiz qo\'shildi!');
    } catch (error) {
      Alert.alert('Xato', 'Comment qo\'shishda xato');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleAddToCart = () => {
  if (!cake) return;
  
  if (!cake.isAvailable) {
    Alert.alert('Mavjud emas', 'Bu tort hozircha mavjud emas');
    return;
  }
  
  if (!isAuthenticated) {
    Alert.alert('Kirish kerak', 'Savatchaga qo\'shish uchun tizimga kiring', [
      { text: 'Bekor qilish' },
      { text: 'Kirish', onPress: () => navigation.navigate('Login') },
    ]);
    return;
  }
  
  // ✅ Savatchaga qo'shish
  addToCart(cake, 1);
  
  Alert.alert('Savatchaga qo\'shildi', `${cake.name} savatchaga qo'shildi!`, [
    { text: 'Davom etish' },
    { 
      text: 'Savatchaga o\'tish', 
      onPress: () => navigation.navigate('Cart') 
    },
  ]);
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Yuklanmoqda...</Text>
      </View>
    );
  }

  if (!cake) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tort topilmadi</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Ortga qaytish</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle} numberOfLines={1}>{cake.name}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cake Image */}
        <View style={styles.imageContainer}>
          {cake.imageUrl ? (
            <Image source={{ uri: cake.imageUrl }} style={styles.cakeImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="restaurant-outline" size={80} color="#9CA3AF" />
            </View>
          )}
          {!cake.isAvailable && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Tugagan</Text>
            </View>
          )}
        </View>

        {/* Cake Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoHeader}>
            <Text style={styles.cakeName}>{cake.name}</Text>
            <Text style={styles.cakePrice}>{cake.price?.toLocaleString()} so'm</Text>
          </View>

          {/* Like Button */}
          <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
            <Ionicons 
              name={isLiked ? 'heart' : 'heart-outline'} 
              size={24} 
              color={isLiked ? '#EF4444' : '#6B7280'} 
            />
            <Text style={[styles.likeText, isLiked && styles.likeTextActive]}>
              {totalLikes} like
            </Text>
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tavsif</Text>
            <Text style={styles.description}>{cake.description || 'Tavsif mavjud emas'}</Text>
          </View>

          {/* Details */}
          <View style={styles.detailsGrid}>
            {cake.category && (
              <View style={styles.detailItem}>
                <Ionicons name="pricetag-outline" size={20} color="#6B7280" />
                <Text style={styles.detailLabel}>Kategoriya</Text>
                <Text style={styles.detailValue}>{cake.category}</Text>
              </View>
            )}
            {cake.weight && (
              <View style={styles.detailItem}>
                <Ionicons name="scale-outline" size={20} color="#6B7280" />
                <Text style={styles.detailLabel}>Vazn</Text>
                <Text style={styles.detailValue}>{cake.weight}</Text>
              </View>
            )}
            {cake.ingredients && (
              <View style={styles.detailItem}>
                <Ionicons name="list-outline" size={20} color="#6B7280" />
                <Text style={styles.detailLabel}>Tarkibi</Text>
                <Text style={styles.detailValue}>{cake.ingredients}</Text>
              </View>
            )}
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={[styles.addToCartButton, !cake.isAvailable && styles.addToCartDisabled]}
            onPress={handleAddToCart}
            disabled={!cake.isAvailable}
          >
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={styles.addToCartText}>
              {cake.isAvailable ? 'Savatchaga qo\'shish' : 'Tugagan'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Fikrlar ({comments.length})</Text>
          
          {/* Comment Form */}
          {isAuthenticated && (
            <View style={styles.commentForm}>
              <View style={styles.ratingSelector}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity 
                    key={star} 
                    onPress={() => setCommentRating(star)}
                    style={styles.ratingStar}
                  >
                    <Ionicons 
                      name={star <= commentRating ? 'star' : 'star-outline'} 
                      size={24} 
                      color={star <= commentRating ? '#F59E0B' : '#D1D5DB'} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Fikringizni yozing..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
              </View>
              <TouchableOpacity
                style={[styles.commentButton, commentLoading && styles.commentButtonDisabled]}
                onPress={handleAddComment}
                disabled={commentLoading}
              >
                {commentLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.commentButtonText}>Yuborish</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <Text style={styles.noComments}>Hozircha fikrlar yo'q</Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.user?.name || 'Noma\'lum'}</Text>
                  {comment.rating && (
                    <View style={styles.commentRating}>
                      {[...Array(comment.rating)].map((_, i) => (
                        <Ionicons key={i} name="star" size={14} color="#F59E0B" />
                      ))}
                    </View>
                  )}
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
                <Text style={styles.commentDate}>
                  {new Date(comment.createdAt).toLocaleDateString('uz-UZ')}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerTitle: {
    flex: 1, fontSize: 18, fontWeight: 'bold', color: '#1F2937',
    textAlign: 'center', marginHorizontal: 24,
  },
  headerRight: { width: 24 },
  // Scroll
  scrollView: { flex: 1 },
  // Image
  imageContainer: { position: 'relative' },
  cakeImage: { width: '100%', height: 300 },
  imagePlaceholder: {
    width: '100%', height: 300, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  unavailableBadge: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
  },
  unavailableText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  // Info
  infoContainer: { backgroundColor: '#fff', padding: 16 },
  infoHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  cakeName: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', flex: 1 },
  cakePrice: { fontSize: 20, fontWeight: 'bold', color: '#FF6B6B' },
  likeButton: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingVertical: 8, paddingHorizontal: 12, marginBottom: 16,
  },
  likeText: { marginLeft: 6, fontSize: 14, color: '#6B7280' },
  likeTextActive: { color: '#EF4444', fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  description: { fontSize: 15, color: '#4B5563', lineHeight: 22 },
  // Details Grid
  detailsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8, marginBottom: 20,
  },
  detailItem: {
    width: '33.333%', paddingHorizontal: 8, marginBottom: 12, alignItems: 'center',
  },
  detailLabel: { fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' },
  detailValue: { fontSize: 13, color: '#1F2937', fontWeight: '500', textAlign: 'center', marginTop: 2 },
  // Add to Cart
  addToCartButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FF6B6B', paddingVertical: 16, borderRadius: 14,
    shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  addToCartDisabled: { backgroundColor: '#9CA3AF', shadowColor: 'transparent', elevation: 0 },
  addToCartText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  // Comments
  commentsSection: { backgroundColor: '#fff', padding: 16, marginTop: 1 },
  commentForm: { marginBottom: 20 },
  ratingSelector: { flexDirection: 'row', marginBottom: 10 },
  ratingStar: { marginRight: 4 },
  commentInputContainer: {
    backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1,
    borderColor: '#E5E7EB', marginBottom: 10,
  },
  commentInput: { padding: 12, fontSize: 15, color: '#1F2937', minHeight: 60 },
  commentButton: {
    backgroundColor: '#FF6B6B', paddingVertical: 12, borderRadius: 10, alignItems: 'center',
  },
  commentButtonDisabled: { backgroundColor: '#9CA3AF' },
  commentButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  noComments: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 20 },
  commentItem: {
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  commentHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
  },
  commentAuthor: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  commentRating: { flexDirection: 'row' },
  commentText: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 4 },
  commentDate: { fontSize: 12, color: '#9CA3AF' },
  // Loading/Error
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  errorText: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
});

export default CakeDetailScreen;
