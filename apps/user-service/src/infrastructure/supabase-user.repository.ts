// apps/user-service/src/infrastructure/repositories/supabase-user.repository.ts
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User } from '../../domain/entities/user.entity';
import { UserRepository, UserFilters } from '../../domain/repositories/user.repository';

@Injectable()
export class SupabaseUserRepository implements UserRepository {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async save(user: User): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
        is_active: user.isActive
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToEntity(data);
  }

  private mapToEntity(data: any): User {
    return new User(
      data.id,
      data.email,
      data.first_name,
      data.last_name,
      data.role,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.is_active
    );
  }

  // Implementar otros métodos...
  async update(id: string, updates: Partial<User>): Promise<User> {
    // Implementation...
    throw new Error('Not implemented yet');
  }

  async delete(id: string): Promise<void> {
    // Implementation...
    throw new Error('Not implemented yet');
  }

  async findAll(filters?: UserFilters): Promise<User[]> {
    // Implementation...
    throw new Error('Not implemented yet');
  }
}