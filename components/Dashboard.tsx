import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { ACCOUNT_SUMMARY, SAVINGS_GOALS, BILLS, TRANSACTIONS, SMART_ALERTS } from '../constants';
import { BudgetCategory, SavingsGoal, SmartAlert, Transaction, Bill, RecurringExpense } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BellIcon, WarningIcon, InfoIcon, CheckCircleIcon, CheckIcon, XIcon, ClockIcon, ClipboardListIcon } from './Icons';

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
    const [currentValue, setCurrentValue] = useState(0);

    useEffect(() => {
        const animationDuration = 1000;
        const frames = 50;
        const increment = value / frames;
        let frame = 0;

        const timer = setInterval(() => {
            frame++;
            setCurrentValue(prev => {
                const newValue = prev + increment;
                if (frame >= frames) {
                    clearInterval(timer);
                    return value;
                }
                return newValue;
            });
        }, animationDuration / frames);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <span>
            {currentValue.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}
        </span>
    );
};

const SummaryCards: React.FC<{
    monthlyIncome: number;
    totalRecurringExpenses: number;
    discretionarySpending: number;
}> = ({ monthlyIncome, totalRecurringExpenses, discretionarySpending }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Balance</h3>
            <p className="text-3xl font-bold font-heading text-navy-800 dark:text-white mt-2">
                <AnimatedNumber value={ACCOUNT_SUMMARY.totalBalance} />
            </p>
        </Card>
        <Card>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Your Monthly Income</h3>
            <p className="text-3xl font-bold font-heading text-soft-green-600 dark:text-soft-green-500 mt-2">
                <AnimatedNumber value={monthlyIncome} />
            </p>
        </Card>
        <Card>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Recurring Expenses</h3>
            <p className="text-3xl font-bold font-heading text-red-500 mt-2">
                <AnimatedNumber value={totalRecurringExpenses} />
            </p>
        </Card>
        <Card>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Available for Budget</h3>
            <p className="text-3xl font-bold font-heading text-blue-500 dark:text-blue-400 mt-2">
                <AnimatedNumber value={discretionarySpending} />
            </p>
        </Card>
    </div>
);

const ExpenseChart: React.FC<{ recurringExpenses: RecurringExpense[], setView: (view: 'dashboard' | 'chat' | 'financialHub') => void }> = ({ recurringExpenses, setView }) => {
    const expenseData = recurringExpenses.reduce((acc, expense) => {
        const existingCategory = acc.find(item => item.name === expense.category);
        if (existingCategory) {
            existingCategory.amount += expense.amount;
        } else {
            acc.push({ name: expense.category, amount: expense.amount });
        }
        return acc;
    }, [] as { name: string; amount: number }[]);

    if (recurringExpenses.length === 0) {
        return (
             <Card>
                <h3 className="text-lg font-semibold font-heading mb-4">Expense Breakdown</h3>
                <div className="h-80 flex flex-col items-center justify-center text-center">
                    <ClipboardListIcon className="h-12 w-12 text-slate-400 mb-4" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No Recurring Expenses Added</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Add expenses in the Financial Hub to see your breakdown.</p>
                    <button
                        onClick={() => setView('financialHub')}
                        className="py-2 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 font-medium transition-transform hover:scale-105"
                    >
                        Go to Financial Hub
                    </button>
                </div>
            </Card>
        );
    }
    
    return (
        <Card>
            <h3 className="text-lg font-semibold font-heading mb-4">Expense Breakdown</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                        <Tooltip
                            cursor={{ fill: 'rgba(127, 127, 127, 0.1)' }}
                            contentStyle={{ 
                                backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                                borderColor: '#334155',
                                color: '#f1f5f9',
                                borderRadius: '0.5rem'
                            }}
                        />
                        <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};


const ProgressBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
    <div className="w-full bg-slate-200 dark:bg-navy-800 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
);

const AIBudgetPlanner: React.FC<{ budgets: BudgetCategory[]; setView: (view: 'dashboard' | 'chat' | 'financialHub') => void }> = ({ budgets, setView }) => (
    <Card>
        <h3 className="text-lg font-semibold font-heading mb-4">AI Budget Planner</h3>
        {budgets.length > 0 ? (
            <div className="space-y-4">
                {budgets.map(budget => {
                    const percentage = (budget.spent / budget.allocated) * 100;
                    const color = percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-soft-green-500';
                    return (
                        <div key={budget.id}>
                            <div className="flex justify-between mb-1 text-sm font-medium">
                                <span>{budget.name}</span>
                                <span>${budget.spent.toFixed(2)} / ${budget.allocated.toFixed(2)}</span>
                            </div>
                            <ProgressBar value={percentage} color={color} />
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-4">
                <p className="text-slate-500 dark:text-slate-400 mb-4">Your personalized budget will appear here.</p>
                <button
                    onClick={() => setView('financialHub')}
                    className="py-2 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 font-medium transition-transform hover:scale-105"
                >
                    Set Up Your Financial Hub
                </button>
            </div>
        )}
    </Card>
);


const SavingsGoals: React.FC<{ goals: SavingsGoal[] }> = ({ goals }) => (
    <Card>
        <h3 className="text-lg font-semibold font-heading mb-4">Savings Goals</h3>
        <div className="space-y-4">
            {goals.map(goal => {
                const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                    <div key={goal.id}>
                         <div className="flex justify-between mb-1 text-sm font-medium">
                            <span>{goal.name}</span>
                            <span className="text-soft-green-500">{percentage.toFixed(0)}%</span>
                        </div>
                        <ProgressBar value={percentage} color="bg-soft-green-500" />
                    </div>
                )
            })}
        </div>
    </Card>
);

const statusStyles: { [key in Bill['status']]: { text: string; bg: string; icon?: React.FC<{className?: string}> } } = {
    'Pending Approval': { text: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-400', icon: WarningIcon },
    'Scheduled': { text: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400', icon: ClockIcon },
    'Paid': { text: 'text-soft-green-700', bg: 'bg-soft-green-100 dark:bg-soft-green-500/10 dark:text-soft-green-400', icon: CheckCircleIcon },
    'Declined': { text: 'text-red-600', bg: 'bg-red-100 dark:bg-red-500/10 dark:text-red-400', icon: XIcon }
};

const BillPayCenter: React.FC = () => {
    const [bills, setBills] = useState<Bill[]>(BILLS);

    const handleUpdateStatus = (billId: string, newStatus: Bill['status']) => {
        setBills(currentBills => currentBills.map(b => b.id === billId ? { ...b, status: newStatus } : b));
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold font-heading mb-4">Bill Pay Center</h3>
            <ul className="space-y-4">
                {bills.map(bill => {
                    const style = statusStyles[bill.status];
                    const Icon = style.icon;
                    return (
                        <li key={bill.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div className="flex-grow">
                                <p className="font-semibold">{bill.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    ${bill.amount.toFixed(2)} due on {bill.dueDate}
                                </p>
                                <span className={`inline-flex items-center gap-1.5 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                                    {Icon && <Icon className="h-3 w-3" />}
                                    {bill.status}
                                </span>
                            </div>
                            {bill.status === 'Pending Approval' && (
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button 
                                        onClick={() => handleUpdateStatus(bill.id, 'Declined')}
                                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                        aria-label="Decline"
                                    >
                                        <XIcon className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus(bill.id, 'Scheduled')}
                                        className="p-2 rounded-full bg-soft-green-100 text-soft-green-600 hover:bg-soft-green-200 transition-colors"
                                        aria-label="Approve"
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
};


const alertStyles = {
    warning: {
        icon: WarningIcon,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
    },
    info: {
        icon: InfoIcon,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    success: {
        icon: CheckCircleIcon,
        color: 'text-soft-green-500',
        bg: 'bg-soft-green-500/10',
    },
};

const SmartAlerts = () => (
    <Card>
        <h3 className="text-lg font-semibold font-heading mb-4 flex items-center gap-2">
            <BellIcon className="h-5 w-5 text-soft-green-500" />
            <span>Smart Alerts</span>
        </h3>
        <ul className="space-y-4">
            {SMART_ALERTS.map(alert => {
                const style = alertStyles[alert.type];
                const Icon = style.icon;
                return (
                    <li key={alert.id} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${style.bg}`}>
                            <Icon className={`w-5 h-5 ${style.color}`} />
                        </div>
                        <div>
                            <p className="font-semibold">{alert.title}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{alert.message}</p>
                        </div>
                    </li>
                )
            })}
        </ul>
    </Card>
);

interface DashboardProps {
    budgets: BudgetCategory[];
    setView: (view: 'dashboard' | 'chat' | 'financialHub') => void;
    monthlyIncome: number;
    recurringExpenses: RecurringExpense[];
}

export const Dashboard: React.FC<DashboardProps> = ({ budgets, setView, monthlyIncome, recurringExpenses }) => {
  const totalRecurringExpenses = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const discretionarySpending = monthlyIncome - totalRecurringExpenses;

  return (
    <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
            <SummaryCards 
                monthlyIncome={monthlyIncome}
                totalRecurringExpenses={totalRecurringExpenses}
                discretionarySpending={discretionarySpending}
            />
        </div>
        <div className="col-span-12 lg:col-span-8">
            <ExpenseChart recurringExpenses={recurringExpenses} setView={setView} />
        </div>
        <div className="col-span-12 lg:col-span-4">
            <AIBudgetPlanner budgets={budgets} setView={setView} />
        </div>
        <div className="col-span-12 xl:col-span-6">
            <BillPayCenter />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <SavingsGoals goals={SAVINGS_GOALS} />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <SmartAlerts />
        </div>
    </div>
  );
};