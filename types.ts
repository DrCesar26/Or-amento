export type TransactionType = 'expense' | 'income' | 'investment' | 'transfer';

export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
  color: string;
  icon?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  bankName: string; // e.g., 'Nubank', 'Itaú', 'XP'
  type: 'checking' | 'savings' | 'investment' | 'wallet';
  balance: number;
  logoColor: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categoryId?: string;
  subCategoryId?: string;
  accountId: string; // Source account
  toAccountId?: string; // For transfers
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  period: 'monthly' | 'yearly';
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  BUDGET_CONTROL = 'BUDGET_CONTROL',
  REPORTS = 'REPORTS',
  GOALS = 'GOALS',
  EXCHANGE = 'EXCHANGE'
}