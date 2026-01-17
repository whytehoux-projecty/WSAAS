'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';
import { PortalStatusIndicator } from '@/components/portal/PortalStatusIndicator';

type PortalStatus = 'online' | 'offline' | 'maintenance' | 'scheduled_downtime';

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [portalStatus, setPortalStatus] = useState<PortalStatus>('offline');
    const [formData, setFormData] = useState({
        accountNumber: '',
        password: '',
        rememberMe: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        // Check if portal is online before attempting login
        if (portalStatus !== 'online') {
            setErrors({
                general: portalStatus === 'maintenance'
                    ? 'Portal is currently under maintenance. Please try again later.'
                    : portalStatus === 'scheduled_downtime'
                        ? 'Portal is undergoing scheduled maintenance. Please check back soon.'
                        : 'Portal is currently offline. Please try again later.'
            });
            setIsLoading(false);
            return;
        }

        // Validation
        const newErrors: Record<string, string> = {};

        if (!formData.accountNumber) {
            newErrors.accountNumber = 'Account number is required';
        } else if (!/^\d{10,12}$/.test(formData.accountNumber)) {
            newErrors.accountNumber = 'Account number must be 10-12 digits';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        // Simulate API call
        setTimeout(() => {
            // TODO: Replace with actual authentication
            console.log('Login attempt:', { accountNumber: formData.accountNumber });
            router.push('/e-banking/dashboard');
        }, 1500);
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-vintage-green/5 via-off-white to-soft-gold/10 flex items-center justify-center py-12 px-4">
                <div className="container mx-auto max-w-md">
                    {/* Compact Glassmorphic Login Card */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 p-8">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-playfair font-bold text-charcoal mb-2">
                                E-Banking Portal
                            </h1>
                            <p className="text-sm text-charcoal-light">
                                Sign in to access your account securely
                            </p>
                        </div>

                        {/* Portal Status Indicator */}
                        <PortalStatusIndicator
                            healthCheckUrl={process.env.NEXT_PUBLIC_PORTAL_HEALTH_URL || 'http://localhost:3001/api/portal/health'}
                            onStatusChange={setPortalStatus}
                            className="mb-6"
                        />

                        {/* General Error Message */}
                        {errors.general && (
                            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-lg">
                                <p className="text-sm text-red-700">{errors.general}</p>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Account Number */}
                            <div>
                                <label htmlFor="accountNumberInput" className="block text-sm font-semibold text-charcoal mb-2">
                                    Account Number
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-lighter">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="accountNumberInput"
                                        type="text"
                                        placeholder="Enter account number"
                                        value={formData.accountNumber}
                                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                                        maxLength={12}
                                        disabled={portalStatus !== 'online'}
                                        className="w-full h-12 pl-11 pr-4 rounded-lg border border-faded-gray bg-white/50 backdrop-blur-sm text-charcoal placeholder:text-charcoal-lighter focus:outline-none focus:ring-2 focus:ring-vintage-green focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                {errors.accountNumber && (
                                    <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="passwordInput" className="block text-sm font-semibold text-charcoal mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-lighter">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="passwordInput"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        disabled={portalStatus !== 'online'}
                                        className="w-full h-12 pl-11 pr-12 rounded-lg border border-faded-gray bg-white/50 backdrop-blur-sm text-charcoal placeholder:text-charcoal-lighter focus:outline-none focus:ring-2 focus:ring-vintage-green focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-lighter hover:text-charcoal transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                        disabled={portalStatus !== 'online'}
                                        className="w-4 h-4 rounded border-faded-gray text-vintage-green focus:ring-vintage-green disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <span className="text-sm text-charcoal-light">Remember me</span>
                                </label>
                                <Link href="/e-banking/auth/forgot-password" className="text-sm text-vintage-green hover:text-vintage-green-dark transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={portalStatus !== 'online' || isLoading}
                                className="w-full h-12 bg-vintage-green text-white font-semibold rounded-lg hover:bg-vintage-green-dark transition-all shadow-vintage hover:shadow-vintage-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? 'Signing in...' : portalStatus !== 'online' ? 'Portal Offline' : 'Sign In to Your Account'}
                            </button>

                            {/* Registration Link */}
                            <div className="text-center pt-4 border-t border-faded-gray-light">
                                <p className="text-sm text-charcoal-light">
                                    Don&apos;t have an account?{' '}
                                    <Link href="/e-banking/auth/signup" className="text-vintage-green hover:text-vintage-green-dark font-semibold transition-colors">
                                        Register for E-Banking →
                                    </Link>
                                </p>
                            </div>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 p-3 bg-soft-gold/10 backdrop-blur-sm rounded-lg border border-soft-gold/20">
                            <div className="flex items-center gap-2 justify-center">
                                <Shield className="w-4 h-4 text-vintage-green" />
                                <p className="text-xs text-charcoal-light text-center">
                                    Secure 256-bit SSL encrypted connection
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* New User Info */}
                    <div className="mt-6 text-center bg-white/60 backdrop-blur-lg rounded-xl p-6 border border-white/30">
                        <p className="text-sm text-charcoal-light mb-3">
                            <strong className="text-charcoal">New to AURUM VAULT?</strong>
                        </p>
                        <p className="text-sm text-charcoal-light mb-4">
                            Open an account today to access premium banking services.
                        </p>
                        <Link
                            href="/e-banking/auth/signup"
                            className="inline-flex items-center justify-center h-10 px-6 text-sm font-semibold rounded-lg bg-transparent text-vintage-green border-2 border-vintage-green hover:bg-vintage-green hover:text-white transition-all"
                        >
                            Open an Account
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
