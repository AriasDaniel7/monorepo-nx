import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@libs/common/entities';

import { UserService } from './user.service';
import { UserController } from './user.controller';

import { CacheManagerModule } from '../cache-manager/cache-manager.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    CacheManagerModule,
    RoleModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
