import React, { useEffect, useMemo, useState } from 'react';
import Topbar from '../components/Dashboard/Topbar';
import FinancialCard from '../components/Cards/FinancialCard';
import TransactionChart from '../components/Charts/TransactionChart';
import CategoryChart from '../components/Charts/CategoryChart';
import RecentTransactions from '../components/Transactions/RecentTransactions';
import MonthlyBudget from '../components/Budget/MonthlyBudget';
import { useFinanceStore } from '../store/financeStore';
import { addMoney, subtractMoney } from '../utils/money';

let dashboardDataLoadPromise = null;

const Dashboard = () => {
  const {
    summary,
    financialScore,
    transactions,
    categories,
    budgets,
    goals,
    currentMonth,
    currentYear,
    fetchTransactions,
    fetchCategories,
    fetchBudgets,
    fetchGoals,
    error,
  } = useFinanceStore();
  
  // Simulated widget state for customizability
  const [layout, setLayout] = useState('default'); // 'default', 'compact', 'pro'
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const monthlySummary = useMemo(() => {
    const selectedMonthTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.createdAt);
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
    });

    const previousDate = new Date(currentYear, currentMonth - 2, 1);
    const previousMonth = previousDate.getMonth() + 1;
    const previousYear = previousDate.getFullYear();
    const previousMonthTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.createdAt);
      return date.getMonth() + 1 === previousMonth && date.getFullYear() === previousYear;
    });

    const buildSummary = (items) => {
      const income = items
        .filter(transaction => transaction.type === 'INCOME')
        .reduce((total, transaction) => addMoney(total, transaction.amount), 0);
      const expense = items
        .filter(transaction => transaction.type === 'EXPENSE')
        .reduce((total, transaction) => addMoney(total, transaction.amount), 0);
      const balance = subtractMoney(income, expense);
      const savings = balance > 0 ? balance : 0;

      return {
        balance,
        income,
        expense,
        savings,
        savingsPercentage: income > 0 ? Math.round((savings / income) * 100) : 0,
      };
    };

    const selected = buildSummary(selectedMonthTransactions);
    const previous = buildSummary(previousMonthTransactions);
    const percentageChange = (current, previousValue) => {
      if (previousValue === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previousValue) / Math.abs(previousValue)) * 100);
    };

    return {
      ...selected,
      balanceChange: percentageChange(selected.balance, previous.balance),
      incomeChange: percentageChange(selected.income, previous.income),
      expenseChange: percentageChange(selected.expense, previous.expense),
    };
  }, [transactions, currentMonth, currentYear]);

  const hasCachedData = useMemo(() => (
    transactions.length > 0
    || categories.length > 0
    || budgets.length > 0
    || goals.length > 0
  ), [transactions.length, categories.length, budgets.length, goals.length]);

  useEffect(() => {
    if (hasCachedData) return;

    let isMounted = true;
    const loadDashboardData = async () => {
      setIsInitialLoading(true);
      try {
        if (!dashboardDataLoadPromise) {
          dashboardDataLoadPromise = Promise.all([
            fetchCategories(),
            fetchTransactions(),
            fetchBudgets(),
            fetchGoals(),
          ]).catch((loadError) => {
            dashboardDataLoadPromise = null;
            throw loadError;
          });
        }
        await dashboardDataLoadPromise;
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [hasCachedData, fetchCategories, fetchTransactions, fetchBudgets, fetchGoals]);

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <Topbar />
      {isInitialLoading && (
        <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-300">
          Cargando datos financieros...
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-2xl border border-expense/20 bg-expense/10 px-5 py-3 text-sm font-bold text-expense">
          {error}
        </div>
      )}
      
      {/* Widget Control Panel */}
      <div className="flex justify-end mb-6 space-x-2">
        <button onClick={() => setLayout('compact')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${layout === 'compact' ? 'bg-blue-600 text-white' : 'bg-[#1e1e1e] text-gray-500 border border-[#3a3a3a] hover:text-white'}`}>Compacto</button>
        <button onClick={() => setLayout('default')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${layout === 'default' ? 'bg-blue-600 text-white' : 'bg-[#1e1e1e] text-gray-500 border border-[#3a3a3a] hover:text-white'}`}>Estándar</button>
        <button onClick={() => setLayout('pro')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${layout === 'pro' ? 'bg-blue-600 text-white' : 'bg-[#1e1e1e] text-gray-500 border border-[#3a3a3a] hover:text-white'}`}>Pro</button>
      </div>
      
      {/* Financial Summary Cards */}
      <div className={`grid gap-8 mb-10 ${layout === 'compact' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
        <FinancialCard 
          title="Balance total" 
          amount={monthlySummary.balance} 
          percentage={monthlySummary.balanceChange} 
          type="default" 
        />
        <FinancialCard 
          title="Ingresos" 
          amount={monthlySummary.income} 
          percentage={monthlySummary.incomeChange} 
          type="income" 
        />
        <FinancialCard 
          title="Gastos" 
          amount={monthlySummary.expense} 
          percentage={monthlySummary.expenseChange} 
          type="expense" 
        />
        <FinancialCard 
          title="Ahorros" 
          amount={monthlySummary.savings} 
          percentage={monthlySummary.savingsPercentage} 
          type="savings" 
          subtext="de ingresos"
        />
      </div>

      {layout === 'pro' && (
        <div className="bg-[#232323] border border-blue-500/30 rounded-3xl p-6 mb-10 shadow-[0_0_20px_rgba(37,99,235,0.1)] flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Modo Productividad Activo</h3>
            <p className="text-gray-400 text-sm mt-1">Estás viendo métricas avanzadas y atajos directos.</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Financial Score</span>
            <span className="text-2xl font-black text-blue-500">{financialScore.score}/100</span>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className={`grid gap-8 mb-10 ${layout === 'compact' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 xl:grid-cols-3'}`}>
        <div className={layout === 'compact' ? 'xl:col-span-1' : 'xl:col-span-2'}>
          <TransactionChart />
        </div>
        <div className="xl:col-span-1">
          <CategoryChart />
        </div>
      </div>

      {/* Bottom Section: Transactions and Budget */}
      <div className={`grid gap-8 ${layout === 'compact' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 xl:grid-cols-3'}`}>
        <div className={layout === 'compact' ? 'xl:col-span-1' : 'xl:col-span-2'}>
          <RecentTransactions />
        </div>
        <div className="xl:col-span-1 flex flex-col">
          <MonthlyBudget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
