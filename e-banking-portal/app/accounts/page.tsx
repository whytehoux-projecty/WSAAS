'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Wallet,
    PiggyBank,
    CreditCard,
    TrendingUp,
    TrendingDown,
    Eye,
    EyeOff,
    ArrowUpRight,
    ArrowDownLeft,
    MoreVertical,
    Download,
    Lock
} from 'lucide-react';

const accountsData = [
    {
        id: 1,
        name: 'Classic Checking',
        accountNumber: '1234567890',
        maskedNumber: '****5678',
        balance: 5847.32,
        availableBalance: 5847.32,
        type: 'checking',
        icon: <Wallet className="w-8 h-8" />,
        interestRate: '0.15%',
        monthlyChange: +234.50,
        openedDate: '2020-03-15',
        status: 'active',
        recentTransactions: [
            { id: 1, description: 'Grocery Store', amount: -87.45, date: '2026-01-15' },
            { id: 2, description: 'Salary Deposit', amount: +3500.00, date: '2026-01-14' },
            { id: 3, description: 'Electric Bill', amount: -125.30, date: '2026-01-13' },
        ],
    },
    {
        id: 2,
        name: 'Growth Savings',
        accountNumber: '9876543210',
        maskedNumber: '****9012',
        balance: 15420.00,
        availableBalance: 15420.00,
        type: 'savings',
        icon: <PiggyBank className="w-8 h-8" />,
        interestRate: '4.20%',
        monthlyChange: +89.12,
        openedDate: '2019-06-20',
        status: 'active',
        recentTransactions: [
            { id: 1, description: 'Interest Payment', amount: +12.45, date: '2026-01-10' },
            { id: 2, description: 'Transfer from Checking', amount: +500.00, date: '2026-01-12' },
        ],
    },
    {
        id: 3,
        name: 'Rewards Credit Card',
        accountNumber: '5555666677',
        maskedNumber: '****3456',
        balance: -1420.00,
        availableBalance: 8580.00,
        creditLimit: 10000.00,
        type: 'credit',
        icon: <CreditCard className="w-8 h-8" />,
        interestRate: '18.99%',
        monthlyChange: -156.00,
        openedDate: '2021-11-10',
        status: 'active',
        recentTransactions: [
            { id: 1, description: 'Online Purchase - Amazon', amount: -156.78, date: '2026-01-11' },
            { id: 2, description: 'Restaurant', amount: -45.20, date: '2026-01-12' },
            { id: 3, description: 'Gas Station', amount: -52.30, date: '2026-01-10' },
        ],
    },
];

