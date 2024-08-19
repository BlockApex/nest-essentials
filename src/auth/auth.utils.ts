import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserDocument } from "src/schemas/user.schema";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from "@nestjs/config";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthUtils {

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    generateToken = async (user: UserDocument): Promise<string> => {
        const payload = { sub: user.id, email: user.email };
        return await this.jwtService.signAsync(payload)
    }

    hashPassword = async (password: string): Promise<string> =>
        await bcrypt.hash(password, this.configService.get('salt'));

    verifyPassword = async (password: string, hashedPassword: string): Promise<void> => {
        const match = await bcrypt.compare(password, hashedPassword);

        if (!match) {
            throw new UnauthorizedException('Incorrect password');
        }
    }

    isOldPassword = (newPassword: string, oldHashes: string[]): void => {
        for (let oldHash of oldHashes) {
            if (bcrypt.compareSync(newPassword, oldHash)) {
                throw new BadRequestException('Cannot use an old password.')
            }
        }
    }
}