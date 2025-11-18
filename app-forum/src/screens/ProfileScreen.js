// ProfileScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  FlatList
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


  const handleLogout = async () => {
    try {

      await AsyncStorage.removeItem('userToken');

      await AsyncStorage.removeItem('user');


      try {

        const maybePromise = signOut && signOut();
        if (maybePromise && maybePromise.then) await maybePromise;
      } catch (ctxErr) {
        console.warn('signOut do AuthContext lançou erro:', ctxErr);
      }


      try {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      } catch (resetErr) {
        console.warn('navigation.reset falhou:', resetErr);
      }

      navigation.navigate('Login');

    } catch (err) {
      console.warn('Erro no handleLogout:', err);
      Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchProfileData);
    return unsubscribe;
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('Sem token no AsyncStorage — forçando signOut');
        return signOut?.();
      }

      const [userRes, postsRes, favsRes] = await Promise.all([
        api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/users/me/posts', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/users/me/favorites', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setUser(userRes.data);
      setMyPosts(postsRes.data);
      setFavoritePosts(favsRes.data);

    } catch (error) {
      console.warn('Erro ao buscar perfil:', error);
      Alert.alert('Erro', 'Não foi possível carregar o perfil.');
      signOut?.();
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

      <View style={styles.header}>
        <Text style={styles.logo}>FEM<Text style={styles.logoBold}>MIND</Text></Text>


        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              "Sair",
              "Tem certeza que deseja sair?",
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", style: "destructive", onPress: handleLogout }
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileLeft}>
              {user.profile_picture_url ? (
                <Image
                  source={{
                    uri: `${api.defaults.baseURL.replace('/api', '')}${user.profile_picture_url}`
                  }}
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

          {myPosts.length > 0 ? (
            <FlatList
              data={myPosts}
              renderItem={renderPostItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={{
                justifyContent: 'center',
                gap: 15,
              }}
              contentContainerStyle={{
                paddingVertical: 10,
                alignItems: 'center',
              }}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: '#556b2f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 38,
    height: 38,
    marginRight: 8,
    borderRadius: 20,
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
  menu: {
    flexDirection: 'row',
  },
  menuItem: {
    color: '#d8dec3',
    marginLeft: 16,
    fontSize: 15,
  },
  logoutButton: { padding: 6 },
  profileCard: {
    backgroundColor: "#f0ecd9",
    width: "90%",
    maxWidth: 1050,
    alignSelf: "center",
    marginTop: 25,
    padding: 35,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  profilePicture: {
    width: 110,
    height: 110,
    borderRadius: 80,
    marginRight: 20,
    borderWidth: 2,
    borderColor: "#ddd"
  },
  username: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2e2e2e"
  },
  email: {
    fontSize: 15,
    color: "#666",
    marginTop: 3
  },
  memberSince: {
    fontSize: 14,
    color: "#777",
    marginTop: 5
  },
  editButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8d4c3",
    paddingVertical: 10,
    paddingHorizontal: 16,
    elevation: 2
  },
  editButtonText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#444"
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15
  },
  articleCard: {
    width: 190,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 15
  },
  articleImagePlaceholder: {
    height: 120,
    backgroundColor: "#f4c7c3"
  },
  articleContent: {
    padding: 12
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2
  },
  articleSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 5
  },
  articleText: {
    fontSize: 12,
    color: "#888"
  },
  noContentText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
    fontSize: 16
  },
});

export default ProfileScreen;
