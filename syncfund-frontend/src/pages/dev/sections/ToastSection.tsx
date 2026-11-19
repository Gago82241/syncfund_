import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/toast/useToast';
import { CatalogCase, CatalogSection } from '../CatalogSection';

const MESSAGES = ['Aporte registrado', 'Meta de ahorro guardada', 'Proyecto creado', 'Pago registrado: quedaste al día'];

export function ToastSection() {
  const { showToast } = useToast();

  return (
    <CatalogSection
      id="avisos"
      title="Avisos (Toast)"
      description="Abajo en el celular y abajo a la derecha en escritorio. Se van solos a los 4 s; el tiempo se pausa con el cursor encima o con el foco dentro. Se ven máximo 3. El lector de pantalla anuncia cada aviso."
    >
      <div className="catalog__grid">
        <CatalogCase label="Un aviso">
          <Button className="catalog-auto-width" onClick={() => showToast('Aporte registrado')}>
            Mostrar aviso
          </Button>
        </CatalogCase>
        <CatalogCase label="Cuatro seguidos (solo quedan los 3 últimos)">
          <Button variant="ghost" className="catalog-auto-width" onClick={() => MESSAGES.forEach((m) => showToast(m))}>
            Mostrar cuatro avisos
          </Button>
        </CatalogCase>
        <CatalogCase label="Texto muy largo">
          <Button
            variant="ghost"
            className="catalog-auto-width"
            onClick={() =>
              showToast('Pago registrado: de tu billetera a la de María Fernanda Restrepo Echeverri; el fondo del proyecto no cambia')
            }
          >
            Mostrar aviso largo
          </Button>
        </CatalogCase>
      </div>
    </CatalogSection>
  );
}
