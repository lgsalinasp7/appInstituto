# Kaledsoft — Contexto Compartido para Agentes

## Identidad del Proyecto

**Kaledsoft** es la empresa propia de Luis Salinas. Opera una plataforma SaaS multi-tenant **en produccion con clientes reales** que paga el desarrollo y operacion. Este proyecto **SI genera dinero** (a diferencia de Amaxoft Admin, que es contrato externo).

- **Path local**: `C:\KALEDSOFT\AppInstitutoProvisional`
- **Repo**: GitHub (rama `develop` dev, `main` prod)
- **Estado**: en produccion con clientes reales activos (edutec, kaledacademy, poimensoft)

## Stack Tecnico

| Tecnologia | Version | Notas |
|---|---|---|
| Next.js | **16.1.4** (App Router + Turbopack) | Mas nuevo que Amaxoft (15) |
| React | 19 | Sin `forwardRef`, ref como prop, `useMemo`/`useCallback` opcionales |
| TypeScript | strict | PROHIBIDO `any`; double-cast Prisma JSON `as unknown as X` |
| Prisma | 6.19+ | Single schema (no DB-per-tenant — multi-tenant via columna `tenantId`) |
| Neon PostgreSQL | - | Single project (no Database-per-tenant como Amaxoft) |
| Tailwind | 4 | NO `var()` en className, usar `cn()` |
| Zod | 4 | `z.email()` (no `z.string().email()`) |
| Validation | Zod schemas en `src/modules/{modulo}/schemas/index.ts` |
| Auth | sesiones httpOnly cookies + roles/permisos custom (no NextAuth) |
| API Logger | `@/lib/api-logger` (`logApiStart/Success/Error`) |
| Tenant Fetch | `tenantFetch()` de `@/lib/tenant-fetch` (auto-inyecta `x-tenant-slug`) |
| Playwright | - | E2E tests configurados |
| Mintlify | - | Docs en `mintlify-docs/` |

## Arquitectura Multi-Tenant

**A diferencia de Amaxoft (Database-per-Tenant)**, Kaledsoft usa **Single-Database con columna `tenantId`**:

- Aislamiento por header `x-tenant-slug` (NO subdomain).
- Subdominio local dev: `kaledacademy.localhost:3000`, `edutec.localhost:3000`, etc. (hosts file).
- Wrappers auth API:
  - `withTenantAuth` — valida sesion + tenant
  - `withTenantAuthAndCSRF` — anterior + CSRF
  - `withPlatformAdmin` — acceso a control plane (Luis/admins Kaledsoft)
  - `withAcademyAuth` — wrapper especifico para tenants tipo Academia
  - `withLavaderoAuth` — wrapper especifico para tenants tipo Lavadero
- TODOS los queries Prisma filtran por `tenantId` (el wrapper inyecta).
- Services server-side requieren `import "server-only"` al inicio.

## Tenants Reales en Produccion

| Slug | Nombre | Plan | Producto | Notas |
|---|---|---|---|---|
| `kaledsoft` | KaledSoft | EMPRESARIAL | (control plane) | Tenant del dueno, dogfooding |
| `poimensoft` | PoimenSoft | BASICO | Academia (?) | Cliente activo |
| `edutec` | Instituto EDUTEC | PROFESIONAL | Academia | Instituto tecnico, cliente activo |
| `kaledacademy` | KaledAcademy | PROFESIONAL | Academia | Bootcamp propio Kaledsoft, contenido en activo desarrollo |
| `lavadero-prueba` | lavadero-prueba | PROFESIONAL | Lavadero | Tenant prueba del producto Lavadero Pro |

## Productos / Verticales

### 1. Academia (`(protected)/academia/`)
Modulo educativo: cohortes, alumnos, contenido bootcamp, profesores. Usado por `edutec`, `kaledacademy`, posiblemente `poimensoft`.

Areas conocidas:
- `academia/admin/cohorts/` — gestion cohortes y alumnos
- `academia/admin/profile/` — perfil del tenant academia

### 2. Lavadero Pro (`(protected)/lavadero/`)
POS para lavaderos de carros/motos. Documentado en `docs/IMPLEMENTACION_LAVADERO_PRO.md`.

Modulos schema Prisma: `LavaderoCustomer`, `LavaderoVehicle`, `LavaderoService`, `LavaderoOrder`, `LavaderoPayment`.

Areas conocidas:
- `lavadero/admin/billing/`, `customers/`, `dashboard/`, etc.

### 3. Modulos Cross-Tenant

Las siguientes secciones aparecen como areas comunes (no necesariamente activas en todos los tenants):

- `agentes-comerciales/`
- `campanas/`
- `configuracion/`
- `dashboard/`
- `finanzas/`
- `matriculas/`
- `pipeline/`
- `profile/`
- `prospectos/`
- `recaudos/`
- `reportes/`

## Estructura de Modulos (Convencion)

```
src/modules/{nombre}/
├── components/    # React components
├── schemas/       # Zod validation schemas
├── services/      # Logica de negocio (server-side, con "server-only")
├── types/         # TypeScript interfaces
└── hooks/         # Custom hooks (client-side)
```

## Reglas Tecnicas Estrictas (del CLAUDE.md root)

### TypeScript
- PROHIBIDO `any` — usar tipos especificos de Prisma o `unknown` con type guards.
- Si `any` es inevitable: `// eslint-disable-next-line @typescript-eslint/no-explicit-any` con razon.
- Prisma JSON: double-cast `as unknown as TargetType`.
- App Router context params: `context!.params` (non-null).

### React 19
- PROHIBIDO `forwardRef` — usar `ref` como prop con `ComponentProps<typeof X>`.
- PROHIBIDO `import * as React` — importar solo lo necesario.
- `useMemo`/`useCallback` opcionales (no prohibidos).

### API Routes
- Respuestas: `{ success: boolean, data?, message?, error? }`.
- Auth: usar wrappers (`withTenantAuth`, etc.).
- Logging: `logApiStart/Success/Error` (PROHIBIDO `console.log` en API routes).

### Client-side
- PROHIBIDO `fetch()` raw — usar `tenantFetch()`.
- `next/dynamic` con `ssr: false` REQUIERE `'use client'`.

### DB
- `prisma/schema.prisma` (single file).
- Tras cambios: `npx prisma generate && npx prisma db push`.
- NO modificar migraciones existentes.

### Seguridad
- NUNCA hardcodear secrets, API keys, slugs de tenants.
- NUNCA commitear `.env`.
- NUNCA exponer datos de otros tenants — validar SIEMPRE `tenantId`.

### Build
- `npm run build` despues de cambios significativos (>3 archivos o cambios de tipos).

## Skills Existentes Especificos Kaledsoft

En `.claude/skills/`:

- **kaledacademy-narrator** — generacion de narrativa para contenido bootcamp.
- **kaledacademy-seed-writer** — escritura de seeds para contenido bootcamp.
- **kaledacademy-html-builder** — construccion de HTML para mintlify.
- **kaledacademy-ai-bug-injector** — inyeccion controlada de bugs en ejercicios bootcamp.
- **mintlify** (symlink) — utilidades mintlify.
- **visily-to-nextjs** — conversion de exports Visily a paginas Next.

El agente `content-creator` orquesta los 3 primeros para generar lecciones del bootcamp kaledacademy.

## Infraestructura

- **Hosting**: Vercel (verificar projects).
- **DB**: Neon (single project + multi-tenant via tenantId).
- **CI/CD**: GitHub Actions (verificar workflows).
- **Docs**: Mintlify (`mintlify-docs/`).

## Archivos Clave

| Archivo | Contenido |
|---|---|
| `CLAUDE.md` (root) | Instrucciones del proyecto + reglas estrictas |
| `prisma/schema.prisma` | Schema unico multi-tenant |
| `src/lib/api-logger.ts` | Logging estructurado |
| `src/lib/tenant-fetch.ts` | Fetch client-side con `x-tenant-slug` |
| `docs/CLAUDE.md` | Documentacion completa |
| `docs/IMPLEMENTACION_LAVADERO_PRO.md` | Modulo Lavadero Pro |
| `REFACTOR_PROGRESS.md` | Progreso refactor en curso |
| `nuevaInfraKaledacademy/` | Infra nueva en desarrollo para kaledacademy |

## Referencias

- Memoria central: `C:\memory\kaledsoft\MEMORY.md`
- Reglas globales: `C:\memory\GLOBAL.md` + `C:\memory\rules\`
- Notion config: `_NOTION-CONFIG.md`
- Prioridades: `_PRIORITIES.md`
- Legal Colombia 2026: `_LEGAL_COLOMBIA_2026.md`

## Diferencias clave vs Amaxoft (no confundir)

| Aspecto | Amaxoft | Kaledsoft |
|---|---|---|
| Multi-tenant | Database-per-tenant (N Neon DBs) | Single-DB con `tenantId` |
| Routing tenant | Subdomain `tenant/[slug]` | Header `x-tenant-slug` + subdomain dev |
| Next.js | 15 | 16.1.4 |
| Auth | NextAuth v5 | Cookies httpOnly + roles custom |
| Tracker | Jira `amaxoftcolombia.atlassian.net` | Solo Notion |
| Cliente | Ricardo (externo) | Luis (dueno) + clientes pagantes reales |
