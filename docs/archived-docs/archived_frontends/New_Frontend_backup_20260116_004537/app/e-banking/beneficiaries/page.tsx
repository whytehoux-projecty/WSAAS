'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import {
    Users,
    Plus,
    CheckCircle,
    Clock,
    Edit,
    Trash2,
    ArrowUpRight,
    Mail,
    Phone
} from 'lucide-react';

const beneficiariesData = [
    {
        id: 1,
        name: 'Sarah Martinez',
        accountNumber: '****1234',
        fullAccountNumber: '9876543211234',
        bank: 'AURUM VAULT',
        email: 'sarah.martinez@email.com',
        phone: '(555) 123-4567',
        status: 'verified',
        addedDate: '2024-06-15',
        lastTransfer: '2026-01-10',
        totalTransferred: 2450.00,
    },
    {
        id: 2,
        name: 'Robert Chen',
        accountNumber: '****5678',
        fullAccountNumber: '1234567895678',
        bank: 'AURUM VAULT',
        email: 'robert.chen@email.com',
        phone: '(555) 234-5678',
        status: 'verified',
        addedDate: '2024-08-20',
        lastTransfer: '2026-01-08',
        totalTransferred: 1850.00,
    },
    {
        id: 3,
        name: 'Emily Thompson',
        accountNumber: '****9012',
        fullAccountNumber: '5555666679012',
        bank: 'First National Bank',
        email: 'emily.t@email.com',
        phone: '(555) 345-6789',
        status: 'pending',
        addedDate: '2026-01-12',
        lastTransfer: null,
        totalTransferred: 0,
    },
    {
        id: 4,
        name: 'Michael Johnson',
        accountNumber: '****3456',
        fullAccountNumber: '7777888893456',
        bank: 'AURUM VAULT',
        email: 'mjohnson@email.com',
        phone: '(555) 456-7890',
        status: 'verified',
        addedDate: '2023-12-05',
        lastTransfer: '2025-12-28',
        totalTransferred: 5200.00,
    },
];

