// src/routes/authRoutes.js

const express = require('express');
const router = express.Router(); // Cria um roteador Express
const authController = require('../controllers/authController'); // Importa o controlador de autenticação

// Rota para registro de novo usuário
router.post('/register', authController.register);

// Rota para login de usuário
router.post('/login', authController.login);

module.exports = router; // Exporta o roteador