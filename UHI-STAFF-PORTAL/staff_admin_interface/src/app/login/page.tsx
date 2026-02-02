'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
    const [staffId, setStaffId] = useState('');
    const [password, setPassword] = useState('');
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(staffId.trim(), password, showTwoFactor ? twoFactorToken : undefined);
            router.push('/');
        } catch (err: any) {
            console.error('Login error:', err);
            // Check for 2FA requirement
            if (err?.message?.includes('Two-factor') || err?.status === 403) {
                if (!showTwoFactor) {
                    setShowTwoFactor(true);
                    setLoading(false);
                    return;
                }
            }
            setError(err?.message || 'Login failed. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-[var(--primary-color)] text-white p-12 flex-col justify-center items-center relative overflow-hidden">
                <div className="relative z-10 text-center">
                    <img
                        src="/assets/logo.svg"
                        alt="UHI Logo"
                        width={120}
                        height={120}
                        className="mb-8 mx-auto bg-white rounded-full p-4"
                    />
                    <h1 className="text-4xl font-bold mb-4">Admin Portal</h1>
                    <p className="text-xl opacity-90 max-w-md mx-auto">
                        Secure access for administrators to manage staff, applications, and portal settings.
                    </p>
                </div>

                {/* Decorative circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {showTwoFactor ? 'Two-Factor Authentication' : 'Sign In'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-2">
                                {showTwoFactor ? 'Enter the code from your authenticator app' : 'Enter your admin credentials'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {!showTwoFactor ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="staffId">
                                            Admin ID / Username
                                        </label>
                                        <input
                                            type="text"
                                            id="staffId"
                                            value={staffId}
                                            onChange={(e) => setStaffId(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="twoFactor">
                                        Authentication Code
                                    </label>
                                    <input
                                        type="text"
                                        id="twoFactor"
                                        value={twoFactorToken}
                                        onChange={(e) => setTwoFactorToken(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest"
                                        placeholder="000000"
                                        maxLength={6}
                                        required
                                        autoFocus
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--primary-color)] text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Authenticating...' : (showTwoFactor ? 'Verify' : 'Sign In')}
                            </button>

                            {showTwoFactor && (
                                <button
                                    type="button"
                                    onClick={() => { setShowTwoFactor(false); setError(''); setTwoFactorToken(''); }}
                                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancel and go back
                                </button>
                            )}
                        </form>

                        <div className="mt-8 text-center text-xs text-gray-400">
                            &copy; {new Date().getFullYear()} United Health Initiative. All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
