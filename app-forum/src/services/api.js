// src/services/api.js

import axios from 'axios';

// A URL base do seu backend
// ATENÇÃO: Se você estiver rodando em um dispositivo físico ou emulador,
// 'localhost' não funcionará. Você precisará usar o IP da sua máquina.
// Ex: http://192.168.1.XX:3001 
// Para web, 'localhost' funciona.
const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;