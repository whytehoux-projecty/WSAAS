import { prisma } from '../lib/prisma';
import PDFDocument from 'pdfkit';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export type ReportType =
    | 'TRANSACTION_SUMMARY'
    | 'USER_ACTIVITY'
    | 'KYC_STATUS'
    | 'WIRE_TRANSFERS'
    | 'AUDIT_LOG'
    | 'ACCOUNT_BALANCES'
    | 'REVENUE'
    | 'COMPLIANCE';

export interface ReportFilters {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    type?: string;
    userId?: string;
}

export interface ReportData {
    title: string;
    generatedAt: Date;
    generatedBy: string;
    period: { start: Date; end: Date };
    summary: Record<string, any>;
    data: any[];
    metadata?: Record<string, any>;
}

class ReportsServiceClass {
    /**
     * Generate a report based on type
     */
    async generate(
        type: ReportType,
        filters: ReportFilters,
        adminUserId: string
    ): Promise<ReportData> {
        const startDate = filters.startDate || subDays(new Date(), 30);
        const endDate = filters.endDate || new Date();

        switch (type) {
            case 'TRANSACTION_SUMMARY':
                return this.generateTransactionSummaryReport(startDate, endDate, filters, adminUserId);
            case 'USER_ACTIVITY':
                return this.generateUserActivityReport(startDate, endDate, filters, adminUserId);
            case 'KYC_STATUS':
                return this.generateKYCStatusReport(startDate, endDate, adminUserId);
            case 'WIRE_TRANSFERS':
                return this.generateWireTransfersReport(startDate, endDate, filters, adminUserId);
            case 'AUDIT_LOG':
                return this.generateAuditLogReport(startDate, endDate, filters, adminUserId);
            case 'ACCOUNT_BALANCES':
                return this.generateAccountBalancesReport(adminUserId);
            case 'REVENUE':
                return this.generateRevenueReport(startDate, endDate, adminUserId);
            case 'COMPLIANCE':
                return this.generateComplianceReport(startDate, endDate, adminUserId);
            default:
                throw new Error(`Unknown report type: ${type}`);
        }
    }

