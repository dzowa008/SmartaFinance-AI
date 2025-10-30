import React from 'react';
import { LogoIcon, DashboardIcon, ChatIcon, NetWorthIcon, ReportsIcon, InvestmentIcon, SplitterIcon, VaultIcon, BanknotesIcon, CommunityIcon, LearnIcon, TargetIcon } from './Icons';

type View = 'dashboard' | 'chat' | 'financialHub' | 'goals' | 'settings' | 'security' | 'netWorth' | 'community' | 'reports' | 'learn' | 'investments' | 'splitter' | 'vault';

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'financialHub', label: 'Financial Hub', icon: BanknotesIcon },
    { id: 'netWorth', label: 'Net Worth', icon: NetWorthIcon },
    { id: 'investments', label: 'Investments', icon: InvestmentIcon },
    { id: 'goals', label: 'Goals', icon: TargetIcon },
    { id: 'splitter', label: 'Expense Splitter', icon: SplitterIcon },
    { id: 'vault', label: 'Document Vault', icon: VaultIcon },
    { id: 'reports', label: 'Reports', icon: ReportsIcon },
    { id: 'chat', label: 'AI Assistant', icon: ChatIcon },
    { id: 'community', label: 'Community', icon: CommunityIcon },
    { id: 'learn', label: 'Learn', icon: LearnIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ view, setView }) => {
  const navItemClasses = (currentView: View) => 
    `flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 font-medium text-sm w-full text-left relative ${
      view === currentView 
        ? 'bg-accent text-primary' 
        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
    }`;

  return (
    <aside className="hidden xl:flex flex-col w-64 fixed inset-y-0 z-50 bg-card border-r border-border">
      <div className="flex items-center gap-3 h-16 px-6 border-b border-border">
        <LogoIcon className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold text-foreground font-heading">SmartFinance</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id as View)} className={navItemClasses(item.id as View)}>
                {view === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full"></div>}
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
            </button>
        ))}
      </nav>
    </aside>
  );
};