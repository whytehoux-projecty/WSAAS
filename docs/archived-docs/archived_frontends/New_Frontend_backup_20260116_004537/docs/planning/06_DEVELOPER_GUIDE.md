# 🚀 DEVELOPER IMPLEMENTATION GUIDE - AURUM VAULT

---

## 📋 TABLE OF CONTENTS

1. [Getting Started](#getting-started)
2. [Project Setup](#project-setup)
3. [Development Workflow](#development-workflow)
4. [Page Implementation Order](#page-implementation-order)
5. [Component Development](#component-development)
6. [Styling Guidelines](#styling-guidelines)
7. [Testing Checklist](#testing-checklist)
8. [Deployment](#deployment)

---

## 🎯 GETTING STARTED

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

---

## 📦 PROJECT SETUP

### Step 1: Initialize the Project

```bash
# Navigate to the New_Frontend directory
cd "/Volumes/Project Disk/PROJECTS/CODING/BANK/Autum Vault_1/New_Frontend"

# Initialize Next.js project
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir

# When prompted:
# ✔ Would you like to use ESLint? … Yes
# ✔ Would you like to use Turbopack for next dev? … No
# ✔ Would you like to customize the default import alias? … No
```

### Step 2: Install Required Dependencies

```bash
# UI Component Libraries
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog \
  @radix-ui/react-avatar @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-label \
  @radix-ui/react-popover @radix-ui/react-progress \
  @radix-ui/react-select @radix-ui/react-slot \
  @radix-ui/react-switch @radix-ui/react-tabs \
  @radix-ui/react-toast @radix-ui/react-tooltip

# Animation & Motion
npm install framer-motion

# Icons
npm install lucide-react

# Form Handling & Validation
npm install react-hook-form @hookform/resolvers zod

# Charts & Data Visualization
npm install recharts

# Date Handling
npm install date-fns

# Utilities
npm install class-variance-authority clsx tailwind-merge

# Development Dependencies
npm install -D @types/node @types/react @types/react-dom \
  autoprefixer postcss tailwindcss typescript
```

### Step 3: Create Folder Structure

```bash
# Create all necessary directories
mkdir -p app/{(commercial),e-banking,api} \
  components/{layout,commercial,portal,forms,ui,shared} \
  lib/{actions,utils} \
  public/{images/{commercial,portal,logos,icons},fonts} \
  styles \
  hooks \
  types

# Create files
touch lib/utils.ts \
  lib/constants.ts \
  types/index.ts \
  styles/globals.css \
  components/index.ts
```

---

## 🛠️ DEVELOPMENT WORKFLOW

### Daily Development Process

#### 1. **Start Your Day**

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Start development server
npm run dev
```

Development server runs at: `http://localhost:3000`

#### 2. **Create a New Branch** (for each feature)

```bash
# Create and switch to new branch
git checkout -b feature/landing-page-hero

# Naming convention:
# feature/[page-name]-[component]
# fix/[bug-description]
# style/[styling-task]
```

#### 3. **Development Cycle**

1. Read the planning document for the page/component
2. Create the component file
3. Implement according to specifications
4. Test in browser
5. Fix any issues
6. Commit changes

```bash
# Add files
git add .

# Commit with descriptive message
git commit -m "feat: add hero section to landing page"

# Push to remote
git push origin feature/landing-page-hero
```

#### 4. **Testing Your Work**

```bash
# Run linter
npm run lint

# Run type checking
npm run type-check

# Build to catch production issues
npm run build
```

---

## 📄 PAGE IMPLEMENTATION ORDER

### Phase 1: Foundation (Week 1-2)

#### Priority 1: Design System Setup

**Time**: 2-3 days

```bash
# 1. Configure Tailwind with custom colors
# Edit tailwind.config.ts
```

**File**: `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vintage-green': {
          DEFAULT: '#7D9B7B',
          light: '#8B9D83',
          dark: '#6B8569',
        },
        'faded-gray': {
          DEFAULT: '#9CA3AF',
          light: '#B8BFC6',
        },
        'soft-gold': {
          DEFAULT: '#D4AF7A',
          dark: '#B8941F',
        },
        'warm-cream': '#F5F1E8',
        'off-white': '#FAF9F6',
        parchment: '#F9F7F4',
        charcoal: {
          DEFAULT: '#3D3D3D',
          light: '#5A5A5A',
          lighter: '#787878',
        },
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
```

**File**: `app/globals.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Color CSS Variables */
    --vintage-green: #7D9B7B;
    --soft-gold: #D4AF7A;
    --charcoal: #3D3D3D;
    
    /* Typography */
    --font-heading: 'Playfair Display', serif;
    --font-body: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  body {
    @apply font-inter text-charcoal bg-off-white;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-playfair;
  }
}

@layer utilities {
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
```

#### Priority 2: Core UI Components

**Time**: 3-4 days

**Order of Implementation**:

1. ✅ **Day 1**: Button component (`components/ui/Button.tsx`)
2. ✅ **Day 2**: Card component (`components/ui/Card.tsx`)
3. ✅ **Day 3**: Input component (`components/forms/Input.tsx`)
4. ✅ **Day 4**: Layout components (Header, Footer, Sidebar)

**How to Build Each Component**:

```bash
# Example: Building the Button component

# 1. Create the file
touch components/ui/Button.tsx

# 2. Create the styles (if using CSS modules)
touch components/ui/Button.module.css

# 3. Implement according to documentation
# (Copy from 04_COMPONENT_LIBRARY.md)

# 4. Test the component
# Create a test page: app/test/page.tsx
```

**Test Page Example**:

```tsx
// app/test/page.tsx
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function TestPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Component Testing</h1>
      
      <div className="space-x-4">
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="outline" icon={<ArrowRight />} iconPosition="right">
          With Icon
        </Button>
      </div>
    </div>
  );
}
```

### Phase 2: Commercial Pages (Week 3-4)

#### Page 1: Landing Page

**Time**: 2-3 days  
**File**: `app/page.tsx`

**Implementation Steps**:

1. **Create the page file**

```bash
# File already exists, edit it
code app/page.tsx
```

1. **Implement section by section**:

```tsx
// app/page.tsx
import Hero from '@/components/commercial/Hero';
import TrustIndicators from '@/components/commercial/TrustIndicators';
import ServicesOverview from '@/components/commercial/ServicesOverview';
import Testimonials from '@/components/commercial/Testimonials';
import Statistics from '@/components/commercial/Statistics';
import MobileApp from '@/components/commercial/MobileApp';

export default function HomePage() {
  return (
    <main>
      {/* Step 1: Implement Hero */}
      <Hero
        headline="Time-Tested Banking for Every Generation"
        subheadline="Since 1888, we've helped families, businesses, and individuals build secure financial futures."
        primaryCTA={{ text: "Open Your Account", href: "/e-banking/auth/signup" }}
        secondaryCTA={{ text: "Explore Services", href: "#services" }}
        backgroundImage="/images/commercial/hero-family-banking.webp"
      />

      {/* Step 2: Add Trust Indicators */}
      <TrustIndicators />

      {/* Step 3: Services Overview */}
      <ServicesOverview />

      {/* Step 4: Testimonials */}
      <Testimonials />

      {/* Step 5: Statistics */}
      <Statistics />

      {/* Step 6: Mobile App */}
      <MobileApp />
    </main>
  );
}
```

1. **Create each component one by one**:

**Hero Component** (`components/commercial/Hero.tsx`):

```tsx
'use client';

import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  headline: string;
  subheadline: string;
  primaryCTA: { text: string; href: string };
  secondaryCTA?: { text: string; href: string };
  backgroundImage: string;
}

export const Hero: FC<HeroProps> = ({
  headline,
  subheadline,
  primaryCTA,
  secondaryCTA,
  backgroundImage,
}) => {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold text-charcoal leading-tight">
              {headline}
            </h1>
            <p className="text-lg md:text-xl text-charcoal-light leading-relaxed">
              {subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={primaryCTA.href}>
                <Button variant="primary" size="large" icon={<ArrowRight />} iconPosition="right">
                  {primaryCTA.text}
                </Button>
              </Link>
              {secondaryCTA && (
                <Link href={secondaryCTA.href}>
                  <Button variant="secondary" size="large">
                    {secondaryCTA.text}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="relative h-[400px] md:h-[600px]">
            <Image
              src={backgroundImage}
              alt="Aurum Vault Banking"
              fill
              className="object-cover rounded-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
```

1. **Test in browser**: `http://localhost:3000`

2. **Refine and adjust styling**

#### Page 2: Personal Banking

**Time**: 2 days  
**File**: `app/(commercial)/personal-banking/page.tsx`

Follow same process as Landing Page

#### Page 3-5: Business Banking, About, Login

**Time**: 1.5 days each

### Phase 3: E-Banking Portal (Week 5-7)

#### Setting Up Authentication

1. **Create auth layout**:

```tsx
// app/e-banking/layout.tsx
export default function EBankingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-off-white">
      {/* Add authentication check here */}
      {children}
    </div>
  );
}
```

1. **Implement auth pages** (from existing codebase):

```bash
# Copy authentication pages from old frontend
cp -r "/Volumes/Project Disk/PROJECTS/CODING/BANK/Autum Vault_1/frontend/app/e-banking/auth" \
  app/e-banking/
```

#### Portal Pages Implementation Order

1. **Dashboard** (3 days)
2. **Transfer Money** (2 days)
3. **Transactions** (2 days)  
4. **Accounts** (1 day)
5. **Cards** (2 days)
6. **Bills** (1.5 days)
7. **Beneficiaries** (1.5 days)
8. **Statements** (1 day)
9. **Settings** (2 days)
10. **Support** (1 day)

---

## 🎨 STYLING GUIDELINES

### Using Tailwind Classes

**Good Example**:

```tsx
<div className="bg-vintage-green text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
  <h2 className="text-2xl font-playfair font-bold mb-4">Checking Account</h2>
  <p className="text-warm-cream">$12,847.32</p>
</div>
```

**Avoid Inline Styles** (except for dynamic values):

```tsx
// ❌ Bad
<div style={{ backgroundColor: '#7D9B7B', padding: '24px' }}>

// ✅ Good
<div className="bg-vintage-green p-6">

// ✅ OK for dynamic values
<div style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}>
```

### Component-Specific Styling

**When to use CSS Modules**:

- Complex animations
- Very specific styles not in Tailwind
- Third-party component overrides

**Example**:

```css
/* Button.module.css */
.button {
  @apply inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all;
}

.button:hover {
  transform: translateY(-2px);
}
```

---

## ✅ TESTING CHECKLIST

### Before Committing Code

- [ ] Component renders without errors
- [ ] Responsive on mobile (375px width)
- [ ] Responsive on tablet (768px width)
- [ ] Responsive on desktop (1440px width)
- [ ] All interactive elements work (buttons, links, forms)
- [ ] Images load properly with alt text
- [ ] No console errors or warnings
- [ ] Typescript has no errors (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Accessibility: Can navigate with keyboard
- [ ] Accessibility: Proper ARIA labels where needed

### Page-Specific Checklist

**Landing Page**:

- [ ] Hero section animations work
- [ ] All CTAs navigate correctly
- [ ] Images are optimized (WebP with fallback)
- [ ] Statistics count-up animation works
- [ ] Testimonials carousel functions
- [ ] Mobile menu works

**Portal Pages**:

- [ ] Authentication check works
- [ ] Real-time data updates (if applicable)
- [ ] Forms validate properly
- [ ] Error messages display correctly
- [ ] Success states show properly
- [ ] Loading states appear

---

## 🚀 DEPLOYMENT

### Building for Production

```bash
# 1. Run full build
npm run build

# 2. Test production build locally
npm run start

# 3. Check for build errors
# Review .next/build-manifest.json
```

### Pre-Deployment Checklist

- [ ] All images optimized
- [ ] No console errors in production build
- [ ] Environment variables set correctly
- [ ] API endpoints configured
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Analytics tracking added
- [ ] SEO meta tags added to all pages
- [ ] Sitemap generated
- [ ] robots.txt configured

### Deployment Commands

```bash
# Deploy to Vercel (recommended for Next.js)
npx vercel

# Or deploy to custom server
npm run build
npm run start
```

---

## 📚 HELPFUL RESOURCES

### Documentation Links

- **Next.js 14**: <https://nextjs.org/docs>
- **Tailwind CSS**: <https://tailwindcss.com/docs>
- **Radix UI**: <https://www.radix-ui.com/docs/primitives>
- **Lucide Icons**: <https://lucide.dev/icons>
- **React Hook Form**: <https://react-hook-form.com/get-started>

### Code Snippets Location

All component code is available in:

- `docs/planning/04_COMPONENT_LIBRARY.md`
- `docs/planning/02_COMMERCIAL_PAGES_PLAN.md`
- `docs/planning/03_PORTAL_PAGES_PLAN.md`

### Getting Help

1. Check the planning documents first
2. Review existing similar components
3. Search Next.js/Tailwind documentation
4. Test in isolation on `/test` page

---

## 🎯 DAILY CHECKLIST

### Morning

- [ ] Pull latest code
- [ ] Review today's tasks from planning docs
- [ ] Start development server

### During Development

- [ ] Follow planning document specifications exactly
- [ ] Test in browser frequently
- [ ] Commit after each completed component/section

### End of Day

- [ ] Run linter and type check
- [ ] Push all commits
- [ ] Update progress in project tracker

---

## 🔧 TROUBLESHOOTING

### Common Issues

**Issue**: Images not loading

```bash
# Solution: Check public folder structure
ls -la public/images/

# Ensure images are in correct location
# Use correct path: /images/commercial/hero.webp
```

**Issue**: Tailwind classes not working

```bash
# Solution: Restart dev server
# Ctrl+C to stop
npm run dev
```

**Issue**: TypeScript errors

```bash
# Solution: Check types and interfaces
npm run type-check

# Add proper type annotations
```

**Issue**: Build fails

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

**Version**: 1.0  
**Last Updated**: January 15, 2026  
**For**: AURUM VAULT Banking Website  
**Difficulty Level**: Beginner to Intermediate Friendly
