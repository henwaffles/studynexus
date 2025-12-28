const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
const { uploadImageHandler, deleteImageHandler } = require('../controllers/uploadController');

// All upload routes require authentication
router.use(authMiddleware);

// Upload image
router.post('/image', upload.single('image'), uploadImageHandler);

// Delete image
router.delete('/image', deleteImageHandler);

module.exports = router;
