
import { Transaction, SavingsGoal, AccountSummary, SmartAlert, Bill } from './types';

export const ACCOUNT_SUMMARY: AccountSummary = {
  totalBalance: 24850.75,
  monthlyIncome: 7500.00,
  monthlyExpenses: 4210.50,
};

export const TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-07-15', description: 'Netflix Subscription', amount: 15.99, category: 'Subscriptions', type: 'expense' },
  { id: '2', date: '2026-07-15', description: 'Whole Foods Market', amount: 124.50, category: 'Groceries', type: 'expense' },
  { id: '3', date: '2026-07-14', description: 'Salary Deposit', amount: 3750.00, category: 'Income', type: 'income' },
  { id: '4', date: '2026-07-14', description: 'Shell Gas Station', amount: 55.20, category: 'Transport', type: 'expense' },
  { id: '5', date: '2026-07-13', description: 'Rent Payment', amount: 2200.00, category: 'Housing', type: 'expense' },
  { id: '6', date: '2026-07-12', description: 'The Daily Grind Cafe', amount: 8.75, category: 'Food & Dining', type: 'expense' },
  { id: '7', date: '2026-07-11', description: 'Amazon.com Order', amount: 78.90, category: 'Shopping', type: 'expense' },
  { id: '8', date: '2026-07-10', description: 'Electricity Bill', amount: 95.60, category: 'Utilities', type: 'expense' },
  { id: '9', date: '2026-07-08', description: 'Spotify Premium', amount: 9.99, category: 'Subscriptions', type: 'expense' },
  { id: '10', date: '2026-07-05', description: 'Dinner at The Italian Place', amount: 85.00, category: 'Food & Dining', type: 'expense' },
  { id: '11', date: '2026-07-02', description: 'Freelance Project Payment', amount: 500.00, category: 'Income', type: 'income' },
  { id: '12', date: '2026-07-01', description: 'Gym Membership', amount: 40.00, category: 'Health', type: 'expense' },
];

export const SAVINGS_GOALS: SavingsGoal[] = [
  { id: '1', name: 'Vacation to Hawaii', targetAmount: 5000, currentAmount: 3200 },
  { id: '2', name: 'New Laptop', targetAmount: 2000, currentAmount: 1850 },
  { id: '3', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 6500 },
];

export const AI_INSIGHTS: string[] = [
    "You've spent 15% more on dining out this month compared to last. Consider cooking at home to save.",
    "Your 'Shopping' budget is almost maxed out. Be mindful of new purchases for the rest of the month.",
    "Great job on your Hawaii vacation goal! You're over 60% of the way there.",
];

export const BILLS: Bill[] = [
    { id: 'b1', name: "Rent", dueDate: "August 1, 2026", amount: 2200, type: 'Bill', status: 'Paid' },
    { id: 'b2', name: "Internet Bill", dueDate: "August 5, 2026", amount: 65, type: 'Bill', status: 'Pending Approval' },
    { id: 'b3', name: "Car Insurance", dueDate: "August 10, 2026", amount: 120, type: 'Bill', status: 'Scheduled' },
    { id: 'b4', name: "Netflix", dueDate: "August 15, 2026", amount: 15.99, type: 'Subscription', status: 'Pending Approval' },
];

export const SMART_ALERTS: SmartAlert[] = [
  { id: '1', title: 'High Spending', message: 'Your spending in "Shopping" is 85% higher than your monthly average.', type: 'warning', date: '2026-07-15' },
  { id: '2', title: 'Goal Milestone!', message: 'You\'ve just passed the 50% mark for your "Emergency Fund" goal. Keep it up!', type: 'success', date: '2026-07-14' },
  { id: '3', title: 'New Subscription', message: 'We detected a new recurring payment to "Spotify Premium". Is this correct?', type: 'info', date: '2026-07-10' },
];


export const FINANCIAL_ANALYSIS_PROMPT = `
You are SmartFinance AI, a helpful and insightful personal finance assistant for the year 2026.
Analyze the user's financial data and their question to provide clear, actionable, and friendly advice.
Use markdown for formatting, especially for lists, bold text, and key takeaways.

Here is the user's transaction data for the current period:
--- TRANSACTION DATA ---
{transactions}
--- END TRANSACTION DATA ---

Here is the user's question:
--- USER QUESTION ---
{query}
--- END USER QUESTION ---

Based on the data and the user's question, please provide a comprehensive and helpful response.
If the user asks a general question, provide insights based on their spending patterns.
If the user asks to categorize transactions from a CSV, provide the categorized list.
Do not mention that you are an AI model. Maintain the persona of a dedicated financial assistant.
`;

export const RECURRING_EXPENSE_CATEGORIES = [
    'Housing',
    'Utilities',
    'Subscriptions',
    'Transport',
    'Insurance',
    'Groceries',
    'Debt Payment',
    'Health',
    'Other'
];

export const SUGGEST_EXPENSES_PROMPT = `
You are SmartFinance AI, an intelligent financial assistant.
A user has provided the following profile information:
- Country: {country}
- Monthly Income: {monthlyIncome}
- Primary Financial Goal: {financialGoal}

Based on this, suggest 5 common recurring monthly expenses this user likely has.
Focus on essential and common expenses for their region.
The goal is to help them quickly set up their budget foundation.
`;