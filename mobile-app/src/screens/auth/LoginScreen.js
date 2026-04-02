// mobile-app/src/screens/auth/LoginScreen.js
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

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ✅ Yangi: Parolni ko'rish holati
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();

  // ✅ Email formatini tekshirish funksiyasi
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = async () => {
    // 1. Email Validatsiyasi
    if (!validateEmail(email)) {
      Alert.alert('Xato', 'Iltimos, to\'g\'ri email manzilini kiriting (masalan: user@gmail.com)');
      return;
    }

    // 2. Parol Validatsiyasi
    if (password.length < 6) {
      Alert.alert('Xato', 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      
      const { user, token } = response.data.data;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      login(user, token);
      
    } catch (error) {
      const message = error.response?.data?.message || 'Kirishda xato';
      Alert.alert('Kirish xato', message);
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
          <Ionicons name="restaurant" size={80} color="#FF6B6B" />
          <Text style={styles.title}>Olaja To'rt</Text>
          <Text style={styles.subtitle}>Markazi</Text>
        </View>

        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Email manzil"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Parol Input + Ko'zcha Icon */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Parol"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword} // ✅ Show/Hide logic
              autoCapitalize="none"
            />
            {/* ✅ Ko'zcha tugmasi */}
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#9CA3AF" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Kirish</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hisobingiz yo'qmi? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Ro'yxatdan o'tish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1F2937', marginTop: 16 },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  form: { width: '100%' },
  inputContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB',
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    borderRadius: 12,
    paddingHorizontal: 16, 
    paddingVertical: 4, // Vertikal paddingni kamaytirdim icon uchun joy ochishga
    marginBottom: 16,
    height: 54, // Aniqlik uchun balandlik
  },
  input: { 
    flex: 1, 
    marginLeft: 12, 
    fontSize: 16, 
    color: '#1F2937',
    height: '100%',
    justifyContent: 'center'
  },
  eyeIcon: {
    padding: 8, // Icon bosiladigan maydon
  },
  button: {
    backgroundColor: '#FF6B6B', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#6B7280', fontSize: 16 },
  footerLink: { color: '#FF6B6B', fontSize: 16, fontWeight: 'bold' },
});

export default LoginScreen;