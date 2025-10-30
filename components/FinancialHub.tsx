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
    onSaveRecurringExpense: (expense: RecurringExpense) => void;
    onDeleteRecurringExpense: (id: string) => void;
    bankAccountBalance: number;
    addTransaction: (tx: Omit<Transaction, 'id'>) => void;
    linkedAccounts: LinkedAccount[];
    onSaveLinkedAccount: (account: LinkedAccount) => void;
    onDeleteLinkedAccount: (id: string) => void;
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
    const inputClasses = "w-full mt-1 p-2 rounded-lg bg-background border border-border focus:ring-1 focus:ring-ring outline-none";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(account);
        setAccount({ accountName: '', cardNumber: '', cardType: 'Debit', balance: 0 });
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 mt-4 space-y-3 bg-accent rounded-lg">
            <h4 className="font-semibold">Add New Account</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs">Account Name</label><input type="text" value={account.accountName} onChange={e => setAccount(p => ({...p, accountName: e.target.value}))} className={inputClasses} placeholder="e.g., Chase Checking" required /></div>
                <div><label className="text-xs">Card Number (mock)</label><input type="text" value={account.cardNumber} onChange={e => setAccount(p => ({...p, cardNumber: e.target.value}))} className={inputClasses} placeholder="**** **** **** 1234" required /></div>
                <div><label className="text-xs">Type</label><select value={account.cardType} onChange={e => setAccount(p => ({...p, cardType: e.target.value as any}))} className={`${inputClasses} appearance-none`}><option>Debit</option><option>Credit</option></select></div>
                <div><label className="text-xs">Current Balance ($)</label><input type="number" value={account.balance} onChange={e => setAccount(p => ({...p, balance: parseFloat(e.target.value) || 0}))} className={inputClasses} required /></div>
            </div>
            <button type="submit" className="w-full py-2 px-4 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 font-medium text-sm">Add Account</button>
        </form>
    );
};

