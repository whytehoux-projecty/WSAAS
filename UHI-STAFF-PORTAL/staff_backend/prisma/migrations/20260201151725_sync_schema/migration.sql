-- CreateEnum
CREATE TYPE "GrantStatus" AS ENUM ('pending', 'approved', 'rejected', 'disbursed');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('pending', 'paid', 'expired', 'cancelled');

-- AlterEnum
ALTER TYPE "ApplicationType" ADD VALUE 'grant';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "two_factor_secret" VARCHAR;

-- CreateTable
CREATE TABLE "grants" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "reason" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "status" "GrantStatus" NOT NULL DEFAULT 'pending',
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "rejected_by" UUID,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_invoices" (
    "id" UUID NOT NULL,
    "loan_id" UUID NOT NULL,
    "invoice_number" VARCHAR(50) NOT NULL,
    "payment_pin" VARCHAR(20) NOT NULL,
    "principal_amount" DECIMAL NOT NULL,
    "tax_amount" DECIMAL NOT NULL DEFAULT 0,
    "fee_amount" DECIMAL NOT NULL DEFAULT 0,
    "amount" DECIMAL NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "due_date" DATE NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'pending',
    "qr_code_data" TEXT,
    "generated_by" UUID,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "payment_transaction_ref" VARCHAR(100),

    CONSTRAINT "loan_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "grants_user_id_idx" ON "grants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "loan_invoices_invoice_number_key" ON "loan_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "loan_invoices_invoice_number_idx" ON "loan_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "loan_invoices_loan_id_idx" ON "loan_invoices"("loan_id");

-- AddForeignKey
ALTER TABLE "grants" ADD CONSTRAINT "grants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_invoices" ADD CONSTRAINT "loan_invoices_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
