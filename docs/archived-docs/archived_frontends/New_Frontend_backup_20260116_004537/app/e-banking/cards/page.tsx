'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    CreditCard,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
    Settings,
    Plus
} from 'lucide-react';

const cardsData = [
    {
        id: 1,
        name: 'Rewards Credit Card',
        type: 'credit',
        cardNumber: '4532 1234 5678 9012',
        maskedNumber: '**** **** **** 9012',
        expiryDate: '12/28',
        cvv: '123',
        status: 'active',
        balance: -1420.00,
        creditLimit: 10000.00,
        cardholderName: 'JOHN DOE',
        issueDate: '2021-11-10',
        color: 'from-charcoal to-charcoal-dark',
    },
    {
        id: 2,
        name: 'Classic Debit Card',
        type: 'debit',
        cardNumber: '5234 5678 9012 3456',
        maskedNumber: '**** **** **** 3456',
        expiryDate: '06/27',
        cvv: '456',
        status: 'active',
        linkedAccount: 'Classic Checking',
        cardholderName: 'JOHN DOE',
        issueDate: '2020-03-15',
        color: 'from-vintage-green to-vintage-green-dark',
    },
    {
        id: 3,
        name: 'Business Debit Card',
        type: 'debit',
        cardNumber: '6011 9876 5432 1098',
        maskedNumber: '**** **** **** 1098',
        expiryDate: '09/26',
        cvv: '789',
        status: 'frozen',
        linkedAccount: 'Business Checking',
        cardholderName: 'JOHN DOE',
        issueDate: '2022-01-20',
        color: 'from-soft-gold-dark to-soft-gold',
    },
];

