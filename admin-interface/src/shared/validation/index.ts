import { z } from "zod";
import {
  REGEX_PATTERNS,
  TRANSACTION_LIMITS,
  SECURITY_CONFIG,
} from "../constants";

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email("Invalid email format").regex(REGEX_PATTERNS.EMAIL),
  password: z
    .string()
    .min(
      SECURITY_CONFIG.PASSWORD_MIN_LENGTH,
      `Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters`,
    )
    .regex(
      REGEX_PATTERNS.PASSWORD,
      "Password must contain uppercase, lowercase, number, and special character",
    ),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long"),
  phone: z.string().regex(REGEX_PATTERNS.PHONE, "Invalid phone number format"),
  dateOfBirth: z.string().datetime("Invalid date format"),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z
      .string()
      .min(2, "State is required")
      .max(2, "State must be 2 characters"),
    zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
    country: z
      .string()
      .min(2, "Country code is required")
      .max(2, "Country code must be 2 characters"),
  }),
  ssn: z.string().optional(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ password: true });

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(
        SECURITY_CONFIG.PASSWORD_MIN_LENGTH,
        `Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters`,
      )
      .regex(
        REGEX_PATTERNS.PASSWORD,
        "Password must contain uppercase, lowercase, number, and special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Account validation schemas
export const createAccountSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  type: z.enum(["CHECKING", "SAVINGS", "INVESTMENT", "CREDIT"], {
    errorMap: () => ({ message: "Invalid account type" }),
  }),
  name: z
    .string()
    .min(1, "Account name is required")
    .max(100, "Account name too long"),
  currency: z.string().length(3, "Currency must be 3 characters"),
});

export const updateAccountSchema = z.object({
  name: z
    .string()
    .min(1, "Account name is required")
    .max(100, "Account name too long")
    .optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "CLOSED"]).optional(),
});

// Transaction validation schemas
export const createTransactionSchema = z.object({
  accountId: z.string().uuid("Invalid account ID"),
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT", "FEE"], {
    errorMap: () => ({ message: "Invalid transaction type" }),
  }),
  amount: z
    .number()
    .positive("Amount must be positive")
    .min(
      TRANSACTION_LIMITS.MIN_AMOUNT,
      `Minimum amount is $${TRANSACTION_LIMITS.MIN_AMOUNT}`,
    )
    .max(
      TRANSACTION_LIMITS.MAX_AMOUNT,
      `Maximum amount is $${TRANSACTION_LIMITS.MAX_AMOUNT}`,
    ),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description too long"),
  category: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const transferSchema = z
  .object({
    fromAccountId: z.string().uuid("Invalid source account ID"),
    toAccountId: z.string().uuid("Invalid destination account ID"),
    amount: z
      .number()
      .positive("Amount must be positive")
      .min(
        TRANSACTION_LIMITS.MIN_AMOUNT,
        `Minimum amount is $${TRANSACTION_LIMITS.MIN_AMOUNT}`,
      )
      .max(
        TRANSACTION_LIMITS.MAX_AMOUNT,
        `Maximum amount is $${TRANSACTION_LIMITS.MAX_AMOUNT}`,
      ),
    description: z
      .string()
      .min(1, "Description is required")
      .max(255, "Description too long"),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Source and destination accounts cannot be the same",
    path: ["toAccountId"],
  });

// Wire Transfer validation schemas
export const createWireTransferSchema = z.object({
  fromAccountId: z.string().uuid("Invalid account ID"),
  recipientName: z
    .string()
    .min(1, "Recipient name is required")
    .max(100, "Recipient name too long"),
  recipientAccount: z.string().min(1, "Recipient account is required"),
  recipientBank: z.string().min(1, "Recipient bank is required"),
  swiftCode: z
    .string()
    .regex(REGEX_PATTERNS.SWIFT_CODE, "Invalid SWIFT code")
    .optional(),
  iban: z.string().regex(REGEX_PATTERNS.IBAN, "Invalid IBAN").optional(),
  amount: z
    .number()
    .positive("Amount must be positive")
    .min(100, "Minimum wire transfer amount is $100")
    .max(500000, "Maximum wire transfer amount is $500,000"),
  currency: z.string().length(3, "Currency must be 3 characters"),
  purpose: z
    .string()
    .min(1, "Purpose is required")
    .max(255, "Purpose too long"),
  isInternational: z.boolean(),
});

// KYC Document validation schemas
export const uploadKycDocumentSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  type: z.enum(
    [
      "PASSPORT",
      "DRIVERS_LICENSE",
      "NATIONAL_ID",
      "UTILITY_BILL",
      "BANK_STATEMENT",
    ],
    {
      errorMap: () => ({ message: "Invalid document type" }),
    },
  ),
  documentNumber: z.string().optional(),
  expiryDate: z.string().datetime("Invalid expiry date").optional(),
});

export const createKYCDocumentSchema = z.object({
  type: z.enum(
    [
      "PASSPORT",
      "DRIVERS_LICENSE",
      "NATIONAL_ID",
      "UTILITY_BILL",
      "BANK_STATEMENT",
    ],
    {
      errorMap: () => ({ message: "Invalid document type" }),
    },
  ),
  fileName: z.string().min(1, "File name is required"),
  filePath: z.string().min(1, "File path is required"),
  fileSize: z
    .number()
    .positive("File size must be positive")
    .max(5 * 1024 * 1024, "File size cannot exceed 5MB"),
  mimeType: z.string().min(1, "MIME type is required"),
  expiryDate: z.string().datetime("Invalid expiry date").optional(),
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Query schemas
export const transactionQuerySchema = paginationSchema.extend({
  accountId: z.string().uuid("Invalid account ID").optional(),
  userId: z.string().uuid("Invalid user ID").optional(),
  type: z
    .enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT", "FEE"])
    .optional(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
  startDate: z.string().datetime("Invalid start date").optional(),
  endDate: z.string().datetime("Invalid end date").optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
  category: z.string().optional(),
});

export const accountQuerySchema = paginationSchema.extend({
  userId: z.string().uuid("Invalid user ID").optional(),
  type: z.enum(["CHECKING", "SAVINGS", "INVESTMENT", "CREDIT"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "CLOSED"]).optional(),
});

export const wireTransferQuerySchema = paginationSchema.extend({
  userId: z.string().uuid("Invalid user ID").optional(),
  status: z
    .enum(["PENDING", "IN_PROGRESS", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED", "APPROVED", "REJECTED"])
    .optional(),
  type: z.enum(["DOMESTIC", "INTERNATIONAL"]).optional(),
  startDate: z.string().datetime("Invalid start date").optional(),
  endDate: z.string().datetime("Invalid end date").optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
});

export const userQuerySchema = paginationSchema.extend({
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION", "PENDING"]).optional(),
  kycStatus: z
    .enum(["PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED"])
    .optional(),
  search: z.string().optional(),
});

// File upload schemas
export const fileUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number().max(5 * 1024 * 1024, "File size cannot exceed 5MB"),
  buffer: z.instanceof(Buffer),
});

// Admin schemas
export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const adminCreateUserSchema = createUserSchema.extend({
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  status: z
    .enum(["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"])
    .default("PENDING_VERIFICATION"),
});

// Statistics schemas
export const statisticsQuerySchema = z.object({
  startDate: z.string().datetime("Invalid start date").optional(),
  endDate: z.string().datetime("Invalid end date").optional(),
  groupBy: z.enum(["day", "week", "month", "year"]).default("day"),
});

// Webhook schemas
export const webhookSchema = z.object({
  event: z.string(),
  data: z.record(z.any()),
  timestamp: z.string().datetime(),
  signature: z.string(),
});

// Export all schemas for easy importing
export const validationSchemas = {
  // User schemas
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  login: loginSchema,
  changePassword: changePasswordSchema,

  // Account schemas
  createAccount: createAccountSchema,
  updateAccount: updateAccountSchema,

  // Transaction schemas
  createTransaction: createTransactionSchema,
  transfer: transferSchema,

  // Wire Transfer schemas
  createWireTransfer: createWireTransferSchema,

  // KYC schemas
  uploadKycDocument: uploadKycDocumentSchema,
  createKYCDocument: createKYCDocumentSchema,

  // Query schemas
  pagination: paginationSchema,
  transactionQuery: transactionQuerySchema,
  wireTransferQuery: wireTransferQuerySchema,
  accountQuery: accountQuerySchema,
  userQuery: userQuerySchema,

  // File upload schemas
  fileUpload: fileUploadSchema,

  // Admin schemas
  adminLogin: adminLoginSchema,
  adminCreateUser: adminCreateUserSchema,

  // Statistics schemas
  statisticsQuery: statisticsQuerySchema,

  // Webhook schemas
  webhook: webhookSchema,
};

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type CreateWireTransferInput = z.infer<typeof createWireTransferSchema>;
export type UploadKycDocumentInput = z.infer<typeof uploadKycDocumentSchema>;
export type CreateKYCDocumentInput = z.infer<typeof createKYCDocumentSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
export type AccountQueryInput = z.infer<typeof accountQuerySchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
export type StatisticsQueryInput = z.infer<typeof statisticsQuerySchema>;
export type WebhookInput = z.infer<typeof webhookSchema>;
