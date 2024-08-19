import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { MailerService } from 'src/services/mailer/mailer.service';
import { AuthUtils } from './auth.utils';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, AuthUtils, MailerService]
})
export class AuthModule { }
