import { dbManager } from '../databaseManager';

/**
 * Budget Repository
 * Abstracción para el acceso a datos de presupuestos mensuales.
 */

export const budgetRepository = {
  async getAll(args = {}) {
    return dbManager.query('budget', {
      ...args,
      include: { category: true }
    });
  },

  async getByMonth(month, year) {
    return dbManager.query('budget', {
      where: { month, year },
      include: { category: true }
    });
  },

  async upsert(data) {
    const update = { amount: data.amount };
    if (data.currency !== undefined) {
      update.currency = data.currency;
    }

    return dbManager.upsert('budget', {
      where: {
        categoryId_month_year: {
          categoryId: data.categoryId,
          month: data.month,
          year: data.year
        }
      },
      update,
      create: data
    });
  },

  async update(id, data) {
    return dbManager.update('budget', {
      where: { id },
      data
    });
  },

  async delete(id) {
    return dbManager.delete('budget', { where: { id } });
  },

  async deleteMany() {
    return dbManager.deleteMany('budget');
  }
};
