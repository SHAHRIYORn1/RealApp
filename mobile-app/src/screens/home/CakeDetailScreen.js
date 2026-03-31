// mobile-app/src/screens/home/CakeDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { cakeAPI, commentAPI, likeAPI } from '../../services/api';

const CakeDetailScreen = ({ route, navigation }) => {
  const { cakeId } = route.params;
  const { user, isAuthenticated } = useAuth();
  
  const [cake, setCake] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(null);

  const fetchCakeData = async () => {
    try {
      setLoading(true);
      const [cakeRes, commentsRes] = await Promise.all([
        cakeAPI.getById(cakeId),
        commentAPI.getByCake(cakeId, { limit: 50 })
      ]);
      
      setCake(cakeRes.data?.data?.cake || null);
      setComments(commentsRes.data?.data?.comments || []);
      
      if (isAuthenticated) {
        const likeRes = await likeAPI.check(cakeId);
        setIsLiked(likeRes.data?.data?.isLiked || false);
        setTotalLikes(likeRes.data?.data?.totalLikes || 0);
      }
    } catch (error) {
      console.error('Data yuklashda xato:', error);
      Alert.alert('Xato', 'Ma\'lumotlarni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCakeData();
  }, [cakeId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCakeData();
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      Alert.alert('Kirish kerak', 'Like bosish uchun tizimga kiring', [
        { text: 'Bekor qilish', style: 'cancel' },
        { text: 'Kirish', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    try {
      const response = await likeAPI.toggle(cakeId);
      setIsLiked(response.data?.data?.isLiked || false);
      setTotalLikes(response.data?.data?.totalLikes || 0);
    } catch (error) {
      Alert.alert('Xato', 'Like bosishda xato');
    }
  };

// ✅ Comment qo'shish — yaxshilangan xato xabarlari
const handleAddComment = async () => {
  if (!isAuthenticated) {
    Alert.alert('Kirish kerak', 'Fikr qoldirish uchun tizimga kiring', [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: 'Kirish', onPress: () => navigation.navigate('Login') }
    ]);
    return;
  }

  if (!commentText.trim()) {
    Alert.alert('Xato', 'Fikr matni bo\'sh bo\'lishi mumkin emas');
    return;
  }

  try {
    const response = await commentAPI.create(cakeId, {
      text: commentText,
      rating: rating || null
    });

    if (response.data.success) {
      setComments([response.data.data.comment, ...comments]);
      setCommentText('');
      setRating(null);
      Alert.alert('✅ Muvaffaqiyat', 'Fikringiz qo\'shildi');
    }
  } catch (error) {
    // ✅ User-friendly xato xabarlari
    const errorCode = error.response?.status;
    const errorMsg = error.response?.data?.message;
    
    if (errorCode === 400) {
      if (errorMsg?.includes('2 ta fikr')) {
        Alert.alert('ℹ️ Cheklov', 'Siz bu tortga allaqachon 2 ta fikr qoldirgansiz.\nBoshqa tortlarga fikr yozishingiz mumkin.');
        return;
      }
      if (errorMsg?.includes('matni majburiy')) {
        Alert.alert('Xato', 'Fikr matni bo\'sh bo\'lishi mumkin emas');
        return;
      }
      if (errorMsg?.includes('Rating')) {
        Alert.alert('Xato', 'Rating 1 dan 5 gacha bo\'lishi kerak');
        return;
      }
    }
    
    // Boshqa xatolar uchun
    Alert.alert('Xato', errorMsg || 'Fikr qo\'shishda xato');
  }
};

  const handleDeleteComment = (commentId) => {
    Alert.alert(
      'Fikrni o\'chirish',
      'Bu fikrni o\'chirmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Ha, o\'chirish',
          style: 'destructive',
          onPress: async () => {
            try {
              await commentAPI.delete(commentId);
              setComments(comments.filter(c => c.id !== commentId));
              Alert.alert('O\'chirildi', 'Fikr o\'chirildi');
            } catch (error) {
              Alert.alert('Xato', 'O\'chirishda xato');
            }
          }
        }
      ]
    );
  };

  // ✅ Report comment funksiyasi
  const handleReportComment = (commentId) => {
    Alert.alert(
      'Fikrni shikoyat qilish',
      'Bu fikrni nima uchun shikoyat qilmoqchisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Spam',
          onPress: () => submitReport(commentId, 'Spam reklama')
        },
        {
          text: 'Haqorat',
          onPress: () => submitReport(commentId, 'Haqoratli so\'zlar')
        },
        {
          text: 'Yolg\'on',
          onPress: () => submitReport(commentId, 'Yolg\'on ma\'lumot')
        },
        {
          text: 'Boshqa',
          onPress: () => submitReport(commentId, 'Boshqa sabab')
        }
      ]
    );
  };

  // ✅ Report yuborish
// ✅ Report yuborish — yaxshilangan xato xabarlari
const submitReport = async (commentId, reason) => {
  try {
    const response = await commentAPI.report(commentId, reason);
    
    if (response.data.autoDeleted) {
      Alert.alert(
        '✅ Shikoyat qabul qilindi',
        'Bu fikr avtomatik o\'chirildi (3 ta shikoyat tushdi)'
      );
      setComments(prev => prev.filter(c => c.id !== commentId));
    } else {
      Alert.alert(
        '✅ Shikoyat qabul qilindi',
        'Rahmat! ' + response.data.reportCount + '/3 ta shikoyat tushdi.\n3 ta bo\'lganda avtomatik o\'chiriladi.'
      );
    }
  } catch (error) {
    // ✅ User-friendly xato xabarlari
    const errorCode = error.response?.status;
    const errorMsg = error.response?.data?.message;
    
    if (errorCode === 400) {
      if (errorMsg?.includes('allaqachon shikoyat')) {
        Alert.alert('ℹ️ Eslatma', 'Siz oldin bu fikrga shikoyat bergansiz');
        return;
      }
      if (errorMsg?.includes('o\'z fikringizni')) {
        Alert.alert('ℹ️ Eslatma', 'O\'z fikringizni shikoyat qila olmaysiz');
        return;
      }
    }
    
    // Boshqa xatolar uchun
    Alert.alert('Xato', errorMsg || 'Shikoyat yuborishda xato');
  }
};

  const renderComment = ({ item }) => {
    const isOwner = item.userId === user?.id;
    const isAdmin = user?.role === 'ADMIN';
    const reportCount = item._count?.reports || 0;

    return (
      <View style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUser}>
            <Ionicons name="person-circle" size={32} color="#FF6B6B" />
            <View style={styles.commentUserInfo}>
              <Text style={styles.commentUserName}>{item.user?.name || 'Anonymous'}</Text>
              <Text style={styles.commentDate}>
                {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
              </Text>
            </View>
          </View>
          
          <View style={styles.commentActions}>
            {/* ✅ REPORT TUGMASI (o'z commentini emas) */}
            {!isOwner && (
              <TouchableOpacity 
                style={styles.reportButton}
                onPress={() => handleReportComment(item.id)}
              >
                <Ionicons name="flag-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
            
            {/* DELETE tugmasi (faqat owner yoki admin) */}
            {(isOwner || isAdmin) && (
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteComment(item.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <Text style={styles.commentText}>{item.text}</Text>
        
        {item.rating && (
          <View style={styles.commentRating}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.commentRatingText}>{item.rating}/5</Text>
          </View>
        )}

        {/* Shikoyatlar soni (agar bo'lsa) */}
        {reportCount > 0 && (
          <View style={styles.reportCount}>
            <Ionicons name="warning" size={12} color="#F59E0B" />
            <Text style={styles.reportCountText}>{reportCount} ta shikoyat</Text>
          </View>
        )}
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Tort Tafsilotlari</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
      >
        {/* Cake Image */}
        {cake?.imageUrl ? (
          <Image source={{ uri: cake.imageUrl }} style={styles.cakeImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="restaurant-outline" size={80} color="#D1D5DB" />
          </View>
        )}

        {/* Cake Info */}
        <View style={styles.cakeInfo}>
          <Text style={styles.cakeName}>{cake?.name || 'Noma\'lum'}</Text>
          <Text style={styles.cakePrice}>{cake?.price?.toLocaleString()} so'm</Text>
          
          <View style={styles.cakeDetails}>
            {cake?.category && (
              <View style={styles.detailBadge}>
                <Ionicons name="pricetag" size={16} color="#FF6B6B" />
                <Text style={styles.detailText}>{cake.category}</Text>
              </View>
            )}
            {cake?.weight && (
              <View style={styles.detailBadge}>
                <Ionicons name="scale" size={16} color="#FF6B6B" />
                <Text style={styles.detailText}>{cake.weight}</Text>
              </View>
            )}
          </View>

          {/* Vazn va Tarkibi */}
          {cake?.weight && (
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>⚖️ Vazn</Text>
              <Text style={styles.infoText}>{cake.weight}</Text>
            </View>
          )}
          
          {cake?.ingredients && (
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>🥘 Tarkibi</Text>
              <Text style={styles.infoText}>{cake.ingredients}</Text>
            </View>
          )}

          {cake?.description && (
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>📝 Tavsif</Text>
              <Text style={styles.infoText}>{cake.description}</Text>
            </View>
          )}

          {/* Like Button */}
          <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
            <Ionicons 
              name={isLiked ? 'heart' : 'heart-outline'} 
              size={24} 
              color={isLiked ? '#EF4444' : '#6B7280'} 
            />
            <Text style={[styles.likeText, isLiked && styles.likedText]}>
              {totalLikes} ta like
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>💬 Fikrlar ({comments.length})</Text>
          
          {comments.length === 0 ? (
            <View style={styles.noComments}>
              <Ionicons name="chatbubbles-outline" size={50} color="#D1D5DB" />
              <Text style={styles.noCommentsText}>Hozircha fikrlar yo'q</Text>
              <Text style={styles.noCommentsSubtext}>Birinchi bo'lib fikr qoldiring!</Text>
            </View>
          ) : (
            comments.map((comment, index) => (
              <View key={comment.id}>
                {renderComment({ item: comment })}
                {index < comments.length - 1 && <View style={styles.commentDivider} />}
              </View>
            ))
          )}
        </View>

        {/* Add Comment */}
        {isAuthenticated && (
          <View style={styles.addCommentSection}>
            <Text style={styles.addCommentTitle}>Fikr qoldirish</Text>
            
            {/* Rating */}
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rating:</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons 
                      name={star <= (rating || 0) ? 'star' : 'star-outline'} 
                      size={28} 
                      color={star <= (rating || 0) ? '#F59E0B' : '#D1D5DB'} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TextInput
              style={styles.commentInput}
              placeholder="Fikringizni yozing..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
              numberOfLines={3}
            />
            
            <TouchableOpacity style={styles.submitButton} onPress={handleAddComment}>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Yuborish</Text>
            </TouchableOpacity>
          </View>
        )}

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
  cakeImage: { width: '100%', height: 250 },
  imagePlaceholder: {
    width: '100%', height: 250, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  cakeInfo: { backgroundColor: '#fff', padding: 16 },
  cakeName: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  cakePrice: { fontSize: 22, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 12 },
  cakeDetails: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  detailBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, marginRight: 8, marginBottom: 8,
  },
  detailText: { color: '#FF6B6B', fontSize: 13, marginLeft: 4 },
  infoSection: { marginBottom: 16 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 6 },
  infoText: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  likeButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F9FAFB', paddingVertical: 12, borderRadius: 12, marginTop: 8,
  },
  likeText: { fontSize: 15, color: '#6B7280', marginLeft: 8 },
  likedText: { color: '#EF4444', fontWeight: '600' },
  commentsSection: { backgroundColor: '#fff', padding: 16, marginTop: 1 },
  commentsTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  noComments: { alignItems: 'center', paddingVertical: 30 },
  noCommentsText: { fontSize: 16, color: '#6B7280', marginTop: 12 },
  noCommentsSubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  commentCard: { paddingVertical: 12 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  commentUser: { flexDirection: 'row', alignItems: 'center' },
  commentUserInfo: { marginLeft: 10 },
  commentUserName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  commentDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  commentActions: { flexDirection: 'row', alignItems: 'center' },
  reportButton: { padding: 6, backgroundColor: '#FEE2E2', borderRadius: 6, marginRight: 8 },
  deleteButton: { padding: 6, backgroundColor: '#F3F4F6', borderRadius: 6 },
  commentText: { fontSize: 14, color: '#1F2937', lineHeight: 20, marginBottom: 8 },
  commentRating: { flexDirection: 'row', alignItems: 'center' },
  commentRatingText: { fontSize: 13, color: '#F59E0B', marginLeft: 4, fontWeight: '600' },
  reportCount: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  reportCountText: { fontSize: 11, color: '#F59E0B', marginLeft: 4 },
  commentDivider: { height: 1, backgroundColor: '#F3F4F6', marginTop: 12 },
  addCommentSection: { backgroundColor: '#fff', padding: 16, marginTop: 1 },
  addCommentTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingLabel: { fontSize: 14, color: '#6B7280', marginRight: 12 },
  stars: { flexDirection: 'row' },
  commentInput: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#1F2937', minHeight: 80, textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FF6B6B', paddingVertical: 14, borderRadius: 12,
  },
  submitButtonText: { color: '#fff', fontWeight: '600', fontSize: 15, marginLeft: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
});

export default CakeDetailScreen;