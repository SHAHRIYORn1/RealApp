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
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { cakeAPI, uploadAPI } from '../../services/api';

const AdminCakesScreen = ({ navigation }) => {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCake, setEditingCake] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
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
    setImageUri(null);
    setUploading(false);
    setFormData({
      name: '', description: '', price: '', imageUrl: '',
      category: '', weight: '', ingredients: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (cake) => {
    setEditingCake(cake);
    setImageUri(cake.imageUrl || null);
    setUploading(false);
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

  // ✅ Galereyadan rasm tanlash va serverga yuklash
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ruxsat kerak', 'Rasm tanlash uchun ruxsat bering');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await uploadImageToServer(uri);
    }
  };

  // ✅ Kamera orqali rasm olish va serverga yuklash
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ruxsat kerak', 'Kamera ishlatish uchun ruxsat bering');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await uploadImageToServer(uri);
    }
  };

  // ✅ Rasmni serverga yuklash funksiyasi
  const uploadImageToServer = async (uri) => {
    setUploading(true);
    try {
      const response = await uploadAPI.uploadCakeImage(uri);
      
      if (response.data.success) {
        setImageUri(uri);
        setFormData(prev => ({ ...prev, imageUrl: response.data.data.imageUrl }));
        Alert.alert('✅ Muvaffaqiyat', 'Rasm muvaffaqiyatli yuklandi');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Xato', error.response?.data?.message || 'Rasm yuklashda xato');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Xato', 'Nom va narx majburiy');
      return;
    }
    
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        weight: formData.weight || null,
        ingredients: formData.ingredients || null,
        // imageUrl allaqachon server URL
      };
      
      if (editingCake) {
        await cakeAPI.update(editingCake.id, submitData);
        Alert.alert('Muvaffaqiyat', 'Tort yangilandi');
      } else {
        await cakeAPI.create(submitData);
        Alert.alert('Muvaffaqiyat', 'Tort qo\'shildi');
      }
      setModalVisible(false);
      fetchCakes(searchQuery);
    } catch (error) {
      console.error('Xato:', error);
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tortlarni Boshqarish</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
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

      {/* List */}
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
            
            {/* ✅ Image Upload Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rasm</Text>
              <View style={styles.imagePickerContainer}>
                {formData.imageUrl ? (
                  <Image source={{ uri: formData.imageUrl }} style={styles.previewImage} resizeMode="cover" />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                    <Text style={styles.imagePlaceholderText}>Rasm yo'q</Text>
                  </View>
                )}
                
                <View style={styles.imageButtons}>
                  <TouchableOpacity 
                    style={[styles.imageButton, uploading && styles.imageButtonDisabled]} 
                    onPress={pickImage}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="images" size={20} color="#fff" />
                        <Text style={styles.imageButtonText}>Galereya</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.imageButton, uploading && styles.imageButtonDisabled]} 
                    onPress={takePhoto}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="camera" size={20} color="#fff" />
                        <Text style={styles.imageButtonText}>Kamera</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                
                {uploading && (
                  <Text style={styles.uploadingText}>📤 Rasm yuklanmoqda...</Text>
                )}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tavsif</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={(text) => setFormData({ ...formData, description: text })} placeholder="Tort haqida ma'lumot..." multiline numberOfLines={3} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vazn</Text>
              <TextInput style={styles.input} value={formData.weight} onChangeText={(text) => setFormData({ ...formData, weight: text })} placeholder="1kg, 2kg..." />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tarkibi</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formData.ingredients} onChangeText={(text) => setFormData({ ...formData, ingredients: text })} placeholder="Un, tuxum, shakar..." multiline numberOfLines={3} />
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
  // Image Picker Styles
  imagePickerContainer: { alignItems: 'center', marginBottom: 16 },
  previewImage: { width: '100%', height: 180, borderRadius: 12, marginBottom: 12 },
  imagePlaceholder: {
    width: '100%', height: 180, borderRadius: 12,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderText: { color: '#9CA3AF', marginTop: 8 },
  imageButtons: { flexDirection: 'row', gap: 12 },
  imageButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FF6B6B', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 10, gap: 6, minWidth: 120, justifyContent: 'center',
  },
  imageButtonDisabled: { backgroundColor: '#9CA3AF' },
  imageButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  uploadingText: { fontSize: 12, color: '#3B82F6', marginTop: 8, textAlign: 'center' },
});

export default AdminCakesScreen;