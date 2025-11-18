const pool = require('../../db'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

const jwtSecret = process.env.JWT_SECRET || 'senhajwt';

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios: username, email, password.' });
  }

  try {
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Nome de usuário ou e-mail já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const token = jwt.sign({ id: result.insertId, username: username }, jwtSecret, { expiresIn: '1h' });

    res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: result.insertId, token });

  } catch (error) {
    console.error('Erro no registro do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
  }
};

exports.login = async (req, res) => {
  const { identifier, password } = req.body; 

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identificador (username ou email) e senha são obrigatórios.' });
  }

  try {
    const [users] = await pool.query(
      'SELECT id, username, password, profile_picture_url FROM users WHERE username = ? OR email = ?',
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      jwtSecret,
      { expiresIn: '1h' } 
    );

    res.status(200).json({
      message: 'Login bem-sucedido!',
      token,
      user: {
        id: user.id,
        username: user.username,
        profilePictureUrl: user.profile_picture_url
      }
    });

  } catch (error) {
    console.error('Erro no login do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao fazer login.' });
  }
};