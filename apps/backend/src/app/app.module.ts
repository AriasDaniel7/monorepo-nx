import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { checkServerIdentity } from 'tls';

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
                    configService.get('POSTGRESQL_CLIENT_CA_FILE')
                  )
                ).toString(),
                cert: readFileSync(
                  join(
                    certsPath,
                    configService.get('POSTGRESQL_CLIENT_CERT_FILE')
                  )
                ).toString(),
                key: readFileSync(
                  join(
                    certsPath,
                    configService.get('POSTGRESQL_CLIENT_KEY_FILE')
                  )
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
