import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { CacheManagerModule } from '../cache-manager/cache-manager.module';

import { Role } from '@libs/common/entities';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Role]), CacheManagerModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [TypeOrmModule],
})
export class RoleModule {}
