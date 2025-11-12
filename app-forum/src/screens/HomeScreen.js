// src/screens/HomeScreen.js

import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, Button, StyleSheet, Alert,
  FlatList, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView
} from 'react-native';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // <-- Novo
import { CommonActions } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const { signOut } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLikes, setUserLikes] = useState({});
  const [userFavorites, setUserFavorites] = useState({})
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [newPostImageUri, setNewPostImageUri] = useState(null); // <-- Novo: URI da imagem do novo post

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setCurrentUserId(userData.id);
          setCurrentUsername(userData.username)
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário do AsyncStorage:', error);
      }
    };
    loadUserId();
    fetchPosts();

    // Pedir permissão para acessar a galeria de imagens
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Desculpe, precisamos de permissões de galeria para isso funcionar!');
      }
    })();
  }, [searchTerm, currentUserId]);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await api.get(`/posts?q=${searchTerm}`);

      // Atualiza o estado de likes do usuário com base nos posts buscados
      // Para o feedback visual persistente, esta parte é crucial
      let initialUserLikes = {};
      let initialUserFavorites = {}
      if (currentUserId) {
        try {
          const likesResponse = await api.get(`/users/${currentUserId}/likes`, {
            headers: { Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}` }
          });
          likesResponse.data.forEach(like => {
            initialUserLikes[like.post_id] = true;
          });
          const favoritesResponse = await api.get(`/users/${currentUserId}/favorites`, {
            headers: { Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}` }
          })
          favoritesResponse.data.forEach(favorite => {
            initialUserFavorites[favorite.post_id] = true;
          });
        } catch (likesError) {
          console.error('Erro ao buscar likes do usuário para inicialização:', likesError.response?.data || likesError.message);
        }
      }
      setUserLikes(initialUserLikes);
      setUserFavorites(initialUserFavorites)

      setPosts(response.data);
    } catch (error) {
      console.error('Erro ao buscar posts:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível carregar os posts.');
    } finally {
      setLoadingPosts(false);
    }
  };

  const pickPostImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3], // Ajuste conforme preferir
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewPostImageUri(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert('Erro', 'Título e conteúdo do post não podem ser vazios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Erro de Autenticação', 'Você precisa estar logado para criar um post.');
        signOut();
        return;
      }

      let imageUrlToSave = null;
      if (newPostImageUri) {
        // Faça o upload da imagem do post primeiro
        const formData = new FormData();
        formData.append('postImage', {
          uri: newPostImageUri,
          name: `post_${currentUserId}_${Date.now()}.jpg`,
          type: 'image/jpeg',
        });

        try {
          const uploadResponse = await api.post('/upload/post-image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${userToken}`,
            },
          });
          imageUrlToSave = uploadResponse.data.imageUrl; // URL retornada pelo backend
        } catch (uploadError) {
          console.error('Erro ao fazer upload da imagem do post:', uploadError.response?.data || uploadError.message);
          Alert.alert('Erro de Upload', 'Não foi possível fazer upload da imagem do post.');
          setIsSubmitting(false);
          return;
        }
      }

      await api.post(
        '/posts',
        { title: newPostTitle, content: newPostContent, image_url: imageUrlToSave }, // Envia a URL da imagem
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      Alert.alert('Sucesso', 'Post criado com sucesso!');
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImageUri(null); // Limpa a imagem selecionada
      fetchPosts(); // Recarrega os posts
    } catch (error) {
      console.error('Erro ao criar post:', error.response?.data || error.message);
      Alert.alert('Erro ao Criar Post', error.response?.data?.message || 'Ocorreu um erro ao criar o post.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        signOut();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Erro', 'Você precisa estar logado para curtir posts.');
        signOut();
        return;
      }
      const response = await api.post(
        `/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const liked = response.data.liked;
      setUserLikes(prevLikes => ({
        ...prevLikes,
        [postId]: liked,
      }));

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes_count: liked ? post.likes_count + 1 : Math.max(0, post.likes_count - 1) }
            : post
        )
      );

    } catch (error) {
      console.error('Erro ao curtir/descurtir:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível processar o like.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        signOut();
      }
      const response = await api.post(
        `/posts/${postId}/favorite`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
    }
  };

  const handleToggleFavorite = async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Erro', 'Você precisa estar logado para favoritar posts.');
        signOut();
        return;
      }
      const response = await api.post(
        `/posts/${postId}/favorite`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const favorited = response.data.favorited;
      setUserFavorites(prevFavorites => ({
        ...prevFavorites,
        [postId]: favorited,
      }));

      Alert.alert('Sucesso', response.data.message);
    } catch (error) {
      console.error('Erro ao favoritar/desfavoritar:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível processar o favorito.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        signOut();
      }
    }
  };

  const handleLogout = () => {
    console.log('HomeScreen: usuário clicou em sair')
    Alert.alert('Sair', 'Deseja realmente sair? :(', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', onPress: signOut() }
    ]);
  };

  const renderPostItem = ({ item }) => (
    <View style={styles.postCard}>

      <View style={styles.postHeader}>
        {item.profile_picture_url ? (
          <Image
            source={{ uri: `http://localhost:3001${item.profile_picture_url}` }}
            style={styles.profilePicture}
          />
        ) : (
          <Ionicons
            name="person-circle"
            size={40}
            color="#ccc"
            style={styles.profilePicturePlaceholder}
          />
        )}

        <View>
          <Text style={styles.postUsername}>{item.username}</Text>
          <Text style={styles.postEmail}>{item.email}</Text>
        </View>
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent}>{item.content}</Text>

      {item.image_url && (
        <Image
          source={{ uri: `http://localhost:3001${item.image_url}` }}
          style={styles.postImage}
        />
      )}

      <View style={styles.postFooter}>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => handleToggleLike(item.id)}
        >
          <Ionicons
            name={userLikes[item.id] ? 'heart' : 'heart-outline'}
            size={24}
            color={userLikes[item.id] ? 'red' : '#666'}
          />
          <Text style={styles.interactionText}>{item.likes_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() =>
            navigation.navigate('PostDetail', { postId: item.id })
          }
        >
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={styles.interactionText}>{item.comments_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => handleToggleFavorite(item.id)}
        >
          <Ionicons
            name={userFavorites[item.id] ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={userFavorites[item.id] ? 'gold' : '#666'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>FEM<Text style={styles.logoBold}>MIND</Text></Text>
        <View style={styles.headerButtons}>
          <Text style={styles.usernameText}>{currentUsername}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={30} color="white" />
          </TouchableOpacity>

        </View>
      </View>

      <ScrollView>

        {/* BARRA DE PESQUISA NO TOPO */}
        <View style={styles.topSearchWrapper}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar escritoras, artigos..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSubmitEditing={fetchPosts}
            />
            <TouchableOpacity onPress={fetchPosts} style={styles.searchButton}>
              <Ionicons name="search" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.columnsWrapper}>


          {/* COLUNA ESQUERDA - POSTS */}
          <View style={styles.leftColumn}>



            {/* Lista de Posts */}
            {loadingPosts ? (
              <ActivityIndicator size="large" color="#556b2f" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={posts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderPostItem}
                contentContainerStyle={styles.postList}
                ListEmptyComponent={
                  <Text style={styles.noPostsText}>
                    Nenhum post encontrado. Seja o primeiro a postar!
                  </Text>
                }
              />
            )}
          </View>

          {/* COLUNA DIREITA - NOVO POST */}
          <View style={styles.rightColumn}>
            <View style={styles.createPostCard}>

              <Text style={styles.createTitle}>Criar nova publicação</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Título</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu título aqui"
                  value={newPostTitle}
                  onChangeText={setNewPostTitle}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Conteúdo</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Escreva sua teoria, ideia ou pensamento"
                  value={newPostContent}
                  onChangeText={setNewPostContent}
                  multiline
                />
              </View>

              <TouchableOpacity onPress={pickPostImage} style={styles.addImageButton}>
                <Ionicons name="image-outline" size={22} color="#486b2f" />
                <Text style={styles.addImageText}>Adicionar arquivo</Text>
              </TouchableOpacity>

              {newPostImageUri && (
                <Image source={{ uri: newPostImageUri }} style={styles.imagePreview} />
              )}

              <TouchableOpacity
                style={[styles.publishButton, isSubmitting && { opacity: 0.6 }]}
                onPress={handleCreatePost}
                disabled={isSubmitting}
              >
                <Text style={styles.publishButtonText}>
                  {isSubmitting ? "Publicando..." : "Publicar"}
                </Text>
              </TouchableOpacity>

            </View>
          </View>


        </View>
      </ScrollView>
    </View>
  );

}; const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f5ee',
  },

  createPostCard: {
    backgroundColor: '#ffffff',
    padding: 28,
    borderRadius: 18,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'flex-start',
    marginTop: 10,

    shadowColor: '#657959',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  createTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#657959',
    marginBottom: 18,
  },

  fieldGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#657959',
  },

  input: {
    backgroundColor: '#f3f6ed',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d5dfc8',
    fontSize: 15,
  },

  textArea: {
    backgroundColor: '#f3f6ed',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d5dfc8',
    fontSize: 15,
    height: 120,
    textAlignVertical: 'top',
  },

  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#e7f0d9',
    borderRadius: 12,
    marginBottom: 12,
  },

  addImageText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#657959',
    fontWeight: '600',
  },

  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    marginBottom: 16,
    resizeMode: 'cover',
  },

  publishButton: {
    backgroundColor: '#657959',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 5,
  },

  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#657959',
    borderBottomWidth: 1,
    borderBottomColor: '#dfe7d4',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 6,
  },

  logoText: {
    fontSize: 22,
    color: '#fff',
    fontStyle: 'italic',
    fontWeight: '600',
  },

  logoBold: {
    fontWeight: '900',
  },

  mainTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
  },

  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  usernameText: {
    color: '#fff',
    marginRight: 14,
    fontSize: 16,
    fontWeight: '500',
  },

  profileButton: {
    marginRight: 15,
  },

  topSearchWrapper: {
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 10,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 10,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,

    borderWidth: 1,
    borderColor: '#e7eedf',
  },

  searchInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 8,
    color: '#33452c',
  },

  searchButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#657959',
    borderRadius: 100,
  },

  columnsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingBottom: 40,
    paddingTop: 15,
    width: '100%',
    gap: 25,
  },

  leftColumn: {
    flex: 3.2,
  },

  rightColumn: {
    flex: 2,
  },

  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 24,
    marginBottom: 30,
    width: '100%',

    shadowColor: '#657959',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,

    borderWidth: 1,
    borderColor: '#e3eadb',
  },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  profilePicture: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#657959',

    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },


  postUsername: {
    fontSize: 18,
    fontWeight: '700',
    color: '#657959',
    letterSpacing: 0.3,
  },

  postTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#657959',
    lineHeight: 28,
  },

  postContent: {
    fontSize: 16,
    lineHeight: 26,
    color: '#657959',
    marginBottom: 16,
    paddingLeft: 4,
  },

  postImage: {
    width: '100%',
    height: 260,
    borderRadius: 18,
    marginTop: 6,
    marginBottom: 20,
    backgroundColor: '#eff4ea',
    resizeMode: 'cover',
  },

  postFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#dfe6d8',
    gap: 14, // aproxima os botões
  },


  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },

  interactionText: {
    fontSize: 16,
    color: '#657959',
    fontWeight: '600',
  },

  createPostCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 832,
    alignSelf: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,

    borderWidth: 1,
    borderColor: '#dbe2d2',
  },

});


export default HomeScreen;