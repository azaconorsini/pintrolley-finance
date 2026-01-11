
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientManager from './components/ClientManager';
import LoanManager from './components/LoanManager';
import PaymentManager from './components/PaymentManager';
import AutomationPanel from './components/AutomationPanel';
import AdminManager from './components/AdminManager';
import FundsManager from './components/FundsManager';
import LoginForm from './components/LoginForm';
import ClientPortal from './components/ClientPortal';
import ClientDetail from './components/ClientDetail';
import { AppState, Client, Loan, Payment, AdminUser, LoanRequest, FundAdjustment } from './types';
import { INITIAL_STATE } from './constants';
import { loadFromCloud, db, saveToLocalFallback } from './services/database';

const App: React.FC = () => {
  const [view, setView] = useState<'LOGIN' | 'ADMIN' | 'PORTAL'>('LOGIN');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Inicialización inteligente: Supabase -> LocalStorage -> InitialState
  useEffect(() => {
    const initApp = async () => {
      const cloudData = await loadFromCloud();
      if (cloudData) {
        setState(prev => ({ ...prev, ...cloudData, admins: prev.admins.length ? prev.admins : INITIAL_STATE.admins }));
      } else {
        const saved = localStorage.getItem('fintech_pro_state_v3_pintrolley');
        if (saved) setState(JSON.parse(saved));
      }
      setIsDataLoaded(true);
    };
    initApp();
  }, []);

  // Respaldo local preventivo
  useEffect(() => {
    if (isDataLoaded) {
      saveToLocalFallback(state);
    }
  }, [state, isDataLoaded]);

  const handleLogin = (user: AdminUser) => {
    setState(prev => ({ ...prev, currentUser: user }));
    setView('ADMIN');
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    setView('LOGIN');
    setCurrentTab('dashboard');
    setSelectedClient(null);
    setIsSidebarOpen(false);
  };

  const registerClient = async (client: Client) => {
    await db.upsertClient(client);
    setState(prev => ({
      ...prev,
      clients: [...prev.clients, client],
      timeline: [{
        id: `t${Date.now()}`,
        clientId: client.id,
        type: 'CLIENT_REGISTERED',
        date: new Date().toISOString(),
        description: `Nuevo cliente registrado: ${client.name}.`
      }, ...prev.timeline]
    }));
  };

  const deleteClient = useCallback(async (clientId: string) => {
    const clientToDelete = state.clients.find(c => c.id === clientId);
    if (!clientToDelete) return;

    if (window.confirm(`¿Eliminar permanentemente a ${clientToDelete.name}?`)) {
      await db.deleteClient(clientId);
      setState(prev => {
        const relatedLoans = prev.loans.filter(l => l.clientId === clientId).map(l => l.id);
        return {
          ...prev,
          clients: prev.clients.filter(c => c.id !== clientId),
          loans: prev.loans.filter(l => l.clientId !== clientId),
          payments: prev.payments.filter(p => !relatedLoans.includes(p.loanId)),
          loanRequests: prev.loanRequests.filter(r => r.nationalId !== clientToDelete.nationalId),
          timeline: prev.timeline.filter(t => t.clientId !== clientId)
        };
      });
      if (selectedClient?.id === clientId) setSelectedClient(null);
    }
  }, [state.clients, selectedClient]);

  const addLoan = async (loan: Loan) => {
    if (state.availableFunds < loan.amount) {
      alert("Fondos insuficientes en caja.");
      return;
    }

    await db.insertLoan(loan);
    const newFunds = state.availableFunds - loan.amount;
    await db.updateAvailableFunds(newFunds);

    setState(prev => ({
      ...prev,
      availableFunds: newFunds,
      loans: [...prev.loans, loan],
      timeline: [{
        id: `t${Date.now()}`,
        clientId: loan.clientId,
        type: 'LOAN_CREATED',
        date: new Date().toISOString(),
        description: `Préstamo desembolsado por $${loan.amount.toLocaleString()}.`,
        amount: loan.amount
      }, ...prev.timeline]
    }));
  };

  const addPayment = async (payment: Payment) => {
    await db.insertPayment(payment);
    const loanToUpdate = state.loans.find(l => l.id === payment.loanId);
    if (loanToUpdate) {
      const newTotalOwed = Math.max(0, loanToUpdate.totalOwed - payment.amount);
      const newTotalPaid = loanToUpdate.totalPaid + payment.amount;
      const newStatus = newTotalOwed === 0 ? 'PAID' : loanToUpdate.status;
      
      await db.updateLoanStatus(payment.loanId, newTotalOwed, newTotalPaid, newStatus);
      const newFunds = state.availableFunds + payment.amount;
      await db.updateAvailableFunds(newFunds);

      setState(prev => ({
        ...prev,
        availableFunds: newFunds,
        payments: [...prev.payments, payment],
        loans: prev.loans.map(l => l.id === payment.loanId ? { ...l, totalOwed: newTotalOwed, totalPaid: newTotalPaid, status: newStatus as any } : l),
        timeline: [{
          id: `t${Date.now()}`,
          clientId: loanToUpdate.clientId,
          type: 'PAYMENT_RECEIVED',
          date: payment.date,
          description: `Pago recibido: $${payment.amount.toLocaleString()}.`,
          amount: payment.amount
        }, ...prev.timeline]
      }));
    }
  };

  const handleAddFunds = async (amount: number, notes: string) => {
    const newFunds = state.availableFunds + amount;
    const adjustment: FundAdjustment = {
      id: `f${Date.now()}`,
      amount,
      date: new Date().toISOString(),
      notes
    };

    await db.updateAvailableFunds(newFunds);
    // Nota: El historial de fondos se maneja localmente y por Supabase si se implementa la tabla fund_adjustments
    
    setState(prev => ({
      ...prev,
      availableFunds: newFunds,
      fundsHistory: [...prev.fundsHistory, adjustment],
      timeline: [{
        id: `t${Date.now()}`,
        clientId: 'system',
        type: 'FUNDS_ADDED',
        date: adjustment.date,
        description: `Inyección de capital: $${amount.toLocaleString()}. ${notes}`,
        amount: amount
      }, ...prev.timeline]
    }));
  };

  const handleApproveRequest = async (reqId: string) => {
    const req = state.loanRequests.find(r => r.id === reqId);
    if (!req) return;

    const client = state.clients.find(c => c.nationalId === req.nationalId);
    if (!client) {
      alert("Error: El cliente no existe en la base de datos.");
      return;
    }

    if (state.availableFunds < req.amount) {
      alert("Fondos insuficientes para aprobar esta solicitud.");
      return;
    }

    const newLoan: Loan = {
      id: `l${Date.now()}`,
      clientId: client.id,
      amount: req.amount,
      interestRate: 0,
      term: 1,
      frequency: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      totalPaid: 0,
      totalOwed: req.amount
    };

    await addLoan(newLoan);
    // Actualizar estado de la solicitud localmente
    setState(prev => ({
      ...prev,
      loanRequests: prev.loanRequests.map(r => r.id === reqId ? { ...r, status: 'APPROVED' } : r)
    }));
  };

  const handleRejectRequest = (reqId: string) => {
    setState(prev => ({
      ...prev,
      loanRequests: prev.loanRequests.map(r => r.id === reqId ? { ...r, status: 'REJECTED' } : r)
    }));
  };

  const handleSubmitLoanRequest = (req: LoanRequest) => {
    setState(prev => ({
      ...prev,
      loanRequests: [...prev.loanRequests, req],
      timeline: [{
        id: `t${Date.now()}`,
        clientId: req.nationalId,
        type: 'LOAN_REQUEST',
        date: req.date,
        description: `Nueva solicitud de crédito recibida por $${req.amount.toLocaleString()}.`,
        amount: req.amount
      }, ...prev.timeline]
    }));
  };

  const renderContent = () => {
    if (selectedClient) return <ClientDetail client={selectedClient} state={state} onBack={() => setSelectedClient(null)} />;

    switch (currentTab) {
      case 'dashboard': return <Dashboard state={state} onGoToRequests={() => setCurrentTab('loans')} />;
      case 'clients': return <ClientManager state={state} addClient={registerClient} deleteClient={deleteClient} onSelectClient={setSelectedClient} />;
      case 'loans': return <LoanManager state={state} addLoan={addLoan} onApproveRequest={handleApproveRequest} onRejectRequest={handleRejectRequest} />;
      case 'payments': return <PaymentManager state={state} onAddPayment={addPayment} />;
      case 'funds': return <FundsManager state={state} onAddFunds={handleAddFunds} />;
      case 'admins': return <AdminManager state={state} onAddAdmin={(a) => setState(p => ({...p, admins:[...p.admins, a]}))} onDeleteAdmin={(id) => setState(p => ({...p, admins:p.admins.filter(x => x.id !== id)}))} />;
      case 'automation': return <AutomationPanel state={state} />;
      default: return <Dashboard state={state} onGoToRequests={() => setCurrentTab('loans')} />;
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Sincronizando con Supabase...</p>
        </div>
      </div>
    );
  }

  if (view === 'LOGIN') return <LoginForm admins={state.admins} onLogin={handleLogin} onGoToPortal={() => setView('PORTAL')} />;
  if (view === 'PORTAL') return <ClientPortal state={state} onGoBack={() => setView('LOGIN')} onRegisterClient={registerClient} onSubmitRequest={handleSubmitLoanRequest} />;

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <Sidebar 
        currentTab={currentTab} 
        setTab={(t) => { setCurrentTab(t); setSelectedClient(null); setIsSidebarOpen(false); }}
        role={state.currentUser?.role || 'CONSULTOR'}
        userName={state.currentUser?.name || 'Invitado'}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="lg:hidden h-16 bg-slate-900 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-1">
            <span className="text-amber-500 font-black text-xl tracking-tighter">PIN</span>
            <span className="text-white font-light text-lg">TROLLEY</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white bg-slate-800 rounded-xl">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-10">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;
