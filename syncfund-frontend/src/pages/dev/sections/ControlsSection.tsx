import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { CatalogCase, CatalogSection } from '../CatalogSection';

const VARIANTS = [
  { variant: 'primary', label: 'Principal', text: 'Registrar movimiento' },
  { variant: 'ghost', label: 'Fantasma', text: 'Cancelar' },
  { variant: 'danger', label: 'Peligro', text: 'Salir del proyecto' },
] as const;

export function ControlsSection() {
  const [loading, setLoading] = useState(false);

  function simulateLoading() {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 2000);
  }

  return (
    <>
      <CatalogSection
        id="botones"
        title="Botones"
        description="Pasa el cursor (solo con mouse) y mantén presionado: el botón se oscurece y baja 1 px. Alto mínimo de 44 px. Recorre con Tab para ver el foco."
      >
        <div className="catalog__grid">
          {VARIANTS.map(({ variant, label, text }) => (
            <CatalogCase key={variant} label={`${label}: normal, deshabilitado, cargando, ancho del contenido`}>
              <div className="catalog-stack">
                <Button variant={variant}>{text}</Button>
                <Button variant={variant} disabled>
                  {text}
                </Button>
                <Button variant={variant} loading>
                  {text}
                </Button>
                <Button variant={variant} className="catalog-auto-width">
                  {text}
                </Button>
              </div>
            </CatalogCase>
          ))}
          <CatalogCase label="Cargando al hacer clic (2 s) y con ícono">
            <div className="catalog-stack">
              <Button onClick={simulateLoading} loading={loading}>
                Guardar meta
              </Button>
              <Button variant="ghost">
                <Icon name="agregar" />
                Agregar integrante
              </Button>
            </div>
          </CatalogCase>
        </div>
      </CatalogSection>

      <CatalogSection
        id="campos"
        title="Campos"
        description="Borde field-border (3:1), foco con borde y anillo azul acero, ayuda debajo del campo y letra de 16 px para que el iPhone no haga zoom."
      >
        <div className="catalog__grid">
          <CatalogCase label="Normal">
            <Input label="Nombre del proyecto" name="catalog-name" placeholder="Apartamento Laureles" />
          </CatalogCase>
          <CatalogCase label="Con ayuda debajo">
            <Input
              label="Correo del integrante"
              name="catalog-email"
              type="email"
              hint="Debe tener una cuenta en SyncFund."
            />
          </CatalogCase>
          <CatalogCase label="Con error">
            <Input
              label="Descripción"
              name="catalog-description"
              defaultValue=""
              error="Escribe una descripción."
            />
          </CatalogCase>
          <CatalogCase label="Deshabilitado">
            <Input label="Fondo del proyecto" name="catalog-disabled" defaultValue="$ 450.000" disabled />
          </CatalogCase>
        </div>
      </CatalogSection>
    </>
  );
}
