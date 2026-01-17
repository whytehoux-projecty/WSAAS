'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Receipt,
    Wallet,
    CreditCard,
    FileText,
    Users,
    Settings,
    HelpCircle,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/e-banking/dashboard', icon: LayoutDashboard },
    { name: 'Transfer', href: '/e-banking/transfer', icon: ArrowLeftRight },
    { name: 'Transactions', href: '/e-banking/transactions', icon: Receipt },
    { name: 'Accounts', href: '/e-banking/accounts', icon: Wallet },
    { name: 'Cards', href: '/e-banking/cards', icon: CreditCard },
    { name: 'Bills', href: '/e-banking/bills', icon: FileText },
    { name: 'Beneficiaries', href: '/e-banking/beneficiaries', icon: Users },
    { name: 'Statements', href: '/e-banking/statements', icon: FileText },
    { name: 'Settings', href: '/e-banking/settings', icon: Settings },
    { name: 'Support', href: '/e-banking/support', icon: HelpCircle },
];

export default function EBankingLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Don't show sidebar on auth pages
    if (pathname?.includes('/auth/')) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-off-white">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-charcoal/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-vintage-green to-vintage-green-dark text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <Link href="/e-banking/dashboard" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-soft-gold flex items-center justify-center">
                                <span className="text-lg font-playfair font-bold text-charcoal">AV</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-playfair font-bold">AURUM VAULT</h1>
                                <p className="text-xs text-warm-cream/80">E-Banking</p>
                            </div>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-white hover:text-soft-gold transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-soft-gold/20 relative flex items-center justify-center">
                                <Image
                                    src="/images/icons/default-avatar.svg"
                                    alt="John Doe"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6"
                                />
                            </div>
                            <div>
                                <p className="font-semibold">John Doe</p>
                                <p className="text-sm text-warm-cream/80">Account: ****5678</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        <ul className="space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={cn(
                                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                                                isActive
                                                    ? 'bg-white/20 text-white font-semibold'
                                                    : 'text-warm-cream/90 hover:bg-white/10 hover:text-white'
                                            )}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-white/10">
                        <Link
                            href="/e-banking/auth/login"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-warm-cream/90 hover:bg-white/10 hover:text-white transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white border-b border-faded-gray-light">
                    <div className="flex items-center justify-between px-4 py-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-charcoal hover:text-vintage-green transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-4 ml-auto">
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-parchment rounded-lg">
                                <span className="text-sm text-charcoal-light">Total Balance:</span>
                                <span className="text-lg font-semibold text-vintage-green font-mono">$12,847.32</span>
                            </div>

                            <button className="relative p-2 text-charcoal hover:text-vintage-green transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-soft-gold rounded-full"></span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
