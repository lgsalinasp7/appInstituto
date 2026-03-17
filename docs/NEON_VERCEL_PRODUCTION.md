# Neon + Vercel: Configuración para Producción

## Problema resuelto

Los errores `PrismaClientKnownRequestError` (P1001) en producción se debían a:

1. **Cold starts de Neon**: El compute de Neon se suspende tras 5 min de inactividad. La primera petición tras suspensión tarda ~1-3s en despertar.
2. **Timeout de Prisma**: Sin `connect_timeout`, Prisma fallaba antes de que Neon respondiera.

## Cambios implementados

### 1. Keep-alive cron (diario)

- **Ruta**: `/api/cron/keep-alive`
- **Función**: Ejecuta `SELECT 1` para despertar la BD (útil tras inactividad nocturna).
- **Configuración**: `vercel.json` → `0 8 * * *` (8:00 UTC diario).
- **Nota**: Vercel Hobby solo permite crons diarios. Para keep-alive cada 4 min necesitas plan Pro o un servicio externo (cron-job.org) que llame a tu API.

### 2. Prisma Neon Adapter (producción)

- **Archivo**: `src/lib/prisma.ts`
- **Función**: En producción con Neon, usa `@prisma/adapter-neon` + `@neondatabase/serverless` en lugar del driver TCP. El driver serverless usa HTTP/WebSockets y maneja cold starts mucho mejor.

### 3. Connection string recomendado

En **Vercel → Project → Settings → Environment Variables**, asegúrate de que `DATABASE_URL`:

- Use el endpoint **pooler** (hostname con `-pooler`)
- Incluya `sslmode=require`

Ejemplo (obtén la URL real desde [Neon Console](https://console.neon.tech)):

```
postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

Los parámetros `connect_timeout` y `pool_timeout` se añaden automáticamente en runtime si faltan.

### 4. CRON_SECRET

El cron keep-alive requiere `CRON_SECRET` en Vercel (igual que los demás crons). Vercel lo envía automáticamente al invocar crons.

## Verificación post-deploy

1. **Logs de Vercel**: Revisa que `/api/cron/keep-alive` responda 200 cada 4 min.
2. **Runtime logs**: No deberían aparecer más errores P1001.
3. **Neon Console**: El compute debería permanecer en estado "Active" durante el horario de uso.

## Plan Neon y cold starts

- **Free tier**: Compute se suspende tras 5 min. El keep-alive evita esto.
- **Scale plan**: Puedes configurar `suspend_timeout_seconds` (hasta 7 días) o desactivar scale-to-zero.
