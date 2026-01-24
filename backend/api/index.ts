import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

let app: INestApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    // Enable CORS
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : ['http://localhost:3000', 'https://*.vercel.app'];
    
    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Check if origin matches allowed patterns
        const isAllowed = allowedOrigins.some(allowed => {
          if (allowed.includes('*')) {
            const pattern = allowed.replace('*', '.*');
            return new RegExp(pattern).test(origin);
          }
          return allowed === origin;
        });
        
        callback(null, isAllowed);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));

    // Global prefix for API
    app.setGlobalPrefix('api');

    await app.init();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
}

