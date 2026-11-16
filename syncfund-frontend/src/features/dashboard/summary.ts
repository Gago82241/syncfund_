/**
 * Cálculos del Resumen, sin React ni peticiones: reciben lo que ya respondió el backend y
 * devuelven lo que se muestra. Así se pueden verificar con números a mano.
 *
 * "¿Cuánto tengo?" = lo que es del usuario y nada más:
 *   billetera (disponible + colchón) + su saldo neto en cada proyecto compartido.
 * No usa User.getGeneralSummary(), que suma el fondo completo de cada proyecto (con el dinero
 * de los compañeros) y deja fuera el colchón.
 */
import { HALF_CENT } from '../shared-project/balance';
import { toPesos, walletFigures } from '../personal-wallet/walletFigures';
import { BUDGET_WARN_PERCENT, budgetPercent } from '../../utils/budget';
import type {
  CategoryResponse,
  PersonalWalletResponse,
  ProjectBalancesResponse,
  SharedProjectResponse,
} from '../../types/api';

export interface ProjectLine {
  projectId: number;
  name: string;
  memberCount: number;
  /** Saldo neto del usuario en el proyecto: positivo = a tu favor, negativo = debes. */
  net: number;
}

/** Una deuda del usuario: cuánto le debe pagar a quién, y en qué proyecto. */
export interface Debt {
  projectId: number;
  projectName: string;
  /** null solo si el backend no sugirió a quién pagarle (no debería pasar). */
  toUserId: number | null;
  toName: string | null;
  amount: number;
}

export interface DashboardSummary {
  /** Billetera + A tu favor − Debes. */
  total: number;
  /** Disponible + colchón: apartar al colchón no cambia cuánto tienes. */
  walletTotal: number;
  cushion: number;
  /**
   * Suma de los saldos netos a favor. No es lo que te deben: incluye tu parte del fondo que
   * aún no se gasta.
   */
  inYourFavor: number;
  /** Suma de los saldos netos en contra, en positivo. */
  youOwe: number;
  /** Primero los proyectos donde debes (la deuda mayor arriba); los demás en su orden. */
  projects: ProjectLine[];
  debts: Debt[];
}

/** Menos de medio centavo cuenta como cero (mismo criterio que el backend y MoneyStatus). */
function settle(amount: number): number {
  return Math.abs(amount) < HALF_CENT ? 0 : amount;
}

/**
 * @param balancesByProject situación de cada proyecto (GET /projects/{id}/balances), por projectId.
 * @throws Error si falta la situación de un proyecto o el usuario no aparece en ella: sin ese dato
 *         la cifra no sería cierta, y es mejor mostrar el error que un total incompleto.
 */
export function computeDashboardSummary(
  userId: number,
  wallet: PersonalWalletResponse,
  projects: SharedProjectResponse[],
  balancesByProject: ReadonlyMap<number, ProjectBalancesResponse>,
): DashboardSummary {
  const lines: ProjectLine[] = [];
  const debts: Debt[] = [];
  let inYourFavor = 0;
  let youOwe = 0;

  for (const project of projects) {
    const balances = balancesByProject.get(project.projectId);
    const me = balances?.members.find((m) => m.userId === userId);
    if (!balances || !me) {
      throw new Error(`Falta tu saldo en el proyecto ${project.projectId}`);
    }

    const net = settle(me.netBalance);
    lines.push({
      projectId: project.projectId,
      name: project.name,
      memberCount: project.memberIds.length,
      net,
    });

    if (net > 0) inYourFavor += net;
    if (net < 0) {
      youOwe += -net;
      const payments = balances.suggestedPayments.filter(
        (p) => p.fromUserId === userId && p.amount >= HALF_CENT,
      );
      if (payments.length === 0) {
        debts.push({ projectId: project.projectId, projectName: project.name, toUserId: null, toName: null, amount: -net });
      }
      for (const payment of payments) {
        const payee = balances.members.find((m) => m.userId === payment.toUserId);
        debts.push({
          projectId: project.projectId,
          projectName: project.name,
          toUserId: payment.toUserId,
          toName: payee?.name ?? null,
          amount: payment.amount,
        });
      }
    }
  }

  // Orden estable: las deudas suben (la mayor primero); el resto conserva el orden del backend.
  const sorted = lines
    .map((line, index) => ({ line, index }))
    .sort((a, b) => {
      const aDebt = a.line.net < 0;
      const bDebt = b.line.net < 0;
      if (aDebt && bDebt) return a.line.net - b.line.net || a.index - b.index;
      if (aDebt !== bDebt) return aDebt ? -1 : 1;
      return a.index - b.index;
    })
    .map(({ line }) => line);
  debts.sort((a, b) => b.amount - a.amount);

  // Cada parte se redondea a pesos antes de sumar, para que la cuenta que se ve en pantalla
  // (Billetera + A tu favor − Debes) dé exactamente el total mostrado.
  // El total de la billetera sale de walletFigures, igual que en la Billetera.
  const { total: walletTotal, cushion } = walletFigures(wallet);
  const roundedInYourFavor = toPesos(inYourFavor);
  const roundedYouOwe = toPesos(youOwe);

  return {
    total: walletTotal + roundedInYourFavor - roundedYouOwe || 0,
    walletTotal,
    cushion,
    inYourFavor: roundedInYourFavor,
    youOwe: roundedYouOwe,
    projects: sorted,
    debts,
  };
}

/**
 * Usuario nuevo: sin proyectos, sin dinero en la billetera y sin ningún movimiento.
 * `transactionCount` es null cuando no hizo falta pedir el historial (ya hay proyectos o saldo).
 */
export function isNewUser(
  wallet: PersonalWalletResponse,
  projects: SharedProjectResponse[],
  transactionCount: number | null,
): boolean {
  return (
    projects.length === 0 &&
    settle(wallet.currentBalance) === 0 &&
    settle(wallet.cushionBalance) === 0 &&
    transactionCount === 0
  );
}

/** Si hace falta pedir el historial para saber si el usuario es nuevo. */
export function needsHistoryCheck(wallet: PersonalWalletResponse, projects: SharedProjectResponse[]): boolean {
  return projects.length === 0 && settle(wallet.currentBalance) === 0 && settle(wallet.cushionBalance) === 0;
}

export interface BudgetAlert {
  categoryId: number;
  name: string;
  spent: number;
  limit: number;
  percent: number;
}

/** Categorías con límite que ya van en el 80 % o más este mes, de la más pasada a la menos. */
export function selectBudgetAlerts(
  categories: CategoryResponse[],
  spentByCategory: ReadonlyMap<number, number>,
): BudgetAlert[] {
  return categories
    .filter((c) => c.monthlyLimit > 0)
    .map((c) => {
      const spent = spentByCategory.get(c.categoryId) ?? 0;
      return {
        categoryId: c.categoryId,
        name: c.name,
        spent,
        limit: c.monthlyLimit,
        percent: budgetPercent(spent, c.monthlyLimit),
      };
    })
    .filter((alert) => alert.percent >= BUDGET_WARN_PERCENT)
    .sort((a, b) => b.percent - a.percent);
}
