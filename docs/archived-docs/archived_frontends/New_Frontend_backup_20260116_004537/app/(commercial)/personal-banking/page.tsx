import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Hero } from '@/components/commercial/Hero';

const accountTypes = [
    {
        id: 1,
        title: 'Classic Checking',
        description: 'Your everyday banking made simple and secure. Perfect for managing daily transactions with no monthly fees.',
        icon: '/images/icons/checking-account-icon.svg',
        features: [
            'No monthly maintenance fees',
            'Free online bill pay',
            'Mobile check deposit',
            'Overdraft protection available',
            'Free debit card with rewards',
            'Unlimited transactions',
        ],
        rate: '0.15% APY',
        minimum: 'None',
        cta: 'Learn More',
        href: '#checking',
    },
    {
        id: 2,
        title: 'Growth Savings',
        description: 'Watch your money grow with competitive rates and flexible access to your funds whenever you need them.',
        icon: '/images/icons/savings-account-icon.svg',
        features: [
            'Competitive interest rates up to 4.2% APY',
            'No minimum balance requirement',
            'Free transfers to checking',
            'Monthly interest compounding',
            'FDIC insured up to $250,000',
            'Mobile app access',
        ],
        rate: 'Up to 4.2% APY*',
        minimum: 'None',
        cta: 'Open Savings',
        href: '#savings',
    },
    {
        id: 3,
        title: 'Rewards Credit Card',
        description: 'Earn while you spend with our rewards program. Enjoy benefits and build credit responsibly.',
        icon: '/images/icons/credit-card-icon.svg',
        features: [
            '1.5% cash back on all purchases',
            'No annual fee first year',
            'Travel insurance included',
            'Purchase protection',
            '0% intro APR for 12 months',
            'Contactless payment',
        ],
        rate: '13.99% - 24.99% APR variable*',
        minimum: 'Up to $25,000 limit',
        cta: 'Apply Now',
        href: '#credit',
    },
    {
        id: 4,
        title: 'Personal Loans',
        description: 'Achieve your goals with flexible financing. From home improvements to debt consolidation.',
        icon: '/images/icons/business-loan-icon.svg',
        features: [
            'Loan amounts up to $50,000',
            'Competitive rates from 5.9% APR',
            'Flexible terms 12-84 months',
            'No origination fees',
            'Fast approval process',
            'No prepayment penalties',
        ],
        rate: 'From 5.9% APR*',
        minimum: 'Up to $50,000',
        cta: 'Get Pre-Qualified',
        href: '#loans',
    },
];

export default function PersonalBankingPage() {
    return (
        <>
            <Header />
            <main>
                {/* Hero Section */}
                <Hero
                    headline="Personal Banking Built Around Your Life"
                    subheadline="From everyday checking to long-term savings, we offer the accounts and services you need to achieve your financial goals."
                    primaryCTA={{ text: 'Open an Account Today', href: '#accounts' }}
                    secondaryCTA={{ text: 'Compare Accounts', href: '#compare' }}
                    image="/images/commercial/heroes/hero-personal-banking.png"
                />

                {/* Account Types */}
                <section id="accounts" className="py-20 bg-off-white">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-4">
                                Choose the Right Account for You
                            </h2>
                            <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
                                Whether you're saving for the future or managing daily expenses, we have the perfect solution
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {accountTypes.map((account) => (
                                <Card key={account.id} className="hover:shadow-vintage-xl transition-all">
                                    <CardHeader>
                                        <div className="w-16 h-16 rounded-full bg-vintage-green/10 flex items-center justify-center text-vintage-green mb-4">
                                            <Image
                                                src={account.icon}
                                                alt={account.title}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8"
                                            />
                                        </div>
                                        <CardTitle>{account.title}</CardTitle>
                                        <CardDescription>{account.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <ul className="space-y-3">
                                            {account.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-vintage-green flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm text-charcoal-light">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="pt-4 border-t border-faded-gray-light space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-charcoal-light">Interest Rate:</span>
                                                <span className="text-lg font-semibold text-vintage-green">{account.rate}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-charcoal-light">Minimum:</span>
                                                <span className="text-sm font-medium text-charcoal">{account.minimum}</span>
                                            </div>
                                        </div>
                                        <Link href={account.href}>
                                            <Button variant="primary" className="w-full">
                                                {account.cta}
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mobile Banking Features */}
                <section className="py-20 bg-parchment">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-6">
                                    Modern Banking at Your Fingertips
                                </h2>
                                <p className="text-lg text-charcoal-light mb-8">
                                    Manage your accounts anytime, anywhere with our award-winning mobile app
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        'Mobile check deposit',
                                        'Pay bills on the go',
                                        'Transfer funds instantly',
                                        'Track spending by category',
                                        'Set savings goals',
                                        'Receive real-time alerts',
                                        'Touch ID / Face ID login',
                                        'Find ATMs near you',
                                    ].map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <CheckCircle className="w-6 h-6 text-vintage-green" />
                                            <span className="text-base text-charcoal">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-vintage-xl">
                                <Image
                                    src="/images/portal/mobile-app-mockup.png"
                                    alt="AURUM VAULT Mobile App"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-vintage-green text-white">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-lg md:text-xl mb-8 text-warm-cream">
                            Open your account in minutes and start experiencing banking the way it should be.
                        </p>
                        <Link href="/e-banking/auth/signup">
                            <Button variant="primary" size="large">
                                Open Your Account Now
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
