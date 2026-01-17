'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';

const navigation = [
    { name: 'Personal Banking', href: ROUTES.personalBanking },
    { name: 'Business Banking', href: ROUTES.businessBanking },
    { name: 'About', href: ROUTES.about },
];

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="bg-off-white border-b border-faded-gray-light sticky top-0 z-50 backdrop-blur-sm bg-off-white/95">
            <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
                <div className="flex lg:flex-1">
                    <Link href={ROUTES.home} className="-m-1.5 p-1.5 flex items-center gap-3">
                        <Image
                            src="/images/logos/aurum-vault-logo-primary.png"
                            alt="AURUM VAULT"
                            width={180}
                            height={60}
                            className="h-10 w-auto"
                            priority
                        />
                    </Link>
                </div>
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-charcoal"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Open main menu</span>
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
                <div className="hidden lg:flex lg:gap-x-12">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-base font-medium text-charcoal hover:text-vintage-green transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
                <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-4">
                    <Link href={ROUTES.login}>
                        <Button variant="outline" size="small">
                            Log in
                        </Button>
                    </Link>
                    <Link href={ROUTES.signup}>
                        <Button variant="primary" size="small">
                            Open Account
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden">
                    <div className="fixed inset-0 z-50" />
                    <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-off-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-faded-gray">
                        <div className="flex items-center justify-between">
                            <Link href={ROUTES.home} className="-m-1.5 p-1.5">
                                <Image
                                    src="/images/logos/aurum-vault-logo-primary.png"
                                    alt="AURUM VAULT"
                                    width={150}
                                    height={50}
                                    className="h-8 w-auto"
                                />
                            </Link>
                            <button
                                type="button"
                                className="-m-2.5 rounded-md p-2.5 text-charcoal"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Close menu</span>
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-faded-gray-light">
                                <div className="space-y-2 py-6">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-charcoal hover:bg-warm-cream"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                                <div className="py-6 space-y-3">
                                    <Link href={ROUTES.login} onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" size="medium" className="w-full">
                                            Log in
                                        </Button>
                                    </Link>
                                    <Link href={ROUTES.signup} onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="primary" size="medium" className="w-full">
                                            Open Account
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
