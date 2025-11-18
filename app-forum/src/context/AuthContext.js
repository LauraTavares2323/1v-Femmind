import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const signIn = async (token, userDataObj) => {
    console.log('AuthContext: iniciando signIn() com token:', token);

    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userDataObj));

      setUserToken(token);
      setUserData(userDataObj);

      console.log('AuthContext: login realizado e dados salvos.');
    } catch (error) {
      console.error('Erro ao salvar token/dados no AsyncStorage:', error);
    }
  };

  const signOut = async () => {
    console.log('AuthContext: iniciando signOut(). Removendo dados...');

    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');

      setUserToken(null);
      setUserData(null);

      console.log('AuthContext: Logout concluído. userToken = null, userData = null.');
    } catch (error) {
      console.error('AuthContext: Erro ao fazer logout:', error);
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      console.log('AuthContext: carregando token do AsyncStorage...');

      try {
        const token = await AsyncStorage.getItem('userToken');
        const userDataJson = await AsyncStorage.getItem('userData');

        if (token) {
          setUserToken(token);
          console.log('AuthContext: token encontrado:', token);
        } else {
          console.log('AuthContext: nenhum token encontrado.');
        }

        if (userDataJson) {
          setUserData(JSON.parse(userDataJson));
        }

      } catch (error) {
        console.error('Erro ao carregar token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userData,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
