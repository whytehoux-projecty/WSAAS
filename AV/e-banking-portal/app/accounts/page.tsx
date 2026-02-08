'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
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
    Lock,
    Landmark
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { VintageIcon } from '@/components/ui/vintage-icon';
import { Skeleton } from '@/components/ui/skeleton';

// Mock Data (In a real app, this comes from API)
import { api } from '@/lib/api-client';

interface Account {
    id: string;
    name: string;
    accountNumber: string;
    maskedNumber: string;
    balance: number;
    availableBalance: number;
    creditLimit?: number;
    type: 'checking' | 'savings' | 'credit' | 'investment';
    interestRate: string;
    monthlyChange: number;
    openedDate: string;
    status: 'active' | 'inactive' | 'closed' | 'suspended';
    currency: string;
}

interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    type: 'credit' | 'debit';
}

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
    const [showAccountNumber, setShowAccountNumber] = useState(false);

    // Fetch accounts on mount
    useState(() => { // Using useEffect in actual implementation logic, strict mode might double call but ok
    });
    // Wait, replacing useState with useEffect logic

    // Proper implementation
    const loadAccounts = async () => {
        try {
            const data = await api.accounts.getAll();
            const fetchedAccounts = (data.accounts || []).map((acc: any) => ({
                id: acc.id,
                name: `${acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()} Account`,
                accountNumber: acc.accountNumber,
                maskedNumber: `****${acc.accountNumber.slice(-4)}`,
                balance: acc.balance,
                availableBalance: acc.balance, // Backend should provide this preferably
                type: acc.accountType.toLowerCase(),
                interestRate: acc.accountType === 'SAVINGS' ? '4.20%' : '0.00%',
                monthlyChange: 100, // Mock for now
                openedDate: acc.createdAt,
                status: acc.status.toLowerCase(),
                currency: acc.currency
            }));

            setAccounts(fetchedAccounts);
            if (fetchedAccounts.length > 0) {
                setSelectedAccount(fetchedAccounts[0]);
            }
        } catch (error) {
            console.error('Failed to load accounts', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load accounts effect
    useEffect(() => {
        loadAccounts();
    }, []);

    // Effect to reload transactions when selected account changes
    useEffect(() => {
        if (selectedAccount) {
            loadTransactions(selectedAccount.id);
        }
    }, [selectedAccount]);

    const loadTransactions = async (accountId: string) => {
        setIsLoadingTransactions(true);
        try {
            const data = await api.transactions.getAll({ accountId, limit: 10 });
            const txs = (data.transactions || []).map((tx: any) => ({
                id: tx.id,
                description: tx.description,
                amount: tx.amount, // Backend sends signed amount?
                date: tx.createdAt,
                type: tx.type === 'DEPOSIT' || tx.type === 'CREDIT' ? 'credit' : 'debit'
            }));
            setTransactions(txs);
        } catch (error) {
            console.error('Failed to load transactions', error);
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    const totalBalance = accounts.reduce((sum, acc) =>
        acc.type === 'credit' ? sum : sum + acc.balance
        , 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'checking': return Wallet;
            case 'savings': return PiggyBank;
            case 'credit': return CreditCard;
            default: return Landmark;
        }
    };

    const getAccountColor = (type: string) => {
        switch (type) {
            case 'checking': return 'green';
            case 'savings': return 'gold';
            case 'credit': return 'charcoal';
            default: return 'charcoal';
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 animate-fade-in-up">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-playfair font-bold text-charcoal">My Accounts</h1>
                <p className="text-muted-foreground mt-1">Manage and view details of all your accounts</p>
            </div>

            {/* Total Balance Hero Card */}
            <Card className="bg-gradient-to-br from-vintage-green to-vintage-green-dark text-white border-none shadow-vintage-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Landmark size={200} />
                </div>
                <CardContent className="p-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <p className="text-warm-cream/90 font-medium mb-1">Total Liquid Assets</p>
                            <h2 className="text-5xl font-bold font-mono tracking-tight">
                                {formatCurrency(totalBalance)}
                            </h2>
                            <p className="text-warm-cream/80 mt-4 flex items-center gap-2">
                                <Badge variant="outline" className="border-warm-cream/30 text-warm-cream">
                                    {accounts.length} Active Accounts
                                </Badge>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-3 text-center py-10">Loading accounts...</div>
                ) : accounts.map((account) => (
                    <Card
                        key={account.id}
                        className={`cursor-pointer transition-all hover:shadow-vintage-lg hover:-translate-y-1 ${selectedAccount?.id === account.id ? 'ring-2 ring-vintage-green border-vintage-green' : ''
                            }`}
                        onClick={() => setSelectedAccount(account)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <VintageIcon
                                icon={getAccountIcon(account.type)}
                                variant={getAccountColor(account.type) as any}
                                size="md"
                            />
                            <Button variant="ghost" size="small" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <h3 className="font-semibold text-lg text-charcoal mb-1">{account.name}</h3>
                            <p className="text-sm text-muted-foreground font-mono mb-4">{account.maskedNumber}</p>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                    {account.type === 'credit' ? 'Current Balance' : 'Balance'}
                                </p>
                                <p className={`text-2xl font-bold font-mono ${account.balance < 0 ? 'text-red-600' : 'text-foreground'}`}>
                                    {formatCurrency(Math.abs(account.balance))}
                                    {account.type === 'credit' && account.balance > 0 && <span className="text-xs ml-1 text-muted-foreground">(Credit)</span>}
                                </p>
                            </div>

                            {/* Monthly Change Indicator */}
                            <div className="flex items-center gap-2 text-sm pt-4 mt-4 border-t border-border">
                                {account.monthlyChange > 0 ? (
                                    <div className="flex items-center text-vintage-green font-medium">
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        +{formatCurrency(account.monthlyChange)}
                                    </div>
                                ) : (
                                    <div className="flex items-center text-red-600 font-medium">
                                        <TrendingDown className="w-4 h-4 mr-1" />
                                        {formatCurrency(Math.abs(account.monthlyChange))}
                                    </div>
                                )}
                                <span className="text-muted-foreground text-xs">this month</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Detailed View Section */}
            {selectedAccount && (
                <div className="grid lg:grid-cols-3 gap-8 pt-4">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-xl font-playfair">{selectedAccount.name}</CardTitle>
                                    <CardDescription>Account Details & Analytics</CardDescription>
                                </div>
                                <Button variant="outline" size="small" icon={<Download className="w-4 h-4" />}>
                                    Statement
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-8">

                                {/* Vital Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/50 rounded-xl space-y-1">
                                        <p className="text-sm text-muted-foreground">Account Number</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-lg font-mono font-semibold tracking-wider">
                                                {showAccountNumber ? selectedAccount.accountNumber : selectedAccount.maskedNumber}
                                            </p>
                                            <Button variant="ghost" size="small" className="h-6 w-6 p-0" onClick={() => setShowAccountNumber(!showAccountNumber)}>
                                                {showAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-xl space-y-1">
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={selectedAccount.status === 'active' ? 'success' : 'warning'} className="capitalize">
                                                {selectedAccount.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                since {new Date(selectedAccount.openedDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Credit Card Utilization Bar if Credit */}
                                {selectedAccount.type === 'credit' && selectedAccount.creditLimit && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-charcoal">Credit Utilization</span>
                                            <span className="font-mono">{((Math.abs(selectedAccount.balance) / selectedAccount.creditLimit) * 100).toFixed(1)}%</span>
                                        </div>
                                        <Progress value={(Math.abs(selectedAccount.balance) / selectedAccount.creditLimit) * 100} className="h-3" />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>$0</span>
                                            <span>Limit: {formatCurrency(selectedAccount.creditLimit)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Recent Activity List */}
                                <div>
                                    <h4 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
                                        <HistoryIcon /> Recent Activity
                                    </h4>
                                    <div className="space-y-3">
                                        {isLoadingTransactions ? (
                                            <div className="p-4 text-center text-muted-foreground">Loading activity...</div>
                                        ) : transactions.length > 0 ? transactions.map((tx) => (
                                            <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['credit', 'deposit'].includes(tx.type) || tx.amount > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {['credit', 'deposit'].includes(tx.type) || tx.amount > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-charcoal">{tx.description}</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className={`font-mono font-medium ${['credit', 'deposit'].includes(tx.type) || tx.amount > 0 ? 'text-green-600' : 'text-charcoal'}`}>
                                                    {['credit', 'deposit'].includes(tx.type) || tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                                                </span>
                                            </div>
                                        )) : (
                                            <div className="p-4 text-center text-muted-foreground">No recent traffic</div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full justify-start" variant="outline" icon={<ArrowUpRight className="w-4 h-4 mr-2" />}>
                                    Transfer Funds
                                </Button>
                                <Button className="w-full justify-start" variant="outline" icon={<Download className="w-4 h-4 mr-2" />}>
                                    Download Statement
                                </Button>
                                <Button className="w-full justify-start hover:bg-red-50 hover:text-red-600 hover:border-red-200" variant="outline" icon={<Lock className="w-4 h-4 mr-2" />}>
                                    Freeze Account
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Insights / Tips */}
                        <Card className="bg-gradient-to-br from-soft-gold/10 to-transparent border-soft-gold/20">
                            <CardHeader>
                                <CardTitle className="text-lg">Insights</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {selectedAccount.type === 'savings' && `You are earning ${selectedAccount.interestRate} APY. Adding $500/mo could grow your savings by 12% by year end.`}
                                    {selectedAccount.type === 'credit' && `Your utilization is healthy. Keep it under 30% to maintain your high credit score.`}
                                    {selectedAccount.type === 'checking' && `Spending is 5% lower than last month. Great job sticking to your budget!`}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}

function HistoryIcon() {
    return (
        <svg
            className="w-4 h-4 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 3v5h5" />
            <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
            <path d="M12 7v5l4 2" />
        </svg>
    )
}
