// src/controllers/authController.js

const pool = require('../../db'); // Importa o pool de conexões do MySQL
const bcrypt = require('bcryptjs'); // Para criptografia de senhas
const jwt = require('jsonwebtoken'); // Para JSON Web Tokens

// Chave secreta para assinar e verificar tokens JWT (coloque uma chave forte em produção!)
// Em ambiente de produção, use variáveis de ambiente (ex: process.env.JWT_SECRET)
const jwtSecret = process.env.JWT_SECRET || 'senhajwt';

// Função para registrar um novo usuário
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios: username, email, password.' });
  }

  try {
    // 1. Verificar se o usuário ou e-mail já existem
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Nome de usuário ou e-mail já está em uso.' });
    }

    // 2. Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10); // 10 é o saltRounds

    // 3. Inserir o novo usuário no banco de dados
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // 4. Gerar um token JWT para o usuário recém-registrado (opcional, mas comum)
    const token = jwt.sign({ id: result.insertId, username: username }, jwtSecret, { expiresIn: '1h' });

    res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: result.insertId, token });

  } catch (error) {
    console.error('Erro no registro do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
  }
};

// Função para login de usuário
exports.login = async (req, res) => {
  const { identifier, password } = req.body; // 'identifier' pode ser username ou email

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identificador (username ou email) e senha são obrigatórios.' });
  }

  try {
    // 1. Encontrar o usuário pelo username ou email
    const [users] = await pool.query(
      'SELECT id, username, password, profile_picture_url FROM users WHERE username = ? OR email = ?',
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = users[0];

    // 2. Comparar a senha fornecida com a senha criptografada
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 3. Gerar um token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      jwtSecret,
      { expiresIn: '1h' } // Token expira em 1 hora
    );

    res.status(200).json({
      message: 'Login bem-sucedido!',
      token,
      user: {
        id: user.id,
        username: user.username,
        profilePictureUrl: user.profile_picture_url // Envia a URL da foto de perfil
      }
    });

  } catch (error) {
    console.error('Erro no login do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao fazer login.' });
  }
};