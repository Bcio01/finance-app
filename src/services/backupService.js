import prisma from "./database.js";
import ErrorHandler from "../utils/errorHandler.js";
import { decryptJson, encryptJson } from "../utils/crypto.js";
import { MAX_BACKUP_AMOUNT } from "../utils/money.js";

const MAX_RECORDS = {
  transactions: 10000,
  recurringTransactions: 1000,
  categories: 10000,
  budgets: 10000,
  goals: 10000,
};

const MAX_AMOUNT = MAX_BACKUP_AMOUNT;
const MAX_STRING_LENGTH = 500;

export const exportData = async ({ password } = {}) => {
  try {
    if (!password) {
      throw new Error('La exportacion de backup requiere una clave de cifrado.');
    }
    const transactions = await prisma.transaction.findMany();
    const recurringTransactions = await prisma.recurringTransaction.findMany();
    const categories = await prisma.category.findMany();
    const budgets = await prisma.budget.findMany();
    const goals = await prisma.savingsGoal.findMany();

    const exportObject = {
      version: 1,
      exportDate: new Date().toISOString(),
      data: {
        transactions,
        recurringTransactions,
        categories,
        budgets,
        goals
      }
    };

    const payload = await encryptJson(exportObject, password);
    const extension = 'encrypted.json';
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `finance_backup_${new Date().toISOString().slice(0, 10)}.${extension}`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    ErrorHandler.success("Copia de seguridad exportada correctamente.");
  } catch (error) {
    ErrorHandler.handle(error, "Error exportando los datos.");
  }
};

const isPlainObject = (value) => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const isValidId = (value) => (
  (typeof value === 'string' && value.trim().length > 0 && Number.isFinite(Number(value)))
  || (typeof value === 'number' && Number.isFinite(value))
);

const normalizeId = (value) => (typeof value === 'string' ? Number(value) : value);

const validateString = (errors, path, value, { required = false } = {}) => {
  if (value === undefined || value === null || value === '') {
    if (required) errors.push(`${path}: debe ser un string no vacio.`);
    return;
  }

  if (typeof value !== 'string') {
    errors.push(`${path}: debe ser string.`);
    return;
  }

  if (value.length > MAX_STRING_LENGTH) {
    errors.push(`${path}: supera el limite de ${MAX_STRING_LENGTH} caracteres.`);
  }
};

const normalizeAmount = (errors, path, value) => {
  const amount = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    errors.push(`${path}: debe ser numero.`);
    return value;
  }

  if (Math.abs(amount) >= MAX_AMOUNT) {
    errors.push(`${path}: debe ser menor a ${MAX_AMOUNT}.`);
  }

  return amount;
};

const validateDate = (errors, path, value, { required = false } = {}) => {
  if (value === undefined || value === null || value === '') {
    if (required) errors.push(`${path}: debe ser una fecha valida.`);
    return;
  }

  if (Number.isNaN(Date.parse(value))) {
    errors.push(`${path}: debe ser una fecha parseable.`);
  }
};

const validateId = (errors, path, value) => {
  if (!isValidId(value)) {
    errors.push(`${path}: debe ser numero finito o string numerico no vacio.`);
  }
};

const validateCollection = (errors, data, key) => {
  if (!Array.isArray(data[key])) {
    errors.push(`data.${key}: debe ser un arreglo.`);
    return [];
  }

  if (data[key].length > MAX_RECORDS[key]) {
    errors.push(`data.${key}: supera el maximo de ${MAX_RECORDS[key]} registros.`);
  }

  const seen = new Set();
  data[key].forEach((record, index) => {
    if (!isPlainObject(record)) {
      errors.push(`data.${key}[${index}]: debe ser un objeto.`);
      return;
    }

    if (isValidId(record.id)) {
      const normalizedId = String(record.id);
      if (seen.has(normalizedId)) {
        errors.push(`data.${key}[${index}].id: id duplicado dentro del archivo.`);
      }
      seen.add(normalizedId);
    }
  });

  return data[key];
};

