/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Habilitar compresión
  app.use(compression());

  // Seguridad con configuración ajustada para Angular + Cloudflare
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://static.cloudflareinsights.com',
            'https://*.cloudflareinsights.com',
          ],
          scriptSrcElem: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://static.cloudflareinsights.com',
            'https://*.cloudflareinsights.com',
          ],
          styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          connectSrc: [
            "'self'",
            'https://danielarias.site',
            'wss://danielarias.site',
            'https://*.cloudflareinsights.com',
            'https://cloudflareinsights.com',
          ],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'", 'https:'],
          frameSrc: ["'self'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
  );

  // Configuración correcta de CORS
  app.enableCors({
    origin: [
      'https://danielarias.site',
      'http://localhost:4200',
      'https://www.danielarias.site',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Remover headers inseguros
  app.use((req, res, next) => {
    res.removeHeader('X-Powered-By');
    next();
  });

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Project Production Manager')
    .setDescription('API description')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  // Listen on port 3000 or the port specified in the environment variable
  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
