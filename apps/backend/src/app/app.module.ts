import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { readFileSync } from 'fs';
import { join } from 'path';

import { UserModule } from '@user/user.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
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
