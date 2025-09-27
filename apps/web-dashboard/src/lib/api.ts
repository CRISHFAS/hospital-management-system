const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'https://hms-user-service.onrender.com';
const PATIENT_SERVICE_URL = process.env.NEXT_PUBLIC_PATIENT_SERVICE_URL || 'https://hms-patient-service.onrender.com';

export class ApiClient {
  static async createUser(userData: any) {
    try {
      const response = await fetch(`${USER_SERVICE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // NUEVO: Obtener todos los usuarios
  static async getAllUsers() {
    try {
      const response = await fetch(`${USER_SERVICE_URL}/users`);
      return response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async createPatient(patientData: any) {
    try {
      const response = await fetch(`${PATIENT_SERVICE_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
      return response.json();
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  // NUEVO: Obtener todos los pacientes
  static async getAllPatients(search?: string) {
    try {
      const url = new URL(`${PATIENT_SERVICE_URL}/patients`);
      if (search) url.searchParams.append('search', search);
      
      const response = await fetch(url.toString());
      return response.json();
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  // NUEVO: Obtener todas las citas
  static async getAllAppointments() {
    try {
      const response = await fetch(`${PATIENT_SERVICE_URL}/appointments`);
      return response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  static async createAppointment(appointmentData: any) {
    try {
      const response = await fetch(`${PATIENT_SERVICE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });
      return response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  static async checkHealth(service: 'user' | 'patient') {
    try {
      const url = service === 'user' ? USER_SERVICE_URL : PATIENT_SERVICE_URL;
      const response = await fetch(`${url}/health`);
      return response.json();
    } catch (error) {
      console.error(`Error checking ${service} service:`, error);
      return { status: 'offline' };
    }
  }
}