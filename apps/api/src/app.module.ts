import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { CategoryModule } from './category/category.module.js';

@Module({
  imports: [DatabaseModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
