/**
 * Format currency amount with proper decimal places and currency symbol
 */
export const formatCurrency = (
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format amount without currency symbol
 */
export const formatAmount = (
  amount: number,
  decimals: number = 2,
  locale: string = "en-US",
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols, spaces, and commas
  const cleanString = currencyString.replace(/[$,\s]/g, "");
  const amount = parseFloat(cleanString);

  if (isNaN(amount)) {
    throw new Error("Invalid currency format");
  }

  return amount;
};

/**
 * Round amount to specified decimal places
 */
export const roundAmount = (amount: number, decimals: number = 2): number => {
  return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Convert cents to dollars
 */
export const centsToDollars = (cents: number): number => {
  return roundAmount(cents / 100, 2);
};

/**
 * Convert dollars to cents
 */
export const dollarsToCents = (dollars: number): number => {
  return Math.round(dollars * 100);
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return roundAmount((value / total) * 100, 2);
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (
  oldValue: number,
  newValue: number,
): number => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return roundAmount(((newValue - oldValue) / oldValue) * 100, 2);
};

/**
 * Calculate compound interest
 */
export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  time: number,
  compoundingFrequency: number = 12,
): number => {
  const amount =
    principal *
    Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * time);
  return roundAmount(amount, 2);
};

/**
 * Calculate simple interest
 */
export const calculateSimpleInterest = (
  principal: number,
  rate: number,
  time: number,
): number => {
  const interest = principal * rate * time;
  return roundAmount(interest, 2);
};

/**
 * Calculate monthly payment for a loan
 */
export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  years: number,
): number => {
  const monthlyRate = annualRate / 12;
  const numberOfPayments = years * 12;

  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }

  const monthlyPayment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return roundAmount(monthlyPayment, 2);
};

/**
 * Calculate total interest paid on a loan
 */
export const calculateTotalInterest = (
  principal: number,
  annualRate: number,
  years: number,
): number => {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, years);
  const totalPaid = monthlyPayment * years * 12;
  return roundAmount(totalPaid - principal, 2);
};

/**
 * Calculate APR (Annual Percentage Rate)
 */
export const calculateAPR = (
  loanAmount: number,
  totalInterest: number,
  fees: number,
  termInYears: number,
): number => {
  const totalCost = totalInterest + fees;
  const apr = totalCost / loanAmount / termInYears;
  return roundAmount(apr * 100, 2);
};

/**
 * Calculate exchange rate conversion
 */
export const convertCurrency = (
  amount: number,
  exchangeRate: number,
  inverse: boolean = false,
): number => {
  const convertedAmount = inverse
    ? amount / exchangeRate
    : amount * exchangeRate;
  return roundAmount(convertedAmount, 2);
};

/**
 * Calculate wire transfer fee
 */
export const calculateWireTransferFee = (
  _amount: number, // Marked as unused with underscore prefix
  isInternational: boolean,
  domesticFee: number = 25,
  internationalFee: number = 45,
): number => {
  return isInternational ? internationalFee : domesticFee;
};

/**
 * Calculate transaction fee based on percentage
 */
export const calculateTransactionFee = (
  amount: number,
  feePercentage: number,
  minimumFee: number = 0,
  maximumFee?: number,
): number => {
  let fee = amount * (feePercentage / 100);

  if (fee < minimumFee) {
    fee = minimumFee;
  }

  if (maximumFee && fee > maximumFee) {
    fee = maximumFee;
  }

  return roundAmount(fee, 2);
};

/**
 * Calculate account balance after transaction
 */
export const calculateNewBalance = (
  currentBalance: number,
  transactionAmount: number,
  transactionType: "DEBIT" | "CREDIT",
): number => {
  const newBalance =
    transactionType === "CREDIT"
      ? currentBalance + transactionAmount
      : currentBalance - transactionAmount;

  return roundAmount(newBalance, 2);
};

/**
 * Check if amount is within daily limit
 */
export const isWithinDailyLimit = (
  currentDayTotal: number,
  newAmount: number,
  dailyLimit: number,
): boolean => {
  return currentDayTotal + newAmount <= dailyLimit;
};

/**
 * Check if amount is within monthly limit
 */
export const isWithinMonthlyLimit = (
  currentMonthTotal: number,
  newAmount: number,
  monthlyLimit: number,
): boolean => {
  return currentMonthTotal + newAmount <= monthlyLimit;
};

/**
 * Calculate remaining daily limit
 */
export const getRemainingDailyLimit = (
  currentDayTotal: number,
  dailyLimit: number,
): number => {
  const remaining = dailyLimit - currentDayTotal;
  return Math.max(0, remaining);
};

/**
 * Calculate remaining monthly limit
 */
export const getRemainingMonthlyLimit = (
  currentMonthTotal: number,
  monthlyLimit: number,
): number => {
  const remaining = monthlyLimit - currentMonthTotal;
  return Math.max(0, remaining);
};

/**
 * Calculate account balance trend
 */
export const calculateBalanceTrend = (
  currentBalance: number,
  previousBalance: number,
): "up" | "down" | "stable" => {
  if (currentBalance > previousBalance) return "up";
  if (currentBalance < previousBalance) return "down";
  return "stable";
};

/**
 * Calculate average transaction amount
 */
export const calculateAverageTransactionAmount = (
  transactions: number[],
): number => {
  if (transactions.length === 0) return 0;

  const total = transactions.reduce((sum, amount) => sum + amount, 0);
  return roundAmount(total / transactions.length, 2);
};

/**
 * Calculate transaction volume
 */
export const calculateTransactionVolume = (transactions: number[]): number => {
  const total = transactions.reduce((sum, amount) => sum + Math.abs(amount), 0);
  return roundAmount(total, 2);
};

/**
 * Calculate net transaction amount
 */
export const calculateNetTransactionAmount = (
  transactions: number[],
): number => {
  const total = transactions.reduce((sum, amount) => sum + amount, 0);
  return roundAmount(total, 2);
};

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

/**
 * Calculate credit utilization ratio
 */
export const calculateCreditUtilization = (
  currentBalance: number,
  creditLimit: number,
): number => {
  if (creditLimit === 0) return 0;
  return roundAmount((currentBalance / creditLimit) * 100, 2);
};

/**
 * Calculate minimum payment for credit account
 */
export const calculateMinimumPayment = (
  balance: number,
  minimumPercentage: number = 0.02,
  minimumAmount: number = 25,
): number => {
  const percentagePayment = balance * minimumPercentage;
  return Math.max(percentagePayment, minimumAmount);
};

/**
 * Validate amount format and range
 */
export const validateAmount = (
  amount: number,
  minAmount: number = 0.01,
  maxAmount: number = 1000000,
): { isValid: boolean; error?: string } => {
  if (isNaN(amount) || !isFinite(amount)) {
    return { isValid: false, error: "Invalid amount format" };
  }

  if (amount < minAmount) {
    return {
      isValid: false,
      error: `Amount must be at least ${formatCurrency(minAmount)}`,
    };
  }

  if (amount > maxAmount) {
    return {
      isValid: false,
      error: `Amount cannot exceed ${formatCurrency(maxAmount)}`,
    };
  }

  return { isValid: true };
};

/**
 * Calculate tax amount
 */
export const calculateTax = (amount: number, taxRate: number): number => {
  return roundAmount(amount * taxRate, 2);
};

/**
 * Calculate amount after tax
 */
export const calculateAmountAfterTax = (
  amount: number,
  taxRate: number,
): number => {
  const tax = calculateTax(amount, taxRate);
  return roundAmount(amount + tax, 2);
};
