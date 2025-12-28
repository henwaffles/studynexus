const prisma = require('../config/database');

// Get statistics about flashcards
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Get total flashcard count
    const totalCards = await prisma.flashcard.count({ where: { userId } });

    // Get unique subjects
    const flashcards = await prisma.flashcard.findMany({
      where: { userId },
      select: {
        subject: true,
        category: true,
        difficulty: true,
        tags: true,
      },
    });

    // Calculate unique subjects
    const uniqueSubjects = new Set(flashcards.map(card => card.subject));
    const subjectsCount = uniqueSubjects.size;

    // Calculate unique categories
    const uniqueCategories = new Set(flashcards.map(card => card.category));
    const categoriesCount = uniqueCategories.size;

    // Count by difficulty
    const difficultyCount = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    flashcards.forEach(card => {
      if (card.difficulty in difficultyCount) {
        difficultyCount[card.difficulty]++;
      }
    });

    // Get all unique tags
    const allTags = new Set();
    flashcards.forEach(card => {
      if (card.tags) {
        try {
          const tags = JSON.parse(card.tags);
          tags.forEach(tag => allTags.add(tag));
        } catch (e) {
          // Skip invalid JSON
        }
      }
    });

    // Get cards created in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCards = await prisma.flashcard.count({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    res.json({
      success: true,
      data: {
        totalCards,
        subjectsCount,
        categoriesCount,
        tagsCount: allTags.size,
        difficultyCount,
        recentCards,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
};
