import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StatementService {
    async generateStatement(
        accountId: string,
        periodStart: Date,
        periodEnd: Date
    ) {
        // 1. Fetch account and transactions
        const account = await prisma.account.findUnique({
            where: { id: accountId },
            include: {
                user: true,
                transactions: {
                    where: {
                        createdAt: {
                            gte: periodStart,
                            lte: periodEnd,
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!account) throw new Error('Account not found');

        // 2. Setup PDF
        const doc = new PDFDocument({ margin: 50 });
        const filename = `statement-${accountId}-${periodStart.toISOString().split('T')[0]}.pdf`;
        const uploadDir = path.join(process.cwd(), 'uploads', 'statements');

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        // 3. Draw Header
        doc.fontSize(24).font('Helvetica-Bold').text('AURUM VAULT', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text('PREMIUM BANKING SERVICES', { align: 'center', characterSpacing: 2 });
        doc.moveDown(2);

        // Separator line
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#D4AF37').stroke();
        doc.moveDown(2);

        // 4. Account Info
        doc.fontSize(12).fillColor('black');
        doc.font('Helvetica-Bold').text('Account Statement');
        doc.font('Helvetica').fontSize(10);
        doc.text(`Period: ${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`);
        doc.moveDown();

        doc.text(`Account Holder: ${account.user.firstName} ${account.user.lastName}`);
        doc.text(`Account Number: ****${account.accountNumber.slice(-4)}`);
        doc.text(`Account Type: ${account.accountType}`);
        doc.moveDown(2);

        // 5. Financial Summary
        doc.font('Helvetica-Bold').text('Summary');
        doc.moveDown(0.5);
        doc.font('Helvetica');
        const closingBalance = Number(account.balance);
        doc.text(`Closing Balance: $${closingBalance.toFixed(2)}`);
        doc.moveDown(2);

        // 6. Transactions Table Header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Date', 50, tableTop);
        doc.text('Description', 150, tableTop);
        doc.text('Amount', 450, tableTop, { align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#cccccc').stroke();
        doc.moveDown();

        // 7. Transactions Rows
        let y = tableTop + 30;
        doc.font('Helvetica').fontSize(10).fillColor('black');

        if (account.transactions.length === 0) {
            doc.text('No transactions found for this period.', 50, y);
        } else {
            account.transactions.forEach(tx => {
                if (y > 700) { // New page if near bottom
                    doc.addPage();
                    y = 50;
                }

                const amount = Number(tx.amount);
                const isCredit = tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN';
                const amountStr = (isCredit ? '+' : '') + '$' + amount.toFixed(2);

                doc.text(tx.createdAt.toLocaleDateString(), 50, y);
                doc.text(tx.description, 150, y, { width: 280, lineBreak: false, ellipsis: true });

                if (isCredit) doc.fillColor('#2E8B57'); // Green
                else doc.fillColor('#000000'); // Black

                doc.text(amountStr, 450, y, { align: 'right' });
                doc.fillColor('black');

                y += 20;
            });
        }

        // 8. Footer
        doc.end();

        // Wait for stream to finish
        await new Promise((resolve) => writeStream.on('finish', () => resolve(true)));

        // 9. Save to DB
        const statement = await prisma.statement.create({
            data: {
                accountId,
                statementType: 'MONTHLY',
                periodStart,
                periodEnd,
                filePath: filename, // Store relative filename for security
                fileSize: fs.statSync(filePath).size,
            },
        });

        return statement;
    }
}
