# Autum Vault_1 – Comprehensive Technical Review (Backend)

Date: 2026-01-15  
Scope: `/Autum Vault_1/backend` (core-api, admin-interface, shared, docker)

## 1. Architecture Analysis

- **Overall style**
  - Backend is split into:
    - **Core API** – JSON Fastify API with Prisma + Redis, JWT auth, Swagger docs.
    - **Admin Interface** – Fastify + EJS server-rendered admin portal with admin JSON APIs.
    - **Shared** – compiled TypeScript utilities and types consumed by both services.
  - Dockerized infrastructure (Postgres, Redis, monitoring, nginx) in [docker](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/docker).

- **Core API wiring**
  - Entrypoint: [server.ts](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/core-api/src/server.ts#L1-L285)
  - Key concerns:
    - Custom security hooks (`securityHeaders`, `cspHeader`, request logging).
    - `@fastify/jwt` + `@fastify/cookie` configured from [environment.ts](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/core-api/src/config/environment.ts).
    - Central `db` manager providing Prisma + Redis via [database.ts](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/core-api/src/lib/database.ts#L1-L131).
    - Business logic layer exists via `ServiceFactory`, but many routes/services still instantiate Prisma directly.

- **Admin interface wiring**
  - Entrypoint: [server.ts](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/admin-interface/src/server.ts#L1-L222)
  - Key concerns:
    - Server-side views (EJS) + JSON endpoints under `/api`.
    - Cookie secret defaults to a hard-coded fallback in production paths.
    - Auth uses JWT verification and DB lookup, but does not validate an admin session concept.

## 2. Code Quality Assessment

- **Strengths**
  - Strong TypeScript usage across workspaces.
  - Consistent modular structure (`config`, `middleware`, `routes`, `services`, `lib`).
  - Core API uses consistent error envelope `{ success, error, meta }` at the global handler ([server.ts](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/core-api/src/server.ts#L214-L240)).

- **Notable technical debt**
  - Duplicate/parallel patterns across services for auth + error formatting.
  - Shared package fails lint due to stricter rules against `any` and unsafe returns, suggesting either:
    - shared should expose a looser API surface, or
    - consuming services should be stricter and shared must be refactored accordingly.

## 3. Security Review

### Critical issues requiring immediate attention

1) **Hard-coded fallback secrets**
   - Admin JWT secret defaults to a literal string:
     - [constants.ts](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/admin-interface/src/config/constants.ts#L1)
   - Admin cookie signing secret defaults to a literal string:
     - [server.ts](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/admin-interface/src/server.ts#L79-L88)
   - Risk: any environment misconfiguration becomes an account takeover vector.

2) **Auth/session design mismatch (core vs admin)**
   - Core API uses refresh-token-backed DB sessions and checks session state:
     - refresh endpoint validates `userSession` record for `sessionId === refreshToken` ([auth.ts](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/core-api/src/routes/auth.ts#L319-L426))
   - Core API “access token” auth middleware checks DB session against the bearer token:
     - [auth middleware](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/core-api/src/middleware/auth.ts#L11-L92)
   - Risk: the middleware is checking a session table keyed by refresh tokens, but supplies the access token as `sessionId`. That likely means valid access tokens won’t map to `userSession.sessionId` and auth behavior depends on accidental token reuse.

3) **Admin auth middleware double-verifies JWT and decodes inconsistently**
   - Admin `authenticateToken` calls `jwt.verify` twice and then assumes `decoded.userId`:
     - [admin middleware auth.ts](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/admin-interface/src/middleware/auth.ts#L68-L105)
   - Risk: unnecessary cryptographic work, plus brittle claim-handling between login token generation and verification.

### Important recommendations for improvement

- **Unify auth semantics**
  - Decide on one consistent model:
    - Option A: access tokens are stateless JWTs; refresh tokens are stateful DB sessions; middleware verifies JWT only.
    - Option B: both access and refresh tokens are stored/rotated in DB and checked every request.
  - Current implementation appears to mix A and B.

- **Eliminate secret fallbacks**
  - Fail fast on missing secrets at startup for production (`NODE_ENV=production`), rather than defaulting.

- **CSRF posture**
  - The admin interface uses cookies and serves HTML; if any state-changing actions can be triggered cross-site, CSRF protection is required (your [SECURITY.md](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/SECURITY.md#L48) mentions CSRF tokens, but implementation is not present in backend code paths reviewed).

## 4. Performance Evaluation

### High impact concerns

- **Multiple PrismaClient instances**
  - Core API repeatedly instantiates `new PrismaClient()` in routes/services despite having a singleton DB manager:
    - e.g. [auth routes](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/core-api/src/routes/auth.ts#L1-L7),
      [auth middleware](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/core-api/src/middleware/auth.ts#L1-L7),
      [transactionService](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/core-api/src/services/transactionService.ts#L1-L5)
  - Risk: connection pool pressure, slower cold start, harder observability/tuning.

### Good patterns observed

- **Transactional integrity for money movement**
  - Transaction service uses Prisma `$transaction` for balance updates and audit logging:
    - [createDeposit](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/core-api/src/services/transactionService.ts#L10-L81)

## 5. Testing Coverage & Tooling Reliability

### Current state (verified by running scripts)

- **Type-check**
  - `npm run type-check --workspaces` succeeds (core-api, admin-interface, shared).

- **Tests**
  - `npm test` fails because `core-api` Jest references a missing setup file:
    - [jest.config.js](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/core-api/jest.config.js) references `<rootDir>/src/test/setup.ts` which does not exist.
  - Jest warns about `moduleNameMapping` (typo); Jest uses `moduleNameMapper`.

- **Lint**
  - `npm run lint` fails in `shared` due to a mix of:
    - unsafe `any` usage,
    - `no-case-declarations` in `switch` blocks,
    - unsafe returns/arguments.
  - This is a “tooling reliability” issue only if lint is expected to be green; otherwise it’s a real quality gate indicating refactor needed.

### Recommendations

- Fix core-api Jest config so test results are actionable.
- Decide whether `shared` is allowed to use `any` (utility library) and tune ESLint rules accordingly, or refactor shared to satisfy the stricter rule set.

## 6. Dependency Analysis

### Vulnerabilities (from `npm audit --workspaces`)

- **Critical**
  - `form-data` (4.0.0 - 4.0.3): unsafe random boundary generation
- **High**
  - `axios` (1.0.0 - 1.11.0): DoS via lack of data size check
  - `jws` (<3.2.3): improper HMAC signature verification
  - `qs` (<6.14.1): arrayLimit bypass DoS
- **Moderate**
  - `@fastify/jwt` depends on `fast-jwt` (<5.0.6): improper `iss` validation
  - `js-yaml` prototype pollution in merge

### Version drift (from `npm outdated --workspaces`)

- Notable jumps that likely require planned upgrades:
  - `prisma` 5.x → 7.x
  - `uuid` 9.x → 13.x
  - `redis` 4.x → 5.x
  - `jest` 29.x → 30.x
  - `zod` 3.x → 4.x

## 7. Code Samples (problematic and exemplary)

### Problematic: Prisma client instantiation spread across core-api

```ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

This pattern appears in multiple core-api modules (routes/services/middleware) despite a central DB manager.

### Problematic: Access-token middleware checking DB sessionId

```ts
const session = await prisma.userSession.findFirst({
  where: { sessionId: token, isActive: true, expiresAt: { gt: new Date() } },
});
```

See [core-api auth middleware](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/core-api/src/middleware/auth.ts#L24-L52).

### Exemplary: transactional money movement + audit log

```ts
const result = await prisma.$transaction(async (tx) => {
  const transaction = await tx.transaction.create({ data: { /* ... */ } });
  await tx.account.update({ where: { id: accountId }, data: { balance: { increment: amount } } });
  await tx.auditLog.create({ data: { userId, action: 'DEPOSIT_CREATED', entityId: transaction.id } });
  return transaction;
});
```

See [TransactionService.createDeposit](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Bank%20Project/Autum%20Vault_1/backend/core-api/src/services/transactionService.ts#L10-L81).

## 8. Long-Term Optimization Suggestions

- Consolidate Prisma access through the DB manager and pass `db.prisma` into services.
- Standardize auth and error envelopes across core-api and admin-interface.
- Introduce clear state machines for KYC and wire transfer lifecycle with explicit authorization policies.
- Add integration tests around critical workflows (wire approval, KYC transitions, balance-changing transactions).
