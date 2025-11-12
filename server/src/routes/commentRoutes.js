// src/routes/commentRoutes.js

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Obter comentários de um post (pode ser público)
router.get('/:postId', commentController.getCommentsByPostId);

// Adicionar um comentário (requer autenticação)
router.post('/:postId', authMiddleware.verifyToken, commentController.createComment);

module.exports = router;