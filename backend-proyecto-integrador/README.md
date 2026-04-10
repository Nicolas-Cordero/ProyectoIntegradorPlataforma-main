# Backend (NestJS + PostgreSQL)

API del proyecto integrador, construida con NestJS 11, TypeORM y JWT. Este README cubre solo el backend.

## Requisitos
- Node 18+ (o contenedor Docker)
- PostgreSQL (por defecto usa el servicio `db` del docker-compose)
- Variables de entorno (se leen de `.env` o `.env.local`):
    - `PORT` (default 3000)
    - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
    - `JWT_SECRET`, `JWT_EXPIRATION`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRATION`
    - `CORS_ORIGINS` (lista separada por coma)

## Correr con Docker (recomendado)
En la raíz del monorepo:
```
docker compose up -d
```
Levanta backend, base de datos y frontend con los defaults del compose.

## Correr local (sin Docker)
En `backend-proyecto-integrador/`:
```
npm install
npm run start:dev
```
Si quieres build y modo prod local:
```
npm run build
npm run start:prod
```

## Scripts útiles
- `npm run start:dev`  → servidor con hot-reload
- `npm run build`      → compila a `dist`
- `npm run start:prod` → ejecuta build
- `npm run seed`       → datos de ejemplo (revisa conexión a DB antes)
- `npm run test`       → tests (usa ts-node)
- `npm run lint` / `npm run format` → lint/format TS

## Notas de dominio (entrevistas)
- El número de entrevista ya no tiene límite; solo se impide duplicar el mismo número en el mismo año para el estudiante (validación en servicio).
- La fecha/hora que envía el frontend se guarda tal cual (no se normaliza a mediodía). Asegúrate de enviar ISO con hora correcta.

## Estructura (resumen)
- `src/app.module.ts`: módulo raíz, registra todos los módulos de dominio.
- `src/config/`: configuración de app, DB y JWT (`app.config.ts`, `database.config.ts`, `jwt.config.ts`).
- `src/auth/`: login/registro, JWT strategies, guards y controladores.
- `src/users/`: CRUD de usuarios y roles.
- `src/entrevistas/`: entidad, DTOs, servicio y controlador de entrevistas (sin límite de número, valida duplicados por año/número).
- `src/estudiante/`, `familia/`, `beneficios/`, `periodo-academico/`, etc.: módulos de dominio para datos académicos y familiares.
- `src/seeder/`: seeding inicial para datos base.
- `src/main.ts`: bootstrap de Nest con configuración global de CORS y prefijo.

## Credenciales de ejemplo (crear vía POST /users o seed)
```
{
    "username": "testadmin",
    "email": "admin@admin.cl",
    "password": "admin123",
    "nombre": "admin",
    "apellido": "nimda",
    "rol": "admin"
}
```
Luego inicia sesión con ese usuario para ver las vistas protegidas en el frontend.