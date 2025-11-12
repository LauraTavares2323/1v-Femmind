import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      await signIn(response.data.token, response.data.user);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
    } catch (error) {
      Alert.alert(
        'Erro no login',
        error.response?.data?.message || 'Ocorreu um erro ao tentar fazer login.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      {/* Barra superior */}
      <View style={styles.header}>
        <Text style={styles.logo}>FEM<Text style={styles.logoBold}>MIND</Text></Text>
        
      </View>

      {/* Fundo degradê */}
      <View style={styles.container}>
        {/* Card de login */}
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Logar</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.link}>Esqueceu sua senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkBottom}>Não tem login? Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f6f5ef',
  },

  /*** HEADER ***/
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

  /*** CONTAINER ***/
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  /*** CARD ***/
  card: {
    backgroundColor: '#fff',
    width: '90%',
    maxWidth: 480, // 🔹 aumentamos o tamanho do formulário
    borderRadius: 14,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2f3b14',
    marginBottom: 6,
  },
  subtitle: {
    color: '#7c8564',
    fontSize: 14,
    marginBottom: 28,
    textAlign: 'center',
  },

  /*** INPUTS ***/
  label: {
    fontSize: 15,
    color: '#444',
    alignSelf: 'flex-start',
    marginBottom: 6,
    marginLeft: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 15,
    marginBottom: 16,
    fontSize: 15,
    width: '100%',
    color: '#333',
  },

  /*** BUTTON ***/
  button: {
    backgroundColor: '#4b5320',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 5,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  /*** LINKS ***/
  link: {
    marginTop: 16,
    color: '#2b2b2b',
    textDecorationLine: 'underline',
    textAlign: 'center',
    fontSize: 13,
  },
  linkBottom: {
    marginTop: 20,
    color: '#2b2b2b',
    textAlign: 'center',
    fontSize: 13,
  },
  linkHighlight: {
    color: '#4b5320',
    fontWeight: '600',
  },
});