const validateBackup = (json) => {
  const errors = [];

  if (!isPlainObject(json)) {
    throw new Error("El backup debe ser un objeto JSON.");
  }

  if (json.version !== 1) {
    errors.push("version: debe ser 1.");
  }

  if (!isPlainObject(json.data)) {
    errors.push("data: debe ser un objeto.");
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  const categories = validateCollection(errors, json.data, 'categories');
  const transactions = validateCollection(errors, json.data, 'transactions');
  const recurringTransactions = Array.isArray(json.data.recurringTransactions)
    ? validateCollection(errors, json.data, 'recurringTransactions')
    : [];
  const budgets = validateCollection(errors, json.data, 'budgets');
  const goals = validateCollection(errors, json.data, 'goals');

  const sanitizedCategories = categories.map((category, index) => {
    validateId(errors, `data.categories[${index}].id`, category.id);
    validateString(errors, `data.categories[${index}].name`, category.name, { required: true });
    validateString(errors, `data.categories[${index}].color`, category.color);
    return {
      id: normalizeId(category.id),
      name: category.name,
      color: category.color,
    };
  });

  const sanitizedTransactions = transactions.map((transaction, index) => {
    validateId(errors, `data.transactions[${index}].id`, transaction.id);
    validateString(errors, `data.transactions[${index}].type`, transaction.type, { required: true });
    validateString(errors, `data.transactions[${index}].currency`, transaction.currency);
    validateString(errors, `data.transactions[${index}].description`, transaction.description);
    validateId(errors, `data.transactions[${index}].categoryId`, transaction.categoryId);
    validateDate(errors, `data.transactions[${index}].createdAt`, transaction.createdAt, { required: true });

    return {
      id: normalizeId(transaction.id),
      type: transaction.type,
      amount: normalizeAmount(errors, `data.transactions[${index}].amount`, transaction.amount),
      currency: transaction.currency || 'CLP',
      description: transaction.description,
      categoryId: normalizeId(transaction.categoryId),
      createdAt: transaction.createdAt,
      recurringId: transaction.recurringId ? normalizeId(transaction.recurringId) : null,
      recurringMonth: transaction.recurringMonth || null,
      recurringYear: transaction.recurringYear || null,
    };
  });

  const sanitizedRecurringTransactions = recurringTransactions.map((transaction, index) => {
    validateId(errors, `data.recurringTransactions[${index}].id`, transaction.id);
    validateString(errors, `data.recurringTransactions[${index}].type`, transaction.type, { required: true });
    validateString(errors, `data.recurringTransactions[${index}].currency`, transaction.currency);
    validateString(errors, `data.recurringTransactions[${index}].description`, transaction.description, { required: true });
    validateId(errors, `data.recurringTransactions[${index}].categoryId`, transaction.categoryId);
    validateDate(errors, `data.recurringTransactions[${index}].createdAt`, transaction.createdAt);
    const dayOfMonth = normalizeAmount(errors, `data.recurringTransactions[${index}].dayOfMonth`, transaction.dayOfMonth);
    if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      errors.push(`data.recurringTransactions[${index}].dayOfMonth: debe ser un entero entre 1 y 31.`);
    }

    return {
      id: normalizeId(transaction.id),
      type: transaction.type,
      amount: normalizeAmount(errors, `data.recurringTransactions[${index}].amount`, transaction.amount),
      currency: transaction.currency || 'CLP',
      description: transaction.description,
      categoryId: normalizeId(transaction.categoryId),
      dayOfMonth,
      isActive: transaction.isActive !== false,
      createdAt: transaction.createdAt,
    };
  });

  const sanitizedBudgets = budgets.map((budget, index) => {
    validateId(errors, `data.budgets[${index}].id`, budget.id);
    validateId(errors, `data.budgets[${index}].categoryId`, budget.categoryId);

    return {
      id: normalizeId(budget.id),
      amount: normalizeAmount(errors, `data.budgets[${index}].amount`, budget.amount),
      month: normalizeAmount(errors, `data.budgets[${index}].month`, budget.month),
      year: normalizeAmount(errors, `data.budgets[${index}].year`, budget.year),
      categoryId: normalizeId(budget.categoryId),
      currency: budget.currency || 'CLP',
    };
  });

  const sanitizedGoals = goals.map((goal, index) => {
    validateId(errors, `data.goals[${index}].id`, goal.id);
    validateString(errors, `data.goals[${index}].title`, goal.title, { required: true });
    validateString(errors, `data.goals[${index}].priority`, goal.priority);
    validateString(errors, `data.goals[${index}].category`, goal.category);
    validateString(errors, `data.goals[${index}].currency`, goal.currency);
    validateDate(errors, `data.goals[${index}].deadline`, goal.deadline);
    validateDate(errors, `data.goals[${index}].createdAt`, goal.createdAt);

    return {
      id: normalizeId(goal.id),
      title: goal.title,
      target: normalizeAmount(errors, `data.goals[${index}].target`, goal.target),
      current: normalizeAmount(errors, `data.goals[${index}].current`, goal.current ?? 0),
      deadline: goal.deadline || null,
      priority: goal.priority,
      category: goal.category,
      currency: goal.currency || 'CLP',
      createdAt: goal.createdAt,
    };
  });

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  return {
    categories: sanitizedCategories,
    transactions: sanitizedTransactions,
    recurringTransactions: sanitizedRecurringTransactions,
    budgets: sanitizedBudgets,
    goals: sanitizedGoals,
  };
};

export const importData = async (file, { password } = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const oldData = localStorage.getItem('finance_db');
      
      try {
        const parsedJson = JSON.parse(event.target.result);
        const json = parsedJson.encrypted
          ? await decryptJson(parsedJson, password || window.prompt('Ingresa la clave del backup cifrado') || '')
          : parsedJson;
        const validatedData = validateBackup(json);

        await prisma.transaction.deleteMany();
        await prisma.recurringTransaction.deleteMany();
        await prisma.budget.deleteMany();
        await prisma.savingsGoal.deleteMany();
        await prisma.category.deleteMany();

        try {
          for (const cat of validatedData.categories) {
            await prisma.category.create({ data: cat });
          }
          for (const goal of validatedData.goals) {
            await prisma.savingsGoal.create({ data: goal });
          }
          for (const budget of validatedData.budgets) {
            await prisma.budget.create({ data: budget });
          }
          for (const recurringTransaction of validatedData.recurringTransactions) {
            await prisma.recurringTransaction.create({ data: recurringTransaction });
          }
          for (const tx of validatedData.transactions) {
            await prisma.transaction.create({ data: tx });
          }
        } catch (innerError) {
          if (oldData) localStorage.setItem('finance_db', oldData);
          throw new Error(`Fallo parcial durante la creacion: ${innerError.message}. Los datos originales han sido restaurados.`);
        }

        ErrorHandler.success("Copia de seguridad restaurada correctamente.");
        resolve(true);
      } catch (error) {
        ErrorHandler.handle(error, `Error al restaurar backup:\n${error.message}`);
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo de backup."));
    reader.readAsText(file);
  });
};
