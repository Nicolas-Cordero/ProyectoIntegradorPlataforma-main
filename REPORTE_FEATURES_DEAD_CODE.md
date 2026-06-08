# Reporte: Dead Code en src/components/features

Revisión exhaustiva del directorio `src/components/features`.
Criterio: un archivo es "muerto" si ninguna **página real** lo importa directamente ni a través
de una cadena de imports que termine en una página. Los barrel `index.ts` no cuentan como
uso real.

---

## 1. ARCHIVOS COMPLETAMENTE MUERTOS (0 referencias reales)

### 1.1 Config
| Archivo | Razón |
|---------|-------|
| `estudiante-detalles/config/personalDataFields.ts` | Cero referencias en todo el codebase. Totalmente huérfano. |

### 1.2 Módulos vacíos ("pendiente")
| Archivo | Contenido |
|---------|-----------|
| `gestion-usuarios/index.ts` | Solo contiene `// pendiente`. No exporta nada. |
| `usuario-view/index.ts` | Solo contiene `// pendiente`. No exporta nada. |

Estos dos directorios enteros son cascarones sin implementación.

---

## 2. SISTEMA DE EDICIÓN LEGACY COMPLETO — TODO HUÉRFANO

Existe un sistema antiguo de edición de estudiantes en `estudiante-detalles/` compuesto
por hooks, componentes y secciones. **Ninguno de estos llega a ninguna página** (`src/pages`).
Fueron reemplazados por la arquitectura de `src/pages/EstudianteSection/` (outlet context,
sin modo edición).

### 2.1 Hooks legacy (ninguno consumido por páginas)

Forman una cadena interna que no sale hacia ningún componente montado:

```
useStudentDetail
  └─ useStudentData          (solo importado por useStudentDetail)
  └─ useStudentEditing
       ├─ useAutosave         (solo por useStudentEditing)
       ├─ useFamiliaEditing   (solo por useStudentEditing)
       ├─ useAcademicEditing  (solo por useStudentEditing)
       ├─ useEstudianteEditing(solo por useStudentEditing)
       └─ useInstitucionEditing(solo por useStudentEditing)

useStudentSemesters    — no llega a ninguna página
useStudentInterviews   — no llega a ninguna página
useStudentPermissions  — no llega a ninguna página
```

Todos en `estudiante-detalles/hooks/`. El `hooks/index.ts` los re-exporta pero nadie
consume ese barrel desde páginas.

### 2.2 Secciones legacy (componentes de alto nivel no montados en pages)

| Archivo | Razón |
|---------|-------|
| `estudiante-detalles/AcademicReportSection.tsx` | No aparece en ninguna page. |
| `estudiante-detalles/InterviewsSection.tsx` | No aparece en ninguna page. |
| `estudiante-detalles/AvanceCurricularSection.tsx` | No aparece en ninguna page. |
| `estudiante-detalles/SemesterPerformanceSection.tsx` | No aparece en ninguna page. |

### 2.3 Sub-carpeta avance-curricular — completamente muerta

Ninguno de estos componentes llega a una página (solo `AvanceCurricularSection` los importa,
que a su vez está muerta):

| Archivo |
|---------|
| `avance-curricular/AddSubjectModal.tsx` |
| `avance-curricular/EditSubjectModal.tsx` |
| `avance-curricular/CurricularComponents.tsx` |
| `avance-curricular/CreateSemesterModal.tsx` |
| `avance-curricular/SemesterModal.tsx` ← también importado por `CreateSemesterModal` |

### 2.4 Componentes primitivos legacy

Solo referenciados por secciones legacy (también muertas) o solo por su propio `index.ts`:

| Archivo | Único "uso" |
|---------|-------------|
| `components/FamilyMemberRow.tsx` | Solo en su `index.ts`. No montado en ninguna página. |
| `components/NewInterviewModal.tsx` | Solo en su `index.ts`. |
| `components/NewSemesterModal.tsx` | Solo en su `index.ts`. |
| `components/EditableField.tsx` | Solo en su propio archivo y `index.ts`. |
| `components/EditableTextarea.tsx` | Solo en su propio archivo y `index.ts`. |
| `components/DetailSectionWrapper.tsx` | Solo usado en `AcademicReportSection` (muerta). |
| `components/SectionDivider.tsx` | Solo en su propio archivo y `index.ts`. |

---

## 3. DUPLICADOS Y COMPONENTES REEMPLAZADOS

| Archivo | Problema |
|---------|---------|
| `estudiantes/FilterPanel.tsx` | Solo en su `index.ts`. El filtrado de estudiantes lo hace inline `EstudiantesSection.tsx`. Reemplazado. |
| `generaciones/GenerationsGrid.tsx` | No montado en ninguna page. `GeneracionesPanel.tsx` maneja su propio grid inline. |
| `generaciones/GenerationCard.tsx` | Solo usado por `GenerationsGrid` (que es huérfano). Muerto en cascada. |

---

## 4. ACTIVOS — para referencia

Estos SÍ están en uso y **no deben tocarse**:

| Módulo | Consumidor principal |
|--------|---------------------|
| `auth/login/LoginForm.tsx` | `LoginPage` |
| `auth/login/LoginAdminForm.tsx` | `LoginAdminPage` |
| `auth/password-recovery/` (todos) | `LoginForm`, `UserProfile`, `UserManagement` |
| `auth/shared/LoginFormContainer.tsx` | `LoginForm`, `LoginAdminForm` |
| `estudiantes/CreateEstudianteModal/` | `EstudiantesSection` |
| `estudiantes/ExcelImportModal.tsx` | `GeneracionView` |
| `generaciones/CreateGeneracionModal.tsx` | `GeneracionesPanel` |
| `generacion-view/StudentsTable.tsx` | `EstudiantesSection`, `GeneracionView` |
| `generacion-view/StudentFilterPanel.tsx` | `GeneracionView` |
| `generacion-view/GenerationHeader.tsx` | `GeneracionView` |
| `interview-workspace/` (todos) | `EntrevistaWorkspace` |
| `entrevista-workspace/LoadingState + ErrorState` | `EntrevistaWorkspace` |

---

## 5. RESUMEN EJECUTIVO

| Categoría | Archivos |
|-----------|---------|
| Muertos confirmados (seguros de eliminar) | ~27 |
| Módulos vacíos | 2 directorios |
| Requieren verificación adicional antes de eliminar | 0 |

**Estimación de limpieza:** eliminar el directorio completo
`estudiante-detalles/hooks/` + `estudiante-detalles/avance-curricular/` +
`estudiante-detalles/components/` (excepto revisar si algún componente primitivo
se reutilizará en el futuro) reduciría ~27 archivos y ~1500-2000 líneas de código muerto.

**Advertencia:** antes de eliminar, confirmar con `git log --follow` que ninguno de estos
archivos tiene lógica de negocio que deba migrarse (algunos hooks legacy pueden tener
lógica de guardado que todavía no se implementó en la nueva arquitectura).

---

*Generado: 2026-06-07 | Revisado con: grep de referencias cruzadas en todo src/*
