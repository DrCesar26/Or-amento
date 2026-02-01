import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  PieChart, 
  Target, 
  PlusCircle, 
  Crown,
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft,
  Settings,
  Calculator,
  Save,
  Edit3,
  Coins,
  RefreshCw
} from 'lucide-react';
import { Reports } from './components/Reports';
import { StorageService } from './services/storageService';
import { Transaction, Category, BankAccount, FinancialGoal, Budget, ViewState, SubCategory } from './types';

// --- Utility Components ---

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`glass-panel rounded-2xl p-6 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = 'primary', className = '' }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-500 hover:to-yellow-400 text-white shadow-lg shadow-blue-500/20",
    secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30",
    ghost: "text-slate-400 hover:text-white"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  // State
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  // Exchange State
  const [exchangeAmount, setExchangeAmount] = useState<number>(1000);
  
  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  // Budget Editing State
  const [editingBudget, setEditingBudget] = useState<{catId: string, amount: number} | null>(null);

  // New Transaction State
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    accountId: '',
    categoryId: ''
  });

  // Navigation Items Definition
  const navItems = [
    { id: ViewState.DASHBOARD, icon: LayoutDashboard, label: 'Resumo' },
    { id: ViewState.TRANSACTIONS, icon: ArrowRightLeft, label: 'Transação' },
    { id: ViewState.BUDGET_CONTROL, icon: Calculator, label: 'Planejamento', highlight: true },
    { id: ViewState.EXCHANGE, icon: Coins, label: 'Câmbio' },
    { id: ViewState.REPORTS, icon: PieChart, label: 'Gráficos' },
    { id: ViewState.GOALS, icon: Target, label: 'Objetivos' },
  ];

  // Load Data
  useEffect(() => {
    setTransactions(StorageService.getTransactions());
    setCategories(StorageService.getCategories());
    setAccounts(StorageService.getAccounts());
    setGoals(StorageService.getGoals());
    setBudgets(StorageService.getBudgets());
  }, []);

  // Save Data Helpers
  const addTransaction = (tx: Transaction) => {
    const updated = [tx, ...transactions];
    setTransactions(updated);
    StorageService.saveTransactions(updated);
    
    // Update balances
    const updatedAccounts = accounts.map(acc => {
      if (acc.id === tx.accountId) {
        if (tx.type === 'expense' || tx.type === 'transfer') return { ...acc, balance: acc.balance - tx.amount };
        if (tx.type === 'income' || tx.type === 'investment') return { ...acc, balance: acc.balance + tx.amount };
      }
      if (tx.type === 'transfer' && tx.toAccountId === acc.id) {
         return { ...acc, balance: acc.balance + tx.amount };
      }
      return acc;
    });
    setAccounts(updatedAccounts);
    StorageService.saveAccounts(updatedAccounts);
    setIsTxModalOpen(false);
  };

  const handleUpdateBudget = (categoryId: string, limit: number) => {
    const existingIndex = budgets.findIndex(b => b.categoryId === categoryId);
    let updatedBudgets = [...budgets];
    
    if (existingIndex >= 0) {
      updatedBudgets[existingIndex] = { ...updatedBudgets[existingIndex], limit };
    } else {
      updatedBudgets.push({
        id: Math.random().toString(36).substr(2, 9),
        categoryId,
        limit,
        period: 'monthly'
      });
    }
    
    setBudgets(updatedBudgets);
    StorageService.saveBudgets(updatedBudgets);
    setEditingBudget(null);
  };

  // --- Render Helpers ---

  const renderDashboard = () => {
    const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const monthlyIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    return (
      <div className="space-y-6 animate-fade-in p-2 md:p-6">
        {/* Header Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden group border-yellow-500/20">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Crown size={100} className="text-yellow-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Patrimônio Total</p>
            <h2 className="text-4xl font-bold text-white mt-2 neon-text-gold">
              R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            <div className="mt-4 flex gap-2">
              {accounts.slice(0, 3).map(acc => (
                <div key={acc.id} className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold shadow-lg" style={{ backgroundColor: acc.logoColor, color: acc.bankName === 'Banco do Brasil' ? '#0038A8' : 'white' }}>
                  {acc.bankName[0]}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <TrendingUp size={24} />
              </div>
              <p className="text-slate-400">Receitas (Mês)</p>
            </div>
            <h2 className="text-2xl font-bold text-emerald-400">
              + R$ {monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                <TrendingDown size={24} />
              </div>
              <p className="text-slate-400">Despesas (Mês)</p>
            </div>
            <h2 className="text-2xl font-bold text-red-400">
              - R$ {monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </Card>
        </div>

        {/* Recent Transactions & Accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Transações Recentes</h3>
              <Button variant="secondary" onClick={() => setView(ViewState.TRANSACTIONS)}>Ver todas</Button>
            </div>
            <div className="space-y-3">
              {transactions.slice(0, 5).map(tx => {
                const cat = categories.find(c => c.id === tx.categoryId);
                return (
                  <div key={tx.id} className="glass-panel p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${tx.type === 'expense' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {tx.type === 'expense' ? <TrendingDown size={18} /> : tx.type === 'transfer' ? <ArrowRightLeft size={18} /> : <TrendingUp size={18} />}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{tx.description}</p>
                        <p className="text-xs text-slate-400">{cat?.name || 'Geral'} • {new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${tx.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {tx.type === 'expense' ? '-' : '+'} R$ {tx.amount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
              {transactions.length === 0 && (
                 <div className="text-center py-10 text-slate-500">Nenhuma transação registrada.</div>
              )}
            </div>
          </div>

          <div>
             <h3 className="text-xl font-bold text-white mb-4">Resumo por Conta</h3>
             <div className="space-y-3">
               {accounts.map(acc => {
                 // Calculate monthly stats for account
                 const now = new Date();
                 const accTxs = transactions.filter(t => {
                    const d = new Date(t.date);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                 });

                 const income = accTxs
                    .filter(t => (t.accountId === acc.id && (t.type === 'income' || t.type === 'investment')) || (t.toAccountId === acc.id && t.type === 'transfer'))
                    .reduce((sum, t) => sum + t.amount, 0);

                 const expense = accTxs
                    .filter(t => t.accountId === acc.id && (t.type === 'expense' || t.type === 'transfer'))
                    .reduce((sum, t) => sum + t.amount, 0);

                 return (
                   <div key={acc.id} className="glass-panel p-4 rounded-xl border-l-4 space-y-3" style={{ borderLeftColor: acc.logoColor }}>
                     <div className="flex justify-between items-center">
                       <div className="flex flex-col">
                         <span className="text-sm text-slate-400">{acc.bankName}</span>
                         <span className="font-bold text-white">{acc.name}</span>
                       </div>
                       <span className="font-medium text-white text-lg">R$ {acc.balance.toLocaleString()}</span>
                     </div>
                     
                     {/* Monthly Summary Mini-bar */}
                     <div className="flex justify-between text-xs pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1 text-emerald-400">
                           <TrendingUp size={14} />
                           <span>+ R$ {income.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-400">
                           <TrendingDown size={14} />
                           <span>- R$ {expense.toLocaleString()}</span>
                        </div>
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderExchange = () => {
    const currencies = [
      { code: 'USD', name: 'Dólar Americano', rate: 4.95, symbol: '$', flag: '🇺🇸' },
      { code: 'EUR', name: 'Euro', rate: 5.38, symbol: '€', flag: '🇪🇺' },
      { code: 'GBP', name: 'Libra Esterlina', rate: 6.27, symbol: '£', flag: '🇬🇧' },
      { code: 'CNY', name: 'Yuan Chinês', rate: 0.69, symbol: '¥', flag: '🇨🇳' },
      { code: 'JPY', name: 'Iene Japonês', rate: 0.033, symbol: '¥', flag: '🇯🇵' },
    ];

    return (
      <div className="space-y-6 animate-fade-in p-2 md:p-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-blue-500 mb-8">
          Simulação de Câmbio
        </h2>

        <div className="glass-panel p-8 rounded-2xl mb-8">
          <label className="block text-sm text-slate-400 mb-2">Valor Base (BRL)</label>
          <div className="flex items-center gap-4">
             <span className="text-2xl font-bold text-yellow-400">R$</span>
             <input 
                type="number" 
                value={exchangeAmount}
                onChange={(e) => setExchangeAmount(Math.max(0, parseFloat(e.target.value)))}
                className="bg-transparent border-b-2 border-slate-700 text-4xl font-bold text-white w-full focus:border-yellow-400 outline-none transition-colors"
                placeholder="0.00"
             />
          </div>
          <p className="text-sm text-slate-500 mt-2">Valores baseados em cotação comercial simulada.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currencies.map(currency => {
            const convertedValue = exchangeAmount / currency.rate;
            return (
              <Card key={currency.code} className="hover:bg-white/5 transition-colors border-l-4 border-l-slate-700 hover:border-l-blue-500">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{currency.flag}</span>
                    <div>
                      <h3 className="font-bold text-white">{currency.code}</h3>
                      <p className="text-xs text-slate-400">{currency.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Cotação</p>
                    <p className="font-medium text-slate-300">R$ {currency.rate.toFixed(3)}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-400 text-sm">Você recebe:</span>
                    <span className="text-2xl font-bold text-white">
                      {currency.symbol} {convertedValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        <div className="glass-panel p-4 rounded-xl flex items-center justify-center gap-2 text-slate-400 text-sm">
          <RefreshCw size={16} />
          <span>As taxas exibidas são apenas para fins de simulação e planejamento.</span>
        </div>
      </div>
    );
  };

  const renderBudgetControl = () => (
    <div className="space-y-6 animate-fade-in p-2 md:p-6">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-blue-500 mb-8">
        Planejamento
      </h2>
      <p className="text-slate-400 mb-6">Planeje seus limites mensais para cada categoria e acompanhe seu progresso.</p>
      
      <div className="grid grid-cols-1 gap-4">
        {categories.filter(c => c.id !== 'cat_salary').map(cat => {
          const budget = budgets.find(b => b.categoryId === cat.id);
          const limit = budget?.limit || 0;
          
          // Calculate actual spend for this month
          const now = new Date();
          const actualSpend = transactions
            .filter(t => {
               const tDate = new Date(t.date);
               return t.categoryId === cat.id && 
                      t.type === 'expense' &&
                      tDate.getMonth() === now.getMonth() &&
                      tDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);

          const percentage = limit > 0 ? (actualSpend / limit) * 100 : 0;
          const isOverBudget = actualSpend > limit && limit > 0;

          return (
            <div key={cat.id} className="glass-panel p-6 rounded-xl flex flex-col md:flex-row items-center gap-6">
               <div className="flex items-center gap-4 w-full md:w-1/4">
                 <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: cat.color }}>
                   {cat.name[0]}
                 </div>
                 <h3 className="text-lg font-bold text-white">{cat.name}</h3>
               </div>

               <div className="flex-1 w-full">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">Gasto: <span className={isOverBudget ? "text-red-400" : "text-white"}>R$ {actualSpend.toLocaleString()}</span></span>
                    <span className="text-slate-400">Meta: R$ {limit.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-slate-500">{percentage.toFixed(0)}% da meta</p>
               </div>

               <div className="w-full md:w-auto flex justify-end">
                 {editingBudget?.catId === cat.id ? (
                   <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        autoFocus
                        className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 w-32 focus:border-blue-500 outline-none"
                        value={editingBudget.amount}
                        onChange={(e) => setEditingBudget({ ...editingBudget, amount: parseFloat(e.target.value) })}
                      />
                      <Button onClick={() => handleUpdateBudget(cat.id, editingBudget.amount)} className="p-2">
                        <Save size={18} />
                      </Button>
                   </div>
                 ) : (
                   <Button variant="secondary" onClick={() => setEditingBudget({ catId: cat.id, amount: limit })}>
                     <Edit3 size={18} /> <span className="ml-2">Definir Meta</span>
                   </Button>
                 )}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-6 p-2 md:p-6 animate-fade-in">
       <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-blue-500 mb-8">
        Objetivos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <Card key={goal.id} className="relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="text-xl font-bold text-white">{goal.name}</h3>
                   <p className="text-slate-400 text-sm">Meta: {new Date(goal.deadline).toLocaleDateString()}</p>
                 </div>
                 <div className="p-3 bg-white/5 rounded-lg text-yellow-400">
                   <Target />
                 </div>
               </div>
               <div className="mb-2 flex justify-between text-sm">
                 <span className="text-slate-300">R$ {goal.currentAmount.toLocaleString()}</span>
                 <span className="text-slate-300">R$ {goal.targetAmount.toLocaleString()}</span>
               </div>
               <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                 <div 
                  className="bg-gradient-to-r from-blue-500 to-yellow-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                 ></div>
               </div>
               <p className="text-right text-xs text-yellow-400 mt-2 font-mono">{progress.toFixed(1)}%</p>
            </Card>
          )
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200 font-sans selection:bg-yellow-500/30">
      
      {/* Sidebar Navigation */}
      <nav className="w-20 md:w-64 border-r border-slate-800 flex flex-col justify-between bg-slate-950/50 backdrop-blur-xl fixed h-full z-10 transition-all">
        <div>
          <div className="p-6 flex items-center gap-3 text-yellow-400 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-slate-900 font-bold">
               <Crown size={20} />
            </div>
            <span className="text-xl font-bold tracking-wider hidden md:block text-white">CZAR<span className="text-yellow-400">ORÇAMENTO</span></span>
          </div>
          
          <div className="space-y-2 px-3">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  view === item.id 
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-[0_0_15px_rgba(250,204,21,0.1)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} className={item.highlight ? 'text-blue-400' : ''} />
                <span className="hidden md:block font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-3 py-3 text-slate-500 hover:text-slate-300 transition-colors">
            <Settings size={20} />
            <span className="hidden md:block">Configurações</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8 overflow-y-auto">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8 sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-white/5">
          <h1 className="text-2xl font-bold text-white capitalize">{navItems.find(i => i.id === view)?.label}</h1>
          <Button onClick={() => setIsTxModalOpen(true)}>
             <PlusCircle size={18} /> <span className="hidden sm:inline">Nova Transação</span>
          </Button>
        </div>

        {/* View Switcher */}
        <div className="pb-20">
          {view === ViewState.DASHBOARD && renderDashboard()}
          {view === ViewState.REPORTS && <Reports transactions={transactions} categories={categories} budgets={budgets} />}
          {view === ViewState.GOALS && renderGoals()}
          {view === ViewState.BUDGET_CONTROL && renderBudgetControl()}
          {view === ViewState.EXCHANGE && renderExchange()}
          
          {view === ViewState.TRANSACTIONS && (
            <div className="space-y-4 animate-fade-in p-2 md:p-6">
               <div className="glass-panel rounded-xl overflow-hidden">
                 <table className="w-full text-left">
                   <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase">
                     <tr>
                       <th className="p-4">Data</th>
                       <th className="p-4">Descrição</th>
                       <th className="p-4">Categoria</th>
                       <th className="p-4">Conta</th>
                       <th className="p-4 text-right">Valor</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800">
                     {transactions.map(tx => {
                       const cat = categories.find(c => c.id === tx.categoryId);
                       const acc = accounts.find(a => a.id === tx.accountId);
                       return (
                         <tr key={tx.id} className="hover:bg-white/5 transition-colors text-sm">
                           <td className="p-4 text-slate-400">{new Date(tx.date).toLocaleDateString()}</td>
                           <td className="p-4 font-medium text-white">{tx.description}</td>
                           <td className="p-4">
                             <span className="px-2 py-1 rounded-md bg-slate-800 text-xs text-slate-300 border border-slate-700">
                               {cat?.name || '-'}
                             </span>
                           </td>
                           <td className="p-4 text-slate-400">{acc?.bankName}</td>
                           <td className={`p-4 text-right font-bold ${tx.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>
                             {tx.type === 'expense' ? '-' : '+'} R$ {tx.amount.toFixed(2)}
                           </td>
                         </tr>
                       )
                     })}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Transaction Modal */}
      <Modal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} title="Nova Transação">
        <div className="space-y-4">
          
          {/* Type Selector */}
          <div className="grid grid-cols-4 gap-2 bg-slate-800 p-1 rounded-lg">
             {['expense', 'income', 'investment', 'transfer'].map(t => (
               <button 
                key={t}
                onClick={() => setNewTx({ ...newTx, type: t as any })}
                className={`py-2 text-xs font-bold uppercase rounded-md transition-all ${newTx.type === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 {t === 'expense' ? 'Despesa' : t === 'income' ? 'Receita' : t === 'investment' ? 'Inv.' : 'Transf.'}
               </button>
             ))}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Valor</label>
            <input 
              type="number" 
              value={newTx.amount} 
              onChange={e => setNewTx({...newTx, amount: parseFloat(e.target.value)})}
              className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-3 text-2xl font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Descrição</label>
            <input 
              type="text" 
              value={newTx.description} 
              onChange={e => setNewTx({...newTx, description: e.target.value})}
              className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
              placeholder="Ex: Supermercado"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm text-slate-400 mb-1">Data</label>
                <input 
                  type="date" 
                  value={newTx.date} 
                  onChange={e => setNewTx({...newTx, date: e.target.value})}
                  className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                />
             </div>
             <div>
                <label className="block text-sm text-slate-400 mb-1">Conta (Origem)</label>
                <select 
                  value={newTx.accountId}
                  onChange={e => setNewTx({...newTx, accountId: e.target.value})}
                  className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="">Selecione...</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.name}</option>)}
                </select>
             </div>
          </div>

          {newTx.type === 'transfer' ? (
             <div>
                <label className="block text-sm text-slate-400 mb-1">Conta Destino</label>
                <select 
                  value={newTx.toAccountId}
                  onChange={e => setNewTx({...newTx, toAccountId: e.target.value})}
                  className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="">Selecione...</option>
                  {accounts.filter(a => a.id !== newTx.accountId).map(acc => <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.name}</option>)}
                </select>
             </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm text-slate-400 mb-1">Categoria</label>
                  <select 
                    value={newTx.categoryId}
                    onChange={e => setNewTx({...newTx, categoryId: e.target.value, subCategoryId: ''})}
                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  >
                    <option value="">Selecione...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-sm text-slate-400 mb-1">Sub-Categoria</label>
                  <select 
                    value={newTx.subCategoryId}
                    onChange={e => setNewTx({...newTx, subCategoryId: e.target.value})}
                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                    disabled={!newTx.categoryId}
                  >
                    <option value="">Selecione...</option>
                    {categories.find(c => c.id === newTx.categoryId)?.subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
               </div>
            </div>
          )}

          <div className="pt-4">
            <Button className="w-full py-3 text-lg" onClick={() => {
              if(!newTx.amount || !newTx.accountId || !newTx.description) return alert("Preencha os campos obrigatórios");
              addTransaction({
                ...newTx,
                id: Math.random().toString(36).substr(2, 9),
              } as Transaction);
            }}>
              Confirmar Transação
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default App;