
import React, { useState, useMemo } from 'react';
import { Transaction, UserSettings } from '../types';
import { Card } from './Card';
import { SparklesIcon, DownloadIcon } from './Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { getTaxTips, generateMonthlyReport } from '../services/geminiService';
import { marked } from 'marked';

interface ReportsProps {
    transactions: Transaction[];
    settings: UserSettings;
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];
const COLORS = ['#16a34a', '#ef4444', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899'];

export const Reports: React.FC<ReportsProps> = ({ transactions, settings }) => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    const [startDate, setStartDate] = useState(formatDate(lastMonth));
    const [endDate, setEndDate] = useState(formatDate(today));
    const [taxTips, setTaxTips] = useState<string | null>(null);
    const [isLoadingTips, setIsLoadingTips] = useState(false);
    const [monthlyReport, setMonthlyReport] = useState<any>(null);
    const [isLoadingReport, setIsLoadingReport] = useState(false);

    const filteredTransactions = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= start && txDate <= end;
        });
    }, [transactions, startDate, endDate]);

    const expenseData = useMemo(() => {
        const categories: { [key: string]: number } = {};
        filteredTransactions.filter(t => t.type === 'expense').forEach(t => { categories[t.category] = (categories[t.category] || 0) + t.amount; });
        return Object.entries(categories).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
    }, [filteredTransactions]);
    
    const handleGetTaxTips = async () => { setIsLoadingTips(true); const summary = expenseData.reduce((acc, item) => ({...acc, [item.name]: item.amount }), {}); const tips = await getTaxTips(summary); setTaxTips(tips); setIsLoadingTips(false); };
    const handleGenerateReport = async () => { setIsLoadingReport(true); const income = filteredTransactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0); const expense = filteredTransactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0); const topCats = expenseData.slice(0,3).map(c=>`${c.name}: $${c.amount.toFixed(2)}`).join(', '); const report = await generateMonthlyReport({totalIncome:income, totalExpenses:expense, topCategories:topCats, savingsProgress: 'On track'}); setMonthlyReport(report); setIsLoadingReport(false); };
    const exportToCSV = () => { /* ... existing code ... */ };

    return (
        <>
            <h2 className="text-3xl font-bold font-heading mb-6">Reports & Summaries</h2>
            <Card className="mb-6">
                 <div className="flex flex-wrap gap-4 items-end">
                    <div><label className="text-sm font-medium">Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800"/></div>
                    <div><label className="text-sm font-medium">End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800"/></div>
                    <button onClick={exportToCSV} className="flex-1 sm:flex-none py-2 px-4 rounded-lg bg-navy-700 text-white hover:bg-navy-600 flex items-center gap-2"><DownloadIcon className="h-5 w-5"/>Export CSV</button>
                </div>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <Card>
                        <h3 className="text-xl font-bold font-heading mb-4">Monthly Financial Health Report</h3>
                        <button onClick={handleGenerateReport} disabled={isLoadingReport} className="py-2 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 disabled:bg-slate-400">{isLoadingReport ? 'Generating...' : 'Generate This Month\'s Report'}</button>
                        {isLoadingReport && <div className="mt-4 animate-pulse"><div className="h-8 w-1/4 bg-slate-200 dark:bg-navy-800 rounded"></div><div className="h-4 w-full mt-2 bg-slate-200 dark:bg-navy-800 rounded"></div></div>}
                        {monthlyReport && <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"><div className="text-center p-4 rounded-lg bg-slate-100 dark:bg-navy-800"> <p className="text-sm">Health Score</p><p className="text-4xl font-bold text-soft-green-500">{monthlyReport.healthScore}/100</p></div><div className="md:col-span-2 p-4 rounded-lg bg-slate-100 dark:bg-navy-800"><p className="font-semibold">Summary</p><p className="text-sm">{monthlyReport.summary}</p><p className="font-semibold mt-2">Recommendation</p><p className="text-sm">{monthlyReport.recommendation}</p></div></div>}
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card><h3 className="text-xl font-bold font-heading mb-4">Expense Breakdown</h3><div className="h-96">{expenseData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={expenseData} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>{expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: '#334155' }}/><Legend/></PieChart></ResponsiveContainer> : <p className="text-center text-slate-500">No expense data for this period.</p>}</div></Card>
                </div>
                <div><Card><h3 className="text-xl font-bold font-heading mb-4 flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-soft-green-500"/>AI Tax Optimizer</h3><button onClick={handleGetTaxTips} disabled={isLoadingTips} className="w-full py-2 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 disabled:bg-slate-400">{isLoadingTips ? 'Generating...' : 'Get Tax Tips'}</button>{taxTips && <div className="prose prose-sm dark:prose-invert max-w-none mt-4" dangerouslySetInnerHTML={{ __html: marked(taxTips, { breaks: true }) }}/>}</Card></div>
            </div>
        </>
    );
};
