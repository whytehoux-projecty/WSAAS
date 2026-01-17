# AURUM VAULT - End-to-End User Journey Tests

## Test Environment Setup

### Prerequisites

1. All services running:
   - Backend API: `http://localhost:3001`
   - Corporate Website: `http://localhost:3002`
   - Admin Interface: `http://localhost:3003`
   - E-Banking Portal: `http://localhost:4000`

2. Database seeded with test data
3. Test user credentials ready

---

## Test Suite 1: New User Onboarding Journey

### TC-001: Account Application (Corporate Website)

**Objective**: Verify complete account application flow

**Steps**:

1. Navigate to `http://localhost:3002/apply`
2. Fill out application form with test data:
   - Application Type: PERSONAL
   - First Name: John
   - Last Name: Doe
   - Email: <john.doe@test.com>
   - Phone: +1-555-0100
   - Date of Birth: 1990-01-01
   - SSN: 123-45-6789
   - Address: 123 Main St
   - City: New York
   - State: NY
   - ZIP: 10001
   - Employment Status: EMPLOYED
   - Annual Income: $75,000
   - Source of Funds: SALARY
3. Submit application

**Expected Results**:

- ✅ Form validation works correctly
- ✅ Success message displayed
- ✅ Application saved to database
- ✅ Status: PENDING

**Verification**:

- Check Admin Interface → Applications
- Verify application appears with correct data

---

### TC-002: Admin Review & Approval

**Objective**: Admin reviews and approves account application

**Steps**:

1. Login to Admin Interface (`http://localhost:3003`)
2. Navigate to Applications/Users
3. Find John Doe's application
4. Review application details
5. Approve application
6. System creates user account

**Expected Results**:

- ✅ Application details visible
- ✅ Approval action successful
- ✅ User account created
- ✅ Email notification sent (if configured)

---

### TC-003: User First Login (E-Banking Portal)

**Objective**: New user logs in for first time

**Steps**:

1. Navigate to `http://localhost:4000/auth/login`
2. Enter credentials (email from application)
3. Complete first-time setup if required
4. Access dashboard

**Expected Results**:

- ✅ Login successful
- ✅ Dashboard loads
- ✅ Account information displayed
- ✅ Balance shows $0.00

---

## Test Suite 2: Core Banking Operations

### TC-004: Deposit Funds

**Objective**: User deposits money into account

**Steps**:

1. Login to E-Banking Portal
2. Navigate to Transactions
3. Click "Deposit"
4. Enter amount: $5,000
5. Add description: "Initial deposit"
6. Submit transaction

**Expected Results**:

- ✅ Transaction created
- ✅ Status: COMPLETED
- ✅ Balance updated to $5,000
- ✅ Transaction appears in history

---

### TC-005: Add Beneficiary

**Objective**: User adds external beneficiary

**Steps**:

1. Navigate to Beneficiaries page
2. Click "Add Beneficiary"
3. Fill form:
   - Name: Jane Smith
   - Account Number: 9876543210
   - Bank Name: Test Bank
   - SWIFT Code: TESTUS33
   - Nickname: Jane
   - Email: <jane@test.com>
4. Save beneficiary

**Expected Results**:

- ✅ Beneficiary saved
- ✅ Appears in beneficiaries list
- ✅ Can be selected for transfers

---

### TC-006: Internal Transfer

**Objective**: Transfer between own accounts

**Steps**:

1. Navigate to Transfer page
2. Select "Internal Transfer"
3. Choose source account
4. Choose destination account (if multiple)
5. Enter amount: $1,000
6. Add description
7. Submit transfer

**Expected Results**:

- ✅ Transfer processed
- ✅ Both account balances updated
- ✅ Two transactions created (debit & credit)
- ✅ Reference numbers match

---

### TC-007: External Transfer to Beneficiary

**Objective**: Send money to saved beneficiary

**Steps**:

1. Navigate to Transfer page
2. Select "External Transfer"
3. Choose beneficiary: Jane Smith
4. Enter amount: $500
5. Add description: "Payment"
6. Submit transfer

**Expected Results**:

- ✅ Transfer created
- ✅ Status: PENDING (for admin approval)
- ✅ Balance reserved/held
- ✅ Notification sent

---

## Test Suite 3: Card Management

### TC-008: Issue New Card

**Objective**: User requests new debit card

**Steps**:

1. Navigate to Cards page
2. Click "Issue New Card"
3. Select account
4. Choose card type: DEBIT
5. Submit request

