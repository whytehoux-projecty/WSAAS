'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import {
    FileText,
    Plus,
    Calendar,
    CheckCircle,
    Clock,
    Zap,
    Droplet,
    Wifi,
    Phone,
    Trash2
} from 'lucide-react';

const savedBillers = [
    {
        id: 1,
        name: 'City Power & Electric',
        category: 'Utilities',
        icon: <Zap className="w-6 h-6" />,
        accountNumber: '****7890',
        lastAmount: 125.30,
        dueDate: '2026-01-25',
        status: 'pending',
        autopay: true,
    },
    {
        id: 2,
        name: 'Metro Water Services',
        category: 'Utilities',
        icon: <Droplet className="w-6 h-6" />,
        accountNumber: '****3456',
        lastAmount: 45.80,
        dueDate: '2026-01-28',
        status: 'pending',
        autopay: false,
    },
    {
        id: 3,
        name: 'FastNet Internet',
        category: 'Internet',
        icon: <Wifi className="w-6 h-6" />,
        accountNumber: '****1234',
        lastAmount: 79.99,
        dueDate: '2026-01-20',
        status: 'overdue',
        autopay: false,
    },
    {
        id: 4,
        name: 'Mobile Plus Wireless',
        category: 'Phone',
        icon: <Phone className="w-6 h-6" />,
        accountNumber: '****5678',
        lastAmount: 65.00,
        dueDate: '2026-02-01',
        status: 'upcoming',
        autopay: true,
    },
];

const paymentHistory = [
    { id: 1, biller: 'City Power & Electric', amount: 125.30, date: '2025-12-25', status: 'completed' },
    { id: 2, biller: 'Metro Water Services', amount: 45.80, date: '2025-12-28', status: 'completed' },
    { id: 3, biller: 'FastNet Internet', amount: 79.99, date: '2025-12-20', status: 'completed' },
    { id: 4, biller: 'Mobile Plus Wireless', amount: 65.00, date: '2026-01-01', status: 'completed' },
];