    /**
     * Generate PDF from report data
     */
    async generatePDF(reportData: ReportData): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    margin: 50,
                    size: 'A4'
                });

                const chunks: Buffer[] = [];

                doc.on('data', (chunk: Buffer) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Header
                doc.fontSize(24)
                    .fillColor('#1A1A2E')
                    .text('AURUM VAULT', { align: 'center' });

                doc.fontSize(18)
                    .fillColor('#D4AF37')
                    .text(reportData.title, { align: 'center' });

                doc.moveDown();

                // Report metadata
                doc.fontSize(10)
                    .fillColor('#666666')
                    .text(`Generated: ${format(reportData.generatedAt, 'PPpp')}`, { align: 'right' })
                    .text(`Period: ${format(reportData.period.start, 'PP')} - ${format(reportData.period.end, 'PP')}`, { align: 'right' });

                doc.moveDown(2);

                // Summary section
                doc.fontSize(14)
                    .fillColor('#1A1A2E')
                    .text('Summary', { underline: true });

                doc.moveDown(0.5);
                doc.fontSize(11).fillColor('#333333');

                Object.entries(reportData.summary).forEach(([key, value]) => {
                    const label = this.formatLabel(key);
                    const displayValue = typeof value === 'number'
                        ? value.toLocaleString()
                        : String(value);
                    doc.text(`${label}: ${displayValue}`);
                });

                doc.moveDown(2);

                // Data table (simplified)
                if (reportData.data.length > 0) {
                    doc.fontSize(14)
                        .fillColor('#1A1A2E')
                        .text('Details', { underline: true });

                    doc.moveDown(0.5);
                    doc.fontSize(9).fillColor('#333333');

                    // Just show first 50 rows to avoid huge PDFs
                    const displayData = reportData.data.slice(0, 50);

                    displayData.forEach((row, index) => {
                        if (doc.y > 700) {
                            doc.addPage();
                        }

                        doc.text(`${index + 1}. ${JSON.stringify(row)}`, {
                            width: 500,
                            lineBreak: true
                        });
                        doc.moveDown(0.3);
                    });

                    if (reportData.data.length > 50) {
                        doc.moveDown();
                        doc.fontSize(10)
                            .fillColor('#666666')
                            .text(`... and ${reportData.data.length - 50} more records`, { align: 'center' });
                    }
                }

                // Footer
                doc.fontSize(8)
                    .fillColor('#999999')
                    .text(
                        'This report is confidential and intended for authorized personnel only.',
                        50,
                        doc.page.height - 50,
                        { align: 'center' }
                    );

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Generate CSV from report data
     */
    generateCSV(reportData: ReportData): string {
        if (reportData.data.length === 0) {
            return 'No data available';
        }

        const headers = Object.keys(reportData.data[0]);
        const rows = reportData.data.map(row =>
            headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value}"`;
                }
                return String(value);
            }).join(',')
        );

        return [headers.join(','), ...rows].join('\n');
    }

    // ============ Report Generators ============

    private async generateTransactionSummaryReport(
        startDate: Date,
        endDate: Date,
        filters: ReportFilters,
        adminUserId: string
    ): Promise<ReportData> {
        const where: any = {
            createdAt: {
                gte: startOfDay(startDate),
                lte: endOfDay(endDate)
            }
        };

        if (filters.status) where.status = filters.status;
        if (filters.type) where.type = filters.type;

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                account: {
                    include: { user: { select: { email: true, firstName: true, lastName: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const summary = {
            totalTransactions: transactions.length,
            totalVolume: transactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0),
            deposits: transactions.filter(t => t.type === 'DEPOSIT').length,
            withdrawals: transactions.filter(t => t.type === 'WITHDRAWAL').length,
            transfers: transactions.filter(t => t.type === 'TRANSFER').length,
            completed: transactions.filter(t => t.status === 'COMPLETED').length,
            pending: transactions.filter(t => t.status === 'PENDING').length,
            failed: transactions.filter(t => t.status === 'FAILED').length
        };

        return {
            title: 'Transaction Summary Report',
            generatedAt: new Date(),
            generatedBy: adminUserId,
            period: { start: startDate, end: endDate },
            summary,
            data: transactions.map(t => ({
                id: t.id,
                reference: t.reference,
                type: t.type,
                amount: Number(t.amount),
                status: t.status,
                user: t.account.user.email,
                date: format(t.createdAt, 'PP')
            }))
        };
    }

    private async generateUserActivityReport(
        startDate: Date,
        endDate: Date,
        filters: ReportFilters,
        adminUserId: string
    ): Promise<ReportData> {
        const whereClause = filters.status ? { status: filters.status } : {};
        const users = await prisma.user.findMany({
            where: whereClause,
            include: {
                accounts: {
                    include: {
                        transactions: {
                            where: {
                                createdAt: {
                                    gte: startOfDay(startDate),
                                    lte: endOfDay(endDate)
                                }
                            }
                        }
                    }
                }
            }
        });

        const userActivity = users.map((user: any) => {
            const userAccounts = user.accounts || [];
            const allTransactions = userAccounts.flatMap((a: any) => a.transactions || []);
            return {
                userId: user.id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                status: user.status,
                kycStatus: user.kycStatus,
                accountCount: userAccounts.length,
                transactionCount: allTransactions.length,
                totalVolume: allTransactions.reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0),
                lastLogin: user.lastLoginAt ? format(user.lastLoginAt, 'PP') : 'Never'
            };
        });

        return {
            title: 'User Activity Report',
            generatedAt: new Date(),
            generatedBy: adminUserId,
            period: { start: startDate, end: endDate },
            summary: {
                totalUsers: users.length,
                activeUsers: users.filter(u => u.status === 'ACTIVE').length,
                suspendedUsers: users.filter(u => u.status === 'SUSPENDED').length,
                verifiedUsers: users.filter(u => u.kycStatus === 'VERIFIED').length
            },
            data: userActivity
        };
    }

    private async generateKYCStatusReport(
        startDate: Date,
        endDate: Date,
        adminUserId: string
    ): Promise<ReportData> {
        const users = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate)
                }
            },
            include: {
                kycDocuments: true
            }
        });

        const kycStats = {
            pending: users.filter(u => u.kycStatus === 'PENDING').length,
            underReview: users.filter(u => u.kycStatus === 'UNDER_REVIEW').length,
            verified: users.filter(u => u.kycStatus === 'VERIFIED').length,
            rejected: users.filter(u => u.kycStatus === 'REJECTED').length
        };

        return {
            title: 'KYC Status Report',
            generatedAt: new Date(),
            generatedBy: adminUserId,
            period: { start: startDate, end: endDate },
            summary: {
                ...kycStats,
                totalSubmissions: users.reduce((sum, u) => sum + u.kycDocuments.length, 0),
                verificationRate: users.length > 0
                    ? ((kycStats.verified / users.length) * 100).toFixed(1) + '%'
                    : '0%'
            },
            data: users.map(u => ({
                userId: u.id,
                email: u.email,
                name: `${u.firstName} ${u.lastName}`,
                kycStatus: u.kycStatus,
                documentsSubmitted: u.kycDocuments.length,
                registeredAt: format(u.createdAt, 'PP')
            }))
        };
    }

    private async generateWireTransfersReport(
        startDate: Date,
        endDate: Date,
        filters: ReportFilters,
        adminUserId: string
    ): Promise<ReportData> {
        const where: any = {
            createdAt: {
                gte: startOfDay(startDate),
                lte: endOfDay(endDate)
            }
        };

        if (filters.status) where.complianceStatus = filters.status;

        const transfers = await prisma.wireTransfer.findMany({
            where,
            include: {
                transaction: true,
                senderAccount: {
                    include: { user: { select: { email: true, firstName: true, lastName: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            title: 'Wire Transfers Report',
            generatedAt: new Date(),
            generatedBy: adminUserId,
            period: { start: startDate, end: endDate },
            summary: {
                totalTransfers: transfers.length,
                totalVolume: transfers.reduce((sum, t) => sum + Math.abs(Number(t.transaction.amount)), 0),
                pending: transfers.filter(t => t.complianceStatus === 'PENDING').length,
                approved: transfers.filter(t => t.complianceStatus === 'APPROVED').length,
                rejected: transfers.filter(t => t.complianceStatus === 'REJECTED').length,
                totalFees: transfers.reduce((sum, t) => sum + Number(t.fee), 0)
            },
            data: transfers.map(t => ({
                id: t.id,
                reference: t.transaction.reference,
                sender: t.senderAccount.user.email,
                recipient: t.recipientName,
                recipientBank: t.recipientBankName,
                amount: Number(t.transaction.amount),
                fee: Number(t.fee),
                status: t.complianceStatus,
                date: format(t.createdAt, 'PP')
            }))
        };
    }

    private async generateAuditLogReport(
        startDate: Date,
        endDate: Date,
        _filters: ReportFilters,
        adminUserId: string
    ): Promise<ReportData> {
        const logs = await prisma.auditLog.findMany({
            where: {
                createdAt: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate)
                }
            },
            include: {
                adminUser: { select: { email: true } },
                user: { select: { email: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 1000
        });

        return {
            title: 'Audit Log Report',
            generatedAt: new Date(),
            generatedBy: adminUserId,
            period: { start: startDate, end: endDate },
            summary: {
                totalEvents: logs.length,
                infoEvents: logs.filter(l => l.severity === 'INFO').length,
                warningEvents: logs.filter(l => l.severity === 'WARNING').length,
                errorEvents: logs.filter(l => l.severity === 'ERROR').length,
                criticalEvents: logs.filter(l => l.severity === 'CRITICAL').length
            },
            data: logs.map(l => ({
                id: l.id,
                action: l.action,
                entityType: l.entityType,
                severity: l.severity,
                admin: l.adminUser?.email || 'System',
                user: l.user?.email || 'N/A',
                ipAddress: l.ipAddress,
                timestamp: format(l.createdAt, 'PPpp')
            }))
        };
    }

    private async generateAccountBalancesReport(adminUserId: string): Promise<ReportData> {
        const accounts = await prisma.account.findMany({
            include: {
                user: { select: { email: true, firstName: true, lastName: true } }
            },
            orderBy: { balance: 'desc' }
        });

        const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

        return {
            title: 'Account Balances Report',
            generatedAt: new Date(),
            generatedBy: adminUserId,
            period: { start: new Date(), end: new Date() },
            summary: {
                totalAccounts: accounts.length,
                activeAccounts: accounts.filter(a => a.status === 'ACTIVE').length,
                totalBalance: totalBalance,
                averageBalance: accounts.length > 0 ? totalBalance / accounts.length : 0,
                highestBalance: accounts.length > 0 && accounts[0] ? Number(accounts[0].balance) : 0
            },
            data: accounts.map(a => ({
                accountNumber: a.accountNumber,
                type: a.accountType,
                owner: a.user.email,
                balance: Number(a.balance),
                currency: a.currency,
                status: a.status
            }))
        };
    }

    private async generateRevenueReport(
        startDate: Date,
        endDate: Date,
        adminUserId: string
    ): Promise<ReportData> {
        const transfers = await prisma.wireTransfer.findMany({
            where: {
                createdAt: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate)
                },
                complianceStatus: 'APPROVED'
            }
        });

        const totalFees = transfers.reduce((sum, t) => sum + Number(t.fee), 0);

        return {
            title: 'Revenue Report',
            generatedAt: new Date(),
            generatedBy: adminUserId,
            period: { start: startDate, end: endDate },
            summary: {
                totalWireTransferFees: totalFees,
                transferCount: transfers.length,
                averageFee: transfers.length > 0 ? totalFees / transfers.length : 0
            },
            data: transfers.map(t => ({
                id: t.id,
                fee: Number(t.fee),
                date: format(t.createdAt, 'PP')
            }))
        };
    }

    private async generateComplianceReport(
        startDate: Date,
        endDate: Date,
        adminUserId: string
    ): Promise<ReportData> {
        const [kycPending, wiresPending, highValueTxns] = await Promise.all([
            prisma.user.count({ where: { kycStatus: 'PENDING' } }),
            prisma.wireTransfer.count({ where: { complianceStatus: 'PENDING' } }),
            prisma.transaction.count({
                where: {
                    amount: { gte: 10000 },
                    createdAt: {
                        gte: startOfDay(startDate),
                        lte: endOfDay(endDate)
                    }
                }
            })
        ]);

        return {
            title: 'Compliance Overview Report',
            generatedAt: new Date(),
            generatedBy: adminUserId,
            period: { start: startDate, end: endDate },
            summary: {
                pendingKYCReviews: kycPending,
                pendingWireApprovals: wiresPending,
                highValueTransactions: highValueTxns,
                complianceStatus: kycPending === 0 && wiresPending === 0 ? 'CLEAR' : 'ACTION_REQUIRED'
            },
            data: []
        };
    }

    private formatLabel(key: string): string {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
}

export const ReportsService = new ReportsServiceClass();
