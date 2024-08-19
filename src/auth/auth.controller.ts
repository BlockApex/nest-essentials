import { Body, Controller, HttpCode, HttpStatus, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, EmailDto, PasswordDto, UpdatePassDto } from './dto/auth.dto';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() authDto: AuthDto) {
        return await this.authService.register(authDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() authDto: AuthDto) {
        return await this.authService.login(authDto);
    }

    @UseGuards(AuthGuard)
    @Post('invite')
    async invite(@Body() emailDto: EmailDto) {
        return await this.authService.inviteAdmin(emailDto);
    }

    @UseGuards(AuthGuard)
    @Post('accept')
    async accept(@Request() req, @Body() passDto: PasswordDto) {
        return await this.authService.acceptInvite(req.user.email, passDto);
    }

    @UseGuards(AuthGuard)
    @Put('password')
    async password(@Request() req, @Body() updatePassDto: UpdatePassDto) {
        return await this.authService.updatePassword(req.user.email, updatePassDto);
    }

    @Post('password/forgot')
    async forgotPassword(@Body() emailDto: EmailDto) {
        return await this.authService.forgotPassword(emailDto);
    }

    @UseGuards(AuthGuard)
    @Put('password/reset')
    async resetPassword(@Request() req, @Body() passDto: PasswordDto) {
        return await this.authService.resetPassword(req.user.email, passDto);
    }

    // @Post('/2fa/setup')
    // @UseGuards(AuthGuard('jwt'))
    // async setupTwoFactorAuthentication(@Req() req: Request) {
    //   const user = req.user as AuthenticatorDto;

    //   const setup = await this.authService.setup2FA(user.userId, user.emailAddress);
    //   return { ...setup, message: 'Scan QR Code with Google Authenticator', };
    // }

    // @Post('/2fa/verify')
    // @UseGuards(AuthGuard('jwt'))
    // async verifyTwoFactorAuthentication(@Body() body: any, @Req() req: Request) {
    //   const { token } = body;
    //   const user = req.user as AuthenticatorDto;
    //   const verified = await this.authService.verify2FA(user.userId, token);
    //   if (verified) {
    //     return { message: 'OTP verified successfully' };
    //   } else {
    //     throw new Error('Invalid OTP');
    //   }
    // }

    // @Post('/2fa/disable')
    // @UseGuards(AuthGuard('jwt'))
    // async disableTwoFactorAuthentication(@Body() body: any, @Req() req: Request) {
    //   const user = req.user as AuthenticatorDto;
    //   const { token } = body

    //   return await this.authService.disable2FA(user.userId, token);
    // }

    // @Post('/2fa/recover')
    // @UseGuards(AuthGuard('jwt'))
    // async recoverAccount(@Body() body: any, @Req() req: Request) {
    //   const { recoveryCode } = body;
    //   const user = req.user as AuthenticatorDto;

    //   return await this.authService.recoverAccount(user.userId, recoveryCode);
    // }
}
