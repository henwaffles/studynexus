import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FlashcardGrid from '../components/FlashcardGrid';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  subject: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  codeSnippet?: string | null;
  codeLanguage?: string | null;
  tags?: string[];
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
  };
}

const DEFAULT_AI_PROMPT = `You are given a PDF document. Extract study flashcards from it and output ONLY valid JSON.

Return either:
1) An array of flashcards, OR
2) An object with { "data": [flashcards...] }

Each flashcard must have:
- front (string)
- back (string)
- subject (string)
- category (string)

Optional:
- difficulty: "easy" | "medium" | "hard" (default "medium")
- tags: string[]
- codeLanguage: string (e.g. "JavaScript", "TypeScript", "Python")
- codeSnippet: string
- imageUrl: string
- isPublic: boolean (default false)

Rules:
- Keep answers concise and correct.
- Do NOT include explanations or markdown.
- If a flashcard is about programming (syntax, API usage, commands, config), include BOTH codeLanguage and codeSnippet.
- If there is no relevant code, omit codeLanguage/codeSnippet entirely (do not use "None").
- Preserve code formatting and escape newlines as \\n inside JSON strings.
- Ensure JSON parses without trailing commas.`;

export default function Library() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'subject'>(settings.librarySort);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const [showAiInfo, setShowAiInfo] = useState(false);
  const [showJsonPaste, setShowJsonPaste] = useState(false);
  const [jsonPasteValue, setJsonPasteValue] = useState('');
  const [jsonPasteError, setJsonPasteError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  useEffect(() => {
    setSortBy(settings.librarySort);
  }, [settings.librarySort]);

  useEffect(() => {
    filterAndSortFlashcards();
  }, [flashcards, searchQuery, sortBy]);

  const fetchFlashcards = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/flashcards');
      const raw = response.data.data || [];
      const normalized = (Array.isArray(raw) ? raw : []).map((card: any) => {
        let tags: string[] = [];
        if (Array.isArray(card?.tags)) tags = card.tags;
        else if (typeof card?.tags === 'string') {
          try {
            const parsed = JSON.parse(card.tags);
            tags = Array.isArray(parsed) ? parsed : [];
          } catch {
            tags = [];
          }
        }

        const difficulty = ['easy', 'medium', 'hard'].includes(card?.difficulty)
          ? card.difficulty
          : 'medium';

        return {
          ...card,
          subject: String(card?.subject || ''),
          category: String(card?.category || ''),
          front: String(card?.front || ''),
          back: String(card?.back || ''),
          difficulty,
          tags,
        } as Flashcard;
      });
      setFlashcards(normalized);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortFlashcards = () => {
    let filtered = [...flashcards];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.front.toLowerCase().includes(query) ||
          card.back.toLowerCase().includes(query) ||
          card.subject.toLowerCase().includes(query) ||
          card.category.toLowerCase().includes(query) ||
          card.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'subject') {
        return a.subject.localeCompare(b.subject);
      }
      return 0;
    });

    setFilteredFlashcards(filtered);
  };

  const handleEdit = (id: number) => {
    navigate(`/flashcards?edit=${id}`);
  };

  const handleDelete = async (id: number) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await api.delete(`/flashcards/${pendingDeleteId}`);
      await fetchFlashcards();
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      alert('Failed to delete flashcard');
    } finally {
      setPendingDeleteId(null);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportJson = async () => {
    try {
      const res = await api.get('/flashcards/export/json', { responseType: 'blob' });
      downloadBlob(res.data, 'studynexus-flashcards.json');
    } catch (error) {
      console.error('Export JSON failed:', error);
      alert('Export failed. You may need to log in.');
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await api.get('/flashcards/export/csv', { responseType: 'blob' });
      downloadBlob(res.data, 'studynexus-flashcards.csv');
    } catch (error) {
      console.error('Export CSV failed:', error);
      alert('Export failed. You may need to log in.');
    }
  };

  const handleImportJsonPaste = async () => {
    try {
      setIsImporting(true);
      setJsonPasteError(null);
      const trimmed = jsonPasteValue.trim();
      if (!trimmed) {
        setJsonPasteError('Paste JSON first.');
        return;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(trimmed);
      } catch (parseErr: any) {
        const msg = String(parseErr?.message || 'Invalid JSON');
        setJsonPasteError(
          `Invalid JSON: ${msg}. Tip: quotes inside strings must be escaped like \\\"this\\\".`
        );
        return;
      }

      await api.post('/flashcards/import/json', parsed);
      await fetchFlashcards();

      setJsonPasteValue('');
      setShowJsonPaste(false);
      alert('Import successful!');
    } catch (error) {
      console.error('Import failed:', error);
      const err: any = error;
      const serverMessage = err?.response?.data?.error;
      setJsonPasteError(serverMessage || 'Import failed. Make sure the JSON is valid and you are logged in.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete flashcard?"
        message="This action can't be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-2xl sm:text-3xl">local_library</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">Library</h1>
            {!isLoading && (
              <p className="text-text-secondary mt-1">
                {filteredFlashcards.length} {filteredFlashcards.length === 1 ? 'card' : 'cards'}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAiInfo((prev) => !prev)}
              className="w-10 h-10 bg-card-dark border border-border-dark rounded-lg flex items-center justify-center hover:bg-card-hover transition-colors"
              title="How to generate JSON with an AI"
              aria-label="How to generate JSON with an AI"
              type="button"
            >
              <span className="material-symbols-outlined text-text-secondary">info</span>
            </button>
            <button
              onClick={handleExportJson}
              className="px-3 py-2 bg-card-dark border border-border-dark rounded-lg text-white hover:bg-card-hover transition-colors text-sm"
              title="Export your flashcards as JSON"
            >
              Export JSON
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 bg-card-dark border border-border-dark rounded-lg text-white hover:bg-card-hover transition-colors text-sm"
              title="Export your flashcards as CSV"
            >
              Export CSV
            </button>
            <button
              onClick={() => setShowJsonPaste((prev) => !prev)}
              disabled={isImporting}
              className={`px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm ${
                isImporting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              title="Add flashcards by pasting JSON"
              type="button"
            >
              {isImporting ? 'Importing…' : 'Add JSON'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-card-dark border border-border-dark rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary"
            />
            <span className="material-symbols-outlined absolute right-3 top-2.5 text-text-secondary">search</span>
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => {
                const next = e.target.value as 'newest' | 'oldest' | 'subject';
                setSortBy(next);
                updateSettings({ librarySort: next });
              }}
              className="w-full appearance-none pl-10 pr-10 py-2 bg-card-dark border border-border-dark rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
              aria-label="Sort library"
              title="Sort library"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="subject">By Subject</option>
            </select>
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary">sort</span>
            <span className="material-symbols-outlined absolute right-3 top-2.5 text-text-secondary pointer-events-none">expand_more</span>
          </div>
          </div>
        </div>
      </div>

      {showAiInfo && (
        <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Generate JSON with any AI</h2>
              <p className="text-text-secondary text-sm mt-1">
                Upload your PDF to the AI tool you prefer, paste the prompt below, and ask it to return ONLY JSON.
                Then paste that JSON into “Add JSON”.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAiInfo(false)}
              className="px-3 py-2 bg-card-hover hover:bg-border-dark text-white rounded-lg transition-colors text-sm"
            >
              Close
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Prompt (copy/paste into your AI)</label>
            <pre className="w-full overflow-auto px-4 py-3 bg-background-dark border border-border-dark rounded-lg text-white text-sm font-mono whitespace-pre-wrap">
              {DEFAULT_AI_PROMPT}
            </pre>
          </div>
        </div>
      )}

      {showJsonPaste && (
        <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Paste JSON to add flashcards</h2>
              <p className="text-text-secondary text-sm mt-1">
                Paste the JSON generated by your AI (or your export file contents) and import in one go.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowJsonPaste(false);
                setJsonPasteValue('');
              }}
              className="px-3 py-2 bg-card-hover hover:bg-border-dark text-white rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          </div>

          <textarea
            value={jsonPasteValue}
            onChange={(e) => {
              setJsonPasteValue(e.target.value);
              if (jsonPasteError) setJsonPasteError(null);
            }}
            rows={10}
            placeholder='Paste JSON here (array or { "data": [...] })'
            spellCheck={false}
            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary font-mono text-sm leading-5"
          />

          {jsonPasteError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
              {jsonPasteError}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleImportJsonPaste}
              disabled={isImporting}
              className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                isImporting
                  ? 'bg-card-hover text-text-secondary cursor-not-allowed border border-border-dark'
                  : 'bg-primary hover:bg-primary-hover text-white'
              }`}
            >
              {isImporting ? 'Importing…' : 'Import JSON'}
            </button>
          </div>
        </div>
      )}

      <FlashcardGrid
        flashcards={filteredFlashcards}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {!isLoading && filteredFlashcards.length === 0 && flashcards.length > 0 && (
        <div className="bg-card-dark rounded-xl p-8 border border-border-dark text-center">
          <span className="material-symbols-outlined text-6xl text-text-secondary mb-4 block">search_off</span>
          <h2 className="text-xl font-semibold mb-2">No matches found</h2>
          <p className="text-text-secondary">
            Try adjusting your search query or filters
          </p>
        </div>
      )}

      {!isLoading && flashcards.length === 0 && (
        <div className="bg-card-dark rounded-xl p-8 border border-border-dark text-center">
          <span className="material-symbols-outlined text-6xl text-text-secondary mb-4 block">library_books</span>
          <h2 className="text-xl font-semibold mb-2">Your library is empty</h2>
          <p className="text-text-secondary mb-4">
            Start building your study collection by creating flashcards
          </p>
          <a
            href="/flashcards"
            className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors"
          >
            Create Your First Flashcard
          </a>
        </div>
      )}
    </div>
  );
}
