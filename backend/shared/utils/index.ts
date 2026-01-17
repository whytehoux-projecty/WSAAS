// Re-export all utilities for easy importing
export * from "./date";
export * from "./generators";
export * from "./financial";

// Additional utility functions

/**
 * Sleep/delay function for async operations
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }

  throw lastError!;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  if (typeof obj === "object") {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: any): boolean => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0;
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
  return Object.keys(obj).length === 0;
};

/**
 * Omit properties from object
 */
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

/**
 * Pick properties from object
 */
export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

/**
 * Capitalize first letter of string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 */
export const toTitleCase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
};

/**
 * Convert camelCase to snake_case
 */
export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Convert snake_case to camelCase
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Truncate string with ellipsis
 */
export const truncate = (
  str: string,
  length: number,
  suffix: string = "...",
): string => {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

/**
 * Generate slug from string
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

/**
 * Sanitize string for SQL/XSS prevention
 */
export const sanitizeString = (str: string): string => {
  return str.replace(/[<>]/g, "").replace(/['"]/g, "").trim();
};

/**
 * Generate random color
 */
export const generateRandomColor = (): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex] || "#FF6B6B"; // Fallback color
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

/**
 * Check if file is image
 */
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

/**
 * Check if file is document
 */
export const isDocumentFile = (filename: string): boolean => {
  const docExtensions = ["pdf", "doc", "docx", "txt", "rtf", "odt"];
  const extension = getFileExtension(filename).toLowerCase();
  return docExtensions.includes(extension);
};

/**
 * Parse user agent string
 */
export const parseUserAgent = (
  userAgent: string,
): {
  browser: string;
  os: string;
  device: string;
} => {
  const browser = userAgent.includes("Chrome")
    ? "Chrome"
    : userAgent.includes("Firefox")
      ? "Firefox"
      : userAgent.includes("Safari")
        ? "Safari"
        : userAgent.includes("Edge")
          ? "Edge"
          : "Unknown";

  const os = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Mac")
      ? "macOS"
      : userAgent.includes("Linux")
        ? "Linux"
        : userAgent.includes("Android")
          ? "Android"
          : userAgent.includes("iOS")
            ? "iOS"
            : "Unknown";

  const device = userAgent.includes("Mobile")
    ? "Mobile"
    : userAgent.includes("Tablet")
      ? "Tablet"
      : "Desktop";

  return { browser, os, device };
};

/**
 * Get client IP from request headers
 */
export const getClientIP = (
  headers: Record<string, string | string[] | undefined>,
): string => {
  const forwarded = headers["x-forwarded-for"];
  const realIP = headers["x-real-ip"];
  const remoteAddr = headers["remote-addr"];

  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    if (ips && typeof ips === "string") {
      const ipList = ips.split(",");
      if (ipList.length > 0 && ipList[0]) {
        return ipList[0].trim();
      }
    }
  }

  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] || "unknown" : realIP;
  }

  if (remoteAddr) {
    return Array.isArray(remoteAddr) ? remoteAddr[0] || "unknown" : remoteAddr;
  }

  return "unknown";
};

/**
 * Hash string using simple hash function
 */
export const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Check if value is numeric
 */
export const isNumeric = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = <T>(str: string, defaultValue: T): T => {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

/**
 * Safe JSON stringify
 */
export const safeJsonStringify = (
  obj: any,
  defaultValue: string = "{}",
): string => {
  try {
    return JSON.stringify(obj);
  } catch {
    return defaultValue;
  }
};

/**
 * Convert object to query string
 */
export const objectToQueryString = (obj: Record<string, any>): string => {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.append(key, String(value));
    }
  });

  return params.toString();
};

/**
 * Convert query string to object
 */
export const queryStringToObject = (
  queryString: string,
): Record<string, string> => {
  const params = new URLSearchParams(queryString);
  const obj: Record<string, string> = {};

  params.forEach((value, key) => {
    obj[key] = value;
  });

  return obj;
};
