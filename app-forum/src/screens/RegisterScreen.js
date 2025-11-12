// // src/screens/RegisterScreen.js

// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
// import api from '../services/api'; // Importa a instância do Axios

// const RegisterScreen = ({ navigation }) => {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleRegister = async () => {
//     try {
//       const response = await api.post('/auth/register', { username, email, password });
//       // console.log('Cadastro bem-sucedido:', response.data);
//       Alert.alert('Sucesso', 'Usuário cadastrado com sucesso! Faça login para continuar.');
//       navigation.navigate('Login'); // Volta para a tela de login após o cadastro
//     } catch (error) {
//       console.error('Erro no cadastro:', error.response?.data || error.message);
//       Alert.alert('Erro no Cadastro', error.response?.data?.message || 'Ocorreu um erro ao tentar cadastrar.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Crie sua conta</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Nome de Usuário"
//         value={username}
//         onChangeText={setUsername}
//         autoCapitalize="none"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="E-mail"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Senha"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />
//       <Button title="Cadastrar" onPress={handleRegister} color='#4b5320' />
//       <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//         <Text style={styles.loginText}>Já tem uma conta? Faça login</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#f5f7f2', // fundo verde musgo clarinho
//   },
//   title: {
//     fontSize: 28,
//     textTransform: 'uppercase',
//     fontWeight: 'bold',
//     marginBottom: 30,
//     color: '#4b5320', // verde musgo principal
//     textShadowColor: '#8f9779', // sombra verde musgo clara
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   input: {
//     width: '100%',
//     padding: 15,
//     borderWidth: 1,
//     borderColor: '#8f9779', // verde musgo suave
//     borderRadius: 12,
//     marginBottom: 15,
//     backgroundColor: '#f5f7f2', // verde bem clarinho
//     fontSize: 16,

//     // sombra leve
//     shadowColor: '#4b5320',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   loginText: {
//     marginTop: 20,
//     color: '#4b5320',
//     textDecorationLine: 'underline',
//     fontWeight: '500',
//   },
//   button: {
//     width: '100%',
//     paddingVertical: 14,
//     borderRadius: 25,
//     alignItems: 'center',
//     backgroundColor: '#4b5320', // botão verde musgo

//     shadowColor: '#4b5320',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.25,
//     shadowRadius: 5,
//     elevation: 5,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//   },
// });



// export default RegisterScreen;


// src/screens/RegisterScreen.js

import React, { useState } from 'react';
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

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso! Faça login para continuar.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert(
        'Erro no Cadastro',
        error.response?.data?.message || 'Ocorreu um erro ao tentar cadastrar.'
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
        {/* Card de cadastro */}
        <View style={styles.card}>
          <Text style={styles.label}>Nome de Usuário</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome de usuário"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
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

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkBottom}>Já tem uma conta? Faça login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RegisterScreen;

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
    maxWidth: 480,
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
