import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './Card';
import { UserProfile, SavingsGoal, Transaction, Bill, RecurringExpense, UserSettings, Investment } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { CheckCircleIcon, CheckIcon, XIcon, ClockIcon, BanknotesIcon, ArrowUpCircleIcon, ArrowDownCircleIcon, ScaleIcon, SparklesIcon, XCircleIcon } from './Icons';
import { generateAIInsights } from '../services/geminiService';
import { TransactionAdvisor } from './TransactionAdvisor';

const AnimatedNumber: React.FC<{ value: number, settings: UserSettings }> = ({ value, settings }) => { const [currentValue, setCurrentValue] = useState(0); useEffect(() => { const timer = setInterval(() => { setCurrentValue(v => { const newV = v + (value - v) / 10; if (Math.abs(value - newV) < 0.01) { clearInterval(timer); return value; } return newV; }); }, 20); return () => clearInterval(timer); }, [value]); return <span>{currentValue.toLocaleString('en-US', { style: 'currency', currency: settings.currency })}</span>; };

const SummaryCards: React.FC<{ bankAccountBalance: number; monthlyIncome: number; totalRecurringExpenses: number; availableForBudget: number; settings: UserSettings; }> = ({ bankAccountBalance, monthlyIncome, totalRecurringExpenses, availableForBudget, settings }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col justify-between">
             <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-muted-foreground">Bank Balance</h3>
                <BanknotesIcon className="w-5 h-5 text-muted-foreground" />
             </div>
            <p className="text-3xl font-bold text-foreground mt-2"><AnimatedNumber value={bankAccountBalance} settings={settings} /></p>
        </Card>
        <Card className="flex flex-col justify-between">
             <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-muted-foreground">Monthly Income</h3>
                <ArrowUpCircleIcon className="w-5 h-5 text-primary" />
             </div>
            <p className="text-3xl font-bold text-primary mt-2"><AnimatedNumber value={monthlyIncome} settings={settings} /></p>
        </Card>
        <Card className="flex flex-col justify-between">
             <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-muted-foreground">Fixed Expenses</h3>
                <ArrowDownCircleIcon className="w-5 h-5 text-destructive" />
             </div>
            <p className="text-3xl font-bold text-destructive mt-2"><AnimatedNumber value={totalRecurringExpenses} settings={settings} /></p>
        </Card>
        <Card className="flex flex-col justify-between">
             <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-muted-foreground">Budgetable</h3>
                <ScaleIcon className="w-5 h-5 text-muted-foreground" />
             </div>
            <p className="text-3xl font-bold text-foreground mt-2"><AnimatedNumber value={availableForBudget} settings={settings} /></p>
        </Card>
    </div>
);

