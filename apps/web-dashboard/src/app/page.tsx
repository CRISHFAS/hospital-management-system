'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api';

export default function Dashboard() {
  const { user, loading, logout, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [services, setServices] = useState({ 
    user: 'checking', 
    patient: 'checking', 
    auth: 'checking' 
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (isAuthenticated) {
      checkServices();
    }
  }, [loading, isAuthenticated, router]);

  const checkServices = async () => {
    try {
      const userHealth = await ApiClient.checkHealth('user');
      const patientHealth = await ApiClient.checkHealth('patient');
      const authHealth = await ApiClient.checkHealth('auth');
      
      setServices({
        user: userHealth.status === 'OK' ? 'online' : 'offline',
        patient: patientHealth.status === 'OK' ? 'online' : 'offline',
        auth: authHealth.status === 'OK' ? 'online' : 'offline'
      });
    } catch (error) {
      setServices({ user: 'offline', patient: 'offline', auth: 'offline' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 bg-blue-600 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <ServiceStatus service="Auth Service" status={services.auth} />
              
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l">
                <div className="text-sm text-right">
                  <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                  <div className="text-gray-500 capitalize">{user?.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex space-x-8 mb-8">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </TabButton>
          {hasRole(['admin', 'receptionist']) && (
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
              Usuarios
            </TabButton>
          )}
          {hasRole(['admin', 'doctor', 'nurse', 'receptionist']) && (
            <TabButton active={activeTab === 'patients'} onClick={() => setActiveTab('patients')}>
              Pacientes
            </TabButton>
          )}
          {hasRole(['admin', 'doctor', 'receptionist']) && (
            <TabButton active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>
              Citas
            </TabButton>
          )}
        </nav>

        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'overview' && <OverviewTab services={services} user={user} />}
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

function OverviewTab({ services, user }: any) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Panel de Control</h2>
        <div className="text-right">
          <p className="text-sm text-gray-500">Bienvenido/a,</p>
          <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Servicios Activos" value="3" />
        <StatCard title="APIs Disponibles" value="15" />
        <StatCard title="Base de Datos" value="Online" />
        <StatCard title="Uptime" value="99.9%" />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <ServiceCard 
          name="User Service"
          status={services.user}
          endpoints={["GET /users", "POST /users", "GET /users/:id"]}
        />
        <ServiceCard 
          name="Patient Service"
          status={services.patient}
          endpoints={["GET /patients", "POST /patients", "GET /appointments"]}
        />
        <ServiceCard 
          name="Auth Service"
          status={services.auth}
          endpoints={["POST /auth/login", "POST /auth/register", "GET /auth/profile"]}
        />
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Permisos de tu rol ({user?.role})</h3>
        <div className="text-sm text-blue-800">
          {user?.role === 'admin' && 'Acceso completo a todas las funcionalidades del sistema'}
          {user?.role === 'doctor' && 'Acceso a pacientes, citas e información médica'}
          {user?.role === 'nurse' && 'Acceso a información de pacientes y asistencia médica'}
          {user?.role === 'receptionist' && 'Acceso a gestión de usuarios, pacientes y citas'}
          {user?.role === 'patient' && 'Acceso limitado a información personal y citas'}
        </div>
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
  const { hasRole } = useAuth();
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
      password: formData.get('password'), // NUEVO
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      role: formData.get('role')
    };

    try {
      const result = await ApiClient.register(userData); // Usar register en vez de createUser
      if (result.status === 'success') {
        alert('Usuario creado exitosamente');
        setShowForm(false);
        (e.target as HTMLFormElement).reset();
        loadUsers();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error de conexión');
    }
    
    setLoading(false);
  };

  if (!hasRole(['admin', 'receptionist'])) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
        {hasRole(['admin']) && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : 'Nuevo Usuario'}
          </button>
        )}
      </div>

      {showForm && hasRole(['admin']) && (
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
              <label className="block text-sm font-medium mb-2">Contraseña</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
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
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Rol</label>
              <select name="role" required className="w-full p-2 border rounded-md">
                <option value="doctor">Doctor</option>
                <option value="nurse">Enfermero/a</option>
                <option value="receptionist">Recepcionista</option>
                <option value="lab_technician">Técnico de Laboratorio</option>
                <option value="pharmacist">Farmacéutico</option>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user: any) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.first_name} {user.last_name}
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function PatientsTab() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Registro de Pacientes</h2>
      <p className="text-gray-600">Funcionalidad de gestión de pacientes.</p>
    </div>
  );
}

function AppointmentsTab() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Gestión de Citas</h2>
      <p className="text-gray-600">Funcionalidad de programación y gestión de citas médicas.</p>
    </div>
  );
}