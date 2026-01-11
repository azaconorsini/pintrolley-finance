
import { createClient } from '@supabase/supabase-js';
import { AppState, Client, Loan, Payment, LoanRequest, TimelineEvent, FundAdjustment } from '../types';

// Estas variables se deben configurar en Vercel -> Settings -> Environment Variables
// Para desarrollo local, puedes reemplazarlas temporalmente por tus strings de Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Carga todo el estado de la aplicación desde las diferentes tablas de Supabase
 */
export const loadFromCloud = async (): Promise<AppState | null> => {
  try {
    if (!supabaseUrl || !supabaseKey) return null;

    const [
      { data: clients },
      { data: loans },
      { data: payments },
      { data: requests },
      { data: funds },
      { data: history },
      { data: timeline }
    ] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('loans').select('*'),
      supabase.from('payments').select('*'),
      supabase.from('loan_requests').select('*'),
      supabase.from('system_funds').select('available_funds').single(),
      supabase.from('funds_history').select('*'),
      supabase.from('timeline').select('*')
    ]);

    // Si no hay fondos, inicializamos con el estado por defecto
    if (!funds) return null;

    return {
      clients: clients || [],
      loans: loans || [],
      payments: payments || [],
      loanRequests: requests || [],
      availableFunds: funds.available_funds || 0,
      fundsHistory: history || [],
      timeline: timeline || [],
      admins: [], // Los admins se manejan por autenticación de Supabase idealmente
      currentUser: null
    };
  } catch (error) {
    console.error("Error cargando datos de Supabase:", error);
    return null;
  }
};

/**
 * Funciones de guardado granular para mayor eficiencia
 */
export const db = {
  async upsertClient(client: Client) {
    return await supabase.from('clients').upsert({
      id: client.id.includes('c') ? undefined : client.id, // Manejo de IDs temporales vs UUIDs
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
    return await supabase.from('loans').insert({
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
    return await supabase.from('loans').update({
      total_owed: totalOwed,
      total_paid: totalPaid,
      status: status
    }).eq('id', loanId);
  },

  async insertPayment(payment: Payment) {
    return await supabase.from('payments').insert({
      loan_id: payment.loanId,
      amount: payment.amount,
      method: payment.method,
      notes: payment.notes
    });
  },

  async updateAvailableFunds(amount: number) {
    return await supabase.from('system_funds').update({ available_funds: amount }).eq('id', 1);
  },

  async deleteClient(clientId: string) {
    return await supabase.from('clients').delete().eq('id', clientId);
  }
};

/**
 * Respaldo en LocalStorage (Legacy / Offline)
 */
export const saveToLocalFallback = (state: AppState) => {
  localStorage.setItem('fintech_pro_state_v3_pintrolley', JSON.stringify(state));
};
