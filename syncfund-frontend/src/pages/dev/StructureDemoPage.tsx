import { AppLayout } from '../../components/layout/AppLayout';
import { PageColumns } from '../../components/layout/PageColumns';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { PageHeader } from '../../components/ui/PageHeader';
import { Sheet } from '../../components/ui/Sheet';
import { useToast } from '../../components/ui/toast/useToast';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatCOP } from '../../styles/theme';
import './StructureDemoPage.css';

const ROWS = [
  { description: 'Mercado de la semana en el Éxito de Laureles', date: '12 de noviembre', amount: -184500 },
  { description: 'Salario de noviembre', date: '1 de noviembre', amount: 2400000 },
  { description: 'Arriendo', date: '1 de noviembre', amount: -950000 },
  { description: 'Pasajes del metro', date: '30 de octubre', amount: -42000 },
];

/**
 * Demo de la estructura de la app, solo en desarrollo (ver AppRouter). Muestra AppLayout con
 * una página larga en hojas de una y dos columnas, y la acción principal fija en el celular,
 * para comprobar que no tapa ni el último renglón ni los avisos.
 */
export default function StructureDemoPage() {
  useDocumentTitle('Estructura de la app · SyncFund');
  const { showToast } = useToast();

  return (
    <AppLayout>
      <PageHeader
        title="Billetera personal (demo)"
        figure={{ label: 'Disponible', value: formatCOP(1250000) }}
        meta={`Total = disponible + colchón: ${formatCOP(1450000)}`}
        fixedActionOnMobile
        action={
          <Button onClick={() => showToast('Movimiento registrado')}>
            <Icon name="agregar" />
            Registrar movimiento
          </Button>
        }
      />

      <PageColumns variant="main-aside">
        <Sheet title="Movimientos">
          <ul className="structure-demo__rows">
            {[...ROWS, ...ROWS, ...ROWS].map((row, index) => (
              <li key={index} className="structure-demo__row">
                <span className="structure-demo__text">
                  <span className="structure-demo__description">{row.description}</span>
                  <span className="structure-demo__date">{row.date}</span>
                </span>
                <span className={`tabular-nums structure-demo__amount ${row.amount < 0 ? 'amount-loss' : 'amount-gain'}`}>
                  {row.amount < 0 ? '−' : '+'}
                  {formatCOP(Math.abs(row.amount))}
                </span>
              </li>
            ))}
          </ul>
        </Sheet>
        <div className="structure-demo__stack">
          <Sheet title="Meta de ahorro">
            <p>Con dos columnas (contenido de 52rem o más) esta hoja va a la derecha; si no, debajo.</p>
          </Sheet>
          <Sheet title="Colchón">
            <p>Prueba el aviso con el botón principal: debe aparecer por encima de él en el celular.</p>
          </Sheet>
        </div>
      </PageColumns>

      <PageColumns className="structure-demo__equal">
        <Sheet title="Columna izquierda">
          <p>Dos columnas iguales, como Situación y Movimientos del proyecto.</p>
        </Sheet>
        <Sheet title="Columna derecha">
          <p className="structure-demo__last">
            Último renglón de la página: debe verse completo por encima del botón fijo.
          </p>
        </Sheet>
      </PageColumns>
    </AppLayout>
  );
}
