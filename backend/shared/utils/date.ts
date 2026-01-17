import {
  format,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  isValid,
  parseISO,
} from "date-fns";

/**
 * Format a date to a standard string format
 */
export const formatDate = (
  date: Date | string,
  formatStr: string = "yyyy-MM-dd",
): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(dateObj)) {
    throw new Error("Invalid date provided");
  }
  return format(dateObj, formatStr);
};

/**
 * Format a date for display purposes
 */
export const formatDisplayDate = (date: Date | string): string => {
  return formatDate(date, "MMM dd, yyyy");
};

/**
 * Format a date with time for display
 */
export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, "MMM dd, yyyy HH:mm");
};

/**
 * Get the start of day for a given date
 */
export const getStartOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return startOfDay(dateObj);
};

/**
 * Get the end of day for a given date
 */
export const getEndOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return endOfDay(dateObj);
};

/**
 * Add days to a date
 */
export const addDaysToDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return addDays(dateObj, days);
};

/**
 * Subtract days from a date
 */
export const subtractDaysFromDate = (
  date: Date | string,
  days: number,
): Date => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return subDays(dateObj, days);
};

/**
 * Check if a date is valid
 */
export const isValidDate = (date: any): boolean => {
  if (typeof date === "string") {
    return isValid(parseISO(date));
  }
  return isValid(date);
};

/**
 * Get date range for common periods
 */
export const getDateRange = (
  period:
    | "today"
    | "yesterday"
    | "last7days"
    | "last30days"
    | "thisMonth"
    | "lastMonth",
): { start: Date; end: Date } => {
  const now = new Date();

  switch (period) {
    case "today":
      return {
        start: getStartOfDay(now),
        end: getEndOfDay(now),
      };

    case "yesterday":
      const yesterday = subtractDaysFromDate(now, 1);
      return {
        start: getStartOfDay(yesterday),
        end: getEndOfDay(yesterday),
      };

    case "last7days":
      return {
        start: getStartOfDay(subtractDaysFromDate(now, 7)),
        end: getEndOfDay(now),
      };

    case "last30days":
      return {
        start: getStartOfDay(subtractDaysFromDate(now, 30)),
        end: getEndOfDay(now),
      };

    case "thisMonth":
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: getStartOfDay(startOfMonth),
        end: getEndOfDay(now),
      };

    case "lastMonth":
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        start: getStartOfDay(lastMonthStart),
        end: getEndOfDay(lastMonthEnd),
      };

    default:
      throw new Error(`Unsupported period: ${period}`);
  }
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth: Date | string): number => {
  const birthDate =
    typeof dateOfBirth === "string" ? parseISO(dateOfBirth) : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Check if user is of legal age
 */
export const isLegalAge = (
  dateOfBirth: Date | string,
  minAge: number = 18,
): boolean => {
  return calculateAge(dateOfBirth) >= minAge;
};

/**
 * Get business days between two dates (excluding weekends)
 */
export const getBusinessDays = (
  startDate: Date | string,
  endDate: Date | string,
): number => {
  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Not Sunday (0) or Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

/**
 * Add business days to a date (excluding weekends)
 */
export const addBusinessDays = (date: Date | string, days: number): Date => {
  const startDate = typeof date === "string" ? parseISO(date) : new Date(date);
  const currentDate = new Date(startDate);
  let addedDays = 0;

  while (addedDays < days) {
    currentDate.setDate(currentDate.getDate() + 1);
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Not Sunday or Saturday
      addedDays++;
    }
  }

  return currentDate;
};

/**
 * Check if a date is a business day
 */
export const isBusinessDay = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6; // Not Sunday or Saturday
};

/**
 * Get the next business day
 */
export const getNextBusinessDay = (date: Date | string): Date => {
  return addBusinessDays(date, 1);
};

/**
 * Check if current time is within business hours
 */
export const isWithinBusinessHours = (
  date: Date | string = new Date(),
  startHour: number = 9,
  endHour: number = 17,
): boolean => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const hour = dateObj.getHours();
  return isBusinessDay(dateObj) && hour >= startHour && hour < endHour;
};

/**
 * Convert UTC date to local timezone
 */
export const utcToLocal = (
  utcDate: Date | string,
  timezone: string = "America/New_York",
): Date => {
  const date = typeof utcDate === "string" ? parseISO(utcDate) : utcDate;
  return new Date(date.toLocaleString("en-US", { timeZone: timezone }));
};

/**
 * Convert local date to UTC
 */
export const localToUtc = (localDate: Date | string): Date => {
  const date = typeof localDate === "string" ? parseISO(localDate) : localDate;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
};

/**
 * Check if a date is expired
 */
export const isExpired = (expiryDate: Date | string): boolean => {
  const expiry =
    typeof expiryDate === "string" ? parseISO(expiryDate) : expiryDate;
  return expiry < new Date();
};

/**
 * Get days until expiry
 */
export const getDaysUntilExpiry = (expiryDate: Date | string): number => {
  const expiry =
    typeof expiryDate === "string" ? parseISO(expiryDate) : expiryDate;
  const now = new Date();
  const diffInTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffInTime / (1000 * 3600 * 24));
};
