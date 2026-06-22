import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Box, Divider, Typography } from '@mui/material';
import { Modal, Alert, Button } from '../../ui';
import { estudianteService } from '../../../services';
import { normalizarRut, normalizarTelefono } from '../../../utils/validators';
import type { CreateEstudianteDto } from '../../../services/estudiante.service';
import type { Genero, EstadoEstudiante } from '../../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  generacionId: number;
  generacionAño: number;
}

// Columnas esperadas (en orden de la plantilla).
// Coinciden exactamente con los campos obligatorios del formulario de creación.
const COLUMNS = [
  'rut_estudiante',
  'nombre',
  'apellido',
  'email',
  'telefono',
  'fecha_nacimiento', // YYYY-MM-DD
  'direccion',
  'genero',           // MASCULINO / FEMENINO / NO_BINARIO
  'rbd_liceo',
  'promedios_media',  // 1.0 – 7.0
  'estado',           // ACTIVO / SUSPENDIDO / RETIRADO / EGRESADO / TITULADO / ELIMINADO
] as const;

type RawRow = Record<string, string>;

// Intersección en vez de `extends`: `_idx: number` no puede convivir con el índice
// de string de RawRow dentro de una interface (TS2411).
type PreviewRow = RawRow & { _idx: number };

type ImportStatus = 'idle' | 'preview' | 'importing' | 'done';

interface Summary {
  creados: number;
  errores: { rut: string; motivo: string }[];
}

