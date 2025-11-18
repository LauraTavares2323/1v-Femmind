
import React from 'react';
import AppNavigator from './src/AppNavigator';
import { AuthProvider } from './src/context/AuthContext'; 

export default function App() {
  return (
    <AuthProvider> 
      <AppNavigator />
    </AuthProvider>
  );
} 