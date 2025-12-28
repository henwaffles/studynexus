import { useEffect, useState } from 'react';
import CodeSnippet from './CodeSnippet';

interface StudyCardProps {
  front: string;
  back: string;
  subject: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  codeSnippet?: string | null;
  codeLanguage?: string | null;
  imageUrl?: string | null;
  isMastered?: boolean;
  onToggleMastered?: () => void;
}

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function StudyCard({
  front,
  back,
  subject,
  category,
  difficulty,
  codeSnippet,
  codeLanguage,
  imageUrl,
  isMastered = false,
  onToggleMastered,
}: StudyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [front, back]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Card Container with 3D Perspective */}
      <div
        className="relative w-full cursor-pointer"
        style={{ perspective: '900px' }}
        onClick={handleFlip}
      >
        {/* Flip Container */}
        <div
          className="relative w-full preserve-3d will-change-transform min-h-[340px] sm:min-h-[400px]"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 900ms cubic-bezier(0.25, 0.9, 0.25, 1)',
          }}
        >
          {/* Front of Card */}
          <div
            className="absolute w-full backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="bg-card-dark rounded-2xl p-4 sm:p-8 border-2 border-primary/30 shadow-xl min-h-[340px] sm:min-h-[400px] flex flex-col">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 bg-primary/20 text-primary text-xs sm:text-sm font-medium rounded-lg max-w-[14rem] truncate" title={subject}>
                    {subject}
                  </span>
                  <span className="px-2.5 py-1 bg-card-hover text-text-secondary text-xs sm:text-sm rounded-lg max-w-[14rem] truncate" title={category}>
                    {category}
                  </span>
                  <span
                    className={`px-2.5 py-1 text-xs sm:text-sm font-medium rounded-lg border ${difficultyColors[difficulty]}`}
                  >
                    {difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isMastered && (
                    <span className="px-2.5 py-1 bg-green-500/20 text-green-400 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Mastered
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs sm:text-sm font-medium rounded-lg">
                    Front
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-medium text-text-primary whitespace-pre-wrap">
                    {front}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-text-secondary flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">touch_app</span>
                  Tap or press Space to reveal answer
                </p>
              </div>
            </div>
          </div>

          {/* Back of Card */}
          <div
            className="absolute w-full backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="bg-card-dark rounded-2xl p-4 sm:p-8 border-2 border-green-500/30 shadow-xl min-h-[340px] sm:min-h-[400px] flex flex-col">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 bg-primary/20 text-primary text-xs sm:text-sm font-medium rounded-lg max-w-[14rem] truncate" title={subject}>
                    {subject}
                  </span>
                  <span className="px-2.5 py-1 bg-card-hover text-text-secondary text-xs sm:text-sm rounded-lg max-w-[14rem] truncate" title={category}>
                    {category}
                  </span>
                  <span
                    className={`px-2.5 py-1 text-xs sm:text-sm font-medium rounded-lg border ${difficultyColors[difficulty]}`}
                  >
                    {difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isMastered && (
                    <span className="px-2.5 py-1 bg-green-500/20 text-green-400 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Mastered
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-green-500/20 text-green-400 text-xs sm:text-sm font-medium rounded-lg">
                    Back
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-border-dark">
                      <img
                        src={imageUrl}
                        alt="Flashcard"
                        className="w-full max-h-56 sm:max-h-72 object-cover bg-background-dark"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <p className="text-base sm:text-xl text-text-primary whitespace-pre-wrap">
                    {back}
                  </p>
                  
                  {codeSnippet && codeLanguage && (
                    <div className="mt-4">
                      <CodeSnippet code={codeSnippet} language={codeLanguage} />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-text-secondary flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">touch_app</span>
                  Tap or press Space to flip back
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions below card */}
      {onToggleMastered && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMastered();
            }}
            className={`w-full max-w-md min-h-11 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ease-out flex items-center justify-center gap-2 ${
              isMastered
                ? 'bg-card-hover text-text-secondary hover:bg-card-dark border border-border-dark'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
            }`}
          >
            <span className="material-symbols-outlined">
              {isMastered ? 'radio_button_unchecked' : 'check_circle'}
            </span>
            {isMastered ? 'Unmark as Mastered' : 'Mark as Mastered'}
          </button>
        </div>
      )}
    </div>
  );
}
