import { useSettingsStore } from '../store/settingsStore';
import { formatCurrency } from '../utils/currencyFormatter';

export const currencyLocales = {
  CLP: "es-CL",
  USD: "en-US",
  EUR: "de-DE",
};

const currencyPlaceholders = {
  CLP: "0",
  USD: "0.00",
  EUR: "0,00",
};

export const useCurrency = () => {
  const { currency, locale } = useSettingsStore();

  const format = (amount) => {
    return formatCurrency(amount, currency, locale || currencyLocales[currency] || 'es-CL');
  };

  return {
    currency,
    locale: locale || currencyLocales[currency] || 'es-CL',
    amountPlaceholder: currencyPlaceholders[currency] || "0.00",
    format
  };
};
