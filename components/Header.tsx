import React from 'react';
import { LogoIcon, DashboardIcon, ChatIcon, SunIcon, MoonIcon, SignOutIcon, SettingsIcon, NetWorthIcon, ReportsIcon, InvestmentIcon, WifiOffIcon, BanknotesIcon, MicrophoneIcon } from './Icons';

type View = 'dashboard' | 'chat' | 'financialHub' | 'goals' | 'settings' | 'security' | 'netWorth' | 'community' | 'reports' | 'learn' | 'investments' | 'splitter' | 'vault';

interface HeaderProps {
  view: View;
  setView: (view: View) => void;
  onSignOut: () => void;
  isOffline: boolean;
  onToggleLiveAssistant: () => void;
}

export const Header: React.FC<HeaderProps> = ({ view, setView, onSignOut, isOffline, onToggleLiveAssistant }) => {
  const [isDark, setIsDark] = React.useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  
  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  
  const mobileNavItemClasses = (currentView: View) =>
    `flex flex-col items-center justify-center flex-1 transition-colors duration-200 gap-1 pt-2 pb-1 ${
      view === currentView
        ? 'text-primary'
        : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <>
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 xl:hidden">
            <LogoIcon className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">SmartFinance</h1>
          </div>
          
           <div className="flex-1">
             {isOffline && <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-1 rounded-full"><WifiOffIcon className="h-4 w-4"/>Offline Mode</div>}
           </div>

          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent" aria-label="Toggle theme">
              {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
             <button onClick={onToggleLiveAssistant} className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent" aria-label="Live Assistant">
              <MicrophoneIcon className="h-5 w-5" />
            </button>
            <button onClick={() => setView('settings')} className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent" aria-label="Settings">
              <SettingsIcon className="h-5 w-5" />
            </button>
             <button onClick={onSignOut} className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent" aria-label="Sign Out">
              <SignOutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
     {/* Mobile/Tablet Navigation */}
     <nav className="xl:hidden fixed bottom-0 left-0 right-0 grid grid-cols-6 gap-1 p-1 bg-card/80 backdrop-blur-sm border-t border-border z-40">
        <button onClick={() => setView('dashboard')} className={mobileNavItemClasses('dashboard')}><DashboardIcon className="h-5 w-5" /><span className="text-[10px] font-medium">Dashboard</span></button>
        <button onClick={() => setView('financialHub')} className={mobileNavItemClasses('financialHub')}><BanknotesIcon className="h-5 w-5" /><span className="text-[10px] font-medium">Hub</span></button>
        <button onClick={() => setView('netWorth')} className={mobileNavItemClasses('netWorth')}><NetWorthIcon className="h-5 w-5" /><span className="text-[10px] font-medium">Net Worth</span></button>
        <button onClick={() => setView('investments')} className={mobileNavItemClasses('investments')}><InvestmentIcon className="h-5 w-5" /><span className="text-[10px] font-medium">Invest</span></button>
        <button onClick={() => setView('reports')} className={mobileNavItemClasses('reports')}><ReportsIcon className="h-5 w-5" /><span className="text-[10px] font-medium">Reports</span></button>
        <button onClick={() => setView('chat')} className={mobileNavItemClasses('chat')}><ChatIcon className="h-5 w-5" /><span className="text-[10px] font-medium">Assistant</span></button>
    </nav>
    </>
  );
};