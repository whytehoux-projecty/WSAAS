'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { ArrowRightLeft, CheckCircle, AlertCircle, Wallet } from 'lucide-react';

const userAccounts = [
    {
        id: 1,
        name: 'Classic Checking',
        accountNumber: '****5678',
        fullAccountNumber: '1234567890',
        balance: 5847.32,
        type: 'checking',
    },
    {
        id: 2,
        name: 'Growth Savings',
        accountNumber: '****9012',
        fullAccountNumber: '9876543210',
        balance: 15420.00,
        type: 'savings',
    },
    {
        id: 3,
        name: 'Business Checking',
        accountNumber: '****3456',
        fullAccountNumber: '5555666677',
        balance: 8234.50,
        type: 'checking',
    },
];

const savedBeneficiaries = [
    { id: 1, name: 'Sarah Martinez', accountNumber: '****1234', bank: 'AURUM VAULT' },
    { id: 2, name: 'Robert Chen', accountNumber: '****5678', bank: 'AURUM VAULT' },
    { id: 3, name: 'Emily Thompson', accountNumber: '****9012', bank: 'Other Bank' },
];

export default function TransferPage() {
    const [transferType, setTransferType] = useState<'own' | 'beneficiary' | 'new'>('own');
    const [formData, setFormData] = useState({
        fromAccount: '',
        toAccount: '',
        beneficiary: '',
        newAccountNumber: '',
        newAccountName: '',
        amount: '',
        description: '',
        scheduleDate: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [transferSuccess, setTransferSuccess] = useState(false);

    const selectedFromAccount = userAccounts.find(acc => acc.id.toString() === formData.fromAccount);
    const selectedToAccount = userAccounts.find(acc => acc.id.toString() === formData.toAccount);
    const selectedBeneficiary = savedBeneficiaries.find(ben => ben.id.toString() === formData.beneficiary);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fromAccount) {
            newErrors.fromAccount = 'Please select a source account';
        }

        if (transferType === 'own' && !formData.toAccount) {
            newErrors.toAccount = 'Please select a destination account';
        }

        if (transferType === 'own' && formData.fromAccount === formData.toAccount) {
            newErrors.toAccount = 'Source and destination accounts must be different';
        }

        if (transferType === 'beneficiary' && !formData.beneficiary) {
            newErrors.beneficiary = 'Please select a beneficiary';
        }

        if (transferType === 'new') {
            if (!formData.newAccountNumber) {
                newErrors.newAccountNumber = 'Account number is required';
            } else if (!/^\d{10,12}$/.test(formData.newAccountNumber)) {
                newErrors.newAccountNumber = 'Account number must be 10-12 digits';
            }
            if (!formData.newAccountName) {
                newErrors.newAccountName = 'Account holder name is required';
            }
        }

        if (!formData.amount) {
            newErrors.amount = 'Amount is required';
        } else if (parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        } else if (selectedFromAccount && parseFloat(formData.amount) > selectedFromAccount.balance) {
            newErrors.amount = 'Insufficient funds';
        }

        return newErrors;
    };

    const handleContinue = () => {
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setShowConfirmation(true);
    };

    const handleConfirm = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setTransferSuccess(true);
        }, 2000);
    };

    const handleReset = () => {
        setFormData({
            fromAccount: '',
            toAccount: '',
            beneficiary: '',
            newAccountNumber: '',
            newAccountName: '',
            amount: '',
            description: '',
            scheduleDate: '',
        });
        setErrors({});
        setShowConfirmation(false);
        setTransferSuccess(false);
    };

    if (transferSuccess) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="text-center shadow-vintage-xl">
                    <CardContent className="p-12">
                        <div className="w-20 h-20 mx-auto rounded-full bg-vintage-green/10 flex items-center justify-center mb-6">
                            <CheckCircle className="w-12 h-12 text-vintage-green" />
                        </div>
                        <h2 className="text-3xl font-bold text-charcoal mb-4">Transfer Successful!</h2>
                        <p className="text-lg text-charcoal-light mb-8">
                            Your transfer of <strong className="text-vintage-green">${parseFloat(formData.amount).toFixed(2)}</strong> has been completed successfully.
                        </p>
                        <div className="bg-parchment rounded-lg p-6 mb-8 text-left">
                            <h3 className="font-semibold text-charcoal mb-4">Transaction Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-charcoal-light">From:</span>
                                    <span className="font-semibold text-charcoal">{selectedFromAccount?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-charcoal-light">To:</span>
                                    <span className="font-semibold text-charcoal">
                                        {transferType === 'own' && selectedToAccount?.name}
                                        {transferType === 'beneficiary' && selectedBeneficiary?.name}
                                        {transferType === 'new' && formData.newAccountName}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-charcoal-light">Amount:</span>
                                    <span className="font-semibold text-vintage-green">${parseFloat(formData.amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-charcoal-light">Reference:</span>
                                    <span className="font-mono text-charcoal">TXN-{Date.now().toString().slice(-8)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" size="large" onClick={handleReset} className="flex-1">
                                Make Another Transfer
                            </Button>
                            <Button variant="primary" size="large" onClick={() => window.location.href = '/e-banking/dashboard'} className="flex-1">
                                Back to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (showConfirmation) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="shadow-vintage-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Confirm Transfer</CardTitle>
                        <CardDescription>Please review the details before confirming</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-soft-gold/10 border border-soft-gold/20 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-soft-gold-dark flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-charcoal">
                                Please verify all details are correct. This action cannot be undone.
                            </p>
                        </div>

                        <div className="bg-parchment rounded-lg p-6 space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-faded-gray-light">
                                <span className="text-charcoal-light">From Account</span>
                                <div className="text-right">
                                    <p className="font-semibold text-charcoal">{selectedFromAccount?.name}</p>
                                    <p className="text-sm text-charcoal-light font-mono">{selectedFromAccount?.accountNumber}</p>
                                    <p className="text-xs text-charcoal-light">Balance: ${selectedFromAccount?.balance.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="flex justify-center py-2">
                                <ArrowRightLeft className="w-6 h-6 text-vintage-green" />
                            </div>

                            <div className="flex justify-between items-center pb-4 border-b border-faded-gray-light">
                                <span className="text-charcoal-light">To Account</span>
                                <div className="text-right">
                                    {transferType === 'own' && (
                                        <>
                                            <p className="font-semibold text-charcoal">{selectedToAccount?.name}</p>
                                            <p className="text-sm text-charcoal-light font-mono">{selectedToAccount?.accountNumber}</p>
                                        </>
                                    )}
                                    {transferType === 'beneficiary' && (
                                        <>
                                            <p className="font-semibold text-charcoal">{selectedBeneficiary?.name}</p>
                                            <p className="text-sm text-charcoal-light font-mono">{selectedBeneficiary?.accountNumber}</p>
                                            <p className="text-xs text-charcoal-light">{selectedBeneficiary?.bank}</p>
                                        </>
                                    )}
                                    {transferType === 'new' && (
                                        <>
                                            <p className="font-semibold text-charcoal">{formData.newAccountName}</p>
                                            <p className="text-sm text-charcoal-light font-mono">****{formData.newAccountNumber.slice(-4)}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-charcoal-light">Transfer Amount</span>
                                <p className="text-3xl font-bold text-vintage-green font-mono">${parseFloat(formData.amount).toFixed(2)}</p>
                            </div>

                            {formData.description && (
                                <div className="flex justify-between items-start pt-4 border-t border-faded-gray-light">
                                    <span className="text-charcoal-light">Description</span>
                                    <p className="text-charcoal max-w-xs text-right">{formData.description}</p>
                                </div>
                            )}

                            {formData.scheduleDate && (
                                <div className="flex justify-between items-center pt-4 border-t border-faded-gray-light">
                                    <span className="text-charcoal-light">Scheduled For</span>
                                    <p className="text-charcoal">{new Date(formData.scheduleDate).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" size="large" onClick={() => setShowConfirmation(false)} className="flex-1">
                                Back
                            </Button>
                            <Button variant="primary" size="large" onClick={handleConfirm} loading={isLoading} className="flex-1">
                                {isLoading ? 'Processing...' : 'Confirm Transfer'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">Transfer Money</h1>
                <p className="text-lg text-charcoal-light">Send money between your accounts or to others</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Transfer Form */}
                <div className="lg:col-span-2">
                    <Card className="shadow-vintage-lg">
                        <CardHeader>
                            <CardTitle>Transfer Details</CardTitle>
                            <CardDescription>Fill in the details to transfer money</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Transfer Type Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-charcoal mb-3">Transfer To</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTransferType('own')}
                                        className={`p-4 rounded-lg border-2 transition-all ${transferType === 'own'
                                                ? 'border-vintage-green bg-vintage-green/5'
                                                : 'border-faded-gray-light hover:border-vintage-green/50'
                                            }`}
                                    >
                                        <Wallet className={`w-6 h-6 mx-auto mb-2 ${transferType === 'own' ? 'text-vintage-green' : 'text-charcoal-light'}`} />
                                        <p className={`text-sm font-semibold ${transferType === 'own' ? 'text-vintage-green' : 'text-charcoal'}`}>
                                            My Accounts
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTransferType('beneficiary')}
                                        className={`p-4 rounded-lg border-2 transition-all ${transferType === 'beneficiary'
                                                ? 'border-vintage-green bg-vintage-green/5'
                                                : 'border-faded-gray-light hover:border-vintage-green/50'
                                            }`}
                                    >
                                        <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${transferType === 'beneficiary' ? 'text-vintage-green' : 'text-charcoal-light'}`} />
                                        <p className={`text-sm font-semibold ${transferType === 'beneficiary' ? 'text-vintage-green' : 'text-charcoal'}`}>
                                            Saved
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTransferType('new')}
                                        className={`p-4 rounded-lg border-2 transition-all ${transferType === 'new'
                                                ? 'border-vintage-green bg-vintage-green/5'
                                                : 'border-faded-gray-light hover:border-vintage-green/50'
                                            }`}
                                    >
                                        <ArrowRightLeft className={`w-6 h-6 mx-auto mb-2 ${transferType === 'new' ? 'text-vintage-green' : 'text-charcoal-light'}`} />
                                        <p className={`text-sm font-semibold ${transferType === 'new' ? 'text-vintage-green' : 'text-charcoal'}`}>
                                            New
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {/* From Account */}
                            <div>
                                <label className="block text-sm font-semibold text-charcoal mb-2">From Account</label>
                                <select
                                    value={formData.fromAccount}
                                    onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                                >
                                    <option value="">Select source account</option>
                                    {userAccounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.name} ({account.accountNumber}) - ${account.balance.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                                {errors.fromAccount && <p className="text-sm text-red-600 mt-1">{errors.fromAccount}</p>}
                            </div>

                            {/* To Account - Own Accounts */}
                            {transferType === 'own' && (
                                <div>
                                    <label className="block text-sm font-semibold text-charcoal mb-2">To Account</label>
                                    <select
                                        value={formData.toAccount}
                                        onChange={(e) => setFormData({ ...formData, toAccount: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                                    >
                                        <option value="">Select destination account</option>
                                        {userAccounts
                                            .filter(acc => acc.id.toString() !== formData.fromAccount)
                                            .map((account) => (
                                                <option key={account.id} value={account.id}>
                                                    {account.name} ({account.accountNumber})
                                                </option>
                                            ))}
                                    </select>
                                    {errors.toAccount && <p className="text-sm text-red-600 mt-1">{errors.toAccount}</p>}
                                </div>
                            )}

                            {/* To Account - Beneficiary */}
                            {transferType === 'beneficiary' && (
                                <div>
                                    <label className="block text-sm font-semibold text-charcoal mb-2">Select Beneficiary</label>
                                    <select
                                        value={formData.beneficiary}
                                        onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                                    >
                                        <option value="">Select beneficiary</option>
                                        {savedBeneficiaries.map((ben) => (
                                            <option key={ben.id} value={ben.id}>
                                                {ben.name} ({ben.accountNumber}) - {ben.bank}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.beneficiary && <p className="text-sm text-red-600 mt-1">{errors.beneficiary}</p>}
                                </div>
                            )}

                            {/* To Account - New */}
                            {transferType === 'new' && (
                                <>
                                    <Input
                                        label="Account Number"
                                        type="text"
                                        placeholder="Enter 10-12 digit account number"
                                        value={formData.newAccountNumber}
                                        onChange={(e) => setFormData({ ...formData, newAccountNumber: e.target.value.replace(/\D/g, '') })}
                                        error={errors.newAccountNumber}
                                        maxLength={12}
                                    />
                                    <Input
                                        label="Account Holder Name"
                                        type="text"
                                        placeholder="Enter account holder name"
                                        value={formData.newAccountName}
                                        onChange={(e) => setFormData({ ...formData, newAccountName: e.target.value })}
                                        error={errors.newAccountName}
                                    />
                                </>
                            )}

                            {/* Amount */}
                            <Input
                                label="Amount"
                                type="number"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                error={errors.amount}
                                icon={<span className="text-charcoal-light">$</span>}
                            />

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-charcoal mb-2">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Add a note for this transfer"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* Schedule Date */}
                            <Input
                                label="Schedule Transfer (Optional)"
                                type="date"
                                value={formData.scheduleDate}
                                onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                            />

                            <Button variant="primary" size="large" onClick={handleContinue} className="w-full">
                                Continue
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Summary Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-lg">Transfer Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-charcoal-light mb-1">From</p>
                                <p className="font-semibold text-charcoal">
                                    {selectedFromAccount ? selectedFromAccount.name : 'Not selected'}
                                </p>
                                {selectedFromAccount && (
                                    <p className="text-xs text-charcoal-light">Balance: ${selectedFromAccount.balance.toFixed(2)}</p>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <ArrowRightLeft className="w-5 h-5 text-vintage-green" />
                            </div>

                            <div>
                                <p className="text-sm text-charcoal-light mb-1">To</p>
                                <p className="font-semibold text-charcoal">
                                    {transferType === 'own' && selectedToAccount ? selectedToAccount.name : ''}
                                    {transferType === 'beneficiary' && selectedBeneficiary ? selectedBeneficiary.name : ''}
                                    {transferType === 'new' && formData.newAccountName ? formData.newAccountName : ''}
                                    {!selectedToAccount && !selectedBeneficiary && !formData.newAccountName && 'Not selected'}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-faded-gray-light">
                                <p className="text-sm text-charcoal-light mb-1">Amount</p>
                                <p className="text-2xl font-bold text-vintage-green font-mono">
                                    ${formData.amount ? parseFloat(formData.amount).toFixed(2) : '0.00'}
                                </p>
                            </div>

                            {selectedFromAccount && formData.amount && parseFloat(formData.amount) > 0 && (
                                <div className="pt-4 border-t border-faded-gray-light">
                                    <p className="text-sm text-charcoal-light mb-1">Remaining Balance</p>
                                    <p className="text-lg font-semibold text-charcoal">
                                        ${(selectedFromAccount.balance - parseFloat(formData.amount)).toFixed(2)}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
