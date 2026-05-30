import { addMoney, roundMoney, subtractMoney } from '../../utils/money';

export const calculateFinancialScore = (transactions, budgets, goals) => {
  let score = 50;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const isCurrentMonth = (date) => {
    const parsed = new Date(date);
    return parsed.getMonth() + 1 === currentMonth && parsed.getFullYear() === currentYear;
  };

  const currentMonthIncome = transactions
    .filter(t => t.type === 'INCOME' && isCurrentMonth(t.createdAt))
    .reduce((sum, t) => addMoney(sum, t.amount), 0);

  const currentMonthExpense = transactions
    .filter(t => t.type === 'EXPENSE' && isCurrentMonth(t.createdAt))
    .reduce((sum, t) => addMoney(sum, t.amount), 0);

  if (currentMonthIncome > 0) {
    const savingsRate = subtractMoney(currentMonthIncome, currentMonthExpense) / currentMonthIncome;
    if (savingsRate >= 0.2) score += 25;
    else if (savingsRate > 0) score += (savingsRate / 0.2) * 25;
    else score -= Math.min(30, 10 + Math.abs(savingsRate) * 10);
  } else if (currentMonthExpense > 0) {
    score -= Math.min(35, 15 + currentMonthExpense / 1000);
  }

  if (budgets.length > 0) {
    let budgetAdherencePoints = 0;
    let validBudgets = 0;

    budgets.forEach((budget) => {
      if (budget.month === currentMonth && budget.year === currentYear && budget.amount > 0) {
        validBudgets += 1;
        const used = transactions
          .filter(t => t.type === 'EXPENSE' && t.categoryId === budget.categoryId && isCurrentMonth(t.createdAt))
          .reduce((sum, t) => addMoney(sum, Math.abs(t.amount)), 0);

        const usage = used / budget.amount;
        if (usage <= 0.8) budgetAdherencePoints += 15;
        else if (usage <= 1.0) budgetAdherencePoints += 5;
        else budgetAdherencePoints -= Math.min(15, 5 + (usage - 1) * 10);
      }
    });

    if (validBudgets > 0) {
      score += budgetAdherencePoints / validBudgets;
    }
  }

  if (goals.length > 0) {
    let goalPoints = 0;
    goals.forEach((goal) => {
      const progress = goal.target > 0 ? roundMoney(goal.current) / roundMoney(goal.target) : 0;
      if (progress >= 1) goalPoints += 10;
      else goalPoints += Math.max(0, progress) * 10;
    });
    score += goalPoints / goals.length;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let level = "Básico";
  if (score >= 85) level = "Excelente";
  else if (score >= 70) level = "Saludable";
  else if (score >= 50) level = "Estable";
  else if (score >= 30) level = "En Riesgo";
  else level = "Crítico";

  return { score, level };
};
