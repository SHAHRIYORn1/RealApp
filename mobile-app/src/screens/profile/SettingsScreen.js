// mobile-app/src/screens/profile/SettingsScreen.js
import React, { useState } from 'react';  // ✅ useState import qilindi!
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

const SettingsScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Ism', 'Iltimos, ismingizni kiriting');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Profil yangilash:', { 
        name: name.trim(), 
        phone: phone.trim(), 
        address: address.trim() 
      });
      
      const response = await userAPI.updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
      });
      
      console.log('📥 Javob:', response.data);
      
      if (response.data.success) {
        // ✅ UI darhol yangilanadi
        await updateUser({
          name: name.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
        });
        
        Alert.alert('✅ Saqlandi', 'Ma\'lumotlaringiz muvaffaqiyatli yangilandi!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(response.data.message || 'Saqlashda xato');
      }
    } catch (error) {
      console.error('❌ Saqlash xatosi:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Saqlashda xato yuz berdi';
      Alert.alert('Xato', errorMsg);
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
        <Text style={styles.headerTitle}>Sozlamalar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profil ma'lumotlari</Text>
            <Text style={styles.sectionSubtitle}>
              Shaxsiy ma'lumotlaringizni yangilang
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ism *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ismingiz"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={user?.email || ''}
                editable={false}
              />
            </View>
            <Text style={styles.hintText}>Emailni o'zgartirib bo'lmaydi</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefon</Text>
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

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Manzil</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Manzilingiz"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
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
                <Text style={styles.saveButtonText}>O'zgarishlarni saqlash</Text>
              </>
            )}
          </TouchableOpacity>
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
  // Section
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  sectionSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
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
  disabledInput: { color: '#9CA3AF', backgroundColor: '#F3F4F6' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  hintText: { fontSize: 12, color: '#9CA3AF', marginTop: 6 },
  // Save Button
  saveButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FF6B6B', paddingVertical: 16, borderRadius: 16,
    shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    marginTop: 10,
  },
  saveButtonDisabled: { backgroundColor: '#9CA3AF', shadowColor: 'transparent', elevation: 0 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
});

export default SettingsScreen;