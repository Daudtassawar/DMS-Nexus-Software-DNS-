export const CURRENCY_CONFIG = {
  code: 'PKR',
  symbol: '₨',
  locale: 'en-PK',
  decimals: 2
};

/**
 * Formats a numeric value into a currency string.
 * @param {number} amount - The numeric value to format.
 * @param {boolean} showDecimals - Whether to show decimal places (default: true).
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount, showDecimals = true) => {
  const value = amount || 0;
  
  const options = {
    minimumFractionDigits: showDecimals ? CURRENCY_CONFIG.decimals : 0,
    maximumFractionDigits: showDecimals ? CURRENCY_CONFIG.decimals : 0,
  };

  const formattedNumber = new Intl.NumberFormat(CURRENCY_CONFIG.locale, options).format(value);
  
  // Return Symbol + Space + Formatted Number (e.g., ₨ 1,250,000.00)
  return `${CURRENCY_CONFIG.symbol} ${formattedNumber}`;
};

export const CURRENCY_SYMBOL = CURRENCY_CONFIG.symbol;
