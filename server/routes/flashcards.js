const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');
const importExportController = require('../controllers/importExportController');
const authMiddleware = require('../middleware/auth');

// GET /api/flashcards - Get current user's flashcards (private)
router.get('/', authMiddleware, flashcardController.getAllFlashcards);

// GET /api/flashcards/public - Get all public flashcards (Explore)
router.get('/public', authMiddleware.optional, flashcardController.getPublicFlashcards);

// Like/unlike a public flashcard (Explore)
router.post('/:id/like', authMiddleware, flashcardController.likeFlashcard);
router.delete('/:id/like', authMiddleware, flashcardController.unlikeFlashcard);

// Export/Import (protected - current user's flashcards)
router.get('/export/json', authMiddleware, importExportController.exportJson);
router.get('/export/csv', authMiddleware, importExportController.exportCsv);
router.post('/import/json', authMiddleware, importExportController.importJson);

// POST /api/flashcards/:id/copy - Copy a public flashcard into current user's library
router.post('/:id/copy', authMiddleware, flashcardController.copyPublicFlashcard);

// GET /api/flashcards/:id - Get single flashcard (public if public, otherwise owner-only)
router.get('/:id', authMiddleware.optional, flashcardController.getFlashcardById);

// POST /api/flashcards - Create new flashcard (protected)
router.post('/', authMiddleware, flashcardController.createFlashcard);

// PUT /api/flashcards/:id - Update flashcard (protected)
router.put('/:id', authMiddleware, flashcardController.updateFlashcard);

// DELETE /api/flashcards/:id - Delete flashcard (protected)
router.delete('/:id', authMiddleware, flashcardController.deleteFlashcard);

module.exports = router;
