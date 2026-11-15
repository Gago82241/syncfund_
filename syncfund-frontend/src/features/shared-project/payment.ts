/**
 * Reglas del pago entre integrantes, sin React: las usan la tabla de situación, la línea
 * "Para quedar al día" del encabezado y la intención de pago que llega desde el Resumen
 * (?pagar=). Así las tres deciden igual a quién se le puede pagar y cuánto se sugiere.
 */
import { HALF_CENT } from './balance';
import type { MemberBalance, ProjectBalancesResponse } from '../../types/api';

export interface PaymentOption {
  payee: MemberBalance;
  /** Monto sugerido, en pesos y con centavos si los hay. */
  amount: number;
}

/** Lo que debe el usuario en el proyecto, en positivo; 0 si no debe. */
export function debtOf(balances: ProjectBalancesResponse, userId: number): number {
  const me = balances.members.find((m) => m.userId === userId);
  return me && me.netBalance < -HALF_CENT ? -me.netBalance : 0;
}

/**
 * El integrante al que el usuario le puede pagar, o null: el usuario debe, la otra persona
 * está en el proyecto, no es él mismo y tiene saldo a favor (misma regla que el backend).
 */
export function payableMember(
  balances: ProjectBalancesResponse,
  userId: number,
  payeeId: number,
): MemberBalance | null {
  if (payeeId === userId || debtOf(balances, userId) === 0) return null;
  const payee = balances.members.find((m) => m.userId === payeeId);
  return payee && payee.netBalance > HALF_CENT ? payee : null;
}

/** El pago que sugiere el backend; si no hay, lo que cubre la deuda sin pasar el saldo a favor. */
export function suggestedAmount(balances: ProjectBalancesResponse, userId: number, payee: MemberBalance): number {
  const suggestion = balances.suggestedPayments.find(
    (p) => p.fromUserId === userId && p.toUserId === payee.userId,
  );
  return suggestion ? suggestion.amount : Math.min(debtOf(balances, userId), payee.netBalance);
}

/** Los pagos sugeridos para que el usuario quede al día (vacío si no debe). */
export function paymentsToSettle(balances: ProjectBalancesResponse, userId: number): PaymentOption[] {
  return balances.suggestedPayments
    .filter((p) => p.fromUserId === userId && p.amount >= HALF_CENT)
    .map((p) => {
      const payee = payableMember(balances, userId, p.toUserId);
      return payee ? { payee, amount: p.amount } : null;
    })
    .filter((option): option is PaymentOption => option !== null);
}
