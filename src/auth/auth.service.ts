import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthDto, EmailDto, PasswordDto, UpdatePassDto } from './dto/auth.dto';
import { MailerService } from 'src/services/mailer/mailer.service';
import { Role } from 'src/common/enums/role.enum';
import { User } from 'src/schemas/user.schema';
import { Status } from 'src/common/enums/status.enum';
import { AuthUtils } from './auth.utils';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly mailerService: MailerService,
        private readonly authUtils: AuthUtils
    ) {
        this.logger.verbose('AuthService initialized.');
    }

    login = async (authDto: AuthDto) => {
        // find user
        const user = await this.usersService.findOneByEmail(authDto.email);

        // verify password
        await this.authUtils.verifyPassword(authDto.password, user?.password)

        // generate jwt token
        return {
            access_token: await this.authUtils.generateToken(user)
        };
    }

    register = async (authDto: AuthDto) => {
        // hash password
        authDto.password = await this.authUtils.hashPassword(authDto.password)

        // add admin role and status
        const user: User = {
            ...authDto,
            roles: [Role.admin],
            status: Status.accepted
        }

        // create user
        const res = await this.usersService.createOne(user);

        // generate jwt token
        return {
            access_token: await this.authUtils.generateToken(res)
        };
    }

    inviteAdmin = async (emailDto: EmailDto) => {
        // create user
        const res = await this.usersService.createOne(emailDto);

        // generate jwt token
        const access_token = await this.authUtils.generateToken(res)

        // send email to user
        this.mailerService.sendInvitationEmail(emailDto.email, access_token)

        // send response
        return { message: "Invitation sent successfully." };
    }

    acceptInvite = async (email: string, passDto: PasswordDto) => {
        // check if invite exists
        const user = await this.usersService.findOneByEmail(email);

        if (user.status !== Status.invited) {
            throw new BadRequestException('User has not been invited.')
        }

        // hash password
        // update role and status
        const updatedUser: User = {
            email,
            password: await this.authUtils.hashPassword(passDto.password),
            roles: [Role.admin],
            status: Status.accepted
        }

        const res = await this.usersService.updateByEmail(email, updatedUser)

        // generate jwt token
        return {
            access_token: await this.authUtils.generateToken(res)
        };
    }

    updatePassword = async (email: string, updatePassDto: UpdatePassDto) => {
        // get user
        const user = await this.usersService.findOneByEmail(email);

        // verify password
        await this.authUtils.verifyPassword(updatePassDto.password, user?.password)

        // check if new password exists in old passwords
        this.authUtils.isOldPassword(updatePassDto.newPassword, user?.oldPasswords)

        // store old password
        const oldPasswords = [...user.oldPasswords, user?.password]

        // update password
        const updatedUser: User = {
            email,
            password: await this.authUtils.hashPassword(updatePassDto.newPassword),
            oldPasswords
        }

        const res = await this.usersService.updateByEmail(email, updatedUser)

        // generate jwt token
        return {
            access_token: await this.authUtils.generateToken(res)
        };
    }

    forgotPassword = async (emailDto: EmailDto) => {
        // check if user exists
        const user = await this.usersService.findOneByEmail(emailDto.email);

        // generate jwt token
        const access_token = await this.authUtils.generateToken(user)

        // send email to user
        this.mailerService.sendPasswordResetEmail(emailDto.email, access_token)

        // send response
        return { message: "Recovery email sent successfully." };
    }

    resetPassword = async (email: string, passDto: PasswordDto) => {
        // get user
        const user = await this.usersService.findOneByEmail(email);

        // check if new password exists in old passwords
        this.authUtils.isOldPassword(passDto.password, user?.oldPasswords)

        // store old password
        const oldPasswords = [...user.oldPasswords, user?.password]

        // update password
        const updatedUser: User = {
            email,
            password: await this.authUtils.hashPassword(passDto.password),
            oldPasswords
        }

        const res = await this.usersService.updateByEmail(email, updatedUser)

        // generate jwt token
        return {
            access_token: await this.authUtils.generateToken(res)
        };
    }
}
