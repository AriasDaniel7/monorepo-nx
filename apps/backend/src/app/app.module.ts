import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

import { readFileSync } from 'fs';
import { join } from 'path';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';

import { CommonModule } from './common/common.module';
import { UserModule } from '@user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const redisPassword = configService.get<string>('REDIS_PASSWORD');
        const redisUrl = `redis://:${redisPassword}@${configService.get<string>('REDIS_HOST')}:${configService.get<number>('REDIS_PORT')}`;

        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            createKeyv(redisUrl),
          ],
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const certsPath = join(__dirname, '..', '..', '..', 'certs');

        const sslConfig =
          configService.get('POSTGRESQL_ENABLE_TLS') === 'yes'
            ? {
                ca: readFileSync(
                  join(
                    certsPath,
                    configService.get('POSTGRESQL_CLIENT_CA_FILE'),
                  ),
                ).toString(),
                cert: readFileSync(
                  join(
                    certsPath,
                    configService.get('POSTGRESQL_CLIENT_CERT_FILE'),
                  ),
                ).toString(),
                key: readFileSync(
                  join(
                    certsPath,
                    configService.get('POSTGRESQL_CLIENT_KEY_FILE'),
                  ),
                ).toString(),
                rejectUnauthorized: true,
                checkServerIdentity: () => undefined, //TODO: Quitar en producción - solo es para evitar que se indentifique como localhost
              }
            : false;

        return {
          type: 'postgres',
          host: configService.get('POSTGRES_HOST'),
          port: +configService.get('POSTGRES_PORT'),
          username: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          database: configService.get('POSTGRES_DB'),
          autoLoadEntities: true,
          synchronize: true,
          ssl: sslConfig,
        };
      },
    }),
    UserModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