export default function AccountsPage() {
    const [selectedAccount, setSelectedAccount] = useState(accountsData[0]);
    const [showAccountNumber, setShowAccountNumber] = useState(false);

    const totalBalance = accountsData.reduce((sum, acc) => sum + acc.balance, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">My Accounts</h1>
                <p className="text-lg text-charcoal-light">Manage and view details of all your accounts</p>
            </div>

            {/* Total Balance Card */}
            <Card className="bg-gradient-to-br from-vintage-green to-vintage-green-dark text-white shadow-vintage-xl">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-warm-cream/80 mb-2">Total Balance Across All Accounts</p>
                            <h2 className="text-4xl md:text-5xl font-bold font-mono">
                                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                            <p className="text-warm-cream/80 mt-2">{accountsData.length} Active Accounts</p>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                                <Wallet className="w-10 h-10" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Accounts Grid */}
            <div className="grid md:grid-cols-3 gap-4">
                {accountsData.map((account) => (
                    <Card
                        key={account.id}
                        className={`cursor-pointer transition-all hover:shadow-vintage-lg ${selectedAccount.id === account.id ? 'ring-2 ring-vintage-green' : ''
                            }`}
                        onClick={() => setSelectedAccount(account)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${account.type === 'checking' ? 'bg-vintage-green/10 text-vintage-green' :
                                        account.type === 'savings' ? 'bg-soft-gold/10 text-soft-gold-dark' :
                                            'bg-charcoal/10 text-charcoal'
                                    }`}>
                                    {account.icon}
                                </div>
                                <button className="text-charcoal-light hover:text-charcoal transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                            <h3 className="font-semibold text-charcoal mb-1">{account.name}</h3>
                            <p className="text-sm text-charcoal-light font-mono mb-4">{account.maskedNumber}</p>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-charcoal-light">
                                        {account.type === 'credit' ? 'Current Balance' : 'Balance'}
                                    </p>
                                    <p className={`text-2xl font-bold font-mono ${account.balance < 0 ? 'text-red-600' : 'text-vintage-green'
                                        }`}>
                                        ${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                {account.type === 'credit' && (
                                    <div>
                                        <p className="text-xs text-charcoal-light">Available Credit</p>
                                        <p className="text-sm font-semibold text-charcoal">
                                            ${account.availableBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm pt-2">
                                    {account.monthlyChange > 0 ? (
                                        <>
                                            <TrendingUp className="w-4 h-4 text-vintage-green" />
                                            <span className="text-vintage-green">+${account.monthlyChange.toFixed(2)}</span>
                                        </>
                                    ) : (
                                        <>
                                            <TrendingDown className="w-4 h-4 text-red-600" />
                                            <span className="text-red-600">${Math.abs(account.monthlyChange).toFixed(2)}</span>
                                        </>
                                    )}
                                    <span className="text-charcoal-light">this month</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Account Details */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{selectedAccount.name}</CardTitle>
                                    <CardDescription>Account Details and Information</CardDescription>
                                </div>
                                <Button variant="outline" size="small" icon={<Download className="w-4 h-4" />}>
                                    Statement
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Account Number */}
                            <div className="flex items-center justify-between p-4 bg-parchment rounded-lg">
                                <div>
                                    <p className="text-sm text-charcoal-light mb-1">Account Number</p>
                                    <p className="text-lg font-mono font-semibold text-charcoal">
                                        {showAccountNumber ? selectedAccount.accountNumber : selectedAccount.maskedNumber}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                >
                                    {showAccountNumber ? (
                                        <EyeOff className="w-5 h-5 text-charcoal-light" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-charcoal-light" />
                                    )}
                                </button>
                            </div>

                            {/* Account Info Grid */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-off-white rounded-lg">
                                    <p className="text-sm text-charcoal-light mb-1">Account Type</p>
                                    <p className="font-semibold text-charcoal capitalize">{selectedAccount.type}</p>
                                </div>
                                <div className="p-4 bg-off-white rounded-lg">
                                    <p className="text-sm text-charcoal-light mb-1">Status</p>
                                    <p className="font-semibold text-vintage-green capitalize">{selectedAccount.status}</p>
                                </div>
                                <div className="p-4 bg-off-white rounded-lg">
                                    <p className="text-sm text-charcoal-light mb-1">Interest Rate</p>
                                    <p className="font-semibold text-charcoal">{selectedAccount.interestRate} APY</p>
                                </div>
                                <div className="p-4 bg-off-white rounded-lg">
                                    <p className="text-sm text-charcoal-light mb-1">Opened Date</p>
                                    <p className="font-semibold text-charcoal">
                                        {new Date(selectedAccount.openedDate).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                                {selectedAccount.type === 'credit' && (
                                    <>
                                        <div className="p-4 bg-off-white rounded-lg">
                                            <p className="text-sm text-charcoal-light mb-1">Credit Limit</p>
                                            <p className="font-semibold text-charcoal">
                                                ${selectedAccount.creditLimit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-off-white rounded-lg">
                                            <p className="text-sm text-charcoal-light mb-1">Credit Utilization</p>
                                            <p className="font-semibold text-charcoal">
                                                {((Math.abs(selectedAccount.balance) / (selectedAccount.creditLimit || 1)) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Balance Breakdown */}
                            <div className="p-6 bg-gradient-to-br from-vintage-green/5 to-soft-gold/5 rounded-lg border border-vintage-green/10">
                                <h3 className="font-semibold text-charcoal mb-4">Balance Breakdown</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-charcoal-light">
                                            {selectedAccount.type === 'credit' ? 'Current Balance' : 'Current Balance'}
                                        </span>
                                        <span className="text-xl font-bold text-charcoal font-mono">
                                            ${Math.abs(selectedAccount.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-charcoal-light">
                                            {selectedAccount.type === 'credit' ? 'Available Credit' : 'Available Balance'}
                                        </span>
                                        <span className="text-lg font-semibold text-vintage-green font-mono">
                                            ${selectedAccount.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    {selectedAccount.type === 'credit' && (
                                        <div className="pt-3 border-t border-vintage-green/10">
                                            <div className="flex justify-between items-center">
                                                <span className="text-charcoal-light">Credit Limit</span>
                                                <span className="font-semibold text-charcoal font-mono">
                                                    ${selectedAccount.creditLimit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Transactions</CardTitle>
                                <Button variant="ghost" size="small">
                                    View All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-faded-gray-light">
                                {selectedAccount.recentTransactions.map((transaction) => (
                                    <div key={transaction.id} className="p-4 hover:bg-parchment transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.amount > 0 ? 'bg-vintage-green/10' : 'bg-red-50'
                                                    }`}>
                                                    {transaction.amount > 0 ? (
                                                        <ArrowDownLeft className="w-5 h-5 text-vintage-green" />
                                                    ) : (
                                                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-charcoal">{transaction.description}</p>
                                                    <p className="text-sm text-charcoal-light">
                                                        {new Date(transaction.date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className={`text-lg font-bold font-mono ${transaction.amount > 0 ? 'text-vintage-green' : 'text-charcoal'
                                                }`}>
                                                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="primary" size="medium" className="w-full" icon={<ArrowUpRight className="w-5 h-5" />}>
                                Transfer Money
                            </Button>
                            <Button variant="outline" size="medium" className="w-full" icon={<Download className="w-5 h-5" />}>
                                Download Statement
                            </Button>
                            <Button variant="outline" size="medium" className="w-full" icon={<Lock className="w-5 h-5" />}>
                                Freeze Card
                            </Button>
                            <Button variant="ghost" size="medium" className="w-full">
                                View All Transactions
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Account Tips */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Account Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedAccount.type === 'savings' && (
                                <div className="p-4 bg-vintage-green/5 rounded-lg border border-vintage-green/20">
                                    <p className="text-sm text-charcoal">
                                        💡 You're earning <strong>{selectedAccount.interestRate}</strong> on this account. Keep saving to maximize your returns!
                                    </p>
                                </div>
                            )}
                            {selectedAccount.type === 'credit' && (
                                <div className="p-4 bg-soft-gold/10 rounded-lg border border-soft-gold/20">
                                    <p className="text-sm text-charcoal">
                                        💳 Your credit utilization is{' '}
                                        <strong>
                                            {((Math.abs(selectedAccount.balance) / (selectedAccount.creditLimit || 1)) * 100).toFixed(1)}%
                                        </strong>
                                        . Keep it below 30% for optimal credit score.
                                    </p>
                                </div>
                            )}
                            {selectedAccount.type === 'checking' && (
                                <div className="p-4 bg-soft-gold/10 rounded-lg border border-soft-gold/20">
                                    <p className="text-sm text-charcoal">
                                        ✨ Set up automatic transfers to your savings account to build your emergency fund!
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
