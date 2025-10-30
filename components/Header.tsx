import React from 'react';
import { LogoIcon, DashboardIcon, ChatIcon, SunIcon, MoonIcon, SignOutIcon, ClipboardListIcon, SettingsIcon, NetWorthIcon, CommunityIcon, ReportsIcon, LearnIcon, InvestmentIcon, SplitterIcon, VaultIcon, WifiOffIcon } from './Icons';

type View = 'dashboard' | 'chat' | 'financialHub' | 'goals' | 'settings' | 'security' | 'netWorth' | 'community' | 'reports' | 'learn' | 'investments' | 'splitter' | 'vault';

interface HeaderProps {
  view: View;
  setView: (view: View) => void;
  onSignOut: () => void;
  isOffline: boolean;
}

export const Header: React.FC<HeaderProps> = ({ view, setView, onSignOut, isOffline }) => {
  const [isDark, setIsDark] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const navItemClasses = (currentView: View) => 
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 font-medium text-sm ${
      view === currentView 
        ? 'bg-soft-green-500 text-white' 
        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800'
    }`;
  
  const mobileNavItemClasses = (currentView: View) =>
    `flex flex-col items-center justify-center flex-1 h-16 rounded-lg transition-colors duration-200 ${
      view === currentView
        ? 'text-soft-green-500'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-800'
    }`;

  return (
    <header className="sticky top-0 z-30 bg-slate-100/80 dark:bg-navy-950/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-8 w-8 text-soft-green-500" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-heading">SmartFinance AI</h1>
            {isOffline && <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-1 rounded-full"><WifiOffIcon className="h-4 w-4"/>Offline</div>}
          </div>
          
          <nav className="hidden xl:flex items-center gap-1 p-1 bg-slate-200 dark:bg-navy-900 rounded-xl">
            <button onClick={() => setView('dashboard')} className={navItemClasses('dashboard')}><DashboardIcon className="h-5 w-5" /><span>Dashboard</span></button>
            <button onClick={() => setView('netWorth')} className={navItemClasses('netWorth')}><NetWorthIcon className="h-5 w-5" /><span>Net Worth</span></button>
            <button onClick={() => setView('investments')} className={navItemClasses('investments')}><InvestmentIcon className="h-5 w-5" /><span>Invest</span></button>
            <button onClick={() => setView('splitter')} className={navItemClasses('splitter')}><SplitterIcon className="h-5 w-5" /><span>Splitter</span></button>
            <button onClick={() => setView('vault')} className={navItemClasses('vault')}><VaultIcon className="h-5 w-5" /><span>Vault</span></button>
            <button onClick={() => setView('reports')} className={navItemClasses('reports')}><ReportsIcon className="h-5 w-5" /><span>Reports</span></button>
            <button onClick={() => setView('chat')} className={navItemClasses('chat')}><ChatIcon className="h-5 w-5" /><span>AI Assistant</span></button>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-navy-800" aria-label="Toggle theme">
              {isDark ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
            <button onClick={() => setView('settings')} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-navy-800" aria-label="Settings">
              <SettingsIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
            </button>
             <button onClick={onSignOut} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-navy-800" aria-label="Sign Out">
              <SignOutIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
      </div>
       {/* Mobile/Tablet Navigation */}
       <nav className="xl:hidden flex items-center justify-around gap-1 p-1 bg-slate-100 dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800">
            <button onClick={() => setView('dashboard')} className={mobileNavItemClasses('dashboard')}><DashboardIcon className="h-5 w-5" /><span className="text-xs font-medium">Dashboard</span></button>
            <button onClick={() => setView('netWorth')} className={mobileNavItemClasses('netWorth')}><NetWorthIcon className="h-5 w-5" /><span className="text-xs font-medium">Net Worth</span></button>
            <button onClick={() => setView('investments')} className={mobileNavItemClasses('investments')}><InvestmentIcon className="h-5 w-5" /><span className="text-xs font-medium">Invest</span></button>
            <button onClick={() => setView('reports')} className={mobileNavItemClasses('reports')}><ReportsIcon className="h-5 w-5" /><span className="text-xs font-medium">Reports</span></button>
            <button onClick={() => setView('chat')} className={mobileNavItemClasses('chat')}><ChatIcon className="h-5 w-5" /><span className="text-xs font-medium">Assistant</span></button>
        </nav>
    </header>
  );
};