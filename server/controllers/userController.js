const prisma = require('../config/database');
const { deleteImage, extractPublicId, isCloudinaryConfigured } = require('../config/cloudinary');

exports.getPublicProfile = async (req, res) => {
  try {
    const username = String(req.params.username || '').trim();

    if (!username) {
      return res.status(400).json({ success: false, error: 'Username is required' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        profileImageUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const [totalCards, publicCards] = await Promise.all([
      prisma.flashcard.count({ where: { userId: user.id } }),
      prisma.flashcard.count({ where: { userId: user.id, isPublic: true, copiedFromId: null } }),
    ]);

    const publicFlashcards = await prisma.flashcard.findMany({
      where: { userId: user.id, isPublic: true, copiedFromId: null },
      select: { subject: true, category: true },
    });

    const subjects = Array.from(new Set(publicFlashcards.map((c) => c.subject))).sort();
    const categories = Array.from(new Set(publicFlashcards.map((c) => c.category))).sort();

    const recentPublic = await prisma.flashcard.findMany({
      where: { userId: user.id, isPublic: true, copiedFromId: null },
      include: {
        user: { select: { id: true, username: true, profileImageUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    const recentWithParsedTags = recentPublic.map((card) => ({
      ...card,
      tags: card.tags ? JSON.parse(card.tags) : [],
    }));

    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalFlashcards: totalCards,
          publicFlashcards: publicCards,
          publicSubjects: subjects,
          publicCategories: categories,
        },
        recentPublicFlashcards: recentWithParsedTags,
      },
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const q = String(req.query.q || '').trim().toLowerCase();

    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q,
        },
      },
      select: {
        id: true,
        username: true,
        profileImageUrl: true,
      },
      orderBy: { username: 'asc' },
      take: 8,
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ success: false, error: 'Failed to search users' });
  }
};

exports.updateMyProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const url = String(req.body?.url || '').trim();

    if (!url) {
      return res.status(400).json({ success: false, error: 'Image URL is required' });
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImageUrl: true },
    });

    if (existing?.profileImageUrl && existing.profileImageUrl !== url && isCloudinaryConfigured()) {
      const publicId = extractPublicId(existing.profileImageUrl);
      if (publicId) {
        try {
          await deleteImage(publicId);
        } catch (e) {
          console.warn('Failed to delete previous profile image:', e?.message || e);
        }
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl: url },
      select: {
        id: true,
        email: true,
        username: true,
        profileImageUrl: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile image' });
  }
};
