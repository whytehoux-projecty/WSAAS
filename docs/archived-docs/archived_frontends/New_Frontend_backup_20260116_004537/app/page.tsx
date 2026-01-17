import { Hero } from '@/components/commercial/Hero';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Testimonials } from '@/components/commercial/Testimonials';
import { Statistics } from '@/components/commercial/Statistics';
import { SecurityNoticeBanner } from '@/components/commercial/SecurityNoticeBanner';
import { EBankingWidget } from '@/components/commercial/EBankingWidget';
import { ProductGrid } from '@/components/commercial/ProductGrid';
import { ROUTES } from '@/lib/constants';

export default function Home() {
  return (
    <>
      {/* Security Notice Banner */}
      <SecurityNoticeBanner />

      <Header />
      <main>
        {/* Hero Section with E-Banking Widget */}
        <section className="relative overflow-hidden bg-gradient-to-br from-vintage-green/5 to-soft-gold/5 py-20 md:py-32">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="space-y-8 animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl font-bold text-charcoal leading-tight">
                  Time-Tested Banking for Every Generation
                </h1>
                <p className="text-lg md:text-xl text-charcoal-light leading-relaxed">
                  Since 1888, we&apos;ve helped families, businesses, and individuals build secure financial futures.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={ROUTES.signup}
                    className="inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-semibold rounded-lg bg-vintage-green text-white hover:bg-vintage-green-dark transition-all shadow-vintage hover:shadow-vintage-lg hover:-translate-y-0.5"
                  >
                    Open Your Account
                  </a>
                  <a
                    href="#services"
                    className="inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-semibold rounded-lg bg-transparent text-vintage-green border-2 border-vintage-green hover:bg-vintage-green hover:text-white transition-all"
                  >
                    Explore Services
                  </a>
                </div>
              </div>

              {/* E-Banking Widget */}
              <div className="flex items-center justify-center">
                <EBankingWidget className="w-full max-w-md" />
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-playfair font-bold text-vintage-green">
                  135+
                </div>
                <p className="text-lg text-charcoal-light">Years of Trust</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-playfair font-bold text-vintage-green">
                  250K+
                </div>
                <p className="text-lg text-charcoal-light">Happy Customers</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-playfair font-bold text-vintage-green">
                  100%
                </div>
                <p className="text-lg text-charcoal-light">Secure & Insured</p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid - Our Banking Solutions */}
        <ProductGrid />

        {/* Testimonials */}
        <Testimonials />

        {/* Statistics */}
        <Statistics />

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-vintage-green to-vintage-green-dark text-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Start Your Financial Journey?
            </h2>
            <p className="text-lg md:text-xl mb-8 text-warm-cream">
              Open an account in minutes and experience banking the way it should be.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={ROUTES.signup}
                className="inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-semibold rounded-lg bg-soft-gold text-charcoal hover:bg-soft-gold-dark transition-all shadow-vintage-lg hover:shadow-vintage-xl hover:-translate-y-0.5"
              >
                Open Account Now
              </a>
              <a
                href={ROUTES.about}
                className="inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-semibold rounded-lg bg-transparent text-white border-2 border-white hover:bg-white hover:text-vintage-green transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
