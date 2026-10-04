import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { CategoryModule } from './category/category.module.js';
import { ProductModule } from './product/product.module.js';
import { MediaModule } from './media/media.module.js';
import { InquiryModule } from './inquiry/inquiry.module.js';
import { AuthenticationModule } from '@nestjs/authentication';
import { AuthModule } from './auth/auth.module.js';
import {
  MailModule,
  FileTemplateEngine,
  LogMailTransport,
  SmtpTransport,
} from '@nestjs/mail';
import { join } from 'node:path';
import { CartModule } from './cart/cart.module.js';
import { OrderModule } from './order/order.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    MailModule.forRootAsync({
      useFactory: () => ({
        transport: process.env.SMTP_URL
          ? new SmtpTransport({ url: process.env.SMTP_URL })
          : new LogMailTransport(),
        templates: new FileTemplateEngine({
          dir: join(import.meta.dirname, 'mail/templates'),
        }),
        from: process.env.MAIL_FROM ?? 'Accounts <accounts@example.com>',
      }),
    }),
    AuthenticationModule.forRootAsync({
      useFactory: () => ({
        session: {
          absoluteTtl: '14d',
          idleTtl: '3d',
        },
        emailVerification: { url: `${process.env.APP_URL}/verify-email` },
      }),
    }),
    AuthModule,
    DatabaseModule,
    MediaModule,
    CategoryModule,
    ProductModule,
    InquiryModule,
    CartModule,
    OrderModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
