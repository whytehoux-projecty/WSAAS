import Link from 'next/link';
import { ArrowRight, Shield, Users, TrendingUp, Home, Briefcase, CreditCard, HelpCircle, Lock } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    tagline: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    featured?: boolean;
}

const products: Product[] = [
    {
        id: 'heritage-vault',
        name: 'Heritage Vault™ Accounts',
        tagline: '135 years of keeping your wealth safe',
        description: 'Premium checking and savings accounts with unmatched security and personalized service.',
        icon: <Shield className="w-6 h-6" />,
        href: '/products/heritage-vault',
        featured: true,
    },
    {
        id: 'legacy-builder',
        name: 'Legacy Builder Savings',
        tagline: 'Build wealth that lasts generations',
        description: 'High-yield savings accounts designed to grow your family\'s financial legacy over time.',
        icon: <TrendingUp className="w-6 h-6" />,
        href: '/products/legacy-builder',
        featured: true,
    },
    {
        id: 'golden-years',
        name: 'Golden Years Mortgages',
        tagline: 'Home financing with vintage values',
        description: 'Competitive mortgage rates with personalized service and flexible terms for your dream home.',
        icon: <Home className="w-6 h-6" />,
        href: '/products/mortgages',
    },
    {
        id: 'founders-circle',
        name: 'Founders Circle Business',
        tagline: 'Banking for entrepreneurs',
        description: 'Comprehensive business banking solutions with dedicated relationship managers and premium perks.',
        icon: <Briefcase className="w-6 h-6" />,
        href: '/products/business-banking',
    },
    {
        id: 'vault-credit',
        name: 'Vault Credit Cards',
        tagline: 'Premium rewards, classic service',
        description: 'Exclusive credit cards with cashback rewards, travel benefits, and concierge services.',
        icon: <CreditCard className="w-6 h-6" />,
        href: '/products/credit-cards',
    },
    {
        id: 'white-glove',
        name: 'White Glove Banking',
        tagline: 'Your dedicated financial advisor',
        description: 'Personal banking with one-on-one guidance, wealth management, and 24/7 priority support.',
        icon: <Users className="w-6 h-6" />,
        href: '/products/private-banking',
        featured: true,
    },
    {
        id: 'security-center',
        name: 'Security Center',
        tagline: 'Bank-grade protection, always',
        description: 'Advanced fraud prevention, identity protection, and account monitoring to keep you safe.',
        icon: <Lock className="w-6 h-6" />,
        href: '/security',
    },
    {
        id: 'help-support',
        name: 'Help & Support',
        tagline: 'We\'re here for you',
        description: '24/7 customer support, FAQs, guides, and in-person assistance at over 200 branches.',
        icon: <HelpCircle className="w-6 h-6" />,
        href: '/help',
    },
];

export function ProductGrid() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-playfair text-charcoal mb-4">
                        Our Banking Solutions
                    </h2>
                    <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
                        Tailored to your lifestyle, designed for your success. Explore our complete range of premium banking services.
                    </p>
                </div>

                {/* Product Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={product.href}
                            className={`group relative bg-white/60 backdrop-blur-lg rounded-xl border border-white/40 hover:border-vintage-green/50 p-6 transition-all hover:shadow-2xl hover:-translate-y-1 hover:bg-white/70 ${product.featured ? 'lg:col-span-2' : ''
                                }`}
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-full bg-vintage-green/10 backdrop-blur-sm flex items-center justify-center mb-4 text-vintage-green group-hover:bg-vintage-green group-hover:text-white transition-all">
                                {product.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold font-playfair text-charcoal mb-2 group-hover:text-vintage-green transition-colors">
                                {product.name}
                            </h3>
                            <p className="text-sm text-vintage-green font-semibold mb-3">
                                {product.tagline}
                            </p>
                            <p className="text-sm text-charcoal-light mb-4">
                                {product.description}
                            </p>

                            {/* Learn More Link */}
                            <div className="flex items-center gap-2 text-vintage-green font-semibold text-sm group-hover:gap-3 transition-all">
                                Learn more
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
