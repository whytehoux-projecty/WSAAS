'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    FileText,
    Download,
    Mail,
    Calendar,
    Eye,
    Filter
} from 'lucide-react';

const statementsData = [
    {
        id: 1,
        month: 'December 2025',
        account: 'Classic Checking',
        accountNumber: '****5678',
        period: 'Dec 1 - Dec 31, 2025',
        transactions: 45,
        startingBalance: 5612.82,
        endingBalance: 5847.32,
        deposits: 3500.00,
        withdrawals: 3265.50,
        fileSize: '245 KB',
    },
    {
        id: 2,
        month: 'November 2025',
        account: 'Classic Checking',
        accountNumber: '****5678',
        period: 'Nov 1 - Nov 30, 2025',
        transactions: 52,
        startingBalance: 5234.20,
        endingBalance: 5612.82,
        deposits: 4200.00,
        withdrawals: 3821.38,
        fileSize: '268 KB',
    },
    {
        id: 3,
        month: 'December 2025',
        account: 'Growth Savings',
        accountNumber: '****9012',
        period: 'Dec 1 - Dec 31, 2025',
        transactions: 8,
        startingBalance: 14920.00,
        endingBalance: 15420.00,
        deposits: 512.45,
        withdrawals: 12.45,
        fileSize: '156 KB',
    },
    {
        id: 4,
        month: 'November 2025',
        account: 'Growth Savings',
        accountNumber: '****9012',
        period: 'Nov 1 - Nov 30, 2025',
        transactions: 6,
        startingBalance: 14500.00,
        endingBalance: 14920.00,
        deposits: 432.18,
        withdrawals: 12.18,
        fileSize: '142 KB',
    },
    {
        id: 5,
        month: 'December 2025',
        account: 'Rewards Credit Card',
        accountNumber: '****3456',
        period: 'Dec 1 - Dec 31, 2025',
        transactions: 28,
        startingBalance: -1264.00,
        endingBalance: -1420.00,
        deposits: 0,
        withdrawals: 156.00,
        fileSize: '198 KB',
    },
    {
        id: 6,
        month: 'October 2025',
        account: 'Classic Checking',
        accountNumber: '****5678',
        period: 'Oct 1 - Oct 31, 2025',
        transactions: 48,
        startingBalance: 4892.15,
        endingBalance: 5234.20,
        deposits: 3700.00,
        withdrawals: 3357.95,
        fileSize: '252 KB',
    },
];

const accountOptions = ['All Accounts', 'Classic Checking', 'Growth Savings', 'Rewards Credit Card'];
const yearOptions = ['2025', '2024', '2023'];

export default function StatementsPage() {
    const [selectedAccount, setSelectedAccount] = useState('All Accounts');
    const [selectedYear, setSelectedYear] = useState('2025');
    const [showFilters, setShowFilters] = useState(false);

    const filteredStatements = statementsData.filter(statement => {
        const matchesAccount = selectedAccount === 'All Accounts' || statement.account === selectedAccount;
        const matchesYear = statement.period.includes(selectedYear);
        return matchesAccount && matchesYear;
    });

    const handleDownload = (statementId: number) => {
        alert(`Downloading statement ${statementId}...`);
    };

    const handleEmail = (statementId: number) => {
        alert(`Emailing statement ${statementId}...`);
    };

    const handleView = (statementId: number) => {
        alert(`Viewing statement ${statementId}...`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">Statements</h1>
                <p className="text-lg text-charcoal-light">View and download your account statements</p>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-charcoal-light mb-1">Available Statements</p>
                        <p className="text-3xl font-bold text-charcoal">{filteredStatements.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-charcoal-light mb-1">Latest Statement</p>
                        <p className="text-lg font-semibold text-charcoal">December 2025</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-charcoal-light mb-1">Statement Format</p>
                        <p className="text-lg font-semibold text-charcoal">PDF</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-charcoal">Filter Statements</h3>
                            <Button
                                variant={showFilters ? 'primary' : 'outline'}
                                size="small"
                                icon={<Filter className="w-4 h-4" />}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                {showFilters ? 'Hide' : 'Show'} Filters
                            </Button>
                        </div>

                        {showFilters && (
                            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-faded-gray-light">
                                <div>
                                    <label className="block text-sm font-semibold text-charcoal mb-2">Account</label>
                                    <select
                                        value={selectedAccount}
                                        onChange={(e) => setSelectedAccount(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                                    >
                                        {accountOptions.map((account) => (
                                            <option key={account} value={account}>{account}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-charcoal mb-2">Year</label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                                    >
                                        {yearOptions.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Statements List */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Statements</CardTitle>
                    <CardDescription>
                        Showing {filteredStatements.length} statement{filteredStatements.length !== 1 ? 's' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredStatements.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-12 h-12 text-charcoal-light mx-auto mb-4" />
                            <p className="text-charcoal-light">No statements found for the selected filters</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-faded-gray-light">
                            {filteredStatements.map((statement) => (
                                <div key={statement.id} className="p-6 hover:bg-parchment transition-colors">
                                    <div className="flex items-start justify-between gap-6">
                                        {/* Statement Info */}
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-lg bg-vintage-green/10 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-6 h-6 text-vintage-green" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-charcoal">{statement.month}</h3>
                                                    <span className="px-2 py-0.5 bg-parchment rounded text-xs font-semibold text-charcoal">
                                                        {statement.fileSize}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm text-charcoal-light">
                                                    <p>
                                                        <strong className="text-charcoal">{statement.account}</strong> ({statement.accountNumber})
                                                    </p>
                                                    <p className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {statement.period}
                                                    </p>
                                                    <p>{statement.transactions} transactions</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Statement Summary */}
                                        <div className="hidden md:block min-w-[200px]">
                                            <div className="bg-off-white rounded-lg p-4 space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-charcoal-light">Starting Balance:</span>
                                                    <span className="font-semibold text-charcoal">
                                                        ${Math.abs(statement.startingBalance).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-charcoal-light">Ending Balance:</span>
                                                    <span className="font-semibold text-charcoal">
                                                        ${Math.abs(statement.endingBalance).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="pt-2 border-t border-faded-gray-light">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-charcoal-light">Deposits:</span>
                                                        <span className="text-vintage-green">+${statement.deposits.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-charcoal-light">Withdrawals:</span>
                                                        <span className="text-red-600">-${statement.withdrawals.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                variant="primary"
                                                size="small"
                                                icon={<Download className="w-4 h-4" />}
                                                onClick={() => handleDownload(statement.id)}
                                            >
                                                Download
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="small"
                                                icon={<Eye className="w-4 h-4" />}
                                                onClick={() => handleView(statement.id)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="small"
                                                icon={<Mail className="w-4 h-4" />}
                                                onClick={() => handleEmail(statement.id)}
                                            >
                                                Email
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-gradient-to-br from-parchment to-warm-cream border-vintage-green/20">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-vintage-green/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-vintage-green" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-charcoal mb-2">About Statements</h3>
                            <p className="text-sm text-charcoal-light mb-3">
                                Your monthly statements provide a detailed record of all account activity.
                            </p>
                            <ul className="space-y-1 text-sm text-charcoal-light">
                                <li>• Statements are available in PDF format</li>
                                <li>• New statements are generated on the 1st of each month</li>
                                <li>• Statements are kept for 7 years</li>
                                <li>• You can download or email statements to yourself</li>
                                <li>• All statements are encrypted for your security</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
