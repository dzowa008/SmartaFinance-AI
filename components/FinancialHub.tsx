
import React, { useState, useRef, useEffect } from 'react';
import { RecurringExpense, UserProfile, Transaction, Asset, LinkedAccount } from '../types';
import { Card } from './Card';
import { DollarIcon, XCircleIcon, SparklesIcon, ClipboardListIcon, CreditCardIcon, CheckCircleIcon, CameraIcon, TrashIcon } from './Icons';
import { suggestRecurringExpenses, analyzeReceiptImage } from '../services/geminiService';
import { RECURRING_EXPENSE_CATEGORIES } from '../constants';

interface FinancialHubProps {
    userProfile: UserProfile;
    monthlyIncome: number;
    setMonthlyIncome: (income: number) => void;
    recurringExpenses: RecurringExpense[];
    setRecurringExpenses: (expenses: RecurringExpense[]) => void;
    bankAccountBalance: number;
    addTransaction: (tx: Omit<Transaction, 'id'>) => void;
    linkedAccounts: LinkedAccount[];
    setLinkedAccounts: React.Dispatch<React.SetStateAction<LinkedAccount[]>>;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const AddAccountForm: React.FC<{ onAdd: (acc: Omit<LinkedAccount, 'id'>) => void }> = ({ onAdd }) => {
    const [account, setAccount] = useState({ accountName: '', cardNumber: '', cardType: 'Debit' as 'Debit' | 'Credit', balance: 0 });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(account);
        setAccount({ accountName: '', cardNumber: '', cardType: 'Debit', balance: 0 });
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 my-4 space-y-3 bg-slate-50 dark:bg-navy-800/50 rounded-lg">
            <h4 className="font-semibold">Add New Account</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs">Account Name</label><input type="text" value={account.accountName} onChange={e => setAccount(p => ({...p, accountName: e.target.value}))} className="w-full mt-1 p-2 rounded bg-white dark:bg-navy-800" placeholder="e.g., Chase Checking" required /></div>
                <div><label className="text-xs">Card Number (mock)</label><input type="text" value={account.cardNumber} onChange={e => setAccount(p => ({...p, cardNumber: e.target.value}))} className="w-full mt-1 p-2 rounded bg-white dark:bg-navy-800" placeholder="**** **** **** 1234" required /></div>
                <div><label className="text-xs">Type</label><select value={account.cardType} onChange={e => setAccount(p => ({...p, cardType: e.target.value as any}))} className="w-full mt-1 p-2 rounded bg-white dark:bg-navy-800 appearance-none"><option>Debit</option><option>Credit</option></select></div>
                <div><label className="text-xs">Current Balance ($)</label><input type="number" value={account.balance} onChange={e => setAccount(p => ({...p, balance: parseFloat(e.target.value) || 0}))} className="w-full mt-1 p-2 rounded bg-white dark:bg-navy-800" required /></div>
            </div>
            <button type="submit" className="w-full py-2 px-4 rounded-lg text-white bg-navy-700 hover:bg-navy-600 font-medium text-sm">Add Account</button>
        </form>
    );
};

