'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, History, CreditCard, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api-client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VintageIcon } from '@/components/ui/vintage-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils'; // Try import from utils

interface Account {
    id: string;
    accountNumber: string;
    accountType: string;
    balance: number;
    currency: string;
}

interface TransferFormData {
    fromAccountId: string;
    toAccountNumber: string;
    amount: string;
    description: string;
    routingNumber?: string;
    bankName?: string;
    swiftCode?: string;
    recipientName?: string;
    transferType: 'INTERNAL' | 'WIRE';
}

function TransferContent() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState<TransferFormData>({
        fromAccountId: '',
        toAccountNumber: '',
        amount: '',
        description: '',
        recipientName: '',
        transferType: 'INTERNAL'
    });

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const data = await api.accounts.getAll();
            setAccounts(data.accounts || data.data?.accounts || []);
        } catch (error) {
            console.error('Failed to load accounts:', error);
            setMessage({ type: 'error', text: 'Failed to load accounts. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsSubmitting(true);

        try {
            if (formData.transferType === 'INTERNAL') {
                await api.transactions.create({
                    fromAccountId: formData.fromAccountId,
                    toAccountNumber: formData.toAccountNumber,
                    amount: parseFloat(formData.amount),
                    description: formData.description,
                    type: 'DEBIT',
                });
            } else {
                await api.transfers.createWire({
                    fromAccountId: formData.fromAccountId,
                    recipientAccount: formData.toAccountNumber,
                    amount: parseFloat(formData.amount),
                    currency: 'USD',
                    swiftCode: formData.swiftCode,
                    recipientBank: formData.bankName,
                    recipientName: formData.recipientName,
                    purpose: formData.description
                });
            }

            setMessage({ type: 'success', text: 'Transfer initiated successfully!' });

            // Reset form
            setFormData(prev => ({
                ...prev,
                toAccountNumber: '',
                amount: '',
                description: '',
                recipientName: '',
                swiftCode: '',
                routingNumber: '',
                bankName: ''
            }));

            // Reload accounts to update balance
            loadAccounts();

            // Refresh recent transactions
            router.refresh();

        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Transfer failed. Check details and try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-4 space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="col-span-2 h-[500px] rounded-xl" />
                    <Skeleton className="col-span-1 h-[300px] rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-charcoal">Money Transfer</h1>
                    <p className="text-muted-foreground mt-1">Send money securely to internal or external accounts.</p>
                </div>
                <Button variant="outline" icon={<History className="w-4 h-4" />}>
                    History
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Transfer Form */}
                <Card className="md:col-span-2 border-none shadow-vintage-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <VintageIcon icon={ArrowLeftRight} variant="gold" size="sm" />
                            Transfer Details
                        </CardTitle>
                        <CardDescription>Enter the recipient and amount.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {message && (
                                <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="transferType">Payment Type</Label>
                                <Select
                                    value={formData.transferType}
                                    onValueChange={(value) => handleSelectChange('transferType', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INTERNAL">Internal Transfer (Instant)</SelectItem>
                                        <SelectItem value="WIRE">Wire Transfer (Swift)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fromAccountId">From Account</Label>
                                    <Select
                                        value={formData.fromAccountId}
                                        onValueChange={(value) => handleSelectChange('fromAccountId', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    {acc.accountType} - ****{acc.accountNumber.slice(-4)} ({new Intl.NumberFormat('en-US', { style: 'currency', currency: acc.currency }).format(acc.balance)})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="0.00"
                                            className="pl-7"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="toAccountNumber">Recipient Account Number</Label>
                                <Input
                                    id="toAccountNumber"
                                    placeholder="Enter account number"
                                    value={formData.toAccountNumber}
                                    onChange={(e) => setFormData({ ...formData, toAccountNumber: e.target.value })}
                                    required
                                />
                            </div>

                            {formData.transferType === 'WIRE' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-l-2 border-vintage-green/20 pl-4 animate-in fade-in slide-in-from-left-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="recipientName">Recipient Name</Label>
                                        <Input
                                            id="recipientName"
                                            placeholder="Enter recipient's full name"
                                            value={formData.recipientName}
                                            onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="swiftCode">SWIFT / BIC Code</Label>
                                        <Input
                                            id="swiftCode"
                                            placeholder="e.g. BOFAUS3N"
                                            value={formData.swiftCode}
                                            onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bankName">Bank Name</Label>
                                        <Input
                                            id="bankName"
                                            placeholder="Recipient Bank Name"
                                            value={formData.bankName}
                                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="routingNumber">Routing Number (Optional)</Label>
                                        <Input
                                            id="routingNumber"
                                            placeholder="e.g. 021000021"
                                            value={formData.routingNumber}
                                            onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="description">Reference / Description</Label>
                                <Input
                                    id="description"
                                    placeholder="e.g. Rent payment"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-lg bg-vintage-green hover:bg-vintage-green-dark"
                                    loading={isSubmitting}
                                >
                                    {isSubmitting ? 'Processing...' : `Send ${formData.amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(formData.amount)) : 'Money'}`}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-soft-gold/10 to-transparent border-soft-gold/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Transfer Limits</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Daily Limit</span>
                                <span className="font-semibold">$50,000.00</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Used Today</span>
                                <span className="font-semibold text-vintage-green">$0.00</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                                <div className="bg-vintage-green h-1.5 rounded-full w-[0%]"></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <VintageIcon icon={ShieldCheck} size="sm" variant="green" />
                                Security Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-3">
                            <p>Transfers are encrypted and secure.</p>
                            <p>Internal transfers are processed instantly.</p>
                            <p>Wire transfers may take 1-3 business days.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function TransferPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
        }>
            <TransferContent />
        </Suspense>
    );
}
