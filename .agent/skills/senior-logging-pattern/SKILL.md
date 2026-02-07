---
name: senior-logging-pattern
description: Implementa logging estructurado de nivel ingeniero senior en API routes con contexto completo, correlación entre servicios, métricas útiles y códigos de error. Use when creating or modifying API routes, migrating existing endpoints to structured logging, or when the user asks about logging best practices, request correlation, or error tracking.
---

# Senior Logging Pattern

Implementa logging estructurado que permite resolver incidentes en producción en minutos, no horas.

## Principios Fundamentales

1. **Contexto completo**: Cada log contiene información suficiente para resolver el problema
2. **Correlación**: Request ID permite seguir requests a través de servicios
3. **Métricas útiles**: Duración, cantidad de registros, IDs de recursos
4. **Códigos estructurados**: Errores identificables y rastreables
5. **Sanitización**: Datos sensibles removidos automáticamente

## Patrón Básico

```typescript
import { logApiStart, logApiSuccess, logApiError } from "@/lib/api-logger";
import { handleApiError } from "@/lib/error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now();
  const { slug } = await params;
  const body = await request.json();

  // 1. Iniciar logging con contexto completo
  const context = logApiStart(request, "crear_reserva", {
    params: { slug },
    body, // Será sanitizado automáticamente
  });

  try {
    // 2. Lógica de negocio
    const result = await servicio.ejecutar(data);
    const duration = Date.now() - startTime;

    // 3. Log de éxito con métricas
    logApiSuccess(context, "crear_reserva", {
      duration,
      recordCount: result.length,
      resultId: result.id,
      metadata: { tipo: result.tipo },
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    // 4. Log de error con contexto completo
    logApiError(context, "crear_reserva", { error });
    return handleApiError(error, context);
  }
}
```

## Funciones Disponibles

### `logApiStart()`

Registra inicio de operación con contexto completo.

```typescript
const context = logApiStart(request, "nombre_operacion", {
  params: { slug },
  query: Object.fromEntries(new URL(request.url).searchParams),
  body: data, // Será sanitizado automáticamente
});
```

**Incluye automáticamente**: Request ID, User ID, Tenant ID, método HTTP, endpoint, IP, User-Agent, timestamp.

### `logApiSuccess()`

Registra éxito con métricas útiles.

```typescript
logApiSuccess(context, "nombre_operacion", {
  duration: Date.now() - startTime,
  recordCount: result.length,
  resultId: result.id,
  metadata: { campo: valor },
});
```

**Incluye automáticamente**: Todo el contexto + duración, cantidad de registros, ID del recurso, metadatos.

### `logApiError()`

Registra error con contexto completo y stack trace.

```typescript
logApiError(context, "nombre_operacion", {
  error: error,
  errorCode: ErrorCode.VALIDATION_ERROR, // Opcional, se detecta automáticamente
  context: { campo: "email", valor: "invalid" },
});
```

**Incluye automáticamente**: Todo el contexto + mensaje de error, stack trace, código de error, tipo de error.

### `logApiOperation()`

Registra operaciones intermedias en procesos complejos.

```typescript
logApiOperation(context, "procesar_archivo", "Procesando fila 100 de 1000", {
  totalFilas: 1000,
  filaActual: 100,
});
```

## Migración de APIs Existentes

### Antes (❌ Logging básico)

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.info({ slug }, "Creando reserva");
    const result = await crearReserva(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error({ error }, "Error creando reserva");
    return handleApiError(error);
  }
}
```

### Después (✅ Logging estructurado)

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now();
  const { slug } = await params;
  const body = await request.json();

  const context = logApiStart(request, "crear_reserva", {
    params: { slug },
    body,
  });

  try {
    const result = await crearReserva(body);
    const duration = Date.now() - startTime;

    logApiSuccess(context, "crear_reserva", {
      duration,
      resultId: result.id,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logApiError(context, "crear_reserva", { error });
    return handleApiError(error, context);
  }
}
```

## Checklist de Migración

- [ ] Importar `logApiStart`, `logApiSuccess`, `logApiError` desde `@/lib/api-logger`
- [ ] Agregar `const startTime = Date.now()` al inicio del handler
- [ ] Reemplazar logs iniciales con `logApiStart()` y guardar contexto
- [ ] Agregar `logApiSuccess()` antes de retornar éxito (con duración y métricas)
- [ ] Reemplazar `logger.error()` con `logApiError()`
- [ ] Pasar contexto a `handleApiError(error, context)`
- [ ] Remover logs básicos (`logger.info`, `logger.error`) que ya están cubiertos

## Qué NO Hacer

❌ **Logs sin contexto**:

```typescript
logger.error({ error }, "Error");
```

✅ **Logs con contexto completo**:

```typescript
logApiError(context, "crear_reserva", { error });
```

❌ **Logs genéricos**:

```typescript
logger.info("Success!");
```

✅ **Logs descriptivos con métricas**:

```typescript
logApiSuccess(context, "crear_reserva", {
  duration: 150,
  resultId: reserva.id,
});
```

❌ **Exponer datos sensibles**:

```typescript
logger.info({ password: userPassword }, "Usuario creado");
```

✅ **Sanitización automática**:

```typescript
logApiStart(request, "crear_usuario", {
  body: { password: userPassword }, // Será sanitizado a "[REDACTED]"
});
```

## Beneficios

1. **Resolución de incidentes**: Request ID permite seguir un error a través de toda la aplicación
2. **Contexto completo**: Cada log contiene información suficiente para resolver el problema
3. **Correlación entre servicios**: Request ID propagado permite seguir un request completo
4. **Mejor observabilidad**: Métricas de tiempo y cantidad de registros permiten identificar problemas de rendimiento
5. **Debugging eficiente**: Stack traces estructurados facilitan encontrar la causa raíz

## Referencias

- Documentación completa: `docs/LOGGING_GUIDE.md`
- Implementación técnica: `docs/LOGGING_IMPLEMENTATION.md`
- Código fuente: `src/lib/api-logger.ts`, `src/lib/api-context.ts`
