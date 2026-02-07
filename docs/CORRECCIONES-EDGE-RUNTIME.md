# Correcciones Edge Runtime - FASE 0

## Problema Detectado

Al intentar arrancar el servidor después de completar FASE 0, se detectaron errores críticos de compatibilidad con **Edge Runtime** de Next.js 15/16:

### Errores Originales

```
Error [TypeError]: Cannot read properties of undefined (reading 'reduce')
  at module evaluation (src\lib\prisma.ts:1:1)
> 1 | import "dotenv/config";

⚠ ./src/lib/prisma.ts:38:5
A Node.js API is used (process.exit at line: 38) which is not supported in the Edge Runtime.

⚠ ./src/lib/prisma.ts:41:3
A Node.js API is used (process.on at line: 41) which is not supported in the Edge Runtime.
```

### Causa Raíz

- **Middleware de Next.js 15/16** corre en **Edge Runtime** por defecto
- Edge Runtime NO soporta:
  - ❌ `dotenv/config`
  - ❌ `process.exit()`
  - ❌ `process.on()`
  - ❌ Prisma Client directamente (en desarrollo)

## Correcciones Aplicadas

### 1. Simplificación de `src/lib/prisma.ts`

**Antes:**
```typescript
import "dotenv/config";  // ❌ No funciona en Edge Runtime
// ... código ...

// Shutdown handlers
if (typeof window === "undefined") {
  const shutdownHandler = async () => {
    await prisma.$disconnect();
    process.exit(0);  // ❌ No funciona en Edge Runtime
  };
  process.on("SIGINT", shutdownHandler);  // ❌ No funciona en Edge Runtime
  process.on("SIGTERM", shutdownHandler); // ❌ No funciona en Edge Runtime
}
```

**Después:**
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Singleton de Prisma
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

### 2. Refactorización de `src/middleware.ts`

**Problema:** El middleware estaba usando Prisma directamente para validar tenants:

```typescript
// ❌ NO funciona - Prisma en Edge Runtime
const tenant = await prisma.tenant.findUnique({
  where: { slug: subdomain },
});
```

**Solución:** Eliminamos Prisma del middleware. La validación del tenant ahora se hace en:

1. **API Routes**: usando `withTenantAuth()` que valida:
   - Sesión del usuario
   - Tenant existe y está activo
   - Usuario pertenece al tenant

2. **Pages/Layouts**: usando helpers específicos según se necesite

**Middleware simplificado:**
```typescript
// Solo setea headers y valida cookies (sin DB queries)
if (context === 'tenant') {
    requestHeaders.set('x-tenant-slug', subdomain);
    
    // NOTA: Validación de tenant se hace en API routes con withTenantAuth()
    // No en middleware (incompatible con Edge Runtime)
    
    const sessionToken = req.cookies.get('session_token')?.value;
    if (!sessionToken && !isPublicPath) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }
}
```

## Impacto en la Arquitectura

### ✅ Ventajas del Nuevo Enfoque

1. **Mayor Performance**: Middleware más ligero (solo headers y cookies)
2. **Mejor Escalabilidad**: Edge Runtime es más rápido
3. **Validación Centralizada**: Toda la lógica de negocio en un solo lugar (`withTenantAuth`)
4. **Más Testeable**: Funciones puras más fáciles de probar

### 📋 Consideraciones

- **Validación del Tenant**: Ahora se hace en cada API route/page que lo necesite
- **Redundancia Controlada**: Es aceptable - cada endpoint valida explícitamente
- **Error Handling**: Mejor control de errores específicos por endpoint

## Requerimientos Post-Corrección

### Para Arrancar el Servidor

**IMPORTANTE**: Después de estos cambios, se requiere un **reinicio completo** del servidor:

```bash
# 1. Detener servidor (Ctrl+C en el terminal)
# 2. Reiniciar
npm run dev
```

**NO** es suficiente el hot-reload de Turbopack porque tiene cached el código viejo.

### Verificar Funcionamiento

Una vez reiniciado, el servidor debería:
- ✅ Arrancar sin errores de Edge Runtime
- ✅ Compilar exitosamente todos los archivos
- ✅ Responder en `http://localhost:3000`

## Testing Post-Corrección

Una vez el servidor esté funcionando, ejecutar:

```powershell
.\test-security.ps1
```

Esto validará:
1. ✅ Login funciona y crea sesión
2. ✅ Rutas protegidas rechazan sin sesión (401)
3. ✅ Rutas protegidas permiten con sesión
4. ✅ Endpoint `/api/auth/me` funciona
5. ✅ Protección CSRF bloquea peticiones sin Origin
6. ✅ Rate limiting funciona en login

## Referencias

- [Next.js Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)
- [Prisma Edge Runtime Compatibility](https://www.prisma.io/docs/guides/deployment/edge/overview)
- [Next.js 16 Middleware Migration](https://nextjs.org/docs/messages/middleware-to-proxy)

## Estado

- ✅ Correcciones aplicadas
- ⏳ Pendiente: Reinicio del servidor por el usuario
- ⏳ Pendiente: Ejecutar `test-security.ps1`
- ⏳ Pendiente: Validar FASE 0 completamente funcional
