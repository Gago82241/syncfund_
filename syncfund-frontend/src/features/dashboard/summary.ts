/**
 * Cálculos del Resumen, sin React ni peticiones: reciben lo que ya respondió el backend y
 * devuelven lo que se muestra. Así se pueden verificar con números a mano.
 *
 * "¿Cuánto tengo?" = lo que es del usuario y nada más:
 *   billetera (disponible + colchón) + su saldo neto en cada proyecto compartido.
 * No usa User.getGeneralSummary(), que suma el fondo completo de cada proyecto (con el dinero
 * de los compañeros) y deja fuera el colchón.
 */
import { HALF_CENT, settle } from '../shared-project/balance';
import { sortProjectLines, toProjectLine, type ProjectLine } from '../shared-project/projectLines';
import { toPesos, walletFigures } from '../personal-wallet/walletFigures';
import type {
  PersonalWalletResponse,
  ProjectBalancesResponse,
  SharedProjectResponse,
} from '../../types/api';

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
  /** En el orden de sortProjectLines: debes, a tu favor y al día. Aquí net nunca es null. */
  projects: ProjectLine[];
  debts: Debt[];
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
    const line = toProjectLine(userId, project, balances);
    const net = line.net;
    if (!balances || net === null) {
      throw new Error(`Falta tu saldo en el proyecto ${project.projectId}`);
    }
    lines.push(line);

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

  // Mismo orden que la lista de Proyectos compartidos.
  const sorted = sortProjectLines(lines);
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
