import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: 'Home', path: '/', icon: 'home' },
  { name: 'Flashcards', path: '/flashcards', icon: 'style' },
  { name: 'Library', path: '/library', icon: 'local_library' },
  { name: 'Decks', path: '/decks', icon: 'collections_bookmark' },
  { name: 'Explore', path: '/explore', icon: 'public' },
  { name: 'Study', path: '/study', icon: 'school' },
  { name: 'Stats', path: '/stats', icon: 'bar_chart' },
];

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 h-11 w-11 flex items-center justify-center bg-card-dark rounded-lg border border-border-dark transition-colors duration-200 ease-out hover:bg-card-hover"
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        <span className="material-symbols-outlined text-white">
          {isMobileMenuOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-card-dark border-r border-border-dark z-40
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div className={`flex flex-col h-full ${isCollapsed ? 'p-4' : 'p-6'}`}>
          {/* Logo */}
          <div className="mb-8">
            {!isCollapsed ? (
              <div className="flex items-center justify-between gap-3">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                  title="Go to Home"
                >
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-2xl">school</span>
                  </div>
                  <h1 className="text-xl font-bold whitespace-nowrap">StudyNexus</h1>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsCollapsed((v) => !v)}
                  className="hidden lg:flex h-9 w-9 items-center justify-center bg-card-hover border border-border-dark hover:bg-border-dark rounded-lg transition-colors duration-200 ease-out"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <span className="material-symbols-outlined text-[20px] leading-none text-text-secondary">chevron_left</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center cursor-pointer"
                  title="Go to Home"
                >
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-2xl">school</span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsCollapsed((v) => !v)}
                  className="hidden lg:flex h-9 w-9 items-center justify-center bg-card-hover border border-border-dark hover:bg-border-dark rounded-lg transition-colors duration-200 ease-out"
                  title="Expand sidebar"
                  aria-label="Expand sidebar"
                >
                  <span className="material-symbols-outlined text-[20px] leading-none text-text-secondary">chevron_right</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-lg transition-colors duration-200 ease-out ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-card-hover hover:text-white'
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Bottom menu items */}
          <div className="mt-6 pt-6 border-t border-border-dark mb-4">
            <NavLink
              to="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-lg transition-colors duration-200 ease-out ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-card-hover hover:text-white'
                }`
              }
              title={isCollapsed ? 'Settings' : undefined}
            >
              <span className="material-symbols-outlined">settings</span>
              {!isCollapsed && <span className="font-medium">Settings</span>}
            </NavLink>
          </div>

          {/* User Profile Section */}
          <div className="mt-auto pt-6 border-t border-border-dark">
            {isAuthenticated ? (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (user?.username) navigate(`/u/${encodeURIComponent(user.username)}`);
                  }}
                  className={`w-full text-left flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-lg hover:bg-card-hover transition-colors duration-200 ease-out cursor-pointer`}
                  title="My public profile"
                >
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-white">person</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user?.username}</p>
                      <p className="text-sm text-text-secondary truncate">{user?.email}</p>
                    </div>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className={`w-full mt-2 flex items-center ${isCollapsed ? 'justify-center' : 'gap-2 px-4'} py-2 text-text-secondary hover:bg-card-hover hover:text-white rounded-lg transition-colors duration-200 ease-out`}
                  title={isCollapsed ? 'Logout' : undefined}
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  {!isCollapsed && <span className="text-sm">Logout</span>}
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors duration-200 ease-out"
              >
                <span className="material-symbols-outlined">login</span>
                <span className="font-medium">Log in</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
