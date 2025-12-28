import { useMemo, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
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

interface FormErrors {
  front?: string;
  back?: string;
  subject?: string;
  category?: string;
}

interface FlashcardFormProps {
  onSubmit: (data: FlashcardFormData, saveAndClose: boolean) => Promise<void>;
  onCancel?: () => void;
  initialData?: FlashcardFormData;
  isEditMode?: boolean;
}

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard'] as const;

const CODE_LANGUAGES = [
  'None',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'Ruby',
  'Go',
  'Rust',
  'PHP',
  'Swift',
  'Kotlin',
  'HTML',
  'CSS',
  'SQL',
  'Bash',
  'Other',
];

export default function FlashcardForm({ onSubmit, onCancel, initialData, isEditMode = false }: FlashcardFormProps) {
  const [formData, setFormData] = useState<FlashcardFormData>(initialData || {
    front: '',
    back: '',
    subject: '',
    category: '',
    difficulty: 'medium',
    codeSnippet: '',
    codeLanguage: 'None',
    tags: [],
    imageUrl: null,
    isPublic: false,
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const effectivePreviewUrl = useMemo(() => {
    if (selectedImageFile) {
      return URL.createObjectURL(selectedImageFile);
    }
    return imagePreviewUrl;
  }, [selectedImageFile, imagePreviewUrl]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.front.trim()) {
      newErrors.front = 'Front side is required';
    }

    if (!formData.back.trim()) {
      newErrors.back = 'Back side is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle tag input
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
      }
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      front: '',
      back: '',
      subject: '',
      category: '',
      difficulty: 'medium',
      codeSnippet: '',
      codeLanguage: 'None',
      tags: [],
      imageUrl: null,
      isPublic: false,
    });
    setTagInput('');
    setErrors({});
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setImageError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageError(null);

    if (!file) {
      setSelectedImageFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSelectedImageFile(null);
      setImageError('Only image files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedImageFile(null);
      setImageError('Image must be 5MB or smaller');
      return;
    }

    setSelectedImageFile(file);
  };

  const removeImage = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setFormData((prev) => ({ ...prev, imageUrl: null }));
    setImageError(null);
  };

  const uploadImageIfNeeded = async (): Promise<string | null> => {
    if (!selectedImageFile) {
      return formData.imageUrl ? String(formData.imageUrl) : null;
    }

    setIsUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', selectedImageFile);

      const response = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = response.data?.data?.url;
      if (!url) {
        throw new Error('Upload succeeded but no URL returned');
      }

      setImagePreviewUrl(url);
      setSelectedImageFile(null);
      setFormData((prev) => ({ ...prev, imageUrl: url }));

      return url;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent, saveAndClose: boolean = false) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedUrl = await uploadImageIfNeeded();
      await onSubmit({ ...formData, imageUrl: uploadedUrl }, saveAndClose);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6">
      {/* Front Side */}
      <div>
        <label htmlFor="front" className="block text-sm font-medium mb-2">
          Front Side <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="front"
          name="front"
          value={formData.front}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-card-dark border ${
            errors.front ? 'border-red-500' : 'border-border-dark'
          } rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors`}
          placeholder="Enter the question or prompt"
        />
        {errors.front && <p className="mt-1 text-sm text-red-500">{errors.front}</p>}
      </div>

      {/* Back Side */}
      <div>
        <label htmlFor="back" className="block text-sm font-medium mb-2">
          Back Side (Answer) <span className="text-red-500">*</span>
        </label>
        <textarea
          id="back"
          name="back"
          value={formData.back}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-3 bg-card-dark border ${
            errors.back ? 'border-red-500' : 'border-border-dark'
          } rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-y`}
          placeholder="Enter the answer or explanation"
        />
        {errors.back && <p className="mt-1 text-sm text-red-500">{errors.back}</p>}
      </div>

      {/* Subject and Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-card-dark border ${
              errors.subject ? 'border-red-500' : 'border-border-dark'
            } rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors`}
            placeholder="e.g., Computer Science"
          />
          {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-card-dark border ${
              errors.category ? 'border-red-500' : 'border-border-dark'
            } rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors`}
            placeholder="e.g., Algorithms"
          />
          {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium mb-2">Difficulty</label>
        <div className="flex flex-col sm:flex-row gap-3">
          {DIFFICULTY_OPTIONS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, difficulty: level }))}
              className={`flex-1 min-h-11 px-4 py-3 rounded-lg font-medium transition-colors ${
                formData.difficulty === level
                  ? 'bg-primary text-white'
                  : 'bg-card-dark text-text-secondary border border-border-dark hover:bg-card-hover'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Image Upload */}
      <div className="border border-border-dark rounded-lg p-4 bg-card-dark/50">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary">image</span>
          <h3 className="font-medium">Image (Optional)</h3>
        </div>

        {effectivePreviewUrl ? (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden border border-border-dark">
              <img
                src={effectivePreviewUrl}
                alt="Flashcard"
                className="w-full max-h-64 object-cover bg-background-dark"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="w-full sm:w-auto min-h-11 px-4 py-2 bg-card-hover hover:bg-border-dark text-white rounded-lg font-medium transition-colors cursor-pointer inline-flex items-center justify-center">
                Replace Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={removeImage}
                className="w-full sm:w-auto min-h-11 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
              >
                Remove
              </button>
              {(isSubmitting || isUploadingImage) && (
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  {isUploadingImage ? 'Uploading image…' : 'Saving…'}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-text-secondary">
              JPG/PNG/WebP, up to 5MB.
            </div>
            <label className="w-full sm:w-auto min-h-11 px-4 py-2 bg-card-hover hover:bg-border-dark text-white rounded-lg font-medium transition-colors cursor-pointer inline-flex items-center justify-center">
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {imageError && <p className="mt-2 text-sm text-red-500">{imageError}</p>}
        {isEditMode && formData.imageUrl && !selectedImageFile && (
          <p className="mt-2 text-xs text-text-secondary">
            Current image will be kept unless replaced.
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium mb-2">
          Tags
        </label>
        <input
          type="text"
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          className="w-full px-4 py-3 bg-card-dark border border-border-dark rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
          placeholder="Type a tag and press Enter"
        />
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Visibility */}
      <div className="bg-background-dark/40 border border-border-dark rounded-lg p-4">
        <button
          type="button"
          role="switch"
          aria-checked={!!formData.isPublic}
          onClick={() => setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))}
          className="w-full flex items-start gap-4 text-left"
        >
          <span
            className={`relative inline-flex h-6 w-11 items-center rounded-full border border-border-dark transition-colors shrink-0 mt-0.5 ${
              formData.isPublic ? 'bg-primary' : 'bg-card-hover'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                formData.isPublic ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </span>
          <div className="flex-1">
            <div className="font-medium">Public</div>
            <div className="text-sm text-text-secondary">
              Public flashcards appear in Explore and can be copied by other users.
            </div>
          </div>
        </button>
      </div>

      {/* Code Snippet Section */}
      <div className="border border-border-dark rounded-lg p-4 bg-card-dark/50">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary">code</span>
          <h3 className="font-medium">Code Snippet (Optional)</h3>
        </div>

        <div className="mb-3">
          <label htmlFor="codeLanguage" className="block text-sm font-medium mb-2">
            Language
          </label>
          <select
            id="codeLanguage"
            name="codeLanguage"
            value={formData.codeLanguage}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-card-dark border border-border-dark rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
          >
            {CODE_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="codeSnippet" className="block text-sm font-medium mb-2">
            Code
          </label>
          <textarea
            id="codeSnippet"
            name="codeSnippet"
            value={formData.codeSnippet}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors font-mono text-sm resize-y"
            placeholder="Paste your code snippet here..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-dark">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto min-h-11 px-6 py-3 bg-card-hover text-white rounded-lg font-medium hover:bg-opacity-80 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={(e) => handleSubmit(e, false)}
          className="w-full sm:flex-1 min-h-11 px-6 py-3 bg-card-hover text-white rounded-lg font-medium hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || isUploadingImage}
        >
          {isSubmitting ? 'Saving...' : 'Save & Create Another'}
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          className="w-full sm:flex-1 min-h-11 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || isUploadingImage}
        >
          {isSubmitting ? 'Saving...' : 'Save & Close'}
        </button>
      </div>
    </form>
  );
}
