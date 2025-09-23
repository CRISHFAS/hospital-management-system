// apps/user-service/src/domain/repositories/user.repository.ts
import { User } from '../entities/user.entity';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(filters?: UserFilters): Promise<User[]>;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}