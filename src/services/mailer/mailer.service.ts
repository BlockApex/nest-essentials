import { Injectable } from '@nestjs/common';
import { MailerService as NodeMailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {

    constructor(
        private readonly mailerService: NodeMailerService,
        private readonly configService: ConfigService
    ) { }

    async sendInvitationEmail(email: string, token: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Invitation to Mento Airdrop',
            template: './invitation', // without the .hbs extension
            context: {
                name: email,
                verificationUrl: `${this.configService.get('baseURL')}?token=${token}`,
            },
        });
    }

    async sendPasswordResetEmail(email: string, token: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Password reset request',
            template: './forgot-password', // without the .hbs extension
            context: {
                name: email,
                verificationUrl: `${this.configService.get('baseURL')}?token=${token}`,
            },
        });
    }
}
