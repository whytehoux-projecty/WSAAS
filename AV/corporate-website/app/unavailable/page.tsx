'use client';


import Link from 'next/link';
import { WifiOff, RefreshCw, Home, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ServiceUnavailablePage() {
    const [retryCount, setRetryCount] = useState(0);
    const [isChecking, setIsChecking] = useState(false);

    const checkServiceStatus = async () => {
        setIsChecking(true);
        try {
            // Check if e-banking portal is available
            const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000';
            await fetch(`${portalUrl}/api/health`, {
                method: 'HEAD',
                mode: 'no-cors'
            });

            // If we can reach the portal, redirect to it
            window.location.href = portalUrl;
        } catch (_) {
            console.log('E-Banking Portal still unavailable');
        } finally {
            setIsChecking(false);
            setRetryCount(prev => prev + 1);
        }
    };

    useEffect(() => {
        // Auto-check every 30 seconds
        const interval = setInterval(checkServiceStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-off-white">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center py-12 px-4">
                <div className="container mx-auto max-w-2xl">
                    {/* Service Unavailable Card */}
                    <div className="bg-white rounded-xl shadow-2xl border border-faded-gray-light p-8 md:p-12 text-center">
                        {/* Icon */}
                        <div className="mb-8 flex justify-center">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                                    <WifiOff className="w-12 h-12 text-red-600" />
                                </div>
                                <div className="absolute inset-0 w-24 h-24 rounded-full bg-red-100 animate-ping opacity-20" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal mb-4">
                            E-Banking Portal Unavailable
                        </h1>

                        {/* Description */}
                        <p className="text-lg text-charcoal-light mb-8 max-w-xl mx-auto">
                            We&apos;re sorry, but the E-Banking Portal is currently unavailable. Our team is working to restore service as quickly as possible.
                        </p>

                        {/* Status Info */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                            <div className="flex items-start gap-3">
                                <WifiOff className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="text-left flex-1">
                                    <h3 className="font-semibold text-red-900 mb-2">Portal Status: Offline</h3>
                                    <p className="text-sm text-red-700">
                                        The E-Banking Portal is currently undergoing maintenance or experiencing technical difficulties.
                                        Please check back shortly or contact our support team for assistance.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <button
                                onClick={checkServiceStatus}
                                disabled={isChecking}
                                className="inline-flex items-center justify-center h-12 px-6 text-base font-semibold rounded-lg bg-vintage-green text-white hover:bg-vintage-green-dark transition-all shadow-vintage hover:shadow-vintage-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <RefreshCw className={`w-5 h-5 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                                {isChecking ? 'Checking...' : 'Try Again'}
                            </button>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center h-12 px-6 text-base font-semibold rounded-lg bg-transparent text-vintage-green border-2 border-vintage-green hover:bg-vintage-green hover:text-white transition-all"
                            >
                                <Home className="w-5 h-5 mr-2" />
                                Return to Homepage
                            </Link>
                        </div>

                        {/* Retry Count */}
                        {retryCount > 0 && (
                            <p className="text-xs text-gray-500 mb-6">
                                Checked {retryCount} {retryCount === 1 ? 'time' : 'times'}
                            </p>
                        )}

                        {/* Alternative Options */}
                        <div className="border-t border-faded-gray-light pt-8">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                                Need Immediate Assistance?
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4 text-left">
                                <div className="flex items-start gap-3 p-4 bg-off-white rounded-lg">
                                    <Phone className="w-5 h-5 text-vintage-green mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-charcoal mb-1">Call Us</h4>
                                        <a href="tel:1-800-287-8688" className="text-sm text-charcoal-light hover:text-vintage-green transition-colors">
                                            1-800-AURUM-88
                                        </a>
                                        <p className="text-xs text-gray-500 mt-1">Available 24/7</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-off-white rounded-lg">
                                    <Mail className="w-5 h-5 text-vintage-green mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-charcoal mb-1">Email Support</h4>
                                        <a href="mailto:support@aurumvault.com" className="text-sm text-charcoal-light hover:text-vintage-green transition-colors">
                                            support@aurumvault.com
                                        </a>
                                        <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 text-center bg-white/60 backdrop-blur-lg rounded-xl p-6 border border-faded-gray-light">
                        <p className="text-sm text-charcoal-light">
                            <strong className="text-charcoal">Service Updates:</strong> For real-time status updates and announcements,
                            please visit our{' '}
                            <Link href="/about" className="text-vintage-green hover:text-vintage-green-dark font-semibold transition-colors">
                                about page
                            </Link>
                            {' '}or contact our support team.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
