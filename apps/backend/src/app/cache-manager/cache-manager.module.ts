import { Module } from '@nestjs/common';

import { CacheManagerService } from './cache-manager.service';

@Module({
  providers: [CacheManagerService],
  exports: [CacheManagerService],
})
export class CacheManagerModule {}
