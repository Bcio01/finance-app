import { goalRepository } from './repositories/goalRepository';

export const getGoals = async () => {
  try {
    return await goalRepository.getAll();
  } catch (error) {
    console.error("Error fetching goals:", error);
    throw error;
  }
};

export const createGoal = async (data) => {
  try {
    return await goalRepository.create(data);
  } catch (error) {
    console.error("Error creating goal:", error);
    throw error;
  }
};

export const updateGoal = async (id, data) => {
  try {
    return await goalRepository.update(id, data);
  } catch (error) {
    console.error("Error updating goal:", error);
    throw error;
  }
};

export const deleteGoal = async (id) => {
  try {
    return await goalRepository.delete(id);
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw error;
  }
};
