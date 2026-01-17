/**
 * AURUM VAULT - TypeScript Type Definitions
 */

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: Date;
}

export interface Account {
    id: string;
    userId: string;
    type: 'checking' | 'savings' | 'credit' | 'loan';
    accountNumber: string;
    balance: number;
    currency: string;
    status: 'active' | 'inactive' | 'frozen';
    createdAt: Date;
}

export interface Transaction {
    id: string;
    accountId: string;
    type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'fee';
    amount: number;
    currency: string;
    description: string;
    category?: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    date: Date;
    recipient?: string;
    sender?: string;
}

export interface Card {
    id: string;
    userId: string;
    accountId: string;
    cardNumber: string;
    cardType: 'debit' | 'credit';
    expiryDate: string;
    cvv: string;
    status: 'active' | 'blocked' | 'expired';
    limit?: number;
    spent?: number;
}

export interface Beneficiary {
    id: string;
    userId: string;
    name: string;
    accountNumber: string;
    bankName: string;
    verified: boolean;
    createdAt: Date;
}

export interface Bill {
    id: string;
    userId: string;
    payee: string;
    amount: number;
    dueDate: Date;
    status: 'paid' | 'pending' | 'overdue';
    recurring: boolean;
    category: string;
}
