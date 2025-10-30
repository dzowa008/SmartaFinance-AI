
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './Header';
import { Dashboard } from './Dashboard';
import { ChatAssistant } from './ChatAssistant';
import { FinancialHub } from './FinancialHub';
import { Goals } from './Goals';
import { Settings } from './Settings';
import { Security } from './Security';
import { NetWorth } from './NetWorth';
import { Community } from './Community';
import { Reports } from './Reports';
import { Learn } from './Learn';
import { Investments } from './Investments';
import { Splitter } from './Splitter';
import { Vault } from './Vault';
import { LiveAssistant } from './LiveAssistant';
import { UserProfile, Transaction, RecurringExpense, BudgetCategory, SavingsGoal, Bill, SmartAlert, UserSettings, Asset, Liability, ForumPost, Challenge, Badge, Investment, SplitExpense, StoredDocument, LinkedAccount } from '../types';
import { TRANSACTIONS, INITIAL_BILLS, INITIAL_ASSETS, INITIAL_LIABILITIES, INITIAL_FORUM_POSTS, INITIAL_CHALLENGES, EARNED_BADGES, INITIAL_INVESTMENTS, INITIAL_SPLIT_EXPENSES } from '../constants';

type View = 'dashboard' | 'chat' | 'financialHub' | 'goals' | 'settings' | 'security' | 'netWorth' | 'community' | 'reports' | 'learn' | 'investments' | 'splitter' | 'vault';

interface MainAppProps {
  userProfile: UserProfile;
  onSignOut: () => void;
  initialView?: View;
}

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => { try { const item = window.localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; } catch (error) { console.error(error); return initialValue; } });
    const setValue = (value: T | ((val: T) => T)) => { try { const valueToStore = value instanceof Function ? value(storedValue) : value; setStoredValue(valueToStore); window.localStorage.setItem(key, JSON.stringify(valueToStore)); } catch (error) { console.error(error); } };
    return [storedValue, setValue];
};

