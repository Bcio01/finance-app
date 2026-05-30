import { categoryRepository } from './repositories/categoryRepository';
import { transactionRepository } from './repositories/transactionRepository';
import { budgetRepository } from './repositories/budgetRepository';
import { recurringTransactionRepository } from './repositories/recurringTransactionRepository';
import { addMoney } from '../utils/money';

export const getAllCategories = async () => {
  try {
    return await categoryRepository.getAll();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const createCategory = async (data) => {
  try {
    return await categoryRepository.create(data);
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

const getOrCreateUncategorizedCategory = async () => {
  const categories = await categoryRepository.getAll();
  const existing = categories.find(category => category.name.trim().toLowerCase() === 'sin categoria');
  if (existing) return existing;

  return categoryRepository.create({
    name: 'Sin categoria',
    color: '#64748b'
  });
};

export const deleteCategory = async (id) => {
  try {
    const fallbackCategory = await getOrCreateUncategorizedCategory();
    if (fallbackCategory.id === id) {
      throw new Error('No se puede eliminar la categoria de respaldo.');
    }

    const txs = await transactionRepository.getAll({ where: { categoryId: id } });
    for (const tx of txs) {
      await transactionRepository.update(tx.id, { categoryId: fallbackCategory.id });
    }

    const recurringTransactions = await recurringTransactionRepository.getAll({ where: { categoryId: id } });
    for (const recurring of recurringTransactions) {
      await recurringTransactionRepository.update(recurring.id, { categoryId: fallbackCategory.id });
    }

    const budgets = await budgetRepository.getAll();
    const relevantBudgets = budgets.filter(b => b.categoryId === id);
    for (const b of relevantBudgets) {
      const fallbackBudget = budgets.find(candidate => (
        candidate.categoryId === fallbackCategory.id
        && candidate.month === b.month
        && candidate.year === b.year
      ));

      if (fallbackBudget) {
        await budgetRepository.update(fallbackBudget.id, {
          amount: addMoney(fallbackBudget.amount, b.amount)
        });
        await budgetRepository.delete(b.id);
      } else {
        await budgetRepository.update(b.id, { categoryId: fallbackCategory.id });
      }
    }

    return await categoryRepository.delete(id);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
