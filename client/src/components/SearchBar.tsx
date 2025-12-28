interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search flashcards..." }: SearchBarProps) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 pl-11 bg-card-hover border border-border-dark rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors duration-200 ease-out"
      />
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xl">
        search
      </span>
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center text-text-secondary hover:text-white transition-colors duration-200 ease-out"
          aria-label="Clear search"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      )}
    </div>
  );
}
