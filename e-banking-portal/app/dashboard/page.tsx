'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    Send,
    QrCode,
    Receipt,
    Users,
} from 'lucide-react';

interface Account {
    id: string;
    accountNumber: string;
    accountType: string;
    balance: number;
    currency: string;
}

interface Transaction {
    id: string;
    type: 'credit' | 'debit';
    description: string;
    amount: number;
    date: string;
    category: string;
}

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
}

import { api, setAccessToken } from '@/lib/api-client';

// ... (interfaces remain the same)

import { Suspense } from 'react';

// ... (keep usage of api and setAccessToken)

function DashboardContent() {
    // ... (existing logic: const searchParams = useSearchParams(); etc.)
    const searchParams = useSearchParams();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Handle token from login redirect
        const token = searchParams.get('token');
        if (token) {
            setAccessToken(token);
            // Clean URL
            window.history.replaceState({}, '', '/dashboard');
        }

        // Load dashboard data
        loadDashboardData();
    }, [searchParams]);

    const loadDashboardData = async () => {
        try {
            // Fetch user profile
            const profileData = await api.profile.get();
            setUser(profileData.user);

            // Fetch accounts
            try {
                const accountsData = await api.accounts.getAll();
                const accountsList = accountsData.data?.accounts || accountsData.accounts || [];
                setAccounts(accountsList);

                // Calculate total balance
                const total = accountsList.reduce((sum: number, acc: Account) => sum + (acc.balance || 0), 0);
                setTotalBalance(total);
            } catch (e) {
                console.log('Accounts not available yet');
            }

            // Fetch recent transactions
            try {
                const txData = await api.transactions.getAll({ limit: 5 });
                setTransactions(txData.data?.transactions || txData.transactions || []);
            } catch (e) {
                console.log('Transactions not available yet');
            }

        } catch (error) {
            console.error('Error loading dashboard:', error);
            // If explicit unauthorized, redirect will happen via api-client interceptor
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        }).format(amount);
    };

    const quickActions = [
        { icon: Send, label: 'Transfer', href: '/transfer', color: 'bg-blue-500' },
        { icon: QrCode, label: 'Pay', href: '/bills', color: 'bg-green-500' },
        { icon: Receipt, label: 'Statements', href: '/statements', color: 'bg-purple-500' },
        { icon: Users, label: 'Beneficiaries', href: '/beneficiaries', color: 'bg-orange-500' },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-2xl p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">
                    Welcome back, {user?.firstName || 'User'}!
                </h1>
                <p className="text-green-100 text-sm">
                    Here&apos;s an overview of your accounts and recent activity.
                </p>
            </div>

            {/* Total Balance Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Balance</p>
                        <h2 className="text-3xl font-bold text-gray-900">
                            {formatCurrency(totalBalance)}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>+2.5%</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
                {quickActions.map((action) => (
                    <a
                        key={action.label}
                        href={action.href}
                        className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className={`${action.color} p-3 rounded-xl text-white mb-2`}>
                            <action.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{action.label}</span>
                    </a>
                ))}
            </div>

            {/* Accounts Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">My Accounts</h3>
                    <a href="/accounts" className="text-sm text-green-600 hover:underline">
                        View All
                    </a>
                </div>
                {accounts.length > 0 ? (
                    <div className="space-y-3">
                        {accounts.slice(0, 3).map((account) => (
                            <div
                                key={account.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CreditCard className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{account.accountType}</p>
                                        <p className="text-sm text-gray-500">****{account.accountNumber.slice(-4)}</p>
                                    </div>
                                </div>
                                <p className="font-semibold text-gray-900">
                                    {formatCurrency(account.balance, account.currency)}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">No accounts found</p>
                )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                    <a href="/transactions" className="text-sm text-green-600 hover:underline">
                        View All
                    </a>
                </div>
                {transactions.length > 0 ? (
                    <div className="space-y-3">
                        {transactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between p-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {tx.type === 'credit' ? (
                                            <ArrowDownLeft className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{tx.description}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <p className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">No recent transactions</p>
                )}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
