import { create } from 'zustand';
import * as transactionService from '../services/transactionService.js';
import * as categoryService from '../services/categoryService.js';
import * as budgetService from '../services/budgetService.js';
import * as goalService from '../services/goalService.js';
import * as recurringTransactionService from '../services/recurringTransactionService.js';
import { generateRecommendations, calculateGoalProjections } from '../utils/analytics.js';
import { calculateFinancialScore } from '../ai/scoring/calculateScore.js';
import { predictFutureBalance } from '../ai/predictions/predictBalance.js';
import { suggestCategory } from '../ai/automation/categorization.js';
import { useSettingsStore } from './settingsStore.js';
import { addMoney, roundMoney, subtractMoney } from '../utils/money.js';

export const useFinanceStore = create((set, get) => ({
  transactions: [],
  recurringTransactions: [],
  categories: [],
  budgets: [],
  goals: [],
  isLoading: false,
  error: null,
  
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),
  filterRange: 'all',

  summary: {
    balance: 0,
    income: 0,
    expense: 0,
    savings: 0,
    savingsPercentage: 0,
    avgDailyExpense: 0,
    avgMonthlyIncome: 0,
  },
  
  insights: [],
  recommendations: [],
  
  financialScore: { score: 0, level: 'Calculando...' },
  balancePredictions: null,
  aiSettings: {
    autoCategorize: true,
    smartAlerts: true
  },

  setAISettings: (settings) => set((state) => ({ aiSettings: { ...state.aiSettings, ...settings } })),

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      await recurringTransactionService.applyDueRecurringTransactions();
      const transactions = await transactionService.getAllTransactions();
      set({ transactions, isLoading: false });
      get().calculateSummary();
      get().generateInsights();
      get().updateProjections();
      get().updateAIEngine();
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await categoryService.getAllCategories();
      set({ categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  },

  createCategory: async (data) => {
    try {
      await categoryService.createCategory(data);
      get().fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
    }
  },

  deleteCategory: async (id) => {
    try {
      await categoryService.deleteCategory(id);
      get().fetchCategories();
      get().fetchTransactions();
      get().fetchBudgets();
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  fetchRecurringTransactions: async () => {
    try {
      const recurringTransactions = await recurringTransactionService.getRecurringTransactions();
      set({ recurringTransactions });
    } catch (error) {
      console.error("Error fetching recurring transactions:", error);
    }
  },

  fetchBudgets: async () => {
    try {
      const { currentMonth, currentYear } = get();
      const budgets = await budgetService.getBudgets(currentMonth, currentYear);
      set({ budgets });
      get().updateAIEngine();
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  },

  fetchGoals: async () => {
    try {
      const goals = await goalService.getGoals();
      set({ goals });
      get().updateProjections();
      get().updateAIEngine();
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  },

  upsertBudget: async (data) => {
    try {
      const { currency } = useSettingsStore.getState();
      await budgetService.upsertBudget({
        ...data,
        amount: roundMoney(data.amount),
        currency,
      });
      get().fetchBudgets();
    } catch (error) {
      console.error("Error upserting budget:", error);
    }
  },

  addTransaction: async (data) => {
    try {
      const { currency } = useSettingsStore.getState();
      let finalData = {
        ...data,
        amount: roundMoney(data.amount),
        currency,
      };
      const state = get();
      
      // Auto-categorization hook
      if (state.aiSettings.autoCategorize && !finalData.categoryId && finalData.description) {
        const suggestedCatId = suggestCategory(finalData.description, state.categories);
        if (suggestedCatId) {
          finalData.categoryId = suggestedCatId;
        }
      }

      const newTransaction = await transactionService.createTransaction(finalData);

      get().fetchTransactions();
      return newTransaction;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    try {
      await transactionService.deleteTransaction(id);
      set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      }));
      get().calculateSummary();
      get().generateInsights();
      get().updateProjections();
      get().updateAIEngine();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  addRecurringTransaction: async (data) => {
    try {
      const { currency } = useSettingsStore.getState();
      const recurringTransaction = await recurringTransactionService.createRecurringTransaction({
        ...data,
        amount: roundMoney(data.amount),
        currency,
        isActive: true,
      });
      await get().fetchRecurringTransactions();
      await get().fetchTransactions();
      return recurringTransaction;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteRecurringTransaction: async (id) => {
    try {
      await recurringTransactionService.deleteRecurringTransaction(id);
      await get().fetchRecurringTransactions();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  toggleRecurringTransaction: async (id, isActive) => {
    try {
      await recurringTransactionService.updateRecurringTransaction(id, { isActive });
      await get().fetchRecurringTransactions();
      await get().fetchTransactions();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTransaction: async (id, data) => {
    try {
      const { currency } = useSettingsStore.getState();
      const updatedTransaction = await transactionService.updateTransaction(id, {
        ...data,
        amount: roundMoney(data.amount),
        currency,
      });
      await get().fetchTransactions();
      return updatedTransaction;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  createGoal: async (data) => {
    try {
      const { currency } = useSettingsStore.getState();
      await goalService.createGoal({
        ...data,
        target: roundMoney(data.target),
        current: roundMoney(data.current || 0),
        currency,
      });
      get().fetchGoals();
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  },

  updateGoalProgress: async (id, currentAmount) => {
    try {
      await goalService.updateGoal(id, { current: currentAmount });
      get().fetchGoals();
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  },

  deleteGoal: async (id) => {
    try {
      await goalService.deleteGoal(id);
      get().fetchGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  },

  setDate: (month, year) => {
    set({ currentMonth: month, currentYear: year });
    get().fetchBudgets();
    get().generateInsights();
  },

  calculateSummary: () => {
    const { transactions } = get();
    let income = 0; let expense = 0; let earliestDate = new Date();
    transactions.forEach(t => {
      if (t.type === 'INCOME') income = addMoney(income, t.amount);
      else expense = addMoney(expense, t.amount);
      const tDate = new Date(t.createdAt);
      if (tDate < earliestDate) earliestDate = tDate;
    });
    const balance = subtractMoney(income, expense);
    const savings = balance > 0 ? balance : 0;
    const savingsPercentage = income > 0 ? (savings / income) * 100 : 0;
    const daysActive = Math.max(1, Math.ceil((new Date() - earliestDate) / (1000 * 60 * 60 * 24)));
    const monthsActive = Math.max(1, daysActive / 30);
    set({
      summary: {
        balance, income, expense, savings,
        savingsPercentage: Math.round(savingsPercentage),
        avgDailyExpense: roundMoney(expense / daysActive),
        avgMonthlyIncome: roundMoney(income / monthsActive),
      }
    });
  },

  generateInsights: () => {
    const { transactions, currentMonth, currentYear } = get();
    if (transactions.length === 0) return;
    
    const recs = generateRecommendations(transactions, currentMonth, currentYear);
    set({ recommendations: recs });
    
    // Legacy simple insights for backward compatibility or simple dashboard view
    const currentMonthExpenses = transactions.filter(t => 
      t.type === 'EXPENSE' && new Date(t.createdAt).getMonth() + 1 === currentMonth
    );
    const insights = [];
    if (currentMonthExpenses.length > 0) {
      // Logic from previous iteration
      const catTotals = {};
      let totalCurrentExpense = 0;
      currentMonthExpenses.forEach(t => {
        const catName = t.category?.name || 'Otros';
        catTotals[catName] = addMoney(catTotals[catName] || 0, t.amount);
        totalCurrentExpense = addMoney(totalCurrentExpense, t.amount);
      });
      const topCat = Object.entries(catTotals).sort((a,b) => b[1] - a[1])[0];
      if (topCat && totalCurrentExpense > 0) {
        const percent = Math.round((topCat[1] / totalCurrentExpense) * 100);
        insights.push({
          type: 'warning',
          message: `La categoría ${topCat[0]} representa el ${percent}% de tus gastos este mes.`
        });
      }
    }
    set({ insights });
  },

  updateProjections: () => {
    const { goals, transactions } = get();
    if (goals.length > 0) {
      const projectedGoals = calculateGoalProjections(goals, transactions);
      set({ goals: projectedGoals });
    }
  },

  updateAIEngine: () => {
    const { transactions, budgets, goals } = get();
    const financialScore = calculateFinancialScore(transactions, budgets, goals);
    const balancePredictions = predictFutureBalance(transactions);
    set({ financialScore, balancePredictions });
  }
}));
