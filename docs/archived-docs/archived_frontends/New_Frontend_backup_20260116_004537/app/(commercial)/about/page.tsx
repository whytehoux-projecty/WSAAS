import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import Image from 'next/image';
import { Hero } from '@/components/commercial/Hero';

const timeline = [
    {
        year: '1888',
        title: 'Foundation',
        description: 'AURUM VAULT was founded with a vision to provide secure, trustworthy banking to the community.',
    },
    {
        year: '1920',
        title: 'Expansion',
        description: 'Opened our first branch locations, bringing banking services to more families and businesses.',
    },
    {
        year: '1985',
        title: 'Digital Innovation',
        description: 'Pioneered online banking services, making financial management more accessible than ever.',
    },
    {
        year: '2010',
        title: 'Mobile First',
        description: 'Launched our award-winning mobile app, putting banking at your fingertips.',
    },
    {
        year: '2026',
        title: 'Future Forward',
        description: 'Continuing to innovate while maintaining the trust and security our customers depend on.',
    },
];

const securityFeatures = [
    {
        id: 1,
        title: '256-bit Encryption',
        description: 'Bank-level SSL encryption protects all your data in transit and at rest.',
        icon: '/images/icons/security-key.svg',
    },
    {
        id: 2,
        title: 'FDIC Insured',
        description: 'Your deposits are insured up to $250,000 by the Federal Deposit Insurance Corporation.',
        icon: '/images/icons/trust-shield-icon.svg',
    },
    {
        id: 3,
        title: '24/7 Fraud Monitoring',
        description: 'Advanced AI-powered systems monitor transactions around the clock to detect suspicious activity.',
        icon: '/images/icons/insight-alert.svg',
    },
    {
        id: 4,
        title: 'Multi-Factor Authentication',
        description: 'Additional layers of security including biometric login and one-time passcodes.',
        icon: '/images/icons/two-factor-phone.svg',
    },
];

const leadership = [
    {
        id: 1,
        name: 'Elizabeth Hartwell',
        role: 'Chief Executive Officer',
        bio: '25+ years of banking experience, committed to customer-first innovation.',
        image: '/images/testimonials/testimonial-emily-thompson.png',
    },
    {
        id: 2,
        name: 'Michael Chen',
        role: 'Chief Technology Officer',
        bio: 'Leading our digital transformation while maintaining security excellence.',
        image: '/images/testimonials/testimonial-robert-chen.png',
    },
    {
        id: 3,
        name: 'Sarah Rodriguez',
        role: 'Chief Financial Officer',
        bio: 'Ensuring financial stability and sustainable growth for our customers.',
        image: '/images/testimonials/testimonial-sarah-martinez.png',
    },
];

export default function AboutPage() {
    return (
        <>
            <Header />
            <main>
                {/* Hero Section */}
                <Hero
                    headline="135+ Years of Trust and Innovation"
                    subheadline="Since 1888, AURUM VAULT has been a pillar of financial security and service. We combine time-tested values with modern technology to serve you better."
                    primaryCTA={{ text: 'Explore Our History', href: '#story' }}
                    image="/images/commercial/heroes/hero-about-security.png"
                />

                {/* Our Story */}
                <section id="story" className="py-20 bg-off-white">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-6">
                                    Our Story
                                </h2>
                                <div className="space-y-4 text-lg text-charcoal-light">
                                    <p>
                                        Founded in 1888, AURUM VAULT began with a simple mission: to provide secure, accessible banking services to our community. Over 135 years later, that mission remains unchanged.
                                    </p>
                                    <p>
                                        What has changed is how we serve you. We've embraced technology, expanded our services, and grown to serve over 250,000 customers. But we've never forgotten our roots.
                                    </p>
                                    <p>
                                        Today, we're proud to offer the perfect blend of traditional banking values and modern convenience. Your trust is our most valuable asset, and we work every day to earn it.
                                    </p>
                                </div>
                            </div>
                            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-vintage-xl">
                                <Image
                                    src="/images/commercial/products/card-credit-vintage.png"
                                    alt="Est. 1888"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="text-center mb-12">
                            <h3 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                                Our Journey
                            </h3>
                            <p className="text-lg text-charcoal-light">
                                Key milestones in our 135-year history
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-vintage-green/20 hidden md:block" />
                            <div className="space-y-12">
                                {timeline.map((item, index) => (
                                    <div key={item.year} className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                        <div className="flex-1 text-right md:text-left">
                                            {index % 2 === 0 && (
                                                <div>
                                                    <div className="text-3xl font-playfair font-bold text-vintage-green mb-2">{item.year}</div>
                                                    <h4 className="text-xl font-semibold text-charcoal mb-2">{item.title}</h4>
                                                    <p className="text-charcoal-light">{item.description}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-vintage-green flex items-center justify-center text-white font-bold z-10 flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            {index % 2 !== 0 && (
                                                <div>
                                                    <div className="text-3xl font-playfair font-bold text-vintage-green mb-2">{item.year}</div>
                                                    <h4 className="text-xl font-semibold text-charcoal mb-2">{item.title}</h4>
                                                    <p className="text-charcoal-light">{item.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className="py-20 bg-parchment">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-4">
                                Your Security is Our Priority
                            </h2>
                            <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
                                We employ industry-leading security measures to protect your financial information
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {securityFeatures.map((feature) => (
                                <Card key={feature.id} className="text-center">
                                    <CardHeader>
                                        <div className="w-16 h-16 mx-auto rounded-full bg-vintage-green/10 flex items-center justify-center text-vintage-green mb-4">
                                            <Image
                                                src={feature.icon}
                                                alt={feature.title}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8"
                                            />
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-charcoal-light">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <p className="text-sm text-charcoal-light mb-4">
                                Member FDIC • Equal Housing Lender • Your deposits are insured up to $250,000
                            </p>
                        </div>
                    </div>
                </section>

                {/* Leadership */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-4">
                                Leadership Team
                            </h2>
                            <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
                                Meet the experienced professionals guiding AURUM VAULT into the future
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {leadership.map((leader) => (
                                <Card key={leader.id} className="text-center">
                                    <CardHeader>
                                        <div className="w-24 h-24 mx-auto rounded-full border-4 border-vintage-green/10 mb-4 relative overflow-hidden">
                                            <Image
                                                src={leader.image}
                                                alt={leader.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <CardTitle className="text-xl">{leader.name}</CardTitle>
                                        <CardDescription className="text-soft-gold-dark font-semibold">{leader.role}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-charcoal-light">{leader.bio}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-br from-charcoal to-charcoal-light text-white">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Join the AURUM VAULT Family
                        </h2>
                        <p className="text-lg md:text-xl mb-8 text-warm-cream">
                            Experience banking built on 135 years of trust and innovation.
                        </p>
                        <Link href="/e-banking/auth/signup">
                            <Button variant="primary" size="large">
                                Open Your Account Today
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
