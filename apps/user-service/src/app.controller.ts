import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'HMS User Service'
    };
  }

  @Post('users')
  createUser(@Body() userData: any) {
    return this.appService.createUser(userData);
  }

  // NUEVO: Listar todos los usuarios
  @Get('users')
  getAllUsers() {
    return this.appService.getAllUsers();
  }

  // NUEVO: Obtener usuario por ID
  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.appService.getUser(id);
  }
}