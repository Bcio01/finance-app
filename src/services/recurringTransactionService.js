import { recurringTransactionRepository } from './repositories/recurringTransactionRepository';
import { transactionRepository } from './repositories/transactionRepository';

const getEffectiveDueDate = (year, monthIndex, dayOfMonth) => {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return new Date(year, monthIndex, Math.min(dayOfMonth, lastDay), 12, 0, 0);
};

export const getRecurringTransactions = async () => recurringTransactionRepository.getAll();

export const createRecurringTransaction = async (data) => recurringTransactionRepository.create({
  ...data,
  isActive: data.isActive ?? true,
});

export const updateRecurringTransaction = async (id, data) => recurringTransactionRepository.update(id, data);

export const deleteRecurringTransaction = async (id) => recurringTransactionRepository.delete(id);

export const applyDueRecurringTransactions = async (today = new Date()) => {
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  const recurringTransactions = await recurringTransactionRepository.getAll();
  const existingTransactions = await transactionRepository.getAll({
    where: {
      recurringMonth: currentMonth,
      recurringYear: currentYear,
    }
  });

  const createdTransactions = [];

  for (const recurring of recurringTransactions) {
    if (!recurring.isActive) continue;

    const dueDate = getEffectiveDueDate(currentYear, today.getMonth(), recurring.dayOfMonth);
    const ruleCreatedAt = new Date(recurring.createdAt || today);
    if (ruleCreatedAt > dueDate) continue;
    if (currentDay < dueDate.getDate()) continue;

    const alreadyCreated = existingTransactions.some(transaction => (
      transaction.recurringId === recurring.id
      && transaction.recurringMonth === currentMonth
      && transaction.recurringYear === currentYear
    ));

    if (alreadyCreated) continue;

    const created = await transactionRepository.create({
      type: recurring.type,
      amount: recurring.amount,
      currency: recurring.currency,
      description: recurring.description,
      categoryId: recurring.categoryId,
      createdAt: dueDate.toISOString(),
      recurringId: recurring.id,
      recurringMonth: currentMonth,
      recurringYear: currentYear,
    });
    createdTransactions.push(created);
  }

  return createdTransactions;
};
