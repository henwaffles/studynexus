import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PublicFlashcardCard from '../components/PublicFlashcardCard';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

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
  copiedFromId?: number | null;
  userId?: number;
  createdAt: string;
  user?: { id: number; username: string };
}

interface PublicProfile {
  user: { id: number; username: string; createdAt: string; profileImageUrl?: string | null };
  stats: {
    totalFlashcards: number;
    publicFlashcards: number;
    publicSubjects: string[];
    publicCategories: string[];
  };
  recentPublicFlashcards: Flashcard[];
}

export default function Profile() {
  const { username } = useParams();
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [library, setLibrary] = useState<Flashcard[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        if (!username) return;
        setIsLoading(true);
        setError(null);
        const res = await api.get(`/users/${encodeURIComponent(username)}/public`);
        setProfile(res.data.data);
      } catch (e: any) {
        console.error('Failed to load profile:', e);
        setError(e?.response?.data?.error || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [username]);

  const fetchLibrary = async () => {
    try {
      const res = await api.get('/flashcards');
      setLibrary(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch library:', err);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const copiedFromIds = useMemo(() => {
    return new Set(
      (library || [])
        .map((c) => c.copiedFromId)
        .filter((v): v is number => typeof v === 'number')
    );
  }, [library]);

  const handleAdd = async (id: number) => {
    try {
      await api.post(`/flashcards/${id}/copy`);
      setMessage('Added to your library');
      setTimeout(() => setMessage(''), 2500);
      fetchLibrary();
    } catch (err: any) {
      console.error('Failed to add flashcard:', err);
      const apiError = err.response?.data?.error;
      if (err.response?.status === 409) {
        setMessage('Already in your library');
        setTimeout(() => setMessage(''), 2500);
        return;
      }
      alert(apiError || 'Failed to add flashcard');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card-dark rounded-xl p-8 border border-border-dark text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-card-dark rounded-xl p-8 border border-border-dark text-center">
        <span className="material-symbols-outlined text-text-secondary text-6xl mb-4">person_off</span>
        <h2 className="text-xl font-semibold mb-2">Profile not available</h2>
        <p className="text-text-secondary">{error || 'This user may not exist.'}</p>
      </div>
    );
  }

  const isSelf = !!user && user.username === profile.user.username;

  const handleProfileImageUpload = async (file: File) => {
    try {
      setUploadError(null);

      if (!file.type.startsWith('image/')) {
        setUploadError('Please choose an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Max file size is 5MB.');
        return;
      }

      setIsUploading(true);

      const form = new FormData();
      form.append('image', file);
      const uploadRes = await api.post('/upload/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = uploadRes?.data?.data?.url;
      if (!url) {
        setUploadError('Upload failed.');
        return;
      }

      await api.put('/users/me/profile-image', { url });

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                profileImageUrl: url,
              },
            }
          : prev
      );
      updateUser({ profileImageUrl: url });
      setMessage('Profile photo updated');
      setTimeout(() => setMessage(''), 2500);
    } catch (e: any) {
      console.error('Failed to upload profile image:', e);
      setUploadError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {message && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
          {message}
        </div>
      )}

      <div className="bg-card-dark border border-border-dark rounded-xl p-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            {profile.user.profileImageUrl ? (
              <img
                src={profile.user.profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="material-symbols-outlined text-white text-3xl">person</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{profile.user.username}</h1>
            <p className="text-text-secondary">Public profile</p>
          </div>
        </div>

        {isSelf && (
          <div className="mt-6 bg-background-dark border border-border-dark rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-semibold">Profile photo</div>
                <div className="text-sm text-text-secondary">Upload an image (max 5MB).</div>
              </div>
              <label className="inline-flex items-center justify-center px-4 py-2 bg-card-hover hover:bg-border-dark text-white rounded-lg transition-colors duration-200 ease-out cursor-pointer">
                <span className="material-symbols-outlined text-[20px] leading-none mr-2">upload</span>
                <span>{isUploading ? 'Uploading…' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProfileImageUpload(file);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
            </div>
            {uploadError && (
              <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                {uploadError}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-background-dark border border-border-dark rounded-lg p-4">
            <div className="text-text-secondary text-sm">Total flashcards</div>
            <div className="text-2xl font-bold mt-1">{profile.stats.totalFlashcards}</div>
          </div>
          <div className="bg-background-dark border border-border-dark rounded-lg p-4">
            <div className="text-text-secondary text-sm">Public flashcards</div>
            <div className="text-2xl font-bold mt-1">{profile.stats.publicFlashcards}</div>
          </div>
          <div className="bg-background-dark border border-border-dark rounded-lg p-4">
            <div className="text-text-secondary text-sm">Public subjects</div>
            <div className="text-2xl font-bold mt-1">{profile.stats.publicSubjects.length}</div>
          </div>
        </div>

        {(profile.stats.publicSubjects.length > 0 || profile.stats.publicCategories.length > 0) && (
          <div className="mt-6 space-y-3">
            {profile.stats.publicSubjects.length > 0 && (
              <div className="text-sm text-text-secondary">
                <span className="font-semibold text-white">Subjects:</span>{' '}
                {profile.stats.publicSubjects.join(', ')}
              </div>
            )}
            {profile.stats.publicCategories.length > 0 && (
              <div className="text-sm text-text-secondary">
                <span className="font-semibold text-white">Categories:</span>{' '}
                {profile.stats.publicCategories.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xl font-semibold">Recent public flashcards</h2>
        <Link className="text-sm text-text-secondary hover:text-white transition-colors duration-200 ease-out" to="/explore">
          Browse Explore
        </Link>
      </div>

      {profile.recentPublicFlashcards.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-text-secondary text-6xl mb-4">style</span>
          <h3 className="text-lg font-semibold mb-2">No public flashcards</h3>
          <p className="text-text-secondary">This user hasn’t shared any flashcards publicly yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.recentPublicFlashcards.map((card) => (
            <PublicFlashcardCard
              key={card.id}
              {...card}
              isMine={!!user && (card.userId === user.id || card.user?.id === user.id)}
              isInLibrary={copiedFromIds.has(card.id)}
              onAddToLibrary={handleAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
