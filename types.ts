
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
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