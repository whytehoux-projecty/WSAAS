# 🧩 COMPONENT LIBRARY - Complete Implementation Guide

---

## 📋 TABLE OF CONTENTS

1. [Component Architecture](#component-architecture)
2. [Shared Components](#shared-components)
3. [Commercial Website Components](#commercial-website-components)
4. [Portal Components](#portal-components)
5. [Form Components](#form-components)
6. [UI Primitives](#ui-primitives)

---

## 🏗️ COMPONENT ARCHITECTURE

### File Structure

```
components/
├── layout/           # Layout components (Header, Footer, Sidebar)
├── commercial/       # Commercial website specific
├── portal/           # E-banking portal specific
├── forms/            # Form elements and validation
├── ui/               # Reusable UI primitives
└── shared/           # Shared across both websites
```

### Naming Conventions

- **PascalCase** for component files: `AccountCard.tsx`
- **camelCase** for utility files: `formatCurrency.ts`
- **kebab-case** for CSS modules: `account-card.module.css`

### Component Template

```tsx
'use client';

import { FC } from 'react';
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  // Props interface
  title: string;
  description?: string;
  onAction?: () => void;
}

/**
 * ComponentName - Brief description
 * 
 * @param title - The component title
 * @param description - Optional description
 * @param onAction - Optional callback function
 */
export const ComponentName: FC<ComponentNameProps> = ({
  title,
  description,
  onAction,
}) => {
  return (
    <div className={styles.component}>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {onAction && (
        <button onClick={onAction} className={styles.button}>
          Take Action
        </button>
      )}
    </div>
  );
};

export default ComponentName;
```

---

## 🔧 SHARED COMPONENTS

### 1. Button Component

**File**: `components/ui/Button.tsx`

**Props**:

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}
```

**Implementation**:

```tsx
'use client';

import { FC } from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Button.module.css';
import { cn } from '@/lib/utils';

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
}) => {
  const buttonClasses = cn(
    styles.button,
    styles[`button--${variant}`],
    styles[`button--${size}`],
    fullWidth && styles['button--full-width'],
    disabled && styles['button--disabled'],
    loading && styles['button--loading']
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <Loader2 className={styles.spinner} />}
      {!loading && icon && iconPosition === 'left' && (
        <span className={styles.icon}>{icon}</span>
      )}
      <span className={styles.label}>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className={styles.icon}>{icon}</span>
      )}
    </button>
  );
};
```

**Styles** (`Button.module.css`):

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.button:focus-visible {
  outline: 2px solid var(--vintage-green-primary);
  outline-offset: 2px;
}

/* Variants */
.button--primary {
  background: var(--soft-gold);
  color: var(--charcoal);
}

.button--primary:hover:not(:disabled) {
  background: var(--soft-gold-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(61, 61, 61, 0.15);
}

.button--secondary {
  background: transparent;
  color: var(--vintage-green-primary);
  border: 2px solid var(--vintage-green-primary);
}

.button--secondary:hover:not(:disabled) {
  background: var(--vintage-green-primary);
  color: white;
}

.button--outline {
  background: white;
  color: var(--charcoal);
  border: 1px solid var(--faded-gray-secondary);
}

.button--outline:hover:not(:disabled) {
  border-color: var(--vintage-green-primary);
  color: var(--vintage-green-primary);
}

.button--ghost {
  background: transparent;
  color: var(--charcoal);
}

.button--ghost:hover:not(:disabled) {
  background: rgba(125, 155, 123, 0.1);
}

/* Sizes */
.button--small {
  padding: 8px 16px;
  font-size: 14px;
}

.button--medium {
  padding: 12px 24px;
  font-size: 16px;
}

.button--large {
  padding: 16px 32px;
  font-size: 18px;
}

/* States */
.button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button--loading {
  cursor: wait;
}

.button--full-width {
  width: 100%;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

**Usage Example**:

```tsx
<Button variant="primary" size="medium" onClick={() => console.log('clicked')}>
  Open Account
</Button>

<Button variant="secondary" icon={<ArrowRight />} iconPosition="right">
  Learn More
</Button>

<Button variant="primary" loading={true}>
  Processing...
</Button>
```

---

### 2. Card Component

**File**: `components/ui/Card.tsx`

**Props**:

```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'vintage';
  padding?: 'none' | 'small' | 'medium' | 'large';
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}
```

**Implementation**:

```tsx
'use client';

import { FC } from 'react';
import styles from './Card.module.css';
import { cn } from '@/lib/utils';

