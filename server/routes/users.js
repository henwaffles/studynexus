const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public user search for Explore suggestions
router.get('/search', userController.searchUsers);

// Authenticated: update my profile image URL
router.put('/me/profile-image', auth, userController.updateMyProfileImage);

// Public profile endpoint
router.get('/:username/public', userController.getPublicProfile);

module.exports = router;
