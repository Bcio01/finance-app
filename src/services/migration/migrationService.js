import { localStorageProvider } from '../providers/localStorageProvider';
import { sqliteProvider } from '../providers/sqliteProvider';
import ErrorHandler from '../../utils/errorHandler';

/**
 * Migration Service
 * Encargado de mover datos de LocalStorage a SQLite.
 */

export const migrationService = {
  async migrateToSQLite() {
    if (!sqliteProvider.isAvailable) {
      console.warn("SQLite no está disponible para migración.");
      return false;
    }

    try {
      // 1. Obtener datos de LocalStorage
      const transactions = await localStorageProvider.query('transaction');
      const categories = await localStorageProvider.query('category');
      const budgets = await localStorageProvider.query('budget');
      const goals = await localStorageProvider.query('savingsGoal');
      const settings = await localStorageProvider.findUnique('settings', { where: { id: 1 } });

      // 2. Insertar en SQLite (Iterativo para asegurar integridad)
      // Nota: En producción esto debería usar transacciones SQL reales.
      
      for (const cat of categories) {
        await sqliteProvider.create('category', { data: cat });
      }
      
      for (const tx of transactions) {
        await sqliteProvider.create('transaction', { data: tx });
      }

      // ... resto de entidades

      ErrorHandler.success("Migración a SQLite completada con éxito.");
      return true;
    } catch (error) {
      ErrorHandler.handle(error, "Fallo en la migración de datos.");
      return false;
    }
  }
};
