import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type LibrarySort = 'newest' | 'oldest' | 'subject';

export interface SettingsState {
  reduceMotion: boolean;
  librarySort: LibrarySort;
}

const STORAGE_KEY = 'studynexus_settings_v1';

const defaultSettings: SettingsState = {
  reduceMotion: false,
  librarySort: 'newest',
};

interface SettingsContextValue {
  settings: SettingsState;
  updateSettings: (patch: Partial<SettingsState>) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function safeParseSettings(raw: string | null): SettingsState {
  if (!raw) return defaultSettings;
  try {
    const parsed = JSON.parse(raw);
    const reduceMotion = Boolean(parsed?.reduceMotion);
    const librarySort: LibrarySort =
      parsed?.librarySort === 'oldest' || parsed?.librarySort === 'subject' || parsed?.librarySort === 'newest'
        ? parsed.librarySort
        : defaultSettings.librarySort;

    return { reduceMotion, librarySort };
  } catch {
    return defaultSettings;
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() => safeParseSettings(localStorage.getItem(STORAGE_KEY)));

  const updateSettings = (patch: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    const root = document.documentElement;
    if (settings.reduceMotion) {
      root.setAttribute('data-reduce-motion', 'true');
    } else {
      root.removeAttribute('data-reduce-motion');
    }
  }, [settings]);

  const value = useMemo(() => ({ settings, updateSettings }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
