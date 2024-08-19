import { Module } from '@nestjs/common';
import { TwoFaController } from './two-fa.controller';
import { TwoFaService } from './two-fa.service';
import { TwoFaUtils } from './two-fa.utils';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [TwoFaController],
  providers: [TwoFaService, TwoFaUtils]
})
export class TwoFaModule { }
