import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BeneficioCard } from '../components/features/estudiante-detalles/beneficios/BeneficioCard';
import type { Beneficio, BeneficioEstudiante } from '../types';

const beneficio: Beneficio = {
  codigo_beneficio: 7, nombre: 'Beca Goudie', proveedor: 'Fundación', tipo: 'ARANCEL',
};
const asignacion: BeneficioEstudiante = {
  codigo_beneficio: 7, rut_estudiante: '12345678-9', estado: 'EN_TRAMITE', inicio: '2026-03-01T00:00:00.000Z',
};

afterEach(() => vi.restoreAllMocks());

describe('cambio de estado desde la tarjeta', () => {
  it('muestra el estado actual y permite pasar a ACTIVO', async () => {
    const onActualizar = vi.fn().mockResolvedValue(undefined);
    render(<BeneficioCard asignacion={asignacion} beneficio={beneficio} canEdit
      onEliminar={() => {}} onActualizar={onActualizar} />);

    const select = screen.getByLabelText('Estado de Beca Goudie') as HTMLSelectElement;
    expect(select.value).toBe('EN_TRAMITE');

    await userEvent.selectOptions(select, 'ACTIVO');
    await waitFor(() => expect(onActualizar).toHaveBeenCalledWith({ estado: 'ACTIVO' }));
    expect(onActualizar).toHaveBeenCalledTimes(1);
  });

  it('ofrece los cinco estados del ciclo de vida', () => {
    render(<BeneficioCard asignacion={asignacion} beneficio={beneficio} canEdit
      onEliminar={() => {}} onActualizar={vi.fn()} />);
    const opciones = Array.from(
      (screen.getByLabelText('Estado de Beca Goudie') as HTMLSelectElement).options
    ).map(o => o.value);
    expect(opciones).toEqual(['EN_TRAMITE', 'ACTIVO', 'SUSPENDIDO', 'RECHAZADO', 'FINALIZADO']);
  });

  it('sin permiso de edición NO hay selector, solo el chip', () => {
    render(<BeneficioCard asignacion={asignacion} beneficio={beneficio} canEdit={false}
      onEliminar={() => {}} onActualizar={vi.fn()} />);
    expect(screen.queryByLabelText('Estado de Beca Goudie')).toBeNull();
    expect(screen.getByText('En trámite')).toBeTruthy();
  });

  it('si el PATCH falla, la tarjeta sigue mostrando el estado guardado', async () => {
    const onActualizar = vi.fn().mockResolvedValue(undefined); // el padre captura el error
    const { rerender } = render(<BeneficioCard asignacion={asignacion} beneficio={beneficio} canEdit
      onEliminar={() => {}} onActualizar={onActualizar} />);

    await userEvent.selectOptions(screen.getByLabelText('Estado de Beca Goudie'), 'SUSPENDIDO');
    // El padre no actualizó su estado porque el PATCH falló: re-render con el original.
    rerender(<BeneficioCard asignacion={asignacion} beneficio={beneficio} canEdit
      onEliminar={() => {}} onActualizar={onActualizar} />);
    await waitFor(() =>
      expect((screen.getByLabelText('Estado de Beca Goudie') as HTMLSelectElement).value)
        .toBe('EN_TRAMITE')
    );
  });

  it('la fecha de inicio se muestra sin desfase de zona horaria', () => {
    render(<BeneficioCard asignacion={asignacion} beneficio={beneficio} canEdit
      onEliminar={() => {}} onActualizar={vi.fn()} />);
    // inicio = 2026-03-01T00:00:00.000Z -> el input debe decir 2026-03-01, no 02-28
    expect((screen.getByLabelText('Fecha de inicio de Beca Goudie') as HTMLInputElement).value)
      .toBe('2026-03-01');
  });

  it('cambiar la fecha de inicio dispara el guardado', async () => {
    const onActualizar = vi.fn().mockResolvedValue(undefined);
    render(<BeneficioCard asignacion={asignacion} beneficio={beneficio} canEdit
      onEliminar={() => {}} onActualizar={onActualizar} />);

    // Los inputs type=date no se escriben carácter a carácter en jsdom: el
    // navegador emite un change con la fecha completa, que es lo que se simula.
    fireEvent.change(screen.getByLabelText('Fecha de inicio de Beca Goudie'), {
      target: { value: '2026-04-15' },
    });

    await waitFor(() => expect(onActualizar).toHaveBeenCalledWith({ inicio: '2026-04-15' }));
  });

  it('sin permiso de edición la fecha es texto, no input', () => {
    render(<BeneficioCard asignacion={asignacion} beneficio={beneficio} canEdit={false}
      onEliminar={() => {}} onActualizar={vi.fn()} />);
    expect(screen.queryByLabelText('Fecha de inicio de Beca Goudie')).toBeNull();
    expect(screen.getByText('01-03-2026')).toBeTruthy();
  });

  it('un estado desconocido no tumba la vista (chip neutro)', () => {
    const raro = { ...asignacion, estado: undefined as unknown as BeneficioEstudiante['estado'] };
    render(<BeneficioCard asignacion={raro} beneficio={beneficio} canEdit={false}
      onEliminar={() => {}} onActualizar={vi.fn()} />);
    expect(screen.getByText('Beca Goudie')).toBeTruthy();
  });
});
