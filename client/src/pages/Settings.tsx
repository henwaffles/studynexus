import { useSettings } from '../contexts/SettingsContext';

export default function Settings() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-white text-2xl sm:text-3xl">settings</span>
        </div>
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold">Settings</h1>
          <p className="text-text-secondary mt-1">Customize your StudyNexus experience.</p>
        </div>
      </div>

      <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Motion</h2>
          <p className="text-text-secondary text-sm mt-1">Control animations and transitions.</p>
        </div>

        <label className="flex items-center justify-between gap-4 bg-background-dark border border-border-dark rounded-lg px-4 py-3">
          <div>
            <div className="font-medium">Reduce motion</div>
            <div className="text-sm text-text-secondary">Minimizes animations across the app.</div>
          </div>
          <input
            type="checkbox"
            checked={settings.reduceMotion}
            onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
            className="h-5 w-5 accent-primary"
            aria-label="Reduce motion"
          />
        </label>
      </div>

      <div className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Library</h2>
          <p className="text-text-secondary text-sm mt-1">Defaults for your library view.</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-background-dark border border-border-dark rounded-lg px-4 py-3">
          <div>
            <div className="font-medium">Default sort</div>
            <div className="text-sm text-text-secondary">Used when you open Library.</div>
          </div>

          <div className="relative w-full md:w-auto">
            <select
              value={settings.librarySort}
              onChange={(e) => updateSettings({ librarySort: e.target.value as any })}
              className="w-full appearance-none pl-4 pr-10 py-2 bg-card-dark border border-border-dark rounded-lg text-white focus:outline-none focus:border-primary transition-colors duration-200 ease-out"
              aria-label="Default library sort"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="subject">By Subject</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-2.5 text-text-secondary pointer-events-none">expand_more</span>
          </div>
        </div>
      </div>
    </div>
  );
}
