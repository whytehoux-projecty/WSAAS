import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Hero } from '@/components/commercial/Hero';

const businessServices = [
    {
        id: 1,
        title: 'Business Checking',
        description: 'Streamline your business finances with accounts designed for companies of all sizes.',
        icon: '/images/icons/checking-account-icon.svg',
        features: [
            'No monthly fees for first year',
            'Unlimited transactions',
            'Free online banking',
            'Mobile check deposit',
            'Cash management tools',
            'Dedicated business support',
        ],
    },
    {
        id: 2,
        title: 'Merchant Services',
        description: 'Accept payments with ease using our comprehensive merchant processing solutions.',
        icon: '/images/icons/credit-card-icon.svg',
        features: [
            'Competitive processing rates',
            'Accept all major cards',
            'Point-of-sale systems',
            'Online payment gateway',
            'Mobile card readers',
            '24/7 fraud protection',
        ],
    },
    {
        id: 3,
        title: 'Business Loans',
        description: 'Fuel your growth with flexible financing options tailored to your business needs.',
        icon: '/images/icons/business-loan-icon.svg',
        features: [
            'Loans up to $500,000',
            'Competitive rates from 4.9% APR',
            'Flexible repayment terms',
            'Fast approval process',
            'Equipment financing',
            'Commercial real estate loans',
        ],
    },
    {
        id: 4,
        title: 'Payroll Services',
        description: 'Simplify payroll management with our automated solutions and expert support.',
        icon: '/images/icons/trust-users-icon.svg',
        features: [
            'Automated payroll processing',
            'Direct deposit',
            'Tax filing assistance',
            'Employee self-service portal',
            'Time tracking integration',
            'Compliance support',
        ],
    },
];

const successStories = [
    {
        id: 1,
        business: 'Martinez Family Restaurant',
        owner: 'Maria Martinez',
        quote: 'AURUM VAULT helped us expand from one location to three. Their business loans and merchant services made growth possible.',
        result: '3x Revenue Growth',
    },
    {
        id: 2,
        business: 'Chen Tech Solutions',
        owner: 'David Chen',
        quote: 'The payroll services saved us countless hours. We can focus on our clients instead of paperwork.',
        result: '20 Hours Saved Monthly',
    },
    {
        id: 3,
        business: 'Thompson Construction',
        owner: 'James Thompson',
        quote: 'Equipment financing from AURUM VAULT allowed us to modernize our fleet and win bigger contracts.',
        result: '$2M in New Contracts',
    },
];

export default function BusinessBankingPage() {
    return (
        <>
            <Header />
            <main>
                {/* Hero Section */}
                <Hero
                    headline="Banking Solutions Built for Business"
                    subheadline="From startups to established enterprises, we provide the financial tools and expertise to help your business thrive."
                    primaryCTA={{ text: 'Explore Business Services', href: '#services' }}
                    secondaryCTA={{ text: 'Schedule Consultation', href: '#contact' }}
                    image="/images/commercial/heroes/hero-business-banking.png"
                />

                {/* Business Services */}
                <section id="services" className="py-20 bg-off-white">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-4">
                                Comprehensive Business Banking
                            </h2>
                            <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
                                Everything your business needs to manage finances, accept payments, and grow
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {businessServices.map((service) => (
                                <Card key={service.id} className="hover:shadow-vintage-xl transition-all">
                                    <CardHeader>
                                        <div className="w-16 h-16 rounded-full bg-soft-gold/10 flex items-center justify-center text-soft-gold-dark mb-4">
                                            <Image
                                                src={service.icon}
                                                alt={service.title}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8"
                                            />
                                        </div>
                                        <CardTitle>{service.title}</CardTitle>
                                        <CardDescription>{service.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {service.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-vintage-green flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm text-charcoal-light">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Success Stories */}
                <section className="py-20 bg-parchment">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-4">
                                Success Stories
                            </h2>
                            <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
                                See how we've helped businesses like yours achieve their goals
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {successStories.map((story) => (
                                <Card key={story.id}>
                                    <CardHeader>
                                        <div className="w-12 h-12 rounded-full bg-vintage-green/10 flex items-center justify-center mb-4">
                                            <span className="text-2xl">🏆</span>
                                        </div>
                                        <CardTitle className="text-xl">{story.business}</CardTitle>
                                        <CardDescription>{story.owner}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <blockquote className="text-sm text-charcoal-light italic">
                                            "{story.quote}"
                                        </blockquote>
                                        <div className="pt-4 border-t border-faded-gray-light">
                                            <p className="text-lg font-semibold text-vintage-green">{story.result}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-6">
                                    Why Businesses Choose AURUM VAULT
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-charcoal mb-2">Dedicated Support</h3>
                                        <p className="text-charcoal-light">
                                            Work with experienced business banking specialists who understand your industry and challenges.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-charcoal mb-2">Competitive Rates</h3>
                                        <p className="text-charcoal-light">
                                            Enjoy some of the most competitive rates in the industry on loans, merchant services, and more.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-charcoal mb-2">Local Decision Making</h3>
                                        <p className="text-charcoal-light">
                                            Get faster approvals with local underwriting teams who understand your market.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-charcoal mb-2">Integrated Solutions</h3>
                                        <p className="text-charcoal-light">
                                            Seamlessly manage all your business banking needs from one platform.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-vintage-xl">
                                <Image
                                    src="/images/commercial/products/card-vault-security.png"
                                    alt="Secure Business Banking"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-br from-vintage-green to-vintage-green-dark text-white">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Ready to Grow Your Business?
                        </h2>
                        <p className="text-lg md:text-xl mb-8 text-warm-cream">
                            Let's discuss how AURUM VAULT can support your business goals.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/e-banking/auth/signup">
                                <Button variant="primary" size="large">
                                    Open Business Account
                                </Button>
                            </Link>
                            <Link href="#contact">
                                <Button variant="secondary" size="large" className="bg-transparent border-white text-white hover:bg-white hover:text-vintage-green">
                                    Contact Business Banking
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
