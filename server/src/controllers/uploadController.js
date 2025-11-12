// src/controllers/uploadController.js

const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Node.js File System module

// Configuração de armazenamento para fotos de perfil
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'profile_pictures');
    fs.mkdirSync(uploadPath, { recursive: true }); // Garante que a pasta exista
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Configuração de armazenamento para imagens de posts
const postImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'post_images');
    fs.mkdirSync(uploadPath, { recursive: true }); // Garante que a pasta exista
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `post_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Filtro de arquivos para permitir apenas imagens
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

// Middleware de upload para fotos de perfil
exports.uploadProfilePicture = multer({
  storage: profileStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('profilePicture'); // 'profilePicture' é o nome do campo no formulário

// Middleware de upload para imagens de posts
exports.uploadPostImage = multer({
  storage: postImageStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('postImage'); // 'postImage' é o nome do campo no formulário

// Controlador para lidar com o upload e salvar a URL no DB (para foto de perfil)
exports.handleProfilePictureUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhuma imagem enviada.' });
  }

  const userId = req.user.id;
  const imageUrl = `/uploads/profile_pictures/${req.file.filename}`; // URL acessível via servidor
  const pool = require('../../db'); // Importa o pool de conexões aqui para evitar circular dependency

  try {
    await pool.query('UPDATE users SET profile_picture_url = ? WHERE id = ?', [imageUrl, userId]);
    res.status(200).json({ message: 'Foto de perfil atualizada com sucesso!', imageUrl });
  } catch (error) {
    console.error('Erro ao salvar URL da foto de perfil no DB:', error);
    // Se o DB falhar, talvez queira deletar o arquivo do sistema de arquivos
    fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar a foto de perfil.' });
  }
};

// Controlador para lidar com o upload e retornar a URL (para imagem de post)
// A rota createPost usará esta URL.
exports.handlePostImageUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhuma imagem enviada.' });
  }
  const imageUrl = `/uploads/post_images/${req.file.filename}`;
  res.status(200).json({ message: 'Imagem enviada com sucesso!', imageUrl });
};