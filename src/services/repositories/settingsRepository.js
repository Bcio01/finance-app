import { dbManager } from '../databaseManager';

/**
 * Settings Repository
 * Abstracción para el acceso a la configuración persistente en DB.
 */

export const settingsRepository = {
  async get() {
    return dbManager.findUnique('settings', { where: { id: 1 } });
  },

  async update(data) {
    return dbManager.update('settings', { 
      where: { id: 1 }, 
      data 
    });
  },

  async initialize(data) {
    const existing = await this.get();
    if (!existing) {
      return dbManager.create('settings', { data: { ...data, id: 1 } });
    }
    return existing;
  }
};
