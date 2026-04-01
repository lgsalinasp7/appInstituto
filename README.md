# App Instituto (KaledSoft)

Plataforma **multi-tenant** de gestión institucional y productos verticales. Incluye **KaledAcademy** (LMS con cohortes, lecciones, quizzes, entregables y tutoría IA), **módulo académico administrativo**, **recaudos y matrículas**, **finanzas ejecutivas**, **CRM y embudos** (leads, secuencias de correo, masterclass), **agentes comerciales**, **Lavadero Pro** y APIs de integración (cron, WhatsApp, Resend, Telegram). Construida con **Next.js 16** (App Router), **Prisma** y **PostgreSQL** (Neon).

## Capacidades principales

| Área | Descripción |
|------|-------------|
| **Multi-tenancy** | Aislamiento por `Tenant` (usuarios, roles, datos de negocio, branding, zona horaria). Panel plataforma para empresas (`/admin/empresas`). |
| **KaledAcademy** | Cursos, módulos, lecciones (vídeo y **animaciones interactivas**), quizzes, CRAL, progreso, calendario, leaderboard, badges, Demo Day, proyectos SaaS, notificaciones in-app. |
| **Cohortes** | Gestión de cohortes, profesores por email, merge y traslado de matrículas, **liberación / gating de lecciones**, auditoría de acciones admin, página de estudiantes por cohorte. |
| **Invitaciones** | Invitación de usuarios por rol, aceptación por token, límites por usuario; flujos de prueba/trial y administración por tenant (APIs bajo `/api/invitations`, `/api/academy/cohorts/for-invitation`, admin). |
| **Instructor / estudiante** | Vistas separadas: cursos, tareas, evaluaciones, aprobación de evaluaciones, mensajes (docente), perfil. |
| **IA (Kaled)** | Endpoints de chat/revisión de código/evaluación de entregables; proveedores configurables (Groq, Google, OpenRouter, etc.). |
| **Recaudos y cartera** | Pagos, compromisos, reportes y exportaciones. |
| **Admin plataforma** | Usuarios, roles, auditoría, branding, suscripciones, métricas, finanzas SaaS, costos por cohorte, plantillas de correo con preview sanitizado, campañas y leads Kaled. |
| **Lavadero Pro** | Clientes, vehículos, servicios, órdenes, pagos y dashboard (admin / supervisor). |
| **Marketing** | Landings dinámicas (`/lp`), blog, páginas institucionales, funnel masterclass. |
| **Operación** | Crons (Neon keep-alive, tareas diarias Kaled, notificaciones, suscripciones, procesamiento de correos), workflows de deploy y backup. |

## Tecnologías

- **Next.js 16** · **React 19** · **TypeScript**
- **Tailwind CSS 4** · **shadcn/ui** / Radix · **Framer Motion**
- **Prisma 6** · **PostgreSQL** (Neon, `@neondatabase/serverless`)
- **Zod 4** · **React Hook Form**
- **Vercel** (Analytics, Speed Insights, Blob), **Resend** (correo)
- **Vercel AI SDK** (`ai`, `@ai-sdk/*`, OpenRouter)
- **Vitest** + Testing Library · **MSW** (tests)
- **ExcelJS**, **CSV**, **@react-pdf/renderer**, **Recharts**
- **Dnd Kit** (ordenación en UI)
- Integraciones opcionales: **WhatsApp** (Graph API), **Telegram** (bot), **flags** (feature flags)

## Estructura del proyecto

```
src/
├── app/
│   ├── (protected)/          # Rutas con sesión: dashboard, academia, lavadero, matrículas, recaudos, reportes, pipeline, configuración
│   ├── (marketing)/          # Sitio público, blog, legales
│   ├── (funnel)/             # Masterclass y thank-you
│   ├── admin/                # Consola plataforma (empresas, finanzas, leads, agentes, email-templates, etc.)
│   ├── auth/                 # Login, registro, invitación, reset / cambio de contraseña
│   ├── api/                  # Route Handlers REST (academia, admin, cron, pagos, lavadero, webhooks, …)
│   ├── lp/                   # Landing pages por slug
│   └── api-docs/             # Documentación API embebida (Swagger UI)
├── components/               # UI compartida (layout, ui)
├── lib/                      # Prisma, auth, email, constantes, utilidades tenant/URL
├── modules/                  # Dominios de negocio (ver tabla abajo)
└── …

prisma/
├── schema.prisma
├── migrations/               # Historial Prisma Migrate
└── *.ts                      # Seeds y scripts de datos (KaledAcademy, EDUTEC, tenant KaledSoft, …)

docs/                         # Guías operativas, arquitectura, fixes de deploy y academia
.github/workflows/            # Deploy dev/prod, crons, backup a Google Drive
```

### Módulos en `src/modules/`

Incluyen (entre otros): `auth`, `users`, `admin`, `dashboard`, `students`, `payments`, `programs`, `reports`, `cartera`, `receipts`, `commitments`, `content`, `tenants`, `products`, `finance`, **`academia`**, **`lavadero`**, **`masterclass`**, **`kaled-crm`**, **`agents`**, **`chat`**.

Cada módulo suele agrupar `components/`, `services/`, `schemas/`, `types/` y exportar desde `index.ts`.

## Arquitectura modular

- La lógica de negocio y acceso a datos vive en **services**; la validación en **schemas** (Zod); los tipos en **types**.
- Imports recomendados desde el barrel del módulo, por ejemplo:

```typescript
import { LoginForm, AuthService, loginSchema } from "@/modules/auth";
```

