import { useState } from 'react';
import { Box, Paper, IconButton, Button, Typography, Alert } from '@mui/material';
import { Close as CloseIcon, ViewColumn as ViewColumnIcon, Search as SearchIcon } from '@mui/icons-material';
import type { Estudiante } from '../../../types';
import { NoteEditor } from './NoteEditor';
import { DataTable } from './DataTable';

// INTERFACES: Definición de tipos
interface Tab {
  id: string;
  title: string;
  type: 'note' | 'data';
  content?: any;
  isActive: boolean;
}

interface WorkspaceState {
  leftTabs: Tab[];
  rightTabs: Tab[];
  splitView: boolean;
  activePanel: 'left' | 'right';
}

interface TabManagerProps {
  workspace: WorkspaceState;
  onCloseTab: (tabId: string) => void;
  onFocusTab: (tabId: string) => void;
  onEnableSplitView: () => void;
  onDisableSplitView: () => void;
  onSetActivePanel: (panel: 'left' | 'right') => void;
  estudiante: Estudiante;
  entrevistaId: string | null;
}

export function TabManager({
  workspace,
  onCloseTab,
  onFocusTab,
  onEnableSplitView,
  onDisableSplitView,
  onSetActivePanel,
  estudiante,
  entrevistaId
}: TabManagerProps) {
  const [filtersByTab, setFiltersByTab] = useState<Record<string, boolean>>({});

  const toggleFiltersForTab = (tabId: string) => {
    setFiltersByTab(prev => ({
      ...prev,
      [tabId]: !prev[tabId]
    }));
  };

  const setFiltersVisibleForTab = (tabId: string, visible: boolean) => {
    setFiltersByTab(prev => ({
      ...prev,
      [tabId]: visible
    }));
  };

  // COMPONENTE: Panel de pestañas individual
  function TabPanel({
    tabs,
    panelId,
    isActive,
    isSplitView
  }: {
    tabs: Tab[];
    panelId: 'left' | 'right';
    isActive: boolean;
    isSplitView: boolean;
  }) {
    const activeTab = tabs.find(tab => tab.isActive);

    return (
      <Paper 
        elevation={isActive ? 3 : 1}
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          border: isActive ? 2 : 1, 
          borderColor: isActive ? 'primary.main' : 'grey.200', 
          borderRadius: 2, 
          overflow: 'hidden',
          ...(isSplitView && { minWidth: 300, maxWidth: 'calc(50% - 8px)' }),
          height: '100%'
        }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (!target.matches('input, textarea, button, input *, textarea *, button *')) {
            onSetActivePanel(panelId);
          }
        }}
      >
        {/* BARRA DE PESTAÑAS */}
          <Box sx={{ bgcolor: 'grey.50', borderBottom: 1, borderColor: 'grey.200', height: 48, minHeight: 48, maxHeight: 48, display: 'flex', alignItems: 'center', px: 1, gap: 0.5 }}>
          {tabs.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1, textAlign: 'center', fontStyle: 'italic', py: 2 }}>
              {panelId === 'left' ? 
                '📋 Selecciona una etiqueta del sidebar' : 
                '📊 Haz clic aquí para activar este panel'
              }
            </Typography>
          ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, overflowX: 'auto', overflowY: 'hidden', flex: 1, pr: 1 }}>
                  {tabs.map((tab) => (
                    <Box
                      key={tab.id}
                      onClick={() => {
                        onFocusTab(tab.id);
                        onSetActivePanel(panelId);
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        bgcolor: tab.isActive ? 'background.paper' : 'transparent',
                        border: tab.isActive ? 1 : 0,
                        borderColor: tab.isActive ? 'primary.main' : 'transparent',
                        borderBottom: tab.isActive ? 0 : 1,
                        borderRadius: '8px 8px 0 0',
                        cursor: 'pointer',
                        fontWeight: tab.isActive ? 600 : 400,
                        color: tab.isActive ? 'text.primary' : 'text.secondary',
                        maxWidth: tab.isActive ? 260 : 150,
                        minWidth: tab.isActive ? 140 : 100,
                        position: 'relative',
                        mb: tab.isActive ? '-1px' : 0,
                        zIndex: tab.isActive ? 10 : 1,
                        flexShrink: 0,
                        boxShadow: tab.isActive ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          left: 12,
                          right: 12,
                          bottom: -1,
                          height: 3,
                          borderRadius: 9999,
                          backgroundColor: tab.isActive ? 'primary.main' : 'transparent'
                        }
                      }}
                    >
                      <Typography sx={{ fontSize: '0.875rem', flexShrink: 0 }}>
                        {tab.type === 'note' ? '📝' : '📊'}
                      </Typography>
                    
                      <Typography variant="caption" noWrap={!tab.isActive} sx={{ flex: 1 }}>
                        {tab.title}
                      </Typography>
                    
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCloseTab(tab.id);
                        }}
                        sx={{ 
                          width: 16, 
                          height: 16, 
                          p: 0,
                          '&:hover': { bgcolor: 'error.light', color: 'error.main' }
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                  {!workspace.splitView && panelId === 'left' && tabs.length > 0 && (
                    <IconButton
                      size="small"
                      onClick={onEnableSplitView}
                      title="Dividir vista"
                    >
                      <ViewColumnIcon fontSize="small" />
                    </IconButton>
                  )}

                  {activeTab && activeTab.type === 'note' && (
                    <Button
                      size="small"
                      variant={filtersByTab[activeTab.id] ? 'contained' : 'outlined'}
                      color="primary"
                      startIcon={<SearchIcon fontSize="small" />}
                      onClick={() => {
                        toggleFiltersForTab(activeTab.id);
                        onSetActivePanel(panelId);
                      }}
                    >
                      Filtros
                    </Button>
                  )}
                </Box>
              </>
          )}
        </Box>

        {/* CONTENIDO DE LA PESTAÑA ACTIVA */}
        <Box sx={{ flex: 1, overflow: 'auto', height: '100%', maxHeight: 'calc(100% - 48px)' }}>
          {activeTab ? (
            activeTab.type === 'note' ? (
              entrevistaId ? (
                <NoteEditor
                  tabId={activeTab.id}
                  sectionTitle={activeTab.title}
                  estudiante={estudiante}
                  entrevistaId={entrevistaId}
                    showFiltersExternal={filtersByTab[activeTab.id] || false}
                    onFiltersVisibilityChange={(visible) => setFiltersVisibleForTab(activeTab.id, visible)}
                />
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="error" gutterBottom>
                    No hay entrevista activa
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Para tomar notas necesitas crear una entrevista primero.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => {
                      // Recargar la página para intentar crear una entrevista
                      window.location.reload();
                    }}
                  >
                    Crear Nueva Entrevista
                  </Button>
                </Box>
              )
            ) : (
              <DataTable
                tabId={activeTab.id}
                sectionTitle={activeTab.title}
                estudiante={estudiante}
              />
            )
          ) : (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Selecciona una pestaña
              </Typography>
              {panelId === 'right' && (
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Haz clic aquí para activar este panel, luego usa el sidebar
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, gap: 2, height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
      {/* CONTROLES DE VISTA */}
      {workspace.splitView && (
        <Alert
          severity="info"
          icon={<ViewColumnIcon />}
          action={
            <Button size="small" variant="outlined" onClick={onDisableSplitView}>
              Unir vista
            </Button>
          }
          sx={{ height: 48, minHeight: 48, maxHeight: 48, flexShrink: 0 }}
        >
          Vista dividida activa
        </Alert>
      )}

      {/* ÁREA DE PESTAÑAS */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2, overflow: 'hidden', minHeight: 400, width: '100%' }}>
        <TabPanel
          tabs={workspace.leftTabs}
          panelId="left"
          isActive={workspace.activePanel === 'left'}
          isSplitView={workspace.splitView}
        />
        
        {workspace.splitView && (
          <TabPanel
            tabs={workspace.rightTabs}
            panelId="right"
            isActive={workspace.activePanel === 'right'}
            isSplitView={workspace.splitView}
          />
        )}
      </Box>

    </Box>
  );
}