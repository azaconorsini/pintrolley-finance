
import React, { useState } from 'react';
import { AppState } from '../types';
import { formatCurrency } from '../constants';

interface FundsManagerProps {
  state: AppState;
  onAddFunds: (amount: number, notes: string) => void;
}

const FundsManager: React.FC<FundsManagerProps> = ({ state, onAddFunds }) => {
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    onAddFunds(amount, notes);
    setAmount(0);
    setNotes('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Capital</h2>
          <p className="text-slate-500">Control de dinero disponible para nuevos préstamos</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <span>➕</span> Inyectar Capital
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-4">🏦</div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Disponible Hoy</p>
          <p className="text-2xl font-black text-slate-800 mt-2">{formatCurrency(state.availableFunds)}</p>
          <p className="text-[10px] font-medium text-slate-400 uppercase mt-1">{formatCurrency(state.availableFunds, true).split(' ').slice(1).join(' ')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-50 bg-slate-50/50">
            <h3 className="font-bold text-slate-700">Historial de Inyecciones</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="p-3 text-[10px] uppercase font-bold text-slate-400">Fecha</th>
                  <th className="p-3 text-[10px] uppercase font-bold text-slate-400">Monto</th>
                  <th className="p-3 text-[10px] uppercase font-bold text-slate-400">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {state.fundsHistory.slice().reverse().map(fund => (
                  <tr key={fund.id} className="text-sm">
                    <td className="p-3 text-slate-500 whitespace-nowrap">{new Date(fund.date).toLocaleDateString()}</td>
                    <td className="p-3 font-bold text-emerald-600">
                      <div className="flex flex-col">
                        <span>+{formatCurrency(fund.amount)}</span>
                        <span className="text-[8px] uppercase text-slate-400">{formatCurrency(fund.amount, true).split(' ').slice(1).join(' ')}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 italic truncate max-w-[150px]">{fund.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Agregar Fondos al Sistema</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Monto a Sumar</label>
                <input 
                  type="number" 
                  required
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-lg"
                  placeholder="0.00"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                {amount > 0 && (
                   <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                     {formatCurrency(amount, true).split(' ').slice(1).join(' ')}
                   </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Nota / Origen</label>
                <textarea 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-sm"
                  placeholder="Ej: Inversión socios Mayo..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 border rounded-xl font-bold">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundsManager;