export const FinancialHub: React.FC<FinancialHubProps> = ({
    userProfile, monthlyIncome, setMonthlyIncome, recurringExpenses, setRecurringExpenses,
    bankAccountBalance, addTransaction, linkedAccounts, setLinkedAccounts
}) => {
    const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: 'Housing' });
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestions, setSuggestions] = useState<{ name: string; category: string }[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const receiptInputRef = useRef<HTMLInputElement>(null);

    const totalRecurringExpenses = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const handleAddExpense = (e: React.FormEvent) => { e.preventDefault(); if (newExpense.name && newExpense.amount) { setRecurringExpenses([ ...recurringExpenses, { id: `exp-${Date.now()}`, name: newExpense.name, amount: parseFloat(newExpense.amount), category: newExpense.category } ]); setNewExpense({ name: '', amount: '', category: 'Housing' }); setSuggestions([]); } };
    const handleRemoveExpense = (id: string) => setRecurringExpenses(recurringExpenses.filter(exp => exp.id !== id));
    const handleGetSuggestions = async () => { setIsSuggesting(true); setSuggestions([]); try { const result = await suggestRecurringExpenses(userProfile); setSuggestions(result); } finally { setIsSuggesting(false); } };
    const handleSuggestionClick = (suggestion: { name: string; category: string }) => { const validCategory = RECURRING_EXPENSE_CATEGORIES.includes(suggestion.category) ? suggestion.category : 'Other'; setNewExpense({ name: suggestion.name, category: validCategory, amount: '' }); document.getElementById('exp-amount')?.focus(); };
    const handleAddAccount = (acc: Omit<LinkedAccount, 'id'>) => setLinkedAccounts(prev => [...prev, {...acc, id: `acc-${Date.now()}`}]);
    const handleRemoveAccount = (id: string) => setLinkedAccounts(prev => prev.filter(a => a.id !== id));

    const handleReceiptScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; if (!file) return; setIsScanning(true); setScanResult("Analyzing receipt...");
        try {
            const base64Image = await blobToBase64(file); const result = await analyzeReceiptImage(base64Image, file.type);
            if (result) { addTransaction({ date: result.date, description: result.vendor, amount: result.amount, category: result.category, type: 'expense' }); setScanResult(`Success! Added a $${result.amount} expense for ${result.vendor}.`);
            } else { setScanResult("Could not read receipt. Please try another image."); }
        } catch (e) { setScanResult("An error occurred during scanning."); } 
        finally { setIsScanning(false); setTimeout(() => setScanResult(null), 5000); }
        event.target.value = '';
    };

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12"><h2 className="text-3xl font-bold font-heading">Financial Hub</h2><p className="text-slate-500 text-lg">Set your financial foundation: income, accounts, and recurring bills.</p></div>
            <div className="col-span-12 lg:col-span-4"><div className="sticky top-24 space-y-6">
                <Card><h3 className="text-xl font-bold font-heading mb-4">Core Finances</h3>
                    <div><label htmlFor="monthlyIncome" className="text-sm font-medium">Monthly Income</label><div className="relative mt-1"><DollarIcon className="h-5 w-5 text-slate-400 pointer-events-none absolute inset-y-0 left-3 flex items-center" /><input id="monthlyIncome" type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(parseInt(e.target.value, 10) || 0)} className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 dark:bg-navy-800" /></div></div>
                    <div className="mt-4"><p className="text-sm font-medium">Total Bank Balance (from Debit)</p><p className="text-3xl font-bold font-heading">${bankAccountBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p></div>
                </Card>
                <Card><h3 className="text-xl font-bold font-heading mb-2">Connected Accounts</h3>
                    {linkedAccounts.length > 0 && <div className="space-y-2 mb-4">{linkedAccounts.map(acc => (
                        <div key={acc.id} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-navy-800/80 rounded-lg">
                            <div><p className="font-semibold text-sm">{acc.accountName} <span className="text-xs text-slate-400">...{acc.cardNumber.slice(-4)}</span></p><p className={`text-xs font-bold ${acc.cardType === 'Debit' ? 'text-soft-green-600' : 'text-red-500'}`}>{acc.cardType}</p></div>
                            <div className="flex items-center gap-2"><p className="font-semibold">${acc.balance.toLocaleString()}</p><button onClick={() => handleRemoveAccount(acc.id)}><TrashIcon className="h-4 w-4 text-slate-400 hover:text-red-500"/></button></div>
                        </div>
                    ))}</div>}
                    <AddAccountForm onAdd={handleAddAccount}/>
                </Card>
            </div></div>
            <div className="col-span-12 lg:col-span-8 space-y-6">
                <Card>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                        <h3 className="text-xl font-bold font-heading">Recurring Expenses & Bills</h3>
                        <div className="flex gap-2">
                           <input type="file" ref={receiptInputRef} className="hidden" onChange={handleReceiptScan} accept="image/*" />
                           <button onClick={() => receiptInputRef.current?.click()} disabled={isScanning} className="flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400"><CameraIcon className="w-5 h-5" /><span>{isScanning ? 'Scanning...' : 'Scan Receipt'}</span></button>
                           <button onClick={handleGetSuggestions} disabled={isSuggesting} className="flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold bg-navy-700 text-white hover:bg-navy-600 disabled:bg-slate-400"><SparklesIcon className="w-5 h-5" /><span>{isSuggesting ? 'Thinking...' : 'Suggest with AI'}</span></button>
                        </div>
                    </div>
                    {scanResult && <p className="text-sm mb-4 p-2 bg-slate-100 dark:bg-navy-800 rounded-lg">{scanResult}</p>}
                    { (isSuggesting || suggestions.length > 0) && <div className="mb-6 p-4 bg-slate-50 dark:bg-navy-800/50 rounded-lg"><h4 className="text-sm font-semibold mb-3">Tap to add an AI suggestion:</h4>{isSuggesting && <div className="flex flex-wrap gap-2">{[...Array(5)].map((_, i) => <div key={i} className="h-8 w-28 bg-slate-200 dark:bg-navy-700 rounded-full animate-pulse" />)}</div>}<div className="flex flex-wrap gap-2">{suggestions.map((s, i) => (<button key={i} onClick={() => handleSuggestionClick(s)} className="text-sm py-1.5 px-4 rounded-full bg-soft-green-100 text-soft-green-800 hover:bg-soft-green-200 dark:bg-soft-green-500/10 dark:text-soft-green-300 dark:hover:bg-soft-green-500/20">+ {s.name}</button>))}</div></div>}
                    <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6 items-end">
                        <div className="sm:col-span-12 md:col-span-5"><label htmlFor="exp-name" className="text-xs font-medium">Expense Name</label><input id="exp-name" type="text" placeholder="e.g., Rent" value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required /></div>
                        <div className="sm:col-span-6 md:col-span-3"><label htmlFor="exp-cat" className="text-xs font-medium">Category</label><select id="exp-cat" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800 appearance-none" required>{RECURRING_EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                        <div className="sm:col-span-6 md:col-span-2"><label htmlFor="exp-amount" className="text-xs font-medium">Amount ($)</label><input id="exp-amount" type="number" placeholder="120" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required /></div>
                        <div className="sm:col-span-12 md:col-span-2"><button type="submit" className="w-full py-2 px-4 rounded-lg text-white bg-navy-700 hover:bg-navy-600 font-medium">Add</button></div>
                    </form>
                     <hr className="my-6 border-slate-200 dark:border-navy-800" />
                    <ul className="space-y-3">{recurringExpenses.map(exp => (<li key={exp.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-navy-800/50 rounded-lg"><div><p className="font-semibold">{exp.name}</p><p className="text-sm text-slate-500">{exp.category}</p></div><div className="flex items-center gap-4"><span className="font-bold text-lg">${exp.amount.toFixed(2)}</span><button onClick={() => handleRemoveExpense(exp.id)} className="text-slate-400 hover:text-red-500 p-1" aria-label={`Remove ${exp.name}`}><XCircleIcon className="w-6 h-6" /></button></div></li>))}</ul>
                     {recurringExpenses.length === 0 && !isSuggesting && (<div className="text-center text-slate-500 py-12 border-2 border-dashed border-slate-200 dark:border-navy-800 rounded-lg"><ClipboardListIcon className="h-12 w-12 mx-auto text-slate-400 mb-2" /><p className="font-semibold text-lg text-slate-600">Add your first recurring expense</p><p className="text-sm">List things like rent, utilities, and subscriptions.</p></div>)}
                </Card>
            </div>
        </div>
    );
};