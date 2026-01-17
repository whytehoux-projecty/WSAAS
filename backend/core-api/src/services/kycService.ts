import { PrismaClient } from '@prisma/client';
import { ERROR_CODES, KYC_CONFIG } from '@shared/index';
import crypto from 'crypto';
import fs from 'fs/promises';

const prisma = new PrismaClient();

export class KycService {
  /**
   * Upload KYC document
   */
  static async uploadDocument(
    userId: string,
    documentData: {
      documentType: string;
      fileName: string;
      filePath: string;
      fileSize: number;
      mimeType: string;
      fileBuffer: Buffer;
    }
  ) {
    const { documentType, fileName, filePath, fileSize, mimeType, fileBuffer } = documentData;

    // Validate document type
    const allowedDocumentTypes = [
      ...KYC_CONFIG.REQUIRED_DOCUMENTS,
      ...KYC_CONFIG.PROOF_OF_ADDRESS_DOCUMENTS,
    ] as string[];
    if (!allowedDocumentTypes.includes(documentType)) {
      throw new Error('Invalid document type');
    }

    // Validate file size
    if (fileSize > KYC_CONFIG.MAX_UPLOAD_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${KYC_CONFIG.MAX_UPLOAD_SIZE} bytes`);
    }

    // Validate MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error('Invalid file type');
    }

    // Generate file hash for integrity
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Check if document already exists
    const existingDoc = await prisma.kycDocument.findFirst({
      where: {
        userId,
        documentType,
        verificationStatus: { in: ['PENDING', 'VERIFIED'] },
      },
    });

    if (existingDoc) {
      throw new Error('Document of this type already exists and is pending or verified');
    }

    // Create document record
    const document = await prisma.kycDocument.create({
      data: {
        userId,
        documentType,
        fileName,
        filePath,
        fileSize,
        mimeType,
        fileHash,
        verificationStatus: 'PENDING',
      },
      select: {
        id: true,
        documentType: true,
        fileName: true,
        fileSize: true,
        verificationStatus: true,
        createdAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'KYC_DOCUMENT_UPLOADED',
        entityType: 'KYC_DOCUMENT',
        entityId: document.id,
        details: JSON.stringify({
          documentType,
          fileName,
          fileSize,
        }),
        category: 'KYC',
      },
    });

    return document;
  }

  /**
   * Get user's KYC documents
   */
  static async getUserDocuments(userId: string) {
    const documents = await prisma.kycDocument.findMany({
      where: { userId },
      select: {
        id: true,
        documentType: true,
        fileName: true,
        fileSize: true,
        verificationStatus: true,
        verifiedAt: true,
        rejectionReason: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents;
  }

  /**
   * Get KYC document by ID
   */
  static async getDocumentById(documentId: string, userId: string) {
    const document = await prisma.kycDocument.findFirst({
      where: { id: documentId, userId },
      select: {
        id: true,
        documentType: true,
        fileName: true,
        filePath: true,
        fileSize: true,
        mimeType: true,
        verificationStatus: true,
        verifiedBy: true,
        verifiedAt: true,
        rejectionReason: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!document) {
      throw new Error(ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    return document;
  }

  /**
   * Delete KYC document
   */
  static async deleteDocument(documentId: string, userId: string) {
    const document = await prisma.kycDocument.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new Error(ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    if (document.verificationStatus === 'VERIFIED') {
      throw new Error('Cannot delete verified document');
    }

    // Delete file from storage
    try {
      await fs.unlink(document.filePath);
    } catch (error) {
      console.warn('Failed to delete file from storage:', error);
    }

    // Delete document record
    await prisma.kycDocument.delete({
      where: { id: documentId },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'KYC_DOCUMENT_DELETED',
        entityType: 'KYC_DOCUMENT',
        entityId: documentId,
        details: JSON.stringify({
          documentType: document.documentType,
          fileName: document.fileName,
        }),
        category: 'KYC',
      },
    });

    return { success: true };
  }

  /**
   * Get user's KYC status
   */
  static async getKycStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        kycStatus: true,
        kycNotes: true,
        tier: true,
      },
    });

    if (!user) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND);
    }

    const documents = await prisma.kycDocument.findMany({
      where: { userId },
      select: {
        documentType: true,
        verificationStatus: true,
        rejectionReason: true,
        expiresAt: true,
      },
    });

    const requiredDocuments = KYC_CONFIG.REQUIRED_DOCUMENTS;
    const submittedDocuments = documents.map(doc => doc.documentType);
    const verifiedDocuments = documents
      .filter(doc => doc.verificationStatus === 'VERIFIED')
      .map(doc => doc.documentType);

    const missingDocuments = requiredDocuments.filter(
      docType => !submittedDocuments.includes(docType)
    );

    const pendingDocuments = documents
      .filter(doc => doc.verificationStatus === 'PENDING')
      .map(doc => doc.documentType);

    const rejectedDocuments = documents
      .filter(doc => doc.verificationStatus === 'REJECTED')
      .map(doc => ({
        documentType: doc.documentType,
        rejectionReason: doc.rejectionReason,
      }));

    return {
      kycStatus: user.kycStatus,
      kycNotes: user.kycNotes,
      tier: user.tier,
      documents: {
        required: requiredDocuments,
        submitted: submittedDocuments,
        verified: verifiedDocuments,
        missing: missingDocuments,
        pending: pendingDocuments,
        rejected: rejectedDocuments,
      },
    };
  }

  /**
   * Get KYC next steps
   */
  static async getKycNextSteps(userId: string) {
    const status = await this.getKycStatus(userId);
    const nextSteps: string[] = [];

    if (status.documents.missing.length > 0) {
      nextSteps.push(`Upload missing documents: ${status.documents.missing.join(', ')}`);
    }

    if (status.documents.rejected.length > 0) {
      nextSteps.push('Re-upload rejected documents with corrections');
    }

    if (status.documents.pending.length > 0) {
      nextSteps.push('Wait for document verification');
    }

    if (status.kycStatus === 'PENDING' && status.documents.missing.length === 0) {
      nextSteps.push('All documents submitted - verification in progress');
    }

    if (status.kycStatus === 'VERIFIED') {
      nextSteps.push('KYC verification complete');
    }

    return {
      kycStatus: status.kycStatus,
      nextSteps,
      canProceed: status.documents.missing.length === 0 && status.documents.rejected.length === 0,
    };
  }

  /**
   * Verify KYC document (Admin function)
   */
  static async verifyDocument(
    documentId: string,
    adminUserId: string,
    decision: {
      status: 'VERIFIED' | 'REJECTED';
      rejectionReason?: string;
      expiresAt?: Date;
    }
  ) {
    const document = await prisma.kycDocument.findUnique({
      where: { id: documentId },
      include: { user: true },
    });

    if (!document) {
      throw new Error(ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    // Update document
    const updatedDocument = await prisma.kycDocument.update({
      where: { id: documentId },
      data: {
        verificationStatus: decision.status,
        verifiedBy: adminUserId,
        verifiedAt: new Date(),
        rejectionReason: decision.rejectionReason ?? null,
        expiresAt: decision.expiresAt ?? null,
      },
    });

    // Check if all required documents are verified
    if (decision.status === 'VERIFIED') {
      await this.checkAndUpdateUserKycStatus(document.userId);
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminUserId,
        action: `KYC_DOCUMENT_${decision.status}`,
        entityType: 'KYC_DOCUMENT',
        entityId: documentId,
        details: JSON.stringify({
          userId: document.userId,
          documentType: document.documentType,
          decision: decision.status,
          rejectionReason: decision.rejectionReason,
        }),
        category: 'KYC',
        severity: 'INFO',
      },
    });

    return updatedDocument;
  }

  /**
   * Check and update user KYC status
   */
  private static async checkAndUpdateUserKycStatus(userId: string) {
    const documents = await prisma.kycDocument.findMany({
      where: { userId },
      select: {
        documentType: true,
        verificationStatus: true,
      },
    });

    const requiredDocuments = KYC_CONFIG.REQUIRED_DOCUMENTS;
    const verifiedDocuments = documents
      .filter(doc => doc.verificationStatus === 'VERIFIED')
      .map(doc => doc.documentType);

    const allRequiredVerified = requiredDocuments.every(docType =>
      verifiedDocuments.includes(docType)
    );

    if (allRequiredVerified) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          kycStatus: 'VERIFIED',
          tier: 'PREMIUM', // Upgrade tier after KYC verification
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'KYC_VERIFICATION_COMPLETED',
          entityType: 'USER',
          entityId: userId,
          details: JSON.stringify({
            verifiedDocuments,
            newTier: 'PREMIUM',
          }),
          category: 'KYC',
          severity: 'INFO',
        },
      });
    }
  }
}
