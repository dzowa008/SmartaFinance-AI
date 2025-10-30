import React, { useState, useMemo } from 'react';
import { Investment, UserSettings } from '../types';
import { Card } from './Card';
import { PlusCircleIcon, PencilIcon, TrashIcon, XIcon, SparklesIcon, TrendingUpIcon, BanknotesIcon } from './Icons';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HISTORICAL_DATA } from '../constants';
import { getInvestmentRecommendations } from '../services/geminiService';

interface InvestmentsProps {
    investments: Investment[];
    onSaveInvestment: (investment: Investment) => void;
    onDeleteInvestment: (id: string) => void;
    settings: UserSettings;
}

const InvestmentModal: React.FC<{
    investment: Investment | null;
    onClose: () => void;
    onSave: (investment: Investment) => void;
}> = ({ investment, onClose, onSave }) => {
    const [current, setCurrent] = useState<Investment>(
        investment || { id: '', name: '', type: 'Stock', quantity: 0, purchasePrice: 0, currentPrice: 0, incomeAmount: 0, incomeFrequency: 'None' }
    );
    const inputClasses = "w-full mt-1 p-2 rounded-lg bg-input border border-border focus:ring-1 focus:ring-ring outline-none";
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrent(p => ({ ...p, [name]: (['quantity', 'purchasePrice', 'currentPrice', 'incomeAmount'].includes(name)) ? parseFloat(value) || 0 : value }));
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(current); };

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-xl border border-border w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border flex justify-between items-center"><h3 className="text-xl font-bold font-heading">{investment ? 'Edit' : 'Add'} Investment</h3><button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-accent"><XIcon className="h-5 w-5"/></button></div>
                    <div className="p-6 space-y-4">
                        <div><label className="text-sm font-medium">Name</label><input type="text" name="name" value={current.name} onChange={handleChange} className={inputClasses} required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm font-medium">Type</label><select name="type" value={current.type} onChange={handleChange} className={`${inputClasses} appearance-none`}><option>Stock</option><option>Crypto</option><option>Real Estate</option><option>Other</option></select></div>
                            <div><label className="text-sm font-medium">Quantity/Units</label><input type="number" step="any" name="quantity" value={current.quantity} onChange={handleChange} className={inputClasses} required /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm font-medium">Purchase Price ($)</label><input type="number" step="any" name="purchasePrice" value={current.purchasePrice} onChange={handleChange} className={inputClasses} required /></div>
                            <div><label className="text-sm font-medium">Current Price ($)</label><input type="number" step="any" name="currentPrice" value={current.currentPrice} onChange={handleChange} className={inputClasses} required /></div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm font-medium">Income Amount ($)</label><input type="number" step="any" name="incomeAmount" value={current.incomeAmount} onChange={handleChange} className={inputClasses} /></div>
                            <div><label className="text-sm font-medium">Income Frequency</label><select name="incomeFrequency" value={current.incomeFrequency} onChange={handleChange} className={`${inputClasses} appearance-none`}><option>None</option><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option><option>Yearly</option><option>One-time</option></select></div>
                        </div>
                    </div>
                    <div className="p-6 bg-secondary/50 border-t border-border flex justify-end gap-3 rounded-b-xl"><button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted font-medium">Cancel</button><button type="submit" className="py-2 px-4 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 font-medium">Save</button></div>
                </form>
            </div>
        </div>
    );
};

