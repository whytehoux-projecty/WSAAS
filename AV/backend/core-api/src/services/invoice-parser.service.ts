// @ts-ignore
const pdf = require('pdf-parse');

export interface ParsedInvoice {
  invoiceNumber: string | null;
  amount: number | null;
  currency: string | null;
  date: Date | null;
  vendorName: string | null;
  staffId: string | null;
  loanCode: string | null;
  qrString: string | null;
  serviceCode: string | null;
  accountCode: string | null;
  paymentPin: string | null;
  breakdown: {
    principal: number;
    tax: number;
    fee: number;
  };
  rawText?: string;
}

export class InvoiceParserService {

  /**
   * Main entry point to parse invoice from buffer
   * @param buffer File buffer
   * @param mimeType Mime type of the file
   */
  async parse(buffer: Buffer, mimeType: string = 'application/pdf'): Promise<ParsedInvoice> {
    try {
      let text = '';

      if (mimeType === 'application/pdf') {
        text = await this.parsePdf(buffer);
      } else if (mimeType.startsWith('image/')) {
        text = await this.parseImage(buffer);
      } else {
        // Fallback: try to detect PDF header
        if (buffer.lastIndexOf(Buffer.from('%PDF')) === 0) {
          text = await this.parsePdf(buffer);
        } else {
          // Assume image as fallback or error
          text = await this.parseImage(buffer);
        }
      }

      return this.extractData(text);
    } catch (error) {
      console.error('Invoice Parse Error:', error);
      throw new Error(`Failed to parse invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async parsePdf(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer);
    return data.text;
  }

  private async parseImage(buffer: Buffer): Promise<string> {
    try {
      // Dynamic import to avoid crash if tesseract.js is not installed
      // @ts-ignore
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const ret = await worker.recognize(buffer);
      await worker.terminate();
      return ret.data.text;
    } catch (error) {
      console.error('OCR Error: tesseract.js might not be installed.', error);
      throw new Error('OCR capability requires "tesseract.js". Please install it to support image parsing.');
    }
  }

  private extractData(text: string): ParsedInvoice {
    const result: ParsedInvoice = {
      invoiceNumber: null,
      amount: null,
      currency: 'USD', // Default
      date: null,
      vendorName: null,
      staffId: null,
      loanCode: null,
      qrString: null,
      serviceCode: null,
      accountCode: null,
      paymentPin: null,
      breakdown: { principal: 0, tax: 0, fee: 0 },
      rawText: text
    };

    // 1. Invoice Number
    // Patterns: "Invoice #", "INV-", "Invoice Number:"
    const invMatch =
      text.match(/Invoice\s*[:#]?\s*([A-Za-z0-9-]+)/i) ||
      text.match(/(INV-[A-Z0-9-]+)/);
    if (invMatch && invMatch[1]) result.invoiceNumber = invMatch[1].trim();

    // 2. Amount (Total Due)
    // Patterns: "Total:", "Total Due:", "Amount Due:", "$1,234.56"
    // We look for currency symbols or "Total" followed by number
    const amountMatch =
      text.match(/(?:Total|Amount|Due)\s*(?:Due|Payable)?\s*[:.]?\s*[$€£]?\s*([\d,]+\.?\d{2})/i) ||
      text.match(/[$€£]\s*([\d,]+\.?\d{2})/); // Simple currency match

    if (amountMatch && amountMatch[1]) {
      result.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // 3. Date
    // Patterns: MM/DD/YYYY, DD-MM-YYYY, YYYY-MM-DD
    const dateMatch = text.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(\d{4}[/-]\d{1,2}[/-]\d{1,2})/);
    if (dateMatch && dateMatch[0]) {
      const dateStr = dateMatch[0];
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime())) {
        result.date = dateObj;
      }
    }

    // 4. Vendor Name (Simple heuristic: look for "From:" or top of file)
    // This is hard without layout analysis, but we can try
    const vendorMatch = text.match(/From:\s*([A-Za-z0-9\s,.&]+?)(?=\n|$)/i);
    if (vendorMatch && vendorMatch[1]) {
      result.vendorName = vendorMatch[1].trim();
    }

    // 5. Specific Banking Codes (Aurum Vault specific)

    // Service Code
    const svcMatch = text.match(/Service\s*Code[:.]?\s*([A-Z0-9-]+)/i);
    if (svcMatch && svcMatch[1]) result.serviceCode = svcMatch[1].trim();

    // Account Code / Reference
    const accMatch = text.match(/Reference\s*(?:Code|ID)[:.]?\s*([A-Z0-9-/]+)/i);
    if (accMatch && accMatch[1]) result.accountCode = accMatch[1].trim();

    // Loan Code
    const loanMatch = text.match(/LOAN-\d+/);
    if (loanMatch) result.loanCode = loanMatch[0];

    // Payment PIN
    const pinMatch = text.match(/Payment\s*(?:Reference)?\s*PIN[:.]?\s*([A-Z0-9]+)/i);
    if (pinMatch && pinMatch[1]) result.paymentPin = pinMatch[1].trim();

    // 6. Breakdown Analysis (if available)
    const principalMatch = text.match(/Principal\s*(?:Amount)?[:.]?\s*[$€£]?\s*([\d,]+\.?\d{2})/i);
    if (principalMatch && principalMatch[1]) {
      result.breakdown.principal = parseFloat(principalMatch[1].replace(/,/g, ''));
    }

    const taxMatch = text.match(/Tax[:.]?\s*[$€£]?\s*([\d,]+\.?\d{2})/i);
    if (taxMatch && taxMatch[1]) {
      result.breakdown.tax = parseFloat(taxMatch[1].replace(/,/g, ''));
    }

    return result;
  }
}
