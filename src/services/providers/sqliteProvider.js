import Database from '@tauri-apps/plugin-sql';

const DB_URL = 'sqlite:finance.db';

const MODEL_TABLES = {
  transaction: 'transaction',
  recurringTransaction: 'recurringTransaction',
  category: 'category',
  budget: 'budget',
  savingsGoal: 'savingsGoal',
  settings: 'settings',
};

const MODEL_FIELDS = {
  transaction: ['id', 'type', 'amount', 'currency', 'description', 'categoryId', 'createdAt', 'recurringId', 'recurringMonth', 'recurringYear'],
  recurringTransaction: ['id', 'type', 'amount', 'currency', 'description', 'categoryId', 'dayOfMonth', 'isActive', 'createdAt'],
  category: ['id', 'name', 'color'],
  budget: ['id', 'amount', 'month', 'year', 'categoryId', 'currency'],
  savingsGoal: ['id', 'title', 'target', 'current', 'deadline', 'priority', 'category', 'currency', 'createdAt'],
  settings: ['id', 'currency', 'locale', 'theme', 'pin', 'isInitialized'],
};

const quote = (identifier) => `"${identifier}"`;

let dbPromise = null;

const flattenWhere = (where = {}) => {
  return Object.entries(where).flatMap(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.entries(value);
    }
    return [[key, value]];
  });
};

const normalizeValue = (value) => {
  if (value === true) return 1;
  if (value === false) return 0;
  return value;
};

const normalizeRow = (row) => ({
  ...row,
  isInitialized: row.isInitialized === undefined ? row.isInitialized : Boolean(row.isInitialized),
  isActive: row.isActive === undefined ? row.isActive : Boolean(row.isActive),
});

const tableFor = (model) => {
  const table = MODEL_TABLES[model];
  if (!table) throw new Error(`Modelo no soportado por SQLite: ${model}`);
  return table;
};

const fieldsFor = (model) => MODEL_FIELDS[model] || [];

const ensureSchema = async (db) => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "category" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "color" TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "recurringTransaction" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "type" TEXT NOT NULL,
      "amount" REAL NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'CLP',
      "description" TEXT NOT NULL,
      "categoryId" INTEGER NOT NULL,
      "dayOfMonth" INTEGER NOT NULL,
      "isActive" INTEGER NOT NULL DEFAULT 1,
      "createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "transaction" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "type" TEXT NOT NULL,
      "amount" REAL NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'CLP',
      "description" TEXT,
      "categoryId" INTEGER NOT NULL,
      "createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "recurringId" INTEGER,
      "recurringMonth" INTEGER,
      "recurringYear" INTEGER,
      FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT
    )
  `);

  const transactionColumns = await db.select('PRAGMA table_info("transaction")');
  const existingColumns = new Set(transactionColumns.map(column => column.name));
  const columnsToAdd = [
    ['recurringId', 'INTEGER'],
    ['recurringMonth', 'INTEGER'],
    ['recurringYear', 'INTEGER'],
  ];

  for (const [columnName, columnType] of columnsToAdd) {
    if (!existingColumns.has(columnName)) {
      await db.execute(`ALTER TABLE "transaction" ADD COLUMN "${columnName}" ${columnType}`);
    }
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "budget" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "amount" REAL NOT NULL,
      "month" INTEGER NOT NULL,
      "year" INTEGER NOT NULL,
      "categoryId" INTEGER NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'CLP',
      UNIQUE ("categoryId", "month", "year"),
      FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "savingsGoal" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "title" TEXT NOT NULL,
      "target" REAL NOT NULL,
      "current" REAL NOT NULL DEFAULT 0,
      "deadline" TEXT,
      "priority" TEXT,
      "category" TEXT,
      "currency" TEXT NOT NULL DEFAULT 'CLP',
      "createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "settings" (
      "id" INTEGER PRIMARY KEY DEFAULT 1,
      "currency" TEXT NOT NULL DEFAULT 'CLP',
      "locale" TEXT NOT NULL DEFAULT 'es-CL',
      "theme" TEXT NOT NULL DEFAULT 'dark',
      "pin" TEXT,
      "isInitialized" INTEGER NOT NULL DEFAULT 0
    )
  `);
};

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = Database.load(DB_URL).then(async (db) => {
      await ensureSchema(db);
      return db;
    });
  }
  return dbPromise;
};