## Configuración

### Variables de entorno (mínimas)

Crea `.env` (o configura en Vercel) con al menos:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
AUTH_SECRET="..."   # openssl rand -base64 32
```

### Variables frecuentes adicionales

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_ROOT_DOMAIN` | Dominio raíz multi-tenant (default `kaledsoft.tech`) |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME` | Envío de correo |
| `RESEND_WEBHOOK_SECRET` | Webhook de eventos Resend |
| `CRON_SECRET` | Autenticación de rutas `/api/cron/*` |
| `WHATSAPP_*` | Integración WhatsApp (opcional) |
| `TELEGRAM_BOT_TOKEN` | Bot Telegram (opcional) |
| `GROQ_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENROUTER_API_KEY` | Proveedores IA |
| `TRIAL_ADVISOR_EMAIL` | Notificaciones de actividad trial |
| `FLAGS_SECRET` | Feature flags (opcional) |

### Base de datos

```bash
npm run db:generate    # Cliente Prisma
npm run db:migrate     # Migraciones en desarrollo (prisma migrate dev)
npm run db:push        # Sincronizar esquema sin migración (solo dev/prototipos)
npm run db:studio      # Prisma Studio
```

En Vercel el build usa `build:vercel`, que ejecuta `prisma generate`, `prisma/ensure-kaled-tables.ts` y `next build`. Localmente `npm run build` ejecuta tests y generación Prisma con reintentos en Windows (`scripts/prisma-generate-retry.mjs`).

### Seeds y datos

Scripts útiles (ver `package.json`): `db:seed-academy-stack`, `db:seed-kaledacademy`, `db:seed-kaledacademy-v2`, `db:seed-kaledacademy-v3`, `db:create-kaledsoft-tenant`, `db:seed-edutec-incremental`, `db:create-edutec-users`, `db:validate-edutec-users`, `db:seed-migration`. Documentación detallada en `docs/SEEDS-GUIA.md`.

### Desarrollo

```bash
npm install
npm run dev
```

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Tests + Prisma generate (retry) + build producción |
| `npm run build:vercel` | Pipeline usado en Vercel (generate + ensure tables + build) |
| `npm run start` | Servidor producción |
| `npm run lint` | ESLint |
| `npm run test` / `test:run` / `test:coverage` | Vitest |
| `db:generate`, `db:push`, `db:studio`, `db:migrate` | Prisma |
| `db:seed-*`, `db:create-*`, `db:validate-*` | Seeds y utilidades de datos |

## CI/CD y operaciones

- **Deploy**: `.github/workflows/deploy-dev.yml` y `deploy-prod.yml` (Vercel, migraciones con reintentos ante suspensión Neon / P1001).
- **Crons GitHub**: keep-alive DB, tareas Kaled, notificaciones, suscripciones, correos Kaled (ver workflows en `.github/workflows/`).
- **Backup**: `backup-gdrive.yml` (PostgreSQL 17 client → Google Drive).
- **App crons**: rutas bajo `/api/cron/*` protegidas con `CRON_SECRET`.

Referencia: `docs/VERCEL_DEPLOY_HOOK_DEV.md`, `docs/VERCEL_BUILD_KALED_TABLES.md`, `docs/SETUP_CRON_BACKUP.md`, `docs/NEON_SCHEMA_VALIDATION.md`.

## Documentación en el repositorio

En `docs/` hay guías de **multi-tenancy**, invitaciones, academia (lecciones interactivas, calendario, SaaS), **Lavadero Pro**, CRM, agentes IA, testing, seguridad, fixes de **P2021/P1001** y validación de esquema en Neon. Material docente Git en `docs/academia/` (lecciones 4–6, control de versiones, ramas y PR, Git con IA).

## Evolución reciente (resumen de cambios)

Linea de tiempo basada en el historial de Git del repositorio; agrupa lo ya integrado en `develop`:

- **Prisma y build**: migraciones baseline, `prisma generate` con reintentos en Windows, carga consistente de `DATABASE_URL` en seeds y deploy, script `ensure-kaled-tables` en build Vercel.
- **Academia**: gestión de módulos/cursos, cohortes (merge, movimiento de matrículas, analytics, ranking), asignación de profesores por email, **gating de lecciones** y gestión de acceso, auditoría admin de cohortes, página de estudiantes por cohorte, animaciones interactivas (lecciones 1–3) y modelo `AcademyInteractiveAnimation`.
- **Invitaciones y usuarios**: permisos por rol en actualización de usuarios e invitaciones, eliminación de usuarios huérfanos al gestionar invitaciones, transacciones en borrado de invitaciones, APIs de cohortes **para invitación** (academia y admin tenant).
- **Admin plataforma**: layouts con topbar/sidebar, preview de plantillas de correo con sanitización, mejoras en gestión de empresas y cursos (vista admin).
- **CI/CD y datos**: workflows de deploy dev/prod, backup programado a Google Drive, seeds incrementales y validación para tenant EDUTEC, documentación de errores comunes (invitaciones trial 500, `DATABASE_URL`, cron P2021).
- **Proyecto y docs**: guías docente Git (control de versiones, ramas/PR, Git con IA), componentes de lección interactiva, documentación de setup.

Para el detalle commit a commit: `git log --oneline`.

## Agregar nuevos módulos

1. Crear `src/modules/[nombre]/` con `components/`, `services/`, `types/`, `schemas/` según necesidad.
2. Exportar desde `index.ts`.
3. Añadir rutas en `src/app/` (páginas y, si aplica, `api/`).

## Licencia

MIT
