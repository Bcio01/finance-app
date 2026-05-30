import { dbManager } from '../databaseManager';

/**
 * Transaction Repository
 * Abstracción para el acceso a datos de transacciones.
 */

export const transactionRepository = {
  async getAll(args = {}) {
    return dbManager.query('transaction', {
      ...args,
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async create(data) {
    return dbManager.create('transaction', { data });
  },

  async update(id, data) {
    return dbManager.update('transaction', { 
      where: { id }, 
      data 
    });
  },

  async delete(id) {
    return dbManager.delete('transaction', { where: { id } });
  },

  async deleteMany() {
    return dbManager.deleteMany('transaction');
  }
};
