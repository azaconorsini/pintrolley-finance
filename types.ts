
export type UserRole = 'ADMIN' | 'COBRADOR' | 'CONSULTOR';

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface Client {
  id: string;
  nationalId: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface LoanRequest {
  id: string;
  nationalId: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export type LoanFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface Loan {
  id: string;
  clientId: string;
  amount: number;
  interestRate: number; // Percentage
  term: number; // Number of payments
  frequency: LoanFrequency;
  startDate: string;
  status: 'PENDING' | 'ACTIVE' | 'PAID' | 'DEFAULT';
  totalPaid: number;
  totalOwed: number;
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  method: 'CASH' | 'TRANSFER' | 'CARD';
  notes?: string;
}

export interface FundAdjustment {
  id: string;
  amount: number;
  date: string;
  notes: string;
}

export interface TimelineEvent {
  id: string;
  clientId: string;
  type: 'LOAN_CREATED' | 'PAYMENT_RECEIVED' | 'LATE_WARNING' | 'CLIENT_REGISTERED' | 'FUNDS_ADDED' | 'LOAN_REQUEST';
  date: string;
  description: string;
  amount?: number;
}

export interface AppState {
  clients: Client[];
  loans: Loan[];
  payments: Payment[];
  timeline: TimelineEvent[];
  admins: AdminUser[];
  currentUser: AdminUser | null;
  availableFunds: number;
  fundsHistory: FundAdjustment[];
  loanRequests: LoanRequest[];
}
