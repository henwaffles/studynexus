import { useState, useEffect } from 'react';
import api from '../utils/api';

interface StatsData {
  totalCards: number;
  subjectsCount: number;
  categoriesCount: number;
  tagsCount: number;
  difficultyCount: {
    easy: number;
    medium: number;
    hard: number;
  };
  recentCards: number;
}

export default function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCards = stats?.totalCards ?? 0;
  const subjectsCount = stats?.subjectsCount ?? 0;
  const categoriesCount = stats?.categoriesCount ?? 0;
  const tagsCount = stats?.tagsCount ?? 0;
  const recentCards = stats?.recentCards ?? 0;

  const difficulty = stats?.difficultyCount ?? { easy: 0, medium: 0, hard: 0 };
  const difficultyTotal = difficulty.easy + difficulty.medium + difficulty.hard;
  const pctEasy = difficultyTotal ? Math.round((difficulty.easy / difficultyTotal) * 100) : 0;
  const pctMedium = difficultyTotal ? Math.round((difficulty.medium / difficultyTotal) * 100) : 0;
  const pctHard = difficultyTotal ? Math.round((difficulty.hard / difficultyTotal) * 100) : 0;

  const cardsPerSubject = subjectsCount ? (totalCards / subjectsCount) : 0;
  const cardsPerCategory = categoriesCount ? (totalCards / categoriesCount) : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-white text-2xl sm:text-3xl">bar_chart</span>
        </div>
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold">Statistics</h1>
          <p className="text-text-secondary mt-1">Quick overview of your library</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card-dark p-6 rounded-xl border border-border-dark animate-pulse">
              <div className="h-12 bg-border-dark rounded mb-4"></div>
              <div className="h-6 bg-border-dark rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-border-dark rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card-dark p-4 sm:p-6 rounded-xl border border-border-dark">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">style</span>
                <span className="text-3xl font-bold">{totalCards}</span>
              </div>
              <h3 className="font-semibold mb-1">Total Flashcards</h3>
              <p className="text-text-secondary text-sm">Cards in your library</p>
            </div>
            
            <div className="bg-card-dark p-4 sm:p-6 rounded-xl border border-border-dark">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">category</span>
                <span className="text-3xl font-bold">{subjectsCount}</span>
              </div>
              <h3 className="font-semibold mb-1">Subjects</h3>
              <p className="text-text-secondary text-sm">Different topics covered</p>
            </div>

            <div className="bg-card-dark p-4 sm:p-6 rounded-xl border border-border-dark">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">folder</span>
                <span className="text-3xl font-bold">{categoriesCount}</span>
              </div>
              <h3 className="font-semibold mb-1">Categories</h3>
              <p className="text-text-secondary text-sm">Ways you organize your cards</p>
            </div>
            
            <div className="bg-card-dark p-4 sm:p-6 rounded-xl border border-border-dark">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
                <span className="text-3xl font-bold">{recentCards}</span>
              </div>
              <h3 className="font-semibold mb-1">Recent Cards</h3>
              <p className="text-text-secondary text-sm">Added in last 7 days</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card-dark rounded-xl p-6 border border-border-dark">
              <h2 className="text-xl font-semibold mb-4">Difficulty Mix</h2>

              <div className="mb-4">
                <div className="w-full bg-card-hover rounded-full h-3 overflow-hidden border border-border-dark">
                  <div className="h-3 flex">
                    <div className="bg-green-500" style={{ width: `${pctEasy}%` }} />
                    <div className="bg-yellow-500" style={{ width: `${pctMedium}%` }} />
                    <div className="bg-red-500" style={{ width: `${pctHard}%` }} />
                  </div>
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  {difficultyTotal === 0 ? 'No difficulty data yet.' : 'Percent of cards by difficulty.'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Easy</span>
                  </div>
                  <span className="font-semibold">
                    {difficulty.easy} <span className="text-text-secondary text-xs">({pctEasy}%)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Medium</span>
                  </div>
                  <span className="font-semibold">
                    {difficulty.medium} <span className="text-text-secondary text-xs">({pctMedium}%)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Hard</span>
                  </div>
                  <span className="font-semibold">
                    {difficulty.hard} <span className="text-text-secondary text-xs">({pctHard}%)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card-dark rounded-xl p-6 border border-border-dark">
              <h2 className="text-xl font-semibold mb-4">Library Insights</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Total Categories</span>
                  <span className="font-semibold">{categoriesCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Total Tags</span>
                  <span className="font-semibold">{tagsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Total Subjects</span>
                  <span className="font-semibold">{subjectsCount}</span>
                </div>

                <div className="pt-3 mt-3 border-t border-border-dark space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Avg cards / subject</span>
                    <span className="font-semibold">{cardsPerSubject ? cardsPerSubject.toFixed(1) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Avg cards / category</span>
                    <span className="font-semibold">{cardsPerCategory ? cardsPerCategory.toFixed(1) : '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card-dark rounded-xl p-6 border border-border-dark">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">tips_and_updates</span>
              <div>
                <p className="font-semibold">Tip</p>
                <p className="text-text-secondary text-sm">
                  Use Study Mode to review cards and mark them as mastered.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
