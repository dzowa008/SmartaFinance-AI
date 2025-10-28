
import React from 'react';
import { LogoIcon, DashboardIcon, ChatIcon, SunIcon, MoonIcon, SignOutIcon, ClipboardListIcon } from './Icons';

type Theme = 'light' | 'dark';
type View = 'dashboard' | 'chat' | 'financialHub';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  view: View;
  setView: (view: View) => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, setTheme, view, setView, onSignOut }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const navItemClasses = (currentView: View) => 
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
      view === currentView 
        ? 'bg-soft-green-500 text-white' 
        : 'hover:bg-slate-200 dark:hover:bg-navy-800'
    }`;

  return (
    <header className="sticky top-0 z-10 bg-slate-100/80 dark:bg-navy-950/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-8 w-8 text-soft-green-500" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-heading">SmartFinance AI</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-2 p-1 bg-slate-200 dark:bg-navy-900 rounded-xl">
            <button onClick={() => setView('dashboard')} className={navItemClasses('dashboard')}>
              <DashboardIcon className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
             <button onClick={() => setView('financialHub')} className={navItemClasses('financialHub')}>
              <ClipboardListIcon className="h-5 w-5" />
              <span>Financial Hub</span>
            </button>
            <button onClick={() => setView('chat')} className={navItemClasses('chat')}>
              <ChatIcon className="h-5 w-5" />
              <span>AI Assistant</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-navy-800 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>
             <button
              onClick={onSignOut}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-navy-800 transition-colors duration-200"
              aria-label="Sign Out"
            >
              <SignOutIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
      </div>
       {/* Mobile Navigation */}
       <nav className="md:hidden flex items-center justify-center gap-2 p-2 bg-slate-100 dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800">
            <button onClick={() => setView('dashboard')} className={`${navItemClasses('dashboard')} flex-1 justify-center`}>
              <DashboardIcon className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <button onClick={() => setView('financialHub')} className={`${navItemClasses('financialHub')} flex-1 justify-center`}>
              <ClipboardListIcon className="h-5 w-5" />
              <span>Financial Hub</span>
            </button>
            <button onClick={() => setView('chat')} className={`${navItemClasses('chat')} flex-1 justify-center`}>
              <ChatIcon className="h-5 w-5" />
              <span>AI Assistant</span>
            </button>
        </nav>
    </header>
  );
};
