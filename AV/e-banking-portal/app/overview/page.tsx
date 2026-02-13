'use client';

export const dynamic = 'force-dynamic';

import './dashboard-animations.css';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import oakLeaf from '../../Adobe Express - file-2.png';

import {
    Activity,
    CreditCard,
    DollarSign,
    Users,
    Download,
    Wallet,
    ArrowDownLeft,
    ArrowUpRight,
    PiggyBank
} from 'lucide-react';

import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from '@/components/dashboard/overview';
import { RecentTransactions } from '@/components/dashboard/recent-sales';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SpendingByCategory } from '@/components/dashboard/SpendingByCategory';

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
}

interface DashboardStats {
    totalBalance: number;
    income: number;
    expenses: number;
    savingsGoal: number; // Simulated for now as backend doesn't support goals yet
}

function DashboardContent() {

    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalBalance: 0,
        income: 0,
        expenses: 0,
        savingsGoal: 12500,
    });
    const [transactions, setTransactions] = useState<any[]>([]);
    const [analyticsData, setAnalyticsData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Use Promise.allSettled for graceful degradation
            const results = await Promise.allSettled([
                api.profile.get(),
                api.accounts.getAll(),
                api.transactions.getStats('month'),
                api.transactions.getAll({ limit: 5 }),
                api.savingsGoals.get()
            ]);

            // Extract successful results
            const [profileResult, accountsResult, txStatsResult, recentTxResult, savingsGoalResult] = results;

            // Handle profile data
            if (profileResult.status === 'fulfilled') {
                setUser(profileResult.value.user);
            } else {
                console.error('Failed to load profile:', profileResult.reason);
            }

            // Handle accounts data
            let totalBalance = 0;
            if (accountsResult.status === 'fulfilled') {
                totalBalance = accountsResult.value.accounts.reduce(
                    (sum: number, acc: any) => sum + Number(acc.balance), 0
                );
            } else {
                console.error('Failed to load accounts:', accountsResult.reason);
            }

            // Handle transaction stats
            let income = 0;
            let expenses = 0;
            if (txStatsResult.status === 'fulfilled') {
                income = txStatsResult.value.deposits || 0;
                expenses = (txStatsResult.value.withdrawals || 0) + (txStatsResult.value.transfers || 0);
            } else {
                console.error('Failed to load transaction stats:', txStatsResult.reason);
            }

            // Handle savings goal
            let savingsGoal = 25000; // Default fallback
            if (savingsGoalResult.status === 'fulfilled') {
                savingsGoal = savingsGoalResult.value.targetAmount || 25000;
            } else {
                console.warn('Savings goal not available, using default:', savingsGoalResult.reason);
            }

            setStats({
                totalBalance,
                income,
                expenses,
                savingsGoal
            });

            // Handle recent transactions
            if (recentTxResult.status === 'fulfilled') {
                setTransactions(recentTxResult.value.transactions || []);
            } else {
                console.error('Failed to load recent transactions:', recentTxResult.reason);
                setTransactions([]);
            }

            // Process analytics data from larger set (fetching 50 for demo)
            try {
                const analyticsTx = await api.transactions.getAll({ limit: 50 });
                const processedData = processChartData(analyticsTx.transactions || []);
                setAnalyticsData(processedData);
            } catch (error) {
                console.error('Failed to load analytics data:', error);
                setAnalyticsData([]);
            }

        } catch (error) {
            console.error('Critical error loading dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 py-10">
                    <div className="relative h-16 w-16">
                        <div className="absolute inset-0 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Image
                                src={oakLeaf}
                                alt="Oak leaf"
                                width={28}
                                height={28}
                                className="h-7 w-7 object-contain"
                                priority
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Loading dashboard...</p>
                </div>
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-[100px] rounded-xl" />
                    <Skeleton className="h-[100px] rounded-xl" />
                    <Skeleton className="h-[100px] rounded-xl" />
                    <Skeleton className="h-[100px] rounded-xl" />
                </div>
            </div>
        )
    }

    const processChartData = (txs: any[]) => {
        const monthlyData: Record<string, { name: string, income: number, expense: number }> = {};

        // Sort by date ascending to process
        const sortedTxs = [...txs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        sortedTxs.forEach(tx => {
            const date = new Date(tx.createdAt);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            const monthName = date.toLocaleString('default', { month: 'short' });

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { name: monthName, income: 0, expense: 0 };
            }

            // Assuming positive amount is income (deposit) and negative is expense
            // Check type as well for accuracy if needed
            const amt = Number(tx.amount);
            if (amt > 0) {
                monthlyData[monthKey].income += amt;
            } else {
                monthlyData[monthKey].expense += Math.abs(amt);
            }
        });

        return Object.values(monthlyData);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="flex-1 space-y-4 p-4 pt-0">
            <div className="flex items-center justify-between space-y-2 pb-4">
                <h2 className="text-3xl font-bold tracking-tight font-playfair">
                    {getGreeting()}, {user?.firstName || 'there'}
                </h2>
                <div className="flex items-center space-x-2">
                    <Button size="small" onClick={() => loadDashboardData()}>
                        Refresh Data
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Quick Actions */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="lg:col-span-4">
                            <ErrorBoundary>
                                <QuickActions />
                            </ErrorBoundary>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="animate-fade-in-up animate-delay-100 hover-lift">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium font-sans">
                                    Total Balance
                                </CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Across all accounts
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="animate-fade-in-up animate-delay-200 hover-lift">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium font-sans">
                                    Income (Month)
                                </CardTitle>
                                <ArrowDownLeft className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    +{formatCurrency(stats.income)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total deposits
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="animate-fade-in-up animate-delay-300 hover-lift">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium font-sans">
                                    Expenses (Month)
                                </CardTitle>
                                <ArrowUpRight className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    -{formatCurrency(stats.expenses)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Withdrawals & transfers
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="animate-fade-in-up animate-delay-400 hover-lift">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium font-sans">
                                    Savings Goals
                                </CardTitle>
                                <PiggyBank className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.savingsGoal)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Target 2026
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 animate-scale-in hover-lift">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ErrorBoundary>
                                    <Overview income={stats.income} expense={stats.expenses} />
                                </ErrorBoundary>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3 animate-slide-in-right hover-lift">
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>
                                    Latest activity across all accounts.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ErrorBoundary>
                                    <RecentTransactions transactions={transactions} />
                                </ErrorBoundary>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Financial Analysis</CardTitle>
                                <CardDescription>Income vs Expenses over time</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ErrorBoundary>
                                    <Overview data={analyticsData} />
                                </ErrorBoundary>
                            </CardContent>
                        </Card>
                        <div className="col-span-3 space-y-4">
                            {/* Savings Progress */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Savings Progress</CardTitle>
                                    <CardDescription>Progress towards your goal of {formatCurrency(stats.savingsGoal)}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Total Saved</span>
                                        <span className="font-bold">{formatCurrency(stats.totalBalance)}</span>
                                    </div>
                                    <div className="w-full">
                                        <Progress
                                            value={(stats.totalBalance / stats.savingsGoal) * 100}
                                            className="h-2"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground text-right">
                                        {((stats.totalBalance / stats.savingsGoal) * 100).toFixed(1)}% of goal
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Spending by Category - Real Data */}
                            <ErrorBoundary>
                                <SpendingByCategory
                                    transactions={transactions}
                                    totalExpenses={stats.expenses}
                                />
                            </ErrorBoundary>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
