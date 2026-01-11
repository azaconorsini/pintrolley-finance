
import React, { useState } from 'react';
import { AppState, Payment } from '../types';
import { formatCurrency } from '../constants';

interface PaymentManagerProps {
  state: AppState;
  onAddPayment: (payment: Payment) => void;
}

const PaymentManager: React.FC<PaymentManagerProps> = ({ state, onAddPayment }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'CARD'>('CASH');
  const [notes, setNotes] = useState('');

  const activeLoans = state.loans.filter(l => l.status === 'ACTIVE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId || paymentAmount <= 0) return;

    const newPayment: Payment = {
      id: `p${Date.now()}`,
      loanId: selectedLoanId,
      amount: paymentAmount,
      date: new Date().toISOString(),
      method: paymentMethod,
      notes: notes
    };

    onAddPayment(newPayment);
    setModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedLoanId('');
    setPaymentAmount(0);
    setPaymentMethod('CASH');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Control de Pagos</h2>
          <p className="text-slate-500">Registrar abonos y liquidaciones de préstamos</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <span>💳</span> Registrar Pago
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Fecha</th>
              <th className="p-4 font-semibold text-slate-600">Cliente</th>
              <th className="p-4 font-semibold text-slate-600">Monto</th>
              <th className="p-4 font-semibold text-slate-600">Método</th>
              <th className="p-4 font-semibold text-slate-600">Notas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {state.payments.slice().reverse().map(payment => {
              const loan = state.loans.find(l => l.id === payment.loanId);
              const client = state.clients.find(c => c.id === loan?.clientId);
              return (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-600 text-sm">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-medium">{client?.name || 'Préstamo eliminado'}</td>
                  <td className="p-4 font-bold text-emerald-600">
                    <div className="flex flex-col">
                      <span>{formatCurrency(payment.amount)}</span>
                      <span className="text-[9px] font-medium text-slate-400 uppercase">{formatCurrency(payment.amount, true).split(' ').slice(1).join(' ')}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600 font-bold">
                      {payment.method}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-sm italic">{payment.notes || '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Registrar Nuevo Pago</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Seleccionar Préstamo Activo</label>
                <select 
                  required
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                >
                  <option value="">Seleccione un préstamo...</option>
                  {activeLoans.map(l => {
                    const client = state.clients.find(c => c.id === l.clientId);
                    return (
                      <option key={l.id} value={l.id}>
                        {client?.name} - Pendiente: ${l.totalOwed.toLocaleString()}
                      </option>
                    )
                  })}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Monto del Pago</label>
                <input 
                  type="number"
                  required
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                />
                {paymentAmount > 0 && (
                  <p className="mt-1 text-[9px] font-black text-slate-400 uppercase text-center">
                    {formatCurrency(paymentAmount, true).split(' ').slice(1).join(' ')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Método de Pago</label>
                <div className="flex gap-2">
                  {(['CASH', 'TRANSFER', 'CARD'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        paymentMethod === m ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'
                      }`}
                    >
                      {m === 'CASH' ? 'Efectivo' : m === 'TRANSFER' ? 'Transferencia' : 'Tarjeta'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Notas / Observaciones</label>
                <textarea 
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Confirmar Pago</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManager;
