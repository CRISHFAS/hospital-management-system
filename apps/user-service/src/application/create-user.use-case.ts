// apps/user-service/src/application/use-cases/create-user.use-case.ts
import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  password: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Crear nuevo usuario
    const user = new User(
      crypto.randomUUID(),
      dto.email,
      dto.firstName,
      dto.lastName,
      dto.role,
      new Date(),
      new Date()
    );

    return await this.userRepository.save(user);
  }
}