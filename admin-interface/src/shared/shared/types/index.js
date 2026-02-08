"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRole = exports.NotificationType = exports.DocumentStatus = exports.DocumentType = exports.WireTransferStatus = exports.TransactionStatus = exports.TransactionType = exports.AccountStatus = exports.AccountType = exports.KycStatus = exports.UserStatus = void 0;
var UserStatus;
(function (UserStatus) {
    UserStatus["PENDING_VERIFICATION"] = "PENDING_VERIFICATION";
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
    UserStatus["CLOSED"] = "CLOSED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var KycStatus;
(function (KycStatus) {
    KycStatus["PENDING"] = "PENDING";
    KycStatus["IN_REVIEW"] = "IN_REVIEW";
    KycStatus["APPROVED"] = "APPROVED";
    KycStatus["REJECTED"] = "REJECTED";
    KycStatus["EXPIRED"] = "EXPIRED";
})(KycStatus || (exports.KycStatus = KycStatus = {}));
var AccountType;
(function (AccountType) {
    AccountType["CHECKING"] = "CHECKING";
    AccountType["SAVINGS"] = "SAVINGS";
    AccountType["INVESTMENT"] = "INVESTMENT";
    AccountType["CREDIT"] = "CREDIT";
})(AccountType || (exports.AccountType = AccountType = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["SUSPENDED"] = "SUSPENDED";
    AccountStatus["CLOSED"] = "CLOSED";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "DEPOSIT";
    TransactionType["WITHDRAWAL"] = "WITHDRAWAL";
    TransactionType["TRANSFER"] = "TRANSFER";
    TransactionType["PAYMENT"] = "PAYMENT";
    TransactionType["FEE"] = "FEE";
    TransactionType["INTEREST"] = "INTEREST";
    TransactionType["REFUND"] = "REFUND";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["PROCESSING"] = "PROCESSING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var WireTransferStatus;
(function (WireTransferStatus) {
    WireTransferStatus["PENDING"] = "PENDING";
    WireTransferStatus["IN_PROGRESS"] = "IN_PROGRESS";
    WireTransferStatus["COMPLETED"] = "COMPLETED";
    WireTransferStatus["FAILED"] = "FAILED";
    WireTransferStatus["CANCELLED"] = "CANCELLED";
})(WireTransferStatus || (exports.WireTransferStatus = WireTransferStatus = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["PASSPORT"] = "PASSPORT";
    DocumentType["DRIVERS_LICENSE"] = "DRIVERS_LICENSE";
    DocumentType["NATIONAL_ID"] = "NATIONAL_ID";
    DocumentType["UTILITY_BILL"] = "UTILITY_BILL";
    DocumentType["BANK_STATEMENT"] = "BANK_STATEMENT";
    DocumentType["PROOF_OF_INCOME"] = "PROOF_OF_INCOME";
    DocumentType["PROOF_OF_ADDRESS"] = "PROOF_OF_ADDRESS";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["PENDING"] = "PENDING";
    DocumentStatus["IN_REVIEW"] = "IN_REVIEW";
    DocumentStatus["APPROVED"] = "APPROVED";
    DocumentStatus["REJECTED"] = "REJECTED";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["TRANSACTION"] = "TRANSACTION";
    NotificationType["ACCOUNT"] = "ACCOUNT";
    NotificationType["SECURITY"] = "SECURITY";
    NotificationType["KYC"] = "KYC";
    NotificationType["SYSTEM"] = "SYSTEM";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRole["ADMIN"] = "ADMIN";
    AdminRole["MODERATOR"] = "MODERATOR";
    AdminRole["VIEWER"] = "VIEWER";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
//# sourceMappingURL=index.js.map