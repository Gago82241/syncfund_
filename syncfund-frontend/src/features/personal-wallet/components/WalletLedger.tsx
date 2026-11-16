import { formatCOP } from '../../../styles/theme';
import type { WalletFigures } from '../walletFigures';
import './WalletLedger.css';

/**
 * De dónde sale el total de la billetera, como una suma de libro mayor: Disponible + Colchón,
 * y el total al pie bajo el filete. Es el mismo total que el renglón "Billetera" del Resumen.
 * Al apartar, el disponible baja y el colchón sube: el total no cambia.
 */
export function WalletLedger({ figures }: { figures: WalletFigures }) {
  return (
    <dl className="wallet-ledger">
      <div className="wallet-ledger__item">
        <dt className="wallet-ledger__term">Disponible</dt>
        <dd className="wallet-ledger__amount tabular-nums">{formatCOP(figures.available)}</dd>
      </div>
      <div className="wallet-ledger__item">
        <dt className="wallet-ledger__term">
          <span className="wallet-ledger__op" aria-hidden="true">+</span>
          <span className="visually-hidden">más </span>
          Colchón
        </dt>
        <dd className="wallet-ledger__amount tabular-nums">{formatCOP(figures.cushion)}</dd>
      </div>
      <div className="wallet-ledger__item wallet-ledger__item--total">
        <dt className="wallet-ledger__term">
          <span className="wallet-ledger__op" aria-hidden="true">=</span>
          <span className="visually-hidden">igual a </span>
          Total en tu billetera
        </dt>
        <dd className="wallet-ledger__amount tabular-nums">{formatCOP(figures.total)}</dd>
      </div>
    </dl>
  );
}
