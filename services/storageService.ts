import { Transaction, Category, BankAccount, FinancialGoal, Budget } from '../types';

// Initial Data Seeding
const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat_food',
    name: 'Alimentação',
    color: '#ef4444',
    subCategories: [
      { id: 'sub_bf', name: 'Café da manhã' },
      { id: 'sub_lunch', name: 'Almoço' },
      { id: 'sub_dinner', name: 'Janta' },
      { id: 'sub_snack', name: 'Lanche' },
    ]
  },
  {
    id: 'cat_leisure',
    name: 'Lazer',
    color: '#e879f9',
    subCategories: [
      { id: 'sub_ent', name: 'Entretenimento' },
      { id: 'sub_sub', name: 'Assinaturas' },
      { id: 'sub_travel', name: 'Viagens' },
    ]
  },
  {
    id: 'cat_personal',
    name: 'Gastos Pessoais',
    color: '#f472b6',
    subCategories: []
  },
  {
    id: 'cat_comm',
    name: 'Comunicação',
    color: '#60a5fa',
    subCategories: [{ id: 'sub_internet', name: 'Internet' }, { id: 'sub_phone', name: 'Celular' }]
  },
  {
    id: 'cat_invest',
    name: 'Investimento Profissional',
    color: '#34d399',
    subCategories: [{ id: 'sub_course', name: 'Cursos' }, { id: 'sub_books', name: 'Livros' }]
  },
  {
    id: 'cat_transport',
    name: 'Transporte',
    color: '#fbbf24',
    subCategories: [{ id: 'sub_fuel', name: 'Combustível' }, { id: 'sub_uber', name: 'Uber/Taxi' }]
  },
  {
    id: 'cat_edu',
    name: 'Educação',
    color: '#818cf8',
    subCategories: []
  },
  {
    id: 'cat_housing',
    name: 'Moradia',
    color: '#a78bfa',
    subCategories: [{ id: 'sub_rent', name: 'Aluguel' }, { id: 'sub_utils', name: 'Contas' }]
  },
  {
    id: 'cat_salary', // For Income
    name: 'Salário/Renda',
    color: '#22d3ee',
    subCategories: []
  }
];

const INITIAL_ACCOUNTS: BankAccount[] = [
  { id: 'acc_1', name: 'Conta Principal', bankName: 'Banco do Brasil', type: 'checking', balance: 5200.00, logoColor: '#facc15' }, // Yellow for BB
  { id: 'acc_2', name: 'Reserva', bankName: 'Inter', type: 'savings', balance: 12000.00, logoColor: '#ff7a00' },
  { id: 'acc_3', name: 'Carteira Rico', bankName: 'Rico', type: 'investment', balance: 25000.00, logoColor: '#ea1d2c' },
  { id: 'acc_4', name: 'Carteira Física', bankName: 'Dinheiro', type: 'wallet', balance: 150.00, logoColor: '#10b981' },
];

const INITIAL_GOALS: FinancialGoal[] = [
  { id: 'goal_1', name: 'Viagem Japão', targetAmount: 20000, currentAmount: 5500, deadline: '2025-12-01', icon: 'plane' },
  { id: 'goal_2', name: 'Carro Novo', targetAmount: 80000, currentAmount: 15000, deadline: '2026-06-01', icon: 'car' },
];

const STORAGE_KEYS = {
  TRANSACTIONS: 'neon_transactions',
  CATEGORIES: 'neon_categories',
  ACCOUNTS: 'neon_accounts',
  GOALS: 'neon_goals',
  BUDGETS: 'neon_budgets'
};

// Helper to simulate local storage DB
export const StorageService = {
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  saveTransactions: (data: Transaction[]) => localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data)),

  getCategories: (): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : INITIAL_CATEGORIES;
  },
  saveCategories: (data: Category[]) => localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data)),

  getAccounts: (): BankAccount[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return data ? JSON.parse(data) : INITIAL_ACCOUNTS;
  },
  saveAccounts: (data: BankAccount[]) => localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(data)),

  getGoals: (): FinancialGoal[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : INITIAL_GOALS;
  },
  saveGoals: (data: FinancialGoal[]) => localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data)),

  getBudgets: (): Budget[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  },
  saveBudgets: (data: Budget[]) => localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(data)),
};