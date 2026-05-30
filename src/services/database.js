import { dbManager } from './databaseManager';

/**
 * Prisma API Proxy
 * Este archivo actúa como puente de compatibilidad.
 * Mantiene la interfaz de Prisma pero redirige las llamadas al dbManager.
 */

const createModelProxy = (modelName) => ({
  findMany: (args) => dbManager.query(modelName, args),
  findUnique: (args) => dbManager.findUnique(modelName, args),
  create: (args) => dbManager.create(modelName, args),
  update: (args) => dbManager.update(modelName, args),
  delete: (args) => dbManager.delete(modelName, args),
  deleteMany: (args) => dbManager.deleteMany(modelName, args),
  upsert: (args) => dbManager.upsert(modelName, args),
});

const prisma = {
  transaction: createModelProxy('transaction'),
  recurringTransaction: createModelProxy('recurringTransaction'),
  category: createModelProxy('category'),
  budget: createModelProxy('budget'),
  savingsGoal: createModelProxy('savingsGoal'),
  settings: createModelProxy('settings'),
};

export default prisma;
