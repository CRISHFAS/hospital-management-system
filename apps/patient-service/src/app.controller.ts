import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getServiceInfo() {
    return {
      service: 'HMS Patient Service',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        'GET /health': 'Health check',
        'GET /patients': 'List all patients',
        'POST /patients': 'Create patient',
        'GET /patients/:id': 'Get patient by ID',
        'PUT /patients/:id': 'Update patient',
        'POST /appointments': 'Create appointment',
        'GET /appointments': 'List all appointments',
        'GET /patients/:id/appointments': 'Get patient appointments'
      }
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'HMS Patient Service'
    };
  }

  // NUEVO: Listar todos los pacientes
  @Get('patients')
  getAllPatients(@Query('search') search?: string) {
    return this.appService.getAllPatients(search);
  }

  @Post('patients')
  createPatient(@Body() patientData: any) {
    return this.appService.createPatient(patientData);
  }

  @Get('patients/:id')
  getPatient(@Param('id') id: string) {
    return this.appService.getPatient(id);
  }

  @Put('patients/:id')
  updatePatient(@Param('id') id: string, @Body() updateData: any) {
    return this.appService.updatePatient(id, updateData);
  }

  // NUEVO: Listar todas las citas
  @Get('appointments')
  getAllAppointments() {
    return this.appService.getAllAppointments();
  }

  @Post('appointments')
  createAppointment(@Body() appointmentData: any) {
    return this.appService.createAppointment(appointmentData);
  }

  @Get('patients/:id/appointments')
  getPatientAppointments(@Param('id') patientId: string) {
    return this.appService.getPatientAppointments(patientId);
  }
}