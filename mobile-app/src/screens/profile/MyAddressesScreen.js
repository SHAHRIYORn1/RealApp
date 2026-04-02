// mobile-app/src/screens/profile/MyAddressesScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyAddressesScreen = ({ navigation, route }) => {
  const { onSave } = route.params || {};
  
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+998');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Telefon validatsiyasi
  const validatePhone = (phone) => {
    const re = /^\+998\d{9}$/;
    return re.test(phone);
  };

  // ✅ Manzil validatsiyasi
  const validateAddress = (address) => {
    return address.trim().length >= 10;
  };

  const handleSave = async () => {
    // 1. Manzil tekshiruvi
    if (!validateAddress(address)) {
      Alert.alert(
        'Manzil noto\'g\'ri',
        'Manzil kamida 10 ta belgidan iborat bo\'lishi kerak.\n\nMisol:\nToshkent sh, Chilonzor tumani, 12-kvartal, 45-uy',
        [{ text: 'Tushunarli' }]
      );
      return;
    }

    // 2. Telefon tekshiruvi
    if (!validatePhone(phone)) {
      Alert.alert(
        'Telefon raqam noto\'g\'ri',
        'Telefon raqam quyidagicha bo\'lishi kerak:\n\n✅ +998 bilan boshlanishi\n✅ Jami 12 ta belgi (+998 + 9 ta raqam)\n\nMisol: +998901234567',
        [{ text: 'Tushunarli' }]
      );
      return;
    }

    setLoading(true);

    const addressData = {
      address: address.trim(),
      phone: phone.trim(),
      additionalInfo: additionalInfo.trim() || null,
      note: note.trim() || null,
    };

    // Agar onSave funksiyasi berilgan bo'lsa (CartScreen dan)
    if (onSave) {
      onSave(addressData);
      navigation.goBack();
    } else {
      // Saqlash (AsyncStorage ga)
      try {
        await AsyncStorage.setItem('userAddress', JSON.stringify(addressData));
        Alert.alert('✅ Saqlandi', 'Manzilingiz muvaffaqiyatli saqlandi');
        navigation.goBack();
      } catch (error) {
        Alert.alert('Xato', 'Saqlashda xato yuz berdi');
      }
    }

    setLoading(false);
  };

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
        <Text style={styles.headerTitle}>Manzil kiritish</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Manzil */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Manzil *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#888" style={{ marginRight: 10, marginTop: 10 }} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ko'cha, uy, kvartira..."
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />
          </View>
          <Text style={styles.hintText}>Kamida 10 ta belgi bo'lishi kerak</Text>
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
              maxLength={13}
            />
          </View>
          <Text style={styles.hintText}>+998 bilan boshlanishi va 12 ta belgi bo'lishi kerak</Text>
        </View>

        {/* Qo'shimcha ma'lumot */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Qo'shimcha ma'lumot (Ixtiyoriy)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="map-outline" size={20} color="#888" style={{ marginRight: 10, marginTop: 10 }} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Uy oldi, 2-qavat, domofon 123..."
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Izoh */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Buyurtma bo'yicha izoh (Ixtiyoriy)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="chatbubble-outline" size={20} color="#888" style={{ marginRight: 10, marginTop: 10 }} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Buyurtma bo'yicha qo'shimcha izoh..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Saqlash tugmasi */}
        <TouchableOpacity 
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.saveBtnText}>Saqlash va davom etish</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: '#eee', marginTop: 30
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingTop: 10
  },
  input: { flex: 1, minHeight: 50, color: '#333', fontSize: 16 },
  textArea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 0 },
  hintText: { fontSize: 13, color: '#888', marginTop: 6, marginLeft: 4 },
  
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FF6B6B', borderRadius: 12, paddingVertical: 16, marginTop: 20
  },
  saveBtnDisabled: { backgroundColor: '#ccc' },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
});

export default MyAddressesScreen;