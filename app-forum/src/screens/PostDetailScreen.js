import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Button, ActivityIndicator, Alert, Image, TouchableOpacity, FlatList
} from 'react-native';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const { signOut } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPostAndComments();
  }, [postId]); // Adicionado postId como dependência para recarregar se o post mudar (ex: navegação entre posts)

  const fetchPostAndComments = async () => {
    setLoading(true);
    try {
      const postResponse = await api.get(`/posts/${postId}`);
      setPost(postResponse.data);

      const commentsResponse = await api.get(`/comments/${postId}`);
      setComments(commentsResponse.data);

    } catch (error) {
      console.error('Erro ao buscar detalhes do post/comentários:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do post.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newCommentContent.trim()) {
      Alert.alert('Erro', 'O comentário não pode ser vazio.');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Erro de Autenticação', 'Você precisa estar logado para comentar.');
        signOut();
        return;
      }

      await api.post(
        `/comments/${postId}`,
        { content: newCommentContent },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      Alert.alert('Sucesso', 'Comentário adicionado!');
      setNewCommentContent('');
      fetchPostAndComments();
    } catch (error) {
      console.error('Erro ao criar comentário:', error.response?.data || error.message);
      Alert.alert('Erro ao Comentar', error.response?.data?.message || 'Ocorreu um erro ao adicionar o comentário.');
      if (error.response?.status === 401 || error.response?.status === 403) {
         signOut();
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text>Carregando post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Post não encontrado.</Text>
      </View>
    );
  }

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        {item.profile_picture_url ? (
          <Image source={{ uri: `http://localhost:3001${item.profile_picture_url}` }} style={styles.commentProfilePicture} />
        ) : (
          <Ionicons name="person-circle" size={30} color="#ccc" style={styles.commentProfilePicturePlaceholder} />
        )}
        <Text style={styles.commentUsername}>{item.username}</Text>
        <Text style={styles.commentTimestamp}>
          {new Date(item.created_at).toLocaleString('pt-BR')}
        </Text>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Post</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Detalhes do Post */}
        <View style={styles.postDetailCard}>
          <View style={styles.postHeader}>
            {post.profile_picture_url ? (
              <Image source={{ uri: `http://localhost:3001${post.profile_picture_url}` }} style={styles.profilePicture} />
            ) : (
              <Ionicons name="person-circle" size={40} color="#ccc" style={styles.profilePicturePlaceholder} />
            )}
            <Text style={styles.postUsername}>{post.username}</Text>
          </View>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>
          {post.image_url && <Image source={{ uri: `http://localhost:3001${post.image_url}` }} style={styles.postImage} />}
          <View style={styles.postStatsContainer}>
            <Text style={styles.postStats}>{post.likes_count} Curtidas</Text>
            <Text style={styles.postStats}>{post.comments_count} Comentários</Text>
          </View>
        </View>

        {/* Seção de Comentários */}
        <Text style={styles.commentsTitle}>Comentários</Text>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCommentItem}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.noCommentsText}>Nenhum comentário ainda. Seja o primeiro!</Text>}
        />

        {/* Campo para Adicionar Comentário */}
        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Adicione um comentário..."
            value={newCommentContent}
            onChangeText={setNewCommentContent}
            multiline
          />
          <Button
            title={isSubmittingComment ? "Enviando..." : "Comentar"}
            onPress={handleCreateComment}
            disabled={isSubmittingComment}
          />
        </View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f2', // fundo verde bem suave
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#556b2f', // verde musgo forte
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5b1',
    paddingTop: 40, // SafeArea iOS

    shadowColor: '#556b2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  postDetailCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    margin: 15,

    shadowColor: '#556b2f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePicture: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#6b8e23',
  },
  profilePicturePlaceholder: {
    marginRight: 10,
  },
  postUsername: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#3b5323',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2e4600',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginTop: 10,
    resizeMode: 'cover',
  },
  postStatsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d5dbc7',
    paddingTop: 10,
    justifyContent: 'space-around',
  },
  postStats: {
    fontSize: 14,
    color: '#3b5323',
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 12,
    marginBottom: 10,
    color: '#556b2f',
  },
  commentCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 10,

    shadowColor: '#556b2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentProfilePicture: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#6b8e23',
  },
  commentProfilePicturePlaceholder: {
    marginRight: 8,
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#3b5323',
    flex: 1,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  commentContent: {
    fontSize: 14,
    color: '#444',
    marginLeft: 40,
  },
  addCommentContainer: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 15,
    borderRadius: 12,

    shadowColor: '#556b2f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#cbd5b1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f6f9f3',
    minHeight: 60,
    textAlignVertical: 'top',
  },

});



export default PostDetailScreen;