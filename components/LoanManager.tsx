
import React, { useState } from 'react';
import { Loan, AppState, LoanFrequency, LoanRequest } from '../types';
import { FREQUENCY_LABELS, formatCurrency } from '../constants';

interface LoanManagerProps {
  state: AppState;
  addLoan: (l: Loan) => void;
  onApproveRequest: (reqId: string) => void;
  onRejectRequest: (reqId: string) => void;
}

const LoanManager: React.FC<LoanManagerProps> = ({ state, addLoan, onApproveRequest, onRejectRequest }) => {
  const [activeTab, setActiveTab] = useState<'VIGENTES' | 'SOLICITUDES'>('VIGENTES');
  const [isModalOpen, setModalOpen] = useState(false);
  const [newLoan, setNewLoan] = useState<Partial<Loan>>({ 
    status: 'ACTIVE', 
    frequency: 'MONTHLY',
    amount: 1000000,
    interestRate: 0,
    term: 1
  });

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLoan.clientId && newLoan.amount) {
      addLoan({
        ...newLoan as Loan,
        id: `l${Date.now()}`,
        startDate: new Date().toISOString().split('T')[0],
        totalPaid: 0,
        totalOwed: newLoan.amount,
        interestRate: 0 
      });
      setModalOpen(false);
    }
  };

  const pendingRequests = state.loanRequests.filter(r => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div>
          <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">Préstamos</h2>
          <p className="text-slate-500 font-medium italic">Gestión de cartera y peticiones de clientes</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={() => setActiveTab('SOLICITUDES')}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 border-2 transition-all ${
              activeTab === 'SOLICITUDES' ? 'bg-amber-50 border-[#f59e0b] text-[#f59e0b]' : 'bg-white border-slate-100 text-slate-300'
            }`}
          >
            Peticiones IA <span className="bg-[#f59e0b] text-[#0f172a] px-3 py-1 rounded-full text-[10px] font-black">{pendingRequests.length}</span>
          </button>
          <button 
            onClick={() => setModalOpen(true)}
            className="bg-[#0f172a] hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-900/10 transition-all"
          >
            <span>💵</span> Desembolso Directo
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-100 bg-white rounded-t-[2rem] px-8">
        <button 
          onClick={() => setActiveTab('VIGENTES')}
          className={`px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] border-b-4 transition-all ${activeTab === 'VIGENTES' ? 'border-[#f59e0b] text-[#0f172a]' : 'border-transparent text-slate-300'}`}
        >
          Cartera Activa
        </button>
        <button 
          onClick={() => setActiveTab('SOLICITUDES')}
          className={`px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] border-b-4 transition-all ${activeTab === 'SOLICITUDES' ? 'border-[#f59e0b] text-[#0f172a]' : 'border-transparent text-slate-300'}`}
        >
          Solicitudes Externas
        </button>
      </div>

      <div className="bg-white p-2 rounded-b-[2rem] shadow-sm border border-slate-100 min-h-[400px]">
        {activeTab === 'VIGENTES' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="p-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">Cliente</th>
                  <th className="p-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">Principal</th>
                  <th className="p-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">Saldo Deuda</th>
                  <th className="p-5 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {state.loans.slice().reverse().map(loan => {
                  const client = state.clients.find(c => c.id === loan.clientId);
                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5">
                         <p className="font-black text-[#0f172a] text-sm group-hover:text-[#f59e0b] transition-colors">{client?.name || '---'}</p>
                         <p className="text-[10px] text-slate-400 font-bold">@{client?.username}</p>
                      </td>
                      <td className="p-5 font-bold text-slate-600 text-sm">{formatCurrency(loan.amount, true)}</td>
                      <td className="p-5 font-black text-lg text-[#0f172a] tracking-tighter">
                        <div className="flex flex-col">
                          <span>{formatCurrency(loan.totalOwed)}</span>
                          <span className="text-[10px] font-medium text-slate-400 uppercase">{formatCurrency(loan.totalOwed, true).split(' ').slice(1).join(' ')}</span>
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                          loan.status === 'ACTIVE' ? 'bg-amber-100 text-[#f59e0b]' : 
                          loan.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'
                        }`}>
                          {loan.status === 'ACTIVE' ? 'VIGENTE' : loan.status === 'PAID' ? 'LIQUIDADO' : 'EN MORA'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {state.loans.length === 0 && (
              <div className="p-24 text-center">
                <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-xs">No hay préstamos activos</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingRequests.map(req => (
              <div key={req.id} className="bg-slate-50 p-8 rounded-[2rem] border-2 border-transparent hover:border-[#f59e0b] transition-all flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-14 h-14 rounded-2xl bg-[#0f172a] text-[#f59e0b] flex items-center justify-center text-2xl font-black shadow-lg">
                      {req.name.charAt(0)}
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Petición Crédito</p>
                      <p className="text-2xl font-black text-[#f59e0b] tracking-tighter">{formatCurrency(req.amount)}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase">{formatCurrency(req.amount, true).split(' ').slice(1).join(' ')}</p>
                    </div>
                  </div>
                  <h3 className="font-black text-[#0f172a] text-xl tracking-tight mb-1">{req.name}</h3>
                  <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-tighter">ID: {req.nationalId}</p>
                </div>
                
                <div className="flex gap-3 pt-6 border-t border-slate-200/50">
                  <button 
                    onClick={() => onRejectRequest(req.id)}
                    className="flex-1 py-3 bg-white text-red-500 font-black rounded-xl border-2 border-red-50 hover:bg-red-50 transition-colors uppercase text-[10px] tracking-widest"
                  >
                    RECHAZAR
                  </button>
                  <button 
                    onClick={() => onApproveRequest(req.id)}
                    className="flex-1 py-3 bg-[#f59e0b] text-[#0f172a] font-black rounded-xl hover:bg-amber-400 shadow-xl shadow-amber-500/20 transition-all uppercase text-[10px] tracking-widest"
                  >
                    APROBAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-10 animate-in zoom-in duration-200">
            <h3 className="text-3xl font-black text-[#0f172a] mb-8 tracking-tighter">Nuevo Desembolso</h3>
            <form onSubmit={handleAddLoan} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Seleccionar Cliente</label>
                  <select 
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#f59e0b] font-bold"
                    onChange={(e) => setNewLoan({...newLoan, clientId: e.target.value})}
                  >
                    <option value="">Buscar en el sistema...</option>
                    {state.clients.map(c => <option key={c.id} value={c.id}>{c.name} (@{c.username})</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-[#f59e0b] uppercase tracking-widest mb-2 ml-2">Monto del Capital</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">$</span>
                    <input 
                      type="number"
                      required
                      className="w-full p-5 pl-12 bg-slate-900 text-white border-none rounded-[1.5rem] outline-none text-2xl font-black"
                      value={newLoan.amount}
                      onChange={(e) => setNewLoan({...newLoan, amount: Number(e.target.value)})}
                    />
                  </div>
                  {newLoan.amount && newLoan.amount > 0 && (
                    <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Son: {formatCurrency(newLoan.amount, true).split(' ').slice(1).join(' ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cerrar</button>
                <button type="submit" className="flex-1 bg-[#f59e0b] text-[#0f172a] py-4 rounded-2xl font-black shadow-2xl shadow-amber-500/20 uppercase text-[10px] tracking-widest">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanManager;
