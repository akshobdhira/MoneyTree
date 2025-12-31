
export enum Category {
  FOOD = 'Food',
  SHOPPING = 'Shopping',
  TRANSPORT = 'Transport',
  ENTERTAINMENT = 'Entertainment',
  HABITS = 'Habits',
  INCOME = 'Income',
  MISC = 'Miscellaneous'
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  subCategory: string;
  timestamp: number;
  note?: string;
  isForFriends?: boolean;
}

export interface UserState {
  balance: number;
  transactions: Transaction[];
  monthlyAllowance: number;
}

export type AppTab = 'home' | 'add' | 'analytics' | 'insights' | 'history';

export interface AIInsight {
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
}
