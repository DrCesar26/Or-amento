import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { Transaction, Category, Budget } from '../types';

interface ReportsProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}

const COLORS = ['#22d3ee', '#c084fc', '#34d399', '#f472b6', '#fbbf24', '#ef4444'];

export const Reports: React.FC<ReportsProps> = ({ transactions, categories, budgets }) => {
  
  // Prepare data for Spending over Time (Area Chart)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const dataOverTime = sortedTransactions.reduce((acc: any[], t) => {
    const date = t.date;
    const existing = acc.find(item => item.date === date);
    if (existing) {
      if (t.type === 'expense') existing.expense += t.amount;
      if (t.type === 'income') existing.income += t.amount;
    } else {
      acc.push({
        date,
        expense: t.type === 'expense' ? t.amount : 0,
        income: t.type === 'income' ? t.amount : 0,
      });
    }
    return acc;
  }, []);

  // Prepare data for Expenses by Category (Pie Chart)
  const categoryData = categories.map(cat => {
    const total = transactions
      .filter(t => t.categoryId === cat.id && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: cat.name, value: total };
  }).filter(c => c.value > 0);

  // Prepare data for Budget vs Actual (Bar Chart)
  const budgetData = budgets.map(b => {
    const category = categories.find(c => c.id === b.categoryId);
    const actual = transactions
      .filter(t => t.categoryId === b.categoryId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: category?.name || 'Unknown',
      Meta: b.limit,
      Real: actual,
    };
  });

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-6">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-8">
        Gráficos & Análises
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cash Flow Chart */}
        <div className="glass-panel p-6 rounded-2xl col-span-1 lg:col-span-2">
          <h3 className="text-xl font-semibold text-white mb-4">Fluxo de Caixa (Receitas vs Despesas)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataOverTime}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="income" stroke="#34d399" fillOpacity={1} fill="url(#colorIncome)" name="Receitas" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" name="Despesas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">Gastos por Categoria</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget vs Actual */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">Metas Orçamentárias</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="Meta" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Real" fill="#c084fc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};