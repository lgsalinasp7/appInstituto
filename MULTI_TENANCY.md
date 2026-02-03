# Multi-Tenancy - Guía Completa

> Sistema de multi-tenencia basado en subdominios para App Instituto
> **Última actualización:** 2026-01-30

---

## ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura de la Solución](#2-arquitectura-de-la-solución)
3. [Guía Rápida de Uso](#3-guía-rápida-de-uso)
4. [Configuración Inicial](#4-configuración-inicial)
5. [Dashboard de Super-Admin (Empresas)](#5-dashboard-de-super-admin-empresas)
6. [Crear y Gestionar Tenants](#6-crear-y-gestionar-tenants)
7. [Base de Datos](#7-base-de-datos)
8. [Middleware y Utilidades](#8-middleware-y-utilidades)
9. [Servicios Actualizados](#9-servicios-actualizados)
10. [Configuración en Vercel](#10-configuración-en-vercel)
11. [Desarrollo Local](#11-desarrollo-local)
12. [Seguridad](#12-seguridad)
13. [Troubleshooting](#13-troubleshooting)
14. [API Reference](#14-api-reference)
15. [Checklist de Implementación](#15-checklist-de-implementación)

---

## 1. RESUMEN EJECUTIVO

### ¿Qué es Multi-Tenancy?
Permite que múltiples instituciones educativas usen la misma aplicación, cada una con su propio subdominio:
- `edutec.kaledsoft.tech`
- `instituto-abc.kaledsoft.tech`
- `colegio-xyz.kaledsoft.tech`

### Arquitectura
**Base de datos compartida con aislamiento lógico por `tenantId`**
- Una sola base de datos PostgreSQL (Neon)
- Cada registro tiene un campo `tenantId`
- El subdominio determina qué tenant está activo
- Todas las queries se filtran automáticamente por tenant

### Beneficios
- ✅ Costo reducido (una sola BD)
- ✅ Mantenimiento simple (un solo deployment)
- ✅ Escalabilidad (fácil agregar tenants)
- ✅ Aislamiento de datos completo

---

## 2. ARQUITECTURA DE LA SOLUCIÓN

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                           │
│                   edutec.kaledsoft.tech                             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE                                 │
│              Wildcard Domain: *.kaledsoft.tech                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS MIDDLEWARE                              │
│  1. Extrae subdomain del hostname (edutec)                          │
│  2. Agrega header: x-tenant-slug = "edutec"                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API / SERVER COMPONENTS                      │
│  1. Lee header x-tenant-slug                                        │
│  2. Busca tenant en BD por slug                                     │
│  3. Usa tenantId en todas las queries                               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         POSTGRESQL (NEON)                           │
│  Tenant: { id: "abc123", slug: "edutec", name: "Instituto Edutec" } │
│  Todos los registros tienen: tenantId = "abc123"                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. GUÍA RÁPIDA DE USO

### 3.1 Acceder al Panel de Super-Admin

**Requisitos:**
- Usuario con rol `SUPERADMIN`
- Acceso desde el dominio principal (sin subdominio)

**Pasos:**

1. **Acceder al sistema:**
   ```
   # Desarrollo local
   http://localhost:3000/auth/login

   # Producción
   https://kaledsoft.tech/auth/login
   ```

2. **Iniciar sesión con usuario SUPERADMIN**

3. **Ir al panel de administración:**
   - Click en el menú de usuario → "Administración"
   - O navegar directamente a `/admin`

4. **Acceder a "Empresas":**
   - En el sidebar izquierdo, click en "🏢 Empresas"
   - URL: `/admin/empresas`

### 3.2 Usuario SUPERADMIN

El usuario SUPERADMIN ya está creado con las siguientes credenciales:

```
════════════════════════════════════════
  CREDENCIALES DE ACCESO SUPERADMIN
════════════════════════════════════════
  Email:    superadmin@kaledsoft.tech
  Password: Admin123!
════════════════════════════════════════
```

**URLs de acceso:**
- **Local:** http://localhost:3000/auth/login
- **Producción:** https://kaledsoft.tech/auth/login
- **Panel Empresas:** /admin/empresas

> ⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login

**Si necesitas recrear el usuario SUPERADMIN:**

```bash
npx tsx prisma/create-superadmin.ts
```

El script está en `prisma/create-superadmin.ts` y:
1. Crea un tenant "Sistema" global
2. Crea el rol SUPERADMIN con todos los permisos
3. Crea el usuario superadmin conectado al tenant sistema

### 3.3 Flujo Completo: Crear y Usar un Tenant

```
PASO 1: Login como SUPERADMIN
         ↓
PASO 2: Ir a /admin/empresas
         ↓
PASO 3: Click "Nuevo Tenant"
         ↓
PASO 4: Completar formulario:
        - Nombre: "Instituto Edutec"
        - Slug: "edutec" (auto-generado)
        - Email: "admin@edutec.com"
        - Password: "TempPass123"
        - Plan: "BASICO"
         ↓
PASO 5: Click "Crear Tenant"
         ↓
PASO 6: El tenant está listo en:
        - Local: http://edutec.localhost:3000
        - Prod:  https://edutec.kaledsoft.tech
         ↓
PASO 7: El admin del tenant puede loguearse con:
        - Email: admin@edutec.com
        - Password: TempPass123
```

---

## 4. CONFIGURACIÓN INICIAL

### 4.1 Variables de Entorno

```env
# .env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_ROOT_DOMAIN="kaledsoft.tech"
```

### 4.2 Migración de Base de Datos

```bash
# Aplicar cambios del schema
npx prisma db push

# O crear migración formal
npx prisma migrate dev --name add-multi-tenancy
```

### 4.3 Migrar Datos Existentes a un Tenant Default

Si ya tienes datos en la BD sin `tenantId`:

```bash
npx tsx prisma/migrate-to-tenants.ts
```

Este script:
1. Crea un tenant "Default" con slug `default`
2. Asigna todos los registros huérfanos al tenant default

---

## 5. DASHBOARD DE SUPER-ADMIN (EMPRESAS)

### 5.1 Vista de Lista (`/admin/empresas`)

**URL:** `http://localhost:3000/admin/empresas`

**Características:**

| Elemento | Descripción |
|----------|-------------|
| **Stats Cards** | Total, Activas, Pendientes, Suspendidas, Canceladas |
| **Buscador** | Busca por nombre, slug o email |
| **Filtro Estado** | ACTIVO, PENDIENTE, SUSPENDIDO, CANCELADO |
| **Grid de Cards** | Muestra cada tenant con info resumida |
| **Paginación** | 12 tenants por página |
| **Botón Crear** | Abre modal para nuevo tenant |

**Cada Card muestra:**
- Nombre del tenant
- URL del subdominio
- Badge de estado (color según estado)
- Plan contratado
- Email del admin
- Contador de usuarios y estudiantes
- Botones: Suspender/Activar, Ver detalle

### 5.2 Vista de Detalle (`/admin/empresas/[id]`)

**URL:** `http://localhost:3000/admin/empresas/{tenant-id}`

**Secciones:**

#### Header
- Nombre con badge de estado
- URL completa
- Botones: Suspender/Activar, Editar

#### Quick Stats (3 cards)
- Estado actual
- Plan contratado
- Usuarios (usado/límite)

#### Información General
| Campo | Ejemplo |
|-------|---------|
| Nombre | Instituto Edutec |
| Slug | edutec |
| Email | admin@edutec.com |
| Plan | BASICO |
| Fecha creación | 30 de enero de 2026 |

#### Información Técnica
| Campo | Ejemplo |
|-------|---------|
| ID | clxx1234... (copiable) |
| Dominio personalizado | No configurado |
| Estudiantes | 45 |
| Pagos | 128 |

#### Credenciales de Acceso
| Campo | Valor | Acciones |
|-------|-------|----------|
| URL | https://edutec.kaledsoft.tech | Copiar, Abrir |
| Usuario Principal | admin@edutec.com | Copiar |
| Password Temporal | •••••••• | Ver, Resetear |

#### Tabs
- **Usuarios:** Tabla con todos los usuarios del tenant
- **Órdenes:** Historial de suscripciones (futuro)
- **Logs:** Registro de actividad (futuro)
- **Configuración:** Límites del plan, acciones avanzadas

---

## 6. CREAR Y GESTIONAR TENANTS

### 6.1 Crear Tenant desde UI

1. Ir a `/admin/empresas`
2. Click **"+ Nuevo Tenant"**
3. Completar formulario:

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| Nombre | ✅ | Nombre de la institución |
| Slug | ✅ | Subdominio (auto-generado desde nombre) |
| Email | ✅ | Email del administrador |
| Nombre Admin | ❌ | Nombre del usuario admin |
| Password | ❌ | Contraseña temporal |
| Plan | ✅ | BASICO, PROFESIONAL, EMPRESARIAL |

4. Click **"Crear Tenant"**

**Lo que sucede:**
- Se crea registro en tabla `Tenant`
- Se crea rol "Administrador" para el tenant
- Si hay password, se crea usuario admin
- El tenant queda activo inmediatamente

### 6.2 Crear Tenant por Línea de Comandos

```bash
npx tsx prisma/create-tenant.ts "Nombre Institución" "slug"

# Ejemplo:
npx tsx prisma/create-tenant.ts "Colegio San José" "sanjose"
```

**Output:**
```
Creating tenant: Colegio San José (sanjose)...
Tenant created successfully!
ID: clxx1234567890abcdef
URL: http://sanjose.localhost:3000 (Local)
URL: https://sanjose.kaledsoft.tech (Production)
```

### 6.3 Suspender Tenant

**Desde UI:**
1. Ir a `/admin/empresas`
2. En la card del tenant, click **"Suspender"**
3. Confirmar acción

**Desde detalle:**
1. Ir a `/admin/empresas/[id]`
2. Click botón **"Suspender"** en header
3. Confirmar acción

**Efecto:** Los usuarios del tenant no podrán acceder al sistema.

### 6.4 Activar Tenant

Mismo proceso que suspender, pero el botón dice **"Activar"**.

### 6.5 Resetear Contraseña del Admin

1. Ir a `/admin/empresas/[id]`
2. En sección "Credenciales de Acceso"
3. Click icono 🔄 junto a "Password Temporal"
4. Se genera nueva contraseña y se muestra
5. Copiar y enviar al admin del tenant

### 6.6 Estados de un Tenant

| Estado | Badge | Descripción |
|--------|-------|-------------|
| `ACTIVO` | 🟢 Verde | Funcionando normalmente |
| `PENDIENTE` | 🟡 Amarillo | Esperando activación |
| `SUSPENDIDO` | 🔴 Rojo | Acceso bloqueado temporalmente |
| `CANCELADO` | ⚫ Gris | Dado de baja (soft delete) |

---

## 7. BASE DE DATOS

### 7.1 Modelo Tenant

```prisma
model Tenant {
  id        String   @id @default(cuid())
  name      String                         // "Instituto Edutec"
  slug      String   @unique               // "edutec"
  domain    String?  @unique               // Dominio personalizado
  status    String   @default("ACTIVO")    // ACTIVO, PENDIENTE, SUSPENDIDO, CANCELADO
  plan      String   @default("BASICO")    // BASICO, PROFESIONAL, EMPRESARIAL
  email     String?                        // Email de contacto
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  users       User[]
  students    Student[]
  programs    Program[]
  payments    Payment[]
  prospects   Prospect[]
  roles       Role[]
  invitations Invitation[]
  commitments PaymentCommitment[]
  configs     SystemConfig[]

  @@index([slug])
}
```

### 7.2 Modelos con tenantId

| Modelo | Relación |
|--------|----------|
| `User` | `tenantId: String?` → `tenant Tenant?` |
| `Role` | `tenantId: String?` → `tenant Tenant?` |
| `Program` | `tenantId: String` → `tenant Tenant` |
| `Student` | `tenantId: String` → `tenant Tenant` |
| `Payment` | `tenantId: String` → `tenant Tenant` |
| `Prospect` | `tenantId: String` → `tenant Tenant` |
| `Invitation` | `tenantId: String` → `tenant Tenant` |
| `PaymentCommitment` | `tenantId: String` → `tenant Tenant` |
| `SystemConfig` | `tenantId: String` + `@@unique([key, tenantId])` |

### 7.3 Modelos sin tenantId (heredan del padre)

| Modelo | Razón |
|--------|-------|
| `Session` | Vinculado a User |
| `Profile` | Vinculado a User |
| `AuditLog` | Registro global |
| `AcademicContent` | Vinculado a Program |
| `ContentDelivery` | Vinculado a Student |
| `Receipt` | Vinculado a Payment |

---

## 8. MIDDLEWARE Y UTILIDADES

### 8.1 Middleware (`src/middleware.ts`)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const hostname = req.headers.get('host') || '';
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'kaledsoft.tech';
    const isDevelopment = process.env.NODE_ENV === 'development';

    let subdomain = '';

    // Desarrollo: edutec.localhost:3000
    if (isDevelopment) {
        if (hostname.includes('.localhost:')) {
            subdomain = hostname.split('.localhost:')[0];
        }
    }
    // Producción: edutec.kaledsoft.tech
    else {
        if (hostname.endsWith(`.${rootDomain}`)) {
            subdomain = hostname.replace(`.${rootDomain}`, '');
        }
    }

    // Agregar header si hay subdominio válido
    if (subdomain && subdomain !== 'www') {
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-tenant-slug', subdomain);

        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    }

    return NextResponse.next();
}
```

### 8.2 Utilidades de Tenant (`src/lib/tenant.ts`)

```typescript
import { headers } from 'next/headers';
import { prisma } from './prisma';

// Obtener slug del header
export async function getTenantSlug(): Promise<string | null> {
    const headerList = await headers();
    return headerList.get('x-tenant-slug');
}

// Obtener tenant completo
export async function getCurrentTenant() {
    const slug = await getTenantSlug();
    if (!slug) return null;
    return prisma.tenant.findUnique({ where: { slug } });
}

// Obtener solo el ID (más eficiente)
export async function getCurrentTenantId(): Promise<string | null> {
    const tenant = await getCurrentTenant();
    return tenant?.id || null;
}
```

### 8.3 Uso en Servicios

```typescript
import { getCurrentTenantId } from '@/lib/tenant';

// En cualquier query:
const tenantId = await getCurrentTenantId();

const payments = await prisma.payment.findMany({
    where: {
        tenantId,  // ← Filtro automático
        status: 'COMPLETADO'
    }
});
```

---

## 9. SERVICIOS ACTUALIZADOS

Todos estos servicios ya incluyen filtro por `tenantId`:

| Servicio | Archivo | Estado |
|----------|---------|--------|
| `PaymentService` | `src/modules/payments/services/payment.service.ts` | ✅ |
| `StudentService` | `src/modules/students/services/student.service.ts` | ✅ |
| `ProgramService` | `src/modules/programs/services/program.service.ts` | ✅ |
| `ProspectService` | `src/modules/prospects/services/prospect.service.ts` | ✅ |
| `UserService` | `src/modules/users/services/users.service.ts` | ✅ |
| `CommitmentService` | `src/modules/commitments/services/commitment.service.ts` | ✅ |
| `CarteraService` | `src/modules/cartera/services/cartera.service.ts` | ✅ |
| `ReportsService` | `src/modules/reports/services/reports.service.ts` | ✅ |
| `DashboardService` | `src/modules/dashboard/services/dashboard.service.ts` | ✅ |
| `AdminService` | `src/modules/admin/services/admin.service.ts` | ✅ |
| `AuthService` | `src/modules/auth/services/auth.service.ts` | ✅ |
| `ContentService` | `src/modules/content/services/content.service.ts` | ✅ |
| `TenantsService` | `src/modules/tenants/services/tenants.service.ts` | ✅ |

---

## 10. CONFIGURACIÓN EN VERCEL

### 10.1 Agregar Dominio Wildcard

1. Ir a **Vercel Dashboard** → **Project** → **Settings** → **Domains**
2. Agregar:
   - `kaledsoft.tech` (dominio principal)
   - `*.kaledsoft.tech` (wildcard para subdominios)

### 10.2 Configurar DNS

En tu proveedor de dominio:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `*` | `cname.vercel-dns.com` |

### 10.3 Variables de Entorno en Vercel

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_ROOT_DOMAIN` | `kaledsoft.tech` |
| `DATABASE_URL` | `postgresql://...` |

---

## 11. DESARROLLO LOCAL

### 11.1 Usar Subdominios Locales

Los navegadores modernos resuelven `*.localhost` automáticamente:

```
http://edutec.localhost:3000
http://sanjose.localhost:3000
http://test.localhost:3000
```

### 11.2 Crear Tenant de Prueba

```bash
# Crear tenant
npx tsx prisma/create-tenant.ts "Instituto Test" "test"

# Acceder
http://test.localhost:3000
```

### 11.3 Verificar Aislamiento

1. Crear dos tenants: `tenant-a` y `tenant-b`
2. Crear un estudiante en `tenant-a.localhost:3000`
3. Ir a `tenant-b.localhost:3000`
4. Verificar que NO aparece el estudiante

---

## 12. SEGURIDAD

### 12.1 Validación en Operaciones Críticas

```typescript
// ❌ MAL: Solo busca por ID
const payment = await prisma.payment.findUnique({ where: { id } });

// ✅ BIEN: Valida propiedad del tenant
const payment = await prisma.payment.findFirst({
    where: {
        id,
        tenantId: await getCurrentTenantId()
    }
});
```

### 12.2 Prevenir Acceso Cruzado

```typescript
const student = await prisma.student.findFirst({
    where: {
        id: requestBody.studentId,
        tenantId  // ← Siempre incluir
    }
});

if (!student) {
    return NextResponse.json(
        { error: 'Student not found' },  // No revelar si existe en otro tenant
        { status: 404 }
    );
}
```

### 12.3 Roles y Permisos

- `SUPERADMIN`: Acceso global, puede ver "Empresas"
- `ADMINISTRADOR`: Acceso solo a su tenant
- Otros roles: Según permisos configurados

---

## 13. TROUBLESHOOTING

### "Tenant not found"
- ✅ Verificar que el slug existe en tabla `Tenant`
- ✅ Verificar header `x-tenant-slug`
- ✅ Crear tenant con script o UI

### Datos de otro tenant aparecen
- ✅ Verificar que TODAS las queries tienen `tenantId`
- ✅ Buscar servicios no actualizados

### Subdominio no funciona en local
- ✅ Usar `nombre.localhost:3000` (no solo `localhost:3000`)
- ✅ Verificar que middleware está corriendo

### Usuario no puede loguearse
- ✅ Verificar que usuario tiene `tenantId` correcto
- ✅ El email puede existir en otro tenant

### No veo "Empresas" en el sidebar
- ✅ Verificar que tu rol es `SUPERADMIN`
- ✅ El rol debe llamarse exactamente "SUPERADMIN"

### Error "getCurrentTenantId returned null"
- ✅ Usar subdominio, no dominio principal
- ✅ El subdominio debe existir en BD

---

## 14. API REFERENCE

### 14.1 Tenants API

#### Listar Tenants
```http
GET /api/admin/tenants?search=edu&status=ACTIVO&page=1&limit=10
```

#### Crear Tenant
```http
POST /api/admin/tenants
Content-Type: application/json

{
  "name": "Instituto Edutec",
  "slug": "edutec",
  "email": "admin@edutec.com",
  "plan": "BASICO",
  "adminName": "Admin",
  "adminPassword": "TempPass123"
}
```

#### Obtener Tenant
```http
GET /api/admin/tenants/{id}
```

#### Actualizar Tenant
```http
PUT /api/admin/tenants/{id}
Content-Type: application/json

{
  "name": "Nuevo Nombre",
  "plan": "PROFESIONAL"
}
```

#### Suspender Tenant
```http
POST /api/admin/tenants/{id}/suspend
```

#### Activar Tenant
```http
POST /api/admin/tenants/{id}/activate
```

#### Resetear Password
```http
POST /api/admin/tenants/{id}/reset-password
Content-Type: application/json

{
  "password": "NuevaPass123"  // Opcional, se genera automático
}
```

#### Estadísticas
```http
GET /api/admin/tenants/stats

Response:
{
  "total": 10,
  "activos": 8,
  "pendientes": 1,
  "suspendidos": 1,
  "cancelados": 0
}
```

---

## 15. CHECKLIST DE IMPLEMENTACIÓN

### Base de Datos
- [x] Modelo `Tenant` creado
- [x] Campo `tenantId` en modelos principales
- [x] Índices para performance
- [x] Script de migración

### Middleware
- [x] Detección de subdominio
- [x] Header `x-tenant-slug`
- [x] Soporte desarrollo y producción

### Utilidades
- [x] `getTenantSlug()`
- [x] `getCurrentTenant()`
- [x] `getCurrentTenantId()`

### Servicios (12/12)
- [x] PaymentService
- [x] StudentService
- [x] ProgramService
- [x] ProspectService
- [x] UserService
- [x] CommitmentService
- [x] CarteraService
- [x] ReportsService
- [x] DashboardService
- [x] AdminService
- [x] AuthService
- [x] ContentService

### Super-Admin Dashboard
- [x] Módulo `src/modules/tenants`
- [x] TenantsService con CRUD
- [x] API Routes completas
- [x] Vista de lista
- [x] Vista de detalle
- [x] Crear tenant desde UI
- [x] Suspender/Activar
- [x] Resetear password
- [x] Sidebar con "Empresas"
- [x] Filtro por rol SUPERADMIN

### Scripts
- [x] `create-tenant.ts`
- [x] `migrate-to-tenants.ts`
- [x] `create-superadmin.ts` ✅

### Vercel
- [ ] Dominio wildcard configurado
- [ ] DNS CNAME configurado
- [ ] Variables de entorno

### Testing
- [ ] Prueba de aislamiento
- [ ] Prueba de creación de datos
- [ ] Prueba de subdominios locales

---

## RESUMEN DE ARCHIVOS

### Módulo de Tenants
```
src/modules/tenants/
├── index.ts
├── types/
│   └── index.ts
├── services/
│   └── tenants.service.ts
└── components/
    ├── index.ts
    ├── TenantsListView.tsx
    └── TenantDetailView.tsx
```

### API Routes
```
src/app/api/admin/tenants/
├── route.ts                    # GET, POST
├── stats/route.ts              # GET stats
└── [id]/
    ├── route.ts                # GET, PUT, DELETE
    ├── activate/route.ts       # POST
    ├── suspend/route.ts        # POST
    └── reset-password/route.ts # POST
```

### Páginas
```
src/app/admin/empresas/
├── page.tsx                    # Lista
└── [id]/
    └── page.tsx                # Detalle
```

### Core
```
src/
├── middleware.ts               # Detección de subdominio
└── lib/
    └── tenant.ts               # Utilidades de tenant
```

---

*Documentación generada: 2026-01-30*
