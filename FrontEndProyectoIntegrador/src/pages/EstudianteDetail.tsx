import { LoadingSpinner, ErrorMessage } from '../components/ui';
import {
  StudentHeader,
  TabNavigation,
  ProfileSection,
  PersonalDataSection,
  FamilyInfoSection,
  AcademicReportSection,
  SemesterPerformanceSection,
  InterviewsSection,
  AvanceCurricularSection,
  useStudentDetail
} from '../components/features/student-detail';
import { NuevoSemestreModal } from '../components/features/student-detail/components';
import { Snackbar, Alert } from '@mui/material';

export default function EstudianteDetail() {

  const {
    // Datos del estudiante
    loading,
    error,
    estudiante,

    // Permisos y navegación
    canEdit,
    canViewInterviews,
    seccionActiva,
    handleSeccionChange,

    // Edición
    modoEdicion,
    hayCambiosPendientes,
    isGuardando,
    mensajeExito,
    mensajeError,
    handleCampoChange,
    handleFamiliaChange,
    handleGuardar,
    handleToggleEdicion,
    estudianteConEdiciones,
    informesGuardados,
    setMensajeExito,
    setMensajeError,

    // Semestres
    mostrarModalNuevoSemestre,
    setMostrarModalNuevoSemestre,
    nuevoSemestreData,
    setNuevoSemestreData,
    handleCrearNuevoSemestre,
    registrarCambioSemestre
  } = useStudentDetail();





  if (loading) {
    return <LoadingSpinner fullScreen message="Cargando datos del estudiante..." />;
  }

  if (error || !estudiante || !estudianteConEdiciones) {
    return (
      <ErrorMessage
        fullScreen
        title="Error al cargar estudiante"
        message={error || 'No se pudo cargar la información del estudiante'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header del estudiante */}
      <StudentHeader
        nombres={estudianteConEdiciones.nombre || ''}
        estado={estudianteConEdiciones.status || 'activo'}
        modoEdicion={modoEdicion}
        hayCambiosPendientes={hayCambiosPendientes}
        isGuardando={isGuardando}
        onToggleEdicion={handleToggleEdicion}
        onGuardar={handleGuardar}
        canEdit={canEdit}
      />

      {/* Navegación por tabs */}
      <TabNavigation
        seccionActiva={seccionActiva}
        onSeccionChange={handleSeccionChange}
        canViewInterviews={canViewInterviews}
      />

      {/* Contenido principal */}
      <div className="p-8 max-w-[1400px] mx-auto">
        {/* Perfil General */}
        {seccionActiva === 'perfil' && (
          <ProfileSection estudiante={estudianteConEdiciones} />
        )}

        {/*  Datos Personales - Con callback para cambios */}
        {seccionActiva === 'personal' && (
          <PersonalDataSection
            estudiante={estudianteConEdiciones}
            modoEdicion={modoEdicion && canEdit}
            onCampoChange={handleCampoChange}
          />
        )}

        {/* Información Familiar */}
        {seccionActiva === 'familiar' && (
          <FamilyInfoSection
            estudiante={estudianteConEdiciones}
            modoEdicion={modoEdicion && canEdit}
            onFamiliaChange={handleFamiliaChange}
          />
        )}

        {/* Informe Académico */}
        {seccionActiva === 'informe' && (
          <AcademicReportSection
            estudiante={estudianteConEdiciones}
            modoEdicion={modoEdicion && canEdit}
            historialesExternos={informesGuardados}
          />
        )}

        {/* Desempeño por Semestre */}
        {seccionActiva === 'desempeno' && (
          <SemesterPerformanceSection
            estudiante={estudiante}
            modoEdicion={modoEdicion && canEdit}
            onCambioDesempeno={registrarCambioSemestre}
          />
        )}

        {/* Avance Curricular */}
        {seccionActiva === 'avance' && (
          <AvanceCurricularSection
            estudiante={estudianteConEdiciones}
            modoEdicion={modoEdicion && canEdit}
          />
        )}

        {/* Entrevistas - Solo para administradores */}
        {seccionActiva === 'entrevistas' && canViewInterviews && (
          <InterviewsSection
            estudianteId={estudiante.id_estudiante}
            estudiante={estudiante}
          />
        )}
      </div>

      {/* Modal para crear nuevo semestre */}
      <NuevoSemestreModal
        open={mostrarModalNuevoSemestre}
        onClose={() => setMostrarModalNuevoSemestre(false)}
        nuevoSemestreData={nuevoSemestreData}
        setNuevoSemestreData={setNuevoSemestreData as any}
        onCrearSemestre={handleCrearNuevoSemestre}
      />

      {/* Snackbars para mensajes de éxito y error */}
      <Snackbar
        open={!!mensajeExito}
        autoHideDuration={4000}
        onClose={() => setMensajeExito('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setMensajeExito('')} severity="success" variant="filled">
          {mensajeExito}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!mensajeError}
        autoHideDuration={6000}
        onClose={() => setMensajeError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setMensajeError('')} severity="error" variant="filled">
          {mensajeError}
        </Alert>
      </Snackbar>
    </div>
  );
};
