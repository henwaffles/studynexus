import CodeSnippet from './CodeSnippet';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface PublicFlashcardCardProps {
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
  user?: {
    id: number;
    username: string;
  };
  likeCount?: number;
  likedByMe?: boolean;
  onToggleLike?: (id: number, nextLiked: boolean) => void;
  isMine?: boolean;
  isInLibrary?: boolean;
  onAddToLibrary: (id: number) => void;
}

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function PublicFlashcardCard({
  id,
  front,
  back,
  subject,
  category,
  difficulty,
  codeSnippet,
  codeLanguage,
  tags,
  imageUrl,
  createdAt,
  user,
  likeCount = 0,
  likedByMe = false,
  onToggleLike,
  isMine = false,
  isInLibrary = false,
  onAddToLibrary,
}: PublicFlashcardCardProps) {
  const [likeBump, setLikeBump] = useState(false);

  const safeDifficulty =
    difficulty && Object.prototype.hasOwnProperty.call(difficultyColors, difficulty)
      ? difficulty
      : 'medium';
  const safeTags = Array.isArray(tags) ? tags : [];

  useEffect(() => {
    setLikeBump(true);
    const t = window.setTimeout(() => setLikeBump(false), 280);
    return () => window.clearTimeout(t);
  }, [likedByMe]);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    try {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div
      className={`bg-card-dark rounded-xl p-4 sm:p-6 border transition-colors duration-200 ease-out h-full flex flex-col ${
        isMine
          ? 'border-primary/70'
          : 'border-border-dark hover:border-primary/50'
      }`}
    >
      <div className="relative mb-4">
        <div className="pr-28">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded max-w-[10rem] truncate">
              {subject}
            </span>
            <span className="px-2 py-1 bg-card-hover text-text-secondary text-xs rounded max-w-[10rem] truncate">
              {category}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded border ${difficultyColors[safeDifficulty]}`}>
              {safeDifficulty}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            {formatDate(createdAt)}
            {user && (
              <span className="ml-2">
                · by{' '}
                <Link
                  to={`/u/${encodeURIComponent(user.username)}`}
                  className="text-primary hover:underline"
                >
                  {user.username}
                </Link>
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => onAddToLibrary(id)}
          disabled={isMine || isInLibrary}
          className={`absolute top-0 right-0 px-3 py-2 rounded-lg transition-colors duration-200 ease-out text-sm ${
            isMine || isInLibrary
              ? 'bg-card-hover text-text-secondary cursor-not-allowed border border-border-dark'
              : 'bg-primary hover:bg-primary-hover text-white'
          }`}
          title={
            isMine
              ? 'This is your flashcard'
              : isInLibrary
                ? 'Already in your library'
                : 'Copy this flashcard into your library'
          }
        >
          {isMine ? 'Yours' : isInLibrary ? 'In Library' : 'Add'}
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-secondary mb-2">Question:</h3>
        <div className="flex gap-4 items-start">
          <p className="text-white flex-1">{front}</p>
          {imageUrl && (
            <div className="shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-border-dark bg-background-dark">
                <img
                  src={imageUrl}
                  alt="Flashcard"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-secondary mb-2">Answer:</h3>
        <p className="text-white line-clamp-3">{back}</p>
      </div>

      {codeSnippet && codeLanguage && codeLanguage !== 'None' && (
        <div className="mb-4">
          <CodeSnippet code={codeSnippet} language={codeLanguage} />
        </div>
      )}

      {safeTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {safeTags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer actions (kept in the same place across cards) */}
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={() => onToggleLike?.(id, !likedByMe)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-background-dark border border-border-dark hover:bg-card-hover active:bg-background-dark transition-colors duration-200 ease-out ${
            onToggleLike ? 'cursor-pointer' : 'cursor-default'
          }`}
          title={likedByMe ? 'Unlike' : 'Like'}
        >
          <span
            className={`material-symbols-outlined text-[20px] leading-none transition-colors duration-200 ease-out ${
              likedByMe ? 'fill text-primary' : 'text-text-secondary'
            } ${likeBump ? 'animate-ui-like-bump' : ''}`}
          >
            favorite
          </span>
          <span className="text-sm text-text-secondary tabular-nums">{likeCount}</span>
        </button>
      </div>
    </div>
  );
}
