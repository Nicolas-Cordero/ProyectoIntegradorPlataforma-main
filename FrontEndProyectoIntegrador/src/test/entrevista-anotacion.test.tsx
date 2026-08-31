import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { EntrevistaEnCursoProvider } from '../context/EntrevistaEnCursoContext';
import { PanelEntrevistaFlotante } from '../components/entrevistas/PanelEntrevistaFlotante';
import EstudianteEntrevistas from '../pages/EstudianteSection/EstudianteEntrevistas';
import type { EstudianteOutletContext } from '../pages/EstudianteSection/EstudianteDetail';

const RUT = '20759653-1';

const contexto = {
  estudiante: { rut_estudiante: RUT, nombre: 'Juan', apellido: 'Pérez' },
  liceo: null,
  generacion: null,
  canEdit: true,
  refresh: () => {},
} as unknown as EstudianteOutletContext;

let urlsPedidas: string[] = [];

function fetchesDeEntrevistas(): number {
  return urlsPedidas.filter((u) => u.includes(`/entrevistas/estudiante/${RUT}`)).length;
}

function renderPagina() {
  return render(
    <MemoryRouter initialEntries={[`/estudiante/${RUT}/entrevistas`]}>
      <AuthProvider>
        <EntrevistaEnCursoProvider>
          <Routes>
            <Route element={<Outlet context={contexto} />}>
              <Route
                path="/estudiante/:rut/entrevistas"
                element={<EstudianteEntrevistas />}
              />
            </Route>
          </Routes>
          <PanelEntrevistaFlotante />
        </EntrevistaEnCursoProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  urlsPedidas = [];
  localStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      urlsPedidas.push(String(input));
      return new Response('[]', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('anotación de la entrevista en curso', () => {
  it('escribir en la anotación no vuelve a pedir la lista de entrevistas', async () => {
    const user = userEvent.setup();
    renderPagina();

    await waitFor(() => expect(fetchesDeEntrevistas()).toBe(1));

    await user.click(screen.getByRole('button', { name: /nueva entrevista/i }));

    // Al aparecer el borrador la lista se recarga una vez; eso es lo esperado.
    const caja = await screen.findByLabelText('Anotaciones de la entrevista');
    await waitFor(() => expect(fetchesDeEntrevistas()).toBe(2));
    const antesDeEscribir = fetchesDeEntrevistas();

    await user.type(caja, 'Conversamos sobre el semestre');

    expect(caja).toHaveValue('Conversamos sobre el semestre');
    // Ni una petición más, por muchos caracteres que se escriban.
    expect(fetchesDeEntrevistas()).toBe(antesDeEscribir);
  });

  it('alterna entre panel lateral e inferior, y conserva el modo al minimizar', async () => {
    const user = userEvent.setup();
    renderPagina();

    await waitFor(() => expect(fetchesDeEntrevistas()).toBe(1));
    await user.click(screen.getByRole('button', { name: /nueva entrevista/i }));

    // Arranca lateral: flotante a la derecha, sin reservar espacio abajo.
    const panel = (await screen.findByLabelText('Anotaciones de la entrevista'))
      .closest('div.fixed') as HTMLElement;
    expect(panel.style.width).toBe('600px');
    expect(document.body).not.toHaveClass('entrevista-panel-inferior');

    // Lateral → inferior: el panel se ancla al pie y la app cede la mitad baja.
    await user.click(screen.getByRole('button', { name: 'Panel inferior' }));
    await screen.findByRole('button', { name: 'Panel lateral' });
    const anclado = screen.getByLabelText('Anotaciones de la entrevista')
      .closest('div.fixed') as HTMLElement;
    expect(anclado.className).toContain('bottom-0');
    expect(anclado.style.width).toBe('');
    expect(document.body).toHaveClass('entrevista-panel-inferior');

    // Minimizar: se libera el espacio reservado, pero no se olvida el modo.
    await user.click(screen.getByRole('button', { name: 'Minimizar' }));
    await waitFor(() =>
      expect(document.body).not.toHaveClass('entrevista-panel-inferior'),
    );

    await user.click(screen.getByTitle('Restaurar entrevista en curso'));
    await screen.findByLabelText('Anotaciones de la entrevista');
    expect(screen.getByRole('button', { name: 'Panel lateral' })).toBeInTheDocument();
    expect(document.body).toHaveClass('entrevista-panel-inferior');

    // Inferior → lateral
    await user.click(screen.getByRole('button', { name: 'Panel lateral' }));
    await waitFor(() =>
      expect(document.body).not.toHaveClass('entrevista-panel-inferior'),
    );
  });

  it('el cuadro de anotación está disponible apenas se inicia la entrevista', async () => {
    const user = userEvent.setup();
    renderPagina();

    await waitFor(() => expect(fetchesDeEntrevistas()).toBe(1));
    expect(screen.queryByLabelText('Anotaciones de la entrevista')).toBeNull();

    await user.click(screen.getByRole('button', { name: /nueva entrevista/i }));

    // Sin pasar por ningún botón de "agregar comentario".
    expect(await screen.findByLabelText('Anotaciones de la entrevista')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /\+ Comentario/i })).toBeNull();
  });
});
