'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import {
    Plus,
    Trash2,
    Search,
    User,
    Building2,
    CreditCard,
    Mail,
    Globe,
    CheckCircle,
    X
} from 'lucide-react';

interface Beneficiary {
    id: string;
    name: string;
    accountNumber: string;
    bankName: string;
    swiftCode?: string;
    nickname?: string;
    email?: string;
    isInternal: boolean;
}

export default function BeneficiariesPage() {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    // New Beneficiary Form State
    const [formData, setFormData] = useState({
        name: '',
        accountNumber: '',
        bankName: '',
        swiftCode: '',
        nickname: '',
        email: '',
    });

    useEffect(() => {
        loadBeneficiaries();
    }, []);

    const loadBeneficiaries = async () => {
        try {
            const response = await api.beneficiaries.getAll();
            setBeneficiaries(response.data || []);
        } catch (err) {
            console.error('Failed to load beneficiaries:', err);
            setError('Failed to load beneficiaries. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBeneficiary = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await api.beneficiaries.create(formData);
            await loadBeneficiaries();
            setShowAddForm(false);
            setFormData({
                name: '',
                accountNumber: '',
                bankName: '',
                swiftCode: '',
                nickname: '',
                email: '',
            });
        } catch (err: any) {
            console.error('Failed to add beneficiary:', err);
            setError(err.response?.data?.message || 'Failed to add beneficiary.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this beneficiary?')) return;

        try {
            await api.beneficiaries.delete(id);
            setBeneficiaries(prev => prev.filter(b => b.id !== id));
        } catch (err) {
            console.error('Failed to delete beneficiary:', err);
            setError('Failed to delete beneficiary.');
        }
    };

    const filteredBeneficiaries = beneficiaries.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.bankName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Beneficiaries</h1>
                    <p className="text-gray-500">Manage your saved contacts for transfers</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add New Beneficiary</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} aria-label="Dismiss error"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Add Beneficiary Form */}
            {showAddForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-top-4 duration-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">New Beneficiary Details</h2>
                        <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close form">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleAddBeneficiary} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nickname (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.nickname}
                                    onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    placeholder="Family, Rent, etc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number / IBAN</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.accountNumber}
                                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    placeholder="ACCT123456789"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.bankName}
                                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    placeholder="Chase Bank"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT / BIC Code</label>
                                <input
                                    type="text"
                                    value={formData.swiftCode}
                                    onChange={e => setFormData({ ...formData, swiftCode: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    placeholder="CHASUS33"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Beneficiary'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, nickname, or bank..."
                    className="flex-1 outline-none text-gray-700 placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                </div>
            ) : filteredBeneficiaries.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBeneficiaries.map((beneficiary) => (
                        <div key={beneficiary.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-700 font-bold text-lg">
                                        {beneficiary.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{beneficiary.name}</h3>
                                        <p className="text-sm text-gray-500">{beneficiary.nickname || 'Personal'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(beneficiary.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    title="Delete Beneficiary"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    <span>{beneficiary.bankName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                    <span className="font-mono">{beneficiary.accountNumber}</span>
                                </div>
                                {beneficiary.swiftCode && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Globe className="w-4 h-4 text-gray-400" />
                                        <span className="font-mono">{beneficiary.swiftCode}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                <button className="text-sm font-medium text-green-700 hover:text-green-800">
                                    Transfer Money
                                </button>
                                {beneficiary.isInternal && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                        Internal
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No beneficiaries found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        Add people or businesses you frequently transfer money to for quicker payments.
                    </p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="mt-6 text-green-700 font-medium hover:underline"
                    >
                        Add your first beneficiary
                    </button>
                </div>
            )}
        </div>
    );
}
