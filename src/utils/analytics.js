// Helper functions for financial intelligence and automation
import { addMoney, subtractMoney } from './money';

export const generateRecommendations = (transactions, currentMonth, currentYear) => {
  const recommendations = [];
  
  if (!transactions || transactions.length === 0) return recommendations;

  const currentMonthTx = transactions.filter(t => 
    new Date(t.createdAt).getMonth() + 1 === currentMonth &&
    new Date(t.createdAt).getFullYear() === currentYear
  );

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  
  const prevMonthTx = transactions.filter(t => 
    new Date(t.createdAt).getMonth() + 1 === prevMonth &&
    new Date(t.createdAt).getFullYear() === prevYear
  );

  // Group by category
  const currentExpenses = {};
  const prevExpenses = {};

  currentMonthTx.filter(t => t.type === 'EXPENSE').forEach(t => {
    const cat = t.category?.name || 'Varios';
    currentExpenses[cat] = addMoney(currentExpenses[cat] || 0, Math.abs(t.amount));
  });

  prevMonthTx.filter(t => t.type === 'EXPENSE').forEach(t => {
    const cat = t.category?.name || 'Varios';
    prevExpenses[cat] = addMoney(prevExpenses[cat] || 0, Math.abs(t.amount));
  });

  // Detect spikes
  Object.keys(currentExpenses).forEach(cat => {
    const current = currentExpenses[cat];
    const prev = prevExpenses[cat] || 0;
    
    if (prev > 0 && current > prev * 1.2) { // 20% increase
      const increase = Math.round(((current - prev) / prev) * 100);
      recommendations.push({
        type: 'warning',
        title: 'Alerta de Patrón',
        message: `Tus gastos en "${cat}" aumentaron un ${increase}% respecto al mes pasado.`
      });
    }
  });

  // Suggest savings
  const totalCurrentExpense = Object.values(currentExpenses).reduce((total, amount) => addMoney(total, amount), 0);
  const totalCurrentIncome = currentMonthTx
    .filter(t => t.type === 'INCOME')
    .reduce((total, tx) => addMoney(total, tx.amount), 0);
  
  if (totalCurrentIncome > 0) {
    const savingsRate = (subtractMoney(totalCurrentIncome, totalCurrentExpense) / totalCurrentIncome) * 100;
    if (savingsRate > 20) {
      recommendations.push({
        type: 'success',
        title: 'Salud Financiera',
        message: 'Excelente capacidad de ahorro. Tienes margen para invertir o adelantar metas.'
      });
    } else if (savingsRate > 0 && savingsRate < 10) {
      recommendations.push({
        type: 'info',
        title: 'Oportunidad de Ahorro',
        message: 'Ahorras menos del 10%. Intenta reducir los gastos misceláneos para alcanzar tus metas más rápido.'
      });
    }
  }

  return recommendations;
};

export const calculateGoalProjections = (goals, transactions) => {
  const projectedGoals = [...goals];
  
  // Calculate average monthly savings
  let totalIncome = 0;
  let totalExpense = 0;
  let earliestDate = new Date();

  transactions.forEach(t => {
    if (t.type === 'INCOME') totalIncome = addMoney(totalIncome, t.amount);
    else totalExpense = addMoney(totalExpense, t.amount);
    
    const tDate = new Date(t.createdAt);
    if (tDate < earliestDate) earliestDate = tDate;
  });

  const now = new Date();
  const daysActive = Math.max(1, Math.ceil((now - earliestDate) / (1000 * 60 * 60 * 24)));
  const monthsActive = Math.max(1, daysActive / 30);
  
  const avgMonthlySavings = Math.max(0, subtractMoney(totalIncome, totalExpense) / monthsActive);

  projectedGoals.forEach(goal => {
    const remaining = subtractMoney(goal.target, goal.current);
    if (remaining <= 0) {
      goal.status = 'completed';
      goal.monthsToCompletion = 0;
      goal.estimationMessage = 'Meta completada';
    } else if (avgMonthlySavings > 0) {
      const months = Math.ceil(remaining / avgMonthlySavings);
      goal.status = 'on_track';
      goal.monthsToCompletion = months;
      
      const completionDate = new Date();
      completionDate.setMonth(completionDate.getMonth() + months);
      
      if (goal.deadline && completionDate > new Date(goal.deadline)) {
        goal.status = 'at_risk';
        goal.estimationMessage = `A este ritmo, alcanzarás la meta en ${months} meses, pero es posterior a tu fecha límite.`;
      } else {
        goal.estimationMessage = `Si mantienes tu ahorro actual, alcanzarás la meta en aproximadamente ${months} meses.`;
      }
    } else {
      goal.status = 'stalled';
      goal.monthsToCompletion = Infinity;
      goal.estimationMessage = 'Necesitas generar ahorro mensual para poder proyectar una fecha.';
    }
  });

  return projectedGoals;
};