export const MainApp: React.FC<MainAppProps> = ({ userProfile, onSignOut, initialView = 'dashboard' }) => {
  const [view, setView] = useState<View>(initialView);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isLiveAssistantOpen, setIsLiveAssistantOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // State Management
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', TRANSACTIONS);
  const [monthlyIncome, setMonthlyIncome] = useLocalStorage<number>('monthlyIncome', userProfile.monthlyIncome || 5000);
  const [recurringExpenses, setRecurringExpenses] = useLocalStorage<RecurringExpense[]>('recurringExpenses', []);
  const [savingsGoals, setSavingsGoals] = useLocalStorage<SavingsGoal[]>('savingsGoals', []);
  const [bills, setBills] = useLocalStorage<Bill[]>('bills', INITIAL_BILLS);
  const [smartAlerts, setSmartAlerts] = useState<SmartAlert[]>([]);
  const [settings, setSettings] = useLocalStorage<UserSettings>('userSettings', { theme: 'dark', currency: 'USD', travelMode: false, goalAutomation: false, notifications: { dailySummary: true, billReminders: true, budgetAlerts: true } });
  
  // V2 Feature States
  const [assets, setAssets] = useLocalStorage<Asset[]>('assets', INITIAL_ASSETS);
  const [liabilities, setLiabilities] = useLocalStorage<Liability[]>('liabilities', INITIAL_LIABILITIES);
  const [forumPosts, setForumPosts] = useLocalStorage<ForumPost[]>('forumPosts', INITIAL_FORUM_POSTS);
  const [challenges, setChallenges] = useLocalStorage<Challenge[]>('challenges', INITIAL_CHALLENGES);
  const [badges, setBadges] = useLocalStorage<Badge[]>('badges', EARNED_BADGES);
  
  // V3 Feature States
  const [investments, setInvestments] = useLocalStorage<Investment[]>('investments', INITIAL_INVESTMENTS);
  const [splitExpenses, setSplitExpenses] = useLocalStorage<SplitExpense[]>('splitExpenses', INITIAL_SPLIT_EXPENSES);
  const [documents, setDocuments] = useLocalStorage<StoredDocument[]>('documents', []);
  const [linkedAccounts, setLinkedAccounts] = useLocalStorage<LinkedAccount[]>('linkedAccounts', []);

  const bankAccountBalance = useMemo(() => {
    return linkedAccounts
        .filter(acc => acc.cardType === 'Debit')
        .reduce((sum, acc) => sum + acc.balance, 0);
  }, [linkedAccounts]);

  // Generate dynamic alerts
  useEffect(() => { /* ... existing code ... */ }, [bills]);

  const addBill = useCallback((newBill: Omit<Bill, 'id' | 'type' | 'status'>) => { setBills(prev => [ ...prev, { ...newBill, id: `bill-${Date.now()}`, type: 'Bill', status: 'Pending Approval' } ]); }, [setBills]);
  const addTransaction = (newTx: Omit<Transaction, 'id'>) => { setTransactions(prev => [{ ...newTx, id: `tx-${Date.now()}` }, ...prev ]); };
  const handleDataDeletion = () => { if (window.confirm("Are you sure?")) { Object.keys(localStorage).forEach(key => { if (!['authToken', 'hasCompletedOnboarding', 'userProfile', 'theme'].includes(key)) localStorage.removeItem(key); }); window.location.reload(); } };

  const renderContent = () => {
    const commonProps = { setView, userProfile };
    switch(view) {
        case 'dashboard':
            return <Dashboard {...commonProps} monthlyIncome={monthlyIncome} recurringExpenses={recurringExpenses} transactions={transactions} bills={bills} setBills={setBills} goals={savingsGoals} alerts={smartAlerts} bankAccountBalance={bankAccountBalance} settings={settings} assets={assets} liabilities={liabilities} challenges={challenges} badges={badges} setChallenges={setChallenges} investments={investments} isOffline={isOffline} />;
        case 'financialHub':
            return <FinancialHub {...commonProps} monthlyIncome={monthlyIncome} setMonthlyIncome={setMonthlyIncome} recurringExpenses={recurringExpenses} setRecurringExpenses={setRecurringExpenses} bankAccountBalance={bankAccountBalance} addTransaction={addTransaction} linkedAccounts={linkedAccounts} setLinkedAccounts={setLinkedAccounts} />;
        case 'goals':
            return <Goals {...commonProps} goals={savingsGoals} setGoals={setSavingsGoals} />;
        case 'settings':
            return <Settings {...commonProps} settings={settings} setSettings={setSettings} setView={setView as any} />;
        case 'security':
            return <Security {...commonProps} onDataDeletion={handleDataDeletion} />;
        case 'chat':
            return <ChatAssistant transactions={transactions} setTransactions={setTransactions} addBill={addBill} monthlyIncome={monthlyIncome} savingsGoals={savingsGoals} recurringExpenses={recurringExpenses} />;
        case 'netWorth':
            return <NetWorth assets={assets} setAssets={setAssets} liabilities={liabilities} setLiabilities={setLiabilities} settings={settings} />;
        case 'community':
            return <Community posts={forumPosts} setPosts={setForumPosts} />;
        case 'reports':
            return <Reports transactions={transactions} settings={settings} />;
        case 'learn':
            return <Learn />;
        case 'investments':
            return <Investments investments={investments} setInvestments={setInvestments} settings={settings} />;
        case 'splitter':
            return <Splitter expenses={splitExpenses} setExpenses={setSplitExpenses} settings={settings} />;
        case 'vault':
            return <Vault documents={documents} setDocuments={setDocuments} />;
        default:
            return <div>Not Found</div>;
    }
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-navy-950 transition-colors duration-300">
      <Header view={view} setView={setView as any} onSignOut={onSignOut} isOffline={isOffline} onToggleLiveAssistant={() => setIsLiveAssistantOpen(true)} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
      {isLiveAssistantOpen && <LiveAssistant onClose={() => setIsLiveAssistantOpen(false)} />}
    </div>
  );
};
