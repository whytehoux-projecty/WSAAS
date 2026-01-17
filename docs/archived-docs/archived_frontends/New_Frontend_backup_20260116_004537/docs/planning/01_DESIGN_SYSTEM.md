# 🎨 NEXBANK DESIGN SYSTEM - Complete Specification

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components Library](#components-library)
6. [Icons & Imagery](#icons--imagery)
7. [Animations & Effects](#animations--effects)
8. [Implementation Guidelines](#implementation-guidelines)

---

## 🎯 OVERVIEW

### Design Philosophy

**Vintage Modern** - A timeless design approach that merges classic banking trustworthiness with contemporary digital convenience.

### Core Principles

- **Trustworthy**: Established, reliable, secure
- **Timeless**: Classic aesthetics that won't feel dated
- **Warm**: Professional yet approachable
- **Sophisticated**: Premium without being intimidating

### Target Audience

- **Age Range**: 25-75 years old
- **Demographics**: Young professionals, families, retirees, small business owners
- **Psychographics**: Value security, appreciate tradition, desire convenience

---

## 🎨 COLOR SYSTEM

### Primary Color Palette

```css
/* PRIMARY COLORS */
--vintage-green-primary: #7D9B7B;     /* Faded Vintage Green */
--vintage-green-secondary: #8B9D83;   /* Lighter Vintage Green */

/* SECONDARY COLORS */
--faded-gray-primary: #9CA3AF;        /* Faded Gray */
--faded-gray-secondary: #B8BFC6;      /* Lighter Faded Gray */

/* ACCENT COLORS */
--warm-cream: #F5F1E8;                /* Warm Cream Background */
--soft-gold: #D4AF7A;                 /* Soft Gold for highlights */
--soft-gold-dark: #B8941F;            /* Darker gold for hover states */

/* BACKGROUNDS */
--off-white: #FAF9F6;                 /* Off-White background */
--parchment: #F9F7F4;                 /* Subtle Parchment texture */

/* TEXT COLORS */
--charcoal: #3D3D3D;                  /* Primary text */
--charcoal-light: #5A5A5A;            /* Secondary text */
--charcoal-lighter: #787878;          /* Muted text */
```

### Color Usage Guidelines

#### **Commercial Website**

- **Hero Sections**: Vintage Green gradient backgrounds
- **Cards**: Off-white with soft shadows
- **CTAs**: Soft Gold with charcoal text
- **Links**: Vintage Green hover to Soft Gold
- **Borders**: Faded Gray (light)

#### **E-Banking Portal**

- **Sidebar**: Vintage Green Primary
- **Main Background**: Off-White
- **Card Backgrounds**: Parchment
- **Active States**: Soft Gold
- **Success States**: Darker Vintage Green (#6B8569)
- **Warning States**: Warm Amber (#E5A855)
- **Error States**: Muted Red (#C4756E)

### Accessibility

All color combinations meet **WCAG 2.1 AA standards** for contrast:

- Text on Off-White: Minimum 4.5:1 contrast ratio
- Interactive elements: Minimum 3:1 contrast ratio
- Focus indicators: 3:1 contrast with background

---

## ✍️ TYPOGRAPHY

### Font Families

#### **Primary Font: Playfair Display**

- **Usage**: Headings, hero text, section titles
- **Weights**: Regular (400), SemiBold (600), Bold (700)
- **Character**: Classic, elegant serif - evokes tradition and trustworthiness
- **Import**:

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
```

#### **Secondary Font: Inter**

- **Usage**: Body text, forms, UI elements
- **Weights**: Regular (400), Medium (500), SemiBold (600)
- **Character**: Clean, modern sans-serif - ensures readability
- **Import**:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

#### **Monospace Font: JetBrains Mono**

- **Usage**: Account numbers, codes, financial data
- **Weight**: Regular (400), Medium (500)
- **Import**:

```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Typography Scale

```css
/* HEADINGS */
--h1-size: 3.75rem;      /* 60px - Hero headlines */
--h1-weight: 700;
--h1-line-height: 1.1;
--h1-letter-spacing: -0.02em;

--h2-size: 3rem;         /* 48px - Section headers */
--h2-weight: 700;
--h2-line-height: 1.2;
--h2-letter-spacing: -0.015em;

--h3-size: 2.25rem;      /* 36px - Subsection headers */
--h3-weight: 600;
--h3-line-height: 1.3;

--h4-size: 1.875rem;     /* 30px - Card headers */
--h4-weight: 600;
--h4-line-height: 1.4;

--h5-size: 1.5rem;       /* 24px - Component headers */
--h5-weight: 600;
--h5-line-height: 1.4;

--h6-size: 1.25rem;      /* 20px - Small headers */
--h6-weight: 600;
--h6-line-height: 1.5;

/* BODY TEXT */
--body-large: 1.125rem;  /* 18px */
--body-base: 1rem;       /* 16px - Default */
--body-small: 0.875rem;  /* 14px */
--body-xs: 0.75rem;      /* 12px */

/* LINE HEIGHTS */
--body-line-height: 1.6;
--body-line-height-relaxed: 1.75;

/* LETTER SPACING */
--body-letter-spacing: 0.01em;
```

### Responsive Typography

```css
/* Mobile (< 768px) */
@media (max-width: 767px) {
  --h1-size: 2.5rem;     /* 40px */
  --h2-size: 2rem;       /* 32px */
  --h3-size: 1.75rem;    /* 28px */
  --h4-size: 1.5rem;     /* 24px */
}

/* Tablet (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  --h1-size: 3rem;       /* 48px */
  --h2-size: 2.5rem;     /* 40px */
}
```

---

## 📏 SPACING & LAYOUT

### Spacing Scale (8px base unit)

```css
--space-1: 0.5rem;   /* 8px */
--space-2: 1rem;     /* 16px */
--space-3: 1.5rem;   /* 24px */
--space-4: 2rem;     /* 32px */
--space-5: 2.5rem;   /* 40px */
--space-6: 3rem;     /* 48px */
--space-8: 4rem;     /* 64px */
--space-10: 5rem;    /* 80px */
--space-12: 6rem;    /* 96px */
--space-16: 8rem;    /* 128px */
```

### Container Widths

```css
--container-sm: 640px;   /* Mobile content */
--container-md: 768px;   /* Tablet content */
--container-lg: 1024px;  /* Desktop content */
--container-xl: 1280px;  /* Wide desktop */
--container-2xl: 1536px; /* Max width */
```

### Grid System

```css
/* 12-Column Grid */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}

/* Common Layouts */
.layout-sidebar {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-6);
}

.layout-2-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.layout-3-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}
```

### Breakpoints

```css
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large */
```

---

## 🧩 COMPONENTS LIBRARY

### Button Styles

#### **Primary Button**

```css
.btn-primary {
  background: var(--soft-gold);
  color: var(--charcoal);
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(61, 61, 61, 0.1);
}

.btn-primary:hover {
  background: var(--soft-gold-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(61, 61, 61, 0.15);
}
```

#### **Secondary Button**

```css
.btn-secondary {
  background: transparent;
  color: var(--vintage-green-primary);
  padding: 0.75rem 2rem;
  border: 2px solid var(--vintage-green-primary);
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--vintage-green-primary);
  color: white;
}
```

### Card Styles

```css
.card-vintage {
  background: var(--off-white);
  border: 1px solid var(--faded-gray-secondary);
  border-radius: 1rem;
  padding: var(--space-6);
  box-shadow: 0 4px 12px rgba(61, 61, 61, 0.08);
  transition: all 0.3s ease;
}

.card-vintage:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(61, 61, 61, 0.12);
}

.card-vintage-header {
  border-bottom: 2px solid var(--vintage-green-primary);
  padding-bottom: var(--space-3);
  margin-bottom: var(--space-4);
}
```

### Form Elements

```css
.input-vintage {
  width: 100%;
  padding: 0.875rem 1rem;
  background: white;
  border: 2px solid var(--faded-gray-secondary);
  border-radius: 0.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: var(--charcoal);
  transition: all 0.3s ease;
}

.input-vintage:focus {
  outline: none;
  border-color: var(--vintage-green-primary);
  box-shadow: 0 0 0 3px rgba(125, 155, 123, 0.1);
}

.input-vintage::placeholder {
  color: var(--charcoal-lighter);
}
```

### Badges & Tags

```css
.badge-success {
  background: var(--vintage-green-secondary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-pending {
  background: var(--soft-gold);
  color: var(--charcoal);
}

.badge-warning {
  background: #E5A855;
  color: white;
}
```

---

## 🖼️ ICONS & IMAGERY

### Icon Library: **Lucide React**

**Installation:**

```bash
npm install lucide-react
```

**Core Icons to Use:**

```javascript
// Navigation
import { Home, CreditCard, TrendingUp, Settings, Users } from 'lucide-react';

// Actions
import { ArrowRight, Download, Upload, Send, Plus, Minus } from 'lucide-react';

// Status
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

// Banking
import { Wallet, Banknote, PiggyBank, Building2, Globe } from 'lucide-react';

// Security
import { Shield, Lock, Eye, EyeOff, Key } from 'lucide-react';
```

### Icon Styling Guidelines

```css
.icon-small {
  width: 16px;
  height: 16px;
  stroke-width: 2px;
}

.icon-medium {
  width: 24px;
  height: 24px;
  stroke-width: 2px;
}

.icon-large {
  width: 32px;
  height: 32px;
  stroke-width: 1.5px;
}

.icon-vintage {
  color: var(--vintage-green-primary);
}

.icon-gold {
  color: var(--soft-gold-dark);
}
```

### Image Guidelines

#### **Hero Images**

- **Dimensions**: 1920x1080px (16:9)
- **Format**: WebP with JPG fallback
- **Quality**: 85% compression
- **Style**: Vintage tone, warm lighting, authentic banking scenarios
- **Content**: Multi-generational families, professionals, vintage bank interiors

#### **Card Images**

- **Dimensions**: 800x600px (4:3)
- **Format**: WebP
- **Quality**: 80% compression
- **Style**: Consistent vintage filtering, proper lighting

#### **Icons & Illustrations**

- **Format**: SVG (scalable)
- **Style**: Line art, vintage engraving style
- **Stroke Width**: 1.5-2px
- **Colors**: Vintage Green or Charcoal

---

## 🎬 ANIMATIONS & EFFECTS

### Animation Principles (Vintage-Appropriate)

1. **Subtle, Not Flashy**: Gentle, smooth transitions
2. **Purposeful**: Every animation has meaning
3. **Timeless**: Classic fade/slide transitions
4. **Respectful**: Won't distract from content

### Animation Durations

```css
--duration-fast: 150ms;     /* Hover states */
--duration-base: 250ms;     /* Default transitions */
--duration-slow: 350ms;     /* Page transitions */
--duration-slower: 500ms;   /* Complex animations */
```

### Easing Functions

```css
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0.0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Common Animations

#### **Fade In on Scroll**

```css
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

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}
```

#### **Card Hover Lift**

```css
.card-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(61, 61, 61, 0.15);
}
```

#### **Number Count-Up**

```javascript
// Smooth number animation for statistics
function animateValue(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      element.textContent = end.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.round(current).toLocaleString();
    }
  }, 16);
}
```

### Effects to AVOID

- ❌ Parallax scrolling
- ❌ 3D transforms
- ❌ Aggressive bouncing
- ❌ Neon glows
- ❌ Particle effects

---

## 📐 SHADOWS & DEPTH

### Shadow Scale

```css
/* Subtle shadows for vintage aesthetic */
--shadow-sm: 0 1px 3px rgba(61, 61, 61, 0.08);
--shadow-md: 0 4px 12px rgba(61, 61, 61, 0.10);
--shadow-lg: 0 8px 24px rgba(61, 61, 61, 0.12);
--shadow-xl: 0 16px 48px rgba(61, 61, 61, 0.15);

/* Inset shadows for depth */
--shadow-inset: inset 0 2px 4px rgba(61, 61, 61, 0.06);
```

### Border Radius

```css
--radius-sm: 0.375rem;   /* 6px - Small elements */
--radius-md: 0.5rem;     /* 8px - Buttons, inputs */
--radius-lg: 0.75rem;    /* 12px - Cards */
--radius-xl: 1rem;       /* 16px - Large containers */
--radius-full: 9999px;   /* Fully rounded */
```

---

## 🎨 TEXTURE & PATTERNS

### Subtle Parchment Texture

```css
.parchment-texture {
  background-image: url('data:image/svg+xml,...'); /* Subtle paper grain */
  background-color: var(--parchment);
  opacity: 0.03; /* Very subtle */
}
```

### Vintage Pattern Overlay

```css
.vintage-pattern {
  position: relative;
}

.vintage-pattern::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(125, 155, 123, 0.03) 2px,
    rgba(125, 155, 123, 0.03) 4px
  );
  pointer-events: none;
}
```

---

## 📱 RESPONSIVE DESIGN

### Mobile-First Approach

```css
/* Base styles (Mobile) */
.container {
  padding: var(--space-4);
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);
  }
}
```

### Touch Targets

- **Minimum size**: 44x44px for mobile
- **Spacing**: At least 8px between interactive elements
- **Hover states**: Disabled on touch devices

---

## ✅ IMPLEMENTATION GUIDELINES

### CSS Architecture

**Use BEM Methodology:**

```css
/* Block */
.card-vintage {}

