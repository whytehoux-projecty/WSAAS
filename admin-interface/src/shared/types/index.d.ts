export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T = any> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth: Date;
    status: UserStatus;
    kycStatus: KycStatus;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
}
export declare enum UserStatus {
    PENDING_VERIFICATION = "PENDING_VERIFICATION",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    CLOSED = "CLOSED"
}
export declare enum KycStatus {
    PENDING = "PENDING",
    IN_REVIEW = "IN_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}
export interface Account {
    id: string;
    userId: string;
    accountNumber: string;
    accountType: AccountType;
    balance: number;
    currency: string;
    status: AccountStatus;
    dailyLimit: number;
    monthlyLimit: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum AccountType {
    CHECKING = "CHECKING",
    SAVINGS = "SAVINGS",
    INVESTMENT = "INVESTMENT",
    CREDIT = "CREDIT"
}
export declare enum AccountStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    CLOSED = "CLOSED"
}
export interface Transaction {
    id: string;
    accountId: string;
    type: TransactionType;
    amount: number;
    currency: string;
    status: TransactionStatus;
    description: string;
    reference: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum TransactionType {
    DEPOSIT = "DEPOSIT",
    WITHDRAWAL = "WITHDRAWAL",
    TRANSFER = "TRANSFER",
    PAYMENT = "PAYMENT",
    FEE = "FEE",
    INTEREST = "INTEREST",
    REFUND = "REFUND"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export interface WireTransfer {
    id: string;
    fromAccountId: string;
    amount: number;
    currency: string;
    recipientName: string;
    recipientBank: string;
    recipientAccount: string;
    swiftCode: string;
    purpose: string;
    status: WireTransferStatus;
    fees: number;
    exchangeRate?: number;
    estimatedArrival: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum WireTransferStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export interface KycDocument {
    id: string;
    userId: string;
    documentType: DocumentType;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    status: DocumentStatus;
    uploadedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    rejectionReason?: string;
}
export declare enum DocumentType {
    PASSPORT = "PASSPORT",
    DRIVERS_LICENSE = "DRIVERS_LICENSE",
    NATIONAL_ID = "NATIONAL_ID",
    UTILITY_BILL = "UTILITY_BILL",
    BANK_STATEMENT = "BANK_STATEMENT",
    PROOF_OF_INCOME = "PROOF_OF_INCOME",
    PROOF_OF_ADDRESS = "PROOF_OF_ADDRESS"
}
export declare enum DocumentStatus {
    PENDING = "PENDING",
    IN_REVIEW = "IN_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export interface UserSession {
    id: string;
    userId: string;
    sessionToken: string;
    ipAddress: string;
    userAgent: string;
    expiresAt: Date;
    createdAt: Date;
}
export interface AuditLog {
    id: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress: string;
    userAgent: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}
export interface JwtPayload {
    userId: string;
    email: string;
    status: UserStatus;
    iat?: number;
    exp?: number;
}
export interface RefreshTokenPayload {
    userId: string;
    type: 'refresh';
    iat?: number;
    exp?: number;
}
export interface AuthenticatedRequest {
    user: JwtPayload;
}
export interface ApiError {
    code: string;
    message: string;
    details?: any;
    statusCode: number;
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
}
export interface FxRate {
    id: string;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    validFrom: Date;
    validTo: Date;
    createdAt: Date;
}
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
}
export declare enum NotificationType {
    TRANSACTION = "TRANSACTION",
    ACCOUNT = "ACCOUNT",
    SECURITY = "SECURITY",
    KYC = "KYC",
    SYSTEM = "SYSTEM"
}
export interface PlaidAccount {
    account_id: string;
    balances: {
        available: number;
        current: number;
        iso_currency_code: string;
    };
    mask: string;
    name: string;
    official_name: string;
    subtype: string;
    type: string;
}
export interface DwollaCustomer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    type: string;
    status: string;
    created: string;
}
export interface AdminUser {
    id: string;
    username: string;
    email: string;
    role: AdminRole;
    permissions: string[];
    lastLoginAt?: Date;
    createdAt: Date;
}
export declare enum AdminRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    MODERATOR = "MODERATOR",
    VIEWER = "VIEWER"
}
export interface HealthCheck {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    services: {
        database: 'connected' | 'disconnected';
        cache: 'connected' | 'disconnected';
        api: 'running' | 'stopped';
    };
    uptime?: number;
    version?: string;
}
//# sourceMappingURL=index.d.ts.map