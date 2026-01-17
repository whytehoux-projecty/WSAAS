'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api-client';
import { Plus, Check, X, Building, Tv, Shield, Zap, DollarSign } from 'lucide-react';

export default function BillsPage() {
    const [payees, setPayees] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingPayee, setAddingPayee] = useState(false);
    const [selectedPayeeId, setSelectedPayeeId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // New Payee Form State
    const [newPayee, setNewPayee] = useState({ name: '', accountNumber: '', category: 'UTILITIES' });

    // Payment Form State
    const [amount, setAmount] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [payeesRes, accountsRes] = await Promise.all([
                api.bills.getPayees(),
                api.accounts.getAll()
            ]);
            setPayees(payeesRes.payees || []);
            setAccounts(accountsRes.accounts || []);
            if (accountsRes.accounts?.length > 0) {
                setSelectedAccountId(accountsRes.accounts[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch bills data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPayee = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.bills.addPayee(newPayee);
            setAddingPayee(false);
            setNewPayee({ name: '', accountNumber: '', category: 'UTILITIES' });
            await fetchData();
        } catch (error) {
            alert('Failed to add payee');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePayBill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPayeeId || !amount) return;

        setActionLoading(true);
        try {
            await api.bills.pay({
                payeeId: selectedPayeeId,
                amount: Number(amount),
                accountId: selectedAccountId
            });
            alert('Payment Successful!');
            setSelectedPayeeId(null);
            setAmount('');
            // Maybe refresh accounts to update balance
            fetchData();
        } catch (error: any) {
            alert(error?.reponse?.data?.message || 'Payment Failed');
        } finally {
            setActionLoading(false);
        }
    };

    const getIcon = (category: string) => {
        switch (category) {
            case 'UTILITIES': return <Zap className="w-6 h-6 text-yellow-500" />;
            case 'INTERNET': return <Tv className="w-6 h-6 text-blue-500" />;
            case 'INSURANCE': return <Shield className="w-6 h-6 text-green-500" />;
            default: return <Building className="w-6 h-6 text-gray-500" />;
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-vintage-gold">Loading bills...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal mb-2 font-heading">Bill Payments</h1>
                    <p className="text-charcoal-light">Manage payees and schedule payments</p>
                </div>
                <Button
                    onClick={() => setAddingPayee(true)}
                    disabled={addingPayee}
                    icon={<Plus className="w-5 h-5" />}
                >
                    Add Payee
                </Button>
            </div>

            {/* Add Payee Form */}
            {addingPayee && (
                <Card className="border-2 border-vintage-gold/20 bg-warm-white">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-4">Add New Payee</h3>
                        <form onSubmit={handleAddPayee} className="grid md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium mb-1">Payee Name</label>
                                <input
                                    aria-label="Payee Name"
                                    className="w-full p-2 border rounded" required
                                    value={newPayee.name}
                                    onChange={e => setNewPayee({ ...newPayee, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Account Number</label>
                                <input
                                    aria-label="Account Number"
                                    className="w-full p-2 border rounded" required
                                    value={newPayee.accountNumber}
                                    onChange={e => setNewPayee({ ...newPayee, accountNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    aria-label="Category"
                                    className="w-full p-2 border rounded"
                                    value={newPayee.category}
                                    onChange={e => setNewPayee({ ...newPayee, category: e.target.value })}
                                >
                                    <option value="UTILITIES">Utilities</option>
                                    <option value="INTERNET">Internet/TV</option>
                                    <option value="INSURANCE">Insurance</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={actionLoading}>Save</Button>
                                <Button type="button" variant="outline" onClick={() => setAddingPayee(false)}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Payees List */}
            <div className="grid gap-4">
                {payees.length === 0 && !addingPayee ? (
                    <div className="text-center p-8 text-gray-500">No payees found. Add one to get started.</div>
                ) : (
                    payees.map(payee => (
                        <Card key={payee.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            {getIcon(payee.category)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-charcoal">{payee.name}</h3>
                                            <p className="text-sm text-gray-500">Acct: {payee.accountNumber}</p>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 mt-1 inline-block">
                                                {payee.category}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant={selectedPayeeId === payee.id ? 'secondary' : 'primary'}
                                        onClick={() => {
                                            if (selectedPayeeId === payee.id) setSelectedPayeeId(null);
                                            else setSelectedPayeeId(payee.id);
                                        }}
                                    >
                                        {selectedPayeeId === payee.id ? 'Cancel' : 'Pay Bill'}
                                    </Button>
                                </div>

                                {/* Payment Form Overlay/Expansion */}
                                {selectedPayeeId === payee.id && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                                        <form onSubmit={handlePayBill} className="flex flex-wrap items-end gap-4">
                                            <div className="flex-1 min-w-[200px]">
                                                <label className="block text-sm font-medium mb-1">Pay From Account</label>
                                                <select
                                                    aria-label="Pay From Account"
                                                    className="w-full p-2 border rounded"
                                                    value={selectedAccountId}
                                                    onChange={e => setSelectedAccountId(e.target.value)}
                                                >
                                                    {accounts.map(acc => (
                                                        <option key={acc.id} value={acc.id}>
                                                            {acc.accountNumber} ({acc.accountType}) - ${Number(acc.balance).toLocaleString()}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-32">
                                                <label className="block text-sm font-medium mb-1">Amount</label>
                                                <div className="relative">
                                                    <DollarSign className="w-4 h-4 absolute left-2 top-3 text-gray-400" />
                                                    <input
                                                        aria-label="Amount"
                                                        type="number"
                                                        min="0.01" step="0.01"
                                                        className="w-full p-2 pl-8 border rounded"
                                                        value={amount}
                                                        onChange={e => setAmount(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <Button type="submit" disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
                                                Confirm Payment
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
