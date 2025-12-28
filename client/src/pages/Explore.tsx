import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import PublicFlashcardCard from '../components/PublicFlashcardCard';
import { useAuth } from '../contexts/AuthContext';

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
  isPublic?: boolean;
  copiedFromId?: number | null;
  userId?: number;
  createdAt: string;
  user?: {
    id: number;
    username: string;
  };
  likeCount?: number;
  likedByMe?: boolean;
}

export default function Explore() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [library, setLibrary] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string>('');

  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const blurTimeoutRef = useRef<number | null>(null);

  const [userMatches, setUserMatches] = useState<Array<{ id: number; username: string; profileImageUrl?: string | null }>>([]);

  const fetchPublic = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/flashcards/public');
      const items: Flashcard[] = res.data.data || [];
      setFlashcards(items.filter((c) => c.isPublic === true));
    } catch (err) {
      console.error('Failed to fetch public flashcards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublic();
  }, []);

  const fetchLibrary = async () => {
    try {
      const res = await api.get('/flashcards');
      setLibrary(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch library:', err);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const copiedFromIds = useMemo(() => {
    return new Set(
      (library || [])
        .map((c) => c.copiedFromId)
        .filter((v): v is number => typeof v === 'number')
    );
  }, [library]);

  const normalizedQuery = query.trim().toLowerCase();

  const subjectSuggestions = useMemo(() => {
    if (!normalizedQuery) return [] as string[];
    const subjects = new Set<string>();
    for (const c of flashcards) {
      if (c.subject?.toLowerCase().includes(normalizedQuery)) subjects.add(c.subject);
      if (subjects.size >= 5) break;
    }
    return Array.from(subjects);
  }, [flashcards, normalizedQuery]);

  const tagSuggestions = useMemo(() => {
    if (!normalizedQuery) return [] as string[];
    const tags = new Set<string>();
    for (const c of flashcards) {
      for (const t of c.tags || []) {
        if (t.toLowerCase().includes(normalizedQuery)) tags.add(t);
        if (tags.size >= 5) break;
      }
      if (tags.size >= 5) break;
    }
    return Array.from(tags);
  }, [flashcards, normalizedQuery]);

  const filteredFlashcards = useMemo(() => {
    return !normalizedQuery
      ? flashcards
      : flashcards.filter((c) => {
      const u = c.user?.username || '';
      return (
        c.front?.toLowerCase().includes(normalizedQuery) ||
        c.back?.toLowerCase().includes(normalizedQuery) ||
        c.subject?.toLowerCase().includes(normalizedQuery) ||
        c.category?.toLowerCase().includes(normalizedQuery) ||
        u.toLowerCase().includes(normalizedQuery) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [flashcards, normalizedQuery]);

  useEffect(() => {
    if (!normalizedQuery) {
      setUserMatches([]);
      return;
    }

    const handle = window.setTimeout(async () => {
      try {
        const res = await api.get('/users/search', { params: { q: normalizedQuery } });
        setUserMatches(res.data.data || []);
      } catch (e) {
        console.error('Failed to search users:', e);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [normalizedQuery]);

  const handleAdd = async (id: number) => {
    try {
      await api.post(`/flashcards/${id}/copy`);
      setMessage('Added to your library');
      setTimeout(() => setMessage(''), 2500);
      fetchLibrary();
    } catch (err: any) {
      console.error('Failed to add flashcard:', err);
      const apiError = err.response?.data?.error;
      if (err.response?.status === 409) {
        setMessage('Already in your library');
        setTimeout(() => setMessage(''), 2500);
        return;
      }
      alert(apiError || 'Failed to add flashcard');
    }
  };

  const handleToggleLike = async (id: number, nextLiked: boolean) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      const res = nextLiked
        ? await api.post(`/flashcards/${id}/like`)
        : await api.delete(`/flashcards/${id}/like`);

      const updated = res?.data?.data;
      if (!updated) return;

      setFlashcards((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                likeCount: updated.likeCount,
                likedByMe: updated.likedByMe,
              }
            : c
        )
      );
    } catch (e) {
      console.error('Failed to toggle like:', e);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {message && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
          {message}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-white text-2xl sm:text-3xl">public</span>
        </div>
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold">Explore</h1>
          <p className="text-text-secondary mt-1">Browse public flashcards and add them to your library.</p>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (blurTimeoutRef.current) window.clearTimeout(blurTimeoutRef.current);
            setIsDropdownOpen(true);
          }}
          onBlur={() => {
            blurTimeoutRef.current = window.setTimeout(() => setIsDropdownOpen(false), 150);
          }}
          placeholder="Search users, subjects, tags, or keywords…"
          className="w-full px-4 py-3 bg-card-dark border border-border-dark rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors duration-200 ease-out"
        />
        <span className="material-symbols-outlined absolute right-3 top-3.5 text-text-secondary">search</span>

        {isDropdownOpen && normalizedQuery && (userMatches.length > 0 || subjectSuggestions.length > 0 || tagSuggestions.length > 0) && (
          <div className="absolute z-20 mt-2 w-full bg-card-dark border border-border-dark rounded-xl overflow-hidden">
            {userMatches.length > 0 && (
              <div className="p-3 border-b border-border-dark">
                <div className="text-xs text-text-secondary mb-2">Users</div>
                <div className="space-y-1">
                  {userMatches.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate(`/u/${encodeURIComponent(u.username)}`);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-card-hover transition-colors duration-200 ease-out text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-background-dark border border-border-dark overflow-hidden flex items-center justify-center shrink-0">
                        {u.profileImageUrl ? (
                          <img
                            src={u.profileImageUrl}
                            alt={u.username}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <span className="text-sm text-text-secondary">{u.username.slice(0, 1).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="font-medium">{u.username}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(subjectSuggestions.length > 0 || tagSuggestions.length > 0) && (
              <div className="p-3">
                {subjectSuggestions.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-text-secondary mb-2">Subjects</div>
                    <div className="flex flex-wrap gap-2">
                      {subjectSuggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setQuery(s);
                            setIsDropdownOpen(false);
                          }}
                          className="px-3 py-1.5 bg-background-dark border border-border-dark rounded-full text-sm hover:bg-card-hover transition-colors duration-200 ease-out"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {tagSuggestions.length > 0 && (
                  <div>
                    <div className="text-xs text-text-secondary mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {tagSuggestions.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setQuery(t);
                            setIsDropdownOpen(false);
                          }}
                          className="px-3 py-1.5 bg-background-dark border border-border-dark rounded-full text-sm hover:bg-card-hover transition-colors duration-200 ease-out"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-card-dark rounded-xl p-6 border border-border-dark animate-pulse">
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-20 bg-card-hover rounded"></div>
                <div className="h-6 w-24 bg-card-hover rounded"></div>
              </div>
              <div className="h-4 bg-card-hover rounded mb-2"></div>
              <div className="h-4 bg-card-hover rounded w-3/4 mb-4"></div>
              <div className="h-20 bg-card-hover rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredFlashcards.length === 0 ? (
        <div className="bg-card-dark rounded-xl p-8 border border-border-dark text-center">
          <span className="material-symbols-outlined text-text-secondary text-6xl mb-4">search_off</span>
          <h2 className="text-xl font-semibold mb-2">No matches found</h2>
          <p className="text-text-secondary">Try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlashcards.map((card) => (
            <PublicFlashcardCard
              key={card.id}
              {...card}
              isMine={!!user && (card.userId === user.id || card.user?.id === user.id)}
              isInLibrary={copiedFromIds.has(card.id)}
              onAddToLibrary={handleAdd}
              onToggleLike={handleToggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}
