export declare const formatDate: (date: Date | string, formatStr?: string) => string;
export declare const formatDisplayDate: (date: Date | string) => string;
export declare const formatDateTime: (date: Date | string) => string;
export declare const getStartOfDay: (date: Date | string) => Date;
export declare const getEndOfDay: (date: Date | string) => Date;
export declare const addDaysToDate: (date: Date | string, days: number) => Date;
export declare const subtractDaysFromDate: (date: Date | string, days: number) => Date;
export declare const isValidDate: (date: any) => boolean;
export declare const getDateRange: (period: "today" | "yesterday" | "last7days" | "last30days" | "thisMonth" | "lastMonth") => {
    start: Date;
    end: Date;
};
export declare const calculateAge: (dateOfBirth: Date | string) => number;
export declare const isLegalAge: (dateOfBirth: Date | string, minAge?: number) => boolean;
export declare const getBusinessDays: (startDate: Date | string, endDate: Date | string) => number;
export declare const addBusinessDays: (date: Date | string, days: number) => Date;
export declare const isBusinessDay: (date: Date | string) => boolean;
export declare const getNextBusinessDay: (date: Date | string) => Date;
export declare const isWithinBusinessHours: (date?: Date | string, startHour?: number, endHour?: number) => boolean;
export declare const utcToLocal: (utcDate: Date | string, timezone?: string) => Date;
export declare const localToUtc: (localDate: Date | string) => Date;
export declare const getRelativeTime: (date: Date | string) => string;
export declare const isExpired: (expiryDate: Date | string) => boolean;
export declare const getDaysUntilExpiry: (expiryDate: Date | string) => number;
//# sourceMappingURL=date.d.ts.map