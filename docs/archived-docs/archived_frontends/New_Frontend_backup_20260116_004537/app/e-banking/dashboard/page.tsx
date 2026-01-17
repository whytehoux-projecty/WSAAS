'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const accounts = [
    {
        id: 1,
        name: 'Classic Checking',
        accountNumber: '****5678',
        balance: 5847.32,
        type: 'checking',
        change: +234.50,
    },
    {
        id: 2,
        name: 'Growth Savings',
        accountNumber: '****9012',
        balance: 15420.00,
        type: 'savings',
        change: +89.12,
    },
    {
        id: 3,
        name: 'Rewards Credit Card',
        accountNumber: '****3456',
        balance: -1420.00,
        type: 'credit',
        change: -156.00,
    },
];

const recentTransactions = [
    {
        id: 1,
        description: 'Grocery Store',
        amount: -87.45,
        date: '2026-01-15',
        category: 'Shopping',
        status: 'completed',
    },
    {
        id: 2,
        description: 'Salary Deposit',
        amount: +3500.00,
        date: '2026-01-14',
        category: 'Income',
        status: 'completed',
    },
    {
        id: 3,
        description: 'Electric Bill',
        amount: -125.30,
        date: '2026-01-13',
        category: 'Utilities',
        status: 'completed',
    },
    {
        id: 4,
        description: 'Restaurant',
        amount: -45.20,
        date: '2026-01-12',
        category: 'Dining',
        status: 'completed',
    },
    {
        id: 5,
        description: 'Transfer to Savings',
        amount: -500.00,
        date: '2026-01-12',
        category: 'Transfer',
        status: 'completed',
    },
];

const quickActions = [
    {
        id: 1,
        title: 'Transfer Money',
        description: 'Send money to another account',
        icon: '/images/icons/transfer-icon-arrows.svg',
        href: '/e-banking/transfer',
        color: 'bg-vintage-green',
    },
    {
        id: 2,
        title: 'Pay Bills',
        description: 'Pay your bills quickly',
        icon: '/images/icons/autopay-icon.svg',
        href: '/e-banking/bills',
        color: 'bg-soft-gold-dark',
    },
    {
        id: 3,
        title: 'View Cards',
        description: 'Manage your cards',
        icon: '/images/icons/credit-card-icon.svg',
        href: '/e-banking/cards',
        color: 'bg-charcoal',
    },
];

export default function DashboardPage() {
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <div className="w-full h-48 relative rounded-2xl overflow-hidden mb-8 shadow-vintage-lg">
                    <Image
                        src="/images/portal/dashboard-welcome-banner.png"
                        alt="Welcome"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 to-transparent flex flex-col justify-center px-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Welcome back, John! 👋
                        </h1>
                        <p className="text-lg text-warm-cream/90">
                            Here&apos;s what&apos;s happening with your accounts today
                        </p>
                    </div>
                </div>
            </div>

            {/* Total Balance Card */}
            <Card className="bg-gradient-to-br from-vintage-green to-vintage-green-dark text-white shadow-vintage-xl">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-warm-cream/80 mb-2">Total Balance</p>
                            <h2 className="text-4xl md:text-5xl font-bold font-mono">
                                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                            <p className="text-warm-cream/80 mt-2 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                <span>+2.5% from last month</span>
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                                <DollarSign className="w-12 h-12" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold text-charcoal mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                        <Link key={action.id} href={action.href}>
                            <Card className="hover:shadow-vintage-lg transition-all cursor-pointer group">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-lg ${action.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <Image
                                                src={action.icon}
                                                alt={action.title}
                                                width={24}
                                                height={24}
                                                className="w-6 h-6"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-charcoal mb-1">{action.title}</h3>
                                            <p className="text-sm text-charcoal-light">{action.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Accounts Overview */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-charcoal">Your Accounts</h2>
                    <Link href="/e-banking/accounts">
                        <Button variant="outline" size="small">
                            View All
                        </Button>
                    </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    {accounts.map((account) => (
                        <Card key={account.id} className="hover:shadow-vintage-lg transition-all">
                            <CardHeader>
                                <CardTitle className="text-lg">{account.name}</CardTitle>
                                <CardDescription className="font-mono">{account.accountNumber}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-charcoal-light mb-1">Balance</p>
                                        <p className={`text-2xl font-bold font-mono ${account.balance < 0 ? 'text-red-600' : 'text-vintage-green'}`}>
                                            ${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        {account.change > 0 ? (
                                            <>
                                                <TrendingUp className="w-4 h-4 text-vintage-green" />
                                                <span className="text-vintage-green">+${account.change.toFixed(2)}</span>
                                            </>
                                        ) : (
                                            <>
                                                <TrendingDown className="w-4 h-4 text-red-600" />
                                                <span className="text-red-600">${Math.abs(account.change).toFixed(2)}</span>
                                            </>
                                        )}
                                        <span className="text-charcoal-light">this month</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Recent Transactions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-charcoal">Recent Transactions</h2>
                    <Link href="/e-banking/transactions">
                        <Button variant="outline" size="small">
                            View All
                        </Button>
                    </Link>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y divide-faded-gray-light">
                            {recentTransactions.map((transaction) => {
                                const categoryIcons: Record<string, string> = {
                                    'Shopping': '/images/icons/category-shopping.svg',
                                    'Utilities': '/images/icons/category-utilities.svg',
                                    'Dining': '/images/icons/category-dining.svg',
                                    'Transfer': '/images/icons/transfer-icon-arrows.svg',
                                };
                                const iconPath = categoryIcons[transaction.category];

                                return (
                                    <div key={transaction.id} className="p-4 hover:bg-parchment transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.amount > 0 ? 'bg-vintage-green/10' : 'bg-red-50'
                                                    }`}>
                                                    {iconPath ? (
                                                        <Image
                                                            src={iconPath}
                                                            alt={transaction.category}
                                                            width={20}
                                                            height={20}
                                                            className="w-5 h-5"
                                                        />
                                                    ) : transaction.amount > 0 ? (
                                                        <ArrowDownLeft className="w-5 h-5 text-vintage-green" />
                                                    ) : (
                                                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-charcoal">{transaction.description}</p>
                                                    <p className="text-sm text-charcoal-light">{transaction.category} • {transaction.date}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-semibold font-mono ${transaction.amount > 0 ? 'text-vintage-green' : 'text-charcoal'
                                                    }`}>
                                                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                                                </p>
                                                <p className="text-xs text-charcoal-light capitalize">{transaction.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Insights */}
            <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-soft-gold/10 to-soft-gold/5 border-soft-gold/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-soft-gold-dark" />
                            Spending Insight
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-charcoal-light mb-2">
                            You&apos;ve spent <strong className="text-charcoal">$1,247</strong> this month
                        </p>
                        <p className="text-sm text-charcoal-light">
                            That&apos;s 15% less than last month. Great job! 🎉
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-vintage-green/10 to-vintage-green/5 border-vintage-green/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-vintage-green" />
                            Savings Goal
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-charcoal-light mb-2">
                            You&apos;re <strong className="text-charcoal">$420</strong> away from your goal
                        </p>
                        <div className="w-full bg-faded-gray-light rounded-full h-2 mb-2">
                            <div className="bg-vintage-green h-2 rounded-full w-[72%]"></div>
                        </div>
                        <p className="text-sm text-charcoal-light">72% complete</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
