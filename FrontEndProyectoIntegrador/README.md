# Frontend (React + TypeScript + Vite)

Aplicación web del proyecto integrador. Usa Vite, React 18, TypeScript y Tailwind/MUI (theme en `src/theme.ts`).

## Requisitos
- Node 18+
- npm 9+ (o pnpm/yarn si prefieres)
- Backend corriendo en http://localhost:3000 por defecto (ajustable con variables Vite)

## Variables de entorno
Crear `.env.local` en `FrontEndProyectoIntegrador/` si necesitas apuntar a otro backend:
```
VITE_API_BASE=http://localhost:3000
```
Si no la defines, usa los valores por defecto del código.

## Instalación
```

```

## Scripts
- `npm run dev`     → servidor de desarrollo (HMR) en `http://localhost:5173`
- `npm run build`   → build de producción en `dist`
- `npm run preview` → sirve el build para verificación local
- `npm run lint`    → lint según la config de ESLint

## Estilos / UI
- Tailwind configurado en `tailwind.config.js` y `src/index.css`.
- Theme adicional en `src/theme.ts`.

## Notas de dominio
- Las entrevistas se crean con fecha y hora exacta; el backend persiste la hora sin normalizar.
- Reportes PDF incluyen observaciones e información adicional por entrevista.

## Estructura (resumen)
- `src/main.tsx` / `src/App.tsx`: arranque de React y ruteo principal.
- `src/pages/`: vistas completas
	- `Dashboard.tsx`: panel principal y generaciones.
	- `EntrevistaWorkspace.tsx`: workspace de entrevista por ID.
	- `EstudianteDetail.tsx`: detalle de estudiante con sección de entrevistas.
- `src/components/`: componentes UI y features
	- `features/entrevista-workspace/`: loader y error del workspace.
	- `features/interview-workspace/`: gestor de tabs y data table del workspace.
	- `features/student-detail/`: sección de entrevistas (lista, modal NuevaEntrevista).
	- `EntrevistaReportGenerator.tsx`: generador de PDF de entrevista.
- `src/services/`: clientes HTTP (authService, entrevistaService, estudianteService, etc.).
- `src/types/`: tipos/DTOs usados por el frontend.
- `src/config/`: config de logger, workspaceSections, etc.
- `src/hooks/`: hooks reutilizables (ej. pestañas del workspace).
- `public/`: assets estáticos.

