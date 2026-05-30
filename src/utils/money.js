export const MAX_TRANSACTION_AMOUNT = 1e9;
export const MAX_BACKUP_AMOUNT = 1e12;

export const roundMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

export const addMoney = (left, right) => roundMoney(roundMoney(left) + roundMoney(right));

export const subtractMoney = (left, right) => roundMoney(roundMoney(left) - roundMoney(right));
