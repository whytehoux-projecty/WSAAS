# NovaBank Shared Library

A comprehensive shared utilities library for the NovaBank banking platform, providing common types, constants, validation schemas, and utility functions used across all backend services.

## 📦 Overview

The `@novabank/shared` package contains:

- **TypeScript Types** - Complete type definitions for all banking entities
- **Constants** - Application-wide configuration and business rules
- **Validation Schemas** - Zod-based validation for API requests
- **Utility Functions** - Common helper functions for dates, finances, and more
- **Error Codes** - Standardized error handling across services

## 🚀 Installation

```bash
npm install @novabank/shared
```

## 📖 Usage

### Importing Types

```typescript
import { 
  User, 
  Account, 
  Transaction, 
  WireTransfer,
  ApiResponse,
  PaginatedResponse 
} from '@novabank/shared';

// Use types in your service
const user: User = {
  id: '123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  // ... other properties
};
```

### Using Constants

```typescript
import { 
  TRANSACTION_LIMITS,
  ACCOUNT_CONFIG,
  ERROR_CODES,
  REGEX_PATTERNS 
} from '@novabank/shared';

// Check transaction limits
if (amount > TRANSACTION_LIMITS.MAX_AMOUNT) {
  throw new Error(ERROR_CODES.VALUE_OUT_OF_RANGE);
}

// Validate account number format
const isValidAccount = REGEX_PATTERNS.ACCOUNT_NUMBER.test(accountNumber);
```

### Validation Schemas

```typescript
import { 
  createUserSchema,
  createTransactionSchema,
  transferSchema 
} from '@novabank/shared';

// Validate user creation data
const userData = createUserSchema.parse(requestBody);

// Validate transaction data
const transactionData = createTransactionSchema.parse({
  accountId: '123',
  type: 'DEPOSIT',
  amount: 100.00,
  description: 'Salary deposit'
});
```

### Utility Functions

```typescript
import { 
  formatCurrency,
  calculateInterest,
  generateAccountNumber,
  isBusinessDay,
  addBusinessDays 
} from '@novabank/shared';

// Format currency
const formatted = formatCurrency(1234.56, 'USD'); // "$1,234.56"

// Generate account number
const accountNumber = generateAccountNumber(); // "NB1234567890123456"

// Calculate interest
const interest = calculateInterest(1000, 0.025, 365); // Annual interest

// Business day calculations
const isToday = isBusinessDay(new Date());
const nextBusinessDay = addBusinessDays(new Date(), 1);
```

## 📋 API Reference

### Core Types

#### User Types

- `User` - Complete user profile information
- `UserStatus` - User account status enumeration
- `KycStatus` - KYC verification status enumeration

#### Account Types

- `Account` - Bank account information
- `AccountType` - Account type enumeration (CHECKING, SAVINGS, etc.)
- `AccountStatus` - Account status enumeration

#### Transaction Types

- `Transaction` - Transaction record structure
- `TransactionType` - Transaction type enumeration
- `TransactionStatus` - Transaction status enumeration

#### Wire Transfer Types

- `WireTransfer` - Wire transfer information
- `WireTransferStatus` - Wire transfer status enumeration

#### KYC Types

- `KycDocument` - KYC document structure
- `DocumentType` - Document type enumeration
- `DocumentStatus` - Document verification status

### Constants

#### Configuration Constants

- `API_CONFIG` - API server configuration
- `DATABASE_CONFIG` - Database connection settings
- `AUTH_CONFIG` - Authentication and JWT settings
- `RATE_LIMIT_CONFIG` - Rate limiting configuration
- `UPLOAD_CONFIG` - File upload settings

#### Business Rules

- `TRANSACTION_LIMITS` - Transaction amount limits
- `ACCOUNT_CONFIG` - Account configuration and limits
- `WIRE_TRANSFER_CONFIG` - Wire transfer settings
- `KYC_CONFIG` - KYC document requirements
- `BUSINESS_RULES` - General business logic rules

#### Error Handling

- `ERROR_CODES` - Standardized error codes
- `HTTP_STATUS` - HTTP status code constants

#### Validation Patterns

- `REGEX_PATTERNS` - Regular expressions for validation
- `SUPPORTED_CURRENCIES` - List of supported currencies
- `SUPPORTED_COUNTRIES` - List of supported countries

### Validation Schemas

#### User Validation