// Genera y descarga una plantilla CSV
function downloadTemplate() {
  const header = COLUMNS.join(',');
  const example = [
    '12.345.678-9',
    'Juan',
    'Pérez González',
    'juan@correo.com',
    '+569 1234 5678',
    '2000-03-15',
    'Av. Ejemplo 123',
    'MASCULINO',
    '12345',
    '6.0',
    'ACTIVO',
  ].join(',');
  const blob = new Blob([`${header}\n${example}\n`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_estudiantes.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function parseFileToRows(file: File): Promise<PreviewRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'binary', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw: RawRow[] = XLSX.utils.sheet_to_json(ws, {
          raw: false,
          dateNF: 'yyyy-mm-dd',
          defval: '',
        });
        // Object.assign preserva la intersección RawRow & { _idx } (el spread la pierde).
        resolve(raw.map((r, i) => Object.assign({}, r, { _idx: i + 2 }))); // +2: fila 1 = header
      } catch (err) {
        reject(new Error('No se pudo leer el archivo. Verifica que sea .xlsx o .csv válido.'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsBinaryString(file);
  });
}

function rowToDto(row: RawRow, generacion_id: number): CreateEstudianteDto {
  return {
    rut_estudiante: normalizarRut(String(row.rut_estudiante ?? '')),
    nombre: String(row.nombre ?? '').trim(),
    apellido: String(row.apellido ?? '').trim(),
    email: String(row.email ?? '').trim(),
    telefono: normalizarTelefono(String(row.telefono ?? '')),
    fecha_nacimiento: new Date(String(row.fecha_nacimiento ?? '')).toISOString(),
    direccion: String(row.direccion ?? '').trim(),
    genero: (String(row.genero ?? '').trim().toUpperCase() as Genero) || 'MASCULINO',
    rbd_liceo: String(row.rbd_liceo ?? '').trim(),
    promedios_media: parseFloat(String(row.promedios_media ?? '0').replace(',', '.')),
    estado: (String(row.estado ?? 'ACTIVO').trim().toUpperCase() as EstadoEstudiante),
    generacion_id,
    puntaje_paes: row.puntaje_paes ? parseInt(String(row.puntaje_paes)) : undefined,
    foto_url: row.foto_url ? String(row.foto_url).trim() : undefined,
  };
}

const TH = 'py-2 px-3 text-left text-xs font-bold text-gray-600 bg-gray-100 border-b border-gray-200 whitespace-nowrap';
const TD = 'py-1.5 px-3 text-xs text-gray-700 border-b border-gray-100 max-w-[120px] truncate';

export const ExcelImportModal: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  generacionId,
  generacionAño,
}) => {
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStatus('idle');
    setRows([]);
    setError('');
    setSummary(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => {
    if (status === 'importing') return;
    reset();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const parsed = await parseFileToRows(file);
      if (parsed.length === 0) {
        setError('El archivo no contiene filas de datos.');
        return;
      }
      setRows(parsed);
      setStatus('preview');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo.');
    }
  };

  const handleImport = async () => {
    setStatus('importing');
    setError('');
    const dtos = rows.map((r) => rowToDto(r, generacionId));
    const result = await estudianteService.createMany(dtos);
    setSummary(result);
    setStatus('done');
    if (result.creados > 0) onSuccess();
  };

  const PREVIEW_COLS: string[] = [
    'rut_estudiante', 'nombre', 'apellido', 'genero', 'estado', 'promedios_media',
  ];

  return (
    <Modal
      titulo={`Importar Estudiantes — Generación ${generacionAño}`}
      abierto={open}
      onCerrar={handleClose}
      tamanio="lg"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && (
          <Alert tipo="error" mensaje={error} cerrable onCerrar={() => setError('')} />
        )}

        {/* ── Paso 1: Carga ── */}
        {status === 'idle' && (
          <>
            <Alert
              tipo="info"
              mensaje={`Sube un archivo .xlsx o .csv con los estudiantes de la generación ${generacionAño}. La generación se asigna automáticamente.`}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Columnas esperadas (en orden):
              </Typography>
              <div className="flex flex-wrap gap-1.5">
                {COLUMNS.map((col) => (
                  <span
                    key={col}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
              <button
                onClick={downloadTemplate}
                className="text-sm text-[#65B39B] hover:text-[#4a9e87] font-semibold underline transition-colors"
              >
                Descargar plantilla CSV
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
            </Box>
          </>
        )}

        {/* ── Paso 2: Preview ── */}
        {status === 'preview' && (
          <>
            <Alert
              tipo="advertencia"
              mensaje={`Se encontraron ${rows.length} filas. Revisa los datos antes de confirmar la importación.`}
            />

            <div className="overflow-auto max-h-64 rounded-lg border border-gray-200">
              <table className="w-full text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className={TH}>#</th>
                    {PREVIEW_COLS.map((col) => (
                      <th key={col} className={TH}>{col}</th>
                    ))}
                    <th className={TH}>+ {COLUMNS.length - PREVIEW_COLS.length} más…</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row._idx} className="hover:bg-gray-50">
                      <td className={TD}>{row._idx}</td>
                      {PREVIEW_COLS.map((col) => (
                        <td key={col} className={TD} title={String(row[col as string] ?? '')}>
                          {String(row[col as string] ?? '') || '—'}
                        </td>
                      ))}
                      <td className={TD} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
              <Button variante="outline" tamano="md" onClick={reset}>
                Cambiar archivo
              </Button>
              <Button variante="primary" tamano="md" onClick={handleImport}>
                Confirmar e importar ({rows.length})
              </Button>
            </Box>
          </>
        )}

        {/* ── Paso 3: Importando ── */}
        {status === 'importing' && (
          <Alert tipo="info" mensaje={`Importando ${rows.length} estudiantes, por favor espera…`} />
        )}

        {/* ── Paso 4: Resultado ── */}
        {status === 'done' && summary && (
          <>
            {summary.creados > 0 && (
              <Alert
                tipo="exito"
                mensaje={`${summary.creados} estudiante${summary.creados !== 1 ? 's' : ''} importado${summary.creados !== 1 ? 's' : ''} correctamente.`}
              />
            )}
            {summary.errores.length > 0 && (
              <div>
                <Alert
                  tipo="advertencia"
                  mensaje={`${summary.errores.length} fila${summary.errores.length !== 1 ? 's' : ''} con error:`}
                />
                <div className="mt-2 overflow-auto max-h-40 rounded-lg border border-red-100 bg-red-50">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="py-1.5 px-3 text-left font-bold text-red-700">RUT</th>
                        <th className="py-1.5 px-3 text-left font-bold text-red-700">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.errores.map((e) => (
                        <tr key={e.rut} className="border-t border-red-100">
                          <td className="py-1 px-3 text-red-800 font-mono">{e.rut}</td>
                          <td className="py-1 px-3 text-red-700">{e.motivo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variante="primary" tamano="md" onClick={handleClose}>
                Cerrar
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};
