
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  role: UserRole;
  userName: string;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab, role, userName, onLogout, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'COBRADOR', 'CONSULTOR'] },
    { id: 'clients', label: 'Clientes', icon: '👥', roles: ['ADMIN', 'COBRADOR', 'CONSULTOR'] },
    { id: 'loans', label: 'Préstamos', icon: '💰', roles: ['ADMIN', 'COBRADOR'] },
    { id: 'payments', label: 'Pagos', icon: '💳', roles: ['ADMIN', 'COBRADOR'] },
    { id: 'funds', label: 'Fondos', icon: '🏦', roles: ['ADMIN'] },
    { id: 'admins', label: 'Usuarios Internos', icon: '🔐', roles: ['ADMIN'] },
    { id: 'automation', label: 'IA & Automatización', icon: '🤖', roles: ['ADMIN'] },
  ];

  return (
    <aside className={`
      fixed lg:static top-0 left-0 z-50 h-screen lg:h-full w-72 bg-slate-900 text-white flex flex-col shrink-0 transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      border-r border-slate-800
    `}>
      <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-amber-500 text-2xl tracking-tighter font-black">PIN</span>
          <span className="text-white text-xl tracking-tight font-light">TROLLEY</span>
        </h1>
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.filter(item => item.roles.includes(role)).map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`w-full text-left px-4 py-4 rounded-2xl flex items-center gap-4 transition-all ${
              currentTab === item.id 
                ? 'bg-amber-500 text-slate-900 font-black shadow-lg shadow-amber-500/20' 
                : 'hover:bg-slate-800 text-slate-400 font-medium'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4 shrink-0">
        <div className="bg-slate-800/40 p-4 rounded-[1.5rem] border border-slate-700/50">
          <p className="text-[9px] text-slate-500 mb-2 font-black uppercase tracking-widest">Identidad</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-900 text-xs font-black uppercase shadow-inner">
              {userName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate text-slate-100">{userName}</p>
              <p className="text-[9px] text-amber-500/80 font-black uppercase tracking-tighter">{role}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full text-left px-4 py-3 text-slate-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-3 group"
        >
          <span className="group-hover:scale-125 transition-transform">🚪</span> 
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
