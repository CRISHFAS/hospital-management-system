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
        </nav>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'overview' && <OverviewTab services={services} />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'patients' && <PatientsTab />}
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
    <div>
      <h2 className="text-xl font-semibold mb-6">Panel de Control</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Servicios Activos" value="2" />
        <StatCard title="APIs Disponibles" value="8" />
        <StatCard title="Base de Datos" value="Online" />
        <StatCard title="Uptime" value="99.9%" />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <ServiceCard 
          name="User Service"
          status={services.user}
          endpoints={["POST /users", "GET /users/:id", "GET /health"]}
        />
        <ServiceCard 
          name="Patient Service"
          status={services.patient}
          endpoints={["POST /patients", "POST /appointments", "GET /patients/:id"]}
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
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error de conexión');
    }
    
    setLoading(false);
  };

  return (
    <div>
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
    </div>
  );
}

function PatientsTab() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

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
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error de conexión');
    }
    
    setLoading(false);
  };

  return (
    <div>
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
    </div>
  );
}