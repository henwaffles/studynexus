import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import ConfirmDialog from '../components/ConfirmDialog';

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
  user?: { id: number; username: string };
}

interface DeckMember {
  id: number;
  role: string;
  user: { id: number; username: string };
}

interface DeckCardLink {
  id: number;
  flashcard: Flashcard;
  addedBy: { id: number; username: string };
  createdAt: string;
}

interface Deck {
  id: number;
  name: string;
  description?: string | null;
  owner: { id: number; username: string };
  myRole: string;
  members: DeckMember[];
  cards: DeckCardLink[];
}

export default function DeckDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const deckId = Number(id);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  const [library, setLibrary] = useState<Flashcard[]>([]);
  const [selectedFlashcardId, setSelectedFlashcardId] = useState<string>('');
  const [isAddingCard, setIsAddingCard] = useState(false);

  const [pendingRemoveFlashcardId, setPendingRemoveFlashcardId] = useState<number | null>(null);

  const fetchDeck = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/decks/${deckId}`);
      setDeck(res.data.data);
    } catch (e: any) {
      console.error('Failed to fetch deck:', e);
      setError(e?.response?.data?.error || 'Failed to load deck');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLibrary = async () => {
    try {
      const res = await api.get('/flashcards');
      setLibrary(res.data.data || []);
    } catch (e) {
      console.error('Failed to fetch library for deck add:', e);
    }
  };

  useEffect(() => {
    if (!deckId || Number.isNaN(deckId)) {
      navigate('/decks');
      return;
    }
    fetchDeck();
    fetchLibrary();
  }, [deckId]);

  const isOwner = deck?.myRole === 'owner';

  const deckCardIds = useMemo(() => new Set((deck?.cards || []).map((c) => c.flashcard.id)), [deck]);
  const availableToAdd = useMemo(() => {
    return (library || []).filter((c) => !deckCardIds.has(c.id));
  }, [library, deckCardIds]);

  const handleAddMember = async () => {
    try {
      const username = newMemberUsername.trim();
      if (!username) return;

      setIsAddingMember(true);
      setError(null);
      await api.post(`/decks/${deckId}/members`, { username });
      setNewMemberUsername('');
      await fetchDeck();
    } catch (e: any) {
      console.error('Failed to add member:', e);
      setError(e?.response?.data?.error || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleAddFlashcard = async () => {
    try {
      const fid = Number(selectedFlashcardId);
      if (!fid || Number.isNaN(fid)) return;

      setIsAddingCard(true);
      setError(null);
      await api.post(`/decks/${deckId}/flashcards`, { flashcardId: fid });
      setSelectedFlashcardId('');
      await fetchDeck();
    } catch (e: any) {
      console.error('Failed to add flashcard:', e);
      setError(e?.response?.data?.error || 'Failed to add flashcard');
    } finally {
      setIsAddingCard(false);
    }
  };

  const confirmRemoveFlashcard = async () => {
    if (!pendingRemoveFlashcardId) return;
    try {
      await api.delete(`/decks/${deckId}/flashcards/${pendingRemoveFlashcardId}`);
      setPendingRemoveFlashcardId(null);
      await fetchDeck();
    } catch (e: any) {
      console.error('Failed to remove flashcard:', e);
      setError(e?.response?.data?.error || 'Failed to remove flashcard');
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={pendingRemoveFlashcardId !== null}
        title="Remove from deck?"
        message="This removes the flashcard from the deck (it does not delete it from anyone’s library)."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onCancel={() => setPendingRemoveFlashcardId(null)}
        onConfirm={confirmRemoveFlashcard}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/decks')}
            className="w-10 h-10 bg-card-dark border border-border-dark rounded-lg flex items-center justify-center hover:bg-card-hover transition-colors duration-200 ease-out"
            title="Back"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold truncate">{deck?.name || 'Deck'}</h1>
            {deck?.description && <p className="text-text-secondary mt-1">{deck.description}</p>}
          </div>
        </div>
        {deck?.owner?.username && (
          <div className="text-sm text-text-secondary shrink-0">
            Owner: <Link className="text-primary hover:underline" to={`/u/${deck.owner.username}`}>{deck.owner.username}</Link>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="bg-card-dark rounded-xl p-8 border border-border-dark text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading deck…</p>
        </div>
      ) : !deck ? (
        <div className="bg-card-dark rounded-xl p-8 border border-border-dark text-center">
          <span className="material-symbols-outlined text-text-secondary text-6xl mb-4">error</span>
          <h2 className="text-xl font-semibold mb-2">Deck not available</h2>
          <p className="text-text-secondary">You may not have access, or it doesn’t exist.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-card-dark border border-border-dark rounded-xl p-6 lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Members</h2>
                <span className="text-sm text-text-secondary">{deck.members.length}</span>
              </div>

              <div className="space-y-2">
                {deck.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-background-dark border border-border-dark rounded-lg px-3 py-2">
                    <Link className="text-sm hover:underline" to={`/u/${m.user.username}`}>{m.user.username}</Link>
                    <span className="text-xs text-text-secondary">{m.role}</span>
                  </div>
                ))}
              </div>

              {isOwner && (
                <div className="pt-2 border-t border-border-dark space-y-2">
                  <p className="text-sm text-text-secondary">Add member by username</p>
                  <div className="flex gap-2">
                    <input
                      value={newMemberUsername}
                      onChange={(e) => setNewMemberUsername(e.target.value)}
                      placeholder="username"
                      className="flex-1 px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors duration-200 ease-out"
                    />
                    <button
                      type="button"
                      onClick={handleAddMember}
                      disabled={isAddingMember || !newMemberUsername.trim()}
                      className="px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card-dark border border-border-dark rounded-xl p-6 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Deck flashcards</h2>
                <span className="text-sm text-text-secondary">{deck.cards.length}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative flex-1">
                  <select
                    value={selectedFlashcardId}
                    onChange={(e) => setSelectedFlashcardId(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:outline-none focus:border-primary transition-colors duration-200 ease-out"
                    aria-label="Choose a flashcard to add"
                  >
                    <option value="">Add a flashcard from your library…</option>
                    {availableToAdd.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.subject} • {c.category} • {c.front.slice(0, 60)}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-text-secondary pointer-events-none">expand_more</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddFlashcard}
                  disabled={isAddingCard || !selectedFlashcardId}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to deck
                </button>
              </div>

              {deck.cards.length === 0 ? (
                <div className="bg-background-dark border border-border-dark rounded-lg p-6 text-center">
                  <span className="material-symbols-outlined text-text-secondary text-5xl mb-2">style</span>
                  <p className="text-text-secondary">No flashcards in this deck yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deck.cards.map((link) => (
                    <div key={link.id} className="bg-background-dark border border-border-dark rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm text-text-secondary">
                            {link.flashcard.subject} • {link.flashcard.category} • {link.flashcard.difficulty}
                          </div>
                          <div className="text-white mt-1 font-medium line-clamp-2">{link.flashcard.front}</div>
                          <div className="text-text-secondary text-sm mt-2 line-clamp-2">{link.flashcard.back}</div>
                          {link.flashcard.user?.username && (
                            <div className="text-xs text-text-secondary mt-2">
                              Owner: <Link className="text-primary hover:underline" to={`/u/${link.flashcard.user.username}`}>{link.flashcard.user.username}</Link>
                              <span className="mx-2">·</span>
                              Added by: <Link className="text-primary hover:underline" to={`/u/${link.addedBy.username}`}>{link.addedBy.username}</Link>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setPendingRemoveFlashcardId(link.flashcard.id)}
                          className="h-9 w-9 flex items-center justify-center bg-card-hover border border-border-dark hover:bg-red-500/10 rounded-lg transition-colors duration-200 ease-out text-red-300 hover:text-red-200"
                          title="Remove from deck"
                        >
                          <span className="material-symbols-outlined text-[20px] leading-none">remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
