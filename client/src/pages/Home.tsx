import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-white text-2xl sm:text-3xl">home</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold">Home</h1>
      </div>

      <div className="bg-card-dark rounded-xl p-4 sm:p-8 border border-border-dark">
        <h2 className="text-2xl font-semibold mb-4">Welcome to StudyNexus!</h2>
        <p className="text-text-secondary mb-6">
          Your personal study library for creating and reviewing flashcards.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate('/flashcards')}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 hover:-translate-y-px active:translate-y-0 bg-primary hover:bg-primary-hover active:bg-primary text-white"
          >
            Create Flashcard
          </button>
          <button
            type="button"
            onClick={() => navigate('/library')}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 hover:-translate-y-px active:translate-y-0 bg-card-hover hover:bg-border-dark active:bg-card-hover text-white"
          >
            Browse Library
          </button>
          <button
            type="button"
            onClick={() => navigate('/study')}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 hover:-translate-y-px active:translate-y-0 bg-card-dark border border-border-dark hover:border-primary/60 hover:bg-card-hover active:bg-card-dark text-white"
          >
            Start Study
          </button>
        </div>
      </div>

      <div className="bg-card-dark rounded-xl p-6 border border-border-dark">
        <h2 className="text-xl font-semibold mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => navigate('/explore')}
            className="flex items-center gap-3 px-4 py-4 bg-background-dark border border-border-dark rounded-lg hover:bg-card-hover hover:border-primary/50 hover:-translate-y-px active:translate-y-0 transition-all duration-200 ease-out text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span className="material-symbols-outlined text-primary">public</span>
            <div>
              <div className="font-semibold">Explore</div>
              <div className="text-sm text-text-secondary">Find public flashcards</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/stats')}
            className="flex items-center gap-3 px-4 py-4 bg-background-dark border border-border-dark rounded-lg hover:bg-card-hover hover:border-primary/50 hover:-translate-y-px active:translate-y-0 transition-all duration-200 ease-out text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span className="material-symbols-outlined text-primary">bar_chart</span>
            <div>
              <div className="font-semibold">Stats</div>
              <div className="text-sm text-text-secondary">See your progress</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 px-4 py-4 bg-background-dark border border-border-dark rounded-lg hover:bg-card-hover hover:border-primary/50 hover:-translate-y-px active:translate-y-0 transition-all duration-200 ease-out text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span className="material-symbols-outlined text-primary">settings</span>
            <div>
              <div className="font-semibold">Settings</div>
              <div className="text-sm text-text-secondary">Customize the app</div>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card-dark p-6 rounded-xl border border-border-dark">
          <span className="material-symbols-outlined text-primary text-3xl mb-3">style</span>
          <h3 className="font-semibold mb-2">Create Flashcards</h3>
          <p className="text-text-secondary text-sm">Add flashcards with code snippets and rich content</p>
        </div>
        
        <div className="bg-card-dark p-6 rounded-xl border border-border-dark">
          <span className="material-symbols-outlined text-primary text-3xl mb-3">search</span>
          <h3 className="font-semibold mb-2">Search & Filter</h3>
          <p className="text-text-secondary text-sm">Find flashcards by tags, subjects, and more</p>
        </div>
        
        <div className="bg-card-dark p-6 rounded-xl border border-border-dark">
          <span className="material-symbols-outlined text-primary text-3xl mb-3">bar_chart</span>
          <h3 className="font-semibold mb-2">Track Progress</h3>
          <p className="text-text-secondary text-sm">Monitor your learning with simple statistics</p>
        </div>
      </div>
    </div>
  );
}
