import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { decryptData, encryptData } from 'src/common/helpers/cryptography';
import { TwoFaUtils } from './two-fa.utils';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwoFaService {
    private readonly logger = new Logger(TwoFaService.name);

    constructor(
        private readonly twoFaUtils: TwoFaUtils,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService
    ) {
        this.logger.verbose('TwoFa initialized.');
    }

    async setup2FA(userId: string, email: string): Promise<{ qrcodeUrl: string, secret: string, recoveryCodes: string[] }> {
        const user = await this.usersService.findOneById(userId);
        if (!user) throw new Error('User not found');
        if (user?.twoFactorEnabled) throw new BadRequestException('2FA Already enabled.')

        const { secret, qr_code } = await this.generateSecret(email);
        const recoveryCodes = this.twoFaUtils.generateBackupCodes()

        user.twoFactorSecret = encryptData(secret.base32, process.env.OTP_SECRET || '');
        user.recoveryCodes = recoveryCodes.map(code => encryptData(code, process.env.OTP_SECRET || ''));
        await user.save()

        return { qrcodeUrl: qr_code, secret: secret.base32, recoveryCodes };
    }

    async verify2FA(userId: string, token: string): Promise<boolean> {
        const user = await this.usersService.findOneById(userId);
        if (!user || !user.twoFactorSecret) throw new ForbiddenException('User not found or no secret to verify');

        const secret = decryptData(user.twoFactorSecret, process.env.OTP_SECRET || '')

        try {
            const verified = speakeasy.totp.verify({
                secret,
                encoding: 'base32',
                token: token,
            });
            if (verified) {
                user.twoFactorEnabled = true;
                await user.save()
            }
            else {
                throw new ForbiddenException(
                    'Provided two-factor authentication code is wrong or expired',
                );
            }

            return verified;
        } catch (error) {
            console.log("error in verifying otp", error)
            throw new ForbiddenException(
                'Provided two-factor authentication code is wrong or expired',
            );
        }

    }

    async disable2FA(userId: string, otpToken: string) {
        const user = await this.usersService.findOneById(userId);

        if (!user || !user.twoFactorSecret) throw new Error('User not found or no secret to verify');

        const secret = decryptData(user.twoFactorSecret, process.env.OTP_SECRET || '')

        // Verify password and OTP before proceeding
        const otpVerified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: otpToken,
        });

        if (otpVerified) {
            user.recoveryCodes = undefined;
            user.twoFactorEnabled = false;
            user.twoFactorSecret = undefined; // Or however you want to mark it as disabled
            await user.save()
            return { message: "2FA disabled successfully" };
        }

        throw new BadRequestException('Invalid OTP code')
    }

    async recoverAccount(userId: string, recoveryCode: string): Promise<any> {
        const user = await this.usersService.findOneById(userId);

        if (!user || !user.recoveryCodes || user.recoveryCodes.length <= 1) throw new Error('User not found or no recovery codes present');

        let isCodeValid: boolean = false
        let usedCode: string | undefined

        user.recoveryCodes.forEach(code => {
            if (decryptData(code, process.env.OTP_SECRET || '') == recoveryCode) {
                isCodeValid = true
                usedCode = code
            }
        })

        if (isCodeValid) {
            // Invalidate the used recovery code
            user.recoveryCodes = user.recoveryCodes.filter(code => code !== usedCode);

            const { secret, qr_code } = await this.generateSecret(user.email);
            user.twoFactorSecret = encryptData(secret.base32, process.env.OTP_SECRET || '')
            await user.save()

            return { message: 'Account recovery successful.', secret: secret.base32, qrcodeUrl: qr_code }
        }

        return { message: "Invalid recovery code." };
    }

    async generateSecret(email: string) {
        const projectName = this.configService.get('projectName')
        const secret = speakeasy.generateSecret({
            issuer: projectName,
            otpauth_url: true,
            name: `${projectName}:${email}`
        });

        const qr_code = await qrcode.toDataURL(secret.otpauth_url)

        return { secret, qr_code }
    }
}
