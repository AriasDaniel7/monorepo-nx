import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ServeStaticModule } from '@nestjs/serve-static';

import KeyvRedis, { RedisClientOptions } from '@keyv/redis';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Keyv } from 'keyv';
import { Cacheable } from 'cacheable';

import { CommonModule } from './common/common.module';
import { UserModule } from '@user/user.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'public', 'browser'),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        const redisOptions: RedisClientOptions = {
          password: configService.get<string>('REDIS_PASSWORD'),
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
            reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
          },
        };

        const secondary = new KeyvRedis(redisOptions);

        return {
          stores: [
            new Keyv({
              store: new Cacheable({ secondary, nonBlocking: true }),
            }),
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
    RoleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
