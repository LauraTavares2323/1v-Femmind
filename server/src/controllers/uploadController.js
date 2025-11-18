const multer = require('multer');
const path = require('path');
const fs = require('fs'); 

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'profile_pictures');
    fs.mkdirSync(uploadPath, { recursive: true }); 
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const postImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'post_images');
    fs.mkdirSync(uploadPath, { recursive: true }); 
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `post_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

exports.uploadProfilePicture = multer({
  storage: profileStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
}).single('profilePicture'); 

exports.uploadPostImage = multer({
  storage: postImageStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } 
}).single('postImage'); 

exports.handleProfilePictureUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhuma imagem enviada.' });
  }

  const userId = req.user.id;
  const imageUrl = `/uploads/profile_pictures/${req.file.filename}`;
  const pool = require('../../db');

  try {
    await pool.query('UPDATE users SET profile_picture_url = ? WHERE id = ?', [imageUrl, userId]);
    res.status(200).json({ message: 'Foto de perfil atualizada com sucesso!', imageUrl });
  } catch (error) {
    console.error('Erro ao salvar URL da foto de perfil no DB:', error);
    fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar a foto de perfil.' });
  }
};

exports.handlePostImageUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhuma imagem enviada.' });
  }
  const imageUrl = `/uploads/post_images/${req.file.filename}`;
  res.status(200).json({ message: 'Imagem enviada com sucesso!', imageUrl });
};