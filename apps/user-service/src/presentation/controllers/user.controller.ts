// apps/user-service/src/presentation/controllers/user.controller.ts
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CreateUserUseCase, CreateUserDto } from '../application/create-user.use-case';

@Controller('api/users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(dto);
    return {
      status: 'success',
      data: user,
      message: 'User created successfully'
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'HMS User Service'
    };
  }
}