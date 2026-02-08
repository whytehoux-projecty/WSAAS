"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAmountAfterTax = exports.calculateTax = exports.validateAmount = exports.calculateMinimumPayment = exports.calculateCreditUtilization = exports.formatLargeNumber = exports.calculateNetTransactionAmount = exports.calculateTransactionVolume = exports.calculateAverageTransactionAmount = exports.calculateBalanceTrend = exports.getRemainingMonthlyLimit = exports.getRemainingDailyLimit = exports.isWithinMonthlyLimit = exports.isWithinDailyLimit = exports.calculateNewBalance = exports.calculateTransactionFee = exports.calculateWireTransferFee = exports.convertCurrency = exports.calculateAPR = exports.calculateTotalInterest = exports.calculateMonthlyPayment = exports.calculateSimpleInterest = exports.calculateCompoundInterest = exports.calculatePercentageChange = exports.calculatePercentage = exports.dollarsToCents = exports.centsToDollars = exports.roundAmount = exports.parseCurrency = exports.formatAmount = exports.formatCurrency = void 0;
const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const formatAmount = (amount, decimals = 2, locale = 'en-US') => {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(amount);
};
exports.formatAmount = formatAmount;
const parseCurrency = (currencyString) => {
    const cleanString = currencyString.replace(/[$,\s]/g, '');
    const amount = parseFloat(cleanString);
    if (isNaN(amount)) {
        throw new Error('Invalid currency format');
    }
    return amount;
};
exports.parseCurrency = parseCurrency;
const roundAmount = (amount, decimals = 2) => {
    return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
};
exports.roundAmount = roundAmount;
const centsToDollars = (cents) => {
    return (0, exports.roundAmount)(cents / 100, 2);
};
exports.centsToDollars = centsToDollars;
const dollarsToCents = (dollars) => {
    return Math.round(dollars * 100);
};
exports.dollarsToCents = dollarsToCents;
const calculatePercentage = (value, total) => {
    if (total === 0)
        return 0;
    return (0, exports.roundAmount)((value / total) * 100, 2);
};
exports.calculatePercentage = calculatePercentage;
const calculatePercentageChange = (oldValue, newValue) => {
    if (oldValue === 0)
        return newValue > 0 ? 100 : 0;
    return (0, exports.roundAmount)(((newValue - oldValue) / oldValue) * 100, 2);
};
exports.calculatePercentageChange = calculatePercentageChange;
const calculateCompoundInterest = (principal, rate, time, compoundingFrequency = 12) => {
    const amount = principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * time);
    return (0, exports.roundAmount)(amount, 2);
};
exports.calculateCompoundInterest = calculateCompoundInterest;
const calculateSimpleInterest = (principal, rate, time) => {
    const interest = principal * rate * time;
    return (0, exports.roundAmount)(interest, 2);
};
exports.calculateSimpleInterest = calculateSimpleInterest;
const calculateMonthlyPayment = (principal, annualRate, years) => {
    const monthlyRate = annualRate / 12;
    const numberOfPayments = years * 12;
    if (monthlyRate === 0) {
        return principal / numberOfPayments;
    }
    const monthlyPayment = principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    return (0, exports.roundAmount)(monthlyPayment, 2);
};
exports.calculateMonthlyPayment = calculateMonthlyPayment;
const calculateTotalInterest = (principal, annualRate, years) => {
    const monthlyPayment = (0, exports.calculateMonthlyPayment)(principal, annualRate, years);
    const totalPaid = monthlyPayment * years * 12;
    return (0, exports.roundAmount)(totalPaid - principal, 2);
};
exports.calculateTotalInterest = calculateTotalInterest;
const calculateAPR = (loanAmount, totalInterest, fees, termInYears) => {
    const totalCost = totalInterest + fees;
    const apr = (totalCost / loanAmount) / termInYears;
    return (0, exports.roundAmount)(apr * 100, 2);
};
exports.calculateAPR = calculateAPR;
const convertCurrency = (amount, exchangeRate, inverse = false) => {
    const convertedAmount = inverse ? amount / exchangeRate : amount * exchangeRate;
    return (0, exports.roundAmount)(convertedAmount, 2);
};
exports.convertCurrency = convertCurrency;
const calculateWireTransferFee = (_amount, isInternational, domesticFee = 25, internationalFee = 45) => {
    return isInternational ? internationalFee : domesticFee;
};
exports.calculateWireTransferFee = calculateWireTransferFee;
const calculateTransactionFee = (amount, feePercentage, minimumFee = 0, maximumFee) => {
    let fee = amount * (feePercentage / 100);
    if (fee < minimumFee) {
        fee = minimumFee;
    }
    if (maximumFee && fee > maximumFee) {
        fee = maximumFee;
    }
    return (0, exports.roundAmount)(fee, 2);
};
exports.calculateTransactionFee = calculateTransactionFee;
const calculateNewBalance = (currentBalance, transactionAmount, transactionType) => {
    const newBalance = transactionType === 'CREDIT'
        ? currentBalance + transactionAmount
        : currentBalance - transactionAmount;
    return (0, exports.roundAmount)(newBalance, 2);
};
exports.calculateNewBalance = calculateNewBalance;
const isWithinDailyLimit = (currentDayTotal, newAmount, dailyLimit) => {
    return (currentDayTotal + newAmount) <= dailyLimit;
};
exports.isWithinDailyLimit = isWithinDailyLimit;
const isWithinMonthlyLimit = (currentMonthTotal, newAmount, monthlyLimit) => {
    return (currentMonthTotal + newAmount) <= monthlyLimit;
};
exports.isWithinMonthlyLimit = isWithinMonthlyLimit;
const getRemainingDailyLimit = (currentDayTotal, dailyLimit) => {
    const remaining = dailyLimit - currentDayTotal;
    return Math.max(0, remaining);
};
exports.getRemainingDailyLimit = getRemainingDailyLimit;
const getRemainingMonthlyLimit = (currentMonthTotal, monthlyLimit) => {
    const remaining = monthlyLimit - currentMonthTotal;
    return Math.max(0, remaining);
};
exports.getRemainingMonthlyLimit = getRemainingMonthlyLimit;
const calculateBalanceTrend = (currentBalance, previousBalance) => {
    if (currentBalance > previousBalance)
        return 'up';
    if (currentBalance < previousBalance)
        return 'down';
    return 'stable';
};
exports.calculateBalanceTrend = calculateBalanceTrend;
const calculateAverageTransactionAmount = (transactions) => {
    if (transactions.length === 0)
        return 0;
    const total = transactions.reduce((sum, amount) => sum + amount, 0);
    return (0, exports.roundAmount)(total / transactions.length, 2);
};
exports.calculateAverageTransactionAmount = calculateAverageTransactionAmount;
const calculateTransactionVolume = (transactions) => {
    const total = transactions.reduce((sum, amount) => sum + Math.abs(amount), 0);
    return (0, exports.roundAmount)(total, 2);
};
exports.calculateTransactionVolume = calculateTransactionVolume;
const calculateNetTransactionAmount = (transactions) => {
    const total = transactions.reduce((sum, amount) => sum + amount, 0);
    return (0, exports.roundAmount)(total, 2);
};
exports.calculateNetTransactionAmount = calculateNetTransactionAmount;
const formatLargeNumber = (num) => {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};
exports.formatLargeNumber = formatLargeNumber;
const calculateCreditUtilization = (currentBalance, creditLimit) => {
    if (creditLimit === 0)
        return 0;
    return (0, exports.roundAmount)((currentBalance / creditLimit) * 100, 2);
};
exports.calculateCreditUtilization = calculateCreditUtilization;
const calculateMinimumPayment = (balance, minimumPercentage = 0.02, minimumAmount = 25) => {
    const percentagePayment = balance * minimumPercentage;
    return Math.max(percentagePayment, minimumAmount);
};
exports.calculateMinimumPayment = calculateMinimumPayment;
const validateAmount = (amount, minAmount = 0.01, maxAmount = 1000000) => {
    if (isNaN(amount) || !isFinite(amount)) {
        return { isValid: false, error: 'Invalid amount format' };
    }
    if (amount < minAmount) {
        return { isValid: false, error: `Amount must be at least ${(0, exports.formatCurrency)(minAmount)}` };
    }
    if (amount > maxAmount) {
        return { isValid: false, error: `Amount cannot exceed ${(0, exports.formatCurrency)(maxAmount)}` };
    }
    return { isValid: true };
};
exports.validateAmount = validateAmount;
const calculateTax = (amount, taxRate) => {
    return (0, exports.roundAmount)(amount * taxRate, 2);
};
exports.calculateTax = calculateTax;
const calculateAmountAfterTax = (amount, taxRate) => {
    const tax = (0, exports.calculateTax)(amount, taxRate);
    return (0, exports.roundAmount)(amount + tax, 2);
};
exports.calculateAmountAfterTax = calculateAmountAfterTax;
//# sourceMappingURL=financial.js.map