import { formatCOP } from '../../../styles/theme';
import type { PersonalWalletResponse } from '../../../types/api';
import './WalletSummaryCard.css';

export function WalletSummaryCard({ wallet }: { wallet: PersonalWalletResponse }) {
  return (
    <section className="wallet-summary">
      <div className="wallet-summary__main">
        <span className="wallet-summary__label">{wallet.name}</span>
        <p className="wallet-summary__balance tabular-nums">{formatCOP(wallet.currentBalance)}</p>
      </div>
      <div className="wallet-summary__row">
        <div>
          <span className="wallet-summary__label">Meta de ahorro mensual</span>
          <p className="tabular-nums">{formatCOP(wallet.monthlySavingsGoal)}</p>
        </div>
        <div>
          <span className="wallet-summary__label">Colchón apartado</span>
          <p className="tabular-nums">{formatCOP(wallet.cushionBalance)}</p>
        </div>
      </div>
    </section>
  );
}
