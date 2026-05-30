import { dbManager } from '../databaseManager';

/**
 * Category Repository
 * Abstracción para el acceso a datos de categorías.
 */

export const categoryRepository = {
  async getAll() {
    return dbManager.query('category', {
      orderBy: { name: 'asc' }
    });
  },

  async create(data) {
    return dbManager.create('category', { data });
  },

  async delete(id) {
    return dbManager.delete('category', { where: { id } });
  },

  async deleteMany() {
    return dbManager.deleteMany('category');
  }
};
