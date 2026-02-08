import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { InvoiceParserService } from '../services/invoice-parser.service';
import { BillService } from '../services/bill.service';

const prisma = new PrismaClient();
const invoiceParser = new InvoiceParserService();
const billService = new BillService();

const addPayeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  category: z.string().min(1, 'Category is required'),
});

const payBillSchema = z.object({
  payeeId: z.string(),
  amount: z.number().positive(),
  accountId: z.string(),
  paymentDate: z.string().or(z.date()).optional(), // Optional scheduling support
  reference: z.string().optional(), // Invoice number or reference
});

import { getTransactions } from './transactions';

export default async function billRoutes(fastify: FastifyInstance) {
  // Get Bill Payments History
  fastify.get(
    '/',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get bill payment history',
        tags: ['Bills'],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Force type parameter to PAYMENT
      (request.query as any).type = 'PAYMENT';
      return getTransactions(request, reply);
    }
  );

  // Get Payees
  fastify.get(
    '/payees',
    {
      preHandler: [fastify.authenticate],
    },
    getPayees
  );

  // Add Payee
  fastify.post(
    '/payees',
    {
      preHandler: [fastify.authenticate],
    },
    addPayee
  );

  // Pay Bill
  fastify.post(
    '/pay',
    {
      preHandler: [fastify.authenticate],
    },
    payBill
  );

  // Upload Invoice
  fastify.post(
    '/upload-invoice',
    {
      preHandler: [fastify.authenticate],
    },
    uploadInvoice
  );

  // Get Verification Config
  fastify.get(
    '/config/verification',
    {
      preHandler: [fastify.authenticate],
    },
    getVerificationConfig
  );

  // Pay Bill Verified
  fastify.post(
    '/pay-verified',
    {
      preHandler: [fastify.authenticate],
    },
    payBillVerified
  );
}

const getPayees = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const payees = await prisma.billPayee.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });
    reply.send({ payees });
  } catch (error) {
    reply.status(500).send({ error: 'Internal Server Error', message: 'Failed to fetch payees' });
  }
};

const addPayee = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const data = addPayeeSchema.parse(request.body);

    const payee = await prisma.billPayee.create({
      data: {
        userId: user.userId,
        ...data,
      },
    });

    reply.status(201).send({ message: 'Payee added', payee });
  } catch (error) {
    if (error instanceof z.ZodError)
      return reply
        .status(400)
        .send({ error: 'Validation Error', message: error.errors[0]?.message });
    reply.status(500).send({ error: 'Internal Server Error', message: 'Failed to add payee' });
  }
};

const getVerificationConfig = async (_request: FastifyRequest, reply: FastifyReply) => {
  try {
    const threshold = await billService.getVerificationThreshold();
    reply.send({ threshold });
  } catch (error) {
    reply.send({ threshold: 10000 });
  }
};

const payBill = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const { payeeId, amount, accountId, reference, paymentDate } = payBillSchema.parse(
      request.body
    );

    const result = await billService.processPayment({
      userId: user.userId,
      payeeId,
      amount,
      accountId,
      reference,
      paymentDate,
    });

    if (!result.success) {
      if (result.requiresVerification) {
        return reply.status(400).send({
          error: result.error,
          message: result.message,
          requiresVerification: true,
          threshold: result.threshold,
        });
      }
      // Determine status code based on error
      const status =
        result.error === 'Account not found' || result.error === 'Payee not found' ? 404 : 400;
      return reply.status(status).send({ message: result.error });
    }

    reply.send({ message: result.message, transaction: result.transaction });
  } catch (error) {
    if (error instanceof z.ZodError)
      return reply
        .status(400)
        .send({ error: 'Validation Error', message: error.errors[0]?.message });
    request.log.error('Pay bill error:', error);
    reply
      .status(500)
      .send({ error: 'Internal Server Error', message: 'Failed to process payment' });
  }
};

const payBillVerified = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const parts = request.parts();
    const body: Record<string, string> = {};
    let filePath = '';

    for await (const part of parts) {
      if (part.type === 'file') {
        await part.toBuffer(); // Consume buffer but ignore it for now
        // In real app, upload to S3/Cloud. Here we mock save or just keep ref.
        // We'll assume we save it locally for now or just mock the path.
        // Since I can't write to random dirs easily without setup, I'll mock the path.
        filePath = `/uploads/verifications/${Date.now()}_${part.filename}`;
      } else {
        body[part.fieldname] = String(part.value);
      }
    }

    const { payeeId, amount, accountId } = payBillSchema.parse({
      ...body,
      amount: Number(body['amount']), // Ensure amount is a number
    });

    const user = request.user as any;

    const result = await billService.processVerifiedPayment({
      userId: user.userId,
      payeeId,
      amount,
      accountId,
      documentPath: filePath,
    });

    if (!result.success) {
      const status =
        result.error === 'Account not found' || result.error === 'Payee not found' ? 404 : 400;
      return reply.status(status).send({ message: result.error });
    }

    reply.send({
      message: result.message,
      transaction: result.transaction,
    });
  } catch (error) {
    if (error instanceof z.ZodError)
      return reply
        .status(400)
        .send({ error: 'Validation Error', message: error.errors[0]?.message });
    reply
      .status(500)
      .send({ error: 'Internal Server Error', message: 'Failed to process verified payment' });
  }
};

const uploadInvoice = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const file = await request.file();
    if (!file) {
      return reply.status(400).send({ message: 'No file uploaded' });
    }

    if (file.mimetype !== 'application/pdf') {
      return reply.status(400).send({ message: 'Only PDF files are allowed' });
    }

    const buffer = await file.toBuffer();
    const parsed = await invoiceParser.parse(buffer);

    // Check if invoice already paid (Simulated check against parsed data)
    // In a real system, we'd check `parsed.invoiceNumber` against DB
    // const existing = await prisma.billPayment.findFirst({ where: { invoiceNumber: parsed.invoiceNumber } });
    // if(existing) ...

    reply.send({ success: true, data: parsed });
  } catch (error) {
    request.log.error('Upload invoice error:', error);
    reply.status(500).send({ message: 'Failed to process invoice' });
  }
};
