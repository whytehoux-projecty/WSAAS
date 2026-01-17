-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "permissions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" DATETIME,
    "login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "admin_user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" DATETIME NOT NULL,
    "last_activity_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "admin_sessions_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "date_of_birth" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "kyc_status" TEXT NOT NULL DEFAULT 'PENDING',
    "risk_level" TEXT NOT NULL DEFAULT 'LOW',
    "tier" TEXT NOT NULL DEFAULT 'BASIC',
    "login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" DATETIME,
    "last_login_at" DATETIME,
    "kyc_notes" TEXT,
    "suspension_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "balance" DECIMAL NOT NULL DEFAULT 0.00,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "interest_rate" DECIMAL NOT NULL DEFAULT 0.0,
    "daily_limit" DECIMAL NOT NULL DEFAULT 5000.00,
    "monthly_limit" DECIMAL NOT NULL DEFAULT 50000.00,
    "overdraft_limit" DECIMAL NOT NULL DEFAULT 0.00,
    "last_transaction_at" DATETIME,
    "closed_at" DATETIME,
    "closure_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "metadata" TEXT,
    "processed_at" DATETIME,
    "failure_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wire_transfers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transaction_id" TEXT NOT NULL,
    "sender_account_id" TEXT NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "recipient_bank_name" TEXT NOT NULL,
    "recipient_bank_swift" TEXT,
    "recipient_account_number" TEXT NOT NULL,
    "recipient_address" TEXT,
    "purpose_code" TEXT,
    "regulatory_info" TEXT,
    "compliance_status" TEXT NOT NULL DEFAULT 'PENDING',
    "fee" DECIMAL NOT NULL DEFAULT 25.00,
    "exchange_rate" DECIMAL NOT NULL DEFAULT 1.0,
    "estimated_arrival" DATETIME,
    "approved_by" TEXT,
    "approved_at" DATETIME,
    "rejection_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "wire_transfers_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "wire_transfers_sender_account_id_fkey" FOREIGN KEY ("sender_account_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fx_rates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "base_currency" TEXT NOT NULL,
    "target_currency" TEXT NOT NULL,
    "rate" DECIMAL NOT NULL,
    "spread" DECIMAL NOT NULL DEFAULT 0.0025,
    "effective_from" DATETIME NOT NULL,
    "effective_to" DATETIME,
    "provider" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "kyc_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_hash" TEXT NOT NULL,
    "verification_status" TEXT NOT NULL DEFAULT 'PENDING',
    "verified_by" TEXT,
    "verified_at" DATETIME,
    "rejection_reason" TEXT,
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "kyc_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "admin_user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "details" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "session_id" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "category" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" DATETIME NOT NULL,
    "last_activity_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "portal_status" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'online',
    "message" TEXT,
    "next_scheduled_maintenance" DATETIME,
    "scheduled_maintenance_message" TEXT,
    "updated_at" DATETIME NOT NULL,
    "updated_by" TEXT,
    CONSTRAINT "portal_status_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "admin_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "portal_status_audit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portal_status_id" TEXT NOT NULL,
    "previous_status" TEXT NOT NULL,
    "new_status" TEXT NOT NULL,
    "message" TEXT,
    "changed_by" TEXT NOT NULL,
    "changed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    CONSTRAINT "portal_status_audit_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "admin_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "portal_status_audit_portal_status_id_fkey" FOREIGN KEY ("portal_status_id") REFERENCES "portal_status" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_session_id_key" ON "admin_sessions"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_user_id_key" ON "addresses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_account_number_key" ON "accounts"("account_number");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "wire_transfers_transaction_id_key" ON "wire_transfers"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "fx_rates_base_currency_target_currency_effective_from_key" ON "fx_rates"("base_currency", "target_currency", "effective_from");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_session_id_key" ON "user_sessions"("session_id");
