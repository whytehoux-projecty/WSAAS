import { v4 as uuidv4 } from "uuid";
import { ACCOUNT_CONFIG } from "../constants";

/**
 * Generate a unique account number
 */
export const generateAccountNumber = (): string => {
  const prefix = ACCOUNT_CONFIG.ACCOUNT_NUMBER_PREFIX;
  const length = ACCOUNT_CONFIG.ACCOUNT_NUMBER_LENGTH - prefix.length;

  // Generate random digits
  let number = "";
  for (let i = 0; i < length; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }

  return prefix + number;
};

/**
 * Generate a unique transaction ID
 */
export const generateTransactionId = (): string => {
  return `TXN_${uuidv4().replace(/-/g, "").toUpperCase()}`;
};

/**
 * Generate a unique wire transfer reference
 */
export const generateWireTransferReference = (): string => {
  return `WIRE_${uuidv4().replace(/-/g, "").toUpperCase().substring(0, 16)}`;
};

/**
 * Generate a unique session ID
 */
export const generateSessionId = (): string => {
  return `SESS_${uuidv4().replace(/-/g, "").toUpperCase()}`;
};

/**
 * Generate a secure random string
 */
export const generateSecureRandomString = (length: number = 32): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

/**
 * Generate a numeric OTP
 */
export const generateOTP = (length: number = 6): string => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
};

/**
 * Generate a unique file name
 */
export const generateFileName = (
  originalName: string,
  prefix?: string,
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  const baseName = originalName.split(".").slice(0, -1).join(".");

  const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, "_");
  const prefixStr = prefix ? `${prefix}_` : "";

  return `${prefixStr}${cleanBaseName}_${timestamp}_${random}.${extension}`;
};

/**
 * Generate a shareable account ID
 */
export const generateShareableId = (): string => {
  return `SHARE_${generateSecureRandomString(16)}`;
};

/**
 * Generate API key
 */
export const generateApiKey = (): string => {
  return `ak_${generateSecureRandomString(32)}`;
};

/**
 * Generate webhook secret
 */
export const generateWebhookSecret = (): string => {
  return `whsec_${generateSecureRandomString(32)}`;
};

/**
 * Generate a unique batch ID
 */
export const generateBatchId = (): string => {
  return `BATCH_${Date.now()}_${generateSecureRandomString(8)}`;
};

/**
 * Generate a correlation ID for request tracking
 */
export const generateCorrelationId = (): string => {
  return `CORR_${uuidv4()}`;
};

/**
 * Generate a unique audit log ID
 */
export const generateAuditLogId = (): string => {
  return `AUDIT_${uuidv4().replace(/-/g, "").toUpperCase()}`;
};

/**
 * Generate a temporary token
 */
export const generateTempToken = (length: number = 64): string => {
  return generateSecureRandomString(length);
};

/**
 * Generate a unique document ID
 */
export const generateDocumentId = (): string => {
  return `DOC_${uuidv4().replace(/-/g, "").toUpperCase()}`;
};

/**
 * Generate a unique notification ID
 */
export const generateNotificationId = (): string => {
  return `NOTIF_${uuidv4().replace(/-/g, "").toUpperCase()}`;
};

/**
 * Generate a unique external reference ID
 */
export const generateExternalReferenceId = (service: string): string => {
  const servicePrefix = service.toUpperCase().substring(0, 4);
  return `${servicePrefix}_${uuidv4().replace(/-/g, "").toUpperCase()}`;
};

/**
 * Generate a masked account number for display
 */
export const maskAccountNumber = (accountNumber: string): string => {
  if (accountNumber.length <= 4) {
    return accountNumber;
  }

  const visibleDigits = 4;
  const maskedPortion = "*".repeat(accountNumber.length - visibleDigits);
  const visiblePortion = accountNumber.slice(-visibleDigits);

  return maskedPortion + visiblePortion;
};

/**
 * Generate a masked email for display
 */
export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email; // Return original if invalid format
  }

  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }

  const visibleStart = localPart.substring(0, 2);
  const visibleEnd = localPart.slice(-1);
  const maskedMiddle = "*".repeat(Math.max(1, localPart.length - 3));

  return `${visibleStart}${maskedMiddle}${visibleEnd}@${domain}`;
};

/**
 * Generate a masked phone number for display
 */
export const maskPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length === 10) {
    // US format: (XXX) XXX-1234
    return `(${digits.substring(0, 3)}) XXX-${digits.substring(6)}`;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    // US format with country code: +1 (XXX) XXX-1234
    return `+1 (${digits.substring(1, 4)}) XXX-${digits.substring(7)}`;
  } else {
    // Generic format: show last 4 digits
    const visibleDigits = Math.min(4, digits.length);
    const maskedPortion = "X".repeat(
      Math.max(0, digits.length - visibleDigits),
    );
    const visiblePortion = digits.slice(-visibleDigits);
    return maskedPortion + visiblePortion;
  }
};

/**
 * Generate a masked SSN for display
 */
export const maskSSN = (ssn: string): string => {
  const digits = ssn.replace(/\D/g, "");

  if (digits.length === 9) {
    return `XXX-XX-${digits.substring(5)}`;
  }

  return "XXX-XX-XXXX";
};

/**
 * Generate a unique reference number for customer service
 */
export const generateCustomerServiceReference = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CS${timestamp}${random}`;
};

/**
 * Generate a unique dispute ID
 */
export const generateDisputeId = (): string => {
  return `DISP_${Date.now()}_${generateSecureRandomString(8)}`;
};

/**
 * Generate a unique merchant ID
 */
export const generateMerchantId = (): string => {
  return `MERCH_${generateSecureRandomString(16)}`;
};

/**
 * Generate a unique device fingerprint
 */
export const generateDeviceFingerprint = (): string => {
  return `DEV_${generateSecureRandomString(32)}`;
};

/**
 * Validate and format account number
 */
export const validateAccountNumber = (accountNumber: string): boolean => {
  const regex = new RegExp(
    `^${ACCOUNT_CONFIG.ACCOUNT_NUMBER_PREFIX}\\d{${ACCOUNT_CONFIG.ACCOUNT_NUMBER_LENGTH - ACCOUNT_CONFIG.ACCOUNT_NUMBER_PREFIX.length}}$`,
  );
  return regex.test(accountNumber);
};

/**
 * Generate a unique backup code
 */
export const generateBackupCode = (): string => {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(Math.random().toString(36).substring(2, 6).toUpperCase());
  }
  return segments.join("-");
};

/**
 * Generate multiple backup codes
 */
export const generateBackupCodes = (count: number = 10): string[] => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateBackupCode());
  }
  return codes;
};
