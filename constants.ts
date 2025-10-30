import { Transaction, AccountSummary, Bill, Asset, Liability, ForumPost, Challenge, Badge, Investment, SplitExpense } from './types';

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

export const INITIAL_BILLS: Bill[] = [
    { id: 'b1', name: "Rent", dueDate: "August 1, 2026", amount: 2200, type: 'Bill', status: 'Paid' },
    { id: 'b2', name: "Internet Bill", dueDate: "August 5, 2026", amount: 65, type: 'Bill', status: 'Pending Approval' },
    { id: 'b3', name: "Car Insurance", dueDate: "August 10, 2026", amount: 120, type: 'Bill', status: 'Scheduled' },
    { id: 'b4', name: "Netflix", dueDate: "August 15, 2026", amount: 15.99, type: 'Subscription', status: 'Pending Approval' },
];

export const HISTORICAL_DATA = [
  { month: 'Feb', income: 7200, expenses: 4500, netWorth: 75000, portfolio: 52000 },
  { month: 'Mar', income: 7300, expenses: 4800, netWorth: 77500, portfolio: 54500 },
  { month: 'Apr', income: 7500, expenses: 4600, netWorth: 80400, portfolio: 58000 },
  { month: 'May', income: 7400, expenses: 5100, netWorth: 82700, portfolio: 57500 },
  { month: 'Jun', income: 7600, expenses: 4900, netWorth: 85400, portfolio: 61200 },
  { month: 'Jul', income: 7500, expenses: 4210, netWorth: 88690, portfolio: 64310 },
];

export const INITIAL_ASSETS: Asset[] = [];

export const INITIAL_LIABILITIES: Liability[] = [];

export const INITIAL_FORUM_POSTS: ForumPost[] = [
    { id: 'p1', title: "What's the best high-yield savings account right now?", author: 'SaverSteve', timestamp: '2 hours ago', content: 'Looking to move my emergency fund. Any recommendations for an HYSA with a good rate and low fees?', comments: [{id: 'c1', author: 'FrugalFiona', text: 'I use Ally, their rates are pretty competitive and the app is great!', timestamp: '1 hour ago'}] },
    { id: 'p2', title: 'Beginner investing question: ETF or Mutual Fund?', author: 'InvestoNewbie', timestamp: '5 hours ago', content: 'Just starting my investment journey. What are the pros and cons between ETFs and mutual funds for a beginner?', comments: [] },
];

export const INITIAL_CHALLENGES: Challenge[] = [
    { id: 'ch1', title: 'No-Spend Weekend', description: 'Avoid all non-essential spending for 48 hours.', type: 'no-spend', goal: 0, duration: 'This Weekend', isCompleted: false },
    { id: 'ch2', title: 'Pantry Week', description: 'Try to cook all your meals using only what you have at home.', type: 'saving', goal: 100, duration: 'This Week', isCompleted: true },
];

export const EARNED_BADGES: Badge[] = [
    { id: 'b1', name: 'Budget Master', description: 'Created your first budget.', icon: '🏆' },
    { id: 'b2', name: 'Savings Starter', description: 'Created your first savings goal.', icon: '🌱' },
];

export const INITIAL_INVESTMENTS: Investment[] = [];

export const INITIAL_SPLIT_EXPENSES: SplitExpense[] = [
    { id: 'se1', description: 'Team Dinner', totalAmount: 240, date: '2026-07-12', participants: [ { name: 'You', amount: 60, isPaid: true }, { name: 'Alex', amount: 60, isPaid: true }, { name: 'Beth', amount: 60, isPaid: false }, { name: 'Charlie', amount: 60, isPaid: false } ] },
    { id: 'se2', description: 'Weekend Trip Gas', totalAmount: 80, date: '2026-07-10', participants: [ { name: 'You', amount: 40, isPaid: true }, { name: 'David', amount: 40, isPaid: false } ] }
];

// --- GEMINI PROMPTS ---

