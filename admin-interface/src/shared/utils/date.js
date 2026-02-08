"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDaysUntilExpiry = exports.isExpired = exports.getRelativeTime = exports.localToUtc = exports.utcToLocal = exports.isWithinBusinessHours = exports.getNextBusinessDay = exports.isBusinessDay = exports.addBusinessDays = exports.getBusinessDays = exports.isLegalAge = exports.calculateAge = exports.getDateRange = exports.isValidDate = exports.subtractDaysFromDate = exports.addDaysToDate = exports.getEndOfDay = exports.getStartOfDay = exports.formatDateTime = exports.formatDisplayDate = exports.formatDate = void 0;
const date_fns_1 = require("date-fns");
const formatDate = (date, formatStr = 'yyyy-MM-dd') => {
    const dateObj = typeof date === 'string' ? (0, date_fns_1.parseISO)(date) : date;
    if (!(0, date_fns_1.isValid)(dateObj)) {
        throw new Error('Invalid date provided');
    }
    return (0, date_fns_1.format)(dateObj, formatStr);
};
exports.formatDate = formatDate;
const formatDisplayDate = (date) => {
    return (0, exports.formatDate)(date, 'MMM dd, yyyy');
};
exports.formatDisplayDate = formatDisplayDate;
const formatDateTime = (date) => {
    return (0, exports.formatDate)(date, 'MMM dd, yyyy HH:mm');
};
exports.formatDateTime = formatDateTime;
const getStartOfDay = (date) => {
    const dateObj = typeof date === 'string' ? (0, date_fns_1.parseISO)(date) : date;
    return (0, date_fns_1.startOfDay)(dateObj);
};
exports.getStartOfDay = getStartOfDay;
const getEndOfDay = (date) => {
    const dateObj = typeof date === 'string' ? (0, date_fns_1.parseISO)(date) : date;
    return (0, date_fns_1.endOfDay)(dateObj);
};
exports.getEndOfDay = getEndOfDay;
const addDaysToDate = (date, days) => {
    const dateObj = typeof date === 'string' ? (0, date_fns_1.parseISO)(date) : date;
    return (0, date_fns_1.addDays)(dateObj, days);
};
exports.addDaysToDate = addDaysToDate;
const subtractDaysFromDate = (date, days) => {
    const dateObj = typeof date === 'string' ? (0, date_fns_1.parseISO)(date) : date;
    return (0, date_fns_1.subDays)(dateObj, days);
};
exports.subtractDaysFromDate = subtractDaysFromDate;
const isValidDate = (date) => {
    if (typeof date === 'string') {
        return (0, date_fns_1.isValid)((0, date_fns_1.parseISO)(date));
    }
    return (0, date_fns_1.isValid)(date);
};
exports.isValidDate = isValidDate;
const getDateRange = (period) => {
    const now = new Date();
    switch (period) {
        case 'today':
            return {
                start: (0, exports.getStartOfDay)(now),
                end: (0, exports.getEndOfDay)(now),
            };
        case 'yesterday':
            const yesterday = (0, exports.subtractDaysFromDate)(now, 1);
            return {
                start: (0, exports.getStartOfDay)(yesterday),
                end: (0, exports.getEndOfDay)(yesterday),
            };
        case 'last7days':
            return {
                start: (0, exports.getStartOfDay)((0, exports.subtractDaysFromDate)(now, 7)),
                end: (0, exports.getEndOfDay)(now),
            };
        case 'last30days':
            return {
                start: (0, exports.getStartOfDay)((0, exports.subtractDaysFromDate)(now, 30)),
                end: (0, exports.getEndOfDay)(now),
            };
        case 'thisMonth':
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return {
                start: (0, exports.getStartOfDay)(startOfMonth),
                end: (0, exports.getEndOfDay)(now),
            };
        case 'lastMonth':
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
            return {
                start: (0, exports.getStartOfDay)(lastMonthStart),
                end: (0, exports.getEndOfDay)(lastMonthEnd),
            };
        default:
            throw new Error(`Unsupported period: ${period}`);
    }
};
exports.getDateRange = getDateRange;
const calculateAge = (dateOfBirth) => {
    const birthDate = typeof dateOfBirth === 'string' ? (0, date_fns_1.parseISO)(dateOfBirth) : dateOfBirth;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};
exports.calculateAge = calculateAge;
const isLegalAge = (dateOfBirth, minAge = 18) => {
    return (0, exports.calculateAge)(dateOfBirth) >= minAge;
};
exports.isLegalAge = isLegalAge;
const getBusinessDays = (startDate, endDate) => {
    const start = typeof startDate === 'string' ? (0, date_fns_1.parseISO)(startDate) : startDate;
    const end = typeof endDate === 'string' ? (0, date_fns_1.parseISO)(endDate) : endDate;
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    return count;
};
exports.getBusinessDays = getBusinessDays;
const addBusinessDays = (date, days) => {
    const startDate = typeof date === 'string' ? (0, date_fns_1.parseISO)(date) : new Date(date);
    let currentDate = new Date(startDate);
    let addedDays = 0;
    while (addedDays < days) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            addedDays++;
        }
    }
    return currentDate;
};
exports.addBusinessDays = addBusinessDays;
const isBusinessDay = (date) => {
    const dateObj = typeof date === 'string' ? (0, date_fns_1.parseISO)(date) : date;
    const dayOfWeek = dateObj.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
};
exports.isBusinessDay = isBusinessDay;
const getNextBusinessDay = (date) => {
    return (0, exports.addBusinessDays)(date, 1);
};
exports.getNextBusinessDay = getNextBusinessDay;
const isWithinBusinessHours = (date = new Date(), startHour = 9, endHour = 17) => {
    const dateObj = typeof date === 'string' ? (0, date_fns_1.parseISO)(date) : date;
    const hour = dateObj.getHours();
    return (0, exports.isBusinessDay)(dateObj) && hour >= startHour && hour < endHour;
};
exports.isWithinBusinessHours = isWithinBusinessHours;
const utcToLocal = (utcDate, timezone = 'America/New_York') => {
    const date = typeof utcDate === 'string' ? (0, date_fns_1.parseISO)(utcDate) : utcDate;
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
};
exports.utcToLocal = utcToLocal;
const localToUtc = (localDate) => {
    const date = typeof localDate === 'string' ? (0, date_fns_1.parseISO)(localDate) : localDate;
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
};
exports.localToUtc = localToUtc;
const getRelativeTime = (date) => {
    const dateObj = typeof date === 'string' ? (0, date_fns_1.parseISO)(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    if (diffInSeconds < 60) {
        return 'just now';
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    }
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
};
exports.getRelativeTime = getRelativeTime;
const isExpired = (expiryDate) => {
    const expiry = typeof expiryDate === 'string' ? (0, date_fns_1.parseISO)(expiryDate) : expiryDate;
    return expiry < new Date();
};
exports.isExpired = isExpired;
const getDaysUntilExpiry = (expiryDate) => {
    const expiry = typeof expiryDate === 'string' ? (0, date_fns_1.parseISO)(expiryDate) : expiryDate;
    const now = new Date();
    const diffInTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffInTime / (1000 * 3600 * 24));
};
exports.getDaysUntilExpiry = getDaysUntilExpiry;
//# sourceMappingURL=date.js.map