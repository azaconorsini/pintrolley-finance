
import React from 'react';
import { Client, AppState, Loan, Payment } from '../types';
import { FREQUENCY_LABELS, formatCurrency } from '../constants';

interface ClientDetailProps {
  client: Client;
  state: AppState;
  onBack: () => void;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ client, state, onBack }) => {
  const clientLoans = state.loans.filter(l => l.clientId === client.id);
  const totalLent = clientLoans.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = clientLoans.reduce((acc, curr) => acc + curr.totalOwed, 0);
  
  const clientPayments = state.payments.filter(p => {
    const loan = state.loans.find(l => l.id === p.loanId);
    return loan?.clientId === client.id;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-5xl mx-auto">
      {/* Header con navegación */}
      <header className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-xl group"
          >
            <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
          </button>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{client.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-amber-500 font-black uppercase text-[10px] tracking-widest">EXPEDIENTE #{client.nationalId}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400 font-bold text-[10px]">@{client.username}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center shadow-lg w-full sm:w-auto ${
            client.status === 'ACTIVE' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-400 text-white'
          }`}>
            {client.status === 'ACTIVE' ? 'PERFIL ACTIVO' : 'INACTIVO'}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna Izquierda: Info básica */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight">📍 Información de Contacto</h3>
            <div className="space-y-6">
              {[
                { label: 'Documento ID', value: client.nationalId, icon: '🪪' },
                { label: 'Celular', value: client.phone || 'No registrado', icon: '📞' },
                { label: 'E-mail Corporativo', value: client.email || 'Sin correo', icon: '📧' },
                { label: 'Dirección Registrada', value: client.address || 'Sin dirección', icon: '🏠' },
                { label: 'Fecha de Alta', value: new Date(client.registrationDate).toLocaleDateString(), icon: '🗓️' },
              ].map((item, i) => (
                <div key={i} className="group/item">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{item.label}</p>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover/item:border-amber-200 transition-colors">
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-sm font-bold text-slate-700 truncate" title={item.value}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-[80px] -mr-16 -mt-16"></div>
            <h3 className="text-lg font-black mb-8 tracking-tight relative z-10">⭐ Score Financiero</h3>
            <div className="space-y-4 relative z-10">
              <div className="p-5 bg-white/5 rounded-[1.5rem] border border-white/10 flex flex-col items-center text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Inversión Total</p>
                <p className="text-xl font-black text-amber-500 tracking-tighter">{formatCurrency(totalLent)}</p>
                <p className="text-[8px] font-medium text-slate-500 uppercase">{formatCurrency(totalLent, true).split(' ').slice(1).join(' ')}</p>
              </div>
              <div className="p-5 bg-white/5 rounded-[1.5rem] border border-white/10 flex flex-col items-center text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Deuda Pendiente</p>
                <p className="text-xl font-black text-white tracking-tighter">{formatCurrency(totalPending)}</p>
                <p className="text-[8px] font-medium text-slate-500 uppercase">{formatCurrency(totalPending, true).split(' ').slice(1).join(' ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tablas */}
        <div className="lg:col-span-8 space-y-8">
          {/* Préstamos */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Cartera de Créditos</h3>
              <div className="bg-white px-5 py-2 rounded-2xl border border-slate-200 text-[10px] font-black text-slate-500">
                {clientLoans.length} PRODUCTOS
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-6 font-black text-slate-400 text-[9px] uppercase tracking-widest">Fecha</th>
                    <th className="p-6 font-black text-slate-400 text-[9px] uppercase tracking-widest">Principal</th>
                    <th className="p-6 font-black text-slate-400 text-[9px] uppercase tracking-widest">Saldo Actual</th>
                    <th className="p-6 font-black text-slate-400 text-[9px] uppercase tracking-widest text-right">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientLoans.slice().reverse().map(loan => (
                    <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6 text-xs font-black text-slate-500">{new Date(loan.startDate).toLocaleDateString()}</td>
                      <td className="p-6 text-sm font-black text-slate-900">{formatCurrency(loan.amount)}</td>
                      <td className="p-6 text-sm font-black text-amber-600">{formatCurrency(loan.totalOwed)}</td>
                      <td className="p-6 text-right">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                          loan.status === 'ACTIVE' ? 'bg-amber-100 text-amber-700' : 
                          loan.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-500'
                        }`}>
                          {loan.status === 'ACTIVE' ? 'VIGENTE' : loan.status === 'PAID' ? 'LIQUIDADO' : 'MORA'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clientLoans.length === 0 && (
                <div className="p-16 text-center opacity-40">
                  <p className="font-black text-[10px] uppercase tracking-widest">No se registran préstamos</p>
                </div>
              )}
            </div>
          </div>

          {/* Últimos Pagos */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Historial de Abonos</h3>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">💰</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-6 font-black text-slate-400 text-[9px] uppercase tracking-widest">Fecha</th>
                    <th className="p-6 font-black text-slate-400 text-[9px] uppercase tracking-widest">Abono</th>
                    <th className="p-6 font-black text-slate-400 text-[9px] uppercase tracking-widest">Canal</th>
                    <th className="p-6 font-black text-slate-400 text-[9px] uppercase tracking-widest text-right">Nota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientPayments.slice().reverse().map(payment => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6 text-xs font-black text-slate-500">{new Date(payment.date).toLocaleDateString()}</td>
                      <td className="p-6 text-sm font-black text-emerald-600">{formatCurrency(payment.amount)}</td>
                      <td className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{payment.method}</td>
                      <td className="p-6 text-right text-xs text-slate-400 italic truncate max-w-[150px]">{payment.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clientPayments.length === 0 && (
                <div className="p-16 text-center opacity-40">
                  <p className="font-black text-[10px] uppercase tracking-widest">Sin pagos registrados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
