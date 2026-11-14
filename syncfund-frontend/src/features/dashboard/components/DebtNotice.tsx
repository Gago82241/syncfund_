import { useId } from 'react';
import { Link } from 'react-router-dom';
import { formatCOP } from '../../../styles/theme';
import type { Debt } from '../summary';
import './DebtNotice.css';

/**
 * Aviso de deuda, justo debajo de la cifra: a quién, cuánto, en qué proyecto y "Pagar".
 * El pago se hace en el Detalle del proyecto. El estado se dice en texto ("Debes"), no solo
 * con el color.
 */
export function DebtNotice({ debts }: { debts: Debt[] }) {
  const titleId = useId();
  const projectCount = new Set(debts.map((d) => d.projectId)).size;
  const title =
    projectCount === 1 ? 'Tienes un pago pendiente' : `Tienes pagos pendientes en ${projectCount} proyectos`;

  return (
    <section className="debt-notice" aria-labelledby={titleId}>
      <h2 id={titleId} className="debt-notice__title">{title}</h2>
      <ul className="debt-notice__list">
        {debts.map((debt, index) => (
          <li key={`${debt.projectId}-${index}`} className="debt-notice__row">
            <div className="debt-notice__text">
              <p className="debt-notice__what">
                <span className="debt-notice__label">Debes</span>{' '}
                <strong className="tabular-nums">{formatCOP(debt.amount)}</strong>
                {debt.toName && <> a {debt.toName}</>}
              </p>
              <p className="debt-notice__project">{debt.projectName}</p>
            </div>
            <Link
              to={`/projects/${debt.projectId}`}
              className="sf-button sf-button--primary debt-notice__pay"
              aria-label={`Pagar ${formatCOP(debt.amount)}${debt.toName ? ` a ${debt.toName}` : ''} en ${debt.projectName}`}
            >
              Pagar
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
