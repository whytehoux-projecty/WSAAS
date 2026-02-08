"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchemas = exports.webhookSchema = exports.statisticsQuerySchema = exports.adminCreateUserSchema = exports.adminLoginSchema = exports.fileUploadSchema = exports.userQuerySchema = exports.accountQuerySchema = exports.transactionQuerySchema = exports.paginationSchema = exports.uploadKycDocumentSchema = exports.createWireTransferSchema = exports.transferSchema = exports.createTransactionSchema = exports.updateAccountSchema = exports.createAccountSchema = exports.changePasswordSchema = exports.loginSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../constants");
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format').regex(constants_1.REGEX_PATTERNS.EMAIL),
    password: zod_1.z.string()
        .min(constants_1.SECURITY_CONFIG.PASSWORD_MIN_LENGTH, `Password must be at least ${constants_1.SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters`)
        .regex(constants_1.REGEX_PATTERNS.PASSWORD, 'Password must contain uppercase, lowercase, number, and special character'),
    firstName: zod_1.z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    phone: zod_1.z.string().regex(constants_1.REGEX_PATTERNS.PHONE, 'Invalid phone number format'),
    dateOfBirth: zod_1.z.string().datetime('Invalid date format'),
    address: zod_1.z.object({
        street: zod_1.z.string().min(1, 'Street address is required'),
        city: zod_1.z.string().min(1, 'City is required'),
        state: zod_1.z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
        zipCode: zod_1.z.string().min(5, 'ZIP code must be at least 5 characters'),
        country: zod_1.z.string().min(2, 'Country code is required').max(2, 'Country code must be 2 characters'),
    }),
    ssn: zod_1.z.string().optional(),
});
exports.updateUserSchema = exports.createUserSchema.partial().omit({ password: true });
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string()
        .min(constants_1.SECURITY_CONFIG.PASSWORD_MIN_LENGTH, `Password must be at least ${constants_1.SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters`)
        .regex(constants_1.REGEX_PATTERNS.PASSWORD, 'Password must contain uppercase, lowercase, number, and special character'),
    confirmPassword: zod_1.z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
exports.createAccountSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID'),
    type: zod_1.z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT', 'CREDIT'], {
        errorMap: () => ({ message: 'Invalid account type' }),
    }),
    name: zod_1.z.string().min(1, 'Account name is required').max(100, 'Account name too long'),
    currency: zod_1.z.string().length(3, 'Currency must be 3 characters'),
});
exports.updateAccountSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Account name is required').max(100, 'Account name too long').optional(),
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED', 'CLOSED']).optional(),
});
exports.createTransactionSchema = zod_1.z.object({
    accountId: zod_1.z.string().uuid('Invalid account ID'),
    type: zod_1.z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'FEE'], {
        errorMap: () => ({ message: 'Invalid transaction type' }),
    }),
    amount: zod_1.z.number()
        .positive('Amount must be positive')
        .min(constants_1.TRANSACTION_LIMITS.MIN_AMOUNT, `Minimum amount is $${constants_1.TRANSACTION_LIMITS.MIN_AMOUNT}`)
        .max(constants_1.TRANSACTION_LIMITS.MAX_AMOUNT, `Maximum amount is $${constants_1.TRANSACTION_LIMITS.MAX_AMOUNT}`),
    description: zod_1.z.string().min(1, 'Description is required').max(255, 'Description too long'),
    category: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.transferSchema = zod_1.z.object({
    fromAccountId: zod_1.z.string().uuid('Invalid source account ID'),
    toAccountId: zod_1.z.string().uuid('Invalid destination account ID'),
    amount: zod_1.z.number()
        .positive('Amount must be positive')
        .min(constants_1.TRANSACTION_LIMITS.MIN_AMOUNT, `Minimum amount is $${constants_1.TRANSACTION_LIMITS.MIN_AMOUNT}`)
        .max(constants_1.TRANSACTION_LIMITS.MAX_AMOUNT, `Maximum amount is $${constants_1.TRANSACTION_LIMITS.MAX_AMOUNT}`),
    description: zod_1.z.string().min(1, 'Description is required').max(255, 'Description too long'),
}).refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Source and destination accounts cannot be the same",
    path: ["toAccountId"],
});
exports.createWireTransferSchema = zod_1.z.object({
    fromAccountId: zod_1.z.string().uuid('Invalid account ID'),
    recipientName: zod_1.z.string().min(1, 'Recipient name is required').max(100, 'Recipient name too long'),
    recipientAccount: zod_1.z.string().min(1, 'Recipient account is required'),
    recipientBank: zod_1.z.string().min(1, 'Recipient bank is required'),
    swiftCode: zod_1.z.string().regex(constants_1.REGEX_PATTERNS.SWIFT_CODE, 'Invalid SWIFT code').optional(),
    iban: zod_1.z.string().regex(constants_1.REGEX_PATTERNS.IBAN, 'Invalid IBAN').optional(),
    amount: zod_1.z.number()
        .positive('Amount must be positive')
        .min(100, 'Minimum wire transfer amount is $100')
        .max(500000, 'Maximum wire transfer amount is $500,000'),
    currency: zod_1.z.string().length(3, 'Currency must be 3 characters'),
    purpose: zod_1.z.string().min(1, 'Purpose is required').max(255, 'Purpose too long'),
    isInternational: zod_1.z.boolean(),
});
exports.uploadKycDocumentSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID'),
    type: zod_1.z.enum(['PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID', 'UTILITY_BILL', 'BANK_STATEMENT'], {
        errorMap: () => ({ message: 'Invalid document type' }),
    }),
    documentNumber: zod_1.z.string().optional(),
    expiryDate: zod_1.z.string().datetime('Invalid expiry date').optional(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: zod_1.z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.transactionQuerySchema = exports.paginationSchema.extend({
    accountId: zod_1.z.string().uuid('Invalid account ID').optional(),
    type: zod_1.z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'FEE']).optional(),
    status: zod_1.z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
    startDate: zod_1.z.string().datetime('Invalid start date').optional(),
    endDate: zod_1.z.string().datetime('Invalid end date').optional(),
    minAmount: zod_1.z.coerce.number().positive().optional(),
    maxAmount: zod_1.z.coerce.number().positive().optional(),
    category: zod_1.z.string().optional(),
});
exports.accountQuerySchema = exports.paginationSchema.extend({
    userId: zod_1.z.string().uuid('Invalid user ID').optional(),
    type: zod_1.z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT', 'CREDIT']).optional(),
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED', 'CLOSED']).optional(),
});
exports.userQuerySchema = exports.paginationSchema.extend({
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
    kycStatus: zod_1.z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']).optional(),
    search: zod_1.z.string().optional(),
});
exports.fileUploadSchema = zod_1.z.object({
    fieldname: zod_1.z.string(),
    originalname: zod_1.z.string(),
    encoding: zod_1.z.string(),
    mimetype: zod_1.z.string(),
    size: zod_1.z.number().max(5 * 1024 * 1024, 'File size cannot exceed 5MB'),
    buffer: zod_1.z.instanceof(Buffer),
});
exports.adminLoginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.adminCreateUserSchema = exports.createUserSchema.extend({
    role: zod_1.z.enum(['USER', 'ADMIN']).default('USER'),
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).default('PENDING_VERIFICATION'),
});
exports.statisticsQuerySchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime('Invalid start date').optional(),
    endDate: zod_1.z.string().datetime('Invalid end date').optional(),
    groupBy: zod_1.z.enum(['day', 'week', 'month', 'year']).default('day'),
});
exports.webhookSchema = zod_1.z.object({
    event: zod_1.z.string(),
    data: zod_1.z.record(zod_1.z.any()),
    timestamp: zod_1.z.string().datetime(),
    signature: zod_1.z.string(),
});
exports.validationSchemas = {
    createUser: exports.createUserSchema,
    updateUser: exports.updateUserSchema,
    login: exports.loginSchema,
    changePassword: exports.changePasswordSchema,
    createAccount: exports.createAccountSchema,
    updateAccount: exports.updateAccountSchema,
    createTransaction: exports.createTransactionSchema,
    transfer: exports.transferSchema,
    createWireTransfer: exports.createWireTransferSchema,
    uploadKycDocument: exports.uploadKycDocumentSchema,
    pagination: exports.paginationSchema,
    transactionQuery: exports.transactionQuerySchema,
    accountQuery: exports.accountQuerySchema,
    userQuery: exports.userQuerySchema,
    fileUpload: exports.fileUploadSchema,
    adminLogin: exports.adminLoginSchema,
    adminCreateUser: exports.adminCreateUserSchema,
    statisticsQuery: exports.statisticsQuerySchema,
    webhook: exports.webhookSchema,
};
//# sourceMappingURL=index.js.map