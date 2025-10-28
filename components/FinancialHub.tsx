import React, { useState } from 'react';
import { RecurringExpense, UserProfile } from '../types';
import { Card } from './Card';
import { DollarIcon, XCircleIcon, SparklesIcon, ClipboardListIcon } from './Icons';
import { suggestRecurringExpenses } from '../services/geminiService';
import { RECURRING_EXPENSE_CATEGORIES } from '../constants';

interface FinancialHubProps {
    userProfile: UserProfile;
    monthlyIncome: number;
    setMonthlyIncome: (income: number) => void;
    recurringExpenses: RecurringExpense[];
    setRecurringExpenses: (expenses: RecurringExpense[]) => void;
    onGenerateBudget: () => void;
}

export const FinancialHub: React.FC<FinancialHubProps> = ({
    userProfile,
    monthlyIncome,
    setMonthlyIncome,
    recurringExpenses,
    setRecurringExpenses,
    onGenerateBudget
}) => {
    const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: 'Housing' });
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestions, setSuggestions] = useState<{ name: string; category: string }[]>([]);

    const totalRecurringExpenses = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const discretionarySpending = monthlyIncome - totalRecurringExpenses;

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (newExpense.name && newExpense.amount) {
            setRecurringExpenses([
                ...recurringExpenses,
                {
                    id: `exp-${Date.now()}`,
                    name: newExpense.name,
                    amount: parseFloat(newExpense.amount),
                    category: newExpense.category,
                }
            ]);
            setNewExpense({ name: '', amount: '', category: 'Housing' });
            setSuggestions([]); // Clear suggestions after adding an expense
        }
    };
    
    const handleRemoveExpense = (id: string) => {
        setRecurringExpenses(recurringExpenses.filter(exp => exp.id !== id));
    };

    const handleGetSuggestions = async () => {
        setIsSuggesting(true);
        setSuggestions([]);
        try {
            const result = await suggestRecurringExpenses(userProfile);
            setSuggestions(result);
        } catch (error) {
            console.error("Failed to get expense suggestions:", error);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSuggestionClick = (suggestion: { name: string; category: string }) => {
        const validCategory = RECURRING_EXPENSE_CATEGORIES.includes(suggestion.category) ? suggestion.category : 'Other';
        setNewExpense({ name: suggestion.name, category: validCategory, amount: '' });
        document.getElementById('exp-amount')?.focus(); // Focus amount input
    };
    
    const canGenerateBudget = discretionarySpending > 0 && recurringExpenses.length > 0;

    return (
        <div className="grid grid-cols-12 gap-6 animate-fade-in">
            <div className="col-span-12">
                <h2 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">Financial Hub</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">Set your financial foundation to unlock automated budgeting.</p>
            </div>
            
            <div className="col-span-12 lg:col-span-4">
                <Card className="sticky top-24">
                    <h3 className="text-xl font-bold font-heading mb-4">Your Overview</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="monthlyIncome" className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Monthly Income</label>
                            <div className="relative mt-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                   <DollarIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <input 
                                    id="monthlyIncome" 
                                    type="number" 
                                    value={monthlyIncome}
                                    onChange={(e) => setMonthlyIncome(parseInt(e.target.value, 10) || 0)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 dark:bg-navy-800 focus:ring-2 focus:ring-soft-green-500 outline-none transition-colors" 
                                    placeholder="5000"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-slate-100 dark:bg-navy-800 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Recurring Expenses</p>
                                <p className="text-lg font-bold text-red-500">- {totalRecurringExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                            </div>
                             <hr className="border-slate-200 dark:border-navy-700" />
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-soft-green-800 dark:text-soft-green-300">Available for Budget</p>
                                <p className="text-2xl font-bold text-soft-green-600">{discretionarySpending.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                            </div>
                        </div>
                    </div>
                     <button
                        onClick={onGenerateBudget}
                        disabled={!canGenerateBudget}
                        className={`w-full mt-6 py-3 px-4 rounded-lg text-white font-bold text-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-navy-900 focus:ring-soft-green-500 ${
                          canGenerateBudget 
                            ? 'bg-soft-green-600 hover:bg-soft-green-700 hover:scale-[1.03] shadow-lg animate-pulse-once'
                            : 'bg-slate-400 dark:bg-navy-700 cursor-not-allowed'
                        }`}
                    >
                        Generate My Budget
                    </button>
                    {!canGenerateBudget && recurringExpenses.length === 0 && <p className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400">Add recurring expenses to enable budget generation.</p>}
                </Card>
            </div>
            
            <div className="col-span-12 lg:col-span-8">
                <Card>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                        <h3 className="text-xl font-bold font-heading">Recurring Expenses & Bills</h3>
                        <button onClick={handleGetSuggestions} disabled={isSuggesting} className="flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold bg-navy-700 text-white hover:bg-navy-600 disabled:bg-slate-400 dark:disabled:bg-navy-600 transition-transform hover:scale-105">
                            <SparklesIcon className="w-5 h-5" />
                            <span>{isSuggesting ? 'Thinking...' : 'Suggest with AI'}</span>
                        </button>
                    </div>

                    { (isSuggesting || suggestions.length > 0) && (
                        <div className="mb-6 p-4 bg-slate-50 dark:bg-navy-800/50 rounded-lg">
                            <h4 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Tap to add an AI suggestion:</h4>
                            {isSuggesting && (
                                <div className="flex flex-wrap gap-2">
                                    {[...Array(5)].map((_, i) => <div key={i} className="h-8 w-28 bg-slate-200 dark:bg-navy-700 rounded-full animate-pulse" />)}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((s, i) => (
                                    <button key={i} onClick={() => handleSuggestionClick(s)} className="text-sm py-1.5 px-4 rounded-full bg-soft-green-100 text-soft-green-800 hover:bg-soft-green-200 dark:bg-soft-green-500/10 dark:text-soft-green-300 dark:hover:bg-soft-green-500/20 transition-colors">
                                        + {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6 items-end">
                        <div className="sm:col-span-12 md:col-span-5">
                            <label htmlFor="exp-name" className="text-xs font-medium text-slate-500 dark:text-slate-400">Expense Name</label>
                            <input id="exp-name" type="text" placeholder="e.g., Rent, Netflix" value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800 outline-none focus:ring-2 focus:ring-soft-green-500" required />
                        </div>
                         <div className="sm:col-span-6 md:col-span-3">
                            <label htmlFor="exp-cat" className="text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
                             <select id="exp-cat" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800 appearance-none outline-none focus:ring-2 focus:ring-soft-green-500" required>
                                {RECURRING_EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-6 md:col-span-2">
                            <label htmlFor="exp-amount" className="text-xs font-medium text-slate-500 dark:text-slate-400">Amount ($)</label>
                            <input id="exp-amount" type="number" placeholder="120" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800 outline-none focus:ring-2 focus:ring-soft-green-500" required />
                        </div>
                        <div className="sm:col-span-12 md:col-span-2">
                             <button type="submit" className="w-full py-2 px-4 rounded-lg text-white bg-navy-700 hover:bg-navy-600 font-medium transition-colors">Add</button>
                        </div>
                    </form>
                    
                     <hr className="my-6 border-slate-200 dark:border-navy-800" />
                    
                    <ul className="space-y-3">
                        {recurringExpenses.map(exp => (
                            <li key={exp.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-navy-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors">
                                <div>
                                    <p className="font-semibold">{exp.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{exp.category}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                   <span className="font-bold text-lg">${exp.amount.toFixed(2)}</span>
                                   <button onClick={() => handleRemoveExpense(exp.id)} className="text-slate-400 hover:text-red-500 p-1 rounded-full transition-colors" aria-label={`Remove ${exp.name}`}>
                                        <XCircleIcon className="w-6 h-6" />
                                   </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                     {recurringExpenses.length === 0 && !isSuggesting && (
                        <div className="text-center text-slate-500 dark:text-slate-400 py-12 border-2 border-dashed border-slate-200 dark:border-navy-800 rounded-lg">
                            <ClipboardListIcon className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                            <p className="font-semibold text-lg text-slate-600 dark:text-slate-300">Add your first recurring expense</p>
                            <p className="text-sm">List things like rent, utilities, and subscriptions, or use the AI suggestor!</p>
                        </div>
                     )}
                </Card>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                 @keyframes pulse-once {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }
                .animate-pulse-once {
                    animation: pulse-once 1.5s 2s; /* 2s delay */
                }
            `}</style>
        </div>
    );
};
