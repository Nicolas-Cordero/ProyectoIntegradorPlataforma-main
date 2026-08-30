import { useState, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { estudianteService, paesService, beneficiosService } from '../../services';
import type { EstudianteOutletContext } from './EstudianteDetail';
import type { UpdateEstudianteDto } from '../../services/estudiante.service';
import type { UpdatePaesDto } from '../../services/paes.service';
import type { Paes, Beneficio, BeneficioEstudiante } from '../../types';
import { useConfirmDialog, Alert } from '../../components/ui';
import {
  InformacionPersonalCard,
  InformacionAcademicaCard,
  PruebaPaesCard,
  LiceoOrigenCard,
  CarreraCard,
  ContactoEmergenciaCard,
  CreatePaesModal,
} from '../../components/features/estudiante-detalles/datos-personales';
import {
  BeneficiosCard,
  ModalAsignarBeneficio,
} from '../../components/features/estudiante-detalles/beneficios';
import type { CambiosAsignacion } from '../../components/features/estudiante-detalles/beneficios/BeneficioCard';

export default function EstudianteDatosPersonales() {
  const { estudiante, liceo, generacion, canEdit } = useOutletContext<EstudianteOutletContext>();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  const [saveError, setSaveError] = useState('');

  // PAES
  const [paes, setPaes] = useState<Paes | null>(null);
  const [paesLoading, setPaesLoading] = useState(true);
  const [showCreatePaes, setShowCreatePaes] = useState(false);

  // Beneficios
  const [beneficiosEstudiante, setBeneficiosEstudiante] = useState<BeneficioEstudiante[]>([]);
  const [catalogoBeneficios, setCatalogoBeneficios] = useState<Beneficio[]>([]);
  const [beneficiosLoading, setBeneficiosLoading] = useState(true);
  const [catalogoError, setCatalogoError] = useState('');
  const [showAsignarBeneficio, setShowAsignarBeneficio] = useState(false);

  const contactoEmergencia = estudiante.familiares?.find(f => f.es_contacto_emergencia) ?? null;
  const generacionLabel = generacion
    ? `${generacion.año}${generacion.descripcion ? ` — ${generacion.descripcion}` : ''}`
    : 'No especificado';

  useEffect(() => {
    setPaesLoading(true);
    paesService.getPaesByEstudiante(estudiante.rut_estudiante)
      .then(data => setPaes(data))
      .catch(() => setPaes(null))
      .finally(() => setPaesLoading(false));
  }, [estudiante.rut_estudiante]);

  // allSettled y no all: son dos llamadas independientes. Con Promise.all, si
  // falla una la otra se descarta aunque haya respondido bien, y el mensaje de
  // error termina culpando al catálogo aunque lo que fallara fueran las
  // asignaciones. Así cada lista se llena si su llamada funcionó.
  useEffect(() => {
    setBeneficiosLoading(true);
    setCatalogoError('');
    Promise.allSettled([
      beneficiosService.getBeneficiosByEstudiante(estudiante.rut_estudiante),
      beneficiosService.getBeneficios(),
    ])
      .then(([asignados, catalogo]) => {
        const fallos: string[] = [];

        if (asignados.status === 'fulfilled') {
          setBeneficiosEstudiante(asignados.value);
        } else {
          setBeneficiosEstudiante([]);
          fallos.push('los beneficios del estudiante');
        }

        if (catalogo.status === 'fulfilled') {
          setCatalogoBeneficios(catalogo.value);
        } else {
          setCatalogoBeneficios([]);
          fallos.push('el catálogo de beneficios');
        }

        setCatalogoError(fallos.length ? `No se pudo cargar ${fallos.join(' ni ')}.` : '');
      })
      .finally(() => setBeneficiosLoading(false));
  }, [estudiante.rut_estudiante]);

  const handleQuitarBeneficio = (codigo_beneficio: number, nombre: string) => {
    showConfirm({
      title: 'Quitar beneficio',
      message: `¿Quitar "${nombre}" de este estudiante?`,
      confirmText: 'Quitar',
      confirmColor: 'error',
      onConfirm: async () => {
        setSaveError('');
        try {
          await beneficiosService.deleteBeneficioEstudiante(codigo_beneficio, estudiante.rut_estudiante);
          setBeneficiosEstudiante(prev => prev.filter(b => b.codigo_beneficio !== codigo_beneficio));
        } catch (e: unknown) {
          setSaveError(e instanceof Error ? e.message : 'Error al quitar el beneficio');
        }
      },
    });
  };

  const handleActualizarBeneficio = async (codigo_beneficio: number, cambios: CambiosAsignacion) => {
    setSaveError('');
    try {
      const actualizada = await beneficiosService.updateBeneficioEstudiante(
        codigo_beneficio,
        estudiante.rut_estudiante,
        cambios,
      );
      setBeneficiosEstudiante(prev =>
        prev.map(b => (b.codigo_beneficio === codigo_beneficio ? actualizada : b)),
      );
    } catch (e: unknown) {
      // No se toca el estado local: la tarjeta sigue mostrando el valor guardado.
      setSaveError(e instanceof Error ? e.message : 'Error al actualizar el beneficio');
    }
  };

  const handleSave = useCallback(async (key: keyof UpdateEstudianteDto, rawValue: string): Promise<boolean> => {
    setSaveError('');
    let value: string | number | undefined = rawValue;
    if (key === 'promedios_media') {
      value = rawValue ? Number(rawValue.replace(',', '.')) : undefined;
    }
    try {
      await estudianteService.update(estudiante.rut_estudiante, { [key]: value });
      return true;
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar el campo');
      return false;
    }
  }, [estudiante.rut_estudiante]);

  const handlePaesSave = useCallback(async (key: keyof UpdatePaesDto, rawValue: string): Promise<boolean> => {
    setSaveError('');
    const value = rawValue ? Number(rawValue) : undefined;
    try {
      const updated = await paesService.updatePaes(estudiante.rut_estudiante, { [key]: value });
      setPaes(updated);
      return true;
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar el puntaje PAES');
      return false;
    }
  }, [estudiante.rut_estudiante]);

  const e = canEdit;

  return (
    <div>
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700" role="alert">
          {saveError}
        </div>
      )}

      {canEdit && (
        <div className="mb-4 flex items-center gap-2 bg-[#65B39B]/10 border border-[#65B39B]/30 rounded-xl px-4 py-2.5 text-sm text-[#3a7a6b]">
          <span className="text-base">✏️</span>
          <span>Doble clic sobre cualquier campo resaltado para editarlo · <kbd className="bg-white border border-gray-300 rounded px-1 text-xs">Enter</kbd> para guardar · <kbd className="bg-white border border-gray-300 rounded px-1 text-xs">Esc</kbd> para cancelar</span>
        </div>
      )}

      <InformacionPersonalCard estudiante={estudiante} editable={e} onSave={handleSave} />

      <InformacionAcademicaCard estudiante={estudiante} generacionLabel={generacionLabel} editable={e} onSave={handleSave} />

      <PruebaPaesCard
        paes={paes}
        loading={paesLoading}
        editable={e}
        onSave={handlePaesSave}
        onRegistrarClick={() => setShowCreatePaes(true)}
      />

      <LiceoOrigenCard liceo={liceo} rbdLiceo={estudiante.rbd_liceo} editable={e} onSave={handleSave} />

      <CarreraCard carreras={estudiante.carreras} rutEstudiante={estudiante.rut_estudiante} />

      <ContactoEmergenciaCard contacto={contactoEmergencia} />

      <BeneficiosCard
        asignaciones={beneficiosEstudiante}
        catalogo={catalogoBeneficios}
        loading={beneficiosLoading}
        canEdit={canEdit}
        onQuitar={handleQuitarBeneficio}
        onActualizar={handleActualizarBeneficio}
        onAgregarClick={() => setShowAsignarBeneficio(true)}
      />

      <CreatePaesModal
        open={showCreatePaes}
        rutEstudiante={estudiante.rut_estudiante}
        onClose={() => setShowCreatePaes(false)}
        onSuccess={(newPaes) => {
          setPaes(newPaes);
          setShowCreatePaes(false);
        }}
      />

      <ModalAsignarBeneficio
        abierto={showAsignarBeneficio}
        onCerrar={() => setShowAsignarBeneficio(false)}
        rutEstudiante={estudiante.rut_estudiante}
        catalogo={catalogoBeneficios}
        catalogoLoading={beneficiosLoading}
        catalogoError={catalogoError}
        yaAsignados={beneficiosEstudiante.map(b => b.codigo_beneficio)}
        onAsignado={nueva => setBeneficiosEstudiante(prev => [...prev, nueva])}
      />

      {/* Toast flotante: por encima de cualquier modal abierto (MUI Dialog usa z-index 1300) */}
      {catalogoError && (
        <div className="fixed top-6 right-6 z-[1400] w-full max-w-sm">
          <Alert
            tipo="error"
            titulo="Error al cargar beneficios"
            mensaje={catalogoError}
            cerrable
            onCerrar={() => setCatalogoError('')}
          />
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
}
