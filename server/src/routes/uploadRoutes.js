const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post(
  '/profile-picture',
  authMiddleware.verifyToken,
  uploadController.uploadProfilePicture,
  uploadController.handleProfilePictureUpload
);

router.post(
  '/post-image',
  authMiddleware.verifyToken,
  uploadController.uploadPostImage,
  uploadController.handlePostImageUpload
);

module.exports = router;