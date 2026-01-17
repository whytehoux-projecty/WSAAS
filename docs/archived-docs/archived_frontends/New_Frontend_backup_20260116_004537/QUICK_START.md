# 🎯 AURUM VAULT - Quick Start Guide

## 🚀 Running the Project

```bash
# Navigate to project directory
cd "/Volumes/Project Disk/PROJECTS/CODING/BANK/Autum Vault_1/New_Frontend"

# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

## 📁 Key Files & Locations

### Configuration

- `tailwind.config.ts` - Tailwind CSS configuration with AURUM VAULT colors
- `app/globals.css` - Global styles and animations
- `tsconfig.json` - TypeScript configuration

### Components

- `components/ui/` - Reusable UI primitives (Button, Card, Input)
- `components/layout/` - Layout components (Header, Footer)
- `components/commercial/` - Commercial website components (Hero)
- `components/forms/` - Form components

### Utilities

- `lib/utils.ts` - Utility functions (cn, formatCurrency, formatDate)
- `lib/constants.ts` - Application constants (routes, bank info)
- `types/index.ts` - TypeScript type definitions

### Pages

- `app/page.tsx` - Landing page ✅
- `app/(commercial)/personal-banking/` - Personal banking page ⏳
- `app/(commercial)/business-banking/` - Business banking page ⏳
- `app/(commercial)/about/` - About page ⏳
- `app/e-banking/` - E-banking portal pages ⏳

### Assets

- `public/images/icons/` - 38 SVG icons
- `public/images/logos/` - 3 logo variations
- `public/images/commercial/` - Commercial page images ⏳
- `public/images/portal/` - Portal page images ⏳

### Documentation

- `docs/planning/` - All planning documents (8 files)
- `docs/DELIVERABLES_SUMMARY.md` - Project overview
- `docs/README.md` - Documentation guide
- `docs/DEV_SESSION_01.md` - Development session summary

## 🎨 Design System Quick Reference

### Colors

```tsx
// Primary
bg-vintage-green      // #7D9B7B
bg-soft-gold          // #D4AF7A
bg-charcoal           // #3D3D3D

// Backgrounds
bg-off-white          // #FAF9F6
bg-warm-cream         // #F5F1E8
bg-parchment          // #F9F7F4

// Text
text-charcoal         // #3D3D3D
text-charcoal-light   // #5A5A5A
text-charcoal-lighter // #787878
```

### Typography

```tsx
font-playfair  // Headings
font-inter     // Body text
font-mono      // Numbers/Code
```

### Components Usage

#### Button

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="large">
  Open Account
</Button>

<Button variant="secondary" icon={<ArrowRight />} iconPosition="right">
  Learn More
</Button>
```

#### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

#### Input

```tsx
import { Input } from '@/components/forms/Input';

<Input 
  label="Email"
  type="email"
  placeholder="you@example.com"
  error="Invalid email"
/>
```

## 📋 Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Type checking
npx tsc --noEmit     # Check TypeScript errors

# Install new package
npm install [package-name]
```

## 🔗 Important Routes

```tsx
import { ROUTES } from '@/lib/constants';

ROUTES.home              // /
ROUTES.personalBanking   // /personal-banking
ROUTES.businessBanking   // /business-banking
ROUTES.about             // /about
ROUTES.login             // /e-banking/auth/login
ROUTES.signup            // /e-banking/auth/signup
ROUTES.dashboard         // /e-banking/dashboard
```

## 🎯 Next Development Tasks

1. **Build Personal Banking Page**
   - Create `app/(commercial)/personal-banking/page.tsx`
   - Add account type cards
   - Add benefits section
   - Add CTA

2. **Build Business Banking Page**
   - Create `app/(commercial)/business-banking/page.tsx`
   - Add business services
   - Add success stories
   - Add loan information

3. **Build About Page**
   - Create `app/(commercial)/about/page.tsx`
   - Add company history
   - Add timeline component
   - Add team section

4. **Build Additional Components**
   - Testimonial Carousel
   - Statistics Counter (animated)
   - FAQ Accordion
   - Mobile App Showcase

## 📚 Documentation Links

- **Design System:** `docs/planning/01_DESIGN_SYSTEM.md`
- **Component Library:** `docs/planning/04_COMPONENT_LIBRARY.md`
- **Commercial Pages Plan:** `docs/planning/02_COMMERCIAL_PAGES_PLAN.md`
- **Portal Pages Plan:** `docs/planning/03_PORTAL_PAGES_PLAN.md`
- **Developer Guide:** `docs/planning/06_DEVELOPER_GUIDE.md`

## 🐛 Troubleshooting

### Server won't start

```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Tailwind classes not working

```bash
# Restart dev server
# Ctrl+C to stop
npm run dev
```

### TypeScript errors

```bash
# Check for errors
npx tsc --noEmit

# Common fix: restart VS Code
```

## ✅ Checklist for New Pages

- [ ] Create page file in correct directory
- [ ] Import necessary components
- [ ] Follow design system colors
- [ ] Use proper typography classes
- [ ] Add responsive breakpoints
- [ ] Test on mobile
- [ ] Check accessibility
- [ ] Verify no console errors

---

**Quick Reference Version:** 1.0  
**Last Updated:** January 15, 2026  
**Project:** AURUM VAULT Banking Website