export const FinancialHub: React.FC<FinancialHubProps> = (props) => {
    const { userProfile, monthlyIncome, setMonthlyIncome, recurringExpenses, onSaveRecurringExpense, onDeleteRecurringExpense, bankAccountBalance, addTransaction, linkedAccounts, onSaveLinkedAccount, onDeleteLinkedAccount } = props;
    const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: 'Housing' });
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestions, setSuggestions] = useState<{ name: string; category: string }[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const receiptInputRef = useRef<HTMLInputElement>(null);
    const inputClasses = "w-full mt-1 p-2 rounded-lg bg-input border border-border focus:ring-1 focus:ring-ring outline-none";


    const handleAddExpense = (e: React.FormEvent) => { 
        e.preventDefault(); 
        if (newExpense.name && newExpense.amount) { 
            onSaveRecurringExpense({ id: '', name: newExpense.name, amount: parseFloat(newExpense.amount), category: newExpense.category });
            setNewExpense({ name: '', amount: '', category: 'Housing' }); 
            setSuggestions([]); 
        } 
    };
    const handleGetSuggestions = async () => { setIsSuggesting(true); setSuggestions([]); try { const result = await suggestRecurringExpenses(userProfile); setSuggestions(result); } finally { setIsSuggesting(false); } };
    const handleSuggestionClick = (suggestion: { name: string; category: string }) => { const validCategory = RECURRING_EXPENSE_CATEGORIES.includes(suggestion.category) ? suggestion.category : 'Other'; setNewExpense({ name: suggestion.name, category: validCategory, amount: '' }); document.getElementById('exp-amount')?.focus(); };
    
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
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold font-heading">Financial Hub</h2>
                <p className="text-muted-foreground text-lg">Set your financial foundation: income, accounts, and recurring bills.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4"><div className="sticky top-24 space-y-6">
                    <Card><h3 className="text-xl font-bold font-heading mb-4">Core Finances</h3>
                        <div><label htmlFor="monthlyIncome" className="text-sm font-medium">Monthly Income</label><div className="relative mt-1"><DollarIcon className="h-5 w-5 text-muted-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center" /><input id="monthlyIncome" type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(parseInt(e.target.value, 10) || 0)} className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border" /></div></div>
                        <div className="mt-4"><p className="text-sm font-medium text-muted-foreground">Total Bank Balance (from Debit)</p><p className="text-3xl font-bold font-heading">{bankAccountBalance.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</p></div>
                    </Card>
                    <Card><h3 className="text-xl font-bold font-heading">Connected Accounts</h3>
                        {linkedAccounts.length > 0 && <div className="space-y-2 mt-4">{linkedAccounts.map(acc => (
                            <div key={acc.id} className="flex justify-between items-center p-2 bg-accent rounded-lg">
                                <div><p className="font-semibold text-sm">{acc.accountName} <span className="text-xs text-muted-foreground">...{acc.cardNumber.slice(-4)}</span></p><p className={`text-xs font-bold ${acc.cardType === 'Debit' ? 'text-primary' : 'text-destructive'}`}>{acc.cardType}</p></div>
                                <div className="flex items-center gap-2"><p className="font-semibold">${acc.balance.toLocaleString()}</p><button onClick={() => onDeleteLinkedAccount(acc.id)}><TrashIcon className="h-4 w-4 text-muted-foreground hover:text-destructive"/></button></div>
                            </div>
                        ))}</div>}
                        <AddAccountForm onAdd={(acc) => onSaveLinkedAccount(acc as LinkedAccount)}/>
                    </Card>
                </div></div>
                <div className="lg:col-span-8 space-y-6">
                    <Card>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                            <h3 className="text-xl font-bold font-heading">Recurring Expenses & Bills</h3>
                            <div className="flex gap-2">
                               <input type="file" ref={receiptInputRef} className="hidden" onChange={handleReceiptScan} accept="image/*" />
                               <button onClick={() => receiptInputRef.current?.click()} disabled={isScanning} className="flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"><CameraIcon className="w-5 h-5" /><span>{isScanning ? 'Scanning...' : 'Scan Receipt'}</span></button>
                               <button onClick={handleGetSuggestions} disabled={isSuggesting} className="flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"><SparklesIcon className="w-5 h-5" /><span>{isSuggesting ? 'Thinking...' : 'Suggest with AI'}</span></button>
                            </div>
                        </div>
                        {scanResult && <p className="text-sm mb-4 p-2 bg-accent rounded-lg">{scanResult}</p>}
                        { (isSuggesting || suggestions.length > 0) && <div className="mb-6 p-4 bg-accent rounded-lg"><h4 className="text-sm font-semibold mb-3">Tap to add an AI suggestion:</h4>{isSuggesting && <div className="flex flex-wrap gap-2">{[...Array(5)].map((_, i) => <div key={i} className="h-8 w-28 bg-muted rounded-full animate-pulse" />)}</div>}<div className="flex flex-wrap gap-2">{suggestions.map((s, i) => (<button key={i} onClick={() => handleSuggestionClick(s)} className="text-sm py-1.5 px-4 rounded-full bg-primary/10 text-primary hover:bg-primary/20">+ {s.name}</button>))}</div></div>}
                        <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6 items-end">
                            <div className="sm:col-span-12 md:col-span-5"><label htmlFor="exp-name" className="text-xs font-medium">Expense Name</label><input id="exp-name" type="text" placeholder="e.g., Rent" value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} className={inputClasses} required /></div>
                            <div className="sm:col-span-6 md:col-span-3"><label htmlFor="exp-cat" className="text-xs font-medium">Category</label><select id="exp-cat" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className={`${inputClasses} appearance-none`} required>{RECURRING_EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                            <div className="sm:col-span-6 md:col-span-2"><label htmlFor="exp-amount" className="text-xs font-medium">Amount ($)</label><input id="exp-amount" type="number" placeholder="120" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className={inputClasses} required /></div>
                            <div className="sm:col-span-12 md:col-span-2"><button type="submit" className="w-full py-2 px-4 rounded-lg text-secondary-foreground bg-secondary hover:bg-secondary/80 font-medium">Add</button></div>
                        </form>
                         <hr className="my-6 border-border" />
                        <ul className="space-y-3">{recurringExpenses.map(exp => (<li key={exp.id} className="flex justify-between items-center p-3 hover:bg-accent rounded-lg"><div><p className="font-semibold">{exp.name}</p><p className="text-sm text-muted-foreground">{exp.category}</p></div><div className="flex items-center gap-4"><span className="font-bold text-lg">${exp.amount.toFixed(2)}</span><button onClick={() => onDeleteRecurringExpense(exp.id)} className="text-muted-foreground hover:text-destructive p-1" aria-label={`Remove ${exp.name}`}><XCircleIcon className="w-6 h-6" /></button></div></li>))}</ul>
                         {recurringExpenses.length === 0 && !isSuggesting && (<div className="text-center text-muted-foreground py-12 border-2 border-dashed border-border rounded-lg"><ClipboardListIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" /><p className="font-semibold text-lg text-foreground">Add your first recurring expense</p><p className="text-sm">List things like rent, utilities, and subscriptions.</p></div>)}
                    </Card>
                </div>
            </div>
        </div>
    );
};