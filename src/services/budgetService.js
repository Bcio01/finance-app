import { budgetRepository } from './repositories/budgetRepository';

export const getBudgets = async (month, year) => {
  try {
    return await budgetRepository.getByMonth(month, year);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    throw error;
  }
};

export const upsertBudget = async (data) => {
  try {
    return await budgetRepository.upsert(data);
  } catch (error) {
    console.error("Error upserting budget:", error);
    throw error;
  }
};
