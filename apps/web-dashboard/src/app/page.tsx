'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [services, setServices] = useState({ user: 'checking', patient: 'checking' });

  useEffect(() => {
    checkServices();
  }, []);

  const checkServices = async () => {
    try {
      const userHealth = await ApiClient.checkHealth('user');
      const patientHealth = await ApiClient.checkHealth('patient');
      
      setServices({
        user: userHealth.status === 'OK' ? 'online' : 'offline',
        patient: patientHealth.status === 'OK' ? 'online' : 'offline'
      });
    } catch (error) {
      setServices({ user: 'offline', patient: 'offline' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                HMS
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Hospital Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ServiceStatus service="User Service" status={services.user} />
              <ServiceStatus service="Patient Service" status={services.patient} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <nav className="flex space-x-8 mb-8">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </TabButton>
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            Usuarios
          </TabButton>
          <TabButton active={activeTab === 'patients'} onClick={() => setActiveTab('patients')}>
            Pacientes
          </TabButton>
          <TabButton active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>
            Citas
          </TabButton>
        </nav>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'overview' && <OverviewTab services={services} />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'patients' && <PatientsTab />}
          {activeTab === 'appointments' && <AppointmentsTab />}
        </div>
      </div>
    </div>
  );
}

function ServiceStatus({ service, status }: { service: string; status: string }) {
  const statusColor = {
    online: 'bg-green-100 text-green-800',
    offline: 'bg-red-100 text-red-800',
    checking: 'bg-yellow-100 text-yellow-800'
  }[status];

  return (
    <div className={`px-3 py-1 rounded-full text-sm ${statusColor}`}>
      {service}: {status}
    </div>
  );
}

function TabButton({ children, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 border-b-2 font-medium text-sm ${
        active
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function OverviewTab({ services }: any) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Panel de Control</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Servicios Activos" value="2" />
        <StatCard title="APIs Disponibles" value="12" />
        <StatCard title="Base de Datos" value="Online" />
        <StatCard title="Uptime" value="99.9%" />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <ServiceCard 
          name="User Service"
          status={services.user}
          endpoints={["GET /users", "POST /users", "GET /users/:id", "GET /health"]}
        />
        <ServiceCard 
          name="Patient Service"
          status={services.patient}
          endpoints={["GET /patients", "POST /patients", "GET /appointments", "POST /appointments"]}
        />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function ServiceCard({ name, status, endpoints }: any) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold">{name}</h4>
        <span className={`px-2 py-1 rounded text-xs ${
          status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      </div>
      <div className="space-y-1">
        {endpoints.map((endpoint: string, index: number) => (
          <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
            {endpoint}
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const result = await ApiClient.getAllUsers();
      if (result.status === 'success') {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const userData = {
      email: formData.get('email'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      role: formData.get('role')
    };

    try {
      const result = await ApiClient.createUser(userData);
      if (result.status === 'success') {
        alert('Usuario creado exitosamente');
        setShowForm(false);
        (e.target as HTMLFormElement).reset();
        loadUsers(); // Recargar la lista
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error de conexión');
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Nuevo Usuario'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <input
                type="text"
                name="firstName"
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Apellido</label>
              <input
                type="text"
                name="lastName"
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rol</label>
              <select name="role" required className="w-full p-2 border rounded-md">
                <option value="doctor">Doctor</option>
                <option value="nurse">Enfermero/a</option>
                <option value="receptionist">Recepcionista</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Usuario'}
          </button>
        </form>
      )}

      {/* Lista de usuarios */}
      <div className="bg-white border rounded-lg">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Lista de Usuarios</h3>
        </div>
        <div className="overflow-x-auto">
          {loadingUsers ? (
            <div className="p-4 text-center">Cargando usuarios...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user: any) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loadingUsers && users.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No hay usuarios registrados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PatientsTab() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async (searchTerm?: string) => {
    try {
      setLoadingPatients(true);
      const result = await ApiClient.getAllPatients(searchTerm);
      if (result.status === 'success') {
        setPatients(result.data);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPatients(search);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const patientData = {
      email: formData.get('email'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      dateOfBirth: formData.get('dateOfBirth'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      bloodType: formData.get('bloodType'),
      allergies: (formData.get('allergies') as string)?.split(',').map(a => a.trim()).filter(a => a) || []
    };

    try {
      const result = await ApiClient.createPatient(patientData);
      if (result.status === 'success') {
        alert('Paciente registrado exitosamente');
        setShowForm(false);
        (e.target as HTMLFormElement).reset();
        loadPatients();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error de conexión');
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Registro de Pacientes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          {showForm ? 'Cancelar' : 'Nuevo Paciente'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <input
                type="text"
                name="firstName"
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Apellido</label>
              <input
                type="text"
                name="lastName"
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha de Nacimiento</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Teléfono</label>
              <input
                type="tel"
                name="phone"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Sangre</label>
              <select name="bloodType" className="w-full p-2 border rounded-md">
                <option value="">Seleccionar</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Dirección</label>
              <textarea
                name="address"
                rows={2}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Alergias (separadas por comas)</label>
              <input
                type="text"
                name="allergies"
                placeholder="penicilina, mariscos..."
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrar Paciente'}
          </button>
        </form>
      )}

      {/* Lista de pacientes */}
      <div className="bg-white border rounded-lg">
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Lista de Pacientes</h3>
            <form onSubmit={handleSearch} className="flex space-x-2">
              <input
                type="text"
                placeholder="Buscar pacientes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
              >
                Buscar
              </button>
            </form>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loadingPatients ? (
            <div className="p-4 text-center">Cargando pacientes...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Historia Clínica</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo de Sangre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient: any) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {patient.users?.first_name} {patient.users?.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.users?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.medical_record_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.phone || 'No especificado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {patient.blood_type || 'No especificado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loadingPatients && patients.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No hay pacientes registrados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentsTab() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    loadAppointments();
    loadUsers();
    loadPatients();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const result = await ApiClient.getAllAppointments();
      if (result.status === 'success') {
        setAppointments(result.data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await ApiClient.getAllUsers();
      if (result.status === 'success') {
        setUsers(result.data.filter((user: any) => user.role === 'doctor'));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const result = await ApiClient.getAllPatients();
      if (result.status === 'success') {
        setPatients(result.data);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const appointmentData = {
      patientId: formData.get('patientId'),
      doctorId: formData.get('doctorId'),
      appointmentDate: formData.get('appointmentDate'),
      notes: formData.get('notes')
    };

    try {
      const result = await ApiClient.createAppointment(appointmentData);
      if (result.status === 'success') {
        alert('Cita creada exitosamente');
        setShowForm(false);
        (e.target as HTMLFormElement).reset();
        loadAppointments();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error de conexión');
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestión de Citas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          {showForm ? 'Cancelar' : 'Nueva Cita'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Paciente</label>
              <select name="patientId" required className="w-full p-2 border rounded-md">
                <option value="">Seleccionar paciente</option>
                {patients.map((patient: any) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.users?.first_name} {patient.users?.last_name} - {patient.medical_record_number}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Doctor</label>
              <select name="doctorId" required className="w-full p-2 border rounded-md">
                <option value="">Seleccionar doctor</option>
                {users.map((doctor: any) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.first_name} {doctor.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Fecha y Hora de la Cita</label>
              <input
                type="datetime-local"
                name="appointmentDate"
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Notas</label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Motivo de la consulta, síntomas, etc."
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Programando...' : 'Programar Cita'}
          </button>
        </form>
      )}

      {/* Lista de citas */}
      <div className="bg-white border rounded-lg">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Lista de Citas</h3>
        </div>
        <div className="overflow-x-auto">
          {loadingAppointments ? (
            <div className="p-4 text-center">Cargando citas...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha y Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment: any) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {appointment.patient?.users?.first_name} {appointment.patient?.users?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.patient?.medical_record_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        Dr. {appointment.doctor?.first_name} {appointment.doctor?.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(appointment.appointment_date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.notes || 'Sin notas'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loadingAppointments && appointments.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No hay citas programadas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}