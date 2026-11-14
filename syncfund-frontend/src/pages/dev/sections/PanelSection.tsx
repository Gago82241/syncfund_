import { useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { MoneyInput } from '../../../components/ui/MoneyInput';
import { Panel } from '../../../components/ui/Panel';
import { formatCOP } from '../../../styles/theme';
import { required, wholeAmount } from '../../../utils/validation';
import { CatalogCase, CatalogSection } from '../CatalogSection';

const FUND = 450000;

export function PanelSection() {
  const [formOpen, setFormOpen] = useState(false);
  const [longOpen, setLongOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<{ description?: string; amount?: string }>({});
  const [lastSaved, setLastSaved] = useState<string>();

  function closeForm() {
    setFormOpen(false);
    setErrors({});
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = {
      description: required(description, 'Escribe una descripción'),
      amount: wholeAmount(amount),
    };
    setErrors(next);
    if (next.description || next.amount) return;
    setLastSaved(`${description}: ${formatCOP(Number(amount))}`);
    setDescription('');
    setAmount('');
    setFormOpen(false);
  }

  return (
    <CatalogSection
      id="panel"
      title="Panel"
      description="Hoja que sube desde abajo en el celular y panel lateral de 420 px desde 1024 px. Se cierra con Esc, con Cerrar o tocando el velo; el foco queda dentro y vuelve al botón que lo abrió."
    >
      <div className="catalog__grid">
        <CatalogCase label="Formulario con pie fijo (prueba enviarlo vacío)">
          <div className="catalog-stack">
            <Button className="catalog-auto-width" onClick={() => setFormOpen(true)}>
              <Icon name="agregar" />
              Registrar gasto
            </Button>
            {lastSaved && <p className="catalog-raw">Último gasto guardado: {lastSaved}</p>}
          </div>
        </CatalogCase>
        <CatalogCase label="Contenido largo: se desplaza dentro del panel, no la página">
          <Button variant="ghost" className="catalog-auto-width" onClick={() => setLongOpen(true)}>
            Ver reglas del proyecto
          </Button>
        </CatalogCase>
      </div>

      <Panel
        open={formOpen}
        onClose={closeForm}
        title="Registrar gasto"
        description={`El fondo paga el gasto. Disponible en el fondo: ${formatCOP(FUND)}.`}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit" form="catalog-expense-form">
              Registrar gasto
            </Button>
          </>
        }
      >
        <form id="catalog-expense-form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Descripción"
            name="catalog-panel-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            data-autofocus
          />
          <MoneyInput
            label="Monto"
            name="catalog-panel-amount"
            value={amount}
            onValueChange={setAmount}
            error={errors.amount}
            tone="loss"
            preview={(v) => `Vas a registrar un gasto de ${formatCOP(v)}`}
          />
        </form>
      </Panel>

      <Panel open={longOpen} onClose={() => setLongOpen(false)} title="Reglas del proyecto">
        <div className="catalog-long">
          {Array.from({ length: 14 }, (_, i) => (
            <p key={i}>
              Regla {i + 1}. Un gasto compartido que supera el fondo se rechaza; el administrador no puede
              salir ni ser eliminado, y solo sale del proyecto quien está al día.
            </p>
          ))}
        </div>
      </Panel>
    </CatalogSection>
  );
}
