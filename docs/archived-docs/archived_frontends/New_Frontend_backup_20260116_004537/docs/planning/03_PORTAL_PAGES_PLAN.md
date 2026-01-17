# 🏦 E-BANKING PORTAL - Complete Implementation Plan

---

## 📋 TABLE OF CONTENTS

1. [Portal Overview](#portal-overview)
2. [Dashboard Page](#1-dashboard-page)
3. [Transfer Money Page](#2-transfer-money-page)
4. [Transactions History Page](#3-transactions-history-page)
5. [Accounts Page](#4-accounts-page)
6. [Cards Management Page](#5-cards-management-page)
7. [Bill Payments Page](#6-bill-payments-page)
8. [Beneficiaries Page](#7-beneficiaries-page)
9. [Statements & Documents Page](#8-statements--documents-page)
10. [Profile & Settings Page](#9-profile--settings-page)
11. [Support/Help Center Page](#10-supporthelp-center-page)

---

## 🎯 PORTAL OVERVIEW

### Authentication Flow

All portal pages require authentication. Redirect to `/e-banking/auth/signin` if not logged in.

### Layout Structure

```
┌──────────────────────────────────────────────────┐
│                  Top Bar                         │
│  Logo | Search | Notifications | Profile         │
├──────────┬───────────────────────────────────────┤
│          │                                       │
│ Sidebar  │        Main Content Area              │
│          │                                       │
│  - Home  │                                       │
│  - Trans │                                       │
│  - Cards │                                       │
│  - Bills │                                       │
│  - Etc.  │                                       │
│          │                                       │
│          │                                       │
└──────────┴───────────────────────────────────────┘
```

### Sidebar Navigation (Consistent Across Portal)

**Width**: 280px desktop, collapsible to 80px (icon-only), hidden on mobile (hamburger menu)

**Background**: Vintage Green (#7D9B7B)

**Text Color**: White/Warm Cream

**Menu Items**:

```javascript
const menuItems = [
  {
    icon: <Home />,
    label: "Dashboard",
    path: "/e-banking/dashboard",
  },
  {
    icon: <ArrowRightLeft />,
    label: "Transfer Money",
    path: "/e-banking/transfer",
  },
  {
    icon: <Receipt />,
    label: "Transactions",
    path: "/e-banking/transactions",
  },
  {
    icon: <Wallet />,
    label: "Accounts",
    path: "/e-banking/accounts",
  },
  {
    icon: <CreditCard />,
    label: "Cards",
    path: "/e-banking/cards",
  },
  {
    icon: <FileText />,
    label: "Bill Payments",
    path: "/e-banking/bills",
  },
  {
    icon: <Users />,
    label: "Beneficiaries",
    path: "/e-banking/beneficiaries",
  },
  {
    icon: <Download />,
    label: "Statements",
    path: "/e-banking/statements",
  },
  {
    icon: <Settings />,
    label: "Settings",
    path: "/e-banking/settings",
  },
  {
    icon: <HelpCircle />,
    label: "Help & Support",
    path: "/e-banking/support",
  },
];
```

**Active State Styling**:

```css
.nav-item--active {
  background: rgba(255, 255, 255, 0.15);
  border-left: 4px solid #D4AF7A; /* Soft Gold */
  font-weight: 600;
}
```

### Top Bar (Consistent)

**Height**: 72px

**Background**: White

**Shadow**: Subtle bottom shadow

**Elements** (Left to Right):

1. **Logo**: NexBank wordmark (180px wide)
2. **Search Bar**: Full-width search (desktop only)
3. **Notifications Icon**: Bell with badge count
4. **Profile Dropdown**: Avatar + name + dropdown menu

---

# 1. DASHBOARD PAGE

## 📄 Page Overview

**Route**: `/e-banking/dashboard`  
**Purpose**: Central hub showing account overview, quick actions, and recent activity  
**Update Frequency**: Real-time balance updates

## 🎨 Design Requirements

### Page Layout

```
┌─────────────────────────────────────────────────┐
│  Welcome Banner                                 │
│  "Good Morning, [First Name]"                   │
├──────────────────┬──────────────────────────────┤
│                  │                              │
│ Account Balance  │   Quick Actions              │
│ Cards (3)        │   - Transfer                 │
│                  │   - Pay Bill                 │
│                  │   - Deposit Check            │
├──────────────────┴──────────────────────────────┤
│  Recent Transactions (Last 10)                  │
│  Table with: Date | Desc | Amount | Status      │
├──────────────────┬──────────────────────────────┤
│                  │                              │
│ Spending Chart   │  Upcoming Bills              │
│ (This Month)     │  - Electric: $89 (Due 3 days)│
│                  │  - Internet: $65 (Due 5 days)│
│                  │                              │
├──────────────────┴──────────────────────────────┤
│  Financial Insights (AI-powered)                │
│  "You spent 15% less than last month..."        │
└─────────────────────────────────────────────────┘
```

## 📝 Content Specification

### Welcome Banner

**Text**:

```
Good [Morning/Afternoon/Evening], [User.firstName]
```

- Dynamic greeting based on time of day
- Font: Playfair Display, 600, 28px
- Color: Charcoal (#3D3D3D)

**Date Display**:

```
Wednesday, January 15, 2026
```

- Font: Inter, 400, 14px
- Color: Charcoal Light (#5A5A5A)

**Background**: Subtle gradient from Warm Cream to Off-White

**Height**: 120px

### Account Balance Cards

**Layout**: 3 cards side-by-side (desktop), stacked (mobile)

**Card 1 - Checking Account**:

```jsx
{
  accountType: "Checking Account",
  accountNumber: "****1234",
  balance: 12847.32,
  currency: "USD",
  icon: <Building2 />,
  color: "vintage-green"
}
```

**Display Format**:

```
Checking Account
****1234

$12,847.32
Available Balance

[View Details Button]
```

**Card Styling**:

```css
.account-card {
  background: linear-gradient(135deg, #7D9B7B 0%, #8B9D83 100%);
  color: white;
  padding: 24px;
  border-radius: 16px;
  min-height: 180px;
  position: relative;
  overflow: hidden;
}

.account-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.account-card__type {
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 4px;
}

.account-card__number {
  font-family: 'JetBrains Mono';
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 20px;
}

.account-card__balance {
  font-family: 'Playfair Display';
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}

.account-card__label {
  font-size: 12px;
  opacity: 0.8;
}
```

**Card 2 - Savings Account**:

```jsx
{
  accountType: "Savings Account",
  accountNumber: "****5678",
  balance: 45230.19,
  currency: "USD",
  icon: <PiggyBank />,
  color: "soft-gold"
}
```

- Gradient: Soft Gold shades

**Card 3 - Credit Card**:

```jsx
{
  accountType: "Credit Card",
  accountNumber: "****9012",
  balance: -1234.56, // Negative = owed
  availableCredit: 8765.44,
  currency: "USD",
  icon: <CreditCard />,
  color: "faded-gray"
}
```

**Display**:

```
Credit Card
****9012

$1,234.56
Current Balance

$8,765.44 available credit
```

### Quick Actions Panel

**Card Style**: White background, soft shadow

**Actions** (4 buttons in 2x2 grid):

1. **Transfer Money**
   - Icon: ArrowRightLeft
   - Text: "Transfer"
   - Background: Vintage Green
   - onClick: Navigate to /e-banking/transfer

2. **Pay Bill**
   - Icon: Receipt
   - Text: "Pay Bill"
   - Background: Soft Gold
   - onClick: Navigate to /e-banking/bills

3. **Deposit Check**
   - Icon: Camera
   - Text: "Deposit"
   - Background: Faded Gray
   - onClick: Open camera/upload modal

4. **Send Money**
   - Icon: Send
   - Text: "Send"
   - Background: Vintage Green (lighter)
   - onClick: Open quick send drawer

**Button Styling**:

```css
.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 14px;
}

.quick-action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.quick-action-btn__icon {
  width: 32px;
  height: 32px;
}
```

### Recent Transactions Table

**Headline**: "Recent Transactions"

**View All Link**: "View All" → /e-banking/transactions

**Table Columns**:

1. Date (MM/DD/YYYY)
2. Description (Merchant/Payee name)
3. Category (Icon + label)
4. Amount (+ for credit, - for debit)
5. Status (Completed/Pending badge)

**Sample Data**:

```javascript
const recentTransactions = [
  {
    id: "txn_001",
    date: "2026-01-15",
    description: "Whole Foods Market",
    category: "Groceries",
    amount: -127.43,
    type: "debit",
    status: "completed",
  },
  {
    id: "txn_002",
    date: "2026-01-14",
    description: "Salary Deposit - ABC Corp",
    category: "Income",
    amount: 4250.00,
    type: "credit",
    status: "completed",
  },
  {
    id: "txn_003",
    date: "2026-01-14",
    description: "Electric Company",
    category: "Utilities",
    amount: -89.12,
    type: "debit",
    status: "completed",
  },
  {
    id: "txn_004",
    date: "2026-01-13",
    description: "Amazon.com",
    category: "Shopping",
    amount: -45.67,
    type: "debit",
    status: "pending",
  },
  {
    id: "txn_005",
    date: "2026-01-13",
    description: "Coffee Shop",
    category: "Dining",
    amount: -5.75,
    type: "debit",
    status: "completed",
  },
];
```

**Table Styling**:

```css
.transactions-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.transactions-table thead {
  background: #F5F1E8; /* Warm Cream */
}

.transactions-table th {
  padding: 16px;
  text-align: left;
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 600;
  color: #3D3D3D;
}

.transactions-table tbody tr {
  border-bottom: 1px solid #E5E5E5;
  transition: background 0.2s ease;
}

.transactions-table tbody tr:hover {
  background: #FAF9F6;
}

.transactions-table td {
  padding: 16px;
  font-family: 'Inter';
  font-size: 14px;
}

.transaction-amount--credit {
  color: #7D9B7B; /* Green for income */
  font-weight: 600;
}

.transaction-amount--debit {
  color: #3D3D3D;
  font-weight: 500;
}

.transaction-status--completed {
  background: #7D9B7B;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.transaction-status--pending {
  background: #D4AF7A;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}
```

### Spending Analytics Chart

**Title**: "Spending This Month"

**Chart Type**: Pie Chart (using Recharts)

**Data Categories**:

```javascript
const spendingData = [
  { category: "Groceries", amount: 687.50, color: "#7D9B7B" },
  { category: "Utilities", amount: 245.00, color: "#8B9D83" },
  { category: "Entertainment", amount: 189.00, color: "#D4AF7A" },
  { category: "Dining", amount: 324.75, color: "#B8941F" },
  { category: "Shopping", amount: 456.20, color: "#9CA3AF" },
  { category: "Transportation", amount: 178.50, color: "#B8BFC6" },
  { category: "Other", amount: 123.45, color: "#5A5A5A" },
];
```

**Total Display**:

```
Total Spent: $2,204.40
vs. Last Month: -15% (down arrow icon)
```

**Implementation**:

```jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={spendingData}
      dataKey="amount"
      nameKey="category"
      cx="50%"
      cy="50%"
      outerRadius={80}
      label={(entry) => `${entry.category} $${entry.amount}`}
    >
      {spendingData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

### Upcoming Bills Widget

**Title**: "Upcoming Bills"

**View All Link**: "Manage Bills" → /e-banking/bills

**Bill Items** (List format):

```javascript
const upcomingBills = [
  {
    id: "bill_001",
    payee: "Electric Company",
    amount: 89.12,
    dueDate: "2026-01-18",
    daysUntilDue: 3,
    status: "scheduled",
    autopay: true,
  },
  {
    id: "bill_002",
    payee: "Internet Service",
    amount: 65.00,
    dueDate: "2026-01-20",
    daysUntilDue: 5,
    status: "pending",
    autopay: false,
  },
  {
    id: "bill_003",
    payee: "Water Utility",
    amount: 42.50,
    dueDate: "2026-01-25",
    daysUntilDue: 10,
    status: "pending",
    autopay: true,
  },
];
```

**Display Format** (per bill):

```
Electric Company                              $89.12
Due in 3 days (Jan 18)                   [AutoPay ON]
[Pay Now Button]
```

**Styling**:

```css
.bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #E5E5E5;
}

.bill-item:last-child {
  border-bottom: none;
}

.bill-item__payee {
  font-family: 'Inter';
  font-weight: 600;
  font-size: 14px;
  color: #3D3D3D;
}

.bill-item__due {
  font-size: 12px;
  color: #787878;
}

.bill-item__amount {
  font-family: 'Playfair Display';
  font-weight: 600;
  font-size: 18px;
  color: #3D3D3D;
}

.bill-item__autopay {
  font-size: 11px;
  color: #7D9B7B;
  background: rgba(125, 155, 123, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}
```

### Financial Insights Panel

**Title**: "Insights for You"

**Powered by**: "AI-Powered Analysis"

**Insight Cards** (2-3 rotating insights):

**Insight 1 - Spending Pattern**:

```
Icon: TrendingDown (green)
Title: "Great job saving!"
Text: "You spent 15% less this month compared to last month. 
       Keep up the good work!"
Type: "positive"
```

**Insight 2 - Saving Opportunity**:

```
Icon: Lightbulb
Title: "Savings Opportunity"
Text: "You have $2,847 in checking. Consider moving $2,000 
       to savings to earn 4.2% APY."
Type: "suggestion"
Action: "Transfer to Savings" button
```

**Insight 3 - Budget Alert**:

```
Icon: AlertCircle
Title: "Dining Budget Alert"
Text: "You've spent $324 on dining this month (80% of your 
       $400 budget)."
Type: "warning"
```

**Card Styling**:

```css
.insight-card {
  background: white;
  border-left: 4px solid;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.insight-card--positive {
  border-color: #7D9B7B;
  background: rgba(125, 155, 123, 0.05);
}

.insight-card--suggestion {
  border-color: #D4AF7A;
  background: rgba(212, 175, 122, 0.05);
}

.insight-card--warning {
  border-color: #E5A855;
  background: rgba(229, 168, 85, 0.05);
}

.insight-card__icon {
  width: 24px;
  height: 24px;
  margin-bottom: 12px;
}

.insight-card__title {
  font-family: 'Inter';
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
}

.insight-card__text {
  font-family: 'Inter';
  font-size: 14px;
  line-height: 1.6;
  color: #5A5A5A;
}
```

## 🎬 Animations & Interactions

**On Load**:

1. Welcome banner fades in (300ms)
2. Account cards slide in from left, staggered (100ms delay each)
3. Quick actions fade in (600ms)
4. Transactions table rows fade in sequentially (50ms delay each)
5. Chart animates data entry (800ms)

**Real-Time Updates**:

- Balance cards pulse briefly when updated
- New transactions fade in at top of list
- Notification badge bounces when new notification

**Hover States**:

- Account cards: Subtle scale 1.02x
- Quick action buttons: Lift 4px, shadow increase
- Table rows: Background color change
- Buttons: Color darken

## 📱 Responsive Design

**Mobile (< 768px)**:

- Account cards: Single column, full width
- Quick actions: 2x2 grid
- Transactions table: Card layout instead of table
- Chart: Reduce to legend-only view with list
- Bills: Full width list

**Tablet (768px - 1023px)**:

- Account cards: 2 cards per row
- Quick actions: 4 in a row
- Maintain table structure

## 🖼️ Image Assets Required

| Asset | Type | Dimensions | Description |
|-------|------|------------|-------------|
| dashboard-empty-state.svg | Illustration | 400x300 | "No transactions yet" |
| chart-placeholder.svg | Illustration | 200x200 | Loading state |
| insight-lightbulb.svg | Icon | 24x24 | Suggestion icon |

## 💻 Component Structure

```jsx
// app/e-banking/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import WelcomeBanner from '@/components/portal/WelcomeBanner';
import AccountCards from '@/components/portal/AccountCards';
import QuickActions from '@/components/portal/QuickActions';
import RecentTransactions from '@/components/portal/RecentTransactions';
import SpendingChart from '@/components/portal/SpendingChart';
import UpcomingBills from '@/components/portal/UpcomingBills';
import FinancialInsights from '@/components/portal/FinancialInsights';

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from API
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard">
      <WelcomeBanner user={userData.user} />
      
      <div className="dashboard__grid">
        <div className="dashboard__accounts">
          <AccountCards accounts={userData.accounts} />
        </div>
        
        <div className="dashboard__quick-actions">
          <QuickActions />
        </div>
      </div>

      <div className="dashboard__transactions">
        <RecentTransactions transactions={userData.recentTransactions} />
      </div>

      <div className="dashboard__grid">
        <div className="dashboard__chart">
          <SpendingChart data={userData.spendingData} />
        </div>
        
        <div className="dashboard__bills">
          <UpcomingBills bills={userData.upcomingBills} />
        </div>
      </div>

      <div className="dashboard__insights">
        <FinancialInsights insights={userData.insights} />
      </div>
    </div>
  );
}
```

## ✅ Implementation Checklist

- [ ] Create page route: `app/e-banking/dashboard/page.tsx`
- [ ] Create WelcomeBanner component with time-based greeting
- [ ] Create AccountCards component with balance display
- [ ] Create QuickActions component with 4 action buttons
- [ ] Create RecentTransactions table component
- [ ] Implement transaction filtering and sorting
- [ ] Create SpendingChart using Recharts
- [ ] Create UpcomingBills list component
- [ ] Create FinancialInsights component with AI suggestions
- [ ] Implement real-time balance updates (WebSocket or polling)
- [ ] Add loading states for all async operations
- [ ] Implement error handling with user-friendly messages
- [ ] Test responsive design on all devices
- [ ] Verify accessibility (ARIA labels, keyboard navigation)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Security audit (XSS prevention, CSRF tokens)

---

# 2. TRANSFER MONEY PAGE

## 📄 Page Overview

**Route**: `/e-banking/transfer`  
**Purpose**: Enable users to transfer money between accounts or to beneficiaries  
**Security**: Requires 2FA for transfers over $1,000

## 🎨 Design Requirements

### Page Layout

```
┌─────────────────────────────────────────────────┐
│  Page Header                                    │
│  "Transfer Money"                               │
├─────────────────────────────────────────────────┤
│                                                 │
│  Transfer Form                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ From Account: [Dropdown]                │   │
│  │                                         │   │
│  │ To: [Internal/External Tabs]            │   │
│  │                                         │   │
│  │ Amount: [$____.__]                      │   │
│  │                                         │   │
│  │ Schedule: [Now / Later]                 │   │
│  │                                         │   │
│  │ Memo: [Optional note]                   │   │
│  │                                         │   │
│  │ [Review Transfer Button]                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Recent Transfers (Last 5)                      │
│  - John Doe: $500 (Jan 14)                     │
│  - Savings Account: $1,000 (Jan 10)            │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 📝 Content & Functionality

### Transfer Form

**From Account Dropdown**:

```jsx
<select name="fromAccount">
  <option value="checking_1234">
    Checking ****1234 - $12,847.32
  </option>
  <option value="savings_5678">
    Savings ****5678 - $45,230.19
  </option>
</select>
```

**To Account Selection** (Tabs):

**Tab 1 - Internal Transfer**:

- Transfer between own accounts
- Instant transfer, no fees
- Dropdown of user's other accounts

**Tab 2 - To Beneficiary**:

- Transfer to saved beneficiaries
- Dropdown of beneficiaries
- "Add New Beneficiary" button

**Tab 3 - External Transfer**:

- ACH transfer to external account
- Input: Bank name, routing number, account number
- Takes 1-3 business days
- $0.50 fee

**Amount Input**:

```jsx
<div className="amount-input">
  <label>Amount</label>
  <div className="input-wrapper">
    <span className="currency-symbol">$</span>
    <input
      type="number"
      step="0.01"
      min="0.01"
      max={fromAccountBalance}
      placeholder="0.00"
      required
    />
  </div>
  <span className="available-balance">
    Available: ${fromAccountBalance.toLocaleString()}
  </span>
</div>
```

**Validation Rules**:

- Minimum: $0.01
- Maximum: Available balance
- Must be numeric with up to 2 decimal places
- Cannot transfer to same account

**Schedule Options**:

```jsx
<div className="schedule-options">
  <label>
    <input type="radio" name="schedule" value="now" defaultChecked />
    Transfer Now (Instant)
  </label>
  <label>
    <input type="radio" name="schedule" value="later" />
    Schedule for Later
  </label>
</div>

{scheduleLater && (
  <div className="schedule-date-time">
    <input type="date" min={todayDate} />
    <input type="time" />
  </div>
)}
```

**Memo/Note**:

```jsx
<textarea
  name="memo"
  placeholder="Add a note (optional)"
  maxLength={100}
  rows={3}
/>
<span className="char-count">{memoLength}/100</span>
```

### Review & Confirm Modal

**Triggered by**: Click "Review Transfer" button

**Modal Content**:

```
╔═══════════════════════════════════════════╗
║        Review Transfer                     ║
╠═══════════════════════════════════════════╣
║                                           ║
║  From:    Checking ****1234               ║
║  To:      Savings ****5678                ║
║  Amount:  $1,500.00                       ║
║  Fee:     $0.00                           ║
║  Total:   $1,500.00                       ║
║  When:    Immediately                     ║
║  Memo:    "Monthly savings"               ║
║                                           ║
║  [Cancel]          [Confirm Transfer]     ║
║                                           ║
╚═══════════════════════════════════════════╝
```

**Confirmation Flow**:

1. User clicks "Confirm Transfer"
2. If amount > $1,000: Request 2FA code
3. Submit to API
4. Show success/error message
5. Redirect to confirmation page

### Success Confirmation Page

**Route**: `/e-banking/transfer/confirmation/[transferId]`

**Content**:

```
✓ Transfer Successful!

Reference Number: TXN20260115001234
Amount: $1,500.00
From: Checking ****1234
To: Savings ****5678
Date: January 15, 2026 at 4:15 PM
Status: Completed

[View Receipt (PDF)] [Make Another Transfer] [Back to Dashboard]
```

**Receipt PDF**:

- Generate downloadable PDF with NexBank branding
- Include transaction details
- Reference number for customer service

### Recent Transfers List

**Display**: Last 5 transfers

**Format**:

```jsx
{recentTransfers.map((transfer) => (
  <div className="transfer-item" key={transfer.id}>
    <div className="transfer-item__icon">
      <ArrowRightLeft size={20} />
    </div>
    <div className="transfer-item__details">
      <div className="transfer-item__to">{transfer.toName}</div>
      <div className="transfer-item__date">{transfer.date}</div>
    </div>
    <div className="transfer-item__amount">
      ${transfer.amount.toLocaleString()}
    </div>
    <div className="transfer-item__status">
      <Badge variant={transfer.status}>{transfer.status}</Badge>
    </div>
    <button className="transfer-item__repeat">
      Repeat
    </button>
  </div>
))}
```

## 🎬 Animations

- Form fields slide in on load
- Amount input: Bounce on validation error
- Success checkmark: Draw animation
- Modal: Fade in with backdrop blur

## 🖼️ Images

| Asset | Type | Description |
|-------|------|-------------|
| transfer-success.svg | Illustration | Success checkmark with arrows |
| transfer-processing.svg | Animation | Loading indicator |

## ✅ Implementation Checklist

- [ ] Create transfer form with validation
- [ ] Implement account selection dropdowns
- [ ] Create tab interface for transfer types
- [ ] Build amount input with balance checking
- [ ] Add schedule transfer functionality
- [ ] Create review modal component
- [ ] Implement 2FA for high-value transfers
- [ ] Build confirmation page
- [ ] Generate PDF receipts
- [ ] Create recent transfers list
- [ ] Add "Repeat Transfer" functionality
- [ ] Implement real-time balance updates
- [ ] Error handling and user feedback
- [ ] Test edge cases (insufficient funds, network errors)
- [ ] Security testing (CSRF, XSS prevention)

---

[Continues with remaining 8 portal pages in same detail...]

**Document Status**: Pages 1-2 Complete  
**Remaining Pages**: 8 portal pages  
**

Total Portal Pages**: 10

---

**Version**: 1.0  
**Last Updated**: January 15, 2026  
**Author**: NexBank Development Team
