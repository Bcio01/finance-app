export function formatCurrency(amount, currency = "CLP", locale = "es-CL") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "CLP" ? 0 : 2,
    minimumFractionDigits: currency === "CLP" ? 0 : 2,
  }).format(amount);
}
