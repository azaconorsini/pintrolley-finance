
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { AppState } from '../types';
import { getFinancialInsights } from '../services/geminiService';
import { formatCurrency } from '../constants';

interface DashboardProps {
  state: AppState;
  onGoToRequests: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onGoToRequests }) => {
  const [insights, setInsights] = useState<string>('Analizando cartera con IA...');

  const totalPortfolio = state.loans.reduce((acc, curr) => 
    curr.status !== 'PAID' ? acc + curr.totalOwed : acc, 0
  );

  const totalPaid = state.payments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalClients = state.clients.length;
  const availableFunds = state.availableFunds;
  const pendingRequests = state.loanRequests.filter(r => r.status === 'PENDING');

  useEffect(() => {
    const fetchInsights = async () => {
      const text = await getFinancialInsights(totalPortfolio, totalPaid, 5.2);
      setInsights(text || '');
    };
    fetchInsights();
  }, [totalPortfolio, totalPaid]);

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `pintrolley_backup_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const chartData = [
    { name: 'Ene', monto: 400000 },
    { name: 'Feb', monto: 300000 },
    { name: 'Mar', monto: 600000 },
    { name: 'Abr', monto: 800000 },
    { name: 'Hoy', monto: totalPaid },
  ];

  const pieData = [
    { name: 'Al día', value: 85, color: '#f59e0b' },
    { name: 'En Mora', value: 15, color: '#0f172a' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#0f172a] tracking-tighter">Resumen Global</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Panel de Control Inteligente</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={exportData}
            className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            📥 Backup JSON
          </button>
          {pendingRequests.length > 0 && (
            <button 
              onClick={onGoToRequests}
              className="flex-1 sm:flex-none bg-[#f59e0b] animate-bounce hover:bg-amber-400 text-[#0f172a] px-5 py-3 rounded-2xl text-[10px] font-black shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 uppercase tracking-widest transition-all"
            >
              ⚠️ {pendingRequests.length} Solicitudes
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cartera Vigente', value: formatCurrency(totalPortfolio), icon: '💰', color: 'bg-[#0f172a]' },
          { label: 'Caja Disponible', value: formatCurrency(availableFunds), icon: '🏦', color: 'bg-[#f59e0b]' },
          { label: 'Recuperado', value: formatCurrency(totalPaid), icon: '✅', color: 'bg-emerald-500' },
          { label: 'Total Clientes', value: totalClients.toString(), icon: '👥', color: 'bg-slate-400' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-[#f59e0b] transition-all cursor-default relative overflow-hidden">
            <div className={`${card.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{card.label}</p>
              <p className="text-xl font-black text-[#0f172a] tracking-tighter mt-1">{card.value}</p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-amber-50 transition-colors"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 className="text-2xl font-black mb-10 text-[#0f172a] tracking-tight">Recuperación vs Tiempo</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#cbd5e1'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#cbd5e1'}} />
                <Tooltip 
                  cursor={{fill: '#fffbeb'}}
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '12px'}}
                  formatter={(value: number) => [formatCurrency(value, true), 'Monto']}
                />
                <Bar dataKey="monto" fill="#f59e0b" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-2xl font-black mb-6 text-[#0f172a] tracking-tight w-full">Salud Cartera</h3>
          <div className="flex-1 min-h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 w-full mt-6">
            {pieData.map((d, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest border-b border-slate-50 pb-3">
                <span className="flex items-center gap-4">
                  <span className="w-5 h-5 rounded-lg shadow-sm" style={{backgroundColor: d.color}}></span>
                  {d.name}
                </span>
                <span className="text-[#0f172a] font-black">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a] text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f59e0b]/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="flex items-center gap-6 mb-8 relative z-10">
          <div className="w-16 h-16 bg-[#f59e0b] rounded-3xl flex items-center justify-center text-3xl shadow-2xl shadow-amber-500/20">🤖</div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter">Gemini Intelligence</h3>
            <p className="text-[#f59e0b] text-[10px] font-black uppercase tracking-[0.4em]">Análisis de Riesgo Predictivo</p>
          </div>
        </div>
        <div className="prose prose-invert max-w-none text-slate-400 text-sm font-medium leading-loose relative z-10">
          {insights.split('\n').map((line, i) => (
            <p key={i} className="mb-2">{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
