import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { categoryService } from '../services/categoryService';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { required, wholeAmountOrZero } from '../../../utils/validation';

export function CategoryForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } =
    useFormErrors(['name', 'monthlyLimit']);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = validate({
      name: required(name, 'El nombre de la categoría es obligatorio'),
      monthlyLimit: wholeAmountOrZero(monthlyLimit, {
        required: 'El límite mensual es obligatorio',
        negative: 'El límite mensual no puede ser negativo',
      }),
    });
    if (!valid) return;
    setLoading(true);
    try {
      await categoryService.create({ name, monthlyLimit: Number(monthlyLimit) });
      setName('');
      setMonthlyLimit('');
      onCreated();
    } catch (err) {
      showApiError(err, 'No se pudo crear la categoría.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ marginBottom: '2rem' }} noValidate>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Nueva categoría</h3>
      <Input
        label="Nombre"
        name="name"
        placeholder="Mercado, Transporte, Salidas..."
        value={name}
        error={fieldErrors.name}
        onChange={(e) => {
          setName(e.target.value);
          clearField('name');
        }}
        required
      />
      <Input
        label="Límite mensual (COP)"
        type="number"
        name="monthlyLimit"
        min="0"
        placeholder="Ej: 300000 (sin puntos)"
        value={monthlyLimit}
        error={fieldErrors.monthlyLimit}
        onChange={(e) => {
          setMonthlyLimit(e.target.value);
          clearField('monthlyLimit');
        }}
        required
      />
      <FormError message={formError} />
      <Button type="submit" loading={loading}>Crear categoría</Button>
    </form>
  );
}
