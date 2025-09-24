// apps/user-service/src/app.service.ts
import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AppService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  getHello(): string {
    return '🏥 HMS User Service - Hospital Management System API';
  }

  async createUser(userData: any) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role || 'patient',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      return {
        status: 'success',
        data,
        message: 'User created successfully'
      };
    } catch (error: any) {  // ← Fix aquí
      return {
        status: 'error',
        message: error?.message || 'Unknown error occurred'
      };
    }
  }
}