export const Investments: React.FC<InvestmentsProps> = ({ investments, onSaveInvestment, onDeleteInvestment, settings }) => {
    const [modal, setModal] = useState<{ isOpen: boolean; inv: Investment | null }>({ isOpen: false, inv: null });
    const [recs, setRecs] = useState<string[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(false);

    const { portfolio, totalMonthlyIncome } = useMemo(() => {
        const totalValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
        const totalCost = investments.reduce((sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0);
        const totalGainLoss = totalValue - totalCost;
        
        let monthlyIncome = 0;
        investments.forEach(inv => {
            if (!inv.incomeAmount || inv.incomeAmount <= 0) return;
            switch (inv.incomeFrequency) {
                case 'Daily': monthlyIncome += inv.incomeAmount * 30; break;
                case 'Weekly': monthlyIncome += inv.incomeAmount * 4.33; break;
                case 'Monthly': monthlyIncome += inv.incomeAmount; break;
                case 'Quarterly': monthlyIncome += inv.incomeAmount / 3; break;
                case 'Yearly': monthlyIncome += inv.incomeAmount / 12; break;
                default: break;
            }
        });

        return {
            portfolio: {
                totalValue,
                totalCost,
                totalGainLoss,
                gainLossPercent: totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
            },
            totalMonthlyIncome: monthlyIncome
        };
    }, [investments]);

    const handleSave = (inv: Investment) => { onSaveInvestment(inv); setModal({ isOpen: false, inv: null }); };
    const handleDelete = (id: string) => { if (window.confirm("Delete this investment?")) onDeleteInvestment(id); };
    const fetchRecs = () => { setLoadingRecs(true); getInvestmentRecommendations(investments, "Build long-term wealth").then(setRecs).finally(()=>setLoadingRecs(false)); };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4"><h2 className="text-3xl font-bold font-heading">Investment Portfolio</h2><button onClick={() => setModal({ isOpen: true, inv: null })} className="flex items-center gap-2 py-2 px-4 rounded-lg text-white bg-primary hover:bg-primary/90 font-medium"><PlusCircleIcon className="h-5 w-5" />New Investment</button></div>
            <Card><p className="text-muted-foreground text-center">Total Portfolio Value</p><p className="text-5xl font-extrabold font-heading text-foreground text-center my-2">{portfolio.totalValue.toLocaleString('en-US', { style: 'currency', currency: settings.currency })}</p></Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="text-center"><p className="flex items-center justify-center gap-2 text-muted-foreground"><TrendingUpIcon className={`h-5 w-5 ${portfolio.totalGainLoss >= 0 ? 'text-primary' : 'text-destructive'}`}/>Total Gain/Loss</p><p className={`text-3xl font-bold ${portfolio.totalGainLoss >= 0 ? 'text-primary' : 'text-destructive'}`}>{portfolio.totalGainLoss.toLocaleString('en-US', { style: 'currency', currency: settings.currency })} ({portfolio.gainLossPercent.toFixed(2)}%)</p></Card>
                 <Card className="text-center"><p className="flex items-center justify-center gap-2 text-muted-foreground"><BanknotesIcon className="h-5 w-5 text-blue-500"/>Projected Monthly Income</p><p className="text-3xl font-bold text-blue-500">{totalMonthlyIncome.toLocaleString('en-US',{style:'currency', currency:settings.currency})}</p></Card>
            </div>
            <Card><h3 className="text-xl font-bold font-heading mb-4">Portfolio Growth</h3><div className="h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={HISTORICAL_DATA}><defs><linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}/><YAxis tickFormatter={(val) => `$${val/1000}k`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}/><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}/><Area type="monotone" dataKey="portfolio" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)"/></AreaChart></ResponsiveContainer></div></Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card><h3 className="text-xl font-bold font-heading mb-4">Holdings</h3><div className="space-y-2">{investments.map(inv => { const value = inv.quantity * inv.currentPrice; const gain = value - (inv.quantity * inv.purchasePrice); return (<div key={inv.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-accent"><div><p className="font-semibold">{inv.name} <span className="text-xs text-secondary-foreground bg-secondary px-1.5 py-0.5 rounded">{inv.type}</span></p><p className="text-xs text-muted-foreground">{inv.quantity} units @ {inv.currentPrice.toLocaleString('en-US',{style:'currency',currency:settings.currency})}</p>{inv.incomeAmount && inv.incomeAmount > 0 && inv.incomeFrequency !== 'None' && (<p className="text-xs text-blue-500 font-medium">+ {inv.incomeAmount.toLocaleString('en-US',{style:'currency',currency:settings.currency})} / {inv.incomeFrequency}</p>)}</div><div className="text-right"><p className="font-bold">{value.toLocaleString('en-US',{style:'currency',currency:settings.currency})}</p><p className={`text-xs font-semibold ${gain >= 0 ? 'text-primary' : 'text-destructive'}`}>{gain >= 0 ? '+' : ''}{gain.toLocaleString('en-US',{style:'currency',currency:settings.currency})}</p></div><div className="flex"><button onClick={() => setModal({isOpen:true, inv})} className="p-1 text-muted-foreground hover:text-primary"><PencilIcon className="h-4 w-4"/></button><button onClick={() => handleDelete(inv.id)} className="p-1 text-muted-foreground hover:text-destructive"><TrashIcon className="h-4 w-4"/></button></div></div>) })}</div></Card>
                </div>
                <div><Card><h3 className="text-xl font-bold font-heading mb-4 flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-primary"/>AI Advisor</h3><button onClick={fetchRecs} disabled={loadingRecs} className="w-full py-2 px-4 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 font-medium">{loadingRecs ? 'Analyzing...' : 'Get Recommendations'}</button>{recs.length > 0 && <ul className="mt-4 space-y-2 text-sm text-muted-foreground">{recs.map((r, i) => <li key={i} className="flex items-start gap-2"><span className="mt-1 font-bold text-primary">&bull;</span>{r}</li>)}</ul>}</Card></div>
            </div>
            {modal.isOpen && <InvestmentModal investment={modal.inv} onClose={() => setModal({ isOpen: false, inv: null })} onSave={handleSave} />}
        </div>
    );
};