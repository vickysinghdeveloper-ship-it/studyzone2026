import React from 'react';
import { BookOpen, User, ShieldCheck, LogOut, LayoutDashboard, Phone, Sparkles, Moon, Sun } from 'lucide-react';
import { LibrarySettings, User as UserType } from '../../types';

interface NavbarProps {
  settings: LibrarySettings;
  currentUser: UserType | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin: (type: 'student' | 'admin' | 'owner') => void;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentUser,
  activeTab,
  setActiveTab,
  onOpenLogin,
  onLogout,
  darkMode,
  setDarkMode
}) => {
  const publicNavs = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'plans', label: 'Membership Plans' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'rules', label: 'Rules' },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab(currentUser ? (currentUser.role === 'owner' ? 'owner-dashboard' : 'student-dashboard') : 'home')}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-950 to-blue-700 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                {settings.libraryName}
              </span>
              <span className="block text-[11px] font-medium text-blue-600 dark:text-blue-400 tracking-wide uppercase">
                Smart Study Center
              </span>
            </div>
          </div>

          {/* Navigation Links for Public View */}
          {!currentUser && (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {publicNavs.map((nav) => (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === nav.id
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {nav.label}
                </button>
              ))}
            </nav>
          )}

          {/* Dashboard Header Status if logged in */}
          {currentUser && (
            <div className="hidden md:flex items-center space-x-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                  currentUser.role === 'owner'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : currentUser.role === 'admin'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
                {currentUser.role === 'owner'
                  ? 'Library Owner Portal'
                  : currentUser.role === 'admin'
                  ? 'Staff Admin Portal'
                  : 'Student Portal'}
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Welcome, {currentUser.name}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {!currentUser ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <button
                  onClick={() => onOpenLogin('student')}
                  className="inline-flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Student</span> Portal
                </button>
                <button
                  onClick={() => onOpenLogin('admin')}
                  className="inline-flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer border border-indigo-200/60 dark:border-indigo-800"
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-indigo-600" />
                  Admin Login
                </button>
                <button
                  onClick={() => onOpenLogin('owner')}
                  className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                >
                  Owner
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setActiveTab(
                      currentUser.role === 'owner' || currentUser.role === 'admin'
                        ? 'owner-dashboard'
                        : 'student-dashboard'
                    )
                  }
                  className="inline-flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5" />
                  Dashboard
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
