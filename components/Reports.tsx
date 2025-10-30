import React, { useState, useMemo } from 'react';
import { Transaction, UserSettings } from '../types';
import { Card } from './Card';
import { SparklesIcon, DownloadIcon } from './Icons';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getTaxTips, generateMonthlyReport } from '../services/geminiService';
import { marked } from 'marked';

interface ReportsProps {
    transactions: Transaction[];
    settings: UserSettings;
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];
const COLORS = ['hsl(var(--primary))', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899', '#10b981'];

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
        end.setHours(23, 59, 59, 999); // Ensure end date is inclusive
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
        <div className="space-y-6">
             <div>
                <h2 className="text-3xl font-bold font-heading">Reports & Summaries</h2>
                <p className="text-muted-foreground text-lg">Analyze your financial data over specific periods.</p>
            </div>
            <Card>
                 <div className="flex flex-wrap gap-4 items-end">
                    <div><label className="text-sm font-medium">Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 p-2 rounded-lg bg-input border border-border"/></div>
                    <div><label className="text-sm font-medium">End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 p-2 rounded-lg bg-input border border-border"/></div>
                    <button onClick={exportToCSV} className="flex-1 sm:flex-none py-2 px-4 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted flex items-center gap-2 font-medium"><DownloadIcon className="h-5 w-5"/>Export CSV</button>
                </div>
            </Card>
            <Card>
                <h3 className="text-xl font-bold font-heading mb-4">Monthly Financial Health Report</h3>
                <button onClick={handleGenerateReport} disabled={isLoadingReport} className="py-2 px-4 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 font-medium">{isLoadingReport ? 'Generating...' : 'Generate This Month\'s Report'}</button>
                {isLoadingReport && <div className="mt-4 animate-pulse"><div className="h-8 w-1/4 bg-muted rounded"></div><div className="h-4 w-full mt-2 bg-muted rounded"></div></div>}
                {monthlyReport && <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"><div className="text-center p-4 rounded-lg bg-accent"> <p className="text-sm text-muted-foreground">Health Score</p><p className="text-4xl font-bold text-primary">{monthlyReport.healthScore}/100</p></div><div className="md:col-span-2 p-4 rounded-lg bg-accent"><p className="font-semibold">Summary</p><p className="text-sm">{monthlyReport.summary}</p><p className="font-semibold mt-2">Recommendation</p><p className="text-sm">{monthlyReport.recommendation}</p></div></div>}
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card><h3 className="text-xl font-bold font-heading mb-4">Expense Breakdown</h3><div className="h-96">{expenseData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={expenseData} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => { const radius = innerRadius + (outerRadius - innerRadius) * 0.5; const x = cx + radius * Math.cos(-midAngle * Math.PI / 180); const y = cy + radius * Math.sin(-midAngle * Math.PI / 180); return percent > 0.05 ? (<text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}> {`${(percent * 100).toFixed(0)}%`} </text>) : null;}}>{expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}/><Legend/></PieChart></ResponsiveContainer> : <div className="flex items-center justify-center h-full"><p className="text-center text-muted-foreground">No expense data for this period.</p></div>}</div></Card>
                </div>
                <div><Card><h3 className="text-xl font-bold font-heading mb-4 flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-primary"/>AI Tax Optimizer</h3><button onClick={handleGetTaxTips} disabled={isLoadingTips} className="w-full py-2 px-4 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 font-medium">{isLoadingTips ? 'Generating...' : 'Get Tax Tips'}</button>{taxTips && <div className="prose prose-sm dark:prose-invert max-w-none mt-4" dangerouslySetInnerHTML={{ __html: marked(taxTips, { breaks: true }) }}/>}</Card></div>
            </div>
        </div>
    );
};