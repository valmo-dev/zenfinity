/**
 * Formate un nombre en devise (format français, 2 décimales).
 * @param {number|string} value
 * @returns {string}
 */
export function formatCurrency(value) {
  return Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
