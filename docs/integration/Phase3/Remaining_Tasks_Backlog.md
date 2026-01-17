# Remaining Implementation Tasks (Week 3-4 Backlog)

Based on the integration plans from Phase 1 and Phase 2, the following implementation tasks remain to be completed. These correspond to the "Enhanced Features" planned for Weeks 3 and 4.

## 1. Statement Generation Module

**Status:** 🔴 Not Started
**Estimated Effort:** 8-10 hours

### Backend Requirements

- [ ] Create `Statement` Prisma model.
- [ ] Implement PDF generation service (using `pdfkit` or similar).
- [ ] Create API Endpoint: `GET /api/statements` (List statements).
- [ ] Create API Endpoint: `GET /api/statements/:id/download` (Serve PDF).
- [ ] Implement scheduled job/trigger for generating monthly statements.

### Frontend Requirements

- [ ] Create Statements page in E-Banking Portal.
- [ ] Implement download functionality.

## 2. Transaction Categorization

**Status:** 🔴 Not Started
**Estimated Effort:** 4-6 hours

### Backend Requirements

- [ ] Update `Transaction` Prisma model to include `category` string field.
- [ ] Create migration script `prisma db migrate dev`.
- [ ] Update POST transaction endpoints to accept/assign categories.
- [ ] Run data migration for existing transactions (assign 'General' or infer from type).

### Frontend Requirements

- [ ] Update Transaction list to display categories.
- [ ] Add category filter/spending breakdown (optional visualization).

## 3. Card Management (Optional/Low Priority)

**Status:** 🔴 Not Started
**Estimated Effort:** 8-10 hours

### Backend Requirements

- [ ] Create `Card` Prisma model.
- [ ] Create API Endpoints: `GET /api/cards`, `POST /api/cards/:id/freeze`, `POST /api/cards/:id/unfreeze`.

### Frontend Requirements

- [ ] Create Cards management page.
- [ ] Implement freeze/unfreeze UI.

## 4. Bill Payments (Optional/Low Priority)

**Status:** 🔴 Not Started
**Estimated Effort:** 8-10 hours

### Backend Requirements

- [ ] Create `Bill` and `BillPayment` Prisma models.
- [ ] Create API Endpoints: `GET /api/bills`, `POST /api/bills/pay`.

### Frontend Requirements

- [ ] Create Bill Pay interface.

## Summary of Completed Tasks (Weeks 1-2)

- ✅ **Authentication:** Login (email/account#), Refresh Token, Registration (w/ DOB), Logout.
- ✅ **Core Features:** Contact Form, Account Applications, Beneficiaries (CRUD).
- ✅ **Compatibility:** Route aliases and frontend data mapping.
