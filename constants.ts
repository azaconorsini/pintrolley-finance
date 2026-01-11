
import { AppState } from './types';

export const INITIAL_STATE: AppState = {
  currentUser: null,
  admins: [
    {
      id: 'a1',
      name: 'Admin Principal',
      username: 'admin',
      email: 'pintrolley@gmail.com',
      password: 'AnT@103210',
      role: 'ADMIN'
    }
  ],
  clients: [],
  loans: [],
  payments: [],
  timeline: [],
  availableFunds: 0,
  fundsHistory: [],
  loanRequests: []
};

export const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: 'Diario',
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quincenal',
  MONTHLY: 'Mensual'
};

/**
 * Convierte un número a su representación en palabras (Español)
 */
export function numberToSpanishText(n: number): string {
  const unidades = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const decenas = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const decenas2 = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  if (n === 0) return 'cero';
  if (n === 100) return 'cien';

  function convertir(num: number): string {
    if (num < 10) return unidades[num];
    if (num < 20) return decenas[num - 10];
    if (num < 30) return num === 20 ? 'veinte' : 'veinti' + unidades[num % 10];
    if (num < 100) {
      const d = Math.floor(num / 10);
      const u = num % 10;
      return decenas2[d] + (u > 0 ? ' y ' + unidades[u] : '');
    }
    if (num < 1000) {
      const c = Math.floor(num / 100);
      const resto = num % 100;
      return (c === 1 && resto === 0 ? 'cien' : centenas[c]) + (resto > 0 ? ' ' + convertir(resto) : '');
    }
    if (num < 1000000) {
      const mil = Math.floor(num / 1000);
      const resto = num % 1000;
      const milTexto = mil === 1 ? 'mil' : convertir(mil) + ' mil';
      return milTexto + (resto > 0 ? ' ' + convertir(resto) : '');
    }
    if (num < 1000000000) {
      const millon = Math.floor(num / 1000000);
      const resto = num % 1000000;
      const millonTexto = millon === 1 ? 'un millón' : convertir(millon) + ' millones';
      return millonTexto + (resto > 0 ? ' ' + convertir(resto) : '');
    }
    return num.toString();
  }

  return convertir(Math.floor(n)).trim();
}

/**
 * Formatea moneda con separadores americanos (1,500.00) y opcionalmente texto
 */
export function formatCurrency(amount: number, includeText: boolean = false): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  if (!includeText) return `$${formatted}`;
  
  const text = numberToSpanishText(amount);
  return `$${formatted} ${text}`;
}
