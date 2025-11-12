// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para persistir o token

// Instalar AsyncStorage:
// npx expo install @react-native-async-storage/async-storage

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Para carregar o token ao iniciar

  // Função para salvar o token e o usuário (se necessário)
  const signIn = async (token, userData) => {
    console.log('AuthContext: iniciando signIn() com token:', token);
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUserToken(token);
      console.log('AuthContext: userToken definido para:', token);
    } catch (e) {
      console.error('Erro ao salvar token/dados no AsyncStorage', e);
    }
  };

  // Função para remover o token ao fazer logout
  const signOut = async () => {
    try {
      console.log('AuthContext: Iniciando signOut(). Tentando remover userToken.'); // <-- Adicione este log
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData')
      setUserToken(null);
      console.log('AuthContext: userToken definido para null e AsyncStorage limpo.'); // <-- Adicione este log
    } catch (e) {
      console.error('AuthContext: Erro ao remover token do AsyncStorage:', e); // <-- MUITO IMPORTANTE
    }
  };
  // Carregar o token ao iniciar o aplicativo
  useEffect(() => {
    const loadToken = async () => {
      console.log('AuthContext: carregando token do AsyncStorage...');
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token);
          console.log('AuthContext: token carregado do AsyncStorage:', token);
        }
        else {
          console.log('AuthContext: nenhum token encontrado no AsyncStorage');
        }
      } catch (e) {
        console.error('Erro ao carregar token do AsyncStorage', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ userToken, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;