export default function BillsPage() {
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showAddBiller, setShowAddBiller] = useState(false);
    const [selectedBiller, setSelectedBiller] = useState<typeof savedBillers[0] | null>(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        fromAccount: '',
        paymentDate: '',
    });

    const handlePayNow = (biller: typeof savedBillers[0]) => {
        setSelectedBiller(biller);
        setPaymentData({ ...paymentData, amount: biller.lastAmount.toString() });
        setShowPaymentForm(true);
    };

    const handleSubmitPayment = () => {
        alert(`Payment of $${paymentData.amount} to ${selectedBiller?.name} submitted!`);
        setShowPaymentForm(false);
        setPaymentData({ amount: '', fromAccount: '', paymentDate: '' });
    };

    const totalDue = savedBillers
        .filter(b => b.status === 'pending' || b.status === 'overdue')
        .reduce((sum, b) => sum + b.lastAmount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">Bill Payments</h1>
                    <p className="text-lg text-charcoal-light">Manage and pay your bills</p>
                </div>
                <Button
                    variant="primary"
                    size="medium"
                    icon={<Plus className="w-5 h-5" />}
                    onClick={() => setShowAddBiller(true)}
                >
                    Add Biller
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-charcoal-light mb-1">Total Due</p>
                        <p className="text-3xl font-bold text-red-600 font-mono">${totalDue.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-charcoal-light mb-1">Saved Billers</p>
                        <p className="text-3xl font-bold text-charcoal">{savedBillers.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-charcoal-light mb-1">AutoPay Active</p>
                        <p className="text-3xl font-bold text-vintage-green">
                            {savedBillers.filter(b => b.autopay).length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Form Modal */}
            {showPaymentForm && selectedBiller && (
                <Card className="shadow-vintage-xl border-2 border-vintage-green">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Pay Bill - {selectedBiller.name}</CardTitle>
                            <button onClick={() => setShowPaymentForm(false)} className="text-charcoal-light hover:text-charcoal">
                                ✕
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Amount"
                            type="number"
                            value={paymentData.amount}
                            onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                            icon={<span className="text-charcoal-light">$</span>}
                        />
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">From Account</label>
                            <select
                                value={paymentData.fromAccount}
                                onChange={(e) => setPaymentData({ ...paymentData, fromAccount: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                            >
                                <option value="">Select account</option>
                                <option value="checking">Classic Checking - $5,847.32</option>
                                <option value="savings">Growth Savings - $15,420.00</option>
                            </select>
                        </div>
                        <Input
                            label="Payment Date"
                            type="date"
                            value={paymentData.paymentDate}
                            onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        <div className="flex gap-4">
                            <Button variant="outline" size="large" onClick={() => setShowPaymentForm(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button variant="primary" size="large" onClick={handleSubmitPayment} className="flex-1">
                                Submit Payment
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add Biller Form */}
            {showAddBiller && (
                <Card className="shadow-vintage-xl border-2 border-vintage-green">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Add New Biller</CardTitle>
                            <button onClick={() => setShowAddBiller(false)} className="text-charcoal-light hover:text-charcoal">
                                ✕
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input label="Biller Name" type="text" placeholder="Enter biller name" />
                        <Input label="Account Number" type="text" placeholder="Enter account number" />
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Category</label>
                            <select className="w-full px-4 py-3 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors">
                                <option value="">Select category</option>
                                <option value="utilities">Utilities</option>
                                <option value="internet">Internet</option>
                                <option value="phone">Phone</option>
                                <option value="insurance">Insurance</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" size="large" onClick={() => setShowAddBiller(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button variant="primary" size="large" onClick={() => { alert('Biller added!'); setShowAddBiller(false); }} className="flex-1">
                                Add Biller
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Saved Billers */}
            <Card>
                <CardHeader>
                    <CardTitle>Saved Billers</CardTitle>
                    <CardDescription>Your registered billers and payment status</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-faded-gray-light">
                        {savedBillers.map((biller) => (
                            <div key={biller.id} className="p-4 hover:bg-parchment transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-full bg-vintage-green/10 flex items-center justify-center text-vintage-green">
                                            {biller.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-charcoal">{biller.name}</h3>
                                                {biller.autopay && (
                                                    <span className="px-2 py-0.5 bg-vintage-green/10 text-vintage-green text-xs rounded-full font-semibold">
                                                        AutoPay
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-charcoal-light">
                                                <span>{biller.category}</span>
                                                <span>•</span>
                                                <span className="font-mono">{biller.accountNumber}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Due: {new Date(biller.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-charcoal font-mono">${biller.lastAmount.toFixed(2)}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                {biller.status === 'overdue' && (
                                                    <>
                                                        <Clock className="w-4 h-4 text-red-600" />
                                                        <span className="text-xs text-red-600 font-semibold">Overdue</span>
                                                    </>
                                                )}
                                                {biller.status === 'pending' && (
                                                    <>
                                                        <Clock className="w-4 h-4 text-soft-gold-dark" />
                                                        <span className="text-xs text-soft-gold-dark font-semibold">Pending</span>
                                                    </>
                                                )}
                                                {biller.status === 'upcoming' && (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 text-charcoal-light" />
                                                        <span className="text-xs text-charcoal-light font-semibold">Upcoming</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                variant="primary"
                                                size="small"
                                                onClick={() => handlePayNow(biller)}
                                            >
                                                Pay Now
                                            </Button>
                                            <button className="text-charcoal-light hover:text-red-600 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Recent bill payments</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-faded-gray-light">
                        {paymentHistory.map((payment) => (
                            <div key={payment.id} className="p-4 hover:bg-parchment transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-vintage-green/10 flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-vintage-green" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-charcoal">{payment.biller}</p>
                                            <p className="text-sm text-charcoal-light">
                                                {new Date(payment.date).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-charcoal font-mono">${payment.amount.toFixed(2)}</p>
                                        <p className="text-xs text-vintage-green capitalize">{payment.status}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
