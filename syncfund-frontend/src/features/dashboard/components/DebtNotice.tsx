import { useId } from 'react';
import { Link } from 'react-router-dom';
import { formatCOP } from '../../../styles/theme';
import type { Debt } from '../summary';
import './DebtNotice.css';

/**
 * Aviso de deuda, justo debajo de la cifra: a quién, cuánto, en qué proyecto y "Pagar".
 * "Pagar" abre el Detalle del proyecto con el panel de pago ya lleno (revisión antes de pagar).
 * El estado se dice en texto ("Debes"), no solo con el color.
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
            {/* Con acreedor conocido, el Detalle abre el pago ya lleno (?pagar=): "Pagar" cumple lo que
                dice. Sin acreedor solo se puede llevar al proyecto, y el texto lo dice.
                Secundario, para no competir con "Registrar movimiento", la acción de la página. */}
            {debt.toUserId !== null && debt.toName ? (
              <Link
                to={`/projects/${debt.projectId}?pagar=${debt.toUserId}`}
                className="sf-button sf-button--ghost debt-notice__pay"
                aria-label={`Pagarle ${formatCOP(debt.amount)} a ${debt.toName} en ${debt.projectName}`}
              >
                Pagar
              </Link>
            ) : (
              <Link
                to={`/projects/${debt.projectId}`}
                className="sf-button sf-button--ghost debt-notice__pay"
                aria-label={`Ir a ${debt.projectName} para pagar`}
              >
                Ir a pagar
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
