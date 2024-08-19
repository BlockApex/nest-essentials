import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { TwoFaService } from './two-fa.service';

@Controller('2fa')
export class TwoFaController {

    constructor(
        private readonly twoFaService: TwoFaService
    ) { }

    @Post('setup')
    @UseGuards(AuthGuard)
    async setupTwoFactorAuthentication(@Req() req) {
        const user = req.user;

        const setup = await this.twoFaService.setup2FA(user.sub, user.email);
        return { ...setup, message: 'Scan QR Code with Google Authenticator', };
    }

    @Post('verify')
    @UseGuards(AuthGuard)
    async verifyTwoFactorAuthentication(@Body() body: any, @Req() req) {
        const { token } = body;
        const user = req.user;
        const verified = await this.twoFaService.verify2FA(user.sub, token);
        if (verified) {
            return { message: 'OTP verified successfully' };
        } else {
            throw new Error('Invalid OTP');
        }
    }

    @Post('disable')
    @UseGuards(AuthGuard)
    async disableTwoFactorAuthentication(@Body() body: any, @Req() req) {
        const user = req.user;
        const { token } = body

        return await this.twoFaService.disable2FA(user.sub, token);
    }

    @Post('recover')
    @UseGuards(AuthGuard)
    async recoverAccount(@Body() body: any, @Req() req) {
        const { recoveryCode } = body;
        const user = req.user;

        return await this.twoFaService.recoverAccount(user.sub, recoveryCode);
    }
}
