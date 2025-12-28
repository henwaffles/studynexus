import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StudyCard from '../components/StudyCard';
import api from '../utils/api';

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

export default function Study() {
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Get unique subjects for filtering
  const subjects = Array.from(new Set(flashcards.map(f => f.subject)));

  useEffect(() => {
    fetchFlashcards();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          // Flip is handled by the StudyCard component
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'KeyM':
          e.preventDefault();
          handleToggleMastered();
          break;
        case 'Escape':
          e.preventDefault();
          navigate('/flashcards');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, flashcards, masteredCards]);

  const fetchFlashcards = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/flashcards');
      const cards = response.data.data || [];
      
      if (cards.length === 0) {
        setShowCompleted(true);
      }
      
      setFlashcards(cards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const filteredFlashcards = useMemo(() => {
    return flashcards.filter((card) => {
      if (filterSubject !== 'all' && card.subject !== filterSubject) return false;
      if (filterDifficulty !== 'all' && card.difficulty !== filterDifficulty) return false;
      return true;
    });
  }, [flashcards, filterSubject, filterDifficulty]);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }
    if (currentIndex === filteredFlashcards.length - 1) {
      setShowCompleted(true);
    }
  }, [currentIndex, filteredFlashcards.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleToggleMastered = useCallback(() => {
    const currentCard = filteredFlashcards[currentIndex];
    if (!currentCard) return;

    setMasteredCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentCard.id)) {
        newSet.delete(currentCard.id);
      } else {
        newSet.add(currentCard.id);
      }
      return newSet;
    });
  }, [currentIndex, filteredFlashcards]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowCompleted(false);
  };

  const handleFilterChange = (subject: string, difficulty: string) => {
    setFilterSubject(subject);
    setFilterDifficulty(difficulty);
    setCurrentIndex(0);
    setShowCompleted(false);
  };

  const activeFilterCount = (filterSubject !== 'all' ? 1 : 0) + (filterDifficulty !== 'all' ? 1 : 0);

  const currentCard = filteredFlashcards[currentIndex];
  const progress = filteredFlashcards.length > 0
    ? Math.round(((currentIndex + 1) / filteredFlashcards.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-card-dark rounded-xl p-8 border border-border-dark text-center max-w-md">
          <span className="material-symbols-outlined text-text-secondary text-6xl mb-4">
            school
          </span>
          <h2 className="text-2xl font-semibold mb-2">No Flashcards to Study</h2>
          <p className="text-text-secondary mb-6">
            Create some flashcards first to start your study session.
          </p>
          <button
            onClick={() => navigate('/flashcards')}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors"
          >
            Go to Flashcards
          </button>
        </div>
      </div>
    );
  }

  if (showCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-card-dark rounded-xl p-8 border border-border-dark text-center max-w-md">
          <span className="material-symbols-outlined text-green-400 text-6xl mb-4">
            celebration
          </span>
          <h2 className="text-2xl font-semibold mb-2">Study Session Complete!</h2>
          <p className="text-text-secondary mb-4">
            You've reviewed all {filteredFlashcards.length} flashcard{filteredFlashcards.length !== 1 ? 's' : ''}.
          </p>
          <div className="bg-card-hover rounded-lg p-4 mb-6">
            <p className="text-sm text-text-secondary mb-2">Cards Mastered</p>
            <p className="text-3xl font-bold text-green-400">
              {masteredCards.size} / {filteredFlashcards.length}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors"
            >
              Study Again
            </button>
            <button
              onClick={() => navigate('/flashcards')}
              className="flex-1 px-6 py-3 bg-card-hover hover:bg-border-dark text-text-primary rounded-lg font-medium transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Study Mode</h1>
            <p className="text-text-secondary">
              Review your flashcards and track your progress
            </p>
          </div>
          <button
            onClick={() => navigate('/flashcards')}
            className="w-full sm:w-auto px-4 py-2 bg-card-dark hover:bg-card-hover text-text-primary rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">close</span>
            Exit Study Mode
          </button>
        </div>

        {/* Filters */}
        <div className="bg-card-dark p-4 rounded-lg border border-border-dark space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-text-secondary shrink-0">
              <span className="material-symbols-outlined text-text-secondary">filter_list</span>
              <span>Filter:</span>
            </div>
            <div className="md:ml-auto text-sm text-text-secondary">
              {filteredFlashcards.length} card{filteredFlashcards.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFilterExpanded((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 bg-card-hover border border-border-dark rounded-lg hover:border-primary/60 transition-colors text-sm text-text-primary"
            >
              <span className="font-medium">Choose</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                  {activeFilterCount}
                </span>
              )}
              <span
                className={`material-symbols-outlined transition-transform ${isFilterExpanded ? 'rotate-180' : ''}`}
              >
                expand_more
              </span>
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  handleFilterChange('all', 'all');
                  setIsFilterExpanded(false);
                }}
                className="md:ml-auto px-3 py-2 bg-card-hover border border-border-dark rounded-lg text-sm text-text-secondary hover:text-white transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {isFilterExpanded && (
            <div className="bg-background-dark border border-border-dark rounded-lg p-4 md:p-6 space-y-6">
              {/* Difficulty */}
              <div>
                <h3 className="font-semibold mb-3">Difficulty</h3>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => handleFilterChange(filterSubject, diff)}
                      className={`px-4 py-2 rounded-full capitalize font-medium transition-colors border ${
                        filterDifficulty === diff
                          ? 'bg-primary text-white border-primary'
                          : 'bg-background-dark text-text-secondary border-border-dark hover:bg-card-hover hover:text-white'
                      }`}
                    >
                      {diff === 'all' ? 'All' : diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              {subjects.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleFilterChange('all', filterDifficulty)}
                      className={`px-4 py-2 rounded-full font-medium transition-colors border ${
                        filterSubject === 'all'
                          ? 'bg-primary text-white border-primary'
                          : 'bg-background-dark text-text-secondary border-border-dark hover:bg-card-hover hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    {subjects.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleFilterChange(subject, filterDifficulty)}
                        className={`px-4 py-2 rounded-full font-medium transition-colors border max-w-[16rem] truncate ${
                          filterSubject === subject
                            ? 'bg-primary text-white border-primary'
                            : 'bg-background-dark text-text-secondary border-border-dark hover:bg-card-hover hover:text-white'
                        }`}
                        title={subject}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 bg-card-dark p-4 rounded-lg border border-border-dark">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Progress</span>
            <span className="text-sm font-medium text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-card-hover rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-2 text-sm text-text-secondary">
            <span>Card {currentIndex + 1} of {filteredFlashcards.length}</span>
            <span>{masteredCards.size} mastered</span>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="max-w-7xl mx-auto mb-8">
        {currentCard && (
          <StudyCard
            {...currentCard}
            isMastered={masteredCards.has(currentCard.id)}
            onToggleMastered={handleToggleMastered}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="w-full sm:w-auto px-6 py-3 bg-card-dark hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed text-text-primary rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Previous
          </button>
          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {currentIndex === filteredFlashcards.length - 1 ? 'Finish' : 'Next'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-6 sm:mt-8 bg-card-dark p-4 rounded-lg border border-border-dark">
          <p className="text-sm font-medium text-text-secondary mb-3">Keyboard Shortcuts</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-card-hover border border-border-dark rounded text-text-primary">Space</kbd>
              <span className="text-text-secondary">Flip card</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-card-hover border border-border-dark rounded text-text-primary">←</kbd>
              <span className="text-text-secondary">Previous</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-card-hover border border-border-dark rounded text-text-primary">→</kbd>
              <span className="text-text-secondary">Next</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-card-hover border border-border-dark rounded text-text-primary">M</kbd>
              <span className="text-text-secondary">Mark mastered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
