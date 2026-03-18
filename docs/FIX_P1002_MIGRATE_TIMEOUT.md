# Fix P1002: Advisory Lock Timeout en prisma migrate deploy

## Problema

```
Error: P1002
The database server was reached but timed out.
Timed out trying to acquire a postgres advisory lock (SELECT pg_advisory_lock(...)). Timeout: 10000ms.
```

Ocurre cuando Prisma usa la **URL del pooler** de Neon (`-pooler`) para migraciones. El pooler no soporta bien los advisory locks.

## Solución

Usar **conexión directa** (sin pooler) para `prisma migrate deploy`.

### 1. Añadir DIRECT_URL a .env

En Neon Console → Connect → copiar la **conexión directa** (hostname sin `-pooler`):

```
# Pooler (para app runtime)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Directa (para migrate deploy)
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

La diferencia: quitar `-pooler` del hostname.

### 2. Secrets en GitHub Actions

En **Settings → Secrets and variables → Actions**, añadir:

| Secret | Valor |
|--------|-------|
| `DIRECT_DATABASE_URL_DEV` | URL directa de la rama develop (Neon) |
| `DIRECT_DATABASE_URL_PROD` | URL directa de la rama main (Neon) |

Obtenerlas en Neon Console: seleccionar la rama → Connect → **Connection string** → elegir **Direct connection** (no Pooled).

### 3. Verificación

Tras push a `develop` o `main`, el workflow ejecutará `prisma migrate deploy` con `DIRECT_URL` y `MIGRATE_ADVISORY_LOCK_TIMEOUT=30000` (30s para cold starts de Neon).
