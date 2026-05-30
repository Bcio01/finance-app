import { transactionRepository } from './repositories/transactionRepository';

export const getAllTransactions = async () => {
  try {
    return await transactionRepository.getAll();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

export const createTransaction = async (data) => {
  try {
    return await transactionRepository.create(data);
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};

export const updateTransaction = async (id, data) => {
  try {
    return await transactionRepository.update(id, data);
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
};

export const deleteTransaction = async (id) => {
  try {
    return await transactionRepository.delete(id);
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};
