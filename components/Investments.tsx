
import React, { useState, useMemo } from 'react';
import { Investment, UserSettings } from '../types';
import { Card } from './Card';
import { PlusCircleIcon, PencilIcon, TrashIcon, XIcon, SparklesIcon, TrendingUpIcon, BanknotesIcon } from './Icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { HISTORICAL_DATA } from '../constants';
import { getInvestmentRecommendations } from '../services/geminiService';

interface InvestmentsProps {
    investments: Investment[];
    setInvestments: React.Dispatch<React.SetStateAction<Investment[]>>;
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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrent(p => ({ ...p, [name]: (['quantity', 'purchasePrice', 'currentPrice', 'incomeAmount'].includes(name)) ? parseFloat(value) || 0 : value }));
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(current); };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex justify-between items-center"><h3 className="text-xl font-bold font-heading">{investment ? 'Edit' : 'Add'} Investment</h3><button type="button" onClick={onClose}><XIcon className="h-5 w-5"/></button></div>
                    <div><label className="text-sm font-medium">Name</label><input type="text" name="name" value={current.name} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Type</label><select name="type" value={current.type} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800 appearance-none"><option>Stock</option><option>Crypto</option><option>Real Estate</option><option>Other</option></select></div>
                        <div><label className="text-sm font-medium">Quantity / Units</label><input type="number" step="any" name="quantity" value={current.quantity} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Purchase Price ($)</label><input type="number" step="any" name="purchasePrice" value={current.purchasePrice} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required /></div>
                        <div><label className="text-sm font-medium">Current Price ($)</label><input type="number" step="any" name="currentPrice" value={current.currentPrice} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required /></div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Income Amount ($)</label><input type="number" step="any" name="incomeAmount" value={current.incomeAmount} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" /></div>
                        <div><label className="text-sm font-medium">Income Frequency</label><select name="incomeFrequency" value={current.incomeFrequency} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800 appearance-none"><option>None</option><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option><option>Yearly</option><option>One-time</option></select></div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-200 dark:bg-navy-700">Cancel</button><button type="submit" className="py-2 px-4 rounded-lg text-white bg-soft-green-600">Save</button></div>
                </form>
            </div>
        </div>
    );
};

export const Investments: React.FC<InvestmentsProps> = ({ investments, setInvestments, settings }) => {
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

    const handleSave = (inv: Investment) => {
        if (inv.id) setInvestments(investments.map(i => i.id === inv.id ? inv : i));
        else setInvestments([...investments, { ...inv, id: `inv-${Date.now()}` }]);
        setModal({ isOpen: false, inv: null });
    };

    const handleDelete = (id: string) => { if (window.confirm("Delete this investment?")) setInvestments(investments.filter(i => i.id !== id)); };
    const fetchRecs = () => { setLoadingRecs(true); getInvestmentRecommendations(investments, "Build long-term wealth").then(setRecs).finally(()=>setLoadingRecs(false)); };
    
    return (
        <>
            <div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold font-heading">Investment Portfolio</h2><button onClick={() => setModal({ isOpen: true, inv: null })} className="flex items-center gap-2 py-2 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 font-medium"><PlusCircleIcon className="h-5 w-5" />New Investment</button></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="lg:col-span-2 text-center"><p>Total Portfolio Value</p><p className="text-5xl font-extrabold font-heading text-navy-800 dark:text-white my-2">{portfolio.totalValue.toLocaleString('en-US', { style: 'currency', currency: settings.currency })}</p></Card>
                <Card className="text-center"><p className="flex items-center justify-center gap-2"><TrendingUpIcon className={`h-5 w-5 ${portfolio.totalGainLoss >= 0 ? 'text-soft-green-500' : 'text-red-500'}`}/>Total Gain/Loss</p><p className={`text-3xl font-bold ${portfolio.totalGainLoss >= 0 ? 'text-soft-green-600' : 'text-red-500'}`}>{portfolio.totalGainLoss.toLocaleString('en-US', { style: 'currency', currency: settings.currency })} ({portfolio.gainLossPercent.toFixed(2)}%)</p></Card>
                 <Card className="text-center"><p className="flex items-center justify-center gap-2"><BanknotesIcon className="h-5 w-5 text-blue-500"/>Projected Monthly Income</p><p className="text-3xl font-bold text-blue-500">{totalMonthlyIncome.toLocaleString('en-US',{style:'currency', currency:settings.currency})}</p></Card>
            </div>
            <Card className="mb-6"><h3 className="text-xl font-bold font-heading mb-4">Portfolio Growth</h3><div className="h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={HISTORICAL_DATA}><defs><linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="month" /><YAxis tickFormatter={(val) => `$${val/1000}k`}/><Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: '#334155' }}/><Area type="monotone" dataKey="portfolio" stroke="#22c55e" fillOpacity={1} fill="url(#colorUv)"/></AreaChart></ResponsiveContainer></div></Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card><h3 className="text-xl font-bold font-heading mb-4">Holdings</h3><div className="space-y-2">{investments.map(inv => { const value = inv.quantity * inv.currentPrice; const gain = value - (inv.quantity * inv.purchasePrice); return (<div key={inv.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"><div><p className="font-semibold">{inv.name} <span className="text-xs text-slate-400 bg-slate-200 dark:bg-navy-700 px-1.5 py-0.5 rounded">{inv.type}</span></p><p className="text-xs text-slate-500">{inv.quantity} units @ {inv.currentPrice.toLocaleString('en-US',{style:'currency',currency:settings.currency})}</p>{inv.incomeAmount && inv.incomeAmount > 0 && inv.incomeFrequency !== 'None' && (<p className="text-xs text-blue-500 font-medium">+ {inv.incomeAmount.toLocaleString('en-US',{style:'currency',currency:settings.currency})} / {inv.incomeFrequency}</p>)}</div><div className="text-right"><p className="font-bold">{value.toLocaleString('en-US',{style:'currency',currency:settings.currency})}</p><p className={`text-xs font-semibold ${gain >= 0 ? 'text-soft-green-600' : 'text-red-500'}`}>{gain >= 0 ? '+' : ''}{gain.toLocaleString('en-US',{style:'currency',currency:settings.currency})}</p></div><div className="flex"><button onClick={() => setModal({isOpen:true, inv})} className="p-1"><PencilIcon className="h-4 w-4"/></button><button onClick={() => handleDelete(inv.id)} className="p-1"><TrashIcon className="h-4 w-4"/></button></div></div>) })}</div></Card>
                </div>
                <div><Card><h3 className="text-xl font-bold font-heading mb-4 flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-soft-green-500"/>AI Advisor</h3><button onClick={fetchRecs} disabled={loadingRecs} className="w-full py-2 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 disabled:bg-slate-400">{loadingRecs ? 'Analyzing...' : 'Get Recommendations'}</button>{recs.length > 0 && <ul className="mt-4 space-y-2 text-sm">{recs.map((r, i) => <li key={i} className="flex items-start gap-2"><span className="mt-1">-</span>{r}</li>)}</ul>}</Card></div>
            </div>
            {modal.isOpen && <InvestmentModal investment={modal.inv} onClose={() => setModal({ isOpen: false, inv: null })} onSave={handleSave} />}
        </>
    );
};