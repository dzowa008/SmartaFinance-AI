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
    const inputClasses = "w-full p-2 rounded-lg bg-input border border-border focus:ring-1 focus:ring-ring outline-none";


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
                <SparklesIcon className="h-5 w-5 text-primary" />
                <span>Transaction Advisor</span>
            </h3>
            <div className="space-y-3">
                <input
                    type="text"
                    value={purchase.description}
                    onChange={(e) => setPurchase({ ...purchase, description: e.target.value })}
                    placeholder="e.g., New Noise-Cancelling Headphones"
                    className={inputClasses}
                />
                <input
                    type="number"
                    value={purchase.amount}
                    onChange={(e) => setPurchase({ ...purchase, amount: e.target.value })}
                    placeholder="Amount ($)"
                    className={inputClasses}
                />
                <button
                    onClick={handleGetAdvice}
                    disabled={isLoading}
                    className="w-full py-2 px-4 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 font-medium disabled:opacity-50"
                >
                    {isLoading ? 'Analyzing...' : 'Ask AI for Advice'}
                </button>
            </div>
            {error && <p className="text-sm text-destructive mt-3">{error}</p>}
            {isLoading && <div className="mt-4 animate-pulse space-y-2"><div className="h-4 w-1/3 bg-muted rounded"></div><div className="h-4 w-5/6 bg-muted rounded"></div><div className="h-4 w-2/3 bg-muted rounded"></div></div>}
            {advice && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <h4 className="font-semibold flex items-center gap-2 text-primary"><TrendingUpIcon className="h-5 w-5"/> Advantages</h4>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            {advice.advantages.map((adv, i) => <li key={i}>{adv}</li>)}
                        </ul>
                    </div>
                    <div className="p-3 bg-destructive/10 rounded-lg">
                        <h4 className="font-semibold flex items-center gap-2 text-destructive"><TrendingDownIcon className="h-5 w-5"/> Disadvantages</h4>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            {advice.disadvantages.map((dis, i) => <li key={i}>{dis}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </Card>
    );
};