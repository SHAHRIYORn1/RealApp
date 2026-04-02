// mobile-app/src/screens/profile/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';

const SettingsScreen = ({ navigation }) => {
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form fields — user ma'lumotlari bilan to'ldiriladi
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+998');
  const [address, setAddress] = useState(user?.address || '');
  
  // ✅ Validatsiya funksiyalari
  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const validatePhone = (phone) => {
    const re = /^\+998\d{9}$/;
    return re.test(phone);
  };

  const validateAddress = (address) => {
    return address.trim().length >= 10 || address.trim().length === 0;
  };

  const handleSave = async () => {
    // 1. Ism tekshiruvi
    if (!validateName(name)) {
      Alert.alert('Xato', 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak');
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

    // 3. Manzil tekshiruvi (ixtiyoriy)
    if (!validateAddress(address)) {
      Alert.alert(
        'Manzil noto\'g\'ri',
        'Manzil kamida 10 ta belgidan iborat bo\'lishi kerak (yoki bo\'sh qoldiring).\n\nMisol: Toshkent sh, Chilonzor tumani',
        [{ text: 'Tushunarli' }]
      );
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || null,
      });

      if (response.data.success) {
        // ✅ Context ni yangilash
        const updatedUser = response.data.data.user;
        await updateUser(updatedUser);
        
        // ✅ Success alert va Profile ga qaytish
        Alert.alert(
          '✅ Saqlandi',
          'Profil ma\'lumotlaringiz muvaffaqiyatli yangilandi',
          [
            {
              text: 'OK',
              onPress: () => {
                // ✅ Profile sahifasiga qaytish (isMounted check bilan)
                if (navigation.isFocused()) {
                  navigation.goBack();
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Xato', error.response?.data?.message || 'Profilni yangilashda xato');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Chiqish',
      'Haqiqatan ham chiqmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Ha, chiqish',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // ✅ Login ekraniga qaytish
            if (navigation.isFocused()) {
              navigation.replace('Login');
            }
          }
        }
      ]
    );
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
        <Text style={styles.headerTitle}>Sozlamalar</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color="#fff" />
          </View>
          <Text style={styles.userName}>{user?.name || 'Foydalanuvchi'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Ism */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ism *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#888" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Ismingiz"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email (O'qilmaydigan) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (o'zgartirib bo'lmaydi)</Text>
            <View style={[styles.inputContainer, styles.disabledInput]}>
              <Ionicons name="mail-outline" size={20} color="#888" style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: '#888' }]}
                value={user?.email}
                editable={false}
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
                maxLength={13}
              />
            </View>
            <Text style={styles.hintText}>+998 bilan boshlanishi va 12 ta belgi bo'lishi kerak</Text>
          </View>

          {/* Manzil */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Manzil (ixtiyoriy)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#888" style={{ marginRight: 10, marginTop: 10 }} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Toshkent sh, Chilonzor tumani..."
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
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
                <Ionicons name="save-outline" size={22} color="#fff" />
                <Text style={styles.saveBtnText}>Saqlash</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Chiqish tugmasi */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.logoutBtnText}>Chiqish</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: '#eee', marginTop: Platform.OS === 'android' ? 30 : 0
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  avatarSection: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#fff', marginTop: 8, borderRadius: 16 },
  avatar: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#FF6B6B',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  userEmail: { fontSize: 15, color: '#888' },
  
  form: { padding: 16 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, height: 52
  },
  disabledInput: { backgroundColor: '#F5F5F5' },
  input: { flex: 1, color: '#333', fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  hintText: { fontSize: 13, color: '#888', marginTop: 6, marginLeft: 4 },
  
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FF6B6B', borderRadius: 12, paddingVertical: 16, marginTop: 10
  },
  saveBtnDisabled: { backgroundColor: '#ccc' },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#EF4444',
    borderRadius: 12, paddingVertical: 16, marginTop: 12
  },
  logoutBtnText: { color: '#EF4444', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
});

export default SettingsScreen;