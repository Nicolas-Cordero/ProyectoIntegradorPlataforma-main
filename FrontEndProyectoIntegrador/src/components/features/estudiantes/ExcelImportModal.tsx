import React, { useState, useRef } from 'react';
import { Modal, Alert, Button } from '../../ui';
import { estudianteService, liceoService } from '../../../services';
import { descargarPlantillaEstudiantes, COLUMNAS_PLANTILLA } from '../../../utils/estudianteImport/plantilla';
import {
  leerArchivoEstudiantes,
  validarImportacion,
  type ResultadoImportacion,
} from '../../../utils/estudianteImport/parser';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  generacionId: number;
  generacionAño: number;
}

type ImportStatus = 'idle' | 'validando' | 'preview' | 'importing' | 'done';

const TH =
  'py-2 px-3 text-left text-xs font-bold text-gray-600 bg-gray-100 border-b border-gray-200 whitespace-nowrap';
const TD_BASE =
  'py-1.5 px-3 text-xs border-b border-gray-100 max-w-[160px] truncate';

export const ExcelImportModal: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  generacionId,
  generacionAño,
}) => {
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
  const [error, setError] = useState('');
  const [creados, setCreados] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStatus('idle');
    setResultado(null);
    setError('');
    setCreados(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => {
    if (status === 'importing' || status === 'validando') return;
    reset();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setStatus('validando');
    try {
      // Leer el archivo y, en paralelo, traer los datos del sistema necesarios
      // para validar unicidad (RUT/email) y la existencia del RBD del liceo.
      const [matriz, estudiantes, liceos] = await Promise.all([
        leerArchivoEstudiantes(file),
        estudianteService.getAll(),
        liceoService.getAll(),
      ]);

      const resultadoValidacion = validarImportacion(matriz, {
        generacionId,
        rutsExistentes: new Set(estudiantes.map((es) => es.rut_estudiante)),
        emailsExistentes: new Set(
          estudiantes.map((es) => es.email.toLowerCase()),
        ),
        rbdsValidos: new Set(liceos.map((l) => l.rbd)),
      });

      setResultado(resultadoValidacion);
      setStatus('preview');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'No se pudo procesar el archivo.',
      );
      setStatus('idle');
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!resultado?.puedeImportar) return;
    const dtos = resultado.filas
      .filter((f) => f.valida && f.dto)
      .map((f) => f.dto!);

    setStatus('importing');
    setError('');
    try {
      const res = await estudianteService.createMany(dtos);
      setCreados(res.creados);
      setStatus('done');
      onSuccess();
    } catch (err: unknown) {
      // Ante cualquier fallo volvemos al preview con el mensaje: nunca se queda
      // "importando" para siempre y el backend es transaccional (no hay carga
      // parcial). El usuario puede corregir y reintentar.
      setError(
        err instanceof Error
          ? `${err.message} No se importó ningún estudiante.`
          : 'Ocurrió un error al importar. No se importó ningún estudiante.',
      );
      setStatus('preview');
    }
  };

  const filasConError = resultado?.filas.filter((f) => !f.valida) ?? [];
  const hayErrorEncabezado =
    !!resultado &&
    (resultado.columnasFaltantes.length > 0 ||
      resultado.columnasSobrantes.length > 0);

  return (
    <Modal
      titulo={`Importar Estudiantes — Generación ${generacionAño}`}
      abierto={open}
      onCerrar={handleClose}
      tamanio="xl"
    >
      <div className="flex flex-col gap-4">
        {error && (
          <Alert tipo="error" mensaje={error} cerrable onCerrar={() => setError('')} />
        )}

        {/* ── Paso 1: Carga ── */}
        {status === 'idle' && (
          <>
            <Alert
              tipo="info"
              mensaje={`Sube un archivo .xlsx (o .csv) con los estudiantes de la generación ${generacionAño}. La generación se asigna automáticamente.`}
            />

            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">
                Columnas requeridas (ni más ni menos):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COLUMNAS_PLANTILLA.map((col) => (
                  <span
                    key={col}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono"
                  >
                    {col}
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-400 mt-1">
                La plantilla trae una fila de ejemplo y una de descripción:
                bórralas y escribe tus datos desde la segunda fila.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1">
              <button
                onClick={descargarPlantillaEstudiantes}
                className="text-sm text-[#65B39B] hover:text-[#4a9e87] font-semibold underline transition-colors"
              >
                Descargar plantilla (.xlsx)
              </button>
              <span className="text-gray-300">|</span>
              <label className="cursor-pointer inline-flex items-center gap-2 bg-[#65B39B] hover:bg-[#4a9e87] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                Seleccionar archivo
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.csv,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </>
        )}

        {/* ── Paso intermedio: Validando ── */}
        {status === 'validando' && (
          <Alert tipo="info" mensaje="Leyendo y validando el archivo…" />
        )}

        {/* ── Paso 2: Preview ── */}
        {status === 'preview' && resultado && (
          <>
            {hayErrorEncabezado ? (
              <Alert
                tipo="error"
                titulo="Las columnas del archivo no coinciden con la plantilla"
                mensaje={[
                  resultado.columnasFaltantes.length > 0
                    ? `Faltan: ${resultado.columnasFaltantes.join(', ')}.`
                    : '',
                  resultado.columnasSobrantes.length > 0
                    ? `Sobran: ${resultado.columnasSobrantes.join(', ')}.`
                    : '',
                  'Corrige los encabezados (deben ser exactamente los de la plantilla) y vuelve a subir el archivo.',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            ) : resultado.filas.length === 0 ? (
              <Alert
                tipo="advertencia"
                mensaje="El archivo no contiene filas de datos."
              />
            ) : resultado.puedeImportar ? (
              <Alert
                tipo="exito"
                mensaje={`${resultado.totalValidas} fila(s) válida(s). Todo listo para importar.`}
              />
            ) : (
              <Alert
                tipo="advertencia"
                titulo={`${resultado.totalInvalidas} fila(s) con error de ${resultado.filas.length}`}
                mensaje="Debes corregir TODAS las filas antes de importar: o se sube el archivo completo o no se sube nada. Las celdas en rojo tienen el detalle al pasar el cursor."
              />
            )}

            {resultado.filas.length > 0 && (
              <div className="overflow-auto max-h-80 rounded-lg border border-gray-200">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0">
                    <tr>
                      <th className={TH}>Fila</th>
                      {COLUMNAS_PLANTILLA.map((col) => (
                        <th key={col} className={TH}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.filas.map((fila) => (
                      <tr
                        key={fila.numeroFila}
                        className={fila.valida ? 'hover:bg-gray-50' : 'bg-red-50/40'}
                      >
                        <td
                          className={`${TD_BASE} font-mono ${fila.valida ? 'text-gray-500' : 'text-red-700 font-bold'}`}
                        >
                          {fila.numeroFila}
                        </td>
                        {COLUMNAS_PLANTILLA.map((col) => {
                          const c = fila.celdas[col];
                          return (
                            <td
                              key={col}
                              title={c.error ?? String(c.valor)}
                              className={`${TD_BASE} ${
                                c.error
                                  ? 'bg-red-100 text-red-800 font-semibold'
                                  : 'text-gray-700'
                              }`}
                            >
                              {String(c.valor) || '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filasConError.length > 0 && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                <p className="text-xs font-bold text-red-700 mb-1.5">
                  Detalle de errores por fila:
                </p>
                <ul className="flex flex-col gap-1 max-h-32 overflow-auto">
                  {filasConError.map((fila) => (
                    <li key={fila.numeroFila} className="text-xs text-red-700">
                      <span className="font-mono font-bold">
                        Fila {fila.numeroFila}:
                      </span>{' '}
                      {fila.errores.join(' · ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variante="outline" tamano="md" onClick={reset}>
                Cambiar archivo
              </Button>
              <Button
                variante="primary"
                tamano="md"
                onClick={handleImport}
                deshabilitado={!resultado.puedeImportar}
              >
                Confirmar e importar ({resultado.totalValidas})
              </Button>
            </div>
          </>
        )}

        {/* ── Paso 3: Importando ── */}
        {status === 'importing' && (
          <Alert
            tipo="info"
            mensaje={`Importando ${resultado?.totalValidas ?? ''} estudiantes, por favor espera…`}
          />
        )}

        {/* ── Paso 4: Resultado ── */}
        {status === 'done' && (
          <>
            <Alert
              tipo="exito"
              mensaje={`${creados} estudiante${creados !== 1 ? 's' : ''} importado${creados !== 1 ? 's' : ''} correctamente.`}
            />
            <hr className="border-gray-200" />
            <div className="flex justify-end">
              <Button variante="primary" tamano="md" onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
