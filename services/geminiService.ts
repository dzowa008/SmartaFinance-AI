import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Transaction, UserProfile, SavingsGoal, RecurringExpense, FinancialPersonality, Investment } from '../types';
import { 
    FINANCIAL_ANALYSIS_PROMPT, SUGGEST_EXPENSES_PROMPT, AI_INSIGHTS_PROMPT, 
    SPENDING_FORECAST_PROMPT, RECEIPT_SCANNER_PROMPT,
    FRAUD_DETECTION_PROMPT, TRAVEL_SUMMARY_PROMPT, TAX_TIPS_PROMPT,
    GENERATE_LESSON_PROMPT, MODERATE_FORUM_POST_PROMPT, RECURRING_EXPENSE_CATEGORIES,
    FINANCIAL_PERSONALITY_PROMPT, MONTHLY_REPORT_PROMPT, INVESTMENT_RECOMMENDATION_PROMPT,
    SMART_RECOMMENDATIONS_PROMPT, LOCATION_SPENDING_PROMPT, TRANSACTION_ADVICE_PROMPT
} from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Using fallback responses.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const formatTransactionsForPrompt = (transactions: Transaction[]): string => {
  if (!transactions || transactions.length === 0) return "No transactions available.";
  const header = "Date,Description,Category,Amount,Type\n";
  return header + transactions.map(t => 
    `${t.date},${t.description},${t.category},${t.amount.toFixed(2)},${t.type}`
  ).join('\n');
};

const scheduleBillPaymentFunctionDeclaration: FunctionDeclaration = { name: 'scheduleBillPayment', parameters: { type: Type.OBJECT, description: 'Schedules a bill payment...', properties: { name: { type: Type.STRING }, amount: { type: Type.NUMBER }, dueDate: { type: Type.STRING } }, required: ['name', 'amount', 'dueDate'] } };

export const analyzeFinancialData = async (query: string, context: { transactions: Transaction[], savingsGoals: SavingsGoal[], recurringExpenses: RecurringExpense[], monthlyIncome: number }): Promise<{ text: string, functionCall?: any }> => {
  if (!API_KEY) return { text: `**API Key Not Configured**: This is a fallback response. To enable live AI, please configure your API key.\n\nI have scheduled a mock payment for "Rent" for $1500 due on 2026-09-01.` };
  const prompt = FINANCIAL_ANALYSIS_PROMPT.replace('{transactions}', formatTransactionsForPrompt(context.transactions)).replace('{savingsGoals}', JSON.stringify(context.savingsGoals)).replace('{recurringExpenses}', JSON.stringify(context.recurringExpenses)).replace('{monthlyIncome}', context.monthlyIncome.toString()).replace('{query}', query);
  try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { tools: [{ functionDeclarations: [scheduleBillPaymentFunctionDeclaration] }] } }); return { text: response.text, functionCall: response.functionCalls ? response.functionCalls[0] : undefined };
  } catch (error) { console.error("Error calling Gemini API:", error); return { text: "I'm sorry, but I'm having trouble connecting to the AI service. Please try again later." }; }
};

export const suggestRecurringExpenses = async (profile: UserProfile): Promise<{ name: string; category: string }[]> => {
    if (!API_KEY) return [{ name: "Rent/Mortgage", category: "Housing" }, { name: "Internet", category: "Utilities" }];
    const prompt = SUGGEST_EXPENSES_PROMPT
        .replace('{country}', profile.country)
        .replace('{monthlyIncome}', profile.monthlyIncome.toString())
        .replace('{financialGoal}', profile.financialGoal);
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, category: { type: Type.STRING, enum: RECURRING_EXPENSE_CATEGORIES } }, required: ["name", "category"] } },
            },
        });
        return JSON.parse(response.text);
    } catch (error) { console.error("Error suggesting recurring expenses:", error); return []; }
};

export const generateAIInsights = async (transactions: Transaction[]): Promise<string[]> => {
    if (!API_KEY) return ["You spent the most on Groceries this week.", "Consider reviewing your subscriptions for potential savings."];
    const prompt = AI_INSIGHTS_PROMPT.replace('{transactions}', formatTransactionsForPrompt(transactions.slice(0, 50)));
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text.split('\n').filter(line => line.trim().length > 0 && (line.startsWith('-') || line.startsWith('*')));
    } catch (error) { console.error("Error generating AI insights:", error); return ["Could not generate insights at this time."]; }
};

