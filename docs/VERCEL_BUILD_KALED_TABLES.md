# Build en Vercel y tablas Kaled (`ensure-kaled-tables`)

## Problema

El script `prisma/ensure-kaled-tables.ts` corre en `npm run build:vercel`. Si **Preview** (o el entorno de build) no tiene **`DATABASE_URL`**, el build fallaba con `Environment variable not found: DATABASE_URL`.

## Solución

1. **CI (recomendado):** Tras `prisma migrate deploy`, los workflows **Deploy develop** y **Deploy producción** ejecutan `ensure-kaled-tables` contra la base dev/prod con los secretos `DIRECT_DATABASE_URL_DEV` / `DIRECT_DATABASE_URL_PROD`. Así las tablas Kaled existen **antes** de que Vercel construya.

2. **Build en Vercel:** Si no hay `DATABASE_URL` en el paso de build, el script **omite** la creación (solo aviso en log) y el build continúa. No es necesario duplicar secretos en Preview solo por el build.

## Opcional en Vercel

Si quieres que el build también ejecute `ensure-kaled-tables` (redundante si CI ya corrió), define **`DATABASE_URL`** en **Settings → Environment Variables** para el entorno correspondiente (Preview / Production).
