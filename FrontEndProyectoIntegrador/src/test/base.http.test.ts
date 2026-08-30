import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseHttpClient, SessionExpiredError } from '../services/base.http';

class ServicioDePrueba extends BaseHttpClient {
  getLiceos() { return this.request<{ rbd: number }[]>('/liceo'); }
  borrar()    { return this.request<void>('/algo', { method: 'DELETE' }); }
}

const svc = new ServicioDePrueba();

function responder(status: number, body = '', headers: Record<string, string> = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
    text: () => Promise.resolve(body),
    json: () => Promise.resolve(body ? JSON.parse(body) : {}),
  } as unknown as Response;
}

beforeEach(() => {
  // window.location.href = '/' no debe abortar nada en el test
  Object.defineProperty(window, 'location', {
    value: { href: 'http://localhost/' }, writable: true, configurable: true,
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('401 con refresh fallido (sesión caducada)', () => {
  it('RECHAZA en vez de resolver con undefined', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(responder(401))));
    await expect(svc.getLiceos()).rejects.toBeInstanceOf(SessionExpiredError);
  });

  it('ahora sí se dispara el .catch(() => []) del llamador', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(responder(401))));

    // Réplica de EstudiantesSection.tsx:81-85
    const [liceos] = await Promise.all([
      svc.getLiceos().catch(() => [] as { rbd: number }[]),
    ]);
    expect(liceos).toEqual([]);
    expect(() => new Map(liceos.map(l => [l.rbd, l]))).not.toThrow();
  });

  it('reproduce el crash anterior si el 401 resolviera con undefined', () => {
    const liceos = undefined as unknown as { rbd: number }[];
    expect(() => liceos.map(l => l.rbd)).toThrow(TypeError);
  });
});

describe('caminos que SÍ deben seguir devolviendo undefined', () => {
  it('204 sin cuerpo (DELETE)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(responder(204))));
    await expect(svc.borrar()).resolves.toBeUndefined();
  });

  it('200 con cuerpo vacío', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(responder(200, ''))));
    await expect(svc.borrar()).resolves.toBeUndefined();
  });
});

describe('el refresh exitoso sigue funcionando', () => {
  it('reintenta la petición original y devuelve los datos', async () => {
    let n = 0;
    vi.stubGlobal('fetch', vi.fn(() => {
      n++;
      if (n === 1) return Promise.resolve(responder(401));                    // original
      if (n === 2) return Promise.resolve(responder(200, '{"ok":true}'));      // /auth/refresh
      return Promise.resolve(responder(200, '[{"rbd":123}]'));                 // reintento
    }));
    await expect(svc.getLiceos()).resolves.toEqual([{ rbd: 123 }]);
  });
});
