// mobile-app/src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Xato', 'Ism, email va parolni kiriting');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Xato', 'Parollar mos kelmadi');
      return;
    }

    setLoading(true);
    try {
      // ✅ Register API chaqiruvi
      const response = await authAPI.register({ 
        name, 
        email, 
        password, 
        phone: phone || null 
      });
      
      const { user, token } = response.data.data;
      
      // ✅ Token va user ni saqlash
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // ✅ AuthContext ni yangilash (login API chaqirmasdan!)
      login(user, token);
      
    } catch (error) {
      const message = error.response?.data?.message || 'Ro\'yxatdan o\'tishda xato';
      Alert.alert('Ro\'yxatdan o\'tish xato', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="person-add" size={60} color="#FF6B6B" />
          <Text style={styles.title}>Ro'yxatdan o'tish</Text>
          <Text style={styles.subtitle}>Yangi hisob yaratish</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Ismingiz"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Telefon (ixtiyoriy)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Parol"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Parolni tasdiqlang"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Ro'yxatdan o'tish</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
  <Text style={styles.footerText}>Hisobingiz bormi? </Text>
  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
    <Text style={styles.footerLink}>Kirish</Text>
  </TouchableOpacity>
</View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginTop: 12 },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: 4 },
  form: { width: '100%' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 14,
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1F2937' },
  button: {
    backgroundColor: '#FF6B6B', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 12,
    shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#6B7280', fontSize: 16 },
  footerLink: { color: '#FF6B6B', fontSize: 16, fontWeight: 'bold' },
});

export default RegisterScreen;