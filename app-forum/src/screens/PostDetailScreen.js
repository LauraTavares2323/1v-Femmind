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
  }, [postId]);

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

    
        <View style={styles.mainContentContainer}>

          <View style={styles.leftColumn}>
            <Text style={styles.commentsTitle}>Comentários</Text>

            <FlatList
              data={comments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCommentItem}
              scrollEnabled={false}
              ListEmptyComponent={<Text style={styles.noCommentsText}>Nenhum comentário ainda. Seja o primeiro!</Text>}
            />

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
                color="#4a5e39" 
              />

            </View>
          </View>

         
          <View style={styles.rightColumn}>
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
              {post.image_url && (
                <Image source={{ uri: `http://localhost:3001${post.image_url}` }} style={styles.postImage} />
              )}
              <View style={styles.postStatsContainer}>
                <Text style={styles.postStats}>{post.likes_count} Curtidas</Text>
                <Text style={styles.postStats}>{post.comments_count} Comentários</Text>
              </View>
            </View>
          </View>

        </View>

      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef1e6',
  },


  mainContentContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 14,
    paddingBottom: 40,
    gap: 14,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
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
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: '#4a5e39',
    borderBottomWidth: 0,
    paddingTop: 42,
    shadowColor: '#4a5e39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  scrollViewContent: {
    paddingBottom: 25,
  },


  postDetailCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 18,
    marginTop: 18,
    shadowColor: '#2f3b24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 7,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profilePicture: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#7c9164',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  profilePicturePlaceholder: {
    marginRight: 12,
  },
  postUsername: {
    fontWeight: '700',
    fontSize: 17,
    color: '#2f3b24',
  },
  postTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1f2b12',
    letterSpacing: 0.3,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 26,
    color: '#3f3f3f',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 260,
    borderRadius: 14,
    marginTop: 12,
    resizeMode: 'cover',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  postStatsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#d9e0cf',
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  postStats: {
    fontSize: 15,
    color: '#2f3b24',
    fontWeight: '500',
  },

  commentsTitle: {
    fontSize: 21,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 12,
    color: '#4a5e39',
    letterSpacing: 0.3,
  },
  commentCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#4a5e39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 5,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentProfilePicture: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#7c9164',
  },
  commentUsername: {
    fontWeight: '600',
    fontSize: 15,
    color: '#2f3b24',
    flex: 1,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#7f7f7f',
  },
  commentContent: {
    fontSize: 15,
    color: '#4a4a4a',
    marginLeft: 44,
    lineHeight: 22,
  },

  addCommentContainer: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 16,
    marginTop: 14,
    marginBottom: 30,
    shadowColor: '#2f3b24',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#cbd5b1',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#f0f3eb',
    minHeight: 70,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
});

export default PostDetailScreen;
