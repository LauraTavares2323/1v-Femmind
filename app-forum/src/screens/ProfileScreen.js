// // src/screens/ProfileScreen.js

// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, ActivityIndicator,
//   Alert, Button, Image, TouchableOpacity, FlatList
// } from 'react-native';
// import AuthContext from '../context/AuthContext';
// import api from '../services/api';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Ionicons } from '@expo/vector-icons';

// const ProfileScreen = ({ navigation }) => {
//   const { signOut } = useContext(AuthContext);
//   const [user, setUser] = useState(null);
//   const [myPosts, setMyPosts] = useState([]);
//   const [favoritePosts, setFavoritePosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('myPosts');

//   useEffect(() => {
//     // Adicionar um listener para focar na tela e recarregar os dados
//     const unsubscribe = navigation.addListener('focus', () => {
//       fetchProfileData();
//     });
//     return unsubscribe; // Limpar o listener
//   }, [navigation]);

//   const fetchProfileData = async () => {
//     setLoading(true);
//     try {
//       const userToken = await AsyncStorage.getItem('userToken');
//       if (!userToken) {
//         Alert.alert('Erro', 'Token de autenticação não encontrado.');
//         signOut();
//         return;
//       }

//       const userResponse = await api.get('/users/me', {
//         headers: { Authorization: `Bearer ${userToken}` }
//       });
//       setUser(userResponse.data);

//       const myPostsResponse = await api.get('/users/me/posts', {
//         headers: { Authorization: `Bearer ${userToken}` }
//       });
//       setMyPosts(myPostsResponse.data);

//       const favoritePostsResponse = await api.get('/users/me/favorites', {
//         headers: { Authorization: `Bearer ${userToken}` }
//       });
//       // CORREÇÃO AQUI: Use favoritePostsResponse.data
//       setFavoritePosts(favoritePostsResponse.data); // LINHA CORRIGIDA