const attachIncludes = async (model, rows, include) => {
  if (!include?.category || !['transaction', 'budget'].includes(model)) return rows;

  const db = await getDB();
  return Promise.all(rows.map(async (row) => {
    if (!row.categoryId) return { ...row, category: null };
    const categoryRows = await db.select('SELECT * FROM "category" WHERE "id" = $1 LIMIT 1', [row.categoryId]);
    return { ...row, category: categoryRows[0] || null };
  }));
};

export const sqliteProvider = {
  name: 'SQLite',

  async query(model, args = {}) {
    const db = await getDB();
    const table = tableFor(model);
    const whereEntries = flattenWhere(args.where);
    const params = whereEntries.map(([, value]) => normalizeValue(value));
    const whereSql = whereEntries.length
      ? ` WHERE ${whereEntries.map(([field], index) => `${quote(field)} = $${index + 1}`).join(' AND ')}`
      : '';
    const orderField = args.orderBy ? Object.keys(args.orderBy)[0] : null;
    const orderSql = orderField
      ? ` ORDER BY ${quote(orderField)} ${args.orderBy[orderField] === 'asc' ? 'ASC' : 'DESC'}`
      : '';

    const rows = await db.select(`SELECT * FROM ${quote(table)}${whereSql}${orderSql}`, params);
    return attachIncludes(model, rows.map(normalizeRow), args.include);
  },

  async findUnique(model, args) {
    const records = await this.query(model, args);
    return records[0] || null;
  },

  async create(model, { data }) {
    const db = await getDB();
    const table = tableFor(model);
    const fields = fieldsFor(model).filter(field => data[field] !== undefined);
    const values = fields.map(field => normalizeValue(data[field]));
    const placeholders = fields.map((_, index) => `$${index + 1}`);
    await db.execute(
      `INSERT INTO ${quote(table)} (${fields.map(quote).join(', ')}) VALUES (${placeholders.join(', ')})`,
      values,
    );

    if (data.id) {
      return this.findUnique(model, { where: { id: data.id } });
    }

    const rows = await db.select(`SELECT * FROM ${quote(table)} ORDER BY "id" DESC LIMIT 1`);
    return normalizeRow(rows[0]);
  },

  async update(model, { where, data }) {
    const db = await getDB();
    const table = tableFor(model);
    const fields = fieldsFor(model).filter(field => data[field] !== undefined && field !== 'id');
    const values = fields.map(field => normalizeValue(data[field]));
    const whereEntries = flattenWhere(where);
    const whereValues = whereEntries.map(([, value]) => normalizeValue(value));
    const setSql = fields.map((field, index) => `${quote(field)} = $${index + 1}`).join(', ');
    const whereSql = whereEntries.map(([field], index) => `${quote(field)} = $${fields.length + index + 1}`).join(' AND ');

    if (!fields.length || !whereEntries.length) {
      throw new Error(`SQLite update invalido para ${model}`);
    }

    await db.execute(`UPDATE ${quote(table)} SET ${setSql} WHERE ${whereSql}`, [...values, ...whereValues]);
    return this.findUnique(model, { where });
  },

  async delete(model, { where }) {
    const existing = await this.findUnique(model, { where });
    if (!existing) throw new Error(`${model} record not found`);

    const db = await getDB();
    const table = tableFor(model);
    const whereEntries = flattenWhere(where);
    const whereValues = whereEntries.map(([, value]) => normalizeValue(value));
    const whereSql = whereEntries.map(([field], index) => `${quote(field)} = $${index + 1}`).join(' AND ');
    await db.execute(`DELETE FROM ${quote(table)} WHERE ${whereSql}`, whereValues);
    return existing;
  },

  async deleteMany(model) {
    const db = await getDB();
    const table = tableFor(model);
    await db.execute(`DELETE FROM ${quote(table)}`);
    return { count: 0 };
  },
};
