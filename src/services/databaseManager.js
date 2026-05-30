import { localStorageProvider } from './providers/localStorageProvider';
import { sqliteProvider } from './providers/sqliteProvider';

/**
 * Database Manager
 * Gestiona dinamicamente el origen de los datos de la aplicacion.
 * El frontend consume este manager sin saber si los datos vienen de LocalStorage o SQLite.
 */

class DatabaseManager {
  constructor() {
    this.provider = this.resolveProvider();
    console.info(`[FinanceApp] Data provider activo: ${this.provider.name}`);
  }

  resolveProvider() {
    const isTauri = typeof window !== 'undefined' && Boolean(window.__TAURI__ || window.__TAURI_INTERNALS__);

    if (isTauri) {
      return sqliteProvider;
    }

    console.info('[FinanceApp] Entorno web detectado; usando LocalStorage como fallback explicito.');
    return localStorageProvider;
  }

  getProvider() {
    return this.provider;
  }

  async query(model, args) {
    return this.provider.query(model, args);
  }

  async findUnique(model, args) {
    if (this.provider.findUnique) {
      return this.provider.findUnique(model, args);
    }
    const records = await this.query(model, args);
    return records[0] || null;
  }

  async create(model, data) {
    return this.provider.create(model, data);
  }

  async update(model, data) {
    return this.provider.update(model, data);
  }

  async delete(model, data) {
    return this.provider.delete(model, data);
  }

  async deleteMany(model) {
    return this.provider.deleteMany(model);
  }

  async upsert(model, { where, update, create }) {
    if (this.provider.upsert) {
      return this.provider.upsert(model, { where, update, create });
    }

    const existing = await this.findUnique(model, { where });
    if (existing) {
      return this.update(model, { where: { id: existing.id }, data: update });
    }
    return this.create(model, { data: create });
  }
}

export const dbManager = new DatabaseManager();