export const FINANCIAL_ANALYSIS_PROMPT = `You are SmartFinance AI, an expert financial account manager. Your goal is to provide clear, concise, and actionable financial advice. You have access to the user's transaction history, savings goals, recurring expenses, and monthly income.
Analyze the provided financial context and the user's query to give a helpful response. If the user asks to schedule a bill payment, use the scheduleBillPayment function.

USER FINANCIAL CONTEXT:
- Monthly Income: ${'{monthlyIncome}'}
- Recurring Expenses: ${'{recurringExpenses}'}
- Savings Goals: ${'{savingsGoals}'}
- Recent Transactions:
${'{transactions}'}

USER QUERY: "{query}"

YOUR RESPONSE:
`;
export const RECURRING_EXPENSE_CATEGORIES = ['Housing', 'Utilities', 'Subscriptions', 'Transport', 'Insurance', 'Groceries', 'Debt Payment', 'Health', 'Other'];
export const SUGGEST_EXPENSES_PROMPT = `A user has provided their profile. Based on this information, suggest 5-7 common recurring expenses. Return the response as a JSON array of objects, where each object has a "name" and a "category". The category must be one of the allowed types.

USER PROFILE:
- Country: {country}
- Monthly Income: ${'{monthlyIncome}'}
- Primary Financial Goal: {financialGoal}
`;
export const AI_INSIGHTS_PROMPT = `Based on these transactions, generate 2-3 concise, actionable insights for the user. Present them as a bulleted list. Focus on spending habits, potential savings, or unusual activity.

TRANSACTIONS:
{transactions}
`;
export const SPENDING_FORECAST_PROMPT = `Analyze the user's monthly income of ${'{monthlyIncome}'} and their recent transaction history to forecast their total spending for the next 30 days. Provide a forecasted amount and a brief, one-sentence explanation of the main drivers (e.g., based on recurring bills and recent discretionary spending). Return a single JSON object with keys "forecast" (a number) and "explanation" (a string).

TRANSACTIONS:
{transactions}
`;
export const RECEIPT_SCANNER_PROMPT = `You are an OCR model. Analyze the provided receipt image and extract the vendor name, total amount, transaction date, and a likely expense category. Return a single JSON object with the keys "vendor", "amount", "date" (in YYYY-MM-DD format), and "category".`;
export const FRAUD_DETECTION_PROMPT = `Analyze this list of transactions for any suspicious or anomalous activity. Look for things like unusually large purchases, duplicate charges, transactions at odd hours, or spending in foreign countries. If you find anything suspicious, describe it clearly. If not, respond with "No suspicious activity detected."

TRANSACTIONS:
{transactions}
`;
export const TRAVEL_SUMMARY_PROMPT = `The user is in Travel Mode. Analyze their recent transactions to identify specific travel-related spending (e.g., flights, hotels, restaurants in foreign locations, foreign currency). Provide a concise, friendly summary of their travel spending, including the total amount spent on travel and the top 2-3 categories. If no travel spending is found, respond with "No specific travel spending detected in your recent transactions."

TRANSACTIONS:
{transactions}
`;
export const TAX_TIPS_PROMPT = `Based on this categorized summary of annual expenses, provide 2-3 general tax tips that might be relevant for a user in the US. Include a disclaimer that you are not a tax advisor.

EXPENSE SUMMARY:
{expenseSummary}
`;
export const GENERATE_LESSON_PROMPT = `Generate a short, engaging financial literacy lesson on the topic of "{topic}". The lesson should be in Markdown format, around 150-200 words. After the lesson, provide one multiple-choice question to test understanding. The question should have 3-4 options.
Return a single JSON object with keys: "lesson", "question", "options" (an array of strings), and "answer" (the correct option string).`;
export const MODERATE_FORUM_POST_PROMPT = `You are a forum moderator for a financial app. Your goal is to keep the community safe and respectful. Analyze the following post content and determine if it is 'safe' or 'unsafe'. Unsafe content includes harassment, hate speech, spam, scams, or sharing of sensitive personal information. Respond with only the word "safe" or "unsafe".

POST CONTENT:
"{content}"
`;

