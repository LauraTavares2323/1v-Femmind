// App.js (na raiz do seu projeto meu-app-forum)

import React from 'react';
import AppNavigator from './src/AppNavigator';
import { AuthProvider } from './src/context/AuthContext'; // Importa o provedor

export default function App() {
  return (
    <AuthProvider> {/* Envolve o AppNavigator com AuthProvider */}
      <AppNavigator />
    </AuthProvider>
  );
} 