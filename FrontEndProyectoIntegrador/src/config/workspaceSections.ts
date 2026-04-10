interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarItem {
  id: string;
  title: string;
  icon: string;
  type: 'note' | 'data';
}

/**
 * Sidebar sections configuration for interview workspace
 * Includes topic list and important information sections
 */
export const sidebarSections: SidebarSection[] = [
  {
    title: 'Lista de temas',
    items: [
      { id: 'destacados', title: 'Destacados', icon: '⭐', type: 'note' },
      { id: 'pareja', title: 'Pareja', icon: '💕', type: 'note' },
      { id: 'amigos', title: 'Amigos', icon: '👥', type: 'note' },
      { id: 'familia', title: 'Familia', icon: '👨‍👩‍👧‍👦', type: 'note' },
      { id: 'estudios', title: 'Estudios', icon: '📚', type: 'note' },
      { id: 'trabajo', title: 'Trabajo', icon: '💼', type: 'note' },
      { id: 'metas', title: 'Metas', icon: '🎯', type: 'note' },
      { id: 'salud', title: 'Salud', icon: '⚕️', type: 'note' },
      { id: 'actividades-extracurriculares', title: 'Actividades extracurriculares', icon: '🎭', type: 'note' },
      { id: 'problemas', title: 'Problemas', icon: '⚠️', type: 'note' },
    ]
  },
  {
    title: 'Información importante',
    items: [
      { id: 'info-personal', title: 'Información Personal', icon: '👤', type: 'data' },
      { id: 'avance-academico', title: 'Avance Académico', icon: '📊', type: 'data' },
      { id: 'historial', title: 'Historial Académico', icon: '📋', type: 'data' },
      { id: 'familia-data', title: 'Información Familiar', icon: '🏠', type: 'data' },
    ]
  }
];
