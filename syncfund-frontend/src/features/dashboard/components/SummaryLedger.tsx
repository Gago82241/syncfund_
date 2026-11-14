import { formatCOP } from '../../../styles/theme';
import type { DashboardSummary } from '../summary';
import './SummaryLedger.css';

/**
 * De dónde sale la cifra protagonista, como una suma de libro mayor:
 * Billetera + Te deben − Debes. El lector de pantalla oye "más" y "menos".
 */
export function SummaryLedger({ summary }: { summary: DashboardSummary }) {
  return (
    <dl className="summary-ledger">
      <div className="summary-ledger__item">
        <dt className="summary-ledger__term">Billetera</dt>
        <dd className="summary-ledger__amount tabular-nums">{formatCOP(summary.walletTotal)}</dd>
        {summary.cushion > 0 && (
          <dd className="summary-ledger__note tabular-nums">incluye colchón {formatCOP(summary.cushion)}</dd>
        )}
      </div>
      <div className="summary-ledger__item">
        <dt className="summary-ledger__term">
          <span className="summary-ledger__op" aria-hidden="true">+</span>
          <span className="visually-hidden">más </span>
          Te deben
        </dt>
        <dd className={`summary-ledger__amount tabular-nums${summary.owedToYou > 0 ? ' amount-gain' : ''}`}>
          {formatCOP(summary.owedToYou)}
        </dd>
      </div>
      <div className="summary-ledger__item">
        <dt className="summary-ledger__term">
          <span className="summary-ledger__op" aria-hidden="true">−</span>
          <span className="visually-hidden">menos </span>
          Debes
        </dt>
        <dd className={`summary-ledger__amount tabular-nums${summary.youOwe > 0 ? ' amount-loss' : ''}`}>
          {formatCOP(summary.youOwe)}
        </dd>
      </div>
    </dl>
  );
}
