import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { entrevistaService, estudianteService } from '../services';
import { logger } from '../config';
import type { Estudiante } from '../types';
import { useWorkspaceTabs } from '../hooks';
import { sidebarSections } from '../config/workspaceSections';
import { LoadingState, ErrorState } from '../components/features/estudiante-detalles/entrevista-workspace';

import { TopNavbar, Sidebar, TabManager } from '../components/features/interview-workspace';

export function EntrevistaWorkspace() {
  const navigate = useNavigate();
  const { id: entrevistaIdFromUrl } = useParams(); // Este es el ID de la entrevista, no del estudiante
  
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [entrevistaId, setEntrevistaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customTags, setCustomTags] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('entrevistaCustomTags');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleAddCustomTag = useCallback((tag: string) => {
    const normalized = tag.trim();
    if (!normalized) return;
    const existsAsDefault = sidebarSections.some((section) =>
      section.items.some((item) => item.title.toLowerCase() === normalized.toLowerCase()),
    );
    if (existsAsDefault) return;
    setCustomTags((prev) => {
      const exists = prev.some((t) => t.toLowerCase() === normalized.toLowerCase());
      if (exists) return prev;
      return [...prev, normalized];
    });
  }, []);
  
  const {
    workspace,
    openTab,
    closeTab,
    focusTab,
    enableSplitView,
    disableSplitView,
    setActivePanel
  } = useWorkspaceTabs();

  useEffect(() => {
    try {
      localStorage.setItem('entrevistaCustomTags', JSON.stringify(customTags));
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [customTags]);

  // CARGAR DATOS: Entrevista y estudiante al iniciar
  useEffect(() => {
    const loadEntrevistaData = async () => {
      if (!authService.isAuthenticated()) {
        navigate('/');
        return;
      }

      if (!entrevistaIdFromUrl) {
        setError('No se proporcionó ID de la entrevista');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        let entrevistaData: any = null;

        try {
          entrevistaData = await entrevistaService.getById(entrevistaIdFromUrl);
        } catch (err) {
          logger.warn('No se encontró entrevista por ID, intentando como estudianteId', err);
        }

        // Si no se encontró, interpretamos el parámetro como id_estudiante y tomamos la más reciente
        if (!entrevistaData) {
          const entrevistasDeEstudiante = await entrevistaService.getByEstudiante(entrevistaIdFromUrl);
          if (!entrevistasDeEstudiante || entrevistasDeEstudiante.length === 0) {
            throw new Error('Entrevista no encontrada');
          }
          entrevistaData = entrevistasDeEstudiante[0]; // última o primera según orden DESC en el backend
        }

        const entrevistaId = entrevistaData.id || entrevistaData._id;
        if (!entrevistaId) {
          throw new Error('ID de entrevista no disponible');
        }
        setEntrevistaId(entrevistaId);

        // Ahora cargar el estudiante usando el id_estudiante de la entrevista
        const estudianteId =
          entrevistaData.estudianteId ||
          entrevistaData.id_estudiante ||
          entrevistaData.estudiante?.id_estudiante;

        if (!estudianteId) {
          throw new Error('ID del estudiante no disponible en los datos de la entrevista');
        }
        
        const estudianteData = await estudianteService.getById(estudianteId);
        setEstudiante(estudianteData);
        
      } catch (error) {
        logger.error('Error al cargar datos de entrevista:', error);
        setError('Error al cargar los datos de la entrevista');
      } finally {
        setLoading(false);
      }
    };

    loadEntrevistaData();
  }, [entrevistaIdFromUrl, navigate]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !estudiante) {
    return <ErrorState error={error || 'Estudiante no encontrado'} onBack={() => navigate(-1)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* NAVBAR SUPERIOR */}
      <TopNavbar
        estudiante={estudiante}
        onNavigateBack={() => navigate(-1)}
      />

      {/* ÁREA PRINCIPAL: Sidebar + Workspace */}
      <div
        className="flex-1 flex overflow-hidden"
        style={{ height: 'calc(100vh - 64px)', maxHeight: 'calc(100vh - 64px)' }}
      >
        {/* SIDEBAR IZQUIERDO */}
        <Sidebar
          sections={sidebarSections}
          onSectionClick={openTab}
          activePanel={workspace.activePanel}
          splitViewActive={workspace.splitView}
          customTags={customTags}
          onAddCustomTag={handleAddCustomTag}
        />

        {/* ÁREA DE PESTAÑAS */}
        <div
          className="flex-1 flex flex-col min-w-[400px] overflow-hidden"
          style={{ width: 'calc(100% - 280px)', maxWidth: 'calc(100% - 280px)' }}
        >
          <TabManager
            workspace={workspace}
            onCloseTab={closeTab}
            onFocusTab={focusTab}
            onEnableSplitView={enableSplitView}
            onDisableSplitView={disableSplitView}
            onSetActivePanel={setActivePanel}
            estudiante={estudiante}
            entrevistaId={entrevistaId}
          />
        </div>
      </div>
    </div>
  );
}