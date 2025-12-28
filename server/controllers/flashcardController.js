const prisma = require('../config/database');
const {
  deleteImage,
  extractPublicId,
  isCloudinaryConfigured,
} = require('../config/cloudinary');

const parseBoolean = (value) => {
  if (value === true || value === false) return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0' || normalized === '') return false;
  }
  if (typeof value === 'number') return value === 1;
  return false;
};

// Get current user's flashcards (private library)
exports.getAllFlashcards = async (req, res) => {
  try {
    const userId = req.user.userId;
    const flashcards = await prisma.flashcard.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse tags JSON string to array for each flashcard
    const flashcardsWithParsedTags = flashcards.map((card) => ({
      ...card,
      tags: card.tags ? JSON.parse(card.tags) : [],
    }));

    res.json({
      success: true,
      count: flashcardsWithParsedTags.length,
      data: flashcardsWithParsedTags,
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flashcards',
    });
  }
};

// Get all public flashcards (Explore)
exports.getPublicFlashcards = async (req, res) => {
  try {
    const requesterUserId = req.user?.userId;

    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(200, requestedLimit))
      : 200;

    const query = {
      where: { isPublic: true, copiedFromId: null },
      take: limit,
      select: {
        id: true,
        front: true,
        back: true,
        subject: true,
        category: true,
        difficulty: true,
        codeSnippet: true,
        codeLanguage: true,
        tags: true,
        imageUrl: true,
        createdAt: true,
        isPublic: true,
        copiedFromId: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }],
    };

    if (requesterUserId) {
      query.select.likes = {
        where: { userId: requesterUserId },
        select: { id: true },
        take: 1,
      };
    }

    const flashcards = await prisma.flashcard.findMany(query);

    const flashcardsWithParsedTags = flashcards.map((card) => ({
      ...card,
      tags: card.tags ? JSON.parse(card.tags) : [],
      likeCount: card._count?.likes || 0,
      likedByMe: requesterUserId ? (card.likes || []).length > 0 : false,
    }));

    res.json({
      success: true,
      count: flashcardsWithParsedTags.length,
      data: flashcardsWithParsedTags,
    });
  } catch (error) {
    console.error('Error fetching public flashcards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch public flashcards',
    });
  }
};

// Like a public flashcard
exports.likeFlashcard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const flashcardId = parseInt(req.params.id);

    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
      select: { id: true, isPublic: true, copiedFromId: true },
    });

    if (!flashcard || !flashcard.isPublic || flashcard.copiedFromId !== null) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard not found',
      });
    }

    await prisma.flashcardLike.upsert({
      where: { flashcardId_userId: { flashcardId, userId } },
      create: { flashcardId, userId },
      update: {},
    });

    const likeCount = await prisma.flashcardLike.count({ where: { flashcardId } });

    res.json({
      success: true,
      data: { flashcardId, likeCount, likedByMe: true },
    });
  } catch (error) {
    console.error('Error liking flashcard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like flashcard',
    });
  }
};

// Unlike a public flashcard
exports.unlikeFlashcard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const flashcardId = parseInt(req.params.id);

    await prisma.flashcardLike.deleteMany({
      where: { flashcardId, userId },
    });

    const likeCount = await prisma.flashcardLike.count({ where: { flashcardId } });

    res.json({
      success: true,
      data: { flashcardId, likeCount, likedByMe: false },
    });
  } catch (error) {
    console.error('Error unliking flashcard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlike flashcard',
    });
  }
};

// Get single flashcard by ID
exports.getFlashcardById = async (req, res) => {
  try {
    const { id } = req.params;
    const flashcard = await prisma.flashcard.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard not found',
      });
    }

    const requesterUserId = req.user?.userId;
    const canRead = flashcard.isPublic || (requesterUserId && flashcard.userId === requesterUserId);
    if (!canRead) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this flashcard',
      });
    }

    // Parse tags JSON string to array
    const flashcardWithParsedTags = {
      ...flashcard,
      tags: flashcard.tags ? JSON.parse(flashcard.tags) : [],
    };

    res.json({
      success: true,
      data: flashcardWithParsedTags,
    });
  } catch (error) {
    console.error('Error fetching flashcard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flashcard',
    });
  }
};

// Create new flashcard
exports.createFlashcard = async (req, res) => {
  try {
    const { front, back, subject, category, difficulty, codeSnippet, codeLanguage, tags, imageUrl, isPublic } =
      req.body;

    // Validate required fields
    if (!front || !back || !subject || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: front, back, subject, and category are required',
      });
    }

    // Validate difficulty
    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid difficulty. Must be easy, medium, or hard',
      });
    }

    // Create flashcard
    const flashcard = await prisma.flashcard.create({
      data: {
        front: front.trim(),
        back: back.trim(),
        subject: subject.trim(),
        category: category.trim(),
        difficulty: difficulty || 'medium',
        codeSnippet: codeSnippet || null,
        codeLanguage: codeLanguage || null,
        tags: tags && Array.isArray(tags) ? JSON.stringify(tags) : null,
        imageUrl: imageUrl || null,
        isPublic: parseBoolean(isPublic),
        userId: req.user.userId, // Add authenticated user ID
      },
    });

    // Parse tags for response
    const flashcardWithParsedTags = {
      ...flashcard,
      tags: flashcard.tags ? JSON.parse(flashcard.tags) : [],
    };

    res.status(201).json({
      success: true,
      message: 'Flashcard created successfully',
      data: flashcardWithParsedTags,
    });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create flashcard',
    });
  }
};

