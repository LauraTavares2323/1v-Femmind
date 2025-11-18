const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');


router.get('/:postId', commentController.getCommentsByPostId);

router.post('/:postId', authMiddleware.verifyToken, commentController.createComment);

module.exports = router;