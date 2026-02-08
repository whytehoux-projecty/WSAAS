'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api-client';
import {
    Globe,
    FileText,
    Check,
    Building
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountrySelector } from './components/CountrySelector';
import { ServiceCategoryGrid } from './components/ServiceCategoryGrid';
import { InvoiceUploader } from './components/InvoiceUploader';
import { VintageIcon } from '@/components/ui/vintage-icon';
import { cn } from '@/lib/utils';


// Mock Providers for Demo
const MOCK_PROVIDERS: Record<string, Record<string, string[]>> = {
    'usa': {
        'UTILITIES': ['Pacific Gas & Electric', 'Con Edison', 'Duke Energy', 'National Grid'],
        'INTERNET': ['AT&T Fiber', 'Comcast Xfinity', 'Verizon Fios', 'Spectrum'],
        'MOBILE': ['Verizon Wireless', 'T-Mobile', 'AT&T', 'Boost Mobile'],
        'CREDIT': ['Chase Card Services', 'Amex', 'Citi Cards', 'Discover'],
        'INSURANCE': ['State Farm', 'Geico', 'Progressive']
    },
    'canada': {
        'UTILITIES': ['Hydro One', 'BC Hydro', 'Enbridge Gas'],
        'INTERNET': ['Rogers Ignite', 'Bell Fibe', 'Telus PureFibre'],
        'MOBILE': ['Rogers', 'Bell Mobility', 'Telus', 'Freedom Mobile'],
        'CREDIT': ['RBC Visa', 'TD Visa', 'Scotiabank Amex'],
        'INSURANCE': ['Intact', 'Aviva Canada']
    },
    'uk': {
        'UTILITIES': ['British Gas', 'EDF Energy', 'Scottish Power', 'Thames Water'],
        'INTERNET': ['BT Broadband', 'Virgin Media', 'Sky Broadband', 'TalkTalk'],
        'TV': ['Sky TV', 'Virgin Media TV'],
        'MOBILE': ['EE', 'Vodafone UK', 'O2', 'Three'],
        'COUNCIL': ['London Borough of Camden', 'Manchester City Council']
    },
    'france': {
        'UTILITIES': ['EDF France', 'Engie', 'TotalEnergies'],
        'INTERNET': ['Orange Livebox', 'Freebox', 'SFR Box'],
        'MOBILE': ['Orange', 'SFR', 'Bouygues', 'Free Mobile'],
        'INSURANCE': ['AXA France', 'Allianz']
    },
    'germany': {
        'UTILITIES': ['E.ON', 'Vattenfall', 'RWE'],
        'INTERNET': ['Deutsche Telekom', 'Vodafone Kabel', 'O2 DSL'],
        'MOBILE': ['Telekom', 'Vodafone', 'O2 DE'],
        'INSURANCE': ['Allianz', 'HUK-Coburg']
    },
    'italy': {
        'UTILITIES': ['Enel Energia', 'A2A', 'Hera Comm'],
        'INTERNET': ['TIM', 'Vodafone Italia', 'Fastweb'],
        'MOBILE': ['TIM', 'Vodafone', 'WindTre', 'Iliad']
    },
    'spain': {
        'UTILITIES': ['Iberdrola', 'Endesa', 'Naturgy'],
        'INTERNET': ['Movistar', 'Vodafone España', 'Orange'],
        'MOBILE': ['Movistar', 'Vodafone', 'Orange', 'Yoigo']
    },
    'switzerland': {
        'UTILITIES': ['BKW', 'EWZ'],
        'INTERNET': ['Swisscom', 'Sunrise', 'Salt'],
        'MOBILE': ['Swisscom', 'Sunrise', 'Salt']
    },
    'belgium': {
        'UTILITIES': ['Engie Electrabel', 'Luminus'],
        'INTERNET': ['Proximus', 'Telenet', 'VOO'],
        'MOBILE': ['Proximus', 'Orange Belgium', 'Base']
    },
    'central-europe': {
        'UTILITIES': ['ČEZ Group', 'MVM', 'PGE'],
        'INTERNET': ['Orange Poland', 'UPC', 'T-Mobile'],
        'MOBILE': ['T-Mobile', 'Orange', 'O2', 'Vodafone']
    },
    'east-asia': {
        'UTILITIES': ['TEPCO (JP)', 'KEPCO (KR)', 'State Grid (CN)'],
        'MOBILE': ['NTT Docomo', 'SK Telecom', 'China Mobile', 'SoftBank'],
        'INTERNET': ['NTT East', 'KT Corporation', 'China Telecom']
    },
    'west-africa': {
        'UTILITIES': ['Eko Electricity (NG)', 'Ikeja Electric (NG)', 'ECG (GH)', 'Senelec (SN)'],
        'INTERNET': ['MTN Nigeria', 'Spectranet', 'Vodafone Ghana', 'Orange Senegal'],
        'TV': ['DSTV Africa', 'GOtv', 'StarTimes'],
        'MOBILE': ['MTN', 'Airtel Africa', 'Glo', '9mobile']
    }
};

