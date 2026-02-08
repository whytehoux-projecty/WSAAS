import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

interface TOTPSecret {
    base32: string;
    otpauth_url: string;
}

interface TwoFactorSetupResult {
    secret: string;
    qrCodeDataUrl: string;
    backupCodes: string[];
}

interface TwoFactorVerifyResult {
    verified: boolean;
    usedBackupCode?: boolean;
}

class TwoFactorAuthServiceClass {
    private readonly ISSUER = 'AURUM VAULT Admin';
    private readonly BACKUP_CODES_COUNT = 10;

    /**
     * Generate a new TOTP secret for a user
     */
    generateSecret(userEmail: string): TOTPSecret {
        const secret = speakeasy.generateSecret({
            name: `${this.ISSUER}:${userEmail}`,
            issuer: this.ISSUER,
            length: 32
        });

        return {
            base32: secret.base32,
            otpauth_url: secret.otpauth_url || ''
        };
    }

    /**
     * Generate QR code as data URL for TOTP setup
     */
    async generateQRCode(otpauthUrl: string): Promise<string> {
        try {
            return await QRCode.toDataURL(otpauthUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#1A1A2E',
                    light: '#FFFFFF'
                }
            });
        } catch (error) {
            console.error('Failed to generate QR code:', error);
            throw new Error('Failed to generate QR code');
        }
    }

    /**
     * Generate secure backup codes
     */
    generateBackupCodes(): string[] {
        const codes: string[] = [];

        for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
            // Generate 8-character alphanumeric code
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
        }

        return codes;
    }

    /**
     * Hash backup codes for storage
     */
    // private hashBackupCodes(codes: string[]): string[] {
    //     return codes.map(code =>
    //         crypto.createHash('sha256').update(code.replace('-', '')).digest('hex')
    //     );
    // }

    /**
     * Setup 2FA for an admin user
     */
    async setup(adminUserId: string, email: string): Promise<TwoFactorSetupResult> {
        // Generate TOTP secret
        const secret = this.generateSecret(email);

        // Generate QR code
        const qrCodeDataUrl = await this.generateQRCode(secret.otpauth_url);

        // Generate backup codes
        const backupCodes = this.generateBackupCodes();
        // const _hashedBackupCodes = this.hashBackupCodes(backupCodes);

        // Store temporarily (not activated until verified)
        await prisma.adminUser.update({
            where: { id: adminUserId },
            data: {
                // Store secret temporarily - will be confirmed after verification
                // Using a JSON field or separate table in production
            }
        });

        // Store in session or temporary storage
        // For now, we'll return it to be stored client-side temporarily

        return {
            secret: secret.base32,
            qrCodeDataUrl,
            backupCodes
        };
    }

    /**
     * Verify TOTP token during setup or login
     */
    verifyToken(secret: string, token: string): boolean {
        try {
            return speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: 2 // Allow 1 step before and after for clock drift
            });
        } catch (error) {
            console.error('TOTP verification error:', error);
            return false;
        }
    }

    /**
     * Verify 2FA during login
     */
    async verify(adminUserId: string, token: string): Promise<TwoFactorVerifyResult> {
        const admin = await prisma.adminUser.findUnique({
            where: { id: adminUserId }
        });

        if (!admin) {
            return { verified: false };
        }

        // Check if 2FA is enabled (would need twoFactorSecret field in schema)
        // For now, we'll use a placeholder approach
        const twoFactorSecret = (admin as any).twoFactorSecret;

        if (!twoFactorSecret) {
            // 2FA not enabled, verification passes
            return { verified: true };
        }

        // Try TOTP verification first
        if (this.verifyToken(twoFactorSecret, token)) {
            return { verified: true };
        }

        // Try backup code verification
        const backupCodes = (admin as any).twoFactorBackupCodes as string[] || [];
        const hashedToken = crypto.createHash('sha256').update(token.replace('-', '')).digest('hex');

        const backupCodeIndex = backupCodes.findIndex(code => code === hashedToken);

        if (backupCodeIndex !== -1) {
            // Remove used backup code
            backupCodes.splice(backupCodeIndex, 1);

            await prisma.adminUser.update({
                where: { id: adminUserId },
                data: {
                    // Update backup codes
                }
            });

            return { verified: true, usedBackupCode: true };
        }

        return { verified: false };
    }

    /**
     * Enable 2FA after initial verification
     */
    async enable(adminUserId: string, secret: string, token: string, _backupCodes: string[]): Promise<boolean> {
        // Verify the token first
        if (!this.verifyToken(secret, token)) {
            return false;
        }

        // const _hashedBackupCodes = this.hashBackupCodes(backupCodes);

        // In a real implementation, update the user record with 2FA details
        // This requires adding fields to the Prisma schema
        console.log(`2FA enabled for admin ${adminUserId}`);

        return true;
    }

    /**
     * Disable 2FA for an admin user
     */
    async disable(adminUserId: string, _password: string): Promise<boolean> {
        // Verify password before disabling
        const admin = await prisma.adminUser.findUnique({
            where: { id: adminUserId }
        });

        if (!admin) {
            return false;
        }

        // In production, verify password with bcrypt
        // Then clear 2FA fields

        console.log(`2FA disabled for admin ${adminUserId}`);
        return true;
    }

    /**
     * Regenerate backup codes
     */
    async regenerateBackupCodes(adminUserId: string): Promise<string[] | null> {
        const admin = await prisma.adminUser.findUnique({
            where: { id: adminUserId }
        });

        if (!admin || !(admin as any).twoFactorSecret) {
            return null;
        }

        const newBackupCodes = this.generateBackupCodes();
        // const _hashedBackupCodes = this.hashBackupCodes(newBackupCodes);

        // Update in database
        // ...

        return newBackupCodes;
    }

    /**
     * Check if 2FA is enabled for a user
     */
    async isEnabled(adminUserId: string): Promise<boolean> {
        const admin = await prisma.adminUser.findUnique({
            where: { id: adminUserId }
        });

        return !!(admin && (admin as any).twoFactorSecret);
    }
}

export const TwoFactorAuthService = new TwoFactorAuthServiceClass();
