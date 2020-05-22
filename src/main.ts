import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '@/app.module';
import cookieParser from 'cookie-parser';
import rateLimiter from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('/api');
  app.use(cookieParser());
  app.use(
    rateLimiter({
      windowMs: 10 * 60 * 1000, // 10 mins
      max: 150,
    }),
  );
  app.set('trust proxy', 1);
  await app.listen(3000);
}
bootstrap();
