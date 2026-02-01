/**
 * Loans Dashboard Component
 * Displays user's loans with status, payments, and real-time updates
 */

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Loan {
    id: string;
    user_id: string;
    type: string;
    principal: number;
    interest_rate: number;
    term_months: number;
    monthly_payment: number;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    application_date: string;
    approval_date?: string;
    disbursement_date?: string;
}

export default function LoansDashboard() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');

    useEffect(() => {
        fetchLoans();

        // Real-time subscription
        const channel = supabase
            .channel('loans-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'loans',
                },
                (payload) => {
                    console.log('Loan changed:', payload);
                    fetchLoans();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchLoans() {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('loans')
                .select('*')
                .order('application_date', { ascending: false });

            if (error) throw error;

            setLoans(data || []);
        } catch (err) {
            console.error('Error fetching loans:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch loans');
        } finally {
            setLoading(false);
        }
    }

    const filteredLoans = loans.filter((loan) => {
        if (filter === 'all') return true;
        return loan.status.toLowerCase() === filter;
    });

    const stats = {
        total: loans.length,
        active: loans.filter((l) => l.status === 'active').length,
        pending: loans.filter((l) => l.status === 'pending').length,
        completed: loans.filter((l) => l.status === 'completed').length,
        totalBorrowed: loans.reduce((sum, l) => sum + l.principal, 0),
        totalPaid: loans.reduce((sum, l) => sum + l.amount_paid, 0),
        totalBalance: loans.reduce((sum, l) => sum + l.balance, 0),
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-UG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            active: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            defaulted: 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading loans...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
                <h3 className="text-red-800 font-semibold">Error Loading Loans</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                    onClick={fetchLoans}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Loans</h1>
                <p className="text-gray-600">Manage and track your loan applications</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-600">Total Borrowed</div>
                    <div className="text-2xl font-bold text-gray-900 mt-2">
                        {formatCurrency(stats.totalBorrowed)}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-600">Total Paid</div>
                    <div className="text-2xl font-bold text-green-600 mt-2">
                        {formatCurrency(stats.totalPaid)}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-600">Balance</div>
                    <div className="text-2xl font-bold text-orange-600 mt-2">
                        {formatCurrency(stats.totalBalance)}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-600">Active Loans</div>
                    <div className="text-2xl font-bold text-blue-600 mt-2">{stats.active}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 mb-6">
                {['all', 'active', 'pending', 'completed'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status as any)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {status !== 'all' && (
                            <span className="ml-2 text-xs">
                                ({stats[status as keyof typeof stats]})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Loans List */}
            {filteredLoans.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No loans found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredLoans.map((loan) => (
                        <div
                            key={loan.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                            {loan.type} Loan
                                        </h3>
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                loan.status
                                            )}`}
                                        >
                                            {loan.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                        <div>
                                            <div className="text-sm text-gray-600">Principal</div>
                                            <div className="font-semibold text-gray-900">
                                                {formatCurrency(loan.principal)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Monthly Payment</div>
                                            <div className="font-semibold text-gray-900">
                                                {formatCurrency(loan.monthly_payment)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Amount Paid</div>
                                            <div className="font-semibold text-green-600">
                                                {formatCurrency(loan.amount_paid)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Balance</div>
                                            <div className="font-semibold text-orange-600">
                                                {formatCurrency(loan.balance)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {loan.status === 'active' && (
                                        <div className="mt-4">
                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                <span>Payment Progress</span>
                                                <span>
                                                    {Math.round((loan.amount_paid / loan.total_amount) * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                                    style={{
                                                        width: `${(loan.amount_paid / loan.total_amount) * 100}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                                        <span>Applied: {formatDate(loan.application_date)}</span>
                                        {loan.disbursement_date && (
                                            <span>Disbursed: {formatDate(loan.disbursement_date)}</span>
                                        )}
                                        <span>{loan.term_months} months @ {loan.interest_rate}%</span>
                                    </div>
                                </div>

                                <button className="ml-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
