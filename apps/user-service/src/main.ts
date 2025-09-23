import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Get port from environment or default to 10000
  const port = process.env.PORT || 10000;
  
  await app.listen(port);
  console.log(`🚀 HMS User Service running on port ${port}`);
}

bootstrap();