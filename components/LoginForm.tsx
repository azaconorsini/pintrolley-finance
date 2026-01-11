
import React, { useState } from 'react';
import { AdminUser } from '../types';

interface LoginFormProps {
  admins: AdminUser[];
  onLogin: (user: AdminUser) => void;
  onGoToPortal: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ admins, onLogin, onGoToPortal }) => {
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'CLIENT'>('ADMIN');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const user = admins.find(u => 
        (u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase()) && 
        u.password === password
      );

      if (user) {
        onLogin(user);
      } else {
        setError('Credenciales incorrectas. Verifique sus datos.');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-amber-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500">
        {isLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-900 font-black text-xs uppercase tracking-widest">Autenticando...</p>
          </div>
        )}

        <div className="p-10 text-center bg-slate-50/50 border-b border-slate-100">
          <div className="flex justify-center items-center gap-1 mb-2">
            <span className="text-4xl font-black text-amber-500 tracking-tighter">PIN</span>
            <span className="text-4xl font-light text-slate-900 tracking-tight">TROLLEY</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Fintech Suite v3.1</p>
        </div>

        {/* Tabs de Selección */}
        <div className="flex p-2 bg-slate-100 mx-10 mt-8 rounded-[1.5rem]">
          <button 
            onClick={() => { setActiveTab('ADMIN'); setError(''); }}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${
              activeTab === 'ADMIN' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Login Admin
          </button>
          <button 
            onClick={() => { setActiveTab('CLIENT'); setError(''); }}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${
              activeTab === 'CLIENT' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Clientes
          </button>
        </div>

        <div className="p-10 min-h-[340px] flex flex-col justify-center">
          {activeTab === 'ADMIN' ? (
            <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-left-4 duration-300">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Usuario o Email</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold"
                  placeholder="admin"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
                <input 
                  type="password" 
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake duration-300">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black shadow-2xl hover:bg-slate-800 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs mt-4"
              >
                ENTRAR AL SISTEMA
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto shadow-inner">
                🏦
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Acceso a Beneficiarios</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Solicita tu crédito online, consulta tus abonos y el estado de tu deuda en tiempo real.
                </p>
              </div>
              <button 
                onClick={onGoToPortal}
                className="w-full bg-amber-500 text-slate-900 py-6 rounded-[2rem] font-black shadow-2xl shadow-amber-500/30 hover:bg-amber-400 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm"
              >
                IR AL PORTAL PÚBLICO
              </button>
            </div>
          )}
        </div>
        
        <div className="pb-8 text-center">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">Pintrolley Infrastructure © 2024</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
