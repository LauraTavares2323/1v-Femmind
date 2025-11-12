// src/screens/EditProfileScreen.js

import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert,
  ScrollView, ActivityIndicator, Image, TouchableOpacity,
  Platform // <-- Adicionar Platform aqui
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
      if (Platform.OS !== 'web') { // Permissões são necessárias apenas para apps nativos
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
        // Se uma nova imagem foi selecionada, faça o upload primeiro
        const formData = new FormData();
        const imageBlob = await fetch(selectedImageUri).then(res => res.blob());
        const filename = `profile_picture_${initialUser.id}_${Date.now()}.jpeg` // Extrai o nome do arquivo da URI
        const match = /\.(\w+)$/.exec(filename); // Pega a extensão
        const type = match ? `image/${match[1]}` : 'image'; // Tenta inferir o tipo MIME

        // Correção aqui:
        // Use o Platform.OS para adaptar o URI e o nome do arquivo para web e nativo
        const imageFile = {
            uri: Platform.OS === 'android' ? selectedImageUri : selectedImageUri.replace('file://', ''),
            name: Platform.OS === 'android' ? filename : `${initialUser.id}_${Date.now()}.${match ? match[1] : 'jpg'}`, // Garante nome de arquivo para web/iOS
            type: type,
        };

        formData.append('profilePicture', imageBlob, filename); // 'profilePicture' deve corresponder ao nome do campo no Multer

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

      if (Object.keys(filteredUpdateData).length === 0 && !selectedImageUri) { // Adicionado !selectedImageUri
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
    backgroundColor: '#f4f6f3', // fundo levemente esverdeado
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e5dd',
    paddingTop: 40,

    // sombra para o header em verde musgo
    shadowColor: '#556b2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b5323', // verde musgo mais escuro
  },
  scrollViewContent: {
    padding: 20,
    alignItems: 'center',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  profilePicture: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#6b8e23',

    // sombra circular na foto
    shadowColor: '#556b2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  profilePicturePlaceholder: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#dce5d1',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#556b2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  changePhotoText: {
    marginTop: 10,
    color: '#3b5323',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#c2c8b7',
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,

    // sombra leve nos inputs
    shadowColor: '#556b2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b5323',
    marginTop: 20,
    marginBottom: 12,
    alignSelf: 'flex-start',
    width: '100%',
  },
});


export default EditProfileScreen;