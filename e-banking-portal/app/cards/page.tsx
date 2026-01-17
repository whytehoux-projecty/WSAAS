'use client';

import { useState, useEffect } from 'react';
import { Card as UICard, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api-client';
import { Plus, CreditCard, Shield, AlertTriangle, Lock, Unlock, Settings } from 'lucide-react';

export default function CardsPage() {
    const [cards, setCards] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [cardsRes, accountsRes] = await Promise.all([
                api.cards.getAll(),
                api.accounts.getAll()
            ]);
            setCards(cardsRes.cards || []);
            setAccounts(accountsRes.accounts || []);
        } catch (error) {
            console.error('Failed to fetch cards data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleIssueCard = async () => {
        if (accounts.length === 0) return alert('No accounts available to issue card.');
        const accountId = accounts[0].id; // Default to first account for MVP

        setActionLoading('issue');
        try {
            await api.cards.issue(accountId, 'DEBIT');
            await fetchData();
        } catch (error) {
            console.error('Issue failed', error);
            alert('Failed to issue card');
        } finally {
            setActionLoading(null);
        }
    };

    const toggleFreeze = async (card: any) => {
        setActionLoading(card.id);
        try {
            if (card.status === 'FROZEN') {
                await api.cards.unfreeze(card.id);
            } else {
                await api.cards.freeze(card.id);
            }
            await fetchData();
        } catch (error) {
            console.error('Freeze toggle failed', error);
        } finally {
            setActionLoading(null);
        }
    };

    const updateLimits = async (card: any) => {
        const newDaily = prompt('Enter new daily limit:', card.dailyLimit);
        if (!newDaily) return;

        setActionLoading(card.id);
        try {
            await api.cards.updateLimits(card.id, { dailyLimit: Number(newDaily) });
            await fetchData();
        } catch (error) {
            alert('Failed to update limits');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-vintage-gold">Loading cards...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal mb-2 font-heading">My Cards</h1>
                    <p className="text-charcoal-light">Manage your debit and credit cards</p>
                </div>
                <Button
                    onClick={handleIssueCard}
                    disabled={!!actionLoading}
                    icon={<Plus className="w-5 h-5" />}
                >
                    {actionLoading === 'issue' ? 'Issuing...' : 'Issue New Card'}
                </Button>
            </div>

            {cards.length === 0 ? (
                <UICard>
                    <CardContent className="p-12 text-center">
                        <CreditCard className="w-16 h-16 text-faded-gray mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-charcoal mb-2">No cards yet</h3>
                        <p className="text-charcoal-light mb-6">Issue your first card to get started.</p>
                        <Button onClick={handleIssueCard}>Issue Card</Button>
                    </CardContent>
                </UICard>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cards.map(card => (
                        <div key={card.id} className="relative group perspective-1000">
                            {/* Card Visual */}
                            <div className={`
                                h-56 rounded-2xl p-6 text-white shadow-xl transition-all duration-300 transform
                                ${card.status === 'FROZEN' ? 'bg-faded-gray grayscale' : 'bg-gradient-to-br from-charcoal to-black'}
                            `}>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-12 h-8 bg-soft-gold/30 rounded-md backdrop-blur-sm border border-soft-gold/50" />
                                    <span className="font-mono text-lg tracking-widest italic font-bold">VISA</span>
                                </div>

                                <div className="mb-6">
                                    <p className="font-mono text-2xl tracking-widest shadow-black drop-shadow-md">
                                        {'**** **** **** ' + card.cardNumber.slice(-4)}
                                    </p>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">Card Holder</p>
                                        <p className="font-medium tracking-wide">JOHN DOE</p> {/* Mock name */}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">Expires</p>
                                        <p className="font-medium tracking-wide">
                                            {new Date(card.expiryDate).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="mt-4 bg-white rounded-xl p-4 border border-faded-gray-light shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${card.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-sm font-medium text-charcoal capitalize">{card.status.toLowerCase()}</span>
                                    </div>
                                    <span className="text-xs text-charcoal-light font-mono">
                                        Limit: ${Number(card.dailyLimit).toLocaleString()}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={() => toggleFreeze(card)}
                                        disabled={!!actionLoading}
                                        className={card.status === 'FROZEN' ? 'text-vintage-green border-vintage-green' : 'text-red-500 border-red-200 hover:bg-red-50'}
                                    >
                                        {card.status === 'FROZEN' ? (
                                            <><Unlock size={14} className="mr-1" /> Unfreeze</>
                                        ) : (
                                            <><Lock size={14} className="mr-1" /> Freeze</>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={() => updateLimits(card)}
                                        disabled={!!actionLoading}
                                    >
                                        <Settings size={14} className="mr-1" /> Limits
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
