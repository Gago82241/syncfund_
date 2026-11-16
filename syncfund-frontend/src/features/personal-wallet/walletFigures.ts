/**
 * Cálculos de la Billetera, sin React ni peticiones: reciben lo que ya respondió el backend y
 * devuelven lo que se muestra. Así se pueden verificar con números a mano.
 */
import { HALF_CENT } from '../shared-project/balance';
import type { PersonalWalletResponse, TransactionResponse } from '../../types/api';

/** Menos de medio centavo cuenta como cero; luego a pesos enteros, como los muestra formatCOP. */
export function toPesos(amount: number): number {
  const settled = Math.abs(amount) < HALF_CENT ? 0 : amount;
  return Math.round(settled) || 0; // || 0 evita mostrar "-0"
}

export interface WalletFigures {
  /** Lo que se puede gastar: currentBalance (apartar al colchón ya lo descuenta). */
  available: number;
  cushion: number;
  /** Disponible + colchón: apartar al colchón no cambia cuánto tienes. */
  total: number;
}

/**
 * Las cifras de la billetera. Cada parte se redondea a pesos antes de sumar, para que la cuenta
 * que se ve (disponible + colchón) dé exactamente el total. El Resumen usa esta misma función,
 * así las dos pantallas muestran siempre el mismo total.
 */
export function walletFigures(wallet: PersonalWalletResponse): WalletFigures {
  const available = toPesos(wallet.currentBalance);
  const cushion = toPesos(wallet.cushionBalance);
  return { available, cushion, total: available + cushion || 0 };
}

/*
 * Aportes y pagos entre integrantes llegan a la billetera como GASTO o INGRESO comunes, sin marca
 * de origen. Se reconocen por la descripción exacta que les pone el backend
 * (SharedProjectAppService): "Aporte a «Proyecto»", "Pago a Ana – «Proyecto»" y
 * "Pago de Diego – «Proyecto»". El total del mes no depende de esta separación.
 */
const CONTRIBUTION = /^Aporte a «.+»$/;
const PAYMENT_MADE = /^Pago a .+ – «.+»$/;
const PAYMENT_RECEIVED = /^Pago de .+ – «.+»$/;

export type SavingsLineKind = 'income' | 'expenses' | 'contributions' | 'payments';

export interface SavingsLine {
  kind: SavingsLineKind;
  label: string;
  /** Con signo: positivo entra a la billetera, negativo sale. */
  amount: number;
}

export interface MonthSavings {
  /** Solo los renglones que tuvieron movimientos en el mes, en orden fijo. */
  lines: SavingsLine[];
  /** Todo lo que entró − todo lo que salió. Negativo: salió más de lo que entró. */
  total: number;
}

const LABELS: Record<SavingsLineKind, string> = {
  income: 'Ingresos',
  expenses: 'Gastos',
  contributions: 'Aportes a proyectos',
  payments: 'Pagos entre integrantes',
};

const ORDER: SavingsLineKind[] = ['income', 'expenses', 'contributions', 'payments'];

/**
 * Ahorro del mes = todo lo que entra − todo lo que sale de la billetera en el mes.
 * El mes sale de la fecha que guarda el backend ("yyyy-MM" de dateTime), el mismo criterio con
 * que el backend suma el gasto de cada categoría. El colchón no cuenta: no es un movimiento.
 */
export function monthSavings(transactions: TransactionResponse[], monthKey: string): MonthSavings {
  const sums: Record<SavingsLineKind, number> = { income: 0, expenses: 0, contributions: 0, payments: 0 };
  const seen = new Set<SavingsLineKind>();

  for (const tx of transactions) {
    if (tx.dateTime.slice(0, 7) !== monthKey) continue;
    let kind: SavingsLineKind;
    let signed: number;
    if (tx.type === 'INGRESO') {
      kind = PAYMENT_RECEIVED.test(tx.description) ? 'payments' : 'income';
      signed = tx.amount;
    } else if (tx.type === 'GASTO') {
      if (CONTRIBUTION.test(tx.description)) kind = 'contributions';
      else if (PAYMENT_MADE.test(tx.description)) kind = 'payments';
      else kind = 'expenses';
      signed = -tx.amount;
    } else {
      // ABONO y COBRO solo existen en el fondo del proyecto; en la billetera no deberían llegar.
      continue;
    }
    sums[kind] += signed;
    seen.add(kind);
  }

  const lines = ORDER.filter((kind) => seen.has(kind)).map((kind) => ({
    kind,
    label: LABELS[kind],
    amount: toPesos(sums[kind]),
  }));
  // Se suma lo redondeado, para que la cuenta en pantalla dé exactamente el total.
  const total = lines.reduce((acc, line) => acc + line.amount, 0) || 0;
  return { lines, total };
}
