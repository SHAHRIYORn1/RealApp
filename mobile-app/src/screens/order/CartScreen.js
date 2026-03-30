// mobile-app/src/screens/order/CartScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { orderAPI } from '../../services/api';

const CartScreen = ({ navigation }) => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState(''); // Qo'shimcha manzil
  const [orderNote, setOrderNote] = useState(''); // Buyurtma izohi
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    // 1. Autentifikatsiya
    if (!isAuthenticated) {
      Alert.alert(
        'Kirish kerak',
        'Buyurtma berish uchun tizimga kiring',
        [
          { text: 'Bekor qilish', style: 'cancel' },
          { text: 'Kirish', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    // 2. Savatcha bo'shligi
    if (cartItems.length === 0) {
      Alert.alert('Savatcha bo\'sh', 'Buyurtma berish uchun savatchaga tort qo\'shing');
      return;
    }

    // 3. Manzil va telefon
    if (!address.trim()) {
      Alert.alert('Manzil', 'Iltimos, manzilni kiriting');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Telefon', 'Iltimos, telefon raqamini kiriting');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        address: address.trim(),
        phone: phone.trim(),
        note: orderNote.trim() || null,
        additionalInfo: additionalInfo.trim() || null,
        items: cartItems.map(item => ({
          cakeId: parseInt(item.cakeId),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        })),
      };

      console.log('📦 Buyurtma yuborilmoqda:', orderData);

      const response = await orderAPI.create(orderData);
      console.log('✅ Buyurtma muvaffaqiyatli:', response.data);

      // Savatchani tozalash
      clearCart();

      Alert.alert(
        '✅ Muvaffaqiyat!',
        'Buyurtmangiz qabul qilindi!\nTez orada siz bilan bog\'lanamiz.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Buyurtma xatosi:', error.response?.data || error);
      
      const errorMessage = error.response?.data?.message || 'Buyurtma berishda xato';
      Alert.alert('Xato', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Savatcha bo'sh bo'lsa
  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Savatcha</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart-outline" size={60} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>Savatcha bo'sh</Text>
          <Text style={styles.emptySubtitle}>
            Xohlagan tortlaringizni tanlang va savatchaga qo'shing
          </Text>

          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Tortlarni ko'rish</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.headerTitle}>Savatcha</Text>
        <View style={styles.headerRight}>
          <Text style={styles.itemCount}>{cartItems.length} ta</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.itemsSection}>
          {cartItems.map((item, index) => (
            <View key={item.cakeId}>
              <View style={styles.cartItem}>
                <View style={styles.itemImageContainer}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.itemImagePlaceholder}>
                      <Ionicons name="restaurant-outline" size={30} color="#9CA3AF" />
                    </View>
                  )}
                </View>

                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price.toLocaleString()} so'm</Text>

                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.cakeId, -1)}
                    >
                      <Ionicons name="remove" size={18} color="#1F2937" />
                    </TouchableOpacity>

                    <Text style={styles.quantityValue}>{item.quantity}</Text>

                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.cakeId, 1)}
                    >
                      <Ionicons name="add" size={18} color="#1F2937" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFromCart(item.cakeId)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              {index < cartItems.length - 1 && <View style={styles.itemDivider} />}
            </View>
          ))}
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Yetkazib berish</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Manzil *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ko'cha, uy, kvartira..."
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefon *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="+998 90 123 45 67"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* ✅ Qo'shimcha manzil (ixtiyoriy) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Qo'shimcha ma'lumot (Ixtiyoriy)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="map-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Agar manzilingizni kiritsangiz, sizni tezroq topamiz (Ixtiyoriy)"
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* ✅ Buyurtma izohi (ixtiyoriy) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Izoh (Ixtiyoriy)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="chatbubble-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Buyurtma bo'yicha qo'shimcha izoh..."
                value={orderNote}
                onChangeText={setOrderNote}
                multiline
              />
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>To'lov</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Mahsulotlar</Text>
            <Text style={styles.summaryValue}>{totalAmount.toLocaleString()} so'm</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Yetkazib berish</Text>
            <Text style={styles.summaryValueFree}>Bepul</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Jami</Text>
            <Text style={styles.summaryTotalAmount}>{totalAmount.toLocaleString()} so'm</Text>
          </View>
        </View>

        {/* Checkout Button */}
        <View style={styles.checkoutContainer}>
          <TouchableOpacity
            style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
            onPress={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="bag-check" size={20} color="#fff" />
                <Text style={styles.checkoutButtonText}>Buyurtma berish</Text>
              </>
            )}
          </TouchableOpacity>
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
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: 4 },
  headerTitle: {
    flex: 1, fontSize: 20, fontWeight: 'bold', color: '#1F2937',
    textAlign: 'center', marginRight: 24,
  },
  headerRight: { width: 24, alignItems: 'flex-end' },
  itemCount: { fontSize: 14, color: '#FF6B6B', fontWeight: '600' },
  // Scroll
  scrollView: { flex: 1 },
  // Items Section
  itemsSection: {
    backgroundColor: '#fff', marginTop: 16, marginHorizontal: 16,
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  cartItem: { flexDirection: 'row', padding: 16 },
  itemDivider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 66 },
  itemImageContainer: {
    width: 66, height: 66, borderRadius: 12,
    backgroundColor: '#F3F4F6', overflow: 'hidden',
  },
  itemImage: { width: '100%', height: '100%' },
  itemImagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  itemDetails: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 8 },
  quantityControl: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  quantityValue: { marginHorizontal: 16, fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  removeButton: { marginLeft: 'auto', padding: 8 },
  // Empty State
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  browseButton: {
    backgroundColor: '#FF6B6B', paddingHorizontal: 40, paddingVertical: 16,
    borderRadius: 14, shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  browseButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  // Section
  section: {
    backgroundColor: '#fff', marginTop: 16, marginHorizontal: 16,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginLeft: 8 },
  // Input
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, color: '#6B7280', marginBottom: 8, fontWeight: '500' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#1F2937' },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top', fontSize: 14 },
  // Summary
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryLabel: { fontSize: 15, color: '#6B7280' },
  summaryValue: { fontSize: 15, color: '#1F2937', fontWeight: '600' },
  summaryValueFree: { fontSize: 15, color: '#10B981', fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  summaryTotal: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  summaryTotalAmount: { fontSize: 22, fontWeight: 'bold', color: '#FF6B6B' },
  // Checkout
  checkoutContainer: { marginHorizontal: 16, marginTop: 24, marginBottom: 16 },
  checkoutButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FF6B6B', paddingVertical: 18, borderRadius: 16,
    shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  checkoutButtonDisabled: { backgroundColor: '#9CA3AF', shadowColor: 'transparent', elevation: 0 },
  checkoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 8 },
  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
});

export default CartScreen;