//     } catch (error) {
//       console.error('Erro ao buscar dados do perfil:', error.response?.data || error.message);
//       Alert.alert('Erro', error.response?.data?.message || 'Não foi possível carregar o perfil.');
//       if (error.response?.status === 401 || error.response?.status === 403) {
//         signOut();
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderPostItem = ({ item }) => (
//     <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { postId: item.id })}>
//       <View style={styles.postCard}>
//         <Text style={styles.postTitle}>{item.title}</Text>
//         <Text style={styles.postContentPreview}>{item.content.substring(0, 100)}...</Text>
//         <View style={styles.postStatsRow}>
//             <Text style={styles.postStatItem}>{item.likes_count} Curtidas</Text>
//             <Text style={styles.postStatItem}>{item.comments_count} Comentários</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//         <Text>Carregando perfil...</Text>
//       </View>
//     );
//   }

//   if (!user) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text>Perfil não encontrado.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <Ionicons name="arrow-back" size={28} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Meu Perfil</Text>
//         <TouchableOpacity onPress={() => navigation.navigate('EditProfile', { user })} style={styles.editButton}>
//           <Ionicons name="settings-outline" size={24} color="#ccc" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollViewContent}>
//         {/* Informações do Usuário */}
//         <View style={styles.profileInfoCard}>
//           {/* Garante que a URL da imagem esteja completa */}
//           {user.profile_picture_url ? (
//             <Image source={{ uri: `${api.defaults.baseURL.replace('/api', '')}${user.profile_picture_url}` }} style={styles.profilePicture} />
//           ) : (
//             <Ionicons name="person-circle" size={100} color="#ccc" style={styles.profilePicturePlaceholder} />
//           )}
//           <Text style={styles.username}>{user.username}</Text>
//           <Text style={styles.email}>{user.email}</Text>
//           <Text style={styles.memberSince}>Membro desde: {new Date(user.created_at).toLocaleDateString('pt-BR')}</Text>
//         </View>

//         {/* Abas de Navegação */}
//         <View style={styles.tabsContainer}>
//           <TouchableOpacity
//             style={[styles.tabButton, activeTab === 'myPosts' && styles.activeTab]}
//             onPress={() => setActiveTab('myPosts')}
//           >
//             <Text style={[styles.tabText, activeTab === 'myPosts' && styles.activeTabText]}>Meus Posts ({myPosts.length})</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tabButton, activeTab === 'favorites' && styles.activeTab]}
//             onPress={() => setActiveTab('favorites')}
//           >
//             <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>Favoritos ({favoritePosts.length})</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Conteúdo da Aba Ativa */}
//         {activeTab === 'myPosts' ? (
//           myPosts.length > 0 ? (
//             <FlatList
//               data={myPosts}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={renderPostItem}
//               scrollEnabled={false}
//               contentContainerStyle={styles.postListContent}
//             />
//           ) : (
//             <Text style={styles.noContentText}>Você ainda não fez nenhum post.</Text>
//           )
//         ) : (
//           favoritePosts.length > 0 ? (
//             <FlatList
//               data={favoritePosts}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={renderPostItem}
//               scrollEnabled={false}
//               contentContainerStyle={styles.postListContent}
//             />
//           ) : (
//             <Text style={styles.noContentText}>Você ainda não favoritou nenhum post.</Text>
//           )
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#f0f4e3', // fundo verde musgo bem clarinho
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     paddingHorizontal: 15,
// //     paddingVertical: 12,
// //     backgroundColor: '#4b5320', // verde musgo principal
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#8f9779',
// //     paddingTop: 40,
// //     shadowColor: '#4b5320',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 4,
// //     elevation: 5,
// //   },
// //   backButton: {
// //     padding: 6,
// //   },
// //   headerTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#fff',
// //   },
// //   editButton: {
// //     padding: 6,
// //   },
// //   scrollViewContent: {
// //     paddingBottom: 20,
// //   },
// //   profileInfoCard: {
// //     backgroundColor: '#fff',
// //     padding: 25,
// //     margin: 15,
// //     borderRadius: 15,
// //     alignItems: 'center',
// //     shadowColor: '#4b5320',
// //     shadowOffset: { width: 0, height: 3 },
// //     shadowOpacity: 0.15,
// //     shadowRadius: 5,
// //     elevation: 5,
// //   },
// //   profilePicture: {
// //     width: 110,
// //     height: 110,
// //     borderRadius: 55,
// //     marginBottom: 15,
// //     borderWidth: 2,
// //     borderColor: '#6b8e23', // verde musgo médio
// //   },
// //   profilePicturePlaceholder: {
// //     marginBottom: 15,
// //   },
// //   username: {
// //     fontSize: 26,
// //     fontWeight: 'bold',
// //     color: '#2f3b14',
// //     marginBottom: 6,
// //   },
// //   email: {
// //     fontSize: 15,
// //     color: '#4b5320',
// //     marginBottom: 4,
// //   },
// //   memberSince: {
// //     fontSize: 13,
// //     color: '#9e9e9e',
// //   },
// //   tabsContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-around',
// //     marginHorizontal: 15,
// //     marginTop: 15,
// //     backgroundColor: '#fff',
// //     borderRadius: 12,
// //     overflow: 'hidden',
// //     shadowColor: '#4b5320',
// //     shadowOffset: { width: 0, height: 1 },
// //     shadowOpacity: 0.12,
// //     shadowRadius: 3,
// //     elevation: 3,
// //   },
// //   tabButton: {
// //     flex: 1,
// //     paddingVertical: 12,
// //     alignItems: 'center',
// //     borderBottomWidth: 3,
// //     borderBottomColor: 'transparent',
// //   },
// //   activeTab: {
// //     borderBottomColor: '#4b5320',
// //   },
// //   tabText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: '#555',
// //   },
// //   activeTabText: {
// //     color: '#4b5320',
// //   },
// //   postListContent: {
// //     paddingHorizontal: 15,
// //     paddingTop: 12,
// //     paddingBottom: 25,
// //   },
// //   postCard: {
// //     backgroundColor: '#fff',
// //     padding: 20,
// //     borderRadius: 12,
// //     marginBottom: 12,
// //     shadowColor: '#4b5320',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   postTitle: {
// //     fontSize: 17,
// //     fontWeight: 'bold',
// //     marginBottom: 6,
// //     color: '#2f3b14',
// //   },
// //   postContentPreview: {
// //     fontSize: 14,
// //     color: '#555',
// //     marginBottom: 12,
// //   },
// //   postStatsRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-around',
// //     borderTopWidth: 1,
// //     borderTopColor: '#8f9779',
// //     paddingTop: 8,
// //   },
// //   postStatItem: {
// //     fontSize: 13,
// //     color: '#4b5320',
// //   },
// //   noContentText: {
// //     textAlign: 'center',
// //     marginTop: 35,
// //     fontSize: 16,
// //     color: '#777',
// //     marginHorizontal: 20,
// //   },
// // });

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff', // fundo branco externo
//   },

//   // ===== CABEÇALHO =====
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#4b5320', // verde musgo
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//   },

//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   headerLogo: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#fdfdfd',
//     letterSpacing: 0.5,
//   },

//   headerMenu: {
//     flexDirection: 'row',
//     marginLeft: 25,
//   },

//   headerMenuItem: {
//     color: '#d1d7c6',
//     fontSize: 15,
//     marginRight: 18,
//   },

//   headerRight: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     backgroundColor: '#f4e2b5',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   // ===== PERFIL =====
//   profileSection: {
//     backgroundColor: '#eee9d6', // bege clarinho
//     margin: 20,
//     borderRadius: 18,
//     paddingVertical: 25,
//     paddingHorizontal: 30,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//   },

//   profileHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },

//   profileLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   profilePicture: {
//     width: 95,
//     height: 95,
//     borderRadius: 50,
//     marginRight: 20,
//   },

//   nameSection: {
//     flexDirection: 'column',
//   },

//   username: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#2f2f2f',
//   },

//   email: {
//     fontSize: 15,
//     color: '#555',
//     marginTop: 4,
//   },

//   editButton: {
//     backgroundColor: '#f3f0e2',
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#c6c3b5',
//   },

//   editButtonText: {
//     color: '#2f2f2f',
//     fontWeight: '500',
//     fontSize: 14,
//   },

//   // ===== SEÇÃO DE ARTIGOS =====
//   articlesSection: {
//     marginTop: 10,
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#2f2f2f',
//     marginLeft: 8,
//     marginBottom: 15,
//   },

//   articlesRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     flexWrap: 'wrap',
//   },

//   articleCard: {
//     width: '47%',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginBottom: 15,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 2,
//   },

//   articleImagePlaceholder: {
//     height: 120,
//     backgroundColor: '#f8d7d0', // cor pastel padrão (rosa)
//   },

//   articleContent: {
//     padding: 10,
//   },

//   articleTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#2f2f2f',
//     marginBottom: 3,
//   },

//   articleSubtitle: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 4,
//   },

//   articleText: {
//     fontSize: 12,
//     color: '#777',
//   },

//   // ===== CASO SEM CONTEÚDO =====
//   noContentText: {
//     textAlign: 'center',
//     color: '#777',
//     fontSize: 15,
//     marginTop: 30,
//   },
// });



// export default ProfileScreen;












import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  Alert, Image, TouchableOpacity, FlatList
} from 'react-native';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const { signOut } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myPosts');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfileData();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return signOut();

      const [userRes, postsRes, favsRes] = await Promise.all([
        api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/users/me/posts', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/users/me/favorites', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setUser(userRes.data);
      setMyPosts(postsRes.data);
      setFavoritePosts(favsRes.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o perfil.');
      signOut();
    } finally {
      setLoading(false);
    }
  };

  const renderPostItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { postId: item.id })}>
      <View style={styles.articleCard}>
        <View style={styles.articleImagePlaceholder} />
        <View style={styles.articleContent}>
          <Text style={styles.articleTitle}>{item.title}</Text>
          <Text style={styles.articleSubtitle}>{item.subtitle || 'Sem subtítulo'}</Text>
          <Text style={styles.articleText}>{item.content?.substring(0, 60)}...</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b705c" />
        <Text>Carregando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Perfil não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ===== Cabeçalho padrão ===== */}
      <View style={styles.header}>
        <Text style={styles.logo}>FEMMIND</Text>
        <View style={styles.headerMenu}>
          <Text style={styles.menuItem}>Início</Text>
          <Text style={styles.menuItem}>Proposta</Text>
          <Text style={styles.menuItem}>Pesquisar</Text>
        </View>
      </View>

      <ScrollView>
        {/* ===== Perfil ===== */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileLeft}>
              {user.profile_picture_url ? (
                <Image
                  source={{ uri: `${api.defaults.baseURL.replace('/api', '')}${user.profile_picture_url}` }}
                  style={styles.profilePicture}
                />
              ) : (
                <Ionicons name="person-circle-outline" size={100} color="#b5b5b5" />
              )}
              <View>
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.email}>{user.email}</Text>
                <Text style={styles.memberSince}>
                  Membro desde: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile', { user })}
            >
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Seus artigos:</Text>

          {/* ===== Lista de Posts ===== */}
          {myPosts.length > 0 ? (
            <FlatList
              data={myPosts}
              renderItem={renderPostItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal={false}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              contentContainerStyle={{ paddingVertical: 10 }}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noContentText}>Você ainda não publicou artigos.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#6b705c',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 3,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    fontStyle: 'italic',
  },
  headerMenu: {
    flexDirection: 'row',
  },
  menuItem: {
    color: '#d6d8c5',
    marginLeft: 15,
    fontSize: 15,
  },
  profileCard: {
    backgroundColor: '#eee9d6',
    borderRadius: 15,
    margin: 18,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 95,
    height: 95,
    borderRadius: 60,
    marginRight: 15,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2f2f2f',
  },
  email: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  memberSince: {
    fontSize: 13,
    color: '#7c7c7c',
  },
  editButton: {
    backgroundColor: '#f7f5ed',
    borderColor: '#cfcab4',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  editButtonText: {
    fontSize: 13,
    color: '#3a3a3a',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginTop: 18,
    marginBottom: 12,
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    width: '48%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  articleImagePlaceholder: {
    height: 110,
    backgroundColor: '#f8d7d0',
  },
  articleContent: {
    padding: 10,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2f2f2f',
  },
  articleSubtitle: {
    fontSize: 12,
    color: '#555',
  },
  articleText: {
    fontSize: 12,
    color: '#777',
  },
  noContentText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 15,
    marginTop: 30,
  },
});
