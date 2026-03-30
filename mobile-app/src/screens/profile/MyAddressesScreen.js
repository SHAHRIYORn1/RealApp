// mobile-app/src/screens/profile/MyAddressesScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';

const MyAddressesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
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
      await userAPI.updateProfile({ 
        phone: phone.trim(), 
        address: address.trim() 
      });
      
      Alert.alert('✅ Saqlandi', 'Manzilingiz muvaffaqiyatli saqlandi!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Saqlash xatosi:', error);
      Alert.alert('Xato', 'Saqlashda xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mening manzillarim</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="location" size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.infoTitle}>Asosiy manzil</Text>
            <Text style={styles.infoSubtitle}>
              Yetkazib berish uchun asosiy manzilingiz
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Manzil *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ko'cha, uy, kvartira..."
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={4}
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

          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Saqlash</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.hintCard}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.hintText}>
              Manzilingizni to'liq kiriting, shunda yetkazib beruvchi sizni tezroq topadi.
            </Text>
          </View>
        </View>
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
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginRight: 24 },
  // Scroll
  scrollView: { flex: 1 },
  content: { padding: 16 },
  // Info Card
  infoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  infoIcon: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  infoSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  // Input
  inputGroup: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  inputLabel: { fontSize: 14, color: '#6B7280', marginBottom: 10, fontWeight: '500' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#1F2937' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  // Save Button
  saveButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FF6B6B', paddingVertical: 16, borderRadius: 16,
    shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    marginBottom: 20,
  },
  saveButtonDisabled: { backgroundColor: '#9CA3AF', shadowColor: 'transparent', elevation: 0 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  // Hint Card
  hintCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF',
    padding: 14, borderRadius: 12,
  },
  hintText: { fontSize: 14, color: '#3B82F6', marginLeft: 10, flex: 1 },
});

export default MyAddressesScreen;