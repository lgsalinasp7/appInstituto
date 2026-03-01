# Aislamiento de Datos por Tenant (Kaled* Models)

## Regla de Oro

> Todo dato de los modelos Kaled* DEBE tener `tenantId`. Las queries SIEMPRE filtran por `tenantId`.

## Modelos Aislados

| Modelo | tenantId | Unique Constraint |
|--------|----------|-------------------|
| KaledLead | `String?` | `@@unique([email, tenantId])` |
| KaledCampaign | `String?` | `@@unique([name, tenantId])` |
| KaledEmailTemplate | `String?` | `@@unique([name, tenantId])` |
| KaledEmailSequence | `String?` | `@@unique([name, tenantId])` |
| KaledEmailLog | `String?` | Solo `@@index([tenantId])` |
| KaledLeadInteraction | `String?` | Solo `@@index([tenantId])` |
| KaledEmailSequenceStep | `String?` | Solo `@@index([tenantId])` |

**Nota:** `tenantId` es nullable (`String?`) para proteger la captura de leads publicos. Si la resolucion del tenant falla, el lead se guarda con `tenantId=null`. En PostgreSQL, `NULL != NULL` en unique constraints, asi que no hay conflictos.

## Flujo de Resolucion de Tenant

```
Subdomain (edutec.kaledsoft.tech)
    |
    v
Middleware extrae slug del subdomain
    |
    v
Header x-tenant-slug se agrega al request
    |
    v
API Route usa withPlatformAdmin o withTenantAuth
    |
    v
resolveKaledTenantId(queryTenantId?) resuelve el tenant
    |
    v
Servicio filtra por tenantId en todas las queries
```

## Helpers

### `resolveKaledTenantId(queryTenantId?: string | null): Promise<string>`

Ubicacion: `src/lib/kaled-tenant.ts`

- Si se pasa `queryTenantId`, valida que el tenant existe y esta activo
- Si no, busca el tenant con slug `'kaledsoft'` (con cache en memoria)
- Lanza error si no encuentra el tenant

### `assertTenantContext(tenantId): asserts tenantId is string`

Ubicacion: `src/lib/tenant-guard.ts`

- Type guard que lanza error si tenantId es null/undefined
- Usar en servicios donde tenantId es obligatorio

## Patron de Uso en Rutas Admin

```typescript
import { resolveKaledTenantId } from '@/lib/kaled-tenant';

export const GET = withPlatformAdmin(['SUPER_ADMIN'], async (request) => {
  const tenantId = await resolveKaledTenantId(
    request.nextUrl.searchParams.get('tenantId')
  );
  const data = await SomeService.getAll(tenantId);
  return NextResponse.json({ success: true, data });
});
```

## Patron Seguro para Rutas Publicas (Leads)

```typescript
// CRITICO: No perder leads si falla la resolucion del tenant
let tenantId: string | undefined;
try {
  tenantId = await resolveKaledTenantId();
} catch (e) {
  console.error('Error resolviendo tenant, capturando sin tenantId:', e);
}
const result = await KaledLeadService.captureLead(data, tenantId);
```

## Composite Unique Lookups

Los modelos con `@@unique([field, tenantId])` requieren un cambio en los queries:

```typescript
// ANTES (ya no compila)
prisma.kaledLead.findUnique({ where: { email } })

// DESPUES
prisma.kaledLead.findUnique({
  where: { email_tenantId: { email, tenantId } }
})
```

## Guards de Seguridad

| Wrapper | Uso |
|---------|-----|
| `withPlatformAdmin(['SUPER_ADMIN'])` | Rutas admin de CRM/plataforma |
| `withTenantAuth` | Rutas de tenant (estudiantes, pagos, etc.) |
| `withTenantAuthAndCSRF` | Rutas de tenant con proteccion CSRF |

**PROHIBIDO:** Usar `withAuth` (sin rol) en rutas admin que acceden a datos sensibles.

## Archivos Clave

- `prisma/schema.prisma` - Definicion de modelos con tenantId
- `src/lib/kaled-tenant.ts` - Helper resolveKaledTenantId()
- `src/lib/tenant-guard.ts` - Helper assertTenantContext()
- `prisma/migrate-kaled-tenantid.ts` - Script de migracion de datos existentes
- `src/modules/kaled-crm/types/index.ts` - Interfaces con tenantId
