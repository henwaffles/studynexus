const express = require('express');
const auth = require('../middleware/auth');
const deckController = require('../controllers/deckController');

const router = express.Router();

// All deck endpoints require auth
router.use(auth);

router.get('/', deckController.listMyDecks);
router.post('/', deckController.createDeck);
router.get('/:id', deckController.getDeckById);

router.post('/:id/members', deckController.addMember);
router.delete('/:id/members/:userId', deckController.removeMember);

router.post('/:id/flashcards', deckController.addFlashcardToDeck);
router.delete('/:id/flashcards/:flashcardId', deckController.removeFlashcardFromDeck);

module.exports = router;
