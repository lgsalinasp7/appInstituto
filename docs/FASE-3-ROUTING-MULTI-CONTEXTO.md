# FASE 3: Routing Multi-Contexto - Completado

## Fecha: 2026-02-06

## Resumen

Se implemento el sistema de routing para los tres contextos de la plataforma:

| Dominio | Contexto | Contenido |
|---------|----------|-----------|
| `kaledsoft.tech` | landing | Landing publica |
| `admin.kaledsoft.tech` | admin | Panel admin KaledSoft |
| `[tenant].kaledsoft.tech` | tenant | App del tenant |

---

## 3.1 Middleware Multi-Contexto

**Archivo**: `src/middleware.ts`

El middleware (Edge Runtime compatible) maneja:

- **Deteccion de subdominio**: Extrae el subdominio del host
- **Headers inyectados**: `x-context` (landing/admin/tenant), `x-tenant-slug`
- **Validacion de sesion**: Redirige a login si no hay cookie `session_token`
- **Soporte desarrollo**: Detecta subdominios en `*.localhost:3000`

### Contextos:
- `landing`: Sin subdominio o `www` - Pagina publica, sin auth
- `admin`: Subdominio `admin` - Redirige a `/login` si no hay sesion
- `tenant`: Cualquier otro subdominio - Redirige a `/auth/login` si no hay sesion

---

## 3.2 Panel Admin (admin.kaledsoft.tech)

### Validacion server-side de platformRole

**Archivos nuevos:**
- `src/app/admin/AdminLayoutWrapper.tsx` (Server Component)
- `src/app/admin/AdminLayoutClient.tsx` (Client Component)

El `AdminLayoutWrapper` (Server Component) valida:
1. Sesion activa (`getCurrentUser()`)
2. Usuario de plataforma (`tenantId === null`)
3. `platformRole` existe (`SUPER_ADMIN`, `ASESOR_COMERCIAL`, `MARKETING`)

Si no cumple, redirige a `/dashboard` (tenant users) o `/login` (sin sesion).

### Login Admin
**Archivo nuevo**: `src/app/login/page.tsx`

Pagina de login especifica para `admin.kaledsoft.tech`:
- Diseno oscuro con branding KaledSoft
- Redirige a `/admin` tras login exitoso
- Texto de acceso restringido

### Estructura de rutas existente:
```
src/app/admin/
  layout.tsx          -> Delegado a AdminLayoutWrapper
  page.tsx            -> Dashboard con stats del sistema
  empresas/           -> Gestion de tenants
    [id]/page.tsx     -> Detalle del tenant
  users/page.tsx      -> Gestion de usuarios
  roles/page.tsx      -> Configuracion de roles
  content/page.tsx    -> Contenido academico
  audit/page.tsx      -> Registros de auditoria
  config/roles/       -> Configuracion de roles
  programs/page.tsx   -> Programas
```

---

## 3.3 Contexto Tenant (fix critico: x-tenant-slug)

### Problema resuelto: x-tenant-id nunca se seteaba

El middleware no puede usar Prisma (Edge Runtime), por lo que `x-tenant-id` 
nunca se inyectaba. Se corrigio en toda la cadena:

1. **`src/lib/api-auth.ts` - `getCurrentTenantId()`**: 
   Ahora resuelve `x-tenant-slug` → tenant.id via Prisma query.
   Ademas valida estado SUSPENDIDO/CANCELADO en la misma query.

2. **`src/app/suspended/page.tsx`**: 
   Cambiado de `x-tenant-id` a `x-tenant-slug`.

### Validacion de tenant SUSPENDIDO/CANCELADO

Se valida en tres puntos:

| Punto | Archivo | Accion |
|-------|---------|--------|
| Layout protegido | `ProtectedLayoutWrapper.tsx` | `redirect("/suspended")` |
| Auth layout | `AuthLayoutWrapper.tsx` | `redirect("/suspended")` |
| API routes | `api-auth.ts` getCurrentTenantId() | `throw ForbiddenError` |

### Inyeccion de branding en tenant

El `ProtectedLayoutWrapper`:
1. Resuelve tenant desde `x-tenant-slug`
2. Valida estado del tenant
3. Obtiene branding con cache (5 min)
4. Inyecta `TenantThemeProvider` (CSS variables)
5. Inyecta `BrandingProvider` (React Context para Client Components)

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/lib/api-auth.ts` | `getCurrentTenantId()` resuelve desde slug, valida estado |
| `src/app/suspended/page.tsx` | Usa `x-tenant-slug` |
| `src/app/admin/layout.tsx` | Delegado a Server Component wrapper |
| `src/app/admin/AdminLayoutWrapper.tsx` | **NUEVO** - Validacion platformRole |
| `src/app/admin/AdminLayoutClient.tsx` | **NUEVO** - UI del admin layout |
| `src/app/login/page.tsx` | **NUEVO** - Login para admin.kaledsoft.tech |
| `src/app/(protected)/ProtectedLayoutWrapper.tsx` | Valida status tenant |
| `src/app/auth/AuthLayoutWrapper.tsx` | Valida status tenant |

## Compilacion

Solo errores preexistentes en `node_modules/resend` (paquete externo).
Cero errores en codigo propio.