export const generateSpendingForecast = async (monthlyIncome: number, transactions: Transaction[]): Promise<{ forecast: number; explanation: string } | null> => {
    if (!API_KEY) return { forecast: 4500, explanation: "Based on your recurring bills and typical spending." };
    const prompt = SPENDING_FORECAST_PROMPT
        .replace('{monthlyIncome}', monthlyIncome.toString())
        .replace('{transactions}', formatTransactionsForPrompt(transactions.slice(0, 50)));
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        forecast: { type: Type.NUMBER },
                        explanation: { type: Type.STRING }
                    },
                    required: ["forecast", "explanation"]
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating spending forecast:", error);
        return null;
    }
};

export const analyzeReceiptImage = async (base64Image: string, mimeType: string): Promise<{ vendor: string; amount: number; date: string; category: string; } | null> => {
    if (!API_KEY) return { vendor: "Sample Vendor", amount: 42.50, date: new Date().toISOString().split('T')[0], category: "Shopping" };
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ inlineData: { data: base64Image, mimeType } }, { text: RECEIPT_SCANNER_PROMPT }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { vendor: { type: Type.STRING }, amount: { type: Type.NUMBER }, date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" }, category: { type: Type.STRING } }, required: ["vendor", "amount", "date", "category"] }
            }
        });
        return JSON.parse(response.text);
    } catch (error) { console.error("Error analyzing receipt image:", error); return null; }
};

export const moderateForumPost = async (content: string): Promise<'safe' | 'unsafe'> => {
    if (!API_KEY) return 'safe';
    const prompt = MODERATE_FORUM_POST_PROMPT.replace('{content}', content);
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text.trim().toLowerCase().includes('unsafe') ? 'unsafe' : 'safe';
    } catch (error) { console.error("Error moderating forum post:", error); return 'safe'; }
};

export const scanForFraud = async (transactions: Transaction[]): Promise<string> => { if (!API_KEY) return "Fraud scan unavailable."; const prompt = FRAUD_DETECTION_PROMPT.replace('{transactions}', formatTransactionsForPrompt(transactions)); try { const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); return response.text; } catch (error) { console.error("Error scanning for fraud:", error); return "Error during fraud scan."; } };

export const generateTravelSummary = async (transactions: Transaction[]): Promise<string> => {
    if (!API_KEY) return "You've spent $450 on hotels and $120 on dining during your trip.";
    const prompt = TRAVEL_SUMMARY_PROMPT.replace('{transactions}', formatTransactionsForPrompt(transactions.slice(0, 50)));
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating travel summary:", error);
        return "Could not generate travel summary at this time.";
    }
};

export const getTaxTips = async (expenseSummary: { [category: string]: number }): Promise<string> => {
    if (!API_KEY) return "Consult a tax professional for personalized advice.";
    const prompt = TAX_TIPS_PROMPT.replace('{expenseSummary}', JSON.stringify(expenseSummary));
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) { console.error("Error getting tax tips:", error); return "Could not retrieve tax tips at this time."; }
};

export const generateLesson = async (topic: string): Promise<{ lesson: string; question: string; options: string[]; answer: string; } | null> => {
    if (!API_KEY) return { lesson: `This is a sample lesson about ${topic}.`, question: "What is a key takeaway?", options: ["A", "B", "C"], answer: "A" };
    const prompt = GENERATE_LESSON_PROMPT.replace('{topic}', topic);
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { lesson: { type: Type.STRING }, question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING } }, required: ["lesson", "question", "options", "answer"] }
            }
        });
        return JSON.parse(response.text);
    } catch (error) { console.error("Error generating lesson:", error); return null; }
};


// --- NEW V3 SERVICE FUNCTIONS ---

export const determineFinancialPersonality = async (data: {spendRatio: number, savingsRate: number, investmentActivity: string, financialGoals: string}): Promise<FinancialPersonality | null> => {
    if (!API_KEY) return { type: "Balanced Planner", description: "You're doing great at managing your finances.", recommendations: ["Keep it up!", "Consider automating your savings."] };
    const prompt = FINANCIAL_PERSONALITY_PROMPT.replace('{spendRatio}', data.spendRatio.toFixed(0)).replace('{savingsRate}', data.savingsRate.toFixed(0)).replace('{investmentActivity}', data.investmentActivity).replace('{financialGoals}', data.financialGoals);
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, description: { type: Type.STRING }, recommendations: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["type", "description", "recommendations"] } } });
        return JSON.parse(response.text);
    } catch (error) { console.error("Error determining financial personality:", error); return null; }
};

export const generateMonthlyReport = async (data: { totalIncome: number, totalExpenses: number, topCategories: string, savingsProgress: string }): Promise<any | null> => {
    if (!API_KEY) return null;
    const prompt = MONTHLY_REPORT_PROMPT.replace('{totalIncome}', data.totalIncome.toFixed(2)).replace('{totalExpenses}', data.totalExpenses.toFixed(2)).replace('{topCategories}', data.topCategories).replace('{savingsProgress}', data.savingsProgress);
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { healthScore: { type: Type.NUMBER }, summary: { type: Type.STRING }, topCategories: { type: Type.ARRAY, items: { type: Type.STRING } }, recommendation: { type: Type.STRING } }, required: ["healthScore", "summary", "topCategories", "recommendation"] } } });
        return JSON.parse(response.text);
    } catch (error) { console.error("Error generating monthly report:", error); return null; }
};

export const getInvestmentRecommendations = async (portfolio: Investment[], goals: string): Promise<string[]> => {
    if (!API_KEY) return ["Consult a financial advisor to optimize your portfolio."];
    const portfolioString = portfolio.map(p => `${p.name} (${p.type}): ${p.quantity} units`).join('\n');
    const prompt = INVESTMENT_RECOMMENDATION_PROMPT.replace('{portfolio}', portfolioString).replace('{financialGoals}', goals);
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text.split('\n').filter(line => line.trim().length > 0);
    } catch (error) { console.error("Error getting investment recommendations:", error); return ["Could not retrieve recommendations."]; }
};

export const generateSmartRecommendations = async (context: { transactions: Transaction[], savingsAccounts: any[], recurringExpenses: RecurringExpense[] }): Promise<string[]> => {
    if (!API_KEY) return ["Review your subscriptions for potential savings."];
    const prompt = SMART_RECOMMENDATIONS_PROMPT.replace('{transactions}', formatTransactionsForPrompt(context.transactions.slice(0, 20))).replace('{savingsAccounts}', JSON.stringify(context.savingsAccounts)).replace('{recurringExpenses}', JSON.stringify(context.recurringExpenses));
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text.split('\n').filter(line => line.trim().length > 0 && (line.startsWith('-') || line.startsWith('*')));
    } catch (error) { console.error("Error generating smart recommendations:", error); return ["Could not generate recommendations."]; }
};

export const analyzeLocationSpending = async (coords: { latitude: number; longitude: number; }, transactions: Transaction[]): Promise<string> => {
    if (!API_KEY) return "Location analysis unavailable.";
    const prompt = LOCATION_SPENDING_PROMPT.replace('{latitude}', coords.latitude.toString()).replace('{longitude}', coords.longitude.toString()).replace('{transactions}', formatTransactionsForPrompt(transactions.slice(0, 30)));
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) { console.error("Error analyzing location spending:", error); return "Could not analyze local spending."; }
};

export const getPrePurchaseAdvice = async (
    context: { monthlyIncome: number, bankBalance: number, recurringExpenses: RecurringExpense[], savingsGoals: SavingsGoal[], transactions: Transaction[] },
    purchase: { description: string, amount: number }
): Promise<{ advantages: string[], disadvantages: string[] } | null> => {
    if (!API_KEY) return { advantages: ["This is a sample piece of advice."], disadvantages: ["The AI is not connected. Configure your API key."] };
    const recurringTotal = context.recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const prompt = TRANSACTION_ADVICE_PROMPT
        .replace('{monthlyIncome}', context.monthlyIncome.toString())
        .replace('{bankBalance}', context.bankBalance.toString())
        .replace('{recurringExpensesTotal}', recurringTotal.toString())
        .replace('{discretionaryIncome}', (context.monthlyIncome - recurringTotal).toString())
        .replace('{savingsGoals}', JSON.stringify(context.savingsGoals))
        .replace('{transactions}', formatTransactionsForPrompt(context.transactions.slice(0, 20)))
        .replace('{description}', purchase.description)
        .replace('{amount}', purchase.amount.toString());

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        advantages: { type: Type.ARRAY, items: { type: Type.STRING } },
                        disadvantages: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["advantages", "disadvantages"]
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error getting pre-purchase advice:", error);
        return null;
    }
};