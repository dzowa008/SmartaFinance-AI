

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
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
import { UserProfile, Transaction, RecurringExpense, SavingsGoal, Bill, SmartAlert, UserSettings, Asset, Liability, ForumPost, Challenge, Badge, Investment, SplitExpense, StoredDocument, LinkedAccount } from '../types';
import { db, seedInitialData } from '../services/dbService';

type View = 'dashboard' | 'chat' | 'financialHub' | 'goals' | 'settings' | 'security' | 'netWorth' | 'community' | 'reports' | 'learn' | 'investments' | 'splitter' | 'vault';

interface MainAppProps {
  userProfile: UserProfile;
  onSignOut: () => void;
  initialView?: View;
}

export const MainApp: React.FC<MainAppProps> = ({ userProfile, onSignOut, initialView = 'dashboard' }) => {
  const [view, setView] = useState<View>(initialView);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isLiveAssistantOpen, setIsLiveAssistantOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State Management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(userProfile.monthlyIncome || 5000);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ theme: 'dark', currency: 'USD', travelMode: false, goalAutomation: false, notifications: { dailySummary: true, billReminders: true, budgetAlerts: true } });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [splitExpenses, setSplitExpenses] = useState<SplitExpense[]>([]);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);

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

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        await seedInitialData();

        const [ dbSettings, dbTransactions, dbRecurringExpenses, dbSavingsGoals, dbBills, dbAssets, dbLiabilities, dbForumPosts, dbChallenges, dbBadges, dbInvestments, dbSplitExpenses, dbDocuments, dbLinkedAccounts, dbProfile ] = await Promise.all([
            db.getSettings(), db.getAll<Transaction>('transactions'), db.getAll<RecurringExpense>('recurringExpenses'),
            db.getAll<SavingsGoal>('savingsGoals'), db.getAll<Bill>('bills'), db.getAll<Asset>('assets'),
            db.getAll<Liability>('liabilities'), db.getAll<ForumPost>('forumPosts'), db.getAll<Challenge>('challenges'),
            db.getAll<Badge>('badges'), db.getAll<Investment>('investments'), db.getAll<SplitExpense>('splitExpenses'),
            db.getAll<StoredDocument>('documents'), db.getAll<LinkedAccount>('linkedAccounts'), db.getUserProfile()
        ]);

        if (dbSettings) setSettings(dbSettings);
        setTransactions(dbTransactions); setRecurringExpenses(dbRecurringExpenses); setSavingsGoals(dbSavingsGoals);
        setBills(dbBills); setAssets(dbAssets); setLiabilities(dbLiabilities); setForumPosts(dbForumPosts);
        setChallenges(dbChallenges); setBadges(dbBadges); setInvestments(dbInvestments);
        setSplitExpenses(dbSplitExpenses); setDocuments(dbDocuments); setLinkedAccounts(dbLinkedAccounts);
        if (dbProfile?.monthlyIncome) setMonthlyIncome(dbProfile.monthlyIncome);

        setIsLoading(false);
    };
    loadData();
  }, []);

  const bankAccountBalance = useMemo(() => {
    return linkedAccounts.filter(acc => acc.cardType === 'Debit').reduce((sum, acc) => sum + acc.balance, 0);
  }, [linkedAccounts]);

  // --- Data Manipulation Functions ---
  const handleAddBill = useCallback(async (newBill: Omit<Bill, 'id' | 'type' | 'status'>) => { 
    const billToAdd = { ...newBill, id: `bill-${Date.now()}`, type: 'Bill' as const, status: 'Pending Approval' as const };
    await db.add('bills', billToAdd);
    setBills(prev => [ ...prev, billToAdd ]); 
  }, []);
  const handleSetBills = async (updater: Bill[] | ((prev: Bill[]) => Bill[])) => {
      const newBills = typeof updater === 'function' ? updater(bills) : updater;
      setBills(newBills);
      // Inefficiently update all, but necessary for simple status changes from dashboard
      const updatePromises = newBills.map(bill => db.put('bills', bill));
      await Promise.all(updatePromises);
  };
  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
      const txToAdd = { ...newTx, id: `tx-${Date.now()}` };
      await db.add('transactions', txToAdd);
      setTransactions(prev => [txToAdd, ...prev ]); 
  };
  const handleSetTransactions = async (newTxs: Transaction[]) => {
      await db.put('transactions', newTxs); // This would be an `add` for a new one.
      setTransactions(newTxs);
  };
  const handleDataDeletion = () => { if (window.confirm("Are you sure? This will delete all your financial data.")) { db.deleteAllData().then(() => { onSignOut(); window.location.reload(); }); } };
  const handleSetSettings = async (newSettings: UserSettings) => { await db.putSettings(newSettings); setSettings(newSettings); };
  
  // Generic CRUD wrappers to pass to components
  const createGenericSetter = <T extends {id: string}>(storeName: string, stateSetter: React.Dispatch<React.SetStateAction<T[]>>) => {
      const onSave = async (item: T) => {
          if (item.id && item.id.toString().length > 0) { // Existing item
              await db.put(storeName, item);
              stateSetter(prev => prev.map(i => i.id === item.id ? item : i));
          } else { // New item
              const newItem = { ...item, id: `${storeName.slice(0, 3)}-${Date.now()}` };
              await db.add(storeName, newItem);
              stateSetter(prev => [...prev, newItem]);
          }
      };
      const onDelete = async (id: string) => {
          await db.delete(storeName, id);
          stateSetter(prev => prev.filter(i => i.id !== id));
      };
      const onSet = async (items: T[]) => {
          // This is for bulk updates like reordering, less common
          stateSetter(items);
          const promises = items.map(item => db.put(storeName, item));
          await Promise.all(promises);
      }
      return { onSave, onDelete, onSet };
  };

  const goalsManager = createGenericSetter('savingsGoals', setSavingsGoals);
  const assetsManager = createGenericSetter('assets', setAssets);
  const liabilitiesManager = createGenericSetter('liabilities', setLiabilities);
  const recurringExpensesManager = createGenericSetter('recurringExpenses', setRecurringExpenses);
  const linkedAccountsManager = createGenericSetter('linkedAccounts', setLinkedAccounts);
  const investmentsManager = createGenericSetter('investments', setInvestments);
  const splitExpensesManager = createGenericSetter('splitExpenses', setSplitExpenses);
  const documentsManager = createGenericSetter('documents', setDocuments);
  const postsManager = createGenericSetter('forumPosts', setForumPosts);
  const challengesManager = createGenericSetter('challenges', setChallenges);

  const handleSetMonthlyIncome = async (income: number) => {
      setMonthlyIncome(income);
      const profile = await db.getUserProfile();
      if(profile) {
          await db.putUserProfile({...profile, monthlyIncome: income});
      }
  };

  const renderContent = () => {
    if (isLoading) {
        return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
    }
      
    const commonProps = { setView, userProfile };
    switch(view) {
        case 'dashboard':
            // FIX: Removed extraneous props ('alerts', 'assets', 'liabilities', etc.) that are not defined in DashboardProps to resolve the TypeScript error.
            return <Dashboard userProfile={userProfile} monthlyIncome={monthlyIncome} recurringExpenses={recurringExpenses} transactions={transactions} bills={bills} setBills={handleSetBills} goals={savingsGoals} bankAccountBalance={bankAccountBalance} settings={settings} investments={investments} isOffline={isOffline} />;
        case 'financialHub':
            // FIX: Removed the 'setRecurringExpenses' prop as it is not defined in FinancialHubProps.
            return <FinancialHub {...commonProps} monthlyIncome={monthlyIncome} setMonthlyIncome={handleSetMonthlyIncome} recurringExpenses={recurringExpenses} onSaveRecurringExpense={recurringExpensesManager.onSave} onDeleteRecurringExpense={recurringExpensesManager.onDelete} bankAccountBalance={bankAccountBalance} addTransaction={handleAddTransaction} linkedAccounts={linkedAccounts} onSaveLinkedAccount={linkedAccountsManager.onSave} onDeleteLinkedAccount={linkedAccountsManager.onDelete} />;
        case 'goals':
            return <Goals goals={savingsGoals} onSaveGoal={goalsManager.onSave} onDeleteGoal={goalsManager.onDelete} />;
        case 'settings':
            return <Settings settings={settings} setSettings={handleSetSettings} setView={setView as any} />;
        case 'security':
            return <Security onDataDeletion={handleDataDeletion} />;
        case 'chat':
            return <ChatAssistant transactions={transactions} setTransactions={handleSetTransactions} addBill={handleAddBill} monthlyIncome={monthlyIncome} savingsGoals={savingsGoals} recurringExpenses={recurringExpenses} />;
        case 'netWorth':
            return <NetWorth assets={assets} onSaveAsset={assetsManager.onSave} onDeleteAsset={assetsManager.onDelete} liabilities={liabilities} onSaveLiability={liabilitiesManager.onSave} onDeleteLiability={liabilitiesManager.onDelete} settings={settings} />;
        case 'community':
            return <Community posts={forumPosts} onSavePost={postsManager.onSave} />;
        case 'reports':
            return <Reports transactions={transactions} settings={settings} />;
        case 'learn':
            return <Learn />;
        case 'investments':
            return <Investments investments={investments} onSaveInvestment={investmentsManager.onSave} onDeleteInvestment={investmentsManager.onDelete} settings={settings} />;
        case 'splitter':
            return <Splitter expenses={splitExpenses} onSaveExpense={splitExpensesManager.onSave} onUpdateExpense={splitExpensesManager.onSave} settings={settings} />;
        case 'vault':
            return <Vault documents={documents} onSaveDocument={documentsManager.onSave} onDeleteDocument={documentsManager.onDelete} />;
        default:
            return <div>Not Found</div>;
    }
  }

  return (
    <div className="min-h-screen text-foreground bg-background transition-colors duration-300">
      <div className="xl:flex">
        <Sidebar view={view} setView={setView as any} />
        <div className="xl:pl-64 flex-1 flex flex-col">
          <Header view={view} setView={setView as any} onSignOut={onSignOut} isOffline={isOffline} onToggleLiveAssistant={() => setIsLiveAssistantOpen(true)} />
          <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-1">
            {renderContent()}
          </main>
        </div>
      </div>
      {isLiveAssistantOpen && <LiveAssistant onClose={() => setIsLiveAssistantOpen(false)} />}
    </div>
  );
};