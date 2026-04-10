import { useState, useCallback, useEffect } from 'react';

export interface Tab {
  id: string;
  title: string;
  type: 'note' | 'data';
  content?: any;
  isActive: boolean;
}

export interface WorkspaceState {
  leftTabs: Tab[];
  rightTabs: Tab[];
  splitView: boolean;
  activePanel: 'left' | 'right';
}

const STORAGE_KEY = 'entrevistaWorkspaceTabs';

const defaultWorkspace: WorkspaceState = {
  leftTabs: [],
  rightTabs: [],
  splitView: false,
  activePanel: 'left',
};

const loadInitialWorkspace = (): WorkspaceState => {
  if (typeof window === 'undefined') return defaultWorkspace;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultWorkspace;
    const parsed = JSON.parse(stored) as WorkspaceState;
    // Validar estructura básica y garantizar panel activo
    const leftTabs = Array.isArray(parsed.leftTabs) ? parsed.leftTabs : [];
    const rightTabs = Array.isArray(parsed.rightTabs) ? parsed.rightTabs : [];
    const splitView = Boolean(parsed.splitView);
    const activePanel = parsed.activePanel === 'right' ? 'right' : 'left';

    // Garantizar que haya una pestaña activa por panel con tabs
    const normalizeTabs = (tabs: Tab[]): Tab[] => {
      if (tabs.length === 0) return tabs;
      const hasActive = tabs.some((t) => t.isActive);
      if (hasActive) return tabs;
      return tabs.map((t, idx) => ({ ...t, isActive: idx === 0 }));
    };

    return {
      leftTabs: normalizeTabs(leftTabs),
      rightTabs: normalizeTabs(rightTabs),
      splitView,
      activePanel,
    };
  } catch {
    return defaultWorkspace;
  }
};

/**
 * Custom hook for managing workspace tabs
 * Handles tab creation, closing, focusing, and split view
 */
export const useWorkspaceTabs = () => {
  const [workspace, setWorkspace] = useState<WorkspaceState>(loadInitialWorkspace);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      // Ignorar errores de persistencia
    }
  }, [workspace]);

  const openTab = useCallback((sectionId: string, sectionTitle: string, type: 'note' | 'data') => {
    const tabId = `tab-${sectionId}`;
    
    setWorkspace(prev => {
      // Check if tab already exists
      const existsInLeft = prev.leftTabs.some(tab => tab.id === tabId);
      const existsInRight = prev.rightTabs.some(tab => tab.id === tabId);
      
      if (existsInLeft || existsInRight) {
        // If exists, activate it
        return {
          ...prev,
          leftTabs: existsInLeft ? 
            prev.leftTabs.map(tab => ({ ...tab, isActive: tab.id === tabId })) : 
            prev.leftTabs,
          rightTabs: existsInRight ? 
            prev.rightTabs.map(tab => ({ ...tab, isActive: tab.id === tabId })) : 
            prev.rightTabs,
          activePanel: existsInLeft ? 'left' : 'right'
        };
      }
      
      // Create new tab
      const newTab: Tab = {
        id: tabId,
        title: sectionTitle,
        type,
        isActive: true,
        content: type === 'note' ? { notes: [], newNote: '' } : null
      };
      
      const targetPanel = prev.activePanel;
      
      return {
        ...prev,
        [targetPanel === 'left' ? 'leftTabs' : 'rightTabs']: [
          ...prev[targetPanel === 'left' ? 'leftTabs' : 'rightTabs'].map(tab => ({ ...tab, isActive: false })),
          newTab
        ]
      };
    });
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setWorkspace(prev => ({
      ...prev,
      leftTabs: prev.leftTabs.filter(tab => tab.id !== tabId),
      rightTabs: prev.rightTabs.filter(tab => tab.id !== tabId)
    }));
  }, []);

  const focusTab = useCallback((tabId: string) => {
    setWorkspace(prev => {
      const isInLeft = prev.leftTabs.some(tab => tab.id === tabId);
      const isInRight = prev.rightTabs.some(tab => tab.id === tabId);
      
      return {
        ...prev,
        leftTabs: isInLeft ? 
          prev.leftTabs.map(tab => ({ ...tab, isActive: tab.id === tabId })) : 
          prev.leftTabs,
        rightTabs: isInRight ? 
          prev.rightTabs.map(tab => ({ ...tab, isActive: tab.id === tabId })) : 
          prev.rightTabs,
        activePanel: isInLeft ? 'left' : 'right'
      };
    });
  }, []);

  const enableSplitView = useCallback(() => {
    setWorkspace(prev => ({ ...prev, splitView: true }));
  }, []);

  const disableSplitView = useCallback(() => {
    setWorkspace(prev => ({
      ...prev,
      splitView: false,
      leftTabs: [...prev.leftTabs, ...prev.rightTabs],
      rightTabs: []
    }));
  }, []);

  const setActivePanel = useCallback((panel: 'left' | 'right') => {
    setWorkspace(prev => ({ ...prev, activePanel: panel }));
  }, []);

  return {
    workspace,
    openTab,
    closeTab,
    focusTab,
    enableSplitView,
    disableSplitView,
    setActivePanel
  };
};
