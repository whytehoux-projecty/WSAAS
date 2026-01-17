/**
 * AURUM VAULT - Constants
 * Central location for all application constants
 */

export const BANK_INFO = {
    name: 'AURUM VAULT',
    tagline: 'Banking Without Boundaries',
    founded: 1888,
    phone: '1-800-AURUM-88',
    email: 'support@aurumvault.com',
} as const;

export const ROUTES = {
    home: '/',
    personalBanking: '/personal-banking',
    businessBanking: '/business-banking',
    about: '/about',
    login: '/e-banking/auth/login',
    signup: '/e-banking/auth/signup',
    forgotPassword: '/e-banking/auth/forgot-password',
    dashboard: '/e-banking/dashboard',
    transfer: '/e-banking/transfer',
    transactions: '/e-banking/transactions',
    accounts: '/e-banking/accounts',
    cards: '/e-banking/cards',
    bills: '/e-banking/bills',
    beneficiaries: '/e-banking/beneficiaries',
    statements: '/e-banking/statements',
    settings: '/e-banking/settings',
    support: '/e-banking/support',
} as const;

export const ACCOUNT_TYPES = {
    checking: 'Checking Account',
    savings: 'Savings Account',
    credit: 'Credit Card',
    loan: 'Personal Loan',
} as const;

export const TRANSACTION_TYPES = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    transfer: 'Transfer',
    payment: 'Payment',
    fee: 'Fee',
} as const;

export const TRANSACTION_STATUS = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
} as const;
