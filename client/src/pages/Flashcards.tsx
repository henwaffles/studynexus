import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FlashcardForm from '../components/FlashcardForm';
import FlashcardGrid from '../components/FlashcardGrid';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../utils/api';

interface FlashcardFormData {
  front: string;
  back: string;
  subject: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  codeSnippet: string;
  codeLanguage: string;
  tags: string[];
  imageUrl?: string | null;
  isPublic?: boolean;
}

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
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
  };
}

export default function Flashcards() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    subjects: string[];
    categories: string[];
    difficulties: ('easy' | 'medium' | 'hard')[];
    tags: string[];
  }>({
    subjects: [],
    categories: [],
    difficulties: [],
    tags: [],
  });

  // Fetch flashcards on component mount
  useEffect(() => {
    fetchFlashcards();
  }, []);

  // If navigated here with ?edit=<id>, auto-open the edit form.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const edit = params.get('edit');
    const editId = edit ? Number(edit) : null;

    if (!editId || Number.isNaN(editId)) return;
    if (showForm) return;

    const flashcard = flashcards.find((f) => f.id === editId);
    if (!flashcard) return;

    setEditingFlashcard(flashcard);
    setShowForm(true);

    params.delete('edit');
    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
      },
      { replace: true }
    );
  }, [location.pathname, location.search, navigate, flashcards, showForm]);

  // Apply search and filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [flashcards, searchQuery, activeFilters]);

  const fetchFlashcards = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/flashcards');
      setFlashcards(response.data.data || []);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: FlashcardFormData, saveAndClose: boolean) => {
    try {
      if (editingFlashcard) {
        // Update existing flashcard
        await api.put(`/flashcards/${editingFlashcard.id}`, data);
        setSuccessMessage('Flashcard updated successfully!');
      } else {
        // Create new flashcard
        await api.post('/flashcards', data);
        setSuccessMessage('Flashcard created successfully!');
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);

      // Refresh flashcards list
      await fetchFlashcards();

      if (saveAndClose) {
        setShowForm(false);
        setEditingFlashcard(null);
      }
    } catch (error: any) {
      console.error('Error saving flashcard:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save flashcard';
      alert(errorMessage);
      throw error;
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFlashcard(null);
  };

  const handleEdit = (id: number) => {
    const flashcard = flashcards.find(f => f.id === id);
    if (flashcard) {
      setEditingFlashcard(flashcard);
      setShowForm(true);
    }
  };

  const handleDelete = async (id: number) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await api.delete(`/flashcards/${pendingDeleteId}`);
      setSuccessMessage('Flashcard deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchFlashcards();
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      alert('Failed to delete flashcard');
    } finally {
      setPendingDeleteId(null);
    }
  };

  const applyFilters = () => {
    let filtered = [...flashcards];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.front.toLowerCase().includes(query) ||
          card.back.toLowerCase().includes(query) ||
          card.subject.toLowerCase().includes(query) ||
          card.category.toLowerCase().includes(query) ||
          card.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply difficulty filter
    if (activeFilters.difficulties.length > 0) {
      filtered = filtered.filter(card => 
        activeFilters.difficulties.includes(card.difficulty)
      );
    }

    // Apply subject filter
    if (activeFilters.subjects.length > 0) {
      filtered = filtered.filter(card => 
        activeFilters.subjects.includes(card.subject)
      );
    }

    // Apply category filter
    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter(card => 
        activeFilters.categories.includes(card.category)
      );
    }

    // Apply tags filter
    if (activeFilters.tags.length > 0) {
      filtered = filtered.filter(card => 
        card.tags?.some(tag => activeFilters.tags.includes(tag))
      );
    }

    setFilteredFlashcards(filtered);
  };

  // Get unique values for filter options
  const getFilterOptions = () => {
    const subjects = [...new Set(flashcards.map(card => card.subject))];
    const categories = [...new Set(flashcards.map(card => card.category))];
    const allTags = flashcards.flatMap(card => card.tags || []);
    const tags = [...new Set(allTags)];

    return { subjects, categories, tags, difficulties: [] as ('easy' | 'medium' | 'hard')[] };
  };

  if (showForm) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Success message */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(false)}
            className="w-10 h-10 bg-card-dark border border-border-dark rounded-lg flex items-center justify-center hover:bg-card-hover transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-2xl sm:text-3xl">{editingFlashcard ? 'edit' : 'add'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold">{editingFlashcard ? 'Edit Flashcard' : 'Create Flashcard'}</h1>
          </div>
        </div>

        <div className="bg-card-dark rounded-xl p-4 sm:p-8 border border-border-dark">
          <FlashcardForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel}
            initialData={editingFlashcard ? {
              front: editingFlashcard.front,
              back: editingFlashcard.back,
              subject: editingFlashcard.subject,
              category: editingFlashcard.category,
              difficulty: editingFlashcard.difficulty,
              codeSnippet: editingFlashcard.codeSnippet || '',
              codeLanguage: editingFlashcard.codeLanguage || 'None',
              tags: editingFlashcard.tags || [],
              imageUrl: editingFlashcard.imageUrl || null,
              isPublic: !!editingFlashcard.isPublic,
            } : undefined}
            isEditMode={!!editingFlashcard}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete flashcard?"
        message="This action can't be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
      />
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-2xl sm:text-3xl">style</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">Flashcards</h1>
            {!isLoading && (
              <p className="text-text-secondary mt-1">
                {filteredFlashcards.length} of {flashcards.length} {flashcards.length === 1 ? 'card' : 'cards'}
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          New Flashcard
        </button>
      </div>

      {/* Search and Filter */}
      {!isLoading && flashcards.length > 0 && (
        <div className="bg-card-dark p-4 rounded-lg border border-border-dark space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search flashcards..."
              />
            </div>
            <div className="md:ml-auto text-sm text-text-secondary">
              Showing {filteredFlashcards.length} of {flashcards.length}
            </div>
          </div>

          <FilterPanel
            options={getFilterOptions()}
            activeFilters={activeFilters}
            onChange={setActiveFilters}
          />
        </div>
      )}

      <FlashcardGrid
        flashcards={filteredFlashcards}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {!isLoading && filteredFlashcards.length === 0 && flashcards.length > 0 && (
        <div className="bg-card-dark rounded-xl p-8 border border-border-dark text-center">
          <span className="material-symbols-outlined text-6xl text-text-secondary mb-4 block">search_off</span>
          <h2 className="text-xl font-semibold mb-2">No matches found</h2>
          <p className="text-text-secondary">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {!isLoading && flashcards.length === 0 && (
        <div className="text-center py-12">
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors"
          >
            Create Your First Flashcard
          </button>
        </div>
      )}
    </div>
  );
}


