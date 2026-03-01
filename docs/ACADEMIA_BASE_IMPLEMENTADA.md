# Implementacion Base - Kaled Academy

Fecha: 2026-02-28

## Objetivo

Crear una estructura base modular para `Kaled Academy` como tenant independiente dentro de KaledSoft, con acceso por invitacion (sin registro publico), login propio y branding alineado al sistema de diseno existente.

## Fase 1 - Base funcional en modulo Empresas

### Cambios implementados

- Se agrego un flujo de bootstrap desde `Empresas` para crear/sincronizar `Kaled Academy`.
- Se creo endpoint admin dedicado:
  - `POST /api/admin/tenants/bootstrap-academy`
- Se activo logica para password temporal autogenerado y cambio obligatorio en primer login.
- Se bloqueo registro publico solo para el tenant `kaledacademy`.
- Se mantuvo el estilo visual base de KaledSoft (colores y logo principal).

### Archivos clave

- `src/modules/tenants/components/TenantsListView.tsx`
- `src/app/api/admin/tenants/bootstrap-academy/route.ts`
- `src/modules/tenants/services/tenants.service.ts`
- `src/app/api/auth/register/route.ts`
- `src/proxy.ts`

## Fase 2 - Modularizacion Academia

### Cambios implementados

- Se creo modulo dedicado para Academia:
  - `src/modules/academia/config/academy-tenant.config.ts`
  - `src/modules/academia/services/academy-bootstrap.service.ts`
  - `src/modules/academia/index.ts`
  - `src/modules/academia/README.md`
- El bootstrap ahora:
  - crea o sincroniza tenant `kaledacademy`
  - asegura dominio `kaledacademy.kaledsoft.tech`
  - asegura branding base (mismos colores KaledSoft + logo principal)
  - asegura admin principal `gerente@kaledsoft.tech`
  - genera password temporal cuando corresponde

## Fase 3 - Validaciones finales

## Build

Se ejecuto `npm run build` multiples veces durante la implementacion y al final.

Resultado final: OK (exit code 0).

## Lint

Se ejecuto `npm run lint`.

Resultado: existen errores legacy/preexistentes en multiples archivos no relacionados directamente con esta implementacion.

Accion aplicada:
- Se corrigio un error en archivo tocado por este trabajo (`src/modules/tenants/services/tenants.service.ts`) reemplazando `any` por `Prisma.TenantWhereInput`.

## Comportamiento esperado tras esta base

1. En `admin -> Empresas`, usar boton `Crear Kaled Academy`.
2. El sistema crea/sincroniza tenant y devuelve password temporal cuando aplique.
3. Login del tenant en:
   - `https://kaledacademy.kaledsoft.tech/auth/login`
4. Registro publico de `kaledacademy` deshabilitado:
   - `/auth/register` redirige a login
   - `/api/auth/register` devuelve 403 para ese tenant
5. Usuario admin creado con `mustChangePassword=true`.

## Continuacion - UX Auth para Kaled Academy

### Cambios adicionales

- `AuthLayoutWrapper` pasa `allowRegister` al cliente segun tenant (false para kaledacademy).
- `AuthLayoutClient` muestra enlace "¿No tienes cuenta? Regístrate" solo cuando:
  - `allowRegister === true`
  - ruta actual es login (`/auth/login`)
- En Kaled Academy no se muestra el enlace de registro en la pagina de login.

### Archivos modificados

- `src/app/auth/AuthLayoutWrapper.tsx`
- `src/app/auth/AuthLayoutClient.tsx`

## DEPRECADO: Bootstrap Academy

> **Fecha:** 2026-02-28

El endpoint `POST /api/admin/tenants/bootstrap-academy` y el boton "Crear Kaled Academy" en TenantsListView han sido **deprecados** y reemplazados por el sistema de **ProductTemplate**.

### Nuevo flujo:
1. Ir a `/admin/empresas` → Tab "Productos"
2. Seleccionar plantilla "Kaled Academy"
3. Click "Desplegar" → Llenar formulario → Deploy automatico

### Documentacion relacionada:
- `docs/TENANT_ISOLATION.md` - Aislamiento de datos por tenant
- `docs/IMPLEMENTACION_PRODUCTOS_AISLAMIENTO.md` - Resumen completo de la implementacion

## Notas para siguiente iteracion (frontend/backend profundo)

- Integrar flujo completo de invitaciones UI para Academia.
- Agregar pruebas especificas de bootstrap/seguridad para `kaledacademy`.
- Definir en detalle permisos/roles de Academia separados de otros tenants.
- Parametrizar analytics/pixel por tenant en la siguiente fase de marketing.
