import { formatCOP } from '../../../styles/theme';
import type { NetBalanceResponse, SharedProjectResponse } from '../../../types/api';
import './ProjectSummaryCard.css';

interface Props {
  project: SharedProjectResponse;
  netBalance: NetBalanceResponse;
}

/** netBalance > 0: te deben. < 0: debes. = 0: en paz y salvo (DebtCalculator). */
export function ProjectSummaryCard({ project, netBalance }: Props) {
  const isPositive = netBalance.netBalance > 0;
  const isZero = netBalance.netBalance === 0;

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
