import { dbManager } from '../databaseManager';

export const recurringTransactionRepository = {
  async getAll(args = {}) {
    return dbManager.query('recurringTransaction', {
      ...args,
      include: { category: true },
      orderBy: { dayOfMonth: 'asc' }
    });
  },

  async create(data) {
    return dbManager.create('recurringTransaction', { data });
  },

  async update(id, data) {
    return dbManager.update('recurringTransaction', {
      where: { id },
      data
    });
  },

  async delete(id) {
    return dbManager.delete('recurringTransaction', { where: { id } });
  },

  async deleteMany() {
    return dbManager.deleteMany('recurringTransaction');
  }
};
