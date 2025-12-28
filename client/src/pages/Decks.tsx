import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

interface Deck {
  id: number;
  name: string;
  description?: string | null;
  owner?: { id: number; username: string };
  myRole?: string;
  _count?: { members: number; cards: number };
  createdAt: string;
}

export default function Decks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchDecks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/decks');
      setDecks(res.data.data || []);
    } catch (e) {
      console.error('Failed to fetch decks:', e);
      setError('Failed to load decks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleCreate = async () => {
    try {
      const trimmed = name.trim();
      if (!trimmed) return;

      setIsCreating(true);
      setError(null);
      await api.post('/decks', {
        name: trimmed,
        description: description.trim() ? description.trim() : undefined,
      });

      setName('');
      setDescription('');
      await fetchDecks();
    } catch (e: any) {
      console.error('Failed to create deck:', e);
      setError(e?.response?.data?.error || 'Failed to create deck');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-3xl">collections_bookmark</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold">Decks</h1>
          <p className="text-text-secondary mt-1">Create shared decks and study together.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Create a deck</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Deck name"
            className="px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors duration-200 ease-out"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="md:col-span-2 px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors duration-200 ease-out"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating…' : 'Create Deck'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-card-dark rounded-xl p-8 border border-border-dark text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading decks…</p>
        </div>
      ) : decks.length === 0 ? (
        <div className="bg-card-dark rounded-xl p-8 border border-border-dark text-center">
          <span className="material-symbols-outlined text-text-secondary text-6xl mb-4">collections_bookmark</span>
          <h2 className="text-xl font-semibold mb-2">No decks yet</h2>
          <p className="text-text-secondary">Create your first deck to start collaborating.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              to={`/decks/${deck.id}`}
              className="bg-card-dark rounded-xl p-6 border border-border-dark hover:border-primary/50 transition-colors duration-200 ease-out block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold truncate">{deck.name}</h3>
                  {deck.description && (
                    <p className="text-text-secondary text-sm mt-1 line-clamp-2">{deck.description}</p>
                  )}
                </div>
                <span className="px-2 py-1 bg-card-hover border border-border-dark rounded-lg text-xs text-text-secondary shrink-0">
                  {deck.myRole || 'member'}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
                <span>{deck._count?.cards ?? 0} cards</span>
                <span>{deck._count?.members ?? 0} members</span>
              </div>
              {deck.owner?.username && (
                <div className="mt-2 text-xs text-text-secondary">Owner: {deck.owner.username}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
