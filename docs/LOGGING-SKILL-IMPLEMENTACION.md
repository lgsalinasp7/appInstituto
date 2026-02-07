# Implementacion Skill: senior-logging-pattern

## Fecha: 2026-02-06

## Archivos Creados

### `src/lib/api-context.ts`
- **ErrorCode**: Codigos de error estructurados (AUTH_001, VAL_001, DB_001, etc.)
- **ApiContext**: Interfaz de contexto con requestId, method, endpoint, userId, tenantId, ip, userAgent
- **extractRequestContext()**: Extrae contexto completo de un NextRequest
- **sanitize()**: Sanitiza objetos removiendo campos sensibles (password, token, secret, etc.)
- **detectErrorCode()**: Detecta automaticamente el codigo de error basado en el tipo de error
- **generateRequestId()**: Genera IDs unicos `req_XXXXXXXX`

### `src/lib/api-logger.ts`
- **logApiStart()**: Registra inicio de operacion con contexto completo (params, query, body sanitizados)
- **logApiSuccess()**: Registra exito con metricas (duracion, recordCount, resultId, metadata)
- **logApiError()**: Registra error con contexto completo, stack trace y codigo de error
- **logApiOperation()**: Registra operaciones intermedias en procesos complejos

## Formato de Logs

Todos los logs son JSON estructurado para facilitar busqueda en produccion:

```json
{
  "level": "info",
  "type": "api_start",
  "requestId": "req_a1b2c3d4e5f6g7h8",
  "operation": "crear_estudiante",
  "method": "POST",
  "endpoint": "/api/students",
  "userId": "cuid123",
  "tenantId": "cuid456",
  "ip": "192.168.1.1",
  "timestamp": "2026-02-06T10:00:00.000Z"
}
```

## Uso en APIs Nuevas

Las APIs de FASE 2 (branding) ya usan este patron:
- `src/app/api/admin/tenants/[id]/branding/route.ts`
- `src/app/api/tenant/branding/route.ts`

## Checklist de Migracion para APIs Existentes

Las ~60 APIs existentes pueden migrarse gradualmente al patron siguiendo:
1. Importar `logApiStart`, `logApiSuccess`, `logApiError`
2. Agregar `const startTime = Date.now()`
3. Crear contexto con `logApiStart()`
4. Agregar `logApiSuccess()` antes de return exitoso
5. Reemplazar `console.error()` con `logApiError()`
