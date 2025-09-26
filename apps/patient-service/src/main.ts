// apps/user-service/src/main.ts y apps/patient-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS para el dominio de Vercel
  app.enableCors({
    origin: [
      'https://hospital-management-system-av8nrtqre-crishfas-projects.vercel.app',
      'http://localhost:3000',
      'https://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });
  
  const port = process.env.PORT || 10000;
  
  await app.listen(port);
  console.log(`🏥 HMS Service running on port ${port}`);
}

bootstrap();