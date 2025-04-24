import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setCache(key: string, value: any, ttl: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async getCache<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async delCache(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async clearCache(): Promise<void> {
    await this.cacheManager.clear();
  }

  async clearPatternCache(pattern: string): Promise<void> {
    // Intentamos recuperar el registro de claves para el patrón
    const keysRegistry =
      (await this.getCache<string[]>(`registry:${pattern}`)) || [];

    // Eliminamos cada clave registrada
    if (keysRegistry.length > 0) await this.cacheManager.mdel(keysRegistry);

    // Limpiamos el registro
    await this.delCache(`registry:${pattern}`);
  }

  async registerCacheKey(
    pattern: string,
    key: string,
    ttl: number,
  ): Promise<void> {
    const keysRegistry =
      (await this.getCache<string[]>(`registry:${pattern}`)) || [];

    if (!keysRegistry.includes(key)) {
      keysRegistry.push(key);
      await this.setCache(`registry:${pattern}`, keysRegistry, ttl);
    }
  }
}