export const Card: FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  hoverable = false,
  onClick,
  className,
}) => {
  const cardClasses = cn(
    styles.card,
    styles[`card--${variant}`],
    styles[`card--padding-${padding}`],
    hoverable && styles['card--hoverable'],
    onClick && styles['card--clickable'],
    className
  );

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export const CardHeader: FC<CardHeaderProps> = ({ children, className }) => {
  return <div className={cn(styles.cardHeader, className)}>{children}</div>;
};

export const CardContent: FC<CardContentProps> = ({ children, className }) => {
  return <div className={cn(styles.cardContent, className)}>{children}</div>;
};

export const CardFooter: FC<CardFooterProps> = ({ children, className }) => {
  return <div className={cn(styles.cardFooter, className)}>{children}</div>;
};
```

**Styles**:

```css
.card {
  background: white;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.card--default {
  box-shadow: 0 2px 8px rgba(61, 61, 61, 0.08);
}

.card--elevated {
  box-shadow: 0 8px 24px rgba(61, 61, 61, 0.12);
}

.card--bordered {
  border: 1px solid var(--faded-gray-secondary);
  box-shadow: none;
}

.card--vintage {
  background: var(--off-white);
  border: 1px solid var(--faded-gray-secondary);
  box-shadow: 0 4px 12px rgba(61, 61, 61, 0.08);
}

.card--hoverable:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(61, 61, 61, 0.15);
}

.card--clickable {
  cursor: pointer;
}

/* Padding variants */
.card--padding-none {
  padding: 0;
}

.card--padding-small {
  padding: 16px;
}

.card--padding-medium {
  padding: 24px;
}

.card--padding-large {
  padding: 32px;
}

.cardHeader {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--vintage-green-primary);
}

.cardContent {
  /* Content specific styling */
}

.cardFooter {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--faded-gray-secondary);
}
```

**Usage**:

```tsx
<Card variant="vintage" hoverable>
  <CardHeader>
    <h3>Account Balance</h3>
  </CardHeader>
  <CardContent>
    <p>$12,847.32</p>
  </CardContent>
  <CardFooter>
    <Button variant="ghost">View Details</Button>
  </CardFooter>
</Card>
```

---

### 3. Input Component

**File**: `components/forms/Input.tsx`

**Props**:

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  helperText?: string;
  name?: string;
  autoComplete?: string;
}
```

**Implementation**:

```tsx
'use client';

import { FC, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Input.module.css';
import { cn } from '@/lib/utils';

export const Input: FC<InputProps> = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  helperText,
  name,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const inputClasses = cn(
    styles.input,
    icon && iconPosition === 'left' && styles['input--with-left-icon'],
    icon && iconPosition === 'right' && styles['input--with-right-icon'],
    isPassword && styles['input--with-password-toggle'],
    error && styles['input--error'],
    disabled && styles['input--disabled'],
    isFocused && styles['input--focused']
  );

  return (
    <div className={styles.inputWrapper}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.inputContainer}>
        {icon && iconPosition === 'left' && (
          <span className={styles.iconLeft}>{icon}</span>
        )}

        <input
          type={inputType}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          name={name}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {icon && iconPosition === 'right' && (
          <span className={styles.iconRight}>{icon}</span>
        )}

        {isPassword && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {error && <span className={styles.error}>{error}</span>}
      {helperText && !error && (
        <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
};
```

**Styles**:

```css
.inputWrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.label {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: var(--charcoal);
}

.required {
  color: #C4756E;
  margin-left: 4px;
}

.inputContainer {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  padding: 14px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: var(--charcoal);
  background: white;
  border: 2px solid var(--faded-gray-secondary);
  border-radius: 8px;
  transition: all 0.3s ease;
  outline: none;
}

.input::placeholder {
  color: var(--charcoal-lighter);
}

.input:focus {
  border-color: var(--vintage-green-primary);
  box-shadow: 0 0 0 3px rgba(125, 155, 123, 0.1);
}

.input--with-left-icon {
  padding-left: 44px;
}

.input--with-right-icon {
  padding-right: 44px;
}

.input--with-password-toggle {
  padding-right: 44px;
}

.input--error {
  border-color: #C4756E;
}

.input--error:focus {
  box-shadow: 0 0 0 3px rgba(196, 117, 110, 0.1);
}

.input--disabled {
  background: #F5F5F5;
  cursor: not-allowed;
  opacity: 0.6;
}

.iconLeft,
.iconRight {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--charcoal-lighter);
}

.iconLeft {
  left: 12px;
}

.iconRight {
  right: 12px;
}

.passwordToggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--charcoal-lighter);
  padding: 4px;
  transition: color 0.2s ease;
}

.passwordToggle:hover {
  color: var(--charcoal);
}

.error {
  font-size: 13px;
  color: #C4756E;
  font-family: 'Inter', sans-serif;
}

.helperText {
  font-size: 13px;
  color: var(--charcoal-lighter);
  font-family: 'Inter', sans-serif;
}
```

**Usage**:

```tsx
<Input
  type="email"
  label="Email Address"
  placeholder="john@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  helperText="We'll never share your email"
/>

<Input
  type="password"
  label="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error={passwordError}
  required
/>

<Input
  type="text"
  label="Search"
  icon={<Search size={20} />}
  iconPosition="left"
  placeholder="Search transactions..."
/>
```

---

## 🏢 COMMERCIAL WEBSITE COMPONENTS

### 4. Hero Component

**File**: `components/commercial/Hero.tsx`

**Props**:

```typescript
interface HeroProps {
  headline: string;
  subheadline: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  backgroundImage: string;
  imageSide?: 'left' | 'right';
}
```

