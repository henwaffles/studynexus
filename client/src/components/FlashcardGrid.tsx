import FlashcardCard from './FlashcardCard';

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

interface FlashcardGridProps {
  flashcards: Flashcard[];
  isLoading?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function FlashcardGrid({
  flashcards,
  isLoading = false,
  onEdit,
  onDelete,
}: FlashcardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-card-dark rounded-xl p-4 sm:p-6 border border-border-dark animate-pulse"
          >
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
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="bg-card-dark rounded-xl p-8 border border-border-dark text-center">
        <span className="material-symbols-outlined text-text-secondary text-6xl mb-4">
          style
        </span>
        <h2 className="text-xl font-semibold mb-2">No Flashcards Yet</h2>
        <p className="text-text-secondary">
          Create your first flashcard to get started with your study library.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flashcards.map((flashcard) => (
        <FlashcardCard
          key={flashcard.id}
          {...flashcard}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
