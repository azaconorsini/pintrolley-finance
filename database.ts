
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, Client, Loan, Payment, LoanRequest, TimelineEvent, FundAdjustment } from '../types';

/**
 * Recupera variables de entorno con fallback para evitar errores de referencia
 */
const getEnv = (key: string): string => {
  try {
    return (window as any).process?.env?.[key] || (import.meta as any).env?.[key] || '';
  } catch {
    return '';
  }
};

/**
 * Singleton del cliente de Supabase
 */
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseKey = getEnv('SUPABASE_ANON_KEY') || getEnv('SUPABASE_KEY');

  if (supabaseUrl && supabaseKey) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseKey);
      return supabaseInstance;
    } catch (err) {
      console.error("Fallo crítico al crear cliente Supabase:", err);
    }
  }
  return null;
};

export const loadFromCloud = async (): Promise<AppState | null> => {
  const client = getSupabaseClient();
  if (!client) {
    console.log("Supabase no configurado. Trabajando en modo local.");
    return null;
  }

  try {
    const [
      { data: clients },
      { data: loans },
      { data: payments },
      { data: requests },
      { data: funds },
      { data: history },
      { data: timeline }
    ] = await Promise.all([
      client.from('clients').select('*'),
      client.from('loans').select('*'),
      client.from('payments').select('*'),
      client.from('loan_requests').select('*'),
      client.from('system_funds').select('available_funds').single(),
      client.from('funds_history').select('*'),
      client.from('timeline').select('*')
    ]);

    const mappedClients: Client[] = (clients || []).map(c => ({
      id: c.id,
      nationalId: c.national_id,
      username: c.username,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      registrationDate: c.registration_date,
      status: c.status
    }));

    const mappedLoans: Loan[] = (loans || []).map(l => ({
      id: l.id,
      clientId: l.client_id,
      amount: Number(l.amount),
      interestRate: Number(l.interest_rate),
      term: l.term,
      frequency: l.frequency,
      startDate: l.start_date,
      status: l.status,
      totalPaid: Number(l.total_paid),
      totalOwed: Number(l.total_owed)
    }));

    const mappedPayments: Payment[] = (payments || []).map(p => ({
      id: p.id,
      loanId: p.loan_id,
      amount: Number(p.amount),
      date: p.date,
      method: p.method,
      notes: p.notes
    }));

    const mappedRequests: LoanRequest[] = (requests || []).map(r => ({
      id: r.id,
      nationalId: r.national_id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      amount: Number(r.amount),
      date: r.date,
      status: r.status
    }));

    return {
      clients: mappedClients,
      loans: mappedLoans,
      payments: mappedPayments,
      loanRequests: mappedRequests,
      availableFunds: funds?.available_funds ? Number(funds.available_funds) : 0,
      fundsHistory: (history || []).map(h => ({ id: h.id, amount: Number(h.amount), date: h.date, notes: h.notes })),
      timeline: (timeline || []).map(t => ({ id: t.id, clientId: t.client_id, type: t.type, date: t.date, description: t.description, amount: t.amount ? Number(t.amount) : undefined })),
      admins: [], 
      currentUser: null
    };
  } catch (error) {
    console.error("Error en sincronización Cloud:", error);
    return null;
  }
};

export const db = {
  async upsertClient(client: Client) {
    const sc = getSupabaseClient();
    if (!sc) return;
    return await sc.from('clients').upsert({
      national_id: client.nationalId,
      username: client.username,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      status: client.status
    });
  },
  async insertLoan(loan: Loan) {
    const sc = getSupabaseClient();
    if (!sc) return;
    return await sc.from('loans').insert({
      client_id: loan.clientId,
      amount: loan.amount,
      interest_rate: loan.interestRate,
      term: loan.term,
      frequency: loan.frequency,
      status: loan.status,
      total_paid: loan.totalPaid,
      total_owed: loan.totalOwed
    });
  },
  async updateLoanStatus(loanId: string, totalOwed: number, totalPaid: number, status: string) {
    const sc = getSupabaseClient();
    if (!sc) return;
    return await sc.from('loans').update({
      total_owed: totalOwed,
      total_paid: totalPaid,
      status: status
    }).eq('id', loanId);
  },
  async insertPayment(payment: Payment) {
    const sc = getSupabaseClient();
    if (!sc) return;
    return await sc.from('payments').insert({
      loan_id: payment.loanId,
      amount: payment.amount,
      method: payment.method,
      notes: payment.notes
    });
  },
  async updateAvailableFunds(amount: number) {
    const sc = getSupabaseClient();
    if (!sc) return;
    return await sc.from('system_funds').update({ available_funds: amount }).eq('id', 1);
  },
  async deleteClient(clientId: string) {
    const sc = getSupabaseClient();
    if (!sc) return;
    return await sc.from('clients').delete().eq('id', clientId);
  }
};

export const saveToLocalFallback = (state: AppState) => {
  localStorage.setItem('fintech_pro_state_v3_pintrolley', JSON.stringify(state));
};