export default function BeneficiariesPage() {
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedBeneficiary, setSelectedBeneficiary] = useState<typeof beneficiariesData[0] | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        accountNumber: '',
        bank: '',
        email: '',
        phone: '',
    });

    const handleAddBeneficiary = () => {
        alert('Beneficiary added! Verification pending.');
        setShowAddForm(false);
        setFormData({ name: '', accountNumber: '', bank: '', email: '', phone: '' });
    };

    const handleTransfer = (beneficiary: typeof beneficiariesData[0]) => {
        alert(`Transfer to ${beneficiary.name}`);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to remove this beneficiary?')) {
            alert(`Beneficiary ${id} removed`);
        }
    };

    const verifiedCount = beneficiariesData.filter(b => b.status === 'verified').length;
    const pendingCount = beneficiariesData.filter(b => b.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">Beneficiaries</h1>
                    <p className="text-lg text-charcoal-light">Manage your saved transfer recipients</p>
                </div>
                <Button
                    variant="primary"
                    size="medium"
                    icon={<Plus className="w-5 h-5" />}
                    onClick={() => setShowAddForm(true)}
                >
                    Add Beneficiary
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-charcoal-light mb-1">Total Beneficiaries</p>
                        <p className="text-3xl font-bold text-charcoal">{beneficiariesData.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-vintage-green/10 to-vintage-green/5 border-vintage-green/20">
                    <CardContent className="p-6">
                        <p className="text-sm text-charcoal-light mb-1">Verified</p>
                        <p className="text-3xl font-bold text-vintage-green">{verifiedCount}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-soft-gold/10 to-soft-gold/5 border-soft-gold/20">
                    <CardContent className="p-6">
                        <p className="text-sm text-charcoal-light mb-1">Pending Verification</p>
                        <p className="text-3xl font-bold text-soft-gold-dark">{pendingCount}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Add Beneficiary Form */}
            {showAddForm && (
                <Card className="shadow-vintage-xl border-2 border-vintage-green">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Add New Beneficiary</CardTitle>
                            <button onClick={() => setShowAddForm(false)} className="text-charcoal-light hover:text-charcoal">
                                ✕
                            </button>
                        </div>
                        <CardDescription>Add a new recipient for transfers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="Enter beneficiary name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label="Account Number"
                            type="text"
                            placeholder="Enter 10-12 digit account number"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                            maxLength={12}
                        />
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Bank</label>
                            <select
                                value={formData.bank}
                                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                            >
                                <option value="">Select bank</option>
                                <option value="AURUM VAULT">AURUM VAULT</option>
                                <option value="First National Bank">First National Bank</option>
                                <option value="City Bank">City Bank</option>
                                <option value="Other">Other Bank</option>
                            </select>
                        </div>
                        <Input
                            label="Email (Optional)"
                            type="email"
                            placeholder="beneficiary@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            icon={<Mail className="w-5 h-5" />}
                        />
                        <Input
                            label="Phone (Optional)"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            icon={<Phone className="w-5 h-5" />}
                        />
                        <div className="p-4 bg-soft-gold/10 border border-soft-gold/20 rounded-lg text-sm text-charcoal">
                            <p className="font-semibold mb-1">Verification Required</p>
                            <p className="text-charcoal-light">
                                New beneficiaries require verification before you can transfer funds. This usually takes 1-2 business days.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" size="large" onClick={() => setShowAddForm(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button variant="primary" size="large" onClick={handleAddBeneficiary} className="flex-1">
                                Add Beneficiary
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Beneficiaries List */}
            <div className="grid md:grid-cols-2 gap-6">
                {beneficiariesData.map((beneficiary) => (
                    <Card key={beneficiary.id} className="hover:shadow-vintage-lg transition-all">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-full bg-vintage-green/10 flex items-center justify-center flex-shrink-0">
                                        <Users className="w-6 h-6 text-vintage-green" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{beneficiary.name}</CardTitle>
                                        <CardDescription className="font-mono">{beneficiary.accountNumber}</CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {beneficiary.status === 'verified' ? (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-vintage-green/10 rounded-full">
                                            <CheckCircle className="w-4 h-4 text-vintage-green" />
                                            <span className="text-xs text-vintage-green font-semibold">Verified</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-soft-gold/10 rounded-full">
                                            <Clock className="w-4 h-4 text-soft-gold-dark" />
                                            <span className="text-xs text-soft-gold-dark font-semibold">Pending</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Beneficiary Details */}
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-charcoal-light">
                                    <span className="font-semibold text-charcoal">Bank:</span>
                                    {beneficiary.bank}
                                </div>
                                {beneficiary.email && (
                                    <div className="flex items-center gap-2 text-charcoal-light">
                                        <Mail className="w-4 h-4" />
                                        {beneficiary.email}
                                    </div>
                                )}
                                {beneficiary.phone && (
                                    <div className="flex items-center gap-2 text-charcoal-light">
                                        <Phone className="w-4 h-4" />
                                        {beneficiary.phone}
                                    </div>
                                )}
                            </div>

                            {/* Transfer Stats */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-faded-gray-light">
                                <div>
                                    <p className="text-xs text-charcoal-light mb-1">Total Transferred</p>
                                    <p className="text-lg font-bold text-vintage-green font-mono">
                                        ${beneficiary.totalTransferred.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-charcoal-light mb-1">Last Transfer</p>
                                    <p className="text-sm font-semibold text-charcoal">
                                        {beneficiary.lastTransfer
                                            ? new Date(beneficiary.lastTransfer).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                            : 'Never'}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="primary"
                                    size="small"
                                    icon={<ArrowUpRight className="w-4 h-4" />}
                                    onClick={() => handleTransfer(beneficiary)}
                                    disabled={beneficiary.status !== 'verified'}
                                    className="flex-1"
                                >
                                    Transfer
                                </Button>
                                <button
                                    onClick={() => setSelectedBeneficiary(beneficiary)}
                                    className="p-2 hover:bg-parchment rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4 text-charcoal-light" />
                                </button>
                                <button
                                    onClick={() => handleDelete(beneficiary.id)}
                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Info Card */}
            <Card className="bg-gradient-to-br from-parchment to-warm-cream border-vintage-green/20">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-vintage-green/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-6 h-6 text-vintage-green" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-charcoal mb-2">About Beneficiaries</h3>
                            <p className="text-sm text-charcoal-light mb-3">
                                Beneficiaries are people or businesses you frequently send money to. Adding them makes transfers faster and easier.
                            </p>
                            <ul className="space-y-1 text-sm text-charcoal-light">
                                <li>• New beneficiaries require 1-2 business days for verification</li>
                                <li>• You can add beneficiaries from AURUM VAULT or other banks</li>
                                <li>• Verified beneficiaries can receive instant transfers</li>
                                <li>• You can edit or remove beneficiaries at any time</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
