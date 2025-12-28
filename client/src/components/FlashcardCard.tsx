import CodeSnippet from './CodeSnippet';
import { Link } from 'react-router-dom';

interface FlashcardCardProps {
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
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function FlashcardCard({
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
  onEdit,
  onDelete,
}: FlashcardCardProps) {
  const safeDifficulty =
    difficulty && Object.prototype.hasOwnProperty.call(difficultyColors, difficulty)
      ? difficulty
      : 'medium';
  const safeTags = Array.isArray(tags) ? tags : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-card-dark rounded-xl p-4 sm:p-6 border border-border-dark hover:border-primary/50 transition-colors duration-200 ease-out group">
      {/* Header */}
      <div className="relative mb-4">
        <div className="pr-24">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded max-w-[10rem] truncate">
              {subject}
            </span>
            <span className="px-2 py-1 bg-card-hover text-text-secondary text-xs rounded max-w-[10rem] truncate">
              {category}
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${difficultyColors[safeDifficulty]}`}
            >
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

        {/* Action buttons */}
        <div className="absolute top-0 right-0 flex gap-2 opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-1 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-200 ease-out">
          {onEdit && (
            <button
              onClick={() => onEdit(id)}
              className="h-10 w-10 flex items-center justify-center bg-background-dark border border-border-dark hover:bg-card-hover rounded-lg transition-colors duration-200 ease-out text-text-secondary hover:text-white"
              title="Edit flashcard"
            >
              <span className="material-symbols-outlined text-[20px] leading-none">edit</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="h-10 w-10 flex items-center justify-center bg-background-dark border border-border-dark hover:bg-red-500/10 rounded-lg transition-colors duration-200 ease-out text-red-300 hover:text-red-200"
              title="Delete flashcard"
            >
              <span className="material-symbols-outlined text-[20px] leading-none">delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Front side */}
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

      {/* Back side */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-secondary mb-2">Answer:</h3>
        <p className="text-white line-clamp-3">{back}</p>
      </div>

      {/* Code snippet with syntax highlighting */}
      {codeSnippet && codeLanguage && codeLanguage !== 'None' && (
        <div className="mb-4">
          <CodeSnippet code={codeSnippet} language={codeLanguage} />
        </div>
      )}

      {/* Tags */}
      {safeTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {safeTags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
