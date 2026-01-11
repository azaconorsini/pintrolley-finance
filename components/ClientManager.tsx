
import React, { useState } from 'react';
import { Client, AppState } from '../types';

interface ClientManagerProps {
  state: AppState;
  addClient: (c: Client) => void;
  deleteClient: (id: string) => void;
  onSelectClient: (c: Client) => void;
}

const ClientManager: React.FC<ClientManagerProps> = ({ state, addClient, deleteClient, onSelectClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({ 
    status: 'ACTIVE',
    email: '',
    address: '',
    phone: '',
    name: '',
    nationalId: '',
    username: ''
  });

  const filteredClients = state.clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nationalId.includes(searchTerm) ||
    c.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClient.name && newClient.nationalId) {
      addClient({
        ...newClient as Client,
        id: `c${Date.now()}`,
        username: newClient.username || newClient.nationalId,
        registrationDate: new Date().toISOString().split('T')[0]
      });
      setModalOpen(false);
      setNewClient({ status: 'ACTIVE', email: '', address: '', phone: '', name: '', nationalId: '', username: '' });
    }
  };

  const handleConfirmDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Forzamos un pequeño delay para asegurar que el thread de UI esté libre
    setTimeout(() => {
      deleteClient(id);
    }, 10);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Expedientes</h2>
          <p className="text-slate-500 font-medium">Administración de la base de clientes</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all active:scale-95"
        >
          <span>👤+</span> Nuevo Registro
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="relative mb-8">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-xl">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por nombre, ID o usuario..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-2">Cliente</th>
                <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-2">Identificación</th>
                <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-2 text-center">Estado</th>
                <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="py-5 px-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg shadow-sm border border-amber-200/20">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{client.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">@{client.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-2 font-black text-xs text-slate-500">{client.nationalId}</td>
                  <td className="py-5 px-2 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                      client.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {client.status === 'ACTIVE' ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td className="py-5 px-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => onSelectClient(client)}
                        className="p-3 rounded-xl bg-slate-50 text-slate-900 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleConfirmDelete(e, client.id, client.name)}
                        className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Eliminar permanentemente"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredClients.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
              <span className="text-4xl mb-4 opacity-20">👥</span>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay resultados para tu búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 animate-in zoom-in duration-200 border border-slate-200 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Nuevo Registro</h3>
              <button onClick={() => setModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
                <input 
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-amber-500 font-bold text-sm"
                  placeholder="Ej: Maria Lopez"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">ID Nacional</label>
                  <input 
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-amber-500 font-bold text-sm"
                    placeholder="102030..."
                    value={newClient.nationalId}
                    onChange={(e) => setNewClient({...newClient, nationalId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Usuario</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-amber-500 font-bold text-sm"
                    placeholder="mlopez"
                    value={newClient.username}
                    onChange={(e) => setNewClient({...newClient, username: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Teléfono Celular</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-amber-500 font-bold text-sm"
                    placeholder="+57..."
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail</label>
                  <input 
                    type="email"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-amber-500 font-bold text-sm"
                    placeholder="maria@ejemplo.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Dirección Física</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-amber-500 font-bold text-sm"
                  placeholder="Calle 123 #45-67..."
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs mt-4">
                Guardar Cliente en Base
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;
