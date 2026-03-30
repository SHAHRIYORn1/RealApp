// mobile-app/src/screens/admin/AdminCakesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cakeAPI } from '../../services/api';

const AdminCakesScreen = ({ navigation }) => {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCake, setEditingCake] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', imageUrl: '',
    category: '', weight: '', ingredients: '',
  });

  const fetchCakes = async (query = '') => {
    try {
      setLoading(true);
      const response = await cakeAPI.getAll({ limit: 50, search: query });
      const cakesData = response.data?.data?.cakes || [];
      setCakes(cakesData);
    } catch (error) {
      console.error('Tortlarni yuklashda xato:', error);
      Alert.alert('Xato', 'Tortlarni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCakes();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    fetchCakes(text);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCakes(searchQuery);
  };

  const openAddModal = () => {
    setEditingCake(null);
    setFormData({
      name: '', description: '', price: '', imageUrl: '',
      category: '', weight: '', ingredients: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (cake) => {
    setEditingCake(cake);
    setFormData({
      name: cake.name || '',
      description: cake.description || '',
      price: cake.price?.toString() || '',
      imageUrl: cake.imageUrl || '',
      category: cake.category || '',
      weight: cake.weight || '',
      ingredients: cake.ingredients || '',
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Xato', 'Nom va narx majburiy');
      return;
    }

    try {
      if (editingCake) {
        await cakeAPI.update(editingCake.id, {
          ...formData, price: parseFloat(formData.price),
        });
        Alert.alert('Muvaffaqiyat', 'Tort yangilandi');
      } else {
        await cakeAPI.create({
          ...formData, price: parseFloat(formData.price),
        });
        Alert.alert('Muvaffaqiyat', 'Tort qo\'shildi');
      }
      setModalVisible(false);
      fetchCakes(searchQuery);
    } catch (error) {
      Alert.alert('Xato', error.response?.data?.message || 'Amalni bajarishda xato');
    }
  };

  const handleDelete = (cake) => {
    Alert.alert(
      'O\'chirish',
      `"${cake.name}" tortini o\'chirmoqchimisiz?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Ha, o\'chirish',
          style: 'destructive',
          onPress: async () => {
            try {
              await cakeAPI.delete(cake.id);
              Alert.alert('O\'chirildi', 'Tort o\'chirildi');
              fetchCakes(searchQuery);
            } catch (error) {
              Alert.alert('Xato', 'O\'chirishda xato');
            }
          },
        },
      ]
    );
  };

  const renderCakeItem = ({ item }) => (
    <View style={styles.cakeCard}>
      <View style={styles.cakeImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cakeImage} resizeMode="cover" />
        ) : (
          <View style={styles.cakeImagePlaceholder}>
            <Ionicons name="restaurant-outline" size={40} color="#9CA3AF" />
          </View>
        )}
      </View>
      <View style={styles.cakeInfo}>
        <Text style={styles.cakeName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cakePrice}>{item.price?.toLocaleString()} so'm</Text>
        <Text style={styles.cakeCategory}>{item.category || 'Kategoriya yo\'q'}</Text>
      </View>
      <View style={styles.cakeActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
          <Ionicons name="pencil" size={18} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
          <Ionicons name="trash" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && cakes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Tortlar yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tortlarni Boshqarish</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tort qidiring..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={cakes}
        renderItem={renderCakeItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Tortlar topilmadi</Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={openAddModal}>
              <Text style={styles.addFirstButtonText}>Birinchi tortni qo'shing</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingCake ? 'Tahrirlash' : 'Yangi Tort'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom *</Text>
              <TextInput style={styles.input} value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} placeholder="Tort nomi" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Narx *</Text>
              <TextInput style={styles.input} value={formData.price} onChangeText={(text) => setFormData({ ...formData, price: text })} placeholder="150000" keyboardType="numeric" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kategoriya</Text>
              <TextInput style={styles.input} value={formData.category} onChangeText={(text) => setFormData({ ...formData, category: text })} placeholder="Shokoladli, Vanilli..." />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rasm URL</Text>
              <TextInput style={styles.input} value={formData.imageUrl} onChangeText={(text) => setFormData({ ...formData, imageUrl: text })} placeholder="https://..." />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tavsif</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={(text) => setFormData({ ...formData, description: text })} placeholder="Tort haqida ma'lumot..." multiline numberOfLines={4} />
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Bekor qilish</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSubmit}>
              <Text style={styles.saveButtonText}>Saqlash</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginRight: 24 },
  addButton: { backgroundColor: '#FF6B6B', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { backgroundColor: '#fff', padding: 16 },
  searchInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1F2937' },
  listContent: { padding: 16, paddingBottom: 100 },
  cakeCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16,
    padding: 12, marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  cakeImageContainer: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#F3F4F6', overflow: 'hidden' },
  cakeImage: { width: '100%', height: '100%' },
  cakeImagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cakeInfo: { flex: 1, marginLeft: 12 },
  cakeName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  cakePrice: { fontSize: 15, fontWeight: 'bold', color: '#FF6B6B' },
  cakeCategory: { fontSize: 13, color: '#6B7280' },
  cakeActions: { flexDirection: 'row' },
  actionButton: { padding: 8 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 16, marginBottom: 24 },
  addFirstButton: { backgroundColor: '#FF6B6B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  addFirstButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  modalContent: { flex: 1, padding: 20 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, color: '#6B7280', marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1F2937',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  modalFooter: {
    flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 8 },
  cancelButton: { backgroundColor: '#F3F4F6' },
  cancelButtonText: { color: '#1F2937', fontWeight: '600', fontSize: 15 },
  saveButton: { backgroundColor: '#FF6B6B' },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});

export default AdminCakesScreen;