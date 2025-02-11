import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.API_PORT || 9191);

  Logger.log(`🚀 http://localhost:${process.env.API_PORT}\n`, 'Bootstrap');
}

bootstrap().catch((err) => {
  console.error('Bootstrap Error:', err);
});
