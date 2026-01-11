
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, Client, Loan, Payment } from '../types';

const SUPABASE_URL = process.env.SUPABASE_URL || (window as any).process?.env?.SUPABASE_URL || 'https://zjounhlaffzxxrgjylsb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || (window as any).process?.env?.SUPABASE_ANON_KEY || 'sb_publishable_kKc46uzgd05dFhYHyJVGwQ_0MQ36oCj';

let clientInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (clientInstance) return clientInstance;
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      clientInstance = createClient(SUPABASE_URL, SUPABASE_KEY);
      return clientInstance;
    } catch (e) {
      console.error("Error conectando a Supabase:", e);
    }
  }
  return null;
};

export const loadFromCloud = async (): Promise<AppState | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const [
      { data: clients },
      { data: loans },
      { data: payments },
      { data: requests },
      { data: funds }
    ] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('loans').select('*'),
      supabase.from('payments').select('*'),
      supabase.from('loan_requests').select('*'),
      supabase.from('system_funds').select('available_funds').single()
    ]);

    return {
      clients: (clients || []).map(c => ({
        id: c.id,
        nationalId: c.national_id,
        username: c.username,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        registrationDate: c.registration_date,
        status: c.status
      })),
      loans: (loans || []).map(l => ({
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
      })),
      payments: (payments || []).map(p => ({
        id: p.id,
        loanId: p.loan_id,
        amount: Number(p.amount),
        date: p.date,
        method: p.method,
        notes: p.notes
      })),
      loanRequests: (requests || []).map(r => ({
        id: r.id,
        nationalId: r.national_id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        amount: Number(r.amount),
        date: r.date,
        status: r.status
      })),
      availableFunds: funds?.available_funds ? Number(funds.available_funds) : 0,
      fundsHistory: [],
      timeline: [],
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
    const s = getSupabase();
    if (!s) return;
    return await s.from('clients').upsert({
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
    const s = getSupabase();
    if (!s) return;
    return await s.from('loans').insert({
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
    const s = getSupabase();
    if (!s) return;
    return await s.from('loans').update({
      total_owed: totalOwed,
      total_paid: totalPaid,
      status: status
    }).eq('id', loanId);
  },
  async insertPayment(payment: Payment) {
    const s = getSupabase();
    if (!s) return;
    return await s.from('payments').insert({
      loan_id: payment.loanId,
      amount: payment.amount,
      method: payment.method,
      notes: payment.notes
    });
  },
  async updateAvailableFunds(amount: number) {
    const s = getSupabase();
    if (!s) return;
    return await s.from('system_funds').update({ available_funds: amount }).eq('id', 1);
  },
  async deleteClient(clientId: string) {
    const s = getSupabase();
    if (!s) return;
    return await s.from('clients').delete().eq('id', clientId);
  }
};

export const saveToLocalFallback = (state: AppState) => {
  localStorage.setItem('fintech_pro_state_v3_pintrolley', JSON.stringify(state));
};
