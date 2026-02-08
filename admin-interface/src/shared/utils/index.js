"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryStringToObject = exports.objectToQueryString = exports.safeJsonStringify = exports.safeJsonParse = exports.isNumeric = exports.simpleHash = exports.getClientIP = exports.parseUserAgent = exports.isDocumentFile = exports.isImageFile = exports.getFileExtension = exports.formatFileSize = exports.generateRandomColor = exports.sanitizeString = exports.isValidPhone = exports.isValidEmail = exports.slugify = exports.truncate = exports.snakeToCamel = exports.camelToSnake = exports.toTitleCase = exports.capitalize = exports.pick = exports.omit = exports.isEmpty = exports.deepClone = exports.throttle = exports.debounce = exports.retry = exports.sleep = void 0;
__exportStar(require("./date"), exports);
__exportStar(require("./generators"), exports);
__exportStar(require("./financial"), exports);
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
const retry = async (fn, maxAttempts = 3, baseDelay = 1000) => {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxAttempts) {
                throw lastError;
            }
            const delay = baseDelay * Math.pow(2, attempt - 1);
            await (0, exports.sleep)(delay);
        }
    }
    throw lastError;
};
exports.retry = retry;
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
exports.debounce = debounce;
const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};
exports.throttle = throttle;
const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        return obj.map(item => (0, exports.deepClone)(item));
    }
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = (0, exports.deepClone)(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
};
exports.deepClone = deepClone;
const isEmpty = (obj) => {
    if (obj == null)
        return true;
    if (Array.isArray(obj) || typeof obj === 'string')
        return obj.length === 0;
    if (obj instanceof Map || obj instanceof Set)
        return obj.size === 0;
    return Object.keys(obj).length === 0;
};
exports.isEmpty = isEmpty;
const omit = (obj, keys) => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
};
exports.omit = omit;
const pick = (obj, keys) => {
    const result = {};
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
};
exports.pick = pick;
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
exports.capitalize = capitalize;
const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};
exports.toTitleCase = toTitleCase;
const camelToSnake = (str) => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};
exports.camelToSnake = camelToSnake;
const snakeToCamel = (str) => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};
exports.snakeToCamel = snakeToCamel;
const truncate = (str, length, suffix = '...') => {
    if (str.length <= length)
        return str;
    return str.substring(0, length - suffix.length) + suffix;
};
exports.truncate = truncate;
const slugify = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.slugify = slugify;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone);
};
exports.isValidPhone = isValidPhone;
const sanitizeString = (str) => {
    return str
        .replace(/[<>]/g, '')
        .replace(/['"]/g, '')
        .trim();
};
exports.sanitizeString = sanitizeString;
const generateRandomColor = () => {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex] || '#FF6B6B';
};
exports.generateRandomColor = generateRandomColor;
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
exports.formatFileSize = formatFileSize;
const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};
exports.getFileExtension = getFileExtension;
const isImageFile = (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = (0, exports.getFileExtension)(filename).toLowerCase();
    return imageExtensions.includes(extension);
};
exports.isImageFile = isImageFile;
const isDocumentFile = (filename) => {
    const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
    const extension = (0, exports.getFileExtension)(filename).toLowerCase();
    return docExtensions.includes(extension);
};
exports.isDocumentFile = isDocumentFile;
const parseUserAgent = (userAgent) => {
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
        userAgent.includes('Firefox') ? 'Firefox' :
            userAgent.includes('Safari') ? 'Safari' :
                userAgent.includes('Edge') ? 'Edge' : 'Unknown';
    const os = userAgent.includes('Windows') ? 'Windows' :
        userAgent.includes('Mac') ? 'macOS' :
            userAgent.includes('Linux') ? 'Linux' :
                userAgent.includes('Android') ? 'Android' :
                    userAgent.includes('iOS') ? 'iOS' : 'Unknown';
    const device = userAgent.includes('Mobile') ? 'Mobile' :
        userAgent.includes('Tablet') ? 'Tablet' : 'Desktop';
    return { browser, os, device };
};
exports.parseUserAgent = parseUserAgent;
const getClientIP = (headers) => {
    const forwarded = headers['x-forwarded-for'];
    const realIP = headers['x-real-ip'];
    const remoteAddr = headers['remote-addr'];
    if (forwarded) {
        const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
        if (ips && typeof ips === 'string') {
            const ipList = ips.split(',');
            if (ipList.length > 0 && ipList[0]) {
                return ipList[0].trim();
            }
        }
    }
    if (realIP) {
        return Array.isArray(realIP) ? realIP[0] || 'unknown' : realIP;
    }
    if (remoteAddr) {
        return Array.isArray(remoteAddr) ? remoteAddr[0] || 'unknown' : remoteAddr;
    }
    return 'unknown';
};
exports.getClientIP = getClientIP;
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};
exports.simpleHash = simpleHash;
const isNumeric = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};
exports.isNumeric = isNumeric;
const safeJsonParse = (str, defaultValue) => {
    try {
        return JSON.parse(str);
    }
    catch {
        return defaultValue;
    }
};
exports.safeJsonParse = safeJsonParse;
const safeJsonStringify = (obj, defaultValue = '{}') => {
    try {
        return JSON.stringify(obj);
    }
    catch {
        return defaultValue;
    }
};
exports.safeJsonStringify = safeJsonStringify;
const objectToQueryString = (obj) => {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            params.append(key, String(value));
        }
    });
    return params.toString();
};
exports.objectToQueryString = objectToQueryString;
const queryStringToObject = (queryString) => {
    const params = new URLSearchParams(queryString);
    const obj = {};
    params.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
};
exports.queryStringToObject = queryStringToObject;
//# sourceMappingURL=index.js.map