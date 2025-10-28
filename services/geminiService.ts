
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, UserProfile } from '../types';
import { FINANCIAL_ANALYSIS_PROMPT, SUGGEST_EXPENSES_PROMPT } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Using fallback responses.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const formatTransactionsForPrompt = (transactions: Transaction[]): string => {
  const header = "Date,Description,Category,Amount,Type\n";
  return header + transactions.map(t => 
    `${t.date},${t.description},${t.category},${t.amount.toFixed(2)},${t.type}`
  ).join('\n');
};

export const analyzeFinancialData = async (query: string, transactions: Transaction[]): Promise<string> => {
  if (!API_KEY) {
    return `**API Key Not Configured**

Hello! It looks like the connection to my core AI brain isn't set up right now. 

You asked: *"${query}"*

While I can't give you a live analysis, here are some general tips:
- **Review your spending:** Check your top categories. Are you happy with where your money is going?
- **Check your budget:** Make sure you're on track with your monthly budgets.
- **Contribute to goals:** Even small amounts saved regularly can make a big difference!

Please configure the API key to unlock my full analytical capabilities.`;
  }

  const transactionsString = formatTransactionsForPrompt(transactions);
  const prompt = FINANCIAL_ANALYSIS_PROMPT
    .replace('{transactions}', transactionsString)
    .replace('{query}', query);
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm sorry, but I'm having trouble connecting to my analytical services right now. Please try again in a moment.";
  }
};

const goalMap: { [key: string]: string } = {
    'save_big': 'Save for a big purchase',
    'invest': 'Invest for retirement',
    'pay_debt': 'Pay off debt',
    'build_wealth': 'Build wealth',
};

export const suggestRecurringExpenses = async (profile: UserProfile): Promise<{ name: string; category: string }[]> => {
    if (!API_KEY) {
        console.warn("API Key not configured, returning fallback expense suggestions.");
        return [
            { name: "Rent or Mortgage", category: "Housing" },
            { name: "Electricity Bill", category: "Utilities" },
            { name: "Internet Bill", category: "Utilities" },
            { name: "Groceries", category: "Groceries" },
            { name: "Phone Bill", category: "Subscriptions" },
        ];
    }
    
    const readableGoal = goalMap[profile.financialGoal] || 'Not specified';

    const prompt = SUGGEST_EXPENSES_PROMPT
        .replace('{country}', profile.country)
        .replace('{monthlyIncome}', profile.monthlyIncome.toString())
        .replace('{financialGoal}', readableGoal);
        
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: {
                                type: Type.STRING,
                                description: "The name of the recurring expense, e.g., 'Rent' or 'Netflix Subscription'."
                            },
                            category: {
                                type: Type.STRING,
                                description: "The category of the expense from a predefined list of common financial categories."
                            },
                        },
                        required: ["name", "category"]
                    }
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        return Array.isArray(jsonResponse) ? jsonResponse : [];

    } catch (error) {
        console.error("Error calling Gemini API for expense suggestions:", error);
        return []; // Return empty array on error
    }
};
