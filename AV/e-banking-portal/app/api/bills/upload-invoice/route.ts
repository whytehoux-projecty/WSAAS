import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { message: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Simulate processing time (OCR)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Logic to "parse" the invoice
        // In a real app, this would call AWS Textract or Google Cloud Vision
        // Here we simulate extraction based on randomness or file properties
        
        const randomAmount = Math.floor(Math.random() * 500) + 50 + (Math.floor(Math.random() * 99) / 100);
        const randomInvoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        // Mock Payee Detection
        const commonMerchants = ['Pacific Gas & Electric', 'Comcast Xfinity', 'Verizon Wireless', 'State Farm', 'Chase Card Services'];
        const merchantName = commonMerchants[Math.floor(Math.random() * commonMerchants.length)];

        return NextResponse.json({
            success: true,
            data: {
                amount: randomAmount,
                invoiceNumber: randomInvoiceNum,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                merchantName: merchantName,
                accountNumber: `ACC-${Math.floor(Math.random() * 1000000000)}`
            }
        });
    } catch (error) {
        console.error('Invoice parsing error:', error);
        return NextResponse.json(
            { message: 'Failed to process invoice' },
            { status: 500 }
        );
    }
}