**Expected Results**:

- ✅ Card created
- ✅ Status: ACTIVE
- ✅ Card number generated (masked display)
- ✅ Daily/Monthly limits set
- ✅ Expiry date set (3 years)

---

### TC-009: Freeze/Unfreeze Card

**Objective**: User temporarily freezes card

**Steps**:

1. Navigate to Cards page
2. Select active card
3. Click "Freeze Card"
4. Confirm action
5. Verify status changed
6. Click "Unfreeze Card"
7. Verify status restored

**Expected Results**:

- ✅ Card status: FROZEN
- ✅ Visual indicator updated
- ✅ Card unusable for transactions
- ✅ Unfreeze restores to ACTIVE
- ✅ Audit log created

---

### TC-010: Update Card Limits

**Objective**: User adjusts spending limits

**Steps**:

1. Navigate to Cards page
2. Select card
3. Click "Adjust Limits"
4. Update daily limit to $3,000
5. Save changes

**Expected Results**:

- ✅ Limits updated
- ✅ New limits displayed
- ✅ Changes logged

---

## Test Suite 4: Bill Payments

### TC-011: Add Bill Payee

**Objective**: User adds utility company as payee

**Steps**:

1. Navigate to Bills page
2. Click "Add Payee"
3. Fill form:
   - Name: Electric Company
   - Account Number: ELEC-12345
   - Category: UTILITIES
4. Save payee

**Expected Results**:

- ✅ Payee saved
- ✅ Appears in payees list
- ✅ Category badge displayed

---

### TC-012: Pay Bill

**Objective**: User pays utility bill

**Steps**:

1. Navigate to Bills page
2. Select "Electric Company"
3. Click "Pay Bill"
4. Select payment account
5. Enter amount: $150
6. Submit payment

**Expected Results**:

- ✅ Payment processed
- ✅ Transaction created (type: PAYMENT)
- ✅ Balance deducted
- ✅ Category auto-assigned: UTILITIES
- ✅ Payment confirmation displayed

---

## Test Suite 5: Statements & Reporting

### TC-013: Generate Statement

**Objective**: User generates monthly statement

**Steps**:

1. Navigate to Statements page
2. Click "Generate Statement"
3. Select account
4. Choose period: Last Month
5. Generate PDF

**Expected Results**:

- ✅ Statement generated
- ✅ PDF downloadable
- ✅ Contains all transactions
- ✅ Opening/closing balances correct
- ✅ Saved to database

---

### TC-014: Download Statement

**Objective**: User downloads existing statement

**Steps**:

1. Navigate to Statements page
2. View statements list
3. Click download on recent statement
4. Open PDF

**Expected Results**:

- ✅ PDF downloads
- ✅ Properly formatted
- ✅ All data accurate
- ✅ Branding present

---

## Test Suite 6: Transaction Categorization

### TC-015: Auto-Categorization

**Objective**: Verify transactions auto-categorize

**Steps**:

1. Create various transaction types:
   - Deposit
   - Withdrawal
   - Transfer
   - Bill Payment
2. Check transaction categories

**Expected Results**:

- ✅ Deposits: "DEPOSIT"
- ✅ Withdrawals: "WITHDRAWAL"
- ✅ Transfers: "TRANSFER"
- ✅ Bill Payments: Payee category

---

### TC-016: Manual Category Update

**Objective**: User changes transaction category

**Steps**:

1. Navigate to Transactions page
2. Select transaction
3. Click category dropdown
4. Change to "GROCERIES"
5. Save change

**Expected Results**:

- ✅ Category updated
- ✅ Change reflected immediately
- ✅ Filter by category works

---

## Test Suite 7: Admin Operations

### TC-017: Admin Views User Cards

**Objective**: Admin monitors user card activity

**Steps**:

1. Login to Admin Interface
2. Navigate to Cards page
3. Filter by user email
4. View card details

**Expected Results**:

- ✅ All user cards displayed
- ✅ Masked card numbers shown
- ✅ Status indicators correct
- ✅ Filtering works

---

### TC-018: Admin Views Bill Payments

**Objective**: Admin monitors bill payment activity

**Steps**:

1. Navigate to Bills page
2. Filter by category: UTILITIES
3. View payee list
4. Check user associations

**Expected Results**:

- ✅ All payees displayed
- ✅ Category filtering works
- ✅ User information shown
- ✅ Pagination functional

