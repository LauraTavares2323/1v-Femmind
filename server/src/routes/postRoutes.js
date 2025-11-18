const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:id', postController.getPostById);
router.post('/', authMiddleware.verifyToken, postController.createPost);

router.get('/', postController.searchPosts); 

router.post('/:postId/like', authMiddleware.verifyToken, postController.toggleLike);
router.post('/:postId/favorite', authMiddleware.verifyToken, postController.toggleFavorite);

module.exports = router;