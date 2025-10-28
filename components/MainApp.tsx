import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Dashboard } from './Dashboard';
import { ChatAssistant } from './ChatAssistant';
import { FinancialHub } from './FinancialHub';
import { Transaction, RecurringExpense, BudgetCategory, UserProfile } from '../types';
import { TRANSACTIONS } from '../constants';

type Theme = 'light' | 'dark';
type View = 'dashboard' | 'chat' | 'financialHub';

interface MainAppProps {
  userProfile: UserProfile;
  onSignOut: () => void;
  initialView?: View;
}

export const MainApp: React.FC<MainAppProps> = ({ userProfile, onSignOut, initialView = 'dashboard' }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [view, setView] = useState<View>(initialView);
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS);

  // State for the new financial planning features, initialized from user profile
  const [monthlyIncome, setMonthlyIncome] = useState<number>(userProfile.monthlyIncome || 5000);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [generatedBudgets, setGeneratedBudgets] = useState<BudgetCategory[]>([]);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleGenerateBudget = () => {
    const totalExpenses = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const discretionaryIncome = monthlyIncome - totalExpenses;

    if (discretionaryIncome <= 0) {
        // Handle case where fixed expenses are higher than income
        setGeneratedBudgets([]);
        alert("Your recurring expenses are greater than or equal to your income. No discretionary budget can be created.");
        return;
    }
    
    // Simple AI-based budget allocation
    const newBudgets: BudgetCategory[] = [
        { id: 'b-groceries', name: 'Groceries', allocated: discretionaryIncome * 0.30, spent: 0 },
        { id: 'b-dining', name: 'Food & Dining', allocated: discretionaryIncome * 0.20, spent: 0 },
        { id: 'b-shopping', name: 'Shopping', allocated: discretionaryIncome * 0.15, spent: 0 },
        { id: 'b-transport', name: 'Transport', allocated: discretionaryIncome * 0.15, spent: 0 },
        { id: 'b-other', name: 'Other/Entertainment', allocated: discretionaryIncome * 0.20, spent: 0 },
    ];

    setGeneratedBudgets(newBudgets);
    alert("Your new budget has been generated! Check your dashboard.");
    setView('dashboard');
  };

  const renderContent = () => {
    switch(view) {
        case 'dashboard':
            return <Dashboard 
                budgets={generatedBudgets} 
                setView={setView} 
                monthlyIncome={monthlyIncome}
                recurringExpenses={recurringExpenses}
            />;
        case 'financialHub':
            return (
                <FinancialHub 
                    userProfile={userProfile}
                    monthlyIncome={monthlyIncome}
                    setMonthlyIncome={setMonthlyIncome}
                    recurringExpenses={recurringExpenses}
                    setRecurringExpenses={setRecurringExpenses}
                    onGenerateBudget={handleGenerateBudget}
                />
            );
        case 'chat':
            return <ChatAssistant transactions={transactions} setTransactions={setTransactions} />;
        default:
            return <Dashboard 
                budgets={generatedBudgets} 
                setView={setView} 
                monthlyIncome={monthlyIncome}
                recurringExpenses={recurringExpenses}
            />;
    }
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-navy-950 transition-colors duration-300">
      <Header theme={theme} setTheme={setTheme} view={view} setView={setView} onSignOut={onSignOut} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};
