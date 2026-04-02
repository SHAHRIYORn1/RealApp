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
  const [phone, setPhone] = useState('+998'); // Avtomatik +998 bilan boshlanadi
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();

  // 1. Email Validatsiyasi
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // 2. Telefon Validatsiyasi (Realistik)
  const validatePhone = (phone) => {
    // +998 bilan boshlanishi va undan keyin 9 ta raqam bo'lishi kerak
    const re = /^\+998\d{9}$/;
    return re.test(phone);
  };

  const handleRegister = async () => {
    // --- Tekshiruvlar (Validatsiya) ---

    // 1. Ism tekshiruvi
    if (!name.trim()) {
      Alert.alert('Xato', 'Ismni kiriting');
      return;
    }
    if (name.trim().length < 2) {
      Alert.alert('Xato', 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    // 2. Email tekshiruvi
    if (!validateEmail(email)) {
      Alert.alert('Xato', 'Iltimos, to\'g\'ri email formatini kiriting (masalan: user@gmail.com)');
      return;
    }

    // 3. Telefon tekshiruvi
    if (!validatePhone(phone)) {
      Alert.alert('Xato', 'Telefon raqam noto\'g\'ri.\n\nTalab:\n✅ +998 bilan boshlanishi\n✅ Jami 12 ta belgi bo\'lishi kerak\n\nMisol: +998901234567');
      return;
    }

    // 4. Parol tekshiruvi
    if (password.length < 6) {
      Alert.alert('Xato', 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    // 5. Tasdiqlash tekshiruvi
    if (password !== confirmPassword) {
      Alert.alert('Xato', 'Parollar bir-biriga mos kelmadi');
      return;
    }

    // --- API so'rovini yuborish ---
    setLoading(true);
    try {
      const response = await authAPI.register({ 
        name, 
        email, 
        password, 
        phone // Telefon raqamni to'g'ri yuboramiz
      });
      
      const { user, token } = response.data.data;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
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
          {/* Ism */}
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

          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Email (masalan: user@gmail.com)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Telefon */}
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="+998 90 123 45 67"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={13} // +998 (4) + 9 raqam = 13 belgi
            />
          </View>

          {/* Parol */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Parol (kamida 6 ta belgi)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#9CA3AF" 
              />
            </TouchableOpacity>
          </View>

          {/* Parolni Tasdiqlash */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Parolni qaytadan kiriting"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword} // Parolni ko'rsatish bilan birga bo'ladi
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
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB',
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    borderRadius: 12,
    paddingHorizontal: 16, 
    paddingVertical: 4,
    marginBottom: 14,
    height: 54,
  },
  input: { 
    flex: 1, 
    marginLeft: 12, 
    fontSize: 16, 
    color: '#1F2937',
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
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