/* Element */
.card-vintage__header {}
.card-vintage__body {}
.card-vintage__footer {}

/* Modifier */
.card-vintage--elevated {}
.card-vintage--bordered {}
```

### CSS Variables Setup

```css
:root {
  /* Colors */
  --color-primary: #7D9B7B;
  --color-primary-light: #8B9D83;
  /* ... all other colors */
  
  /* Typography */
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing */
  /* ... spacing scale */
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'vintage-green': {
          DEFAULT: '#7D9B7B',
          light: '#8B9D83',
        },
        'faded-gray': {
          DEFAULT: '#9CA3AF',
          light: '#B8BFC6',
        },
        'soft-gold': {
          DEFAULT: '#D4AF7A',
          dark: '#B8941F',
        },
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
};
```

---

## 🎭 ACCESSIBILITY

### WCAG 2.1 AA Compliance

- **Color Contrast**: Minimum 4.5:1 for text
- **Focus Indicators**: Visible 2px outline
- **Keyboard Navigation**: All interactive elements accessible
- **Screen Readers**: Proper ARIA labels
- **Alt Text**: Descriptive for all images

### Focus Styles

```css
*:focus-visible {
  outline: 2px solid var(--vintage-green-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

---

## 📦 COMPONENT CHECKLIST

When creating any component, ensure:

- [ ] Uses design system colors
- [ ] Implements proper typography scale
- [ ] Follows spacing system
- [ ] Includes hover/active/focus states
- [ ] Works on mobile, tablet, desktop
- [ ] Meets accessibility standards
- [ ] Has subtle, appropriate animations
- [ ] Uses vintage aesthetic consistently

---

**Last Updated**: January 15, 2026  
**Version**: 1.0  
**Maintained by**: NexBank Design Team
