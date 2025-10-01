// apps/web-dashboard/src/lib/api.ts

const USER_SERVICE_URL =
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  'https://hms-user-service.onrender.com';

const PATIENT_SERVICE_URL =
  process.env.NEXT_PUBLIC_PATIENT_SERVICE_URL ||
  'https://hms-patient-service.onrender.com';

const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
  'https://hms-auth-service.onrender.com';

export class ApiClient {
  static getAuthHeaders(): HeadersInit {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ======================
  // AUTH ENDPOINTS
  // ======================
  static async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  }

  static async register(userData: any) {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  }

  static async verifyToken() {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });
    return response.json();
  }

  // ======================
  // USERS
  // ======================
  static async createUser(userData: any) {
    try {
      const response = await fetch(`${USER_SERVICE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(userData),
      });
      return response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      const response = await fetch(`${USER_SERVICE_URL}/users`, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });
      return response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // ======================
  // PATIENTS
  // ======================
  static async createPatient(patientData: any) {
    try {
      const response = await fetch(`${PATIENT_SERVICE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(patientData),
      });
      return response.json();
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  static async getAllPatients(search?: string) {
    try {
      const url = new URL(`${PATIENT_SERVICE_URL}/patients`);
      if (search) url.searchParams.append('search', search);

      const response = await fetch(url.toString(), {
        headers: {
          ...this.getAuthHeaders(),
        },
      });
      return response.json();
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  // ======================
  // APPOINTMENTS
  // ======================
  static async getAllAppointments() {
    try {
      const response = await fetch(`${PATIENT_SERVICE_URL}/appointments`, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });
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
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(appointmentData),
      });
      return response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  // ======================
  // HEALTH CHECK
  // ======================
  static async checkHealth(service: 'user' | 'patient' | 'auth') {
    try {
      let url: string;
      switch (service) {
        case 'user':
          url = USER_SERVICE_URL;
          break;
        case 'patient':
          url = PATIENT_SERVICE_URL;
          break;
        case 'auth':
          url = AUTH_SERVICE_URL;
          break;
        default:
          throw new Error('Unknown service');
      }
      const response = await fetch(`${url}/health`);
      return response.json();
    } catch (error) {
      console.error(`Error checking ${service} service:`, error);
      return { status: 'offline' };
    }
  }
}