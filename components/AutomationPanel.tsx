
import React, { useState } from 'react';
import { AppState } from '../types';
import { generateCollectionMessage } from '../services/geminiService';

interface AutomationPanelProps {
  state: AppState;
}

const AutomationPanel: React.FC<AutomationPanelProps> = ({ state }) => {
  const [loading, setLoading] = useState(false);
  const [generatedMsg, setGeneratedMsg] = useState<string | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState('');

  const handleGenerate = async () => {
    const loan = state.loans.find(l => l.id === selectedLoanId);
    const client = state.clients.find(c => c.id === loan?.clientId);
    if (!loan || !client) return;

    setLoading(true);
    const msg = await generateCollectionMessage(client.name, loan.totalOwed, 'Próximo Lunes');
    setGeneratedMsg(msg);
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (generatedMsg) {
      navigator.clipboard.writeText(generatedMsg);
      alert("¡Mensaje copiado al portapapeles!");
    }
  };

  const sendWhatsApp = () => {
    const loan = state.loans.find(l => l.id === selectedLoanId);
    const client = state.clients.find(c => c.id === loan?.clientId);
    if (generatedMsg && client) {
      const phone = client.phone.replace(/\D/g, ''); // Limpiar caracteres no numéricos
      const encodedMsg = encodeURIComponent(generatedMsg);
      window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
    }
  };

  const simulateSMS = () => {
    alert("Simulación de SMS: Esta funcionalidad requiere una API externa (como Twilio). El mensaje sería enviado automáticamente a los servidores de red móvil.");
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">IA & Automatización</h2>
        <p className="text-slate-500">Gestión inteligente de cobros y recordatorios</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-blue-500 text-xl">✍️</span> Redactor de Cobros IA
          </h3>
          <p className="text-sm text-slate-500 mb-6">Selecciona un préstamo en mora para generar un mensaje de cobro personalizado por inteligencia artificial.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Préstamo Objetivo</label>
              <select 
                className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none"
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
              >
                <option value="">Seleccione un caso...</option>
                {state.loans.filter(l => l.status === 'ACTIVE').map(l => (
                  <option key={l.id} value={l.id}>
                    {state.clients.find(c => c.id === l.clientId)?.name} - ${l.totalOwed.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !selectedLoanId}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
              }`}
            >
              {loading ? 'Consultando a Gemini...' : 'Generar Mensaje de Cobro'}
            </button>

            {generatedMsg && (
              <div className="mt-6 p-4 bg-slate-900 text-slate-100 rounded-xl relative group animate-in slide-in-from-top-4 duration-300">
                <p className="text-sm leading-relaxed italic">"{generatedMsg}"</p>
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="text-[10px] bg-white/10 px-3 py-2 rounded-lg font-bold hover:bg-white/20 transition-colors uppercase"
                  >
                    📋 Copiar
                  </button>
                  <button 
                    onClick={sendWhatsApp}
                    className="text-[10px] bg-emerald-600 px-3 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors uppercase"
                  >
                    📱 Enviar WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-purple-500 text-xl">⏳</span> Reglas de Automatización
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Interés por Mora', desc: 'Aplica 2% adicional tras 5 días de retraso.', active: true },
              { label: 'Recordatorio Previo', desc: 'Envía SMS 48h antes del vencimiento.', active: true },
              { label: 'Cierre Mensual', desc: 'Reporte automático a contabilidad.', active: false },
            ].map((rule, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-50 rounded-lg hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{rule.label}</p>
                  <p className="text-xs text-slate-400">{rule.desc}</p>
                </div>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${rule.active ? 'bg-blue-600' : 'bg-slate-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${rule.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </div>
            ))}
            <button 
              onClick={simulateSMS}
              className="w-full mt-4 py-2 border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all"
            >
              Configurar Proveedor SMS (Twilio/Infobip)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationPanel;
