# Fix P2021: Tabla no existe en kaled-daily

## Diagnóstico

**Error:** `PrismaClientKnownRequestError` código **P2021**  
**Significado:** "The table `{table}` does not exist in the current database"

Las tablas `kaled_cohort_metrics`, `kaled_instructor_tasks`, `kaled_student_error_patterns` existen en el proyecto Neon que gestionamos con MCP, pero **Vercel puede estar usando otra base de datos** (por ejemplo, una creada por la integración Vercel-Neon).

## Cambios aplicados

### 1. `prisma db push` en el build de Vercel

- **package.json:** `build:vercel` ahora ejecuta `prisma db push` antes de `next build`
- **vercel.json:** `buildCommand: "npm run build:vercel"` para que Vercel use ese script

Así, en cada deploy se sincroniza el esquema Prisma con la base de datos que use Vercel, creando las tablas que falten.

### 2. Verificación de `DATABASE_URL`

Si tras el deploy sigue fallando:

1. En **Vercel** → Project → Settings → Environment Variables, revisa que `DATABASE_URL` apunte al proyecto Neon correcto (el que tiene las tablas).
2. En **Neon Console** (console.neon.tech), comprueba que el proyecto vinculado a app-instituto sea el mismo que usas con MCP (por ejemplo, `neon-app-tecnico` / `polished-recipe-25817067`).
3. Si la integración Vercel-Neon creó un proyecto distinto, o bien:
   - Conecta manualmente usando la URL del proyecto correcto, o
   - Ejecuta `prisma db push` localmente contra la URL de producción para crear las tablas.

## Después del deploy

1. Haz push de los cambios y espera al deploy en Vercel.
2. Ejecuta el workflow "Cron Jobs Vercel" manualmente (Actions → Run workflow → cron: kaled-daily).
3. Si sigue fallando, revisa los logs de Vercel y el body de la respuesta en GitHub Actions.
