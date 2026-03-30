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
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Xato', 'Email va parolni kiriting');
      return;
    }

    setLoading(true);
    try {
      // ✅ Faqat email va password yuborish (user obyekti emas!)
      const response = await authAPI.login({ email, password });
      
      const { user, token } = response.data.data;
      
      // Token va user ni saqlash
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // AuthContext ni yangilash
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
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16,
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1F2937' },
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