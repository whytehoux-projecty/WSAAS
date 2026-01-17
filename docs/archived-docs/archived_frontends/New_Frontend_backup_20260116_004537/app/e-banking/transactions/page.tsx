'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Filter,
    Download,
    Calendar,
    X
} from 'lucide-react';

const allTransactions = [
    {
        id: 1,
        description: 'Grocery Store - Whole Foods',
        amount: -87.45,
        date: '2026-01-15',
        category: 'Shopping',
        status: 'completed',
        account: 'Classic Checking',
        type: 'debit',
    },
    {
        id: 2,
        description: 'Salary Deposit - Acme Corp',
        amount: +3500.00,
        date: '2026-01-14',
        category: 'Income',
        status: 'completed',
        account: 'Classic Checking',
        type: 'credit',
    },
    {
        id: 3,
        description: 'Electric Bill - City Power',
        amount: -125.30,
        date: '2026-01-13',
        category: 'Utilities',
        status: 'completed',
        account: 'Classic Checking',
        type: 'debit',
    },
    {
        id: 4,
        description: 'Restaurant - The Vintage Cafe',
        amount: -45.20,
        date: '2026-01-12',
        category: 'Dining',
        status: 'completed',
        account: 'Classic Checking',
        type: 'debit',
    },
    {
        id: 5,
        description: 'Transfer to Savings',
        amount: -500.00,
        date: '2026-01-12',
        category: 'Transfer',
        status: 'completed',
        account: 'Classic Checking',
        type: 'transfer',
    },
    {
        id: 6,
        description: 'Online Purchase - Amazon',
        amount: -156.78,
        date: '2026-01-11',
        category: 'Shopping',
        status: 'completed',
        account: 'Rewards Credit Card',
        type: 'debit',
    },
    {
        id: 7,
        description: 'Gas Station - Shell',
        amount: -52.30,
        date: '2026-01-10',
        category: 'Transportation',
        status: 'completed',
        account: 'Classic Checking',
        type: 'debit',
    },
    {
        id: 8,
        description: 'Interest Payment',
        amount: +12.45,
        date: '2026-01-10',
        category: 'Interest',
        status: 'completed',
        account: 'Growth Savings',
        type: 'credit',
    },
    {
        id: 9,
        description: 'Coffee Shop - Starbucks',
        amount: -6.75,
        date: '2026-01-09',
        category: 'Dining',
        status: 'completed',
        account: 'Classic Checking',
        type: 'debit',
    },
    {
        id: 10,
        description: 'Gym Membership - FitLife',
        amount: -49.99,
        date: '2026-01-08',
        category: 'Health',
        status: 'completed',
        account: 'Classic Checking',
        type: 'debit',
    },
    {
        id: 11,
        description: 'Freelance Payment',
        amount: +850.00,
        date: '2026-01-07',
        category: 'Income',
        status: 'completed',
        account: 'Classic Checking',
        type: 'credit',
    },
    {
        id: 12,
        description: 'Pharmacy - CVS',
        amount: -34.50,
        date: '2026-01-06',
        category: 'Health',
        status: 'completed',
        account: 'Classic Checking',
        type: 'debit',
    },
];

const categories = ['All', 'Income', 'Shopping', 'Dining', 'Utilities', 'Transportation', 'Health', 'Transfer', 'Interest'];
const accounts = ['All Accounts', 'Classic Checking', 'Growth Savings', 'Rewards Credit Card'];

export default function TransactionsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedAccount, setSelectedAccount] = useState('All Accounts');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const filteredTransactions = allTransactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || transaction.category === selectedCategory;
        const matchesAccount = selectedAccount === 'All Accounts' || transaction.account === selectedAccount;
        const matchesDateFrom = !dateFrom || new Date(transaction.date) >= new Date(dateFrom);
        const matchesDateTo = !dateTo || new Date(transaction.date) <= new Date(dateTo);

        return matchesSearch && matchesCategory && matchesAccount && matchesDateFrom && matchesDateTo;
    });

    const totalIncome = filteredTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setSelectedAccount('All Accounts');
        setDateFrom('');
        setDateTo('');
    };

    const handleExport = () => {
        // Simulate export
        alert('Exporting transactions to CSV...');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">Transactions</h1>
                    <p className="text-lg text-charcoal-light">View and manage your transaction history</p>
                </div>
                <Button variant="outline" size="medium" icon={<Download className="w-5 h-5" />} onClick={handleExport}>
                    Export
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-charcoal-light mb-1">Total Transactions</p>
                        <p className="text-3xl font-bold text-charcoal">{filteredTransactions.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-vintage-green/10 to-vintage-green/5 border-vintage-green/20">
                    <CardContent className="p-6">
                        <p className="text-sm text-charcoal-light mb-1">Total Income</p>
                        <p className="text-3xl font-bold text-vintage-green font-mono">+${totalIncome.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-50/50 border-red-100">
                    <CardContent className="p-6">
                        <p className="text-sm text-charcoal-light mb-1">Total Expenses</p>
                        <p className="text-3xl font-bold text-red-600 font-mono">-${totalExpenses.toFixed(2)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    icon={<Search className="w-5 h-5" />}
                                />
                            </div>
                            <Button
                                variant={showFilters ? 'primary' : 'outline'}
                                size="medium"
                                icon={<Filter className="w-5 h-5" />}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                Filters
                            </Button>
                        </div>

                        {/* Filter Panel */}
                        {showFilters && (
                            <div className="pt-4 border-t border-faded-gray-light space-y-4">
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-sm font-semibold text-charcoal mb-2">Category</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Account Filter */}
                                    <div>
                                        <label className="block text-sm font-semibold text-charcoal mb-2">Account</label>
                                        <select
                                            value={selectedAccount}
                                            onChange={(e) => setSelectedAccount(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                                        >
                                            {accounts.map((acc) => (
                                                <option key={acc} value={acc}>{acc}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date From */}
                                    <div>
                                        <label className="block text-sm font-semibold text-charcoal mb-2">From Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Date To */}
                                    <div>
                                        <label className="block text-sm font-semibold text-charcoal mb-2">To Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => setDateTo(e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button variant="ghost" size="small" icon={<X className="w-4 h-4" />} onClick={handleClearFilters}>
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Transactions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                        Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredTransactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-charcoal-light">No transactions found matching your filters</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-faded-gray-light">
                            {filteredTransactions.map((transaction) => (
                                <div key={transaction.id} className="p-4 hover:bg-parchment transition-colors cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${transaction.amount > 0 ? 'bg-vintage-green/10' : 'bg-red-50'
                                                }`}>
                                                {transaction.amount > 0 ? (
                                                    <ArrowDownLeft className="w-6 h-6 text-vintage-green" />
                                                ) : (
                                                    <ArrowUpRight className="w-6 h-6 text-red-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-charcoal truncate">{transaction.description}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-sm text-charcoal-light">{transaction.account}</span>
                                                    <span className="text-sm text-charcoal-light">•</span>
                                                    <span className="text-sm text-charcoal-light">{transaction.category}</span>
                                                    <span className="text-sm text-charcoal-light">•</span>
                                                    <span className="text-sm text-charcoal-light flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(transaction.date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className={`text-xl font-bold font-mono ${transaction.amount > 0 ? 'text-vintage-green' : 'text-charcoal'
                                                }`}>
                                                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-charcoal-light capitalize mt-1">{transaction.status}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
