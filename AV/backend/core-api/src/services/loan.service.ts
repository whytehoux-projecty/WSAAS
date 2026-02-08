
import { PrismaClient, Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';

interface CreateLoanParams {
    userId: string;
    accountId: string;
    amount: number;
    interestRate: number;
    termMonths: number;
    startDate: Date;
}

interface ProcessRepaymentParams {
    loanId: string;
    userId: string; // To ensure ownership
    amount: number;
    accountId: string; // Source account for repayment
}

export class LoanService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async createLoan(params: CreateLoanParams) {
        const { userId, accountId, amount, interestRate, termMonths, startDate } = params;

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + termMonths);

        const loan = await this.prisma.loan.create({
            data: {
                userId,
                accountId,
                amount,
                interestRate,
                termMonths,
                startDate,
                endDate,
                remainingAmount: amount, // Start with full amount
                status: 'ACTIVE',
            },
        });

        // We might want to disburse funds here (Credit user account), but for now just create the loan record.
        // If we disburse:
        /*
        await this.prisma.transaction.create({
            data: {
                accountId,
                type: 'LOAN_DISBURSAL',
                amount: amount,
                description: `Loan Disbursal ID: ${loan.id}`,
                reference: `LOAN-${loan.id}`,
                status: 'COMPLETED'
            }
        });
        // And update balance
        */

        return loan;
    }

    async getLoan(loanId: string, userId: string) {
        return this.prisma.loan.findFirst({
            where: { id: loanId, userId },
            include: {
                repayments: {
                    orderBy: { paidAt: 'desc' },
                },
            },
        });
    }

    async processRepayment(params: ProcessRepaymentParams) {
        const { loanId, userId, amount, accountId } = params;

        const loan = await this.prisma.loan.findFirst({
            where: { id: loanId, userId },
        });

        if (!loan) throw new Error('Loan not found');
        if (loan.status === 'PAID') throw new Error('Loan already paid');

        const account = await this.prisma.account.findFirst({
            where: { id: accountId, userId },
        });

        if (!account) throw new Error('Account not found');
        if (Number(account.balance) < amount) throw new Error('Insufficient funds');

        // Process repayment in transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // 1. Create Transaction (Debit)
            const transaction = await tx.transaction.create({
                data: {
                    accountId,
                    type: 'LOAN_REPAYMENT',
                    amount: new Prisma.Decimal(-amount),
                    status: 'COMPLETED',
                    description: `Repayment for Loan ${loanId}`,
                    reference: `REP-${Date.now()}`,
                    metadata: JSON.stringify({ loanId }),
                },
            });

            // 2. Update Account Balance
            await tx.account.update({
                where: { id: accountId },
                data: {
                    balance: { decrement: amount },
                },
            });

            // 3. Create LoanRepayment record
            const repayment = await tx.loanRepayment.create({
                data: {
                    loanId,
                    amount,
                    transactionId: transaction.id,
                    status: 'COMPLETED',
                },
            });

            // 4. Update Loan Remaining Amount
            const newRemaining = Number(loan.remainingAmount) - amount;
            const status = newRemaining <= 0 ? 'PAID' : loan.status;

            await tx.loan.update({
                where: { id: loanId },
                data: {
                    remainingAmount: newRemaining > 0 ? newRemaining : 0,
                    status,
                },
            });

            return repayment;
        });

        return result;
    }

    async generateHistoryPDF(loanId: string, userId: string): Promise<Buffer> {
        const loan = await this.prisma.loan.findFirst({
            where: { id: loanId, userId },
            include: {
                repayments: {
                    orderBy: { paidAt: 'desc' },
                },
                user: true,
            },
        });

        if (!loan) throw new Error('Loan not found');

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            // Header
            doc.fontSize(20).text('Loan Repayment History', { align: 'center' });
            doc.moveDown();

            // Loan Details
            doc.fontSize(12).text(`Loan ID: ${loan.id}`);
            doc.text(`Borrower: ${loan.user.firstName} ${loan.user.lastName}`);
            doc.text(`Original Amount: ${loan.amount} ${loan.currency}`);
            doc.text(`Remaining Amount: ${loan.remainingAmount} ${loan.currency}`);
            doc.text(`Status: ${loan.status}`);
            doc.text(`Start Date: ${loan.startDate.toDateString()}`);
            doc.moveDown();

            // Table Header
            const tableTop = doc.y;
            const itemX = 50;
            const dateX = 200;
            const amountX = 350;
            const statusX = 500;

            doc.font('Helvetica-Bold');
            doc.text('#', itemX, tableTop);
            doc.text('Date', dateX, tableTop);
            doc.text('Amount', amountX, tableTop);
            doc.text('Status', statusX, tableTop);
            doc.moveDown();
            doc.font('Helvetica');

            // Separator
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            // Rows
            loan.repayments.forEach((repayment, i) => {
                const y = doc.y;
                doc.text((loan.repayments.length - i).toString(), itemX, y); // Reverse index
                doc.text(repayment.paidAt.toDateString(), dateX, y);
                doc.text(`${repayment.amount} ${repayment.currency}`, amountX, y);
                doc.text(repayment.status, statusX, y);
                doc.moveDown();
            });

            // Footer
            doc.moveDown();
            doc.fontSize(10).text('Generated by Aurum Vault', { align: 'center', oblique: true });

            doc.end();
        });
    }
}
