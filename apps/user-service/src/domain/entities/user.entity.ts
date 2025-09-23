// apps/user-service/src/domain/entities/user.entity.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly isActive: boolean = true
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isDoctor(): boolean {
    return this.role === UserRole.DOCTOR;
  }

  isPatient(): boolean {
    return this.role === UserRole.PATIENT;
  }
}

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  NURSE = 'nurse',
  RECEPTIONIST = 'receptionist',
  LAB_TECHNICIAN = 'lab_technician',
  PHARMACIST = 'pharmacist'
}