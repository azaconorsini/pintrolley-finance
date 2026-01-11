
import React, { useState } from 'react';
import { AppState, LoanRequest, Client } from '../types';

interface ClientPortalProps {
  state: AppState;
  onGoBack: () => void;
  onRegisterClient: (client: Client) => void;
  onSubmitRequest: (request: LoanRequest) => void;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ state, onGoBack, onRegisterClient, onSubmitRequest }) => {
  const [view, setView] = useState<'ID_CHECK' | 'FORM' | 'STATUS'>('ID_CHECK');
  const [nationalId, setNationalId] = useState('');
  const [foundClient, setFoundClient] = useState<Client | null>(null);
  
  // Form fields
  const [amount, setAmount] = useState<number>(0);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const client = state.clients.find(c => c.nationalId === nationalId || c.username === nationalId);
    if (client) {
      setFoundClient(client);
      setName(client.name);
      setEmail(client.email);
      setPhone(client.phone);
      setUsername(client.username);
      setAddress(client.address);
    } else {
      setFoundClient(null);
    }
    setView('FORM');
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!foundClient) {
      const newClient: Client = {
        id: `c${Date.now()}`,
        nationalId: nationalId,
        username: username || nationalId,
        name,
        email,
        phone,
        address: address || 'No especificada',
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
      };
      onRegisterClient(newClient);
    }

    const request: LoanRequest = {
      id: `req${Date.now()}`,
      nationalId,
      name,
      email,
      phone,
      amount,
      date: new Date().toISOString(),
      status: 'PENDING'
    };
    
    setTimeout(() => {
      onSubmitRequest(request);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const clientRequests = state.loanRequests.filter(r => 
    r.nationalId === nationalId || (foundClient && r.nationalId === foundClient.nationalId)
  );

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 text-center">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full border-t-[12px] border-[#f59e0b]">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">✓</div>
          <h2 className="text-3xl font-black text-[#0f172a] mb-4 tracking-tighter">¡Solicitud Enviada!</h2>
          <p className="text-slate-500 mb-8 font-medium leading-relaxed">
            Hola <span className="text-[#0f172a] font-bold">{name.split(' ')[0]}</span>. Hemos recibido tu petición por <span className="text-[#f59e0b] font-black">${amount.toLocaleString()}</span>. 
            El administrador ha sido notificado automáticamente vía email.
          </p>
          <button 
            onClick={onGoBack} 
            className="w-full py-5 bg-[#0f172a] text-white rounded-2xl font-black shadow-xl uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-800 animate-in fade-in zoom-in duration-500">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <button onClick={onGoBack} className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-[#f59e0b] transition-colors">← Salir</button>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black text-[#f59e0b] tracking-tighter">PIN</span>
            <span className="text-2xl font-light text-[#0f172a] tracking-tight">TROLLEY</span>
          </div>
        </div>

        <div className="p-10">
          {view === 'ID_CHECK' ? (
            <div className="space-y-8 text-center">
              <div>
                <h2 className="text-4xl font-black text-[#0f172a] leading-none tracking-tighter mb-4">Solicita tu crédito</h2>
                <p className="text-slate-500 text-sm font-medium">Ingresa tu ID o Usuario para verificar tu perfil o registrarte.</p>
              </div>
              <form onSubmit={handleCheck} className="space-y-4">
                <input 
                  required
                  type="text"
                  className="w-full p-6 bg-slate-100 border-2 border-transparent rounded-[2rem] outline-none focus:border-[#f59e0b] text-center text-2xl font-black placeholder:text-slate-300 transition-all"
                  placeholder="ID o Usuario"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                />
                <button type="submit" className="w-full py-6 bg-[#f59e0b] text-[#0f172a] rounded-[2rem] font-black shadow-2xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all text-lg uppercase tracking-widest">
                  CONTINUAR
                </button>
              </form>
              <button 
                type="button" 
                onClick={() => setView('STATUS')}
                className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-6 hover:text-[#f59e0b]"
              >
                ¿Ya tienes una solicitud? Consulta el estado aquí
              </button>
            </div>
          ) : view === 'STATUS' ? (
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-[#0f172a] tracking-tight text-center">Tus Solicitudes</h3>
              <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {clientRequests.length > 0 ? (
                  clientRequests.slice().reverse().map(req => (
                    <div key={req.id} className="p-5 bg-slate-50 rounded-3xl flex justify-between items-center border border-slate-100">
                      <div>
                        <p className="font-black text-[#0f172a] text-lg">${req.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black">{new Date(req.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {req.status === 'PENDING' ? 'En Revisión' : req.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-30">
                    <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No hay solicitudes para este ID</p>
                  </div>
                )}
              </div>
              <button onClick={() => setView('ID_CHECK')} className="w-full py-5 border-2 border-[#0f172a] rounded-2xl font-black text-[#0f172a] uppercase tracking-widest text-xs">Volver</button>
            </div>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className={`p-5 rounded-3xl border ${foundClient ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                <p className={`text-[11px] font-black uppercase tracking-widest ${foundClient ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {foundClient ? `¡Bienvenido, ${foundClient.name}!` : '¡Genial! No estás registrado, vamos a unirte'}
                </p>
                <p className={`text-[10px] font-medium opacity-80 ${foundClient ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {foundClient ? 'Solo ingresa el monto para tu nuevo préstamo.' : 'Completa este formulario para unirte a PIN TROLLEY y solicitar tu crédito.'}
                </p>
              </div>

              {!foundClient && (
                <div className="space-y-4">
                   <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Nombre Completo</label>
                    <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f59e0b] outline-none transition-all font-bold" placeholder="Juan Perez" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Usuario</label>
                      <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f59e0b] outline-none transition-all font-bold" placeholder="juan123" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Teléfono</label>
                      <input required type="tel" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f59e0b] outline-none transition-all font-bold" placeholder="+57..." value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Correo Electrónico</label>
                    <input required type="email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f59e0b] outline-none transition-all font-bold" placeholder="hola@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Dirección de Domicilio</label>
                    <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f59e0b] outline-none transition-all font-bold" placeholder="Calle 123 #45-67..." value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-black text-[#f59e0b] uppercase tracking-[0.2em] mb-3 ml-1 text-center">¿Monto solicitado?</label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-3xl group-focus-within:text-[#f59e0b] transition-colors">$</span>
                  <input 
                    required 
                    type="number" 
                    className="w-full p-8 pl-14 bg-[#0f172a] text-white rounded-[2.5rem] outline-none border-4 border-transparent focus:border-[#f59e0b] text-4xl font-black transition-all" 
                    placeholder="0"
                    min="1"
                    onChange={e => setAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full py-6 rounded-[2rem] font-black shadow-2xl uppercase tracking-[0.2em] text-sm transition-all ${
                    isSubmitting ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#f59e0b] text-[#0f172a] hover:bg-amber-400 active:scale-95'
                  }`}
                >
                  {isSubmitting ? 'PROCESANDO...' : foundClient ? 'ENVIAR SOLICITUD' : 'UNIRME Y SOLICITAR'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <p className="mt-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Pin Trolley © Safe Payments</p>
    </div>
  );
};

export default ClientPortal;