---

### TC-019: Admin Approves Wire Transfer

**Objective**: Admin reviews and approves pending transfer

**Steps**:

1. Navigate to Wire Transfers
2. Filter status: PENDING
3. Review transfer details
4. Approve transfer
5. Add approval notes

**Expected Results**:

- ✅ Transfer status: APPROVED
- ✅ Funds released
- ✅ Audit log created
- ✅ User notified

---

## Test Suite 8: Security & Compliance

### TC-020: Session Management

**Objective**: Verify session timeout and security

**Steps**:

1. Login to E-Banking Portal
2. Wait for session timeout (30 min)
3. Attempt action
4. Verify redirect to login

**Expected Results**:

- ✅ Session expires
- ✅ Redirected to login
- ✅ No data exposed
- ✅ Re-login required

---

### TC-021: Audit Trail Verification

**Objective**: Verify all actions logged

**Steps**:

1. Login to Admin Interface
2. Navigate to Audit Logs
3. Filter by user
4. Review recent actions

**Expected Results**:

- ✅ All actions logged
- ✅ Timestamps accurate
- ✅ IP addresses recorded
- ✅ Action details complete

---

## Test Suite 9: Error Handling

### TC-022: Insufficient Funds

**Objective**: Verify overdraft protection

**Steps**:

1. Attempt transfer exceeding balance
2. Submit transaction

**Expected Results**:

- ✅ Transaction rejected
- ✅ Error message: "Insufficient funds"
- ✅ Balance unchanged
- ✅ No transaction created

---

### TC-023: Invalid Beneficiary

**Objective**: Verify beneficiary validation

**Steps**:

1. Add beneficiary with invalid account
2. Attempt transfer
3. Verify error handling

**Expected Results**:

- ✅ Validation error shown
- ✅ Transaction prevented
- ✅ User prompted to correct

---

## Test Suite 10: UI/UX Verification

### TC-024: Responsive Design

**Objective**: Verify mobile responsiveness

**Steps**:

1. Open E-Banking Portal on mobile viewport
2. Navigate through all pages
3. Test all interactions

**Expected Results**:

- ✅ Layout adapts to screen size
- ✅ All features accessible
- ✅ Touch targets adequate
- ✅ No horizontal scroll

---

### TC-025: Accessibility

**Objective**: Verify WCAG compliance

**Steps**:

1. Run accessibility audit
2. Test keyboard navigation
3. Test screen reader compatibility

**Expected Results**:

- ✅ All forms have labels
- ✅ Keyboard navigation works
- ✅ ARIA attributes present
- ✅ Color contrast sufficient

---

## Test Execution Checklist

### Pre-Test Setup

- [ ] All services running
- [ ] Database reset to clean state
- [ ] Test data seeded
- [ ] Browser cache cleared

### During Testing

- [ ] Document all failures
- [ ] Screenshot errors
- [ ] Note unexpected behavior
- [ ] Record performance issues

### Post-Test

- [ ] Compile test results
- [ ] Create bug reports
- [ ] Update test cases
- [ ] Generate test report

---

## Success Criteria

**Pass Rate**: 95% or higher
**Critical Failures**: 0
**Performance**: All pages load < 2 seconds
**Security**: No vulnerabilities detected

---

## Test Report Template

```
Test Date: [DATE]
Tester: [NAME]
Environment: [DEV/STAGING/PROD]

Total Tests: [X]
Passed: [X]
Failed: [X]
Blocked: [X]
Pass Rate: [X]%

Critical Issues: [LIST]
High Priority: [LIST]
Medium Priority: [LIST]
Low Priority: [LIST]

Notes: [OBSERVATIONS]
```

---

## Automated Test Recommendations

### Unit Tests

- API endpoint validation
- Database operations
- Business logic functions

### Integration Tests

- Service-to-service communication
- Database transactions
- External API calls

### E2E Tests (Playwright/Cypress)

- User registration flow
- Login/logout
- Transaction creation
- Card management
- Bill payment flow

---

## Performance Benchmarks

| Operation | Target Time | Acceptable |
|-----------|-------------|------------|
| Page Load | < 1s | < 2s |
| API Response | < 200ms | < 500ms |
| Transaction Processing | < 1s | < 3s |
| Statement Generation | < 5s | < 10s |
| Database Query | < 100ms | < 300ms |

---

**Last Updated**: 2026-01-17
**Version**: 1.0
**Status**: Ready for Execution
