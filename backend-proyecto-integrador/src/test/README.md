# Prueba de Base de Datos Completa

Este archivo de prueba valida todas las entidades y relaciones del sistema, tanto en PostgreSQL como en MongoDB.

## Requisitos previos

1. PostgreSQL corriendo y configurado:
   ```bash
   # Variables de entorno para PostgreSQL
   $env:POSTGRES_HOST = "localhost"
   $env:POSTGRES_PORT = "5432"
   $env:POSTGRES_USER = "postgres"
   $env:POSTGRES_PASSWORD = "postgres"
   $env:POSTGRES_DB = "proyecto_integrador"
   ```

2. MongoDB configurado (local o Atlas):
   ```bash
   # Para MongoDB Atlas
   $env:MONGODB_URI = "mongodb+srv://Mongodb:<password>@cluster0.rpsw4vj.mongodb.net/proyecto_integrador?retryWrites=true&w=majority"
   
   # O para MongoDB local
   # No necesitas definir MONGODB_URI, usará localhost por defecto
   ```

## Qué prueba este script

### PostgreSQL
1. CRUD completo de Institución
2. CRUD de Estudiante con todas sus relaciones
3. Creación y validación de:
   - Familia
   - Ramos Cursados
   - Historial Académico
   - Información Académica
4. Consultas complejas con relaciones anidadas

### MongoDB
1. CRUD completo de Entrevistas
2. Manejo de subdocumentos (etiquetas y textos)
3. Consultas agregadas (estadísticas)
4. Actualización parcial de documentos

## Cómo ejecutar

1. Crear la base de datos (si no existe):
   ```bash
   npm run db:create
   ```

2. Ejecutar prueba completa:
   ```bash
   npm run test:full
   ```

## Estructura de salida

- ✅ Éxito
- ❌ Error
- 🔄 Proceso en curso
- 📊 Estadísticas/Resultados
- 🔌 Cierre de conexión

## Notas

- El script limpia las bases antes de comenzar
- Verifica todas las relaciones y constraints
- Prueba operaciones CRUD completas
- Valida integridad referencial