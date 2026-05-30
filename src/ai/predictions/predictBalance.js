import { addMoney, subtractMoney } from '../../utils/money';

export const predictFutureBalance = (transactions, monthsAhead = 6) => {
  // Group historical data by month
  const monthlyData = {};
  
  transactions.forEach(t => {
    const d = new Date(t.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    if (!monthlyData[key]) {
      monthlyData[key] = { income: 0, expense: 0, net: 0, date: new Date(d.getFullYear(), d.getMonth(), 1) };
    }
    if (t.type === 'INCOME') monthlyData[key].income = addMoney(monthlyData[key].income, t.amount);
    else monthlyData[key].expense = addMoney(monthlyData[key].expense, t.amount);
    monthlyData[key].net = subtractMoney(monthlyData[key].income, monthlyData[key].expense);
  });

  const history = Object.values(monthlyData).sort((a, b) => a.date - b.date);
  
  if (history.length < 2) {
    return null; // Not enough data
  }

  // Simple moving average for next months
  const recentHistory = history.slice(-3); // Last 3 months avg
  const avgIncome = recentHistory.reduce((total, month) => addMoney(total, month.income), 0) / recentHistory.length;
  const avgExpense = recentHistory.reduce((total, month) => addMoney(total, month.expense), 0) / recentHistory.length;
  const avgNet = subtractMoney(avgIncome, avgExpense);

  let currentBalance = history.reduce((total, month) => addMoney(total, month.net), 0);
  const predictions = [];
  
  const lastDate = history[history.length - 1].date;

  for (let i = 1; i <= monthsAhead; i++) {
    currentBalance = addMoney(currentBalance, avgNet);
    const nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + i, 1);
    const monthName = nextDate.toLocaleString('es-ES', { month: 'short' });
    
    predictions.push({
      month: `${monthName} ${nextDate.getFullYear().toString().slice(2)}`,
      projectedBalance: Math.max(0, currentBalance),
      projectedIncome: avgIncome,
      projectedExpense: avgExpense
    });
  }

  return predictions;
};