// Update flashcard
exports.updateFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const { front, back, subject, category, difficulty, codeSnippet, codeLanguage, tags, imageUrl, isPublic } =
      req.body;

    // Check if flashcard exists
    const existingFlashcard = await prisma.flashcard.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingFlashcard) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard not found',
      });
    }

    // Check if user owns this flashcard
    if (existingFlashcard.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to edit this flashcard',
      });
    }

    // Validate difficulty if provided
    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid difficulty. Must be easy, medium, or hard',
      });
    }

    // Update flashcard
    const shouldCleanupOldImage =
      imageUrl !== undefined &&
      existingFlashcard.imageUrl &&
      existingFlashcard.imageUrl !== imageUrl;

    if (shouldCleanupOldImage && isCloudinaryConfigured()) {
      const oldPublicId = extractPublicId(existingFlashcard.imageUrl);
      if (oldPublicId) {
        try {
          await deleteImage(oldPublicId);
        } catch (cleanupError) {
          console.warn('Failed to cleanup previous image:', cleanupError.message);
        }
      }
    }

    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: parseInt(id) },
      data: {
        ...(front && { front: front.trim() }),
        ...(back && { back: back.trim() }),
        ...(subject && { subject: subject.trim() }),
        ...(category && { category: category.trim() }),
        ...(difficulty && { difficulty }),
        ...(codeSnippet !== undefined && { codeSnippet: codeSnippet || null }),
        ...(codeLanguage !== undefined && { codeLanguage: codeLanguage || null }),
        ...(tags && { tags: Array.isArray(tags) ? JSON.stringify(tags) : null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(isPublic !== undefined && { isPublic: parseBoolean(isPublic) }),
      },
    });

    // Parse tags for response
    const flashcardWithParsedTags = {
      ...updatedFlashcard,
      tags: updatedFlashcard.tags ? JSON.parse(updatedFlashcard.tags) : [],
    };

    res.json({
      success: true,
      message: 'Flashcard updated successfully',
      data: flashcardWithParsedTags,
    });
  } catch (error) {
    console.error('Error updating flashcard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update flashcard',
    });
  }
};

// Delete flashcard
exports.deleteFlashcard = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if flashcard exists
    const existingFlashcard = await prisma.flashcard.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingFlashcard) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard not found',
      });
    }

    // Check if user owns this flashcard
    if (existingFlashcard.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this flashcard',
      });
    }

    if (existingFlashcard.imageUrl && isCloudinaryConfigured()) {
      const publicId = extractPublicId(existingFlashcard.imageUrl);
      if (publicId) {
        try {
          await deleteImage(publicId);
        } catch (cleanupError) {
          console.warn('Failed to cleanup image on delete:', cleanupError.message);
        }
      }
    }

    // Delete flashcard
    await prisma.flashcard.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Flashcard deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete flashcard',
    });
  }
};

// Copy a public flashcard into the current user's library
exports.copyPublicFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const source = await prisma.flashcard.findUnique({
      where: { id: parseInt(id) },
    });

    if (!source) {
      return res.status(404).json({ success: false, error: 'Flashcard not found' });
    }

    if (source.userId === userId) {
      return res.status(400).json({ success: false, error: 'You already own this flashcard' });
    }

    if (!source.isPublic && source.userId !== userId) {
      return res.status(403).json({ success: false, error: 'This flashcard is not public' });
    }

    const alreadyCopied = await prisma.flashcard.findFirst({
      where: {
        userId,
        copiedFromId: source.id,
      },
      select: { id: true },
    });

    if (alreadyCopied) {
      return res.status(409).json({ success: false, error: 'Already in your library' });
    }

    const copied = await prisma.flashcard.create({
      data: {
        front: source.front,
        back: source.back,
        subject: source.subject,
        category: source.category,
        difficulty: source.difficulty,
        codeSnippet: source.codeSnippet,
        codeLanguage: source.codeLanguage,
        tags: source.tags,
        imageUrl: source.imageUrl,
        isPublic: false,
        copiedFromId: source.id,
        userId,
      },
    });

    const copiedWithParsedTags = {
      ...copied,
      tags: copied.tags ? JSON.parse(copied.tags) : [],
    };

    res.status(201).json({
      success: true,
      message: 'Flashcard added to your library',
      data: copiedWithParsedTags,
    });
  } catch (error) {
    console.error('Error copying flashcard:', error);
    res.status(500).json({ success: false, error: 'Failed to copy flashcard' });
  }
};
