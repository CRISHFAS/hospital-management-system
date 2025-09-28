import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getServiceInfo() {
    return {
      service: 'HMS Auth Service',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        'GET /health': 'Health check',
        'POST /auth/login': 'User login',
        'POST /auth/register': 'User registration',
        'GET /auth/profile': 'Get user profile',
        'POST /auth/verify-token': 'Verify JWT token'
      }
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'HMS Auth Service'
    };
  }
}