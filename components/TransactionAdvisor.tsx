import React, { useState } from 'react';
import { Card } from './Card';
import { SparklesIcon, TrendingUpIcon, TrendingDownIcon } from './Icons';
import { getPrePurchaseAdvice } from '../services/geminiService';
import { RecurringExpense, SavingsGoal, Transaction } from '../types';

interface TransactionAdvisorProps {
    monthlyIncome: number;
    bankAccountBalance: number;
    recurringExpenses: RecurringExpense[];
    savingsGoals: SavingsGoal[];
    transactions: Transaction[];
}

export const TransactionAdvisor: React.FC<TransactionAdvisorProps> = (props) => {
    const [purchase, setPurchase] = useState({ description: '', amount: '' });
    const [advice, setAdvice] = useState<{ advantages: string[], disadvantages: string[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetAdvice = async () => {
        if (!purchase.description || !purchase.amount) {
            setError("Please enter both a description and an amount.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAdvice(null);

        // Fix: Map `bankAccountBalance` from props to `bankBalance` expected by `getPrePurchaseAdvice`.
        const result = await getPrePurchaseAdvice(
            { ...props, bankBalance: props.bankAccountBalance },
            { description: purchase.description, amount: parseFloat(purchase.amount) }
        );

        if (result) {
            setAdvice(result);
        } else {
            setError("Sorry, I couldn't get advice for this transaction. Please try again.");
        }
        setIsLoading(false);
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold font-heading mb-4 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-soft-green-500" />
                <span>Transaction Advisor</span>
            </h3>
            <div className="space-y-3">
                <input
                    type="text"
                    value={purchase.description}
                    onChange={(e) => setPurchase({ ...purchase, description: e.target.value })}
                    placeholder="e.g., New Noise-Cancelling Headphones"
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-navy-800"
                />
                <input
                    type="number"
                    value={purchase.amount}
                    onChange={(e) => setPurchase({ ...purchase, amount: e.target.value })}
                    placeholder="Amount ($)"
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-navy-800"
                />
                <button
                    onClick={handleGetAdvice}
                    disabled={isLoading}
                    className="w-full py-2 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 font-medium disabled:bg-slate-400"
                >
                    {isLoading ? 'Analyzing...' : 'Ask AI for Advice'}
                </button>
            </div>
            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
            {isLoading && <div className="mt-4 animate-pulse space-y-2"><div className="h-4 w-1/3 bg-slate-200 dark:bg-navy-800 rounded"></div><div className="h-4 w-full bg-slate-200 dark:bg-navy-800 rounded"></div><div className="h-4 w-5/6 bg-slate-200 dark:bg-navy-800 rounded"></div></div>}
            {advice && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <h4 className="font-semibold flex items-center gap-2 text-soft-green-600"><TrendingUpIcon className="h-5 w-5"/> Advantages</h4>
                        <ul className="mt-2 space-y-1 list-disc list-inside">
                            {advice.advantages.map((adv, i) => <li key={i}>{adv}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold flex items-center gap-2 text-red-500"><TrendingDownIcon className="h-5 w-5"/> Disadvantages</h4>
                        <ul className="mt-2 space-y-1 list-disc list-inside">
                            {advice.disadvantages.map((dis, i) => <li key={i}>{dis}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </Card>
    );
};