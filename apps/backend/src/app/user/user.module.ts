import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CommonModule } from '@common/common.module';
import { RoleModule } from '@role/role.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    CommonModule,
    RoleModule,
  ],
  controllers: [UserController],
  providers: [UserService, TypeOrmModule],
})
export class UserModule {}
