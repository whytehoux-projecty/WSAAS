"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBackupCodes = exports.generateBackupCode = exports.validateAccountNumber = exports.generateDeviceFingerprint = exports.generateMerchantId = exports.generateDisputeId = exports.generateCustomerServiceReference = exports.maskSSN = exports.maskPhoneNumber = exports.maskEmail = exports.maskAccountNumber = exports.generateExternalReferenceId = exports.generateNotificationId = exports.generateDocumentId = exports.generateTempToken = exports.generateAuditLogId = exports.generateCorrelationId = exports.generateBatchId = exports.generateWebhookSecret = exports.generateApiKey = exports.generateShareableId = exports.generateFileName = exports.generateOTP = exports.generateSecureRandomString = exports.generateSessionId = exports.generateWireTransferReference = exports.generateTransactionId = exports.generateAccountNumber = void 0;
const uuid_1 = require("uuid");
const constants_1 = require("../constants");
const generateAccountNumber = () => {
    const prefix = constants_1.ACCOUNT_CONFIG.ACCOUNT_NUMBER_PREFIX;
    const length = constants_1.ACCOUNT_CONFIG.ACCOUNT_NUMBER_LENGTH - prefix.length;
    let number = '';
    for (let i = 0; i < length; i++) {
        number += Math.floor(Math.random() * 10).toString();
    }
    return prefix + number;
};
exports.generateAccountNumber = generateAccountNumber;
const generateTransactionId = () => {
    return `TXN_${(0, uuid_1.v4)().replace(/-/g, '').toUpperCase()}`;
};
exports.generateTransactionId = generateTransactionId;
const generateWireTransferReference = () => {
    return `WIRE_${(0, uuid_1.v4)().replace(/-/g, '').toUpperCase().substring(0, 16)}`;
};
exports.generateWireTransferReference = generateWireTransferReference;
const generateSessionId = () => {
    return `SESS_${(0, uuid_1.v4)().replace(/-/g, '').toUpperCase()}`;
};
exports.generateSessionId = generateSessionId;
const generateSecureRandomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generateSecureRandomString = generateSecureRandomString;
const generateOTP = (length = 6) => {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
};
exports.generateOTP = generateOTP;
const generateFileName = (originalName, prefix) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    const prefixStr = prefix ? `${prefix}_` : '';
    return `${prefixStr}${cleanBaseName}_${timestamp}_${random}.${extension}`;
};
exports.generateFileName = generateFileName;
const generateShareableId = () => {
    return `SHARE_${(0, exports.generateSecureRandomString)(16)}`;
};
exports.generateShareableId = generateShareableId;
const generateApiKey = () => {
    return `ak_${(0, exports.generateSecureRandomString)(32)}`;
};
exports.generateApiKey = generateApiKey;
const generateWebhookSecret = () => {
    return `whsec_${(0, exports.generateSecureRandomString)(32)}`;
};
exports.generateWebhookSecret = generateWebhookSecret;
const generateBatchId = () => {
    return `BATCH_${Date.now()}_${(0, exports.generateSecureRandomString)(8)}`;
};
exports.generateBatchId = generateBatchId;
const generateCorrelationId = () => {
    return `CORR_${(0, uuid_1.v4)()}`;
};
exports.generateCorrelationId = generateCorrelationId;
const generateAuditLogId = () => {
    return `AUDIT_${(0, uuid_1.v4)().replace(/-/g, '').toUpperCase()}`;
};
exports.generateAuditLogId = generateAuditLogId;
const generateTempToken = (length = 64) => {
    return (0, exports.generateSecureRandomString)(length);
};
exports.generateTempToken = generateTempToken;
const generateDocumentId = () => {
    return `DOC_${(0, uuid_1.v4)().replace(/-/g, '').toUpperCase()}`;
};
exports.generateDocumentId = generateDocumentId;
const generateNotificationId = () => {
    return `NOTIF_${(0, uuid_1.v4)().replace(/-/g, '').toUpperCase()}`;
};
exports.generateNotificationId = generateNotificationId;
const generateExternalReferenceId = (service) => {
    const servicePrefix = service.toUpperCase().substring(0, 4);
    return `${servicePrefix}_${(0, uuid_1.v4)().replace(/-/g, '').toUpperCase()}`;
};
exports.generateExternalReferenceId = generateExternalReferenceId;
const maskAccountNumber = (accountNumber) => {
    if (accountNumber.length <= 4) {
        return accountNumber;
    }
    const visibleDigits = 4;
    const maskedPortion = '*'.repeat(accountNumber.length - visibleDigits);
    const visiblePortion = accountNumber.slice(-visibleDigits);
    return maskedPortion + visiblePortion;
};
exports.maskAccountNumber = maskAccountNumber;
const maskEmail = (email) => {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) {
        return email;
    }
    if (localPart.length <= 2) {
        return `${localPart[0]}*@${domain}`;
    }
    const visibleStart = localPart.substring(0, 2);
    const visibleEnd = localPart.slice(-1);
    const maskedMiddle = '*'.repeat(Math.max(1, localPart.length - 3));
    return `${visibleStart}${maskedMiddle}${visibleEnd}@${domain}`;
};
exports.maskEmail = maskEmail;
const maskPhoneNumber = (phoneNumber) => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length === 10) {
        return `(${digits.substring(0, 3)}) XXX-${digits.substring(6)}`;
    }
    else if (digits.length === 11 && digits.startsWith('1')) {
        return `+1 (${digits.substring(1, 4)}) XXX-${digits.substring(7)}`;
    }
    else {
        const visibleDigits = Math.min(4, digits.length);
        const maskedPortion = 'X'.repeat(Math.max(0, digits.length - visibleDigits));
        const visiblePortion = digits.slice(-visibleDigits);
        return maskedPortion + visiblePortion;
    }
};
exports.maskPhoneNumber = maskPhoneNumber;
const maskSSN = (ssn) => {
    const digits = ssn.replace(/\D/g, '');
    if (digits.length === 9) {
        return `XXX-XX-${digits.substring(5)}`;
    }
    return 'XXX-XX-XXXX';
};
exports.maskSSN = maskSSN;
const generateCustomerServiceReference = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CS${timestamp}${random}`;
};
exports.generateCustomerServiceReference = generateCustomerServiceReference;
const generateDisputeId = () => {
    return `DISP_${Date.now()}_${(0, exports.generateSecureRandomString)(8)}`;
};
exports.generateDisputeId = generateDisputeId;
const generateMerchantId = () => {
    return `MERCH_${(0, exports.generateSecureRandomString)(16)}`;
};
exports.generateMerchantId = generateMerchantId;
const generateDeviceFingerprint = () => {
    return `DEV_${(0, exports.generateSecureRandomString)(32)}`;
};
exports.generateDeviceFingerprint = generateDeviceFingerprint;
const validateAccountNumber = (accountNumber) => {
    const regex = new RegExp(`^${constants_1.ACCOUNT_CONFIG.ACCOUNT_NUMBER_PREFIX}\\d{${constants_1.ACCOUNT_CONFIG.ACCOUNT_NUMBER_LENGTH - constants_1.ACCOUNT_CONFIG.ACCOUNT_NUMBER_PREFIX.length}}$`);
    return regex.test(accountNumber);
};
exports.validateAccountNumber = validateAccountNumber;
const generateBackupCode = () => {
    const segments = [];
    for (let i = 0; i < 4; i++) {
        segments.push(Math.random().toString(36).substring(2, 6).toUpperCase());
    }
    return segments.join('-');
};
exports.generateBackupCode = generateBackupCode;
const generateBackupCodes = (count = 10) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        codes.push((0, exports.generateBackupCode)());
    }
    return codes;
};
exports.generateBackupCodes = generateBackupCodes;
//# sourceMappingURL=generators.js.map