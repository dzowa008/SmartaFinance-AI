
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
}

export interface BudgetCategory {
  id:string;
  name: string;
  allocated: number;
  spent: number;
}

export interface SavingsGoal {
  id?: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface AccountSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  functionCall?: any;
}

export interface SmartAlert {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  date: string;
}

export interface RecurringExpense {
  id:string;
  name: string;
  amount: number;
  category: string;
}

export interface Bill {
  id: string;
  name: string;
  dueDate: string;
  amount: number;
  type: 'Bill' | 'Subscription';
  status: 'Pending Approval' | 'Scheduled' | 'Paid' | 'Declined';
}

export interface UserProfile {
  fullName: string;
  dateOfBirth: string;
  country: string;
  locationVerified: boolean;
  monthlyIncome: number;
  financialGoal: string;
}

export interface UserSettings {
    theme: 'light' | 'dark';
    currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
    notifications: {
        dailySummary: boolean;
        billReminders: boolean;
        budgetAlerts: boolean;
    };
    travelMode: boolean;
    goalAutomation: boolean;
}

// --- New Types for Advanced Features ---

export interface Asset {
    id: string;
    name: string;
    type: 'Cash' | 'Investment' | 'Property' | 'Other';
    value: number;
}

export interface Liability {
    id: string;
    name: string;
    type: 'Loan' | 'Credit Card' | 'Mortgage' | 'Other';
    amount: number;
}

export interface ForumComment {
    id: string;
    author: string;
    text: string;
    timestamp: string;
}

export interface ForumPost {
    id:string;
    title: string;
    author: string;
    timestamp: string;
    content: string;
    comments: ForumComment[];
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: 'saving' | 'no-spend';
    goal: number;
    duration: string;
    isCompleted: boolean;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
}

// --- New Types for V3 Features ---
export interface Investment {
    id: string;
    name: string;
    type: 'Stock' | 'Crypto' | 'Real Estate' | 'Other';
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    incomeAmount?: number;
    incomeFrequency?: 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly' | 'One-time';
}

export interface SplitParticipant {
    name: string;
    amount: number;
    isPaid: boolean;
}

export interface SplitExpense {
    id: string;
    description: string;
    totalAmount: number;
    date: string;
    participants: SplitParticipant[];
}

export interface StoredDocument {
    id: string;
    name: string;
    type: string; // Mime type
    size: number;
    uploadDate: string;
    tags: string[];
    // In a real app, this would be a URL or reference to a file service
    content: string; // For demo, we'll store file content (e.g., base64)
}

export interface FinancialPersonality {
    type: string;
    description: string;
    recommendations: string[];
}

export interface LinkedAccount {
    id: string;
    accountName: string;
    cardNumber: string;
    cardType: 'Debit' | 'Credit';
    balance: number;
}