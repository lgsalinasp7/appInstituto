# Fix P2021: Tabla Tenant no existe — DATABASE_URL incorrecta

## Diagnóstico

**Error:** `The table public.Tenant does not exist in the current database` (P2021)

**Causa:** La variable `DATABASE_URL` en Vercel apunta a una base de datos **distinta** a la que tiene el esquema completo. Probablemente una BD vacía creada por la integración Vercel-Neon.

## Solución

Vercel debe usar el **mismo proyecto Neon** que tiene todas las tablas (Tenant, User, AcademyCohort, etc.):

- **Proyecto Neon:** `neon-app-tecnico`
- **Project ID:** `polished-recipe-25817067`
- **Host pooler:** `ep-empty-tree-ah4r0eiv-pooler.c-3.us-east-1.aws.neon.tech`

## Pasos para corregir

### 1. Obtener la connection string correcta

**Opción A — Neon Console (recomendado):**

1. Ve a [console.neon.tech](https://console.neon.tech)
2. Selecciona el proyecto **neon-app-tecnico**
3. En **Connection details**, copia la **Connection string** (usa el endpoint con `-pooler` en el hostname)
4. Asegúrate de que incluya `?sslmode=require` (o `sslmode=require`)

**Opción B — MCP Neon:**

Si usas Cursor con MCP Neon, ejecuta `get_connection_string` para el proyecto `polished-recipe-25817067`.

### 2. Actualizar DATABASE_URL en Vercel

1. Ve a [vercel.com](https://vercel.com) → tu proyecto **app-instituto**
2. **Settings** → **Environment Variables**
3. Busca `DATABASE_URL`
4. **Edit** y pega la connection string del proyecto **neon-app-tecnico**
5. Asegúrate de que esté asignada a **Production** (y Preview si aplica)
6. **Save**
7. **Redeploy** el proyecto para que tome la nueva variable

### 3. Verificar

Tras el redeploy, ejecuta el workflow "Cron Jobs Vercel" con `cron: kaled-daily`. Debe responder HTTP 200.

## Cómo comprobar que usas la BD correcta

La URL correcta debe contener:

- Host: `ep-empty-tree-ah4r0eiv-pooler` (o similar del proyecto neon-app-tecnico)
- Database: `neondb`
- Región: `c-3.us-east-1.aws.neon.tech`

Si tu URL tiene un host distinto (por ejemplo `ep-xxx-xxx` diferente), estás usando otra base de datos.
