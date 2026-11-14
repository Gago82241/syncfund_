import { useState } from 'react';
import { MoneyStatus } from '../../../components/ui/MoneyStatus';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { CatalogCase, CatalogSection } from '../CatalogSection';

const BUDGET_CASES = [
  { label: 'Mercado', value: 0 },
  { label: 'Transporte', value: 45000 },
  { label: 'Salidas', value: 85000 },
  { label: 'Servicios', value: 100000 },
  { label: 'Ropa y calzado con un nombre de categoría bastante largo', value: 130000 },
];

export function MoneySection() {
  const [spent, setSpent] = useState(60000);

  return (
    <>
      <CatalogSection
        id="estado"
        title="Estado del saldo (MoneyStatus)"
        description="Siempre en texto. Menos de medio centavo cuenta como &quot;Al día&quot;, igual que en el backend."
      >
        <div className="catalog__grid">
          <CatalogCase label="Hablándole al usuario: +85.000, −212.300, 0 y residuo −0,0033">
            <div className="catalog-inline-actions">
              <MoneyStatus amount={85000} />
              <MoneyStatus amount={-212300} />
              <MoneyStatus amount={0} />
              <MoneyStatus amount={-0.0033} />
            </div>
          </CatalogCase>
          <CatalogCase label="Sobre otro integrante (tabla de situación)">
            <div className="catalog-inline-actions">
              <MoneyStatus amount={85000} subject="other" />
              <MoneyStatus amount={-212300} subject="other" />
              <MoneyStatus amount={0} subject="other" />
            </div>
          </CatalogCase>
          <CatalogCase label="Monto enorme">
            <MoneyStatus amount={-123456789012} />
          </CatalogCase>
        </div>
      </CatalogSection>

      <CatalogSection
        id="progreso"
        title="Barra de progreso"
        description="El estado va en texto además del color. Presupuesto: aviso ámbar desde 80 % y terracota desde 100 %. La barra se llena hasta 100 % y el texto dice el porcentaje real."
      >
        <div className="catalog__grid">
          <CatalogCase label="Presupuesto de 100.000 en 0, 45, 85, 100 y 130 %">
            <div className="catalog-stack catalog-stack--loose">
              {BUDGET_CASES.map((c) => (
                <ProgressBar key={c.label} label={c.label} value={c.value} max={100000} />
              ))}
            </div>
          </CatalogCase>
          <CatalogCase label="Meta de ahorro: avance y meta cumplida">
            <div className="catalog-stack catalog-stack--loose">
              <ProgressBar kind="goal" label="Meta de noviembre" value={320000} max={800000} />
              <ProgressBar kind="goal" label="Meta de octubre" value={800000} max={800000} />
            </div>
          </CatalogCase>
          <CatalogCase label="Interactiva: mueve el control (gastado de 100.000)">
            <div className="catalog-stack catalog-stack--loose">
              <label className="catalog-range">
                <span>Gastado</span>
                <input
                  type="range"
                  min={0}
                  max={150000}
                  step={5000}
                  value={spent}
                  onChange={(e) => setSpent(Number(e.target.value))}
                />
              </label>
              <ProgressBar label="Mercado" value={spent} max={100000} />
            </div>
          </CatalogCase>
        </div>
      </CatalogSection>
    </>
  );
}
