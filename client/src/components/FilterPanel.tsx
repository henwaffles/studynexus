import { useState } from 'react';

interface FilterOptions {
  subjects: string[];
  categories: string[];
  difficulties: ('easy' | 'medium' | 'hard')[];
  tags: string[];
}

interface ActiveFilters {
  subjects: string[];
  categories: string[];
  difficulties: ('easy' | 'medium' | 'hard')[];
  tags: string[];
}

interface FilterPanelProps {
  options: FilterOptions;
  activeFilters: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
}

export default function FilterPanel({ options, activeFilters, onChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleFilter = (
    category: keyof ActiveFilters,
    value: string
  ) => {
    const currentValues = activeFilters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onChange({
      ...activeFilters,
      [category]: newValues,
    });
  };

  const clearAllFilters = () => {
    onChange({
      subjects: [],
      categories: [],
      difficulties: [],
      tags: [],
    });
  };

  const activeFilterCount = 
    activeFilters.subjects.length +
    activeFilters.categories.length +
    activeFilters.difficulties.length +
    activeFilters.tags.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-text-secondary shrink-0">
          <span className="material-symbols-outlined text-text-secondary">filter_list</span>
          <span>Filter:</span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-card-hover border border-border-dark rounded-lg hover:border-primary/60 transition-colors duration-200 ease-out text-sm text-text-primary"
        >
          <span className="font-medium">Choose</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
          <span className={`material-symbols-outlined transition-transform duration-200 ease-out ${isExpanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="w-full md:w-auto md:ml-auto px-3 py-2 bg-card-hover border border-border-dark rounded-lg text-sm text-text-secondary hover:text-white transition-colors duration-200 ease-out"
          >
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="bg-background-dark border border-border-dark rounded-lg p-4 md:p-6 space-y-6">
          {/* Difficulty Filter */}
          <div>
            <h3 className="font-semibold mb-3">Difficulty</h3>
            <div className="flex flex-wrap gap-2">
              {['easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => toggleFilter('difficulties', diff)}
                  className={`px-4 py-2 rounded-full capitalize font-medium transition-colors border ${
                    activeFilters.difficulties.includes(diff as any)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background-dark text-text-secondary border-border-dark hover:bg-card-hover hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Filter */}
          {options.subjects.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {options.subjects.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleFilter('subjects', subject)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors border max-w-[16rem] truncate ${
                      activeFilters.subjects.includes(subject)
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

          {/* Category Filter */}
          {options.categories.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {options.categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleFilter('categories', category)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors border max-w-[16rem] truncate ${
                      activeFilters.categories.includes(category)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-background-dark text-text-secondary border-border-dark hover:bg-card-hover hover:text-white'
                    }`}
                    title={category}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags Filter */}
          {options.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {options.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleFilter('tags', tag)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      activeFilters.tags.includes(tag)
                        ? 'bg-primary text-white'
                        : 'bg-background-dark border border-border-dark hover:bg-card-hover'
                    }`}
                    title={tag}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
