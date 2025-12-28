const prisma = require('../config/database');

const requireDeckMember = async (deckId, userId) => {
  const membership = await prisma.deckMember.findUnique({
    where: { deckId_userId: { deckId, userId } },
  });
  return membership;
};

const requireDeckOwner = async (deckId, userId) => {
  const membership = await requireDeckMember(deckId, userId);
  if (!membership) return null;
  if (membership.role !== 'owner') return null;
  return membership;
};

exports.listMyDecks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const memberships = await prisma.deckMember.findMany({
      where: { userId },
      include: {
        deck: {
          include: {
            owner: { select: { id: true, username: true } },
            _count: { select: { members: true, cards: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const decks = memberships.map((m) => ({
      ...m.deck,
      myRole: m.role,
    }));

    res.json({ success: true, count: decks.length, data: decks });
  } catch (error) {
    console.error('Error listing decks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch decks' });
  }
};

exports.createDeck = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, error: 'Deck name is required' });
    }

    const deck = await prisma.deck.create({
      data: {
        name: String(name).trim(),
        description: description ? String(description).trim() : null,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        owner: { select: { id: true, username: true } },
        _count: { select: { members: true, cards: true } },
      },
    });

    res.status(201).json({ success: true, data: deck });
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(500).json({ success: false, error: 'Failed to create deck' });
  }
};

exports.getDeckById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deckId = Number(req.params.id);

    if (!deckId || Number.isNaN(deckId)) {
      return res.status(400).json({ success: false, error: 'Invalid deck id' });
    }

    const membership = await requireDeckMember(deckId, userId);
    if (!membership) {
      return res.status(403).json({ success: false, error: 'You do not have access to this deck' });
    }

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        owner: { select: { id: true, username: true } },
        members: {
          include: { user: { select: { id: true, username: true } } },
          orderBy: { createdAt: 'asc' },
        },
        cards: {
          include: {
            flashcard: {
              include: { user: { select: { id: true, username: true } } },
            },
            addedBy: { select: { id: true, username: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!deck) {
      return res.status(404).json({ success: false, error: 'Deck not found' });
    }

    // Parse tags
    const deckWithParsedTags = {
      ...deck,
      myRole: membership.role,
      cards: deck.cards.map((link) => ({
        ...link,
        flashcard: {
          ...link.flashcard,
          tags: link.flashcard.tags ? JSON.parse(link.flashcard.tags) : [],
        },
      })),
    };

    res.json({ success: true, data: deckWithParsedTags });
  } catch (error) {
    console.error('Error fetching deck:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch deck' });
  }
};

exports.addMember = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deckId = Number(req.params.id);
    const { username } = req.body;

    if (!deckId || Number.isNaN(deckId)) {
      return res.status(400).json({ success: false, error: 'Invalid deck id' });
    }

    if (!username || !String(username).trim()) {
      return res.status(400).json({ success: false, error: 'Username is required' });
    }

    const ownerMembership = await requireDeckOwner(deckId, userId);
    if (!ownerMembership) {
      return res.status(403).json({ success: false, error: 'Only the deck owner can add members' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { username: String(username).trim() },
      select: { id: true, username: true },
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (targetUser.id === userId) {
      return res.status(400).json({ success: false, error: 'You are already a member' });
    }

    const existing = await prisma.deckMember.findUnique({
      where: { deckId_userId: { deckId, userId: targetUser.id } },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'User is already a member of this deck' });
    }

    const member = await prisma.deckMember.create({
      data: {
        deckId,
        userId: targetUser.id,
        role: 'member',
      },
      include: { user: { select: { id: true, username: true } } },
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    console.error('Error adding deck member:', error);
    res.status(500).json({ success: false, error: 'Failed to add member' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const requesterId = req.user.userId;
    const deckId = Number(req.params.id);
    const memberUserId = Number(req.params.userId);

    if (!deckId || Number.isNaN(deckId) || !memberUserId || Number.isNaN(memberUserId)) {
      return res.status(400).json({ success: false, error: 'Invalid parameters' });
    }

    const membership = await requireDeckMember(deckId, requesterId);
    if (!membership) {
      return res.status(403).json({ success: false, error: 'You do not have access to this deck' });
    }

    // Owner can remove anyone; members can remove themselves
    const isOwner = membership.role === 'owner';
    const isSelf = requesterId === memberUserId;
    if (!isOwner && !isSelf) {
      return res.status(403).json({ success: false, error: 'Not allowed' });
    }

    const target = await prisma.deckMember.findUnique({
      where: { deckId_userId: { deckId, userId: memberUserId } },
    });

    if (!target) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    if (target.role === 'owner') {
      return res.status(400).json({ success: false, error: 'Cannot remove the deck owner' });
    }

    await prisma.deckMember.delete({
      where: { deckId_userId: { deckId, userId: memberUserId } },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing deck member:', error);
    res.status(500).json({ success: false, error: 'Failed to remove member' });
  }
};

exports.addFlashcardToDeck = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deckId = Number(req.params.id);
    const { flashcardId } = req.body;

    if (!deckId || Number.isNaN(deckId)) {
      return res.status(400).json({ success: false, error: 'Invalid deck id' });
    }

    const membership = await requireDeckMember(deckId, userId);
    if (!membership) {
      return res.status(403).json({ success: false, error: 'You do not have access to this deck' });
    }

    const fid = Number(flashcardId);
    if (!fid || Number.isNaN(fid)) {
      return res.status(400).json({ success: false, error: 'Invalid flashcard id' });
    }

    // Ensure flashcard exists; deck membership grants read access even if private.
    const card = await prisma.flashcard.findUnique({
      where: { id: fid },
      select: { id: true },
    });

    if (!card) {
      return res.status(404).json({ success: false, error: 'Flashcard not found' });
    }

    const existing = await prisma.deckFlashcard.findUnique({
      where: { deckId_flashcardId: { deckId, flashcardId: fid } },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Flashcard is already in this deck' });
    }

    const link = await prisma.deckFlashcard.create({
      data: {
        deckId,
        flashcardId: fid,
        addedById: userId,
      },
      include: {
        flashcard: {
          include: { user: { select: { id: true, username: true } } },
        },
        addedBy: { select: { id: true, username: true } },
      },
    });

    const linkWithParsedTags = {
      ...link,
      flashcard: {
        ...link.flashcard,
        tags: link.flashcard.tags ? JSON.parse(link.flashcard.tags) : [],
      },
    };

    res.status(201).json({ success: true, data: linkWithParsedTags });
  } catch (error) {
    console.error('Error adding flashcard to deck:', error);
    res.status(500).json({ success: false, error: 'Failed to add flashcard to deck' });
  }
};

exports.removeFlashcardFromDeck = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deckId = Number(req.params.id);
    const flashcardId = Number(req.params.flashcardId);

    if (!deckId || Number.isNaN(deckId) || !flashcardId || Number.isNaN(flashcardId)) {
      return res.status(400).json({ success: false, error: 'Invalid parameters' });
    }

    const membership = await requireDeckMember(deckId, userId);
    if (!membership) {
      return res.status(403).json({ success: false, error: 'You do not have access to this deck' });
    }

    const existing = await prisma.deckFlashcard.findUnique({
      where: { deckId_flashcardId: { deckId, flashcardId } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Flashcard is not in this deck' });
    }

    await prisma.deckFlashcard.delete({
      where: { deckId_flashcardId: { deckId, flashcardId } },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing flashcard from deck:', error);
    res.status(500).json({ success: false, error: 'Failed to remove flashcard from deck' });
  }
};
