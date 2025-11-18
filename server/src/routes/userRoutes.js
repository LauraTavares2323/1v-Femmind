const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); 

router.get('/me', authMiddleware.verifyToken, userController.getMe);

router.get('/me/posts', authMiddleware.verifyToken, userController.getMyPosts);

router.get('/me/favorites', authMiddleware.verifyToken, userController.getMyFavoritePosts);

router.put('/me', authMiddleware.verifyToken, userController.updateProfile);

router.get('/:userId/likes', authMiddleware.verifyToken, async (req, res) => {
  const { userId } = req.params;
  if (parseInt(req.user.id) !== parseInt(userId)) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode ver seus próprios likes.' });
  }
  try {
      const [rows] = await pool.query('SELECT post_id FROM likes WHERE user_id = ?', [userId]);
      res.status(200).json(rows);
  } catch (error) {
      console.error('Erro ao buscar likes do usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor ao buscar likes do usuário.' });
  }
});


module.exports = router;