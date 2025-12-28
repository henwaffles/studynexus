const prisma = require('../config/database');

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

const parseTags = (tagsValue) => {
  if (!tagsValue) return [];
  if (Array.isArray(tagsValue)) return tagsValue;
  if (typeof tagsValue === 'string') {
    try {
      const parsed = JSON.parse(tagsValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const escapeCsv = (value) => {
  const stringValue = value === null || value === undefined ? '' : String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
};

// GET /api/flashcards/export/json (protected) - export current user's flashcards
exports.exportJson = async (req, res) => {
  try {
    const userId = req.user.userId;

    const flashcards = await prisma.flashcard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const data = flashcards.map((card) => ({
      front: card.front,
      back: card.back,
      subject: card.subject,
      category: card.category,
      difficulty: card.difficulty,
      codeSnippet: card.codeSnippet,
      codeLanguage: card.codeLanguage,
      tags: card.tags ? JSON.parse(card.tags) : [],
      imageUrl: card.imageUrl || null,
      isPublic: !!card.isPublic,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    }));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="studynexus-flashcards.json"');
    res.status(200).send(JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2));
  } catch (error) {
    console.error('Error exporting JSON:', error);
    res.status(500).json({ success: false, error: 'Failed to export flashcards' });
  }
};

// GET /api/flashcards/export/csv (protected) - export current user's flashcards
exports.exportCsv = async (req, res) => {
  try {
    const userId = req.user.userId;

    const flashcards = await prisma.flashcard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const header = [
      'front',
      'back',
      'subject',
      'category',
      'difficulty',
      'codeSnippet',
      'codeLanguage',
      'tags',
      'imageUrl',
      'isPublic',
      'createdAt',
      'updatedAt',
    ].join(',');

    const rows = flashcards.map((card) => {
      const tagsArray = card.tags ? JSON.parse(card.tags) : [];
      return [
        escapeCsv(card.front),
        escapeCsv(card.back),
        escapeCsv(card.subject),
        escapeCsv(card.category),
        escapeCsv(card.difficulty),
        escapeCsv(card.codeSnippet || ''),
        escapeCsv(card.codeLanguage || ''),
        escapeCsv(JSON.stringify(tagsArray)),
        escapeCsv(card.imageUrl || ''),
        escapeCsv(card.isPublic ? 'true' : 'false'),
        escapeCsv(card.createdAt.toISOString()),
        escapeCsv(card.updatedAt.toISOString()),
      ].join(',');
    });

    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="studynexus-flashcards.csv"');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ success: false, error: 'Failed to export flashcards' });
  }
};

// POST /api/flashcards/import/json (protected)
// Accepts: { data: FlashcardLike[] } or a raw array
exports.importJson = async (req, res) => {
  try {
    const userId = req.user.userId;

    const payload = req.body;
    const items = Array.isArray(payload) ? payload : payload?.data;

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Invalid import format. Expected an array or { data: [] }' });
    }

    const toCreate = items
      .map((item) => ({
        front: (item.front || '').trim(),
        back: (item.back || '').trim(),
        subject: (item.subject || '').trim(),
        category: (item.category || '').trim(),
        difficulty: item.difficulty || 'medium',
        codeSnippet: item.codeSnippet || null,
        codeLanguage: item.codeLanguage || null,
        tags: JSON.stringify(parseTags(item.tags)),
        imageUrl: item.imageUrl || null,
        isPublic: parseBoolean(item.isPublic),
        userId,
      }))
      .filter((item) => item.front && item.back && item.subject && item.category);

    if (toCreate.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid flashcards found to import' });
    }

    const created = await prisma.flashcard.createMany({
      data: toCreate,
    });

    res.status(201).json({
      success: true,
      message: `Imported ${created.count} flashcard${created.count !== 1 ? 's' : ''}`,
      data: { importedCount: created.count },
    });
  } catch (error) {
    console.error('Error importing JSON:', error);
    res.status(500).json({ success: false, error: 'Failed to import flashcards' });
  }
};