// --- NEW V3 GEMINI PROMPTS ---

export const FINANCIAL_PERSONALITY_PROMPT = `
Analyze the user's financial data to determine their "Financial Personality".
Classify them into one of these types: The Savvy Saver, The Balanced Planner, The Ambitious Investor, The Cautious Spender, or The Free Spirit.
Provide the personality type, a 1-2 sentence description, and 2 bullet-point recommendations tailored to them.

USER DATA:
- Spending vs. Income Ratio: {spendRatio}%
- Savings Rate: {savingsRate}%
- Investment activity: {investmentActivity}
- Financial Goals: {financialGoals}
`;

export const MONTHLY_REPORT_PROMPT = `
Generate a comprehensive monthly financial health report for the user based on their transactions for the last 30 days.
The report should include:
1. A "Financial Health Score" from 1 to 100, where 100 is excellent.
2. A 2-3 sentence "Executive Summary" of their month.
3. Top 3 spending categories with amounts.
4. One key "Insight & Recommendation" for improvement.

USER DATA:
- Total Income this month: ${'{totalIncome}'}
- Total Expenses this month: ${'{totalExpenses}'}
- Top spending categories: ${'{topCategories}'}
- Savings goals progress: ${'{savingsProgress}'}
`;

export const INVESTMENT_RECOMMENDATION_PROMPT = `
Analyze the user's current investment portfolio and financial goals.
Provide two concise, actionable recommendations for diversification or optimization.
Keep the advice general and include a disclaimer to consult a financial advisor.

USER PORTFOLIO:
${'{portfolio}'}

USER GOALS:
${'{financialGoals}'}
`;

export const SMART_RECOMMENDATIONS_PROMPT = `
You are a proactive financial advisor AI. Analyze the user's complete financial profile to find optimization opportunities.
Generate 2-3 highly personalized and actionable "Smart Recommendations".
Examples: "Consider switching your $5,000 in a low-yield savings account to a high-yield one to earn more interest." or "You have subscriptions to both Netflix and Hulu. Could you consolidate to save money?"

USER DATA:
- Transactions: ${'{transactions}'}
- Savings Accounts & Balances: ${'{savingsAccounts}'}
- Recurring Expenses/Subscriptions: ${'{recurringExpenses}'}
`;

export const LOCATION_SPENDING_PROMPT = `
A user is at latitude {latitude} and longitude {longitude}.
Analyze their recent transactions to find spending patterns at or near this location.
Suggest one cheaper local alternative or a relevant deal for a place they frequent.
If no patterns are found, suggest a popular, well-rated cheap eat nearby.

USER TRANSACTIONS:
${'{transactions}'}
`;

export const TRANSACTION_ADVICE_PROMPT = `
You are a cautious and insightful financial advisor AI. A user is considering a new purchase and wants your advice.
Analyze the proposed transaction in the context of their complete financial situation.
Provide a balanced, objective view by listing the key advantages (pros) and disadvantages (cons).
Focus on how this purchase impacts their budget (based on their discretionary income), savings goals, and overall financial health. Frame the advice in terms of whether this seems like a wise purchase right now, considering if it fits within their spending habits and budget.
Return a single JSON object with two keys: "advantages" and "disadvantages", each containing an array of 2-4 short, clear, and impactful strings.

USER'S FINANCIAL CONTEXT:
- Monthly Income: ${'{monthlyIncome}'}
- Total Bank Balance (from debit accounts): ${'{bankBalance}'}
- Total Recurring Monthly Expenses: ${'{recurringExpensesTotal}'}
- Discretionary income (Income - Expenses): ${'{discretionaryIncome}'}
- Savings Goals: ${'{savingsGoals}'}
- Recent Transactions (for spending habits):
${'{transactions}'}

PROPOSED TRANSACTION:
- Item/Service: "{description}"
- Cost: ${'{amount}'}
`;