'use client';

import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { BANK_INFO, ROUTES } from '@/lib/constants';

const footerNavigation = {
    products: [
        { name: 'Heritage Vault™ Accounts', href: '/products/heritage-vault' },
        { name: 'Legacy Builder Savings', href: '/products/legacy-builder' },
        { name: 'Golden Years Mortgages', href: '/products/mortgages' },
        { name: 'Vault Credit Cards', href: '/products/credit-cards' },
        { name: 'Founders Circle Business', href: '/products/business-banking' },
    ],
    services: [
        { name: 'Personal Banking', href: ROUTES.personalBanking },
        { name: 'Business Banking', href: ROUTES.businessBanking },
        { name: 'White Glove Banking', href: '/products/private-banking' },
        { name: 'Wealth Management', href: '/services/wealth-management' },
        { name: 'Online Banking', href: ROUTES.login },
    ],
    customerService: [
        { name: 'Help Center', href: '/help' },
        { name: 'Find a Branch', href: '/locations' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Security Center', href: '/security' },
        { name: 'Report Fraud', href: '/security/report-fraud' },
    ],
    company: [
        { name: 'About AURUM VAULT', href: ROUTES.about },
        { name: 'Leadership Team', href: '/about/leadership' },
        { name: 'Investor Relations', href: '/investors' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press & Media', href: '/press' },
        { name: 'Sustainability', href: '/sustainability' },
    ],
    legal: [
        { name: 'Privacy Policy', href: '/legal/privacy' },
        { name: 'Terms of Service', href: '/legal/terms' },
        { name: 'FDIC Insurance Info', href: '/legal/fdic' },
        { name: 'Online Banking Agreement', href: '/legal/ebanking-agreement' },
        { name: 'Accessibility', href: '/accessibility' },
    ],
    social: [
        { name: 'Facebook', icon: Facebook, href: '#' },
        { name: 'Twitter', icon: Twitter, href: '#' },
        { name: 'LinkedIn', icon: Linkedin, href: '#' },
        { name: 'Instagram', icon: Instagram, href: '#' },
    ],
};

export function Footer() {
    return (
        <footer className="bg-charcoal text-warm-cream" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8">
                        <div>
                            <span className="text-3xl font-playfair font-bold text-soft-gold">
                                {BANK_INFO.name}
                            </span>
                            <p className="mt-4 text-sm leading-6 text-warm-cream/80">
                                {BANK_INFO.tagline}
                            </p>
                            <p className="mt-2 text-sm text-warm-cream/60">
                                Serving customers since {BANK_INFO.founded}
                            </p>
                        </div>
                        <div className="flex space-x-6">
                            {footerNavigation.social.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="text-warm-cream/60 hover:text-soft-gold transition-colors"
                                >
                                    <span className="sr-only">{item.name}</span>
                                    <item.icon className="h-6 w-6" aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-soft-gold">Products</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {footerNavigation.products.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-warm-cream/80 hover:text-white transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-soft-gold">Services</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {footerNavigation.services.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-warm-cream/80 hover:text-white transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-soft-gold">Customer Service</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {footerNavigation.customerService.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-warm-cream/80 hover:text-white transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-soft-gold">Company</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {footerNavigation.company.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-warm-cream/80 hover:text-white transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-1 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-soft-gold">Legal & Compliance</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {footerNavigation.legal.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-warm-cream/80 hover:text-white transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-16 border-t border-warm-cream/10 pt-8 sm:mt-20 lg:mt-24">
                    <p className="text-xs leading-5 text-warm-cream/60 text-center">
                        &copy; {new Date().getFullYear()} {BANK_INFO.name}. All rights reserved. Member FDIC. Equal Housing Lender.
                    </p>
                </div>
            </div>
        </footer>
    );
}
