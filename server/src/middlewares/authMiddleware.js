const jwt = require('jsonwebtoken');

// Chave secreta para assinar e verificar tokens JWT (a mesma usada em authController.js)
const jwtSecret = process.env.JWT_SECRET || 'senhajwt'; // Use a mesma do controller!

exports.verifyToken = (req, res, next) => {
  // Obter o token do cabeçalho de autorização
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Verificar o token
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // Adiciona as informações do usuário decodificadas ao objeto de requisição
    next(); // Continua para a próxima função middleware/rota
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado.' });
    }
    return res.status(403).json({ message: 'Token inválido.' });
  }
};