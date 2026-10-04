import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie-based auth sends session cookies cross-origin, so CORS must allow
  // credentials. Allowed origin(s) come from CORS_ORIGIN (comma-separated);
  // when unset, the request origin is reflected so local dev keeps working.
  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
          .map((origin) => origin.trim())
          .filter(Boolean)
      : true,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Phenomenal Art Gallery API')
    .setDescription(
      'The API documentation for the Phenomenal Art Gallery E-Commerce platform',
    )
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