- `createUserSchema` - User registration validation
- `updateUserSchema` - User profile update validation
- `loginSchema` - User login validation
- `changePasswordSchema` - Password change validation

#### Account Validation

- `createAccountSchema` - Account creation validation
- `updateAccountSchema` - Account update validation

#### Transaction Validation

- `createTransactionSchema` - Transaction creation validation
- `transferSchema` - Money transfer validation

#### Wire Transfer Validation

- `createWireTransferSchema` - Wire transfer validation

#### Query Validation

- `paginationSchema` - Pagination parameters
- `transactionQuerySchema` - Transaction filtering
- `accountQuerySchema` - Account filtering
- `userQuerySchema` - User filtering

### Utility Functions

#### Financial Utilities

```typescript
// Currency formatting
formatCurrency(amount: number, currency: string): string

// Interest calculations
calculateInterest(principal: number, rate: number, days: number): number

// Fee calculations
calculateWireTransferFee(amount: number, isInternational: boolean): number

// Exchange rate calculations
convertCurrency(amount: number, fromCurrency: string, toCurrency: string, rate: number): number
```

#### Date Utilities

```typescript
// Business day calculations
isBusinessDay(date: Date): boolean
addBusinessDays(date: Date, days: number): Date
getNextBusinessDay(date: Date): Date

// Date formatting
formatDate(date: Date, format?: string): string
parseDate(dateString: string): Date

// Timezone handling
convertToTimezone(date: Date, timezone: string): Date
```

#### ID Generation

```typescript
// Generate unique identifiers
generateAccountNumber(): string
generateTransactionId(): string
generateReferenceNumber(): string
generateSessionToken(): string
```

#### String Utilities

```typescript
// Text manipulation
capitalize(str: string): string
toTitleCase(str: string): string
slugify(str: string): string
truncate(str: string, length: number): string

// Case conversion
camelToSnake(str: string): string
snakeToCamel(str: string): string
```

#### Object Utilities

```typescript
// Object manipulation
deepClone<T>(obj: T): T
isEmpty(obj: any): boolean
omit<T, K>(obj: T, keys: K[]): Omit<T, K>
pick<T, K>(obj: T, keys: K[]): Pick<T, K>
```

#### Async Utilities

```typescript
// Async helpers
sleep(ms: number): Promise<void>
retry<T>(fn: () => Promise<T>, maxAttempts?: number): Promise<T>
debounce<T>(func: T, wait: number): T
throttle<T>(func: T, limit: number): T
```

## 🔧 Development

### Building the Library

```bash
# Build TypeScript to JavaScript
npm run build

# Watch for changes during development
npm run dev

# Clean build artifacts
npm run clean
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Quality

```bash
# Lint TypeScript files
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📁 Project Structure

```
shared/
├── constants/          # Application constants
│   └── index.ts       # All constants and configuration
├── types/             # TypeScript type definitions
│   ├── index.ts       # Main types export
│   └── index.d.ts     # Type declarations
├── utils/             # Utility functions
│   ├── date.ts        # Date manipulation utilities
│   ├── financial.ts   # Financial calculation utilities
│   ├── generators.ts  # ID and token generators
│   └── index.ts       # Utility exports
├── validation/        # Zod validation schemas
│   └── index.ts       # All validation schemas
├── validators/        # Custom validators (legacy)
├── index.ts          # Main library export
├── package.json      # Package configuration
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

## 🔄 Version History

### v1.0.0

- Initial release with core types and utilities
- Complete validation schema coverage
- Financial calculation utilities
- Business rule constants
- Error code standardization

## 🤝 Contributing

### Adding New Types

1. Add type definitions to `types/index.ts`
2. Export from main `index.ts`
3. Add corresponding validation schemas if needed
4. Update this README with new types

### Adding New Constants

1. Add constants to `constants/index.ts`
2. Group related constants together
3. Use `as const` for type safety
4. Document the purpose and usage

### Adding New Utilities

1. Create utility functions in appropriate files under `utils/`
2. Export from `utils/index.ts`
3. Add comprehensive JSDoc comments
4. Include unit tests for new functions

### Code Standards

- Use TypeScript for all code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Include unit tests for new functionality
- Ensure backward compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions and support:

- Check the main NovaBank backend documentation
- Create an issue for bugs or feature requests
- Contact the development team for urgent issues

---

**@novabank/shared** - Powering consistent, type-safe development across the NovaBank platform.
