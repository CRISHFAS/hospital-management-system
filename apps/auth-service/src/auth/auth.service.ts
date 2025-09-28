import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  constructor(private jwtService: JwtService) {}

  async register(registerDto: RegisterDto) {
    try {
      // Verificar si el usuario ya existe
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', registerDto.email)
        .single();

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Crear usuario
      const { data: user, error } = await this.supabase
        .from('users')
        .insert({
          email: registerDto.email,
          first_name: registerDto.firstName,
          last_name: registerDto.lastName,
          role: registerDto.role,
          password: hashedPassword,
          is_active: true
        })
        .select('id, email, first_name, last_name, role, created_at')
        .single();

      if (error) throw error;

      // Generar JWT
      const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      };

      return {
        status: 'success',
        data: {
          user,
          access_token: this.jwtService.sign(payload),
          expires_in: '7d'
        },
        message: 'User registered successfully'
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Registration failed'
      };
    }
  }

  async login(loginDto: LoginDto) {
    try {
      // Buscar usuario
      const { data: user, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', loginDto.email)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generar JWT
      const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      };

      // Actualizar último login
      await this.supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      return {
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role
          },
          access_token: this.jwtService.sign(payload),
          expires_in: '7d'
        },
        message: 'Login successful'
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Login failed'
      };
    }
  }

  async validateUser(payload: any) {
    const { data: user } = await this.supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('id', payload.sub)
      .eq('is_active', true)
      .single();

    return user;
  }

  async getProfile(userId: string) {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('id, email, first_name, last_name, role, created_at, last_login')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        status: 'success',
        data: user,
        message: 'Profile retrieved successfully'
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Failed to get profile'
      };
    }
  }
}