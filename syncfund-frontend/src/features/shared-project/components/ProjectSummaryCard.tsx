import { formatCOP } from '../../../styles/theme';
import type { NetBalanceResponse, SharedProjectResponse } from '../../../types/api';
import { HALF_CENT } from '../balance';
import './ProjectSummaryCard.css';

interface Props {
  project: SharedProjectResponse;
  netBalance: NetBalanceResponse;
}

/**
 * netBalance > 0: te deben. < 0: debes. Menos de medio centavo: en paz y salvo (DebtCalculator),
 * con el mismo umbral que la tabla de situación.
 */
export function ProjectSummaryCard({ project, netBalance }: Props) {
  const isPositive = netBalance.netBalance > HALF_CENT;
  const isZero = Math.abs(netBalance.netBalance) <= HALF_CENT;

  return (
    <section className="project-summary">
      <div>
        <span className="project-summary__label">Fondo del proyecto</span>
        <p className="project-summary__fund tabular-nums">{formatCOP(project.currentBalance)}</p>
      </div>
      <div>
        <span className="project-summary__label">
          {isZero ? 'Tu situación' : isPositive ? 'Te deben' : 'Debes'}
        </span>
        <p className={`project-summary__net tabular-nums ${isZero ? '' : isPositive ? 'amount-gain' : 'amount-loss'}`}>
          {isZero ? 'En paz y salvo' : formatCOP(Math.abs(netBalance.netBalance))}
        </p>
      </div>
    </section>
  );
}
