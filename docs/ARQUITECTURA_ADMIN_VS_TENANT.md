# Arquitectura Admin vs Tenant (Separacion Radical)

## Objetivo

Definir una separacion estricta entre:

- **Plataforma (KaledSoft):** `admin.kaledsoft.tech`
- **Tenant (cliente):** `*.kaledsoft.tech` (ejemplo: `edutec.kaledsoft.tech`)

Cada contexto tiene UI, rutas y autorizacion distintas.

---

## Reglas de Negocio

1. **Admin NO es tenant**
   - En `admin.kaledsoft.tech` no se deben renderizar layouts ni paginas tenant.
   - El contexto admin debe vivir solo bajo rutas `/admin/*`.

2. **Tenant NO es admin**
   - En `edutec.kaledsoft.tech` no se deben exponer vistas `/admin/*`.

3. **Auth por contexto**
   - **Admin:** `withAuth` + verificacion de `platformRole`.
   - **Tenant:** `withTenantAuth` + `tenantId` obligatorio.

4. **Headers**
   - `x-tenant-slug` solo aplica a contexto tenant.
   - El subdominio `admin` nunca se trata como tenant.

---

## Estado Actual Implementado

### Frontend

- Se creo perfil exclusivo de plataforma: `src/app/admin/profile/page.tsx`
- El dropdown de usuario ahora soporta `profileHref`:
  - Admin: `/admin/profile`
  - Tenant: `/profile`

### Proxy/Middleware

- En contexto admin, se redirige:
  - `/profile` -> `/admin/profile`
  - `/configuracion` -> `/admin/configuracion`
- En contexto admin, rutas no admin (excepto `api`, `_next`, login/publicas) redirigen a `/admin`.

### APIs Admin

Se elimino dependencia de `withTenantAuth` en `/api/admin/*` y se migro a:

- `withAuth`
- Resolucion explicita de tenant (`resolveTenantId`) cuando la funcionalidad requiere datos segmentados.

Rutas migradas:

- `src/app/api/admin/documents/route.ts`
- `src/app/api/admin/documents/[id]/route.ts`
- `src/app/api/admin/agents/memories/[id]/route.ts`
- `src/app/api/admin/agents/kaled/briefing/route.ts`
- `src/app/api/admin/agents/kaled/funnel-analysis/route.ts`

---

## Sobre Usuarios: ¿mismo usuario para admin y tenant?

### Respuesta corta

**No es recomendable** para operacion diaria si quieres aislamiento total de contexto.

### Detalle tecnico

- En `prisma/schema.prisma`, `User.email` es **unico global**.
- Esto implica que **no puedes tener dos usuarios distintos con el mismo email** (uno admin y otro tenant).

### Recomendacion operativa

Usar identidades separadas:

- Admin plataforma: por ejemplo `superadmin@kaledsoft.tech` (con `platformRole`, sin `tenantId`)
- Usuario tenant: por ejemplo `admin@edutec.com` (con `tenantId`, sin `platformRole`)

No necesitas "borrar" de inmediato el usuario de edutec si hoy te funciona, pero para evitar cruces y confusion, conviene separar correos/identidades.

---

## Checklist para nuevas funcionalidades

- Si la vista es de plataforma, ubicar en `src/app/admin/*`.
- Si la API es de plataforma, usar `withAuth` (no `withTenantAuth`).
- Si la API es tenant, usar `withTenantAuth`.
- No usar links hardcodeados a `/profile` desde componentes compartidos de admin.
- Verificar que `admin` nunca viaje como `x-tenant-slug`.

