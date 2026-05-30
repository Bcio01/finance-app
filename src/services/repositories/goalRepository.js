import { dbManager } from '../databaseManager';

/**
 * Goal Repository
 * Abstracción para el acceso a datos de metas de ahorro.
 */

export const goalRepository = {
  async getAll() {
    return dbManager.query('savingsGoal', {
      orderBy: { deadline: 'asc' }
    });
  },

  async create(data) {
    return dbManager.create('savingsGoal', { data });
  },

  async update(id, data) {
    return dbManager.update('savingsGoal', { 
      where: { id }, 
      data 
    });
  },

  async delete(id) {
    return dbManager.delete('savingsGoal', { where: { id } });
  },

  async deleteMany() {
    return dbManager.deleteMany('savingsGoal');
  }
};