export default function CardsPage() {
    const [selectedCard, setSelectedCard] = useState(cardsData[0]);
    const [showCardDetails, setShowCardDetails] = useState(false);
    const [showCVV, setShowCVV] = useState(false);

    const handleToggleCardStatus = (cardId: number) => {
        // Simulate toggle
        alert(`Card ${cardId} status toggled`);
    };

    const handleReportLost = () => {
        alert('Report lost/stolen card functionality');
    };

    const handleRequestNew = () => {
        alert('Request new card functionality');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">My Cards</h1>
                    <p className="text-lg text-charcoal-light">Manage your debit and credit cards</p>
                </div>
                <Button variant="primary" size="medium" icon={<Plus className="w-5 h-5" />} onClick={handleRequestNew}>
                    Request New Card
                </Button>
            </div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {cardsData.map((card) => (
                    <div
                        key={card.id}
                        onClick={() => setSelectedCard(card)}
                        className={`cursor-pointer transition-all ${selectedCard.id === card.id ? 'scale-105' : 'hover:scale-102'
                            }`}
                    >
                        {/* Card Visual */}
                        <div className={`relative w-full aspect-[1.586/1] bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-vintage-xl`}>
                            {/* Card Status Badge */}
                            {card.status === 'frozen' && (
                                <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 rounded-full text-xs font-semibold">
                                    FROZEN
                                </div>
                            )}

                            {/* Card Type */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-xs opacity-80 uppercase tracking-wider">{card.type} Card</p>
                                    <p className="text-sm font-semibold mt-1">{card.name}</p>
                                </div>
                                <CreditCard className="w-8 h-8 opacity-80" />
                            </div>

                            {/* Card Number */}
                            <div className="mb-6">
                                <p className="text-xl font-mono tracking-wider">
                                    {showCardDetails ? card.cardNumber : card.maskedNumber}
                                </p>
                            </div>

                            {/* Card Details */}
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs opacity-80 mb-1">CARDHOLDER</p>
                                    <p className="text-sm font-semibold">{card.cardholderName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs opacity-80 mb-1">EXPIRES</p>
                                    <p className="text-sm font-semibold">{card.expiryDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Card Details */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{selectedCard.name}</CardTitle>
                                    <CardDescription>Card Details and Settings</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowCardDetails(!showCardDetails)}
                                        className="p-2 hover:bg-parchment rounded-lg transition-colors"
                                    >
                                        {showCardDetails ? (
                                            <EyeOff className="w-5 h-5 text-charcoal-light" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-charcoal-light" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Card Information */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-parchment rounded-lg">
                                    <p className="text-sm text-charcoal-light mb-1">Card Number</p>
                                    <p className="text-lg font-mono font-semibold text-charcoal">
                                        {showCardDetails ? selectedCard.cardNumber : selectedCard.maskedNumber}
                                    </p>
                                </div>
                                <div className="p-4 bg-parchment rounded-lg">
                                    <p className="text-sm text-charcoal-light mb-1">Expiry Date</p>
                                    <p className="text-lg font-semibold text-charcoal">{selectedCard.expiryDate}</p>
                                </div>
                                <div className="p-4 bg-parchment rounded-lg">
                                    <p className="text-sm text-charcoal-light mb-1">CVV</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-lg font-mono font-semibold text-charcoal">
                                            {showCVV ? selectedCard.cvv : '***'}
                                        </p>
                                        <button
                                            onClick={() => setShowCVV(!showCVV)}
                                            className="text-charcoal-light hover:text-charcoal transition-colors"
                                        >
                                            {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 bg-parchment rounded-lg">
                                    <p className="text-sm text-charcoal-light mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        {selectedCard.status === 'active' ? (
                                            <>
                                                <CheckCircle className="w-5 h-5 text-vintage-green" />
                                                <p className="text-lg font-semibold text-vintage-green capitalize">{selectedCard.status}</p>
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-5 h-5 text-red-600" />
                                                <p className="text-lg font-semibold text-red-600 capitalize">{selectedCard.status}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-off-white rounded-lg">
                                    <p className="text-sm text-charcoal-light mb-1">Card Type</p>
                                    <p className="font-semibold text-charcoal capitalize">{selectedCard.type}</p>
                                </div>
                                <div className="p-4 bg-off-white rounded-lg">
                                    <p className="text-sm text-charcoal-light mb-1">Issue Date</p>
                                    <p className="font-semibold text-charcoal">
                                        {new Date(selectedCard.issueDate).toLocaleDateString('en-US', {
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                                {selectedCard.type === 'credit' && (
                                    <>
                                        <div className="p-4 bg-off-white rounded-lg">
                                            <p className="text-sm text-charcoal-light mb-1">Current Balance</p>
                                            <p className="font-semibold text-red-600">
                                                ${Math.abs(selectedCard.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-off-white rounded-lg">
                                            <p className="text-sm text-charcoal-light mb-1">Credit Limit</p>
                                            <p className="font-semibold text-charcoal">
                                                ${selectedCard.creditLimit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </>
                                )}
                                {selectedCard.type === 'debit' && (
                                    <div className="p-4 bg-off-white rounded-lg md:col-span-2">
                                        <p className="text-sm text-charcoal-light mb-1">Linked Account</p>
                                        <p className="font-semibold text-charcoal">{selectedCard.linkedAccount}</p>
                                    </div>
                                )}
                            </div>

                            {/* Security Notice */}
                            <div className="p-4 bg-soft-gold/10 border border-soft-gold/20 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-soft-gold-dark flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-charcoal">
                                    <p className="font-semibold mb-1">Security Reminder</p>
                                    <p className="text-charcoal-light">
                                        Never share your card details, CVV, or PIN with anyone. AURUM VAULT will never ask for this information.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card Controls */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Card Controls</CardTitle>
                            <CardDescription>Manage your card settings and security</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Button
                                    variant={selectedCard.status === 'active' ? 'outline' : 'primary'}
                                    size="large"
                                    icon={selectedCard.status === 'active' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                                    onClick={() => handleToggleCardStatus(selectedCard.id)}
                                    className="w-full"
                                >
                                    {selectedCard.status === 'active' ? 'Freeze Card' : 'Unfreeze Card'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="large"
                                    icon={<Settings className="w-5 h-5" />}
                                    className="w-full"
                                >
                                    Change PIN
                                </Button>
                                <Button
                                    variant="outline"
                                    size="large"
                                    icon={<AlertCircle className="w-5 h-5" />}
                                    onClick={handleReportLost}
                                    className="w-full"
                                >
                                    Report Lost/Stolen
                                </Button>
                                <Button
                                    variant="outline"
                                    size="large"
                                    icon={<CreditCard className="w-5 h-5" />}
                                    className="w-full"
                                >
                                    View Transactions
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Info Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-lg">Card Limits</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-charcoal-light">Daily ATM Limit</span>
                                    <span className="font-semibold text-charcoal">$1,000</span>
                                </div>
                                <div className="w-full bg-faded-gray-light rounded-full h-2">
                                    <div className="bg-vintage-green h-2 rounded-full" style={{ width: '30%' }}></div>
                                </div>
                                <p className="text-xs text-charcoal-light mt-1">$300 used today</p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-charcoal-light">Daily Purchase Limit</span>
                                    <span className="font-semibold text-charcoal">$5,000</span>
                                </div>
                                <div className="w-full bg-faded-gray-light rounded-full h-2">
                                    <div className="bg-vintage-green h-2 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                                <p className="text-xs text-charcoal-light mt-1">$2,250 used today</p>
                            </div>

                            {selectedCard.type === 'credit' && (
                                <div className="pt-4 border-t border-faded-gray-light">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-charcoal-light">Credit Utilization</span>
                                        <span className="font-semibold text-charcoal">
                                            {((Math.abs(selectedCard.balance || 0) / (selectedCard.creditLimit || 1)) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-faded-gray-light rounded-full h-2">
                                        <div
                                            className="bg-soft-gold-dark h-2 rounded-full"
                                            style={{ width: `${((Math.abs(selectedCard.balance || 0) / (selectedCard.creditLimit || 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Card Benefits</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {selectedCard.type === 'credit' && (
                                <>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-vintage-green flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-charcoal">1.5% cash back on all purchases</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-vintage-green flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-charcoal">No annual fee</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-vintage-green flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-charcoal">Travel insurance included</p>
                                    </div>
                                </>
                            )}
                            {selectedCard.type === 'debit' && (
                                <>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-vintage-green flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-charcoal">Free ATM withdrawals worldwide</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-vintage-green flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-charcoal">Contactless payments</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-vintage-green flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-charcoal">Purchase protection</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
