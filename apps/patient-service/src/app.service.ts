import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  async createPatient(patientData: any) {
    try {
      // Crear entrada en la tabla users primero
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .insert({
          email: patientData.email,
          first_name: patientData.firstName,
          last_name: patientData.lastName,
          role: 'patient',
          is_active: true
        })
        .select()
        .single();

      if (userError) throw userError;

      // Crear entrada específica de paciente
      const { data: patientRecord, error: patientError } = await this.supabase
        .from('patients')
        .insert({
          id: uuidv4(),
          user_id: userData.id,
          medical_record_number: `MR${Date.now()}`,
          date_of_birth: patientData.dateOfBirth,
          phone: patientData.phone,
          address: patientData.address,
          blood_type: patientData.bloodType,
          allergies: patientData.allergies || []
        })
        .select()
        .single();

      if (patientError) throw patientError;

      return {
        status: 'success',
        data: {
          user: userData,
          patient: patientRecord
        },
        message: 'Patient created successfully'
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Failed to create patient'
      };
    }
  }

  async getPatient(id: string) {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .select(`
          *,
          users:user_id (
            id,
            email,
            first_name,
            last_name,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        status: 'success',
        data,
        message: 'Patient retrieved successfully'
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Patient not found'
      };
    }
  }

  async updatePatient(id: string, updateData: any) {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .update({
          phone: updateData.phone,
          address: updateData.address,
          blood_type: updateData.bloodType,
          allergies: updateData.allergies,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        status: 'success',
        data,
        message: 'Patient updated successfully'
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Failed to update patient'
      };
    }
  }

  async createAppointment(appointmentData: any) {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .insert({
          id: uuidv4(),
          patient_id: appointmentData.patientId,
          doctor_id: appointmentData.doctorId,
          appointment_date: appointmentData.appointmentDate,
          status: 'scheduled',
          notes: appointmentData.notes || ''
        })
        .select()
        .single();

      if (error) throw error;

      return {
        status: 'success',
        data,
        message: 'Appointment created successfully'
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Failed to create appointment'
      };
    }
  }

  async getPatientAppointments(patientId: string) {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctor_id (
            first_name,
            last_name
          )
        `)
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      return {
        status: 'success',
        data,
        message: 'Appointments retrieved successfully'
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Failed to retrieve appointments'
      };
    }
  }
}