import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Icon } from '../../../components/ui/Icon';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Sheet } from '../../../components/ui/Sheet';
import { Skeleton, SkeletonGroup, SkeletonRows } from '../../../components/ui/Skeleton';
import { formatCOP } from '../../../styles/theme';
import { CatalogCase, CatalogSection } from '../CatalogSection';

const ROWS = [
  { description: 'Mercado de la semana en el Éxito de Laureles', date: '12 de noviembre', amount: -184500 },
  { description: 'Salario de noviembre', date: '1 de noviembre', amount: 2400000 },
  { description: 'Arriendo', date: '1 de noviembre', amount: -950000 },
];

export function StructureSection() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <CatalogSection
        id="encabezado"
        title="Encabezado de página"
        description="Título (en las pantallas es el único h1; aquí se repite porque el catálogo los muestra todos), una cifra protagonista con su etiqueta, un dato secundario y la acción principal. Desde 1024 px la acción va a la derecha."
      >
        <CatalogCase label="Cifra neutra, dato secundario y acción">
          <div className="catalog-frame">
            <PageHeader
              title="Billetera personal"
              figure={{ label: 'Disponible', value: formatCOP(1250000) }}
              meta={`Total = disponible + colchón: ${formatCOP(1450000)}`}
              action={
                <Button>
                  <Icon name="agregar" />
                  Registrar movimiento
                </Button>
              }
            />
          </div>
        </CatalogCase>
        <CatalogCase label="A favor (esmeralda + texto) con fondo como dato secundario">
          <div className="catalog-frame">
            <PageHeader
              title="Apartamento Laureles"
              figure={{ label: 'Te deben', value: formatCOP(85000), tone: 'gain' }}
              meta={`Fondo del proyecto: ${formatCOP(450000)}`}
            />
          </div>
        </CatalogCase>
        <CatalogCase label="En contra (terracota + texto)">
          <div className="catalog-frame">
            <PageHeader
              title="Viaje a Santa Marta"
              figure={{ label: 'Debes', value: formatCOP(212300), tone: 'loss' }}
            />
          </div>
        </CatalogCase>
        <CatalogCase label="Cifra y título extremos: no deben salirse a 320 px">
          <div className="catalog-frame">
            <PageHeader
              title="Proyecto compartido con un nombre larguísimo para probar el ajuste de línea"
              figure={{ label: 'Disponible', value: formatCOP(123456789012) }}
              action={<Button>Registrar gasto</Button>}
            />
          </div>
        </CatalogCase>
        <CatalogCase label="Solo título (sin cifra)">
          <div className="catalog-frame">
            <PageHeader title="Categorías" meta="Noviembre de 2026" />
          </div>
        </CatalogCase>
      </CatalogSection>

      <CatalogSection
        id="hojas"
        title="Hojas"
        description="Papel blanco con línea fina y título de sección, sin sombra. En el celular el relleno es menor."
      >
        <div className="catalog__grid">
          <Sheet title="Movimientos" action={<a href="#hojas">Ver todo</a>}>
            <ul className="catalog-rows">
              {ROWS.map((row) => (
                <li key={row.description} className="catalog-rows__row">
                  <span className="catalog-rows__text">
                    <span className="catalog-rows__description">{row.description}</span>
                    <span className="catalog-rows__date">{row.date}</span>
                  </span>
                  <span className={`tabular-nums catalog-rows__amount ${row.amount > 0 ? 'amount-gain' : 'amount-loss'}`}>
                    {row.amount > 0 ? '+' : '−'}
                    {formatCOP(Math.abs(row.amount))}
                  </span>
                </li>
              ))}
            </ul>
          </Sheet>
          <Sheet title="Hoja vacía con EmptyState">
            <EmptyState
              icon="proyectos"
              title="Todavía no tienes proyectos"
              description="Un proyecto compartido reúne un fondo común y los gastos que pagan entre varios."
              action={<Button>Crea tu primer proyecto</Button>}
            />
          </Sheet>
        </div>
      </CatalogSection>

      <CatalogSection
        id="vacios"
        title="Estado vacío"
        description="Siempre con un siguiente paso concreto. El ícono y la descripción son opcionales."
      >
        <div className="catalog__grid">
          <CatalogCase label="Con dos acciones (usuario nuevo)">
            <EmptyState
              title="Empieza por tu billetera"
              description="Registra lo que tienes hoy y crea un proyecto para compartir gastos."
              action={
                <div className="catalog-inline-actions">
                  <Button>Registra tu primer ingreso</Button>
                  <Button variant="ghost">Crea un proyecto</Button>
                </div>
              }
            />
          </CatalogCase>
          <CatalogCase label="Solo título">
            <EmptyState title="No hay movimientos este mes" />
          </CatalogCase>
        </div>
      </CatalogSection>

      <CatalogSection
        id="esqueleto"
        title="Carga (Skeleton)"
        description="Bloques con la forma del contenido. El lector de pantalla anuncia &quot;Cargando…&quot; una sola vez. Con &quot;reducir movimiento&quot; el pulso se apaga."
      >
        <CatalogCase label="Alterna entre carga y contenido para comparar que no salte">
          <div className="catalog-stack">
            <Button variant="ghost" className="catalog-auto-width" onClick={() => setLoaded((v) => !v)}>
              {loaded ? 'Ver la carga' : 'Ver el contenido'}
            </Button>
            <Sheet title="Movimientos">
              {loaded ? (
                <ul className="catalog-rows">
                  {ROWS.map((row) => (
                    <li key={row.description} className="catalog-rows__row">
                      <span className="catalog-rows__text">
                        <span className="catalog-rows__description">{row.description}</span>
                        <span className="catalog-rows__date">{row.date}</span>
                      </span>
                      <span className={`tabular-nums catalog-rows__amount ${row.amount > 0 ? 'amount-gain' : 'amount-loss'}`}>
                        {row.amount > 0 ? '+' : '−'}
                        {formatCOP(Math.abs(row.amount))}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <SkeletonGroup label="Cargando movimientos…">
                  <SkeletonRows count={3} />
                </SkeletonGroup>
              )}
            </Sheet>
          </div>
        </CatalogCase>
        <CatalogCase label="Cifra protagonista y bloque libre">
          <SkeletonGroup>
            <Skeleton variant="line" width="6rem" />
            <Skeleton variant="figure" />
            <Skeleton variant="block" height="3rem" />
          </SkeletonGroup>
        </CatalogCase>
      </CatalogSection>
    </>
  );
}