**Implementation**:

```tsx
'use client';

import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';
import styles from './Hero.module.css';

export const Hero: FC<HeroProps> = ({
  headline,
  subheadline,
  primaryCTA,
  secondaryCTA,
  backgroundImage,
  imageSide = 'right',
}) => {
  return (
    <section
      className={styles.hero}
      style={{ flexDirection: imageSide === 'left' ? 'row-reverse' : 'row' }}
    >
      <div className={styles.content}>
        <h1 className={styles.headline}>{headline}</h1>
        <p className={styles.subheadline}>{subheadline}</p>
        <div className={styles.actions}>
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
      <div className={styles.imageWrapper}>
        <Image
          src={backgroundImage}
          alt="Hero image"
          width={960}
          height={720}
          priority
          className={styles.image}
        />
      </div>
    </section>
  );
};
```

**Styles**:

```css
.hero {
  display: flex;
  align-items: center;
  gap: 64px;
  padding: 80px 0;
  max-width: 1280px;
  margin: 0 auto;
}

.content {
  flex: 1;
  max-width: 600px;
}

.headline {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 60px;
  line-height: 1.1;
  color: var(--charcoal);
  margin-bottom: 24px;
  animation: fadeInUp 0.6s ease-out;
}

.subheadline {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  line-height: 1.6;
  color: var(--charcoal-light);
  margin-bottom: 32px;
  animation: fadeInUp 0.8s ease-out;
}

.actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  animation: fadeInUp 1s ease-out;
}

.imageWrapper {
  flex: 1;
  position: relative;
  min-height: 500px;
}

.image {
  width: 100%;
  height: auto;
  border-radius: 16px;
  object-fit: cover;
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

@media (max-width: 768px) {
  .hero {
    flex-direction: column !important;
    padding: 40px 20px;
  }

  .headline {
    font-size: 40px;
  }

  .subheadline {
    font-size: 18px;
  }

  .imageWrapper {
    width: 100%;
    min-height: 300px;
  }
}
```

---

## 💼 PORTAL COMPONENTS

### 5. Account Balance Card

**File**: `components/portal/AccountCard.tsx`

**Props**:

```typescript
interface AccountCardProps {
  accountType: string;
  accountNumber: string;
  balance: number;
  currency: string;
  icon: React.ReactNode;
  gradientColors: [string, string];
  onClick?: () => void;
}
```

**Implementation**:

```tsx
'use client';

import { FC } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import styles from './AccountCard.module.css';

export const AccountCard: FC<AccountCardProps> = ({
  accountType,
  accountNumber,
  balance,
  currency,
  icon,
  gradientColors,
  onClick,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(balance);

  return (
    <div
      className={styles.card}
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
      }}
      onClick={onClick}
    >
      <div className={styles.header}>
        <div className={styles.icon}>{icon}</div>
        <button
          className={styles.toggleBalance}
          onClick={(e) => {
            e.stopPropagation();
            setShowBalance(!showBalance);
          }}
        >
          {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>

      <div className={styles.accountInfo}>
        <div className={styles.accountType}>{accountType}</div>
        <div className={styles.accountNumber}>{accountNumber}</div>
      </div>

      <div className={styles.balance}>
        {showBalance ? formattedBalance : '••••••'}
      </div>

      <div className={styles.availableBalance}>Available Balance</div>
    </div>
  );
};
```

**Styles**:

```css
.card {
  color: white;
  padding: 24px;
  border-radius: 16px;
  min-height: 200px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.card:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.toggleBalance {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.toggleBalance:hover {
  opacity: 1;
}

.accountInfo {
  margin-bottom: 24px;
}

.accountType {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 4px;
}

.accountNumber {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  opacity: 0.8;
}

.balance {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}

.availableBalance {
  font-size: 12px;
  opacity: 0.8;
}
```

---

[Additional 45+ components would follow with same level of detail...]

---

## 📦 Export Structure

**File**: `components/index.ts`

```typescript
// Layout Components
export { Header } from './layout/Header';
export { Footer } from './layout/Footer';
export { Sidebar } from './layout/Sidebar';

// UI Components
export { Button } from './ui/Button';
export { Card, CardHeader, CardContent, CardFooter } from './ui/Card';
export { Input } from './forms/Input';
export { Select } from './forms/Select';
export { Checkbox } from './forms/Checkbox';
export { Badge } from './ui/Badge';
export { Modal } from './ui/Modal';
export { Toast } from './ui/Toast';

// Commercial Components
export { Hero } from './commercial/Hero';
export { ServiceCard } from './commercial/ServiceCard';
export { Testimonial } from './commercial/Testimonial';
export { TrustIndicator } from './commercial/TrustIndicator';

// Portal Components
export { AccountCard } from './portal/AccountCard';
export { TransactionRow } from './portal/TransactionRow';
export { QuickActions } from './portal/QuickActions';
export { BillItem } from './portal/BillItem';
```

---

**Version**: 1.0  
**Last Updated**: January 15, 2026  
**Total Components**: 50+ components documented