const BillItem: React.FC<{ bill: Bill, onApprove: (id: string) => void, onDecline: (id: string) => void }> = ({ bill, onApprove, onDecline }) => {
    const statusStyles = {
        'Paid': { icon: CheckCircleIcon, text: 'text-primary', bg: 'bg-primary/10' },
        'Scheduled': { icon: ClockIcon, text: 'text-blue-500', bg: 'bg-blue-500/10' },
        'Pending Approval': { icon: ClockIcon, text: 'text-amber-500', bg: 'bg-amber-500/10' },
        'Declined': { icon: XCircleIcon, text: 'text-destructive', bg: 'bg-destructive/10' },
    };
    const currentStatus = statusStyles[bill.status];

    return (
        <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent">
            <div>
                <p className="font-semibold">{bill.name}</p>
                <p className="text-sm text-muted-foreground">Due: {bill.dueDate}</p>
            </div>
            <div className="flex items-center gap-4">
                <span className="font-bold">${bill.amount.toFixed(2)}</span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${currentStatus.bg} ${currentStatus.text}`}>
                    <currentStatus.icon className="h-4 w-4" />
                    {bill.status}
                </span>
                {bill.status === 'Pending Approval' && (
                    <div className="flex gap-2">
                        <button onClick={() => onApprove(bill.id)} className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20"><CheckIcon className="h-4 w-4"/></button>
                        <button onClick={() => onDecline(bill.id)} className="p-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"><XIcon className="h-4 w-4"/></button>
                    </div>
                )}
            </div>
        </div>
    );
};

interface DashboardProps {
  userProfile: UserProfile;
  monthlyIncome: number;
  recurringExpenses: RecurringExpense[];
  transactions: Transaction[];
  bills: Bill[];
  setBills: (bills: Bill[]) => void;
  goals: SavingsGoal[];
  bankAccountBalance: number;
  settings: UserSettings;
  investments: Investment[];
  isOffline: boolean;
}

export const Dashboard: React.FC<DashboardProps> = (props) => {
    const { userProfile, monthlyIncome, recurringExpenses, transactions, bills, setBills, goals, bankAccountBalance, settings, isOffline } = props;
    const [aiInsights, setAiInsights] = useState<string[]>([]);
    
    useEffect(() => {
        if (transactions.length > 0 && !isOffline) {
            generateAIInsights(transactions).then(setAiInsights);
        } else if (isOffline) {
            setAiInsights(["AI insights are unavailable in offline mode."]);
        }
    }, [transactions, isOffline]);

    const cashFlowData = useMemo(() => {
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return { month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), income: 0, expenses: 0 };
        }).reverse();

        transactions.forEach(t => {
            const txDate = new Date(t.date);
            const month = txDate.toLocaleString('default', { month: 'short' });
            const year = txDate.getFullYear();
            const monthData = months.find(m => m.month === month && m.year === year);
            if (monthData) {
                if (t.type === 'income') monthData.income += t.amount;
                else monthData.expenses += t.amount;
            }
        });
        return months;
    }, [transactions]);

    const totalRecurringExpenses = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const availableForBudget = monthlyIncome - totalRecurringExpenses;
    const recentTransactions = transactions.slice(0, 5);

    const handleBillAction = (id: string, status: 'Scheduled' | 'Declined') => {
        setBills(bills.map(b => b.id === id ? { ...b, status } : b));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-heading">Dashboard</h2>
                    <p className="text-muted-foreground text-lg">Welcome back, {userProfile.fullName.split(' ')[0]}!</p>
                </div>
            </div>

            <SummaryCards
                bankAccountBalance={bankAccountBalance}
                monthlyIncome={monthlyIncome}
                totalRecurringExpenses={totalRecurringExpenses}
                availableForBudget={availableForBudget}
                settings={settings}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <h3 className="text-lg font-semibold font-heading mb-4">Cash Flow (Last 6 Months)</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={cashFlowData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(val) => `$${val / 1000}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}/>
                                    <Legend />
                                    <Line type="monotone" dataKey="income" stroke="hsl(var(--primary))" strokeWidth={2} name="Income" dot={false} />
                                    <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={2} name="Expenses" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                         <h3 className="text-lg font-semibold font-heading mb-4 flex items-center gap-2">
                            <SparklesIcon className="h-5 w-5 text-primary" /> AI Insights
                        </h3>
                        {aiInsights.length > 0 ? (
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                {aiInsights.map((insight, i) => <li key={i} className="flex items-start gap-3"><span className="mt-1.5 font-bold text-primary">&bull;</span>{insight.replace(/[-*]/g, '').trim()}</li>)}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground">Generating insights...</p>}
                    </Card>
                    <TransactionAdvisor {...props} savingsGoals={goals} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold font-heading mb-4">Recent Transactions</h3>
                    <div className="space-y-1">
                        {recentTransactions.map(tx => (
                            <div key={tx.id} className="flex justify-between items-center p-4 rounded-lg hover:bg-accent">
                                <div>
                                    <p className="font-medium">{tx.description}</p>
                                    <p className="text-xs text-muted-foreground">{tx.date} &bull; {tx.category}</p>
                                </div>
                                <p className={`font-bold ${tx.type === 'income' ? 'text-primary' : 'text-foreground'}`}>
                                    {tx.type === 'income' ? '+' : '-'}
                                    {tx.amount.toLocaleString('en-US', { style: 'currency', currency: settings.currency })}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card>
                     <h3 className="text-lg font-semibold font-heading mb-4">Upcoming Bills</h3>
                     <div className="space-y-1">
                         {bills.filter(b => b.status !== 'Paid').slice(0,4).map(bill => (
                             <BillItem key={bill.id} bill={bill} onApprove={(id) => handleBillAction(id, 'Scheduled')} onDecline={(id) => handleBillAction(id, 'Declined')} />
                         ))}
                     </div>
                </Card>
            </div>
        </div>
    );
};