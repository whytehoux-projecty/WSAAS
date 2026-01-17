'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { api } from '@/lib/api-client';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Filter,
    Download,
    Calendar,
    X,
    Edit2,
    Check
} from 'lucide-react';

const categories = [
    'General',
    'Income',
    'Shopping',
    'Dining',
    'Utilities',
    'Transportation',
    'Health',
    'Transfer',
    'Interest',
    'Groceries',
    'Entertainment',
    'Services'
];

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [editingTxId, setEditingTxId] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            // Fetch all for client-side filtering (MVP approach), or implement server-side params
            // For now, let's fetch with limit 100 to get a good chunk
            const response = await api.transactions.getAll({ limit: 100 });
            setTransactions(response.transactions || []);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCategory = async (txId: string) => {
        if (!editingCategory) return;
        try {
            await api.transactions.updateCategory(txId, editingCategory);
            // Update local state
            setTransactions(prev => prev.map(tx =>
                tx.id === txId ? { ...tx, category: editingCategory } : tx
            ));
            setEditingTxId(null);
        } catch (error) {
            console.error('Failed to update category', error);
            alert('Failed to update category. Please try again.');
        }
    };

    const startEditing = (tx: any) => {
        setEditingTxId(tx.id);
        setEditingCategory(tx.category || 'General');
    };

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = (transaction.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || transaction.category === selectedCategory;
        const txDate = new Date(transaction.createdAt || transaction.date);
        const matchesDateFrom = !dateFrom || txDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || txDate <= new Date(dateTo);

        return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
    });

    const totalIncome = filteredTransactions
        .filter(t => t.type === 'DEPOSIT' || t.amount > 0)
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = filteredTransactions
        .filter(t => t.type === 'WITHDRAWAL' || t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setDateFrom('');
        setDateTo('');
    };

    const handleExport = () => {
        // CSV Export logic
        const headers = ['Date', 'Description', 'Type', 'Category', 'Amount', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredTransactions.map(tx => [
                new Date(tx.createdAt || tx.date).toLocaleDateString(),
                `"${tx.description}"`,
                tx.type,
                tx.category || 'Uncategorized',
                tx.amount,
                tx.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <div className="p-8 text-center text-vintage-gold animate-pulse">Loading transaction history...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2 font-heading">Transactions</h1>
                    <p className="text-lg text-charcoal-light">View and manage your transaction history</p>
                </div>
                <Button variant="outline" size="medium" icon={<Download className="w-5 h-5" />} onClick={handleExport}>
                    Export CSV
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
                                            aria-label="Select Category"
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                                        >
                                            <option value="All">All Categories</option>
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date From */}
                                    <div>
                                        <label className="block text-sm font-semibold text-charcoal mb-2">From Date</label>
                                        <div className="relative">
                                            <input
                                                aria-label="Date from"
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
                                                aria-label="Date to"
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
                                <div key={transaction.id} className="p-4 hover:bg-parchment transition-colors dropdown-container">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${Number(transaction.amount) > 0 ? 'bg-vintage-green/10' : 'bg-red-50'
                                                }`}>
                                                {Number(transaction.amount) > 0 ? (
                                                    <ArrowDownLeft className="w-6 h-6 text-vintage-green" />
                                                ) : (
                                                    <ArrowUpRight className="w-6 h-6 text-red-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-charcoal truncate">{transaction.description}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-sm text-charcoal-light">{transaction.account?.accountType || 'Account'}</span>
                                                    <span className="text-sm text-charcoal-light">•</span>

                                                    {/* Editable Category */}
                                                    {editingTxId === transaction.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                aria-label="Edit Category"
                                                                value={editingCategory}
                                                                onChange={(e) => setEditingCategory(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="text-sm border border-vintage-gold rounded px-2 py-1 focus:outline-none bg-white font-medium text-vintage-gold"
                                                                autoFocus
                                                            >
                                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                            <button
                                                                aria-label="Save Category"
                                                                onClick={(e) => { e.stopPropagation(); handleUpdateCategory(transaction.id); }}
                                                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                            <button
                                                                aria-label="Cancel Edit"
                                                                onClick={(e) => { e.stopPropagation(); setEditingTxId(null); }}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); startEditing(transaction); }}
                                                            className="text-sm text-charcoal-light hover:text-vintage-gold flex items-center gap-1 group/cat transition-colors border-b border-transparent hover:border-vintage-gold/30"
                                                            title="Click to edit category"
                                                        >
                                                            {transaction.category || 'Uncategorized'}
                                                            <Edit2 size={10} className="opacity-0 group-hover/cat:opacity-100 transition-opacity" />
                                                        </button>
                                                    )}

                                                    <span className="text-sm text-charcoal-light">•</span>
                                                    <span className="text-sm text-charcoal-light flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(transaction.createdAt || transaction.date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className={`text-xl font-bold font-mono ${Number(transaction.amount) > 0 ? 'text-vintage-green' : 'text-charcoal'
                                                }`}>
                                                {Number(transaction.amount) > 0 ? '+' : ''}${Math.abs(Number(transaction.amount)).toFixed(2)}
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
