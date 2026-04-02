// mobile-app/src/screens/order/CartScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/api';

const CartScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Yetkazib berish ma'lumotlari
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+998');
  const [additionalInfo, setAdditionalInfo] = useState(''); // Qo'shimcha ma'lumot
  const [note, setNote] = useState(''); // Izoh
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartJson = await AsyncStorage.getItem('cart');
      const cart = cartJson ? JSON.parse(cartJson) : [];
      setCartItems(cart);
    } catch (error) {
      console.error('Savatni yuklashda xato:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (index, change) => {
    const newCart = [...cartItems];
    const newQuantity = newCart[index].quantity + change;
    
    if (newQuantity < 1) {
      // Agar 1 dan kam bo'lsa, o'chirishni so'rash
      removeItem(index);
      return;
    }

    newCart[index].quantity = newQuantity;
    setCartItems(newCart);
    
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Savatni yangilashda xato:', error);
    }
  };

  const removeItem = (index) => {
    Alert.alert(
      'O\'chirish',
      'Bu tortni savatdan o\'chirmoqchimisiz?',
      [
        { text: 'Yo\'q', style: 'cancel' },
        {
          text: 'Ha',
          style: 'destructive',
          onPress: async () => {
            const newCart = [...cartItems];
            newCart.splice(index, 1);
            setCartItems(newCart);
            try {
              await AsyncStorage.setItem('cart', JSON.stringify(newCart));
            } catch (error) {
              console.error('O\'chirishda xato:', error);
            }
          }
        }
      ]
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // ✅ Telefon validatsiyasi
  const validatePhone = (text) => {
    // +998 va 9 ta raqam bo'lishi kerak
    return /^\+998\d{9}$/.test(text);
  };

  const handleOrder = async () => {
    if (!isAuthenticated) {
      Alert.alert('Kirish kerak', 'Buyurtma berish uchun tizimga kiring', [
        { text: 'Bekor qilish' },
        { text: 'Kirish', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Savat bo\'sh', 'Iltimos, avval tortlarni tanlang.');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Manzil kerak', 'Iltimos, yetkazib berish manzilini kiriting.');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Telefon noto\'g\'ri', 'Telefon raqam +998 bilan boshlanishi va 12 ta belgidan iborat bo\'lishi kerak.\nMisol: +998901234567');
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        address: address.trim(),
        phone: phone.trim(),
        note: note.trim() || null,
        additionalInfo: additionalInfo.trim() || null,
        items: cartItems.map(item => ({
          cakeId: item.cakeId,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await orderAPI.create(orderData);

      if (response.data.success) {
        await AsyncStorage.removeItem('cart');
        Alert.alert(
          '✅ Buyurtma qabul qilindi!',
          `Buyurtmangiz muvaffaqiyatli yuborildi.\nTez orada siz bilan bog'lanamiz!`,
          [
            {
              text: 'Bosh sahifa',
              onPress: () => navigation.navigate('MainTabs', { screen: 'Home' })
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Xato', error.response?.data?.message || 'Buyurtma berishda xato yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Savatcha</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 200 }}>
        
        {/* 1. Savatdagi mahsulotlar */}
        {cartItems.length > 0 ? (
          <View style={styles.cartList}>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.cartItem}>
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()} so'm</Text>
                </View>
                
                <View style={styles.itemControls}>
                  <TouchableOpacity 
                    style={styles.qtyBtn} 
                    onPress={() => updateQuantity(index, -1)}
                  >
                    <Ionicons name="remove" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                  
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  
                  <TouchableOpacity 
                    style={styles.qtyBtn} 
                    onPress={() => updateQuantity(index, 1)}
                  >
                    <Ionicons name="add" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={() => removeItem(index)}
                >
                  <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCart}>
            <Ionicons name="cart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Savatingiz bo'sh</Text>
            <TouchableOpacity 
              style={styles.browseBtn}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Text style={styles.browseText}>Tortlarni ko'rish</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 2. Yetkazib berish formasi (Rasmdagi qism) */}
        {cartItems.length > 0 && (
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryHeader}>
              <Ionicons name="location" size={24} color="#FF6B6B" />
              <Text style={styles.deliveryTitle}>Yetkazib berish</Text>
            </View>

            {/* Manzil */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Manzil *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Ko'cha, uy, kvartira..."
                  value={address}
                  onChangeText={setAddress}
                  multiline
                />
              </View>
            </View>

            {/* Telefon */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Qo'shimcha ma'lumot */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Qo'shimcha ma'lumot (Ixtiyoriy)</Text>
              <View style={styles.textAreaContainer}>
                <Ionicons name="map-outline" size={20} color="#888" style={{ marginRight: 10, marginTop: 10 }} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Agar manzilingizni kiritsangiz, sizni tezroq topamiz (Ixtiyoriy)"
                  value={additionalInfo}
                  onChangeText={setAdditionalInfo}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Izoh */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Izoh (Ixtiyoriy)</Text>
              <View style={styles.textAreaContainer}>
                <Ionicons name="chatbubble-outline" size={20} color="#888" style={{ marginRight: 10, marginTop: 10 }} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Buyurtma bo'yicha qo'shimcha izoh..."
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Pastki qism: Jami va Buyurtma berish */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Jami:</Text>
            <Text style={styles.totalPrice}>{getTotalPrice().toLocaleString()} so'm</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.orderBtn, submitting && styles.orderBtnDisabled]} 
            onPress={handleOrder}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.orderBtnText}>Buyurtma berish</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: '#eee', marginTop: Platform.OS === 'android' ? 30 : 0
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },

  // Content
  scrollView: { flex: 1 },
  
  // Cart Items
  cartList: { padding: 16 },
  cartItem: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12,
    marginBottom: 12, alignItems: 'center', elevation: 2
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  itemPrice: { fontSize: 15, fontWeight: 'bold', color: '#FF6B6B' },
  
  itemControls: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5',
    borderRadius: 8, padding: 4, marginRight: 12
  },
  qtyBtn: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 10, minWidth: 20, textAlign: 'center' },
  
  deleteBtn: { padding: 5 },

  // Empty Cart
  emptyCart: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, color: '#888', marginTop: 16, marginBottom: 24 },
  browseBtn: { backgroundColor: '#FF6B6B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  browseText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Delivery Card (Rasmdagi qism)
  deliveryCard: {
    backgroundColor: '#fff', margin: 16, marginTop: 0, borderRadius: 16,
    padding: 16, elevation: 3
  },
  deliveryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  deliveryTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 8 },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '500' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12
  },
  textAreaContainer: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingTop: 10
  },
  input: { flex: 1, height: 44, color: '#333', fontSize: 15 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 0 },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1, borderTopColor: '#eee', elevation: 10
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 18, color: '#666' },
  totalPrice: { fontSize: 20, fontWeight: 'bold', color: '#FF6B6B' },
  
  orderBtn: {
    backgroundColor: '#FF6B6B', borderRadius: 12, paddingVertical: 16, alignItems: 'center'
  },
  orderBtnDisabled: { backgroundColor: '#ccc' },
  orderBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default CartScreen;