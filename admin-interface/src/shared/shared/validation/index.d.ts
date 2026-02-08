import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodString;
    dateOfBirth: z.ZodString;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }>;
    ssn: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    ssn?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    ssn?: string | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<Omit<{
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }>>;
    ssn: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "password">, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    } | undefined;
    ssn?: string | undefined;
}, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    } | undefined;
    ssn?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const changePasswordSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>;
export declare const createAccountSchema: z.ZodObject<{
    userId: z.ZodString;
    type: z.ZodEnum<["CHECKING", "SAVINGS", "INVESTMENT", "CREDIT"]>;
    name: z.ZodString;
    currency: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT";
    userId: string;
    name: string;
    currency: string;
}, {
    type: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT";
    userId: string;
    name: string;
    currency: string;
}>;
export declare const updateAccountSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "SUSPENDED", "CLOSED"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "SUSPENDED" | "CLOSED" | undefined;
    name?: string | undefined;
}, {
    status?: "ACTIVE" | "SUSPENDED" | "CLOSED" | undefined;
    name?: string | undefined;
}>;
export declare const createTransactionSchema: z.ZodObject<{
    accountId: z.ZodString;
    type: z.ZodEnum<["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT", "FEE"]>;
    amount: z.ZodNumber;
    description: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "FEE";
    accountId: string;
    amount: number;
    description: string;
    category?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "FEE";
    accountId: string;
    amount: number;
    description: string;
    category?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const transferSchema: z.ZodEffects<z.ZodObject<{
    fromAccountId: z.ZodString;
    toAccountId: z.ZodString;
    amount: z.ZodNumber;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    amount: number;
    description: string;
    fromAccountId: string;
    toAccountId: string;
}, {
    amount: number;
    description: string;
    fromAccountId: string;
    toAccountId: string;
}>, {
    amount: number;
    description: string;
    fromAccountId: string;
    toAccountId: string;
}, {
    amount: number;
    description: string;
    fromAccountId: string;
    toAccountId: string;
}>;
export declare const createWireTransferSchema: z.ZodObject<{
    fromAccountId: z.ZodString;
    recipientName: z.ZodString;
    recipientAccount: z.ZodString;
    recipientBank: z.ZodString;
    swiftCode: z.ZodOptional<z.ZodString>;
    iban: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
    currency: z.ZodString;
    purpose: z.ZodString;
    isInternational: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    currency: string;
    amount: number;
    fromAccountId: string;
    recipientName: string;
    recipientAccount: string;
    recipientBank: string;
    purpose: string;
    isInternational: boolean;
    swiftCode?: string | undefined;
    iban?: string | undefined;
}, {
    currency: string;
    amount: number;
    fromAccountId: string;
    recipientName: string;
    recipientAccount: string;
    recipientBank: string;
    purpose: string;
    isInternational: boolean;
    swiftCode?: string | undefined;
    iban?: string | undefined;
}>;
export declare const uploadKycDocumentSchema: z.ZodObject<{
    userId: z.ZodString;
    type: z.ZodEnum<["PASSPORT", "DRIVERS_LICENSE", "NATIONAL_ID", "UTILITY_BILL", "BANK_STATEMENT"]>;
    documentNumber: z.ZodOptional<z.ZodString>;
    expiryDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "PASSPORT" | "DRIVERS_LICENSE" | "NATIONAL_ID" | "UTILITY_BILL" | "BANK_STATEMENT";
    userId: string;
    documentNumber?: string | undefined;
    expiryDate?: string | undefined;
}, {
    type: "PASSPORT" | "DRIVERS_LICENSE" | "NATIONAL_ID" | "UTILITY_BILL" | "BANK_STATEMENT";
    userId: string;
    documentNumber?: string | undefined;
    expiryDate?: string | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    sortBy?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const transactionQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    accountId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT", "FEE"]>>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "COMPLETED", "FAILED", "CANCELLED"]>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    minAmount: z.ZodOptional<z.ZodNumber>;
    maxAmount: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    type?: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "FEE" | undefined;
    status?: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | undefined;
    accountId?: string | undefined;
    category?: string | undefined;
    sortBy?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}, {
    type?: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "FEE" | undefined;
    status?: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | undefined;
    accountId?: string | undefined;
    category?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}>;
export declare const accountQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    userId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["CHECKING", "SAVINGS", "INVESTMENT", "CREDIT"]>>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "SUSPENDED", "CLOSED"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    type?: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT" | undefined;
    status?: "ACTIVE" | "SUSPENDED" | "CLOSED" | undefined;
    userId?: string | undefined;
    sortBy?: string | undefined;
}, {
    type?: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT" | undefined;
    status?: "ACTIVE" | "SUSPENDED" | "CLOSED" | undefined;
    userId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const userQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]>>;
    kycStatus: z.ZodOptional<z.ZodEnum<["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    status?: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | undefined;
    sortBy?: string | undefined;
    kycStatus?: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW" | undefined;
    search?: string | undefined;
}, {
    status?: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    kycStatus?: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW" | undefined;
    search?: string | undefined;
}>;
export declare const fileUploadSchema: z.ZodObject<{
    fieldname: z.ZodString;
    originalname: z.ZodString;
    encoding: z.ZodString;
    mimetype: z.ZodString;
    size: z.ZodNumber;
    buffer: z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>;
}, "strip", z.ZodTypeAny, {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer<ArrayBufferLike>;
}, {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer<ArrayBufferLike>;
}>;
export declare const adminLoginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    username: string;
}, {
    password: string;
    username: string;
}>;
export declare const adminCreateUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodString;
    dateOfBirth: z.ZodString;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }>;
    ssn: z.ZodOptional<z.ZodString>;
} & {
    role: z.ZodDefault<z.ZodEnum<["USER", "ADMIN"]>>;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED";
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    role: "ADMIN" | "USER";
    ssn?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    status?: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | undefined;
    ssn?: string | undefined;
    role?: "ADMIN" | "USER" | undefined;
}>;
export declare const statisticsQuerySchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    groupBy: z.ZodDefault<z.ZodEnum<["day", "week", "month", "year"]>>;
}, "strip", z.ZodTypeAny, {
    groupBy: "day" | "week" | "month" | "year";
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    groupBy?: "day" | "week" | "month" | "year" | undefined;
}>;
export declare const webhookSchema: z.ZodObject<{
    event: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
    timestamp: z.ZodString;
    signature: z.ZodString;
}, "strip", z.ZodTypeAny, {
    event: string;
    data: Record<string, any>;
    timestamp: string;
    signature: string;
}, {
    event: string;
    data: Record<string, any>;
    timestamp: string;
    signature: string;
}>;
export declare const validationSchemas: {
    createUser: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        phone: z.ZodString;
        dateOfBirth: z.ZodString;
        address: z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            state: z.ZodString;
            zipCode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        }, {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        }>;
        ssn: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        dateOfBirth: string;
        address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
        ssn?: string | undefined;
    }, {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        dateOfBirth: string;
        address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
        ssn?: string | undefined;
    }>;
    updateUser: z.ZodObject<Omit<{
        email: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        dateOfBirth: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            state: z.ZodString;
            zipCode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        }, {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        }>>;
        ssn: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, "password">, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        phone?: string | undefined;
        dateOfBirth?: string | undefined;
        address?: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        } | undefined;
        ssn?: string | undefined;
    }, {
        email?: string | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        phone?: string | undefined;
        dateOfBirth?: string | undefined;
        address?: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        } | undefined;
        ssn?: string | undefined;
    }>;
    login: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
    }, {
        email: string;
        password: string;
    }>;
    changePassword: z.ZodEffects<z.ZodObject<{
        currentPassword: z.ZodString;
        newPassword: z.ZodString;
        confirmPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }, {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }>, {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }, {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }>;
    createAccount: z.ZodObject<{
        userId: z.ZodString;
        type: z.ZodEnum<["CHECKING", "SAVINGS", "INVESTMENT", "CREDIT"]>;
        name: z.ZodString;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT";
        userId: string;
        name: string;
        currency: string;
    }, {
        type: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT";
        userId: string;
        name: string;
        currency: string;
    }>;
    updateAccount: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["ACTIVE", "SUSPENDED", "CLOSED"]>>;
    }, "strip", z.ZodTypeAny, {
        status?: "ACTIVE" | "SUSPENDED" | "CLOSED" | undefined;
        name?: string | undefined;
    }, {
        status?: "ACTIVE" | "SUSPENDED" | "CLOSED" | undefined;
        name?: string | undefined;
    }>;
    createTransaction: z.ZodObject<{
        accountId: z.ZodString;
        type: z.ZodEnum<["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT", "FEE"]>;
        amount: z.ZodNumber;
        description: z.ZodString;
        category: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "FEE";
        accountId: string;
        amount: number;
        description: string;
        category?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }, {
        type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "FEE";
        accountId: string;
        amount: number;
        description: string;
        category?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }>;
    transfer: z.ZodEffects<z.ZodObject<{
        fromAccountId: z.ZodString;
        toAccountId: z.ZodString;
        amount: z.ZodNumber;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        description: string;
        fromAccountId: string;
        toAccountId: string;
    }, {
        amount: number;
        description: string;
        fromAccountId: string;
        toAccountId: string;
    }>, {
        amount: number;
        description: string;
        fromAccountId: string;
        toAccountId: string;
    }, {
        amount: number;
        description: string;
        fromAccountId: string;
        toAccountId: string;
    }>;
    createWireTransfer: z.ZodObject<{
        fromAccountId: z.ZodString;
        recipientName: z.ZodString;
        recipientAccount: z.ZodString;
        recipientBank: z.ZodString;
        swiftCode: z.ZodOptional<z.ZodString>;
        iban: z.ZodOptional<z.ZodString>;
        amount: z.ZodNumber;
        currency: z.ZodString;
        purpose: z.ZodString;
        isInternational: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: number;
        fromAccountId: string;
        recipientName: string;
        recipientAccount: string;
        recipientBank: string;
        purpose: string;
        isInternational: boolean;
        swiftCode?: string | undefined;
        iban?: string | undefined;
    }, {
        currency: string;
        amount: number;
        fromAccountId: string;
        recipientName: string;
        recipientAccount: string;
        recipientBank: string;
        purpose: string;
        isInternational: boolean;
        swiftCode?: string | undefined;
        iban?: string | undefined;
    }>;
    uploadKycDocument: z.ZodObject<{
        userId: z.ZodString;
        type: z.ZodEnum<["PASSPORT", "DRIVERS_LICENSE", "NATIONAL_ID", "UTILITY_BILL", "BANK_STATEMENT"]>;
        documentNumber: z.ZodOptional<z.ZodString>;
        expiryDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "PASSPORT" | "DRIVERS_LICENSE" | "NATIONAL_ID" | "UTILITY_BILL" | "BANK_STATEMENT";
        userId: string;
        documentNumber?: string | undefined;
        expiryDate?: string | undefined;
    }, {
        type: "PASSPORT" | "DRIVERS_LICENSE" | "NATIONAL_ID" | "UTILITY_BILL" | "BANK_STATEMENT";
        userId: string;
        documentNumber?: string | undefined;
        expiryDate?: string | undefined;
    }>;
    pagination: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        sortBy: z.ZodOptional<z.ZodString>;
        sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        sortOrder: "asc" | "desc";
        sortBy?: string | undefined;
    }, {
        page?: number | undefined;
        limit?: number | undefined;
        sortBy?: string | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    }>;
    transactionQuery: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        sortBy: z.ZodOptional<z.ZodString>;
        sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    } & {
        accountId: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT", "FEE"]>>;
        status: z.ZodOptional<z.ZodEnum<["PENDING", "COMPLETED", "FAILED", "CANCELLED"]>>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        minAmount: z.ZodOptional<z.ZodNumber>;
        maxAmount: z.ZodOptional<z.ZodNumber>;
        category: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        sortOrder: "asc" | "desc";
        type?: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "FEE" | undefined;
        status?: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | undefined;
        accountId?: string | undefined;
        category?: string | undefined;
        sortBy?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        minAmount?: number | undefined;
        maxAmount?: number | undefined;
    }, {
        type?: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "FEE" | undefined;
        status?: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | undefined;
        accountId?: string | undefined;
        category?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        sortBy?: string | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        minAmount?: number | undefined;
        maxAmount?: number | undefined;
    }>;
    accountQuery: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        sortBy: z.ZodOptional<z.ZodString>;
        sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    } & {
        userId: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<["CHECKING", "SAVINGS", "INVESTMENT", "CREDIT"]>>;
        status: z.ZodOptional<z.ZodEnum<["ACTIVE", "SUSPENDED", "CLOSED"]>>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        sortOrder: "asc" | "desc";
        type?: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT" | undefined;
        status?: "ACTIVE" | "SUSPENDED" | "CLOSED" | undefined;
        userId?: string | undefined;
        sortBy?: string | undefined;
    }, {
        type?: "CHECKING" | "SAVINGS" | "INVESTMENT" | "CREDIT" | undefined;
        status?: "ACTIVE" | "SUSPENDED" | "CLOSED" | undefined;
        userId?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        sortBy?: string | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    }>;
    userQuery: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        sortBy: z.ZodOptional<z.ZodString>;
        sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    } & {
        status: z.ZodOptional<z.ZodEnum<["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]>>;
        kycStatus: z.ZodOptional<z.ZodEnum<["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]>>;
        search: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        sortOrder: "asc" | "desc";
        status?: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | undefined;
        sortBy?: string | undefined;
        kycStatus?: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW" | undefined;
        search?: string | undefined;
    }, {
        status?: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        sortBy?: string | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        kycStatus?: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW" | undefined;
        search?: string | undefined;
    }>;
    fileUpload: z.ZodObject<{
        fieldname: z.ZodString;
        originalname: z.ZodString;
        encoding: z.ZodString;
        mimetype: z.ZodString;
        size: z.ZodNumber;
        buffer: z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>;
    }, "strip", z.ZodTypeAny, {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer<ArrayBufferLike>;
    }, {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer<ArrayBufferLike>;
    }>;
    adminLogin: z.ZodObject<{
        username: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password: string;
        username: string;
    }, {
        password: string;
        username: string;
    }>;
    adminCreateUser: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        phone: z.ZodString;
        dateOfBirth: z.ZodString;
        address: z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            state: z.ZodString;
            zipCode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        }, {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        }>;
        ssn: z.ZodOptional<z.ZodString>;
    } & {
        role: z.ZodDefault<z.ZodEnum<["USER", "ADMIN"]>>;
        status: z.ZodDefault<z.ZodEnum<["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]>>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        dateOfBirth: string;
        status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED";
        address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
        role: "ADMIN" | "USER";
        ssn?: string | undefined;
    }, {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        dateOfBirth: string;
        address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
        status?: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | undefined;
        ssn?: string | undefined;
        role?: "ADMIN" | "USER" | undefined;
    }>;
    statisticsQuery: z.ZodObject<{
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        groupBy: z.ZodDefault<z.ZodEnum<["day", "week", "month", "year"]>>;
    }, "strip", z.ZodTypeAny, {
        groupBy: "day" | "week" | "month" | "year";
        startDate?: string | undefined;
        endDate?: string | undefined;
    }, {
        startDate?: string | undefined;
        endDate?: string | undefined;
        groupBy?: "day" | "week" | "month" | "year" | undefined;
    }>;
    webhook: z.ZodObject<{
        event: z.ZodString;
        data: z.ZodRecord<z.ZodString, z.ZodAny>;
        timestamp: z.ZodString;
        signature: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        event: string;
        data: Record<string, any>;
        timestamp: string;
        signature: string;
    }, {
        event: string;
        data: Record<string, any>;
        timestamp: string;
        signature: string;
    }>;
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
export type PaginationInput = z.infer<typeof paginationSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
export type AccountQueryInput = z.infer<typeof accountQuerySchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
export type StatisticsQueryInput = z.infer<typeof statisticsQuerySchema>;
export type WebhookInput = z.infer<typeof webhookSchema>;
//# sourceMappingURL=index.d.ts.map