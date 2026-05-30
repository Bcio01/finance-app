/**
 * LocalStorage Provider
 * Implementación del proveedor de datos utilizando el almacenamiento del navegador.
 * Actúa como el motor de datos por defecto (fallback).
 */

const DB_KEY = 'finance_db';

const initDB = () => {
  const defaultData = {
    transaction: [],
    recurringTransaction: [],
    category: [],
    budget: [],
    savingsGoal: [],
    settings: {
      id: 1,
      currency: 'CLP',
      locale: 'es-CL',
      theme: 'dark',
      pin: null,
      isInitialized: false
    }
  };
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
  }
};

const getDB = () => JSON.parse(localStorage.getItem(DB_KEY) || '{}');
const saveDB = (data) => localStorage.setItem(DB_KEY, JSON.stringify(data));

const matchesWhere = (record, where = {}) => {
  return Object.entries(where).every(([key, expected]) => {
    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
      return Object.entries(expected).every(([nestedKey, nestedExpected]) => (
        record[nestedKey] === nestedExpected
      ));
    }

    return record[key] === expected;
  });
};

const hydrateRelations = (records, model, args, db) => {
  if (!args.include?.category || !['transaction', 'budget'].includes(model)) {
    return records;
  }

  return records.map(record => ({
    ...record,
    category: db.category?.find(category => category.id === record.categoryId) || null,
  }));
};

export const localStorageProvider = {
  name: 'LocalStorage',

  async query(model, args = {}) {
    initDB();
    const db = getDB();
    let records = Array.isArray(db[model])
      ? [...db[model]]
      : db[model]
        ? [db[model]]
        : [];

    // Filtros básicos
    if (args.where) {
      records = records.filter(record => matchesWhere(record, args.where));
    }

    // Ordenamiento
    if (args.orderBy) {
      const key = Object.keys(args.orderBy)[0];
      const dir = args.orderBy[key];
      records.sort((a, b) => {
        if (a[key] < b[key]) return dir === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return hydrateRelations(records, model, args, db);
  },

  async findUnique(model, args) {
    const records = await this.query(model, args);
    return records[0] || null;
  },

  async upsert(model, { where, update, create }) {
    const existing = await this.findUnique(model, { where });
    return existing
      ? this.update(model, { where: { id: existing.id }, data: update })
      : this.create(model, { data: create });
  },

  async create(model, { data }) {
    const db = getDB();
    const newRecord = { 
      ...data, 
      id: data.id || Date.now() + Math.floor(Math.random() * 1000),
      createdAt: data.createdAt || new Date().toISOString()
    };
    if (Array.isArray(db[model]) || !db[model]) {
      if (!db[model]) db[model] = [];
      db[model].push(newRecord);
    } else {
      db[model] = newRecord;
    }
    saveDB(db);
    return newRecord;
  },

  async update(model, { where, data }) {
    const db = getDB();
    if (!Array.isArray(db[model])) {
      if (db[model] && matchesWhere(db[model], where)) {
        db[model] = { ...db[model], ...data };
        saveDB(db);
        return db[model];
      }
      throw new Error(`${model} record not found`);
    }

    const index = db[model].findIndex(r => r.id === where.id);
    if (index !== -1) {
      db[model][index] = { ...db[model][index], ...data };
      saveDB(db);
      return db[model][index];
    }
    throw new Error(`${model} record not found`);
  },

  async delete(model, { where }) {
    const db = getDB();
    if (!Array.isArray(db[model])) {
      if (db[model] && matchesWhere(db[model], where)) {
        const deleted = db[model];
        db[model] = null;
        saveDB(db);
        return deleted;
      }
      throw new Error(`${model} record not found`);
    }

    const index = db[model].findIndex(r => r.id === where.id);
    if (index !== -1) {
      const deleted = db[model].splice(index, 1)[0];
      saveDB(db);
      return deleted;
    }
    throw new Error(`${model} record not found`);
  },

  async deleteMany(model) {
    const db = getDB();
    db[model] = [];
    saveDB(db);
    return { count: 0 };
  }
};
