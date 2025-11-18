import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert,
  ScrollView, ActivityIndicator, Image, TouchableOpacity,
  Platform 
} from 'react-native';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = ({ route, navigation }) => {
  const { user: initialUser } = route.params;
  const { signOut } = useContext(AuthContext);

  const [username, setUsername] = useState(initialUser.username);
  const [email, setEmail] = useState(initialUser.email);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState(initialUser.profile_picture_url);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') { 
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão Negada', 'Desculpe, precisamos de permissões de galeria para isso funcionar!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImageUri(result.assets[0].uri);
      setProfilePictureUrl(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    if (newPassword && newPassword !== confirmNewPassword) {
      Alert.alert('Erro', 'A nova senha e a confirmação de senha não coincidem.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        signOut();
        return;
      }

      let finalProfilePictureUrl = profilePictureUrl;
      if (selectedImageUri) {
        const formData = new FormData();
        const imageBlob = await fetch(selectedImageUri).then(res => res.blob());
        const filename = `profile_picture_${initialUser.id}_${Date.now()}.jpeg` 
        const match = /\.(\w+)$/.exec(filename); 
        const type = match ? `image/${match[1]}` : 'image';

        const imageFile = {
            uri: Platform.OS === 'android' ? selectedImageUri : selectedImageUri.replace('file://', ''),
            name: Platform.OS === 'android' ? filename : `${initialUser.id}_${Date.now()}.${match ? match[1] : 'jpg'}`, 
            type: type,
        };

        formData.append('profilePicture', imageBlob, filename); 

        try {
          const uploadResponse = await api.post('/upload/profile-picture', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${userToken}`,
            },
          });
          finalProfilePictureUrl = uploadResponse.data.imageUrl;
        } catch (uploadError) {
          console.error('Erro ao fazer upload da imagem de perfil:', uploadError.response?.data || uploadError.message);
          Alert.alert('Erro de Upload', 'Não foi possível fazer upload da foto de perfil. Verifique o console para detalhes.');
          setIsSubmitting(false);
          return;
        }
      }

      const updateData = {
        username: username.trim() === initialUser.username ? undefined : username.trim(),
        email: email.trim() === initialUser.email ? undefined : email.trim(),
        profile_picture_url: finalProfilePictureUrl === initialUser.profile_picture_url ? undefined : finalProfilePictureUrl,
      };

      if (newPassword) {
        updateData.old_password = oldPassword;
        updateData.new_password = newPassword;
      }

      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined)
      );

      if (Object.keys(filteredUpdateData).length === 0 && !selectedImageUri) {
        Alert.alert('Aviso', 'Nenhuma alteração detectada para salvar.');
        setIsSubmitting(false);
        return;
      }

      const response = await api.put(
        '/users/me',
        filteredUpdateData,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      Alert.alert('Sucesso', response.data.message);
      navigation.goBack();

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Ocorreu um erro ao atualizar o perfil.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        signOut();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TouchableOpacity onPress={pickImage} style={styles.profilePictureContainer}>
          {profilePictureUrl ? (
            <Image source={{ uri: profilePictureUrl }} style={styles.profilePicture} />
          ) : (
            <Ionicons name="camera-outline" size={80} color="#ccc" style={styles.profilePicturePlaceholder} />
          )}
          <Text style={styles.changePhotoText}>Trocar foto de perfil</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Nome de Usuário"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.sectionTitle}>Mudar Senha (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Senha Antiga"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Nova Senha"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar Nova Senha"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          secureTextEntry
        />

        <Button
          title={isSubmitting ? "Salvando..." : "Salvar Alterações"}
          onPress={handleUpdateProfile}
          disabled={isSubmitting}
          color='#3b5323'
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6f1', 
    paddingBottom: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#657959', 
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff', 
  },

  backButton: {
    padding: 8,
    borderRadius: 10,
  },

  scrollViewContent: {
    padding: 18,
    alignItems: 'center',
  },

  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#657959',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  profilePicturePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e5e8e0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  changePhotoText: {
    marginTop: 12,
    color: '#657959',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d9dfd2',
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#fff',
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#657959',
    marginTop: 6,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },

  primaryButton: {
    backgroundColor: '#657959',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 10,
  },

  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});






export default EditProfileScreen;