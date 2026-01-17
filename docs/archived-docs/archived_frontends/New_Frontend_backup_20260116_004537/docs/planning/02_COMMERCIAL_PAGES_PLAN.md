# 🏦 COMMERCIAL PAGES - Complete Implementation Plan

---

## 📋 TABLE OF CONTENTS

1. [Landing Page (Home)](#1-landing-page-home)
2. [Personal Banking Page](#2-personal-banking-page)
3. [Business Banking Page](#3-business-banking-page)
4. [About/Security Page](#4-aboutsecurity-page)
5. [Login Page](#5-login-page)

---

# 1. LANDING PAGE (HOME)

## 📄 Page Overview

**Route**: `/`  
**Purpose**: Primary entry point showcasing NexBank's value proposition and converting visitors to customers  
**Target Audience**: All demographics (25-75 years old)

## 🎨 Design Requirements

### Layout Structure

```
┌─────────────────────────────────────────┐
│         Navigation Bar                   │
├─────────────────────────────────────────┤
│         Hero Section                     │
│   (Family Image + Headline + CTAs)      │
├─────────────────────────────────────────┤
│      Trust Indicators Strip              │
│   (Years, Customers, Security)           │
├─────────────────────────────────────────┤
│      Services Overview Cards             │
│   (Personal | Business | Security)       │
├─────────────────────────────────────────┤
│      Customer Testimonials               │
│        (Carousel Format)                 │
├─────────────────────────────────────────┤
│      Statistics Section                  │
│   (Accounts | Money | Branches)          │
├─────────────────────────────────────────┤
│     Download Mobile App                  │
│   (App Store + Google Play)              │
├─────────────────────────────────────────┤
│         Footer                           │
└─────────────────────────────────────────┘
```

## 📝 Content Specification

### Hero Section

**Headline (H1)**:

```
"Time-Tested Banking for Every Generation"
```

- Font: Playfair Display, 700 weight
- Size: 60px desktop, 40px mobile
- Color: Charcoal (#3D3D3D)
- Line height: 1.1
- Animation: Fade in from bottom, 600ms delay

**Subheadline**:

```
"Since 1985, we've helped families, businesses, and individuals 
build secure financial futures. Experience banking that combines 
trusted traditions with modern convenience."
```

- Font: Inter, 400 weight
- Size: 20px desktop, 16px mobile
- Color: Charcoal Light (#5A5A5A)
- Max width: 700px
- Animation: Fade in from bottom, 800ms delay

**Primary CTA Button**:

```
Text: "Open Your Account"
Icon: ArrowRight (from lucide-react)
```

- Background: Soft Gold (#D4AF7A)
- Color: Charcoal (#3D3D3D)
- Padding: 16px 32px
- Font: Inter, 600 weight, 16px
- Border radius: 8px
- Hover: Transform translateY(-2px), shadow increase
- Animation: Fade in, 1000ms delay

**Secondary CTA Button**:

```
Text: "Explore Services"
```

- Background: Transparent
- Border: 2px solid Vintage Green (#7D9B7B)
- Color: Vintage Green
- Padding: 16px 32px
- Hover: Background Vintage Green, Color White

**Background Image**:

- Image: Multi-generational family with tablet (generated)
- Dimensions: 1920x1080px
- Format: WebP with JPG fallback
- Position: Right side, 50% of viewport
- Overlay: Subtle gradient fade to white on left
- Mobile: Full width background with text overlay

### Trust Indicators Strip

**Layout**: 3 columns, centered alignment

**Indicator 1 - Years Established**:

```
Icon: Shield with checkmark (vintage engraving style)
Number: "40+"
Label: "Years of Trust"
Subtext: "Serving since 1985"
```

**Indicator 2 - Customers Served**:

```
Icon: Users icon (vintage style)
Number: "250,000+"
Label: "Happy Customers"
Subtext: "Across all demographics"
```

**Indicator 3 - Security Level**:

```
Icon: Lock and chain (vintage engraving)
Number: "100%"
Label: "Secure Banking"
Subtext: "Bank-grade encryption"
```

**Styling**:

- Background: Warm Cream (#F5F1E8)
- Padding: 48px vertical
- Number animation: Count up on scroll into view
- Font (numbers): Playfair Display, 700, 48px
- Font (labels): Inter, 600, 18px
- Color: Vintage Green (#7D9B7B)

### Services Overview Cards

**Card Layout**: 3 columns on desktop, 1 column mobile
**Card count**: 3 cards
**Gap**: 32px

**Card 1 - Personal Banking**:

```
Image: Hands holding vintage leather wallet with cards
Title: "Personal Banking"
Description: "Checking accounts, savings, credit cards, and 
             personal loans designed for your life goals."
Features:
  - Multi-currency accounts
  - Competitive interest rates
  - 24/7 online access
  - Personalized service
CTA: "Learn More" → /personal-banking
```

**Card 2 - Business Banking**:

```
Image: Overhead shot of vintage desk with ledger, fountain pen, coffee
Title: "Business Banking"
Description: "Comprehensive solutions for small businesses, 
             from checking to merchant services."
Features:
  - Business checking & savings
  - Merchant processing
  - Business loans & credit
  - Payroll services
CTA: "Learn More" → /business-banking
```

**Card 3 - Security & Trust**:

```
Image: Vintage bank vault door, slightly open, warm lighting
Title: "Security You Can Trust"
Description: "Your financial security is our top priority with 
             industry-leading protection."
Features:
  - 256-bit encryption
  - FDIC insured
  - Fraud monitoring
  - Two-factor authentication
CTA: "Learn More" → /about-security
```

**Card Styling**:

```css
.service-card {
  background: #FAF9F6;
  border: 1px solid #B8BFC6;
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(61, 61, 61, 0.12);
}

.service-card__image {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 24px;
}

.service-card__title {
  font-family: 'Playfair Display';
  font-weight: 700;
  font-size: 24px;
  color: #3D3D3D;
  margin-bottom: 16px;
}

.service-card__description {
  font-family: 'Inter';
  font-size: 16px;
  color: #5A5A5A;
  line-height: 1.6;
  margin-bottom: 20px;
}

.service-card__features {
  list-style: none;
  padding: 0;
  margin-bottom: 24px;
}

.service-card__features li {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-family: 'Inter';
  font-size: 14px;
  color: #3D3D3D;
}

.service-card__features li::before {
  content: '✓';
  color: #7D9B7B;
  font-weight: bold;
}
```

### Customer Testimonials Carousel

**Layout**: Carousel/Slider, 3 testimonials visible on desktop

**Testimonial 1**:

```
Photo: Professional woman, 40s, warm smile, business casual
Name: "Sarah Martinez"
Role: "Small Business Owner"
Quote: "NexBank has been instrumental in growing my business. 
        Their personalized service and competitive rates made 
        all the difference."
Rating: ★★★★★ (5 stars)
```

**Testimonial 2**:

```
Photo: Business owner, 60s, in their shop, confident
Name: "Robert Chen"
Role: "Retired Educator"
Quote: "After 40 years of teaching, I trust NexBank with my 
        retirement savings. Their stability and service are 
        unmatched."
Rating: ★★★★★ (5 stars)
```

**Testimonial 3**:

```
Photo: Young professional, late 20s, outdoor setting
Name: "Emily Thompson"
Role: "Young Professional"
Quote: "As a first-time account holder, NexBank made banking 
        simple and secure. I love their mobile app!"
Rating: ★★★★★ (5 stars)
```

**Carousel Styling**:

- Background: Vintage Green gradient (#7D9B7B to #8B9D83)
- Padding: 80px vertical
- Auto-advance: 5 seconds
- Navigation: Dots below, arrows on sides
- Transition: Smooth fade, 400ms
- Photo size: 150x150px, circular crop
- Text color: White or Warm Cream

### Statistics Section

**Background**: Subtle parchment texture over Off-White

**Stat 1**:

```
Number: "250,000+"
Label: "Accounts Opened"
Icon: Briefcase (vintage style)
```

**Stat 2**:

```
Number: "$5.2 Billion"
Label: "Money Secured"
Icon: Shield with dollar sign
```

**Stat 3**:

```
Number: "50+"
Label: "Branch Locations"
Icon: Map pin (vintage)
```

**Styling**:

- Layout: 3 columns, centered
- Number font: Playfair Display, 700, 56px
- Number color: Vintage Green (#7D9B7B)
- Animation: Count-up when scrolled into view
- Label font: Inter, 600, 18px
- Label color: Charcoal (#3D3D3D)

### Download Mobile App Section

**Headline**:

```
"Banking Anytime, Anywhere"
```

- Font: Playfair Display, 700, 36px
- Color: Charcoal

**Subtext**:

```
"Download our award-winning mobile app for iOS and Android"
```

- Font: Inter, 400, 18px
- Color: Charcoal Light

**App Store Badges**:

- iOS App Store badge (official Apple design)
- Google Play badge (official Google design)
- Badges side-by-side on desktop, stacked on mobile
- Size: Standard badge dimensions

**Mockup Image**:

```
Description: Modern smartphone displaying NexBank app interface 
             with vintage-inspired UI, floating on faded green 
             background
Dimensions: 400x800px
Position: Right side of section
```

## 🎬 Animations & Interactions

**On Page Load**:

1. Navigation fades in (200ms)
2. Hero headline slides up + fades in (600ms)
3. Hero subtext slides up + fades in (800ms)
4. CTA buttons fade in (1000ms)

**On Scroll (using Intersection Observer)**:

1. Trust indicators count up when 50% visible
2. Service cards fade in staggered (150ms delay each)
3. Testimonials carousel activates when visible
4. Statistics count up when 50% visible

**Hover Effects**:

- Service cards: Lift 8px, shadow increase
- CTA buttons: Lift 2px, color darken
- Links: Underline fade-in
- Images: Subtle scale 1.05x on hover

## 📱 Responsive Breakpoints

**Mobile (< 768px)**:

- Hero: Stack text above image
- Hero headline: 40px
- Trust indicators: Stack vertically
- Service cards: 1 column
- Testimonials: 1 visible at a time
- Statistics: 1 column
- App section: Stack vertically

**Tablet (768px - 1023px)**:

- Hero headline: 48px
- Service cards: 2 columns
- Testimonials: 2 visible

**Desktop (≥ 1024px)**:

- All elements at full design spec

## 🖼️ Image Assets Required

| Asset Name | Type | Dimensions | Description |
|------------|------|------------|-------------|
| hero-family.webp | Photo | 1920x1080 | Multi-gen family with tablet |
| hero-family.jpg | Photo | 1920x1080 | Fallback |
| service-wallet.webp | Photo | 600x400 | Vintage wallet with cards |
| service-desk.webp | Photo | 600x400 | Vintage desk setup |
| service-vault.webp | Photo | 600x400 | Bank vault door |
| testimonial-sarah.webp | Photo | 300x300 | Professional woman |
| testimonial-robert.webp | Photo | 300x300 | Business owner |
| testimonial-emily.webp | Photo | 300x300 | Young professional |
| mobile-mockup.webp | Illustration | 400x800 | Phone with app |
| icon-shield.svg | Icon | Vector | Security badge |
| icon-users.svg | Icon | Vector | Customer count |
| icon-lock.svg | Icon | Vector | Lock and chain |

## 💻 Component Structure

```jsx
// app/page.tsx
import Hero from '@/components/commercial/Hero';
import TrustIndicators from '@/components/commercial/TrustIndicators';
import ServicesOverview from '@/components/commercial/ServicesOverview';
import Testimonials from '@/components/commercial/Testimonials';
import Statistics from '@/components/commercial/Statistics';
import MobileApp from '@/components/commercial/MobileApp';
import Footer from '@/components/layout/Footer';

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <TrustIndicators />
      <ServicesOverview />
      <Testimonials />
      <Statistics />
      <MobileApp />
      <Footer />
    </main>
  );
}
```

## ✅ Implementation Checklist

- [ ] Create page route: `app/page.tsx`
- [ ] Create Hero component with image and CTAs
- [ ] Create TrustIndicators component with count-up animation
- [ ] Create ServicesOverview with 3 cards
- [ ] Generate/source all card images
- [ ] Create Testimonials carousel component
- [ ] Source testimonial photos
- [ ] Create Statistics component with count-up
- [ ] Create MobileApp section with badges
- [ ] Generate phone mockup image
- [ ] Implement scroll animations with Intersection Observer
- [ ] Test responsive design on all breakpoints
- [ ] Verify accessibility (keyboard nav, screen readers)
- [ ] Optimize images (WebP conversion, lazy loading)
- [ ] Test performance (Lighthouse score > 90)

---

# 2. PERSONAL BANKING PAGE

## 📄 Page Overview

**Route**: `/personal-banking`  
**Purpose**: Showcase personal banking products and convert visitors to account holders  
**Target Audience**: Individuals 25-75, families, young professionals

## 🎨 Design Requirements

### Page Structure

```
┌─────────────────────────────────────────┐
│         Navigation Bar                   │
├─────────────────────────────────────────┤
│         Hero Section                     │
│   "Personal Banking Redefined"           │
├─────────────────────────────────────────┤
│      Account Types Cards                 │
│   Checking | Savings | Credit | Loans    │
├─────────────────────────────────────────┤
│      Benefits Comparison Table           │
├─────────────────────────────────────────┤
│      Interest Rates Display              │
├─────────────────────────────────────────┤
│      Mobile Banking Features             │
├─────────────────────────────────────────┤
│         Apply Now CTA                    │
├─────────────────────────────────────────┤
│         Footer                           │
└─────────────────────────────────────────┘
```

## 📝 Content Specification

### Hero Section

**Headline**:

```
"Personal Banking Built Around Your Life"
```

- Font: Playfair Display, 700, 48px
- Color: White (on gradient background)

**Subheadline**:

```
"From everyday checking to long-term savings, we offer the 
accounts and services you need to achieve your financial goals."
```

- Font: Inter, 400, 20px
- Color: White with 90% opacity

**Background**:

- Gradient: Vintage Green (#7D9B7B) to darker green
- Pattern: Subtle vintage texture overlay
- Height: 400px desktop, 300px mobile

**CTA Buttons**:

```
Primary: "Open an Account Today" → /apply
Secondary: "Compare Accounts" → Scroll to comparison
```

### Account Types Cards

**4 Cards in 2x2 grid (desktop), single column (mobile)**

#### Card 1 - Checking Account

**Title**: "Classic Checking"

**Description**:

```
"Your everyday banking made simple and secure. Perfect for 
managing daily transactions with no monthly fees."
```

**Icon**: Vintage checkbook with fountain pen (SVG illustration)

**Features**:

- No monthly maintenance fees
- Free online bill pay
- Mobile check deposit
- Overdraft protection available
- Free debit card with rewards
- Unlimited transactions

**Interest Rate**: "0.15% APY"

**Minimum Balance**: "None"

**Image**: Close-up of vintage checkbook and pen

**CTA**: "Learn More" → /checking-account

#### Card 2 - Savings Account

**Title**: "Growth Savings"

**Description**:

```
"Watch your money grow with competitive rates and flexible 
access to your funds whenever you need them."
```

**Icon**: Classic ceramic piggy bank (SVG)

**Features**:

- Competitive interest rates up to 4.2% APY
- No minimum balance requirement
- Free transfers to checking
- Monthly interesse compounding
- FDIC insured up to $250,000
- Mobile app access

**Interest Rate**: "Up to 4.2% APY*"

**Minimum Balance**: "None"

**Image**: Vintage piggy bank on wooden table

**CTA**: "Open Savings" → /savings-account

#### Card 3 - Credit Cards

**Title**: "Rewards Credit Card"

**Description**:

```
"Earn while you spend with our rewards program. Enjoy benefits 
and build credit responsibly."
```

**Icon**: Elegant card with embossed details (SVG)

**Features**:

- 1.5% cash back on all purchases
- No annual fee first year
- Travel insurance included
- Purchase protection
- 0% intro APR for 12 months
- Contactless payment

**Interest Rate**: "13.99% - 24.99% APR variable*"

**Credit Limit**: "Up to $25,000"

**Image**: Vintage-styled credit card on leather surface

**CTA**: "Apply Now" → /credit-card

#### Card 4 - Personal Loans

**Title**: "Personal Loans"

**Description**:

```
"Achieve your goals with flexible financing. From home 
improvements to debt consolidation."
```

**Icon**: Handshake illustration (vintage engraving)

**Features**:

- Loan amounts up to $50,000
- Competitive rates from 5.9% APR
- Flexible terms 12-84 months
- No origination fees
- Fast approval process
- No prepayment penalties

**Interest Rate**: "From 5.9% APR*"

**Loan Amount**: "Up to $50,000"

**Image**: Vintage handshake or contract signing

**CTA**: "Get Pre-Qualified" → /personal-loans

### Benefits Comparison Table

**Headline**: "Compare Our Personal Banking Products"

**Table Structure**:

```
Feature          | Checking | Savings | Credit Card | Loan
----------------|----------|---------|-------------|--------
Monthly Fee     | $0       | $0      | $0 (1st yr) | N/A
Interest Rate   | 0.15%    | 4.2%    | Variable    | From 5.9%
Min. Balance    | None     | None    | N/A         | N/A
Online Access   | ✓        | ✓       | ✓           | ✓
Mobile App      | ✓        | ✓       | ✓           | ✓
Bill Pay        | ✓        | -       | -           | -
Rewards         | -        | Interest| Cash Back   | -
FDIC Insured    | ✓        | ✓       | N/A         | N/A
```

**Styling**:

- Header row: Vintage Green background, white text
- Alternating rows: Off-White and Parchment
- Checkmarks: Vintage Green
- Border: Faded Gray
- Responsive: Horizontal scroll on mobile

### Interest Rates Display

**Section Headline**: "Our Current Rates"

**Subtext**: "Updated daily to reflect current market conditions"

**Rate Cards (3 columns)**:

**Savings Accounts**:

```
Standard Savings:    4.20% APY
Premium Savings:     4.50% APY
(balances over $10,000)
```

**CDs (Certificates of Deposit)**:

```
6-Month CD:         4.75% APY
12-Month CD:        5.00% APY
24-Month CD:        5.25% APY
```

**Money Market**:

```
Money Market:       4.35% APY
(minimum $2,500)
```

**Styling**:

- Large percentage numbers: Playfair Display, 700, 36px
- Vintage Green color for rates
- Last updated timestamp
- Disclaimer: *APY = Annual Percentage Yield

### Mobile Banking Features

**Headline**: "Modern Banking at Your Fingertips"

**Layout**: Image left, features list right (desktop), stacked mobile

**Phone Mockup**:

- Image: Smartphone showing NexBank app
- Features visible: Dashboard, quick transfer, notifications
- Dimensions: 400x800px

**Features List**:

- Mobile check deposit
- Pay bills on the go
- Transfer funds instantly
- Track spending by category
- Set savings goals
- Receive real-time alerts
- Touch ID / Face ID login
- Find ATMs near you

**Each feature**:

- Icon: Vintage-styled checkmark or relevant icon
- Title: Inter, 600, 16px
- Description: Inter, 400, 14px

## 🎬 Animations

- Hero parallax: Background moves slower than foreground
- Account cards: Stagger fade-in on scroll (200ms delay each)
- Table rows: Fade in sequentially
- Rate numbers: Count-up animation
- Mobile phone: Slide in from right

## 📱 Responsive Design

**Mobile**:

- Cards: Single column
- Table: Horizontal scroll
- Mobile features: Image above list

**Tablet**:

- Cards: 2 columns
- Table: Full width with smaller font

## 🖼️ Image Assets

| Asset | Dimensions | Description |
|-------|------------|-------------|
| personal-hero.webp | 1920x600 | Person using laptop at home |
| checking-icon.svg | Vector | Vintage checkbook |
| savings-icon.svg | Vector | Piggy bank |
| credit-icon.svg | Vector | Credit card |
| loan-icon.svg | Vector | Handshake |
| mobile-app.webp | 400x800 | Phone mockup with app |

## 💻 Implementation

```jsx
// app/personal-banking/page.tsx
import PersonalHero from '@/components/commercial/PersonalHero';
import AccountTypes from '@/components/commercial/AccountTypes';
import ComparisonTable from '@/components/commercial/ComparisonTable';
import InterestRates from '@/components/commercial/InterestRates';
import MobileFeatures from '@/components/commercial/MobileFeatures';
import ApplyCTA from '@/components/commercial/ApplyCTA';

export default function PersonalBankingPage() {
  return (
    <main>
      <PersonalHero />
      <AccountTypes />
      <ComparisonTable />
      <InterestRates />
      <MobileFeatures />
      <ApplyCTA />
    </main>
  );
}
```

## ✅ Checklist

- [ ] Create page route
- [ ] Design and implement hero
- [ ] Create 4 account type cards
- [ ] Build comparison table component
- [ ] Create interest rates display
- [ ] Build mobile features section
- [ ] Source/generate all images
- [ ] Implement animations
- [ ] Test responsiveness
- [ ] Accessibility audit

---

# 3. BUSINESS BANKING PAGE

## 📄 Overview

**Route**: `/business-banking`  
**Purpose**: Attract small business owners and provide business banking solutions  
**Target Audience**: Business owners, entrepreneurs, startups

## 📝 Content (Detailed in similar format)

[Content continues with same level of detail for Business Banking, About/Security, and Login pages...]

---

**Document Status**: Section 1-2 Complete  
**Next Sections**: Business Banking, About/Security, Login  
**Total Pages**: 5 commercial pages with full specifications