export default function BillsPage() {
    // Data State
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Flow State
    const [activeTab, setActiveTab] = useState<'quick' | 'invoice'>('quick');
    const [step, setStep] = useState(1); // 1: Country/Cat, 2: Provider/Details, 3: Success

    // Form State
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('');

    // Invoice State
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [invoiceData, setInvoiceData] = useState<any>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await api.accounts.getAll();
                setAccounts(res.accounts || []);
                if (res.accounts?.length > 0) setSelectedAccountId(res.accounts[0].id);
            } catch (err) {
                console.error("Failed to load accounts", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, []);

    // Derived Data
    const availableProviders = (selectedCountry && selectedCategory)
        ? (MOCK_PROVIDERS[selectedCountry]?.[selectedCategory] || ['Local Provider'])
        : [];

    const handleQuickPay = async () => {
        if (!amount || !selectedAccountId || !selectedProvider) return;

        setLoading(true);
        try {
            // 1. Resolve Payee (Find or Create)
            const payeesRes = await api.bills.getPayees();
            let payee = payeesRes.payees.find((p: any) => p.name === selectedProvider);

            if (!payee) {
                const newPayeeRes = await api.bills.addPayee({
                    name: selectedProvider,
                    accountNumber: customerId || 'UNKNOWN',
                    category: selectedCategory || 'General'
                });
                payee = newPayeeRes.payee;
            }

            // 2. Process Payment
            await api.bills.pay({
                payeeId: payee.id,
                amount: parseFloat(amount),
                accountId: selectedAccountId,
                paymentDate: new Date().toISOString()
            });

            setStep(3); // Success Screen
        } catch (error) {
            console.error('Payment failed', error);
            // In a real app, show error toast
        } finally {
            setLoading(false);
        }
    };

    const handleInvoicePay = async () => {
        if (!amount || !selectedAccountId || !invoiceFile) return;

        setLoading(true); // Using loading state for UI feedback
        try {
            // 1. Resolve Payee
            const payeeName = invoiceData?.merchantName || 'Unknown Merchant';
            const payeesRes = await api.bills.getPayees();
            let payee = payeesRes.payees.find((p: any) => p.name === payeeName);

            if (!payee) {
                const newPayeeRes = await api.bills.addPayee({
                    name: payeeName,
                    accountNumber: invoiceData?.accountNumber || 'UNKNOWN',
                    category: 'Bill'
                });
                payee = newPayeeRes.payee;
            }

            // 2. Prepare FormData for Verified Payment
            const formData = new FormData();
            formData.append('file', invoiceFile);
            formData.append('payeeId', payee.id);
            formData.append('accountId', selectedAccountId);
            formData.append('amount', amount);

            await api.bills.payVerified(formData);

            setStep(3);
        } catch (error) {
            console.error('Invoice payment failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvoiceUpload = async (file: File) => {
        setInvoiceFile(file);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.bills.uploadInvoice(formData);

            if (res?.data) {
                setInvoiceData(res.data);
                if (res.data.amount) setAmount(res.data.amount.toString());
            } else {
                // Fallback for demo if API fails
                setInvoiceData({ amount: 1250.00, invoiceNumber: 'INV-DEMO-2026' });
                setAmount('1250.00');
            }
        } catch (err) {
            console.error(err);
            // Fallback for demo
            setInvoiceData({ amount: 1250.00, invoiceNumber: 'INV-DEMO-2026' });
            setAmount('1250.00');
        } finally {
            setUploading(false);
        }
    };

    const resetFlow = () => {
        setStep(1);
        setSelectedCountry('');
        setSelectedCategory('');
        setSelectedProvider('');
        setAmount('');
        setCustomerId('');
        setInvoiceFile(null);
        setInvoiceData(null);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 animate-fade-in-up">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-charcoal">Global Bill Payments</h1>
                    <p className="text-muted-foreground mt-1">Pay for services worldwide or upload an invoice.</p>
                </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-4 mb-6">
                <div
                    onClick={() => setActiveTab('quick')}
                    className={cn(
                        "flex-1 p-6 rounded-xl border cursor-pointer transition-all hover:shadow-md flex items-center gap-4",
                        activeTab === 'quick' ? "bg-charcoal text-white shadow-lg border-charcoal" : "bg-white text-muted-foreground hover:bg-gray-50"
                    )}
                >
                    <div className="p-3 bg-white/10 rounded-full"><Globe className="w-6 h-6" /></div>
                    <div>
                        <h3 className="font-semibold text-lg">Global Gateway</h3>
                        <p className="text-sm opacity-80">Pay providers by region</p>
                    </div>
                </div>

                <div
                    onClick={() => setActiveTab('invoice')}
                    className={cn(
                        "flex-1 p-6 rounded-xl border cursor-pointer transition-all hover:shadow-md flex items-center gap-4",
                        activeTab === 'invoice' ? "bg-vintage-gold text-white shadow-lg border-vintage-gold" : "bg-white text-muted-foreground hover:bg-gray-50"
                    )}
                >
                    <div className="p-3 bg-white/10 rounded-full"><FileText className="w-6 h-6" /></div>
                    <div>
                        <h3 className="font-semibold text-lg">Pay with Invoice</h3>
                        <p className="text-sm opacity-80">Upload & Pay instantly</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">

                {/* 1. Quick Pay Flow */}
                {activeTab === 'quick' && (
                    <div className="space-y-8">
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-left-4 space-y-8">
                                <section>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <span className="bg-charcoal text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                        Select Region
                                    </h3>
                                    <div className="max-w-md">
                                        <CountrySelector value={selectedCountry} onChange={setSelectedCountry} />
                                    </div>
                                </section>

                                {selectedCountry && (
                                    <section className="animate-in fade-in slide-in-from-bottom-4">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <span className="bg-charcoal text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                            Choose Service Category
                                        </h3>
                                        <ServiceCategoryGrid value={selectedCategory} onChange={(cat) => { setSelectedCategory(cat); setStep(2); }} />
                                    </section>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 max-w-2xl mx-auto">
                                <Button variant="ghost" className="mb-4 pl-0" onClick={() => setStep(1)}>← Back to Selection</Button>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Details</CardTitle>
                                        <CardDescription>
                                            Paying for <span className="font-semibold text-charcoal">{selectedCategory}</span> in <span className="font-semibold text-charcoal capitalize">{selectedCountry}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Select Provider</Label>
                                            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose Service Provider" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableProviders.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Customer ID / Account Number</Label>
                                            <Input
                                                placeholder="e.g. 123456789"
                                                value={customerId}
                                                onChange={e => setCustomerId(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Amount</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={amount}
                                                    onChange={e => setAmount(e.target.value)}
                                                    className="pl-7"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Pay From</Label>
                                            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accounts.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id}>
                                                            {acc.name} (****{acc.accountNumber.slice(-4)}) - ${Number(acc.balance).toLocaleString()}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button className="w-full h-12 text-lg mt-4" onClick={handleQuickPay} disabled={!selectedProvider || !amount || !customerId}>
                                            Confirm Payment
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                                    <Check className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-charcoal mb-2">Payment Successful!</h2>
                                <p className="text-muted-foreground text-center max-w-md mb-8">
                                    Your payment of <strong>${amount}</strong> to <strong>{selectedProvider}</strong> has been processed securely.
                                </p>
                                <Button onClick={resetFlow}>Make Another Payment</Button>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Invoice Flow */}
                {activeTab === 'invoice' && (
                    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in">
                        {!invoiceData ? (
                            <Card className="border-none shadow-vintage-lg">
                                <CardContent className="p-8">
                                    <InvoiceUploader
                                        onFileSelect={handleInvoiceUpload}
                                        currentFile={invoiceFile}
                                        isUploading={uploading}
                                        error={null}
                                        onClear={() => { setInvoiceFile(null); setInvoiceData(null); }}
                                    />
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="animate-in slide-in-from-bottom-8">
                                <CardHeader className="bg-gray-50 border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <VintageIcon icon={Building} variant="gold" size="sm" />
                                        Invoice Details Extracted
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                                        <div>
                                            <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Total Amount</p>
                                            <p className="text-2xl font-bold font-mono text-charcoal">${Number(amount).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Invoice Number</p>
                                            <p className="text-lg font-mono text-charcoal">{invoiceData.invoiceNumber || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Pay From</Label>
                                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map(acc => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        {acc.name} (****{acc.accountNumber.slice(-4)}) - ${Number(acc.balance).toLocaleString()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button variant="outline" className="flex-1" onClick={() => { setInvoiceData(null); setInvoiceFile(null); }}>
                                            Cancel
                                        </Button>
                                        <Button className="flex-1 bg-vintage-gold text-white hover:bg-vintage-gold-dark" onClick={handleInvoicePay} disabled={loading}>
                                            {loading ? 'Processing...' : 'Pay Invoice Now'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {step === 3 && (
                            <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                                    <Check className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-charcoal mb-2">Invoice Paid!</h2>
                                <p className="text-muted-foreground text-center max-w-md mb-8">
                                    Your invoice has been settled successfully. Keep the receipt for your records.
                                </p>
                                <Button onClick={resetFlow}>Back to Bills</Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
