
import React, { useState } from 'react';
import { AdminUser, AppState, UserRole } from '../types';

interface AdminManagerProps {
  state: AppState;
  onAddAdmin: (admin: AdminUser) => void;
  onDeleteAdmin: (id: string) => void;
}

const AdminManager: React.FC<AdminManagerProps> = ({ state, onAddAdmin, onDeleteAdmin }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState<Partial<AdminUser>>({ role: 'CONSULTOR' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdmin.name && newAdmin.username && newAdmin.email && newAdmin.password) {
      const exists = state.admins.some(a => 
        a.username.toLowerCase() === newAdmin.username?.toLowerCase() || 
        a.email.toLowerCase() === newAdmin.email?.toLowerCase()
      );

      if (exists) {
        alert("El nombre de usuario o email ya está en uso por otro miembro del equipo.");
        return;
      }

      onAddAdmin({
        ...newAdmin as AdminUser,
        id: `a${Date.now()}`
      });
      setModalOpen(false);
      setNewAdmin({ role: 'CONSULTOR' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Administradores</h2>
          <p className="text-slate-500">Gestión de usuarios con acceso al sistema</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <span>👤+</span> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Nombre</th>
              <th className="p-4 font-semibold text-slate-600">Usuario</th>
              <th className="p-4 font-semibold text-slate-600">Email</th>
              <th className="p-4 font-semibold text-slate-600">Rol</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {state.admins.map(admin => (
              <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium">{admin.name}</td>
                <td className="p-4 text-slate-700 font-semibold">@{admin.username}</td>
                <td className="p-4 text-slate-500">{admin.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    admin.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    admin.role === 'COBRADOR' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {admin.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {admin.id !== 'a1' && (
                    <button 
                      onClick={() => onDeleteAdmin(admin.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-bold"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Crear Usuario Interno</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Nombre Completo</label>
                <input required className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500" onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Nombre de Usuario (@)</label>
                <input required className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="ej: jdoe" onChange={e => setNewAdmin({...newAdmin, username: e.target.value.toLowerCase().replace(/\s/g, '')})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
                <input type="email" required className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="ejemplo@fintech.com" onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Contraseña</label>
                <input type="password" required className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500" onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Rol de Acceso</label>
                <select className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500" onChange={e => setNewAdmin({...newAdmin, role: e.target.value as UserRole})}>
                  <option value="CONSULTOR">Consultor</option>
                  <option value="COBRADOR">Cobrador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 border rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-bold shadow-lg">Guardar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManager;
