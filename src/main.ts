import { NestFactory } from '@nestjs/core';
import * as process from 'node:process';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.API_PORT || 9191);
}

bootstrap().catch((err) => {
  console.error('Bootstrap Error:', err);
});
