# PLAN_NUEVO_IMPLEMENTACION.md

> Análisis comparativo del estado actual vs plan original y nuevo roadmap de implementación

---

## RESUMEN EJECUTIVO

Tras analizar exhaustivamente el código actual y compararlo con el plan de finalización original, se han identificado avances significativos en algunas áreas y brechas críticas en otras. Este documento presenta el estado real del sistema y un plan actualizado de implementación.

---

## PARTE 1: ANÁLISIS COMPARATIVO

### 1. SISTEMA DE AUTENTICACIÓN

| Componente | Plan Original | Estado Real | Diferencia |
|------------|---------------|-------------|------------|
| UI de login | ✅ Implementado | ✅ Implementado | Sin cambios |
| Zustand store | ✅ Implementado | ✅ Implementado | Sin cambios |
| Registro de usuarios | ❌ Placeholder | ❌ Solo UI, sin backend | Confirmado |
| Passwords hasheados | ❌ Sin hashear | 🔴 **CRÍTICO: Texto plano + backdoor "123456"** | Peor de lo esperado |
| Recuperación de contraseña | ❌ No existe | ❌ Schemas Zod definidos pero sin implementación | Confirmado |
| Verificación de email | ❌ No existe | ❌ No existe | Confirmado |
| **Protección de rutas** | No mencionado | 🔴 **NO HAY MIDDLEWARE - Rutas accesibles sin auth** | Descubrimiento crítico |
| **Duplicidad de estado** | No mencionado | ⚠️ Zustand + Context compiten | Descubrimiento nuevo |

**Hallazgos adicionales:**
- Existe una puerta trasera hardcodeada: cualquier password "123456" es válido
- Las rutas en `(protected)` son accesibles directamente sin login
- Hay duplicidad entre Zustand store y React Context

---

### 2. SISTEMA DE INVITACIONES

| Componente | Plan Original | Estado Real | Diferencia |
|------------|---------------|-------------|------------|
| UI modal de invitación | ✅ Creada | ✅ Completa con validación | Sin cambios |
| Validación de formulario | ✅ Implementado | ✅ Implementado | Sin cambios |
| Control de límites | ✅ Implementado | ✅ Implementado en UI | Sin cambios |
| API /api/invitations | ❌ No conectado | ❌ **NO EXISTE** | Confirmado |
| Envío de emails | ❌ No implementado | ❌ Sin servicio de email | Confirmado |
| Tokens de invitación | ❌ No implementado | ❌ Modelo en BD pero sin lógica | Confirmado |
| Página de aceptación | ❌ No existe | ❌ No existe `/auth/invitation/[token]` | Confirmado |

**Hallazgos adicionales:**
- El modelo `Invitation` en Prisma está completo y bien diseñado
- Los componentes UI usan datos MOCK hardcodeados
- No hay ninguna librería de email instalada (ni Resend, ni SendGrid, ni Nodemailer)

---

### 3. GESTIÓN DE USUARIOS

| Componente | Plan Original | Estado Real | Diferencia |
|------------|---------------|-------------|------------|
| UI tabla usuarios | ✅ Completa | ✅ Completa pero con MOCK data | Confirmado |
| UI edición | ✅ Implementado | ⚠️ Solo UI, no persiste | Confirmado |
| UI eliminación | ✅ Implementado | ⚠️ Solo UI, no persiste | Confirmado |
| Permisos por rol | ✅ En UI | ⚠️ Constantes definidas pero no aplicadas | Confirmado |
| API GET /users | No mencionado | ✅ **IMPLEMENTADO** | Mejor de lo esperado |
| API PUT /users/[id] | ❌ No existe | ❌ Servicio existe, endpoint NO | Confirmado |
| API DELETE /users/[id] | ❌ No existe | ❌ Servicio existe, endpoint NO | Confirmado |
| Límites de invitación | ❌ No funciona | ⚠️ Solo validación frontend | Confirmado |

**Hallazgos adicionales:**
- El sistema de permisos `PERMISSIONS` está bien definido pero nunca se valida en endpoints
- Existe `UsersService` con métodos `updateUser()` y `deleteUser()` listos para exponer

---

### 4. SISTEMA DE PAGOS Y RECAUDOS

| Componente | Plan Original | Estado Real | Diferencia |
|------------|---------------|-------------|------------|
| UI registro de pagos | ✅ Completa | ✅ Completa y funcional | Sin cambios |
| API /api/payments | ✅ Existe | ✅ **COMPLETA** (GET, POST, stats, today) | Mejor de lo esperado |
| Validación matrícula vs módulos | ⚠️ Falta | ✅ **IMPLEMENTADO CORRECTAMENTE** | Mejor de lo esperado |
| Generación de recibos | ⚠️ No automático | ⚠️ Número de recibo sí, **PDF NO** | Parcial |
| Envío WhatsApp | ❌ No implementado | ✅ **FUNCIONAL** (genera URL) | Mejor de lo esperado |
| Envío Email | ❌ No implementado | ❌ Retorna 501 Not Implemented | Confirmado |
| Estado estudiante | ⚠️ Falta | ✅ **IMPLEMENTADO** (matriculaPaid, currentModule, status) | Mejor de lo esperado |

**Hallazgos positivos:**
- Toda la lógica de negocio de pagos está implementada correctamente
- Validación de montos exactos con tolerancia de ±100 pesos
- Creación automática de compromisos siguientes
- Cálculo correcto de saldos y progreso
- WhatsApp funciona generando URLs con mensaje formateado

**Lo que falta:**
- Generación de PDF de recibos
- Descarga de recibos como archivo
- Envío por email

---

### 5. COMPROMISOS DE PAGO Y NOTIFICACIONES

| Componente | Plan Original | Estado Real | Diferencia |
|------------|---------------|-------------|------------|
| API /api/commitments | ✅ Existe | ✅ **COMPLETO** (GET, POST, paid, reschedule) | Confirmado |
| CRUD funcional | ✅ Funciona | ✅ Funciona | Sin cambios |
| Notificaciones automáticas | ❌ No existe | ❌ **Campo existe pero no se usa** | Confirmado |
| WhatsApp para recordatorios | ❌ No existe | ❌ Solo para recibos, no compromisos | Confirmado |
| Cron jobs | ❌ No existe | ❌ **NO HAY SCHEDULED TASKS** | Confirmado |
| Campo notificationsSent | No mencionado | ✅ Existe en modelo pero nunca se actualiza | Descubrimiento |

**Hallazgos:**
- API de cartera con alertas (`/api/cartera/alerts`) está implementada
- Servicio calcula compromisos próximos y vencidos
- Falta completamente la automatización de envío

---

### 6. REPORTES Y DASHBOARD

| Componente | Plan Original | Estado Real | Diferencia |
|------------|---------------|-------------|------------|
| Dashboard estadísticas | ✅ Funciona | ✅ **COMPLETO** y conectado a API | Sin cambios |
| API /api/reports/dashboard | ✅ Funcional | ✅ Funcional | Sin cambios |
| Gráficos de ingresos | ✅ Funciona | ✅ Funciona con recharts | Sin cambios |
| Datos demo | ⚠️ Algunos | ⚠️ Fallback a mock data | Confirmado |
| Cartera vencida detallado | ❌ Falta | ✅ **IMPLEMENTADO** `/api/reports/portfolio-aging` | Mejor de lo esperado |
| Exportar PDF/Excel | ❌ Falta | ❌ **Botón existe pero sin funcionalidad** | Confirmado |
| Filtros avanzados | ❌ Falta | ⚠️ Parcial (por fecha, no por programa/asesor en dashboard) | Parcial |

**Hallazgos positivos:**
- Reportes financieros, por asesor, por programa completamente implementados
- Cartera por edades (aging) implementada con brackets 0-30, 31-60, 61-90, 90+ días

---

### 7. CONTENIDO ACADÉMICO

| Componente | Plan Original | Estado Real | Diferencia |
|------------|---------------|-------------|------------|
| Modelos en BD | ✅ Existen | ✅ Completos (AcademicContent, ContentDelivery) | Sin cambios |
| UI para gestionar | ❌ No existe | ❌ **NO HAY COMPONENTES UI** | Confirmado |
| API /api/content | ❌ No existe | ✅ **COMPLETAMENTE IMPLEMENTADO** | Mucho mejor de lo esperado |
| Registro de entregas | ❌ No existe | ✅ **API implementada** | Mucho mejor de lo esperado |
| Lógica de disponibilidad | No mencionado | ✅ Calcula automáticamente según pagos | Descubrimiento positivo |

**Hallazgos:**
- El backend está 100% listo (5 endpoints funcionales)
- Solo falta crear la interfaz de usuario para gestionar contenidos

---

### 8. GESTIÓN DE PROSPECTOS

| Componente | Plan Original | Estado Real | Diferencia |
|------------|---------------|-------------|------------|
| Página /prospectos | ✅ Existe | ✅ Existe | Sin cambios |
| API /api/prospects | ✅ Funcional | ✅ Funcional | Sin cambios |
| CRUD completo | ✅ Implementado | ✅ Implementado | Sin cambios |
| Métricas de conversión | ⚠️ Falta | ⚠️ Tasa en dashboard, sin detalle | Parcial |
| Recordatorios seguimiento | ❌ Falta | ❌ Falta | Confirmado |

---

## PARTE 2: PRIORIZACIÓN ACTUALIZADA

### 🔴 CRÍTICO (Seguridad - Semana 1)

1. **Hashear passwords con bcrypt**
   - Instalar: `npm install bcryptjs @types/bcryptjs`
   - Actualizar `AuthService.createUser()` para hashear
   - Actualizar `actions.ts` para verificar hash con `bcrypt.compare()`
   - **REMOVER backdoor "123456"**
   - Actualizar seed con passwords hasheados

2. **Crear middleware de autenticación**
   - Archivo: `src/middleware.ts`
   - Proteger rutas en `(protected)`
   - Validar sesión antes de permitir acceso

3. **Consolidar estado de auth**
   - Eliminar duplicidad Zustand/Context
   - Usar solo Zustand para consistencia

### 🔴 ALTA (Funcionalidad Core - Semanas 2-3)

4. **Sistema de Invitaciones completo**
   - Instalar Resend: `npm install resend`
   - Crear `/api/invitations` (POST, GET, DELETE)
   - Crear `/auth/invitation/[token]/page.tsx`
   - Conectar UI con API real

5. **API de Usuarios**
   - Crear `/api/users/[id]/route.ts` (PUT, DELETE)
   - Validar permisos en endpoints
   - Conectar UI con API real

6. **Registro de usuarios funcional**
   - Implementar `/api/auth/register`
   - Conectar RegisterForm con backend

### 🟡 MEDIA (Semanas 3-4)

7. **Generación de PDF de recibos**
   - Instalar: `npm install @react-pdf/renderer` o `pdfkit`
   - Crear endpoint `/api/receipts/[id]/download`
   - Template de recibo en PDF

8. **Sistema de notificaciones automáticas**
   - Crear cron job con Vercel Cron
   - Endpoint `/api/cron/notifications`
   - Enviar recordatorios 7, 3, 1 día antes

9. **UI para Contenido Académico**
   - Crear página `/admin/content`
   - Componentes: ContentManager, DeliveryForm
   - Conectar con API existente

### 🟢 BAJA (Semanas 4-5)

10. **Exportación de reportes**
    - PDF: react-pdf o puppeteer
    - Excel: exceljs
    - Endpoints `/api/reports/export`

11. **Recuperación de contraseña** ✅
    - Crear tabla PasswordReset (Completado)
    - Enviar email con token (Completado)
    - Página `/auth/reset-password/[token]` (Completado)

12. **Mejoras de UX**
    - Filtros avanzados en dashboard
    - Historial de interacciones en prospectos
    - Rate limiting en login

---

## PARTE 3: PLAN DE IMPLEMENTACIÓN PASO A PASO

### FASE 1: SEGURIDAD CRÍTICA (Días 1-3)

#### Día 1: Hasheo de Passwords

```bash
# Paso 1: Instalar bcryptjs
npm install bcryptjs @types/bcryptjs
```

**Archivos a modificar:**

1. `src/modules/auth/services/auth.service.ts`
```typescript
import bcrypt from 'bcryptjs';

// En createUser():
const hashedPassword = await bcrypt.hash(data.password, 12);
// Guardar hashedPassword en lugar de data.password
```

2. `src/modules/auth/actions.ts`
```typescript
import bcrypt from 'bcryptjs';

// Reemplazar línea 22:
// ANTES: if (user.password !== data.password && data.password !== "123456")
// DESPUÉS:
const isValidPassword = await bcrypt.compare(data.password, user.password || '');
if (!isValidPassword) {
  return { success: false, message: "Credenciales inválidas" };
}
```

3. `prisma/seed.ts`
```typescript
import bcrypt from 'bcryptjs';

// Hashear passwords en seed
const hashedPassword = await bcrypt.hash('Admin123!', 12);
```

#### Día 2: Middleware de Autenticación

**Crear archivo:** `src/middleware.ts`
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authStorage = request.cookies.get('auth-storage');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/matriculas') ||
                          request.nextUrl.pathname.startsWith('/recaudos') ||
                          request.nextUrl.pathname.startsWith('/admin');

  if (isProtectedRoute && !authStorage) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/matriculas/:path*', '/recaudos/:path*', '/admin/:path*']
};
```

#### Día 3: Consolidar Estado de Auth

- Eliminar `src/lib/auth-context.tsx` o marcarlo como deprecated
- Actualizar componentes para usar solo `useAuthStore`
- Migrar lógica de `useAdvisorFilter` a Zustand

---

### FASE 2: SISTEMA DE INVITACIONES (Días 4-7)

#### Día 4: Configurar Resend

```bash
npm install resend
```

**Crear archivo:** `src/lib/email.ts`
```typescript
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(to: string, token: string, role: string) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/invitation/${token}`;

  await resend.emails.send({
    from: 'Instituto <noreply@tudominio.com>',
    to,
    subject: 'Invitación a la plataforma Instituto',
    html: `
      <h1>Has sido invitado</h1>
      <p>Has sido invitado como ${role} a la plataforma Instituto.</p>
      <a href="${inviteUrl}">Aceptar invitación</a>
      <p>Este enlace expira en 7 días.</p>
    `
  });
}
```

#### Día 5: API de Invitaciones

**Crear archivo:** `src/app/api/invitations/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { sendInvitationEmail } from '@/lib/email';
import { addDays } from 'date-fns';

export async function POST(request: Request) {
  const { email, roleId, inviterId } = await request.json();

  // Validar límite de invitaciones
  const inviter = await prisma.user.findUnique({ where: { id: inviterId } });
  const pendingCount = await prisma.invitation.count({
    where: { inviterId, status: 'PENDING' }
  });

  if (pendingCount >= (inviter?.invitationLimit || 0)) {
    return NextResponse.json({ success: false, error: 'Límite de invitaciones alcanzado' }, { status: 403 });
  }

  const token = randomUUID();
  const invitation = await prisma.invitation.create({
    data: {
      email,
      roleId,
      inviterId,
      token,
      expiresAt: addDays(new Date(), 7),
    },
    include: { role: true }
  });

  await sendInvitationEmail(email, token, invitation.role.name);

  return NextResponse.json({ success: true, data: invitation });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inviterId = searchParams.get('inviterId');

  const invitations = await prisma.invitation.findMany({
    where: inviterId ? { inviterId } : {},
    include: { role: true, inviter: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ success: true, data: invitations });
}
```

#### Día 6: Página de Aceptación

**Crear archivo:** `src/app/auth/invitation/[token]/page.tsx`
```typescript
// Página para aceptar invitación y crear cuenta
// Valida token, muestra formulario de password, crea usuario
```

#### Día 7: Conectar UI

- Actualizar `InviteUserModal.tsx` para llamar a `/api/invitations`
- Actualizar `UsersManager.tsx` para cargar datos reales
- Eliminar mock data

---

### FASE 3: API DE USUARIOS (Días 8-10)

#### Día 8: Endpoints PUT/DELETE

**Crear archivo:** `src/app/api/users/[id]/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { UsersService } from '@/modules/users/services';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // Validar permisos
  // Actualizar usuario
  const data = await request.json();
  const user = await UsersService.updateUser(params.id, data);
  return NextResponse.json({ success: true, data: user });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // Validar permisos (solo SUPERADMIN)
  await UsersService.deleteUser(params.id);
  return NextResponse.json({ success: true });
}
```

#### Día 9-10: Conectar UI y Testing

- Actualizar página `/admin/users` para usar API real
- Eliminar datos mock
- Probar flujo completo

---

### FASE 4: FUNCIONALIDADES ADICIONALES (Días 11-20)

#### Días 11-13: PDF de Recibos

```bash
npm install @react-pdf/renderer
```

- Crear template de recibo en React-PDF
- Endpoint `/api/receipts/[id]/download`
- Botón de descarga en UI

#### Días 14-16: Notificaciones Automáticas

**Crear archivo:** `src/app/api/cron/notifications/route.ts`
```typescript
// Vercel Cron job
// Se ejecuta cada hora
// Busca compromisos próximos
// Envía WhatsApp
// Actualiza notificationsSent
```

**Configurar en `vercel.json`:**
```json
{
  "crons": [{
    "path": "/api/cron/notifications",
    "schedule": "0 * * * *"
  }]
}
```

#### Días 17-20: UI de Contenido Académico

- Crear `/app/admin/content/page.tsx`
- Componentes: ContentManager, ContentForm, DeliveryTable
- Conectar con API existente

---

## PARTE 4: CHECKLIST DE IMPLEMENTACIÓN

### Semana 1: Seguridad
- [ ] Instalar bcryptjs
- [ ] Hashear passwords en auth.service.ts
- [ ] Actualizar verificación en actions.ts
- [ ] REMOVER backdoor "123456"
- [ ] Actualizar seed con passwords hasheados
- [ ] Ejecutar `npx prisma db push`
- [ ] Crear middleware.ts
- [ ] Probar protección de rutas
- [ ] Consolidar Zustand/Context

### Semana 2: Invitaciones
- [ ] Configurar cuenta Resend
- [ ] Agregar RESEND_API_KEY a .env
- [ ] Crear lib/email.ts
- [ ] Crear API /api/invitations
- [ ] Crear API /api/invitations/[id]
- [ ] Crear página /auth/invitation/[token]
- [ ] Actualizar InviteUserModal
- [ ] Actualizar UsersManager
- [ ] Eliminar mock data

### Semana 3: Usuarios y Registro
- [ ] Crear API /api/users/[id] (PUT, DELETE)
- [ ] Agregar validación de permisos
- [ ] Conectar UI /admin/users con API
- [ ] Implementar /api/auth/register
- [ ] Conectar RegisterForm con backend
- [ ] Probar flujo completo

### Semana 4: PDF y Notificaciones
- [ ] Instalar @react-pdf/renderer
- [ ] Crear template de recibo PDF
- [ ] Crear endpoint /api/receipts/[id]/download
- [ ] Agregar botón descarga en UI
- [ ] Crear endpoint /api/cron/notifications
- [ ] Configurar Vercel Cron
- [ ] Implementar lógica 7, 3, 1 día
- [ ] Probar notificaciones

### Semana 5: Contenido y Exportación
- [ ] Crear página /admin/content
- [ ] Crear ContentManager component
- [ ] Crear ContentDeliveryForm component
- [ ] Conectar con API existente
- [ ] Instalar exceljs
- [ ] Crear endpoints de exportación
- [ ] Agregar botones export funcionales

---

## PARTE 5: VARIABLES DE ENTORNO REQUERIDAS

```env
# Base de datos (ya configurado)
DATABASE_URL="postgresql://..."

# Autenticación
NEXTAUTH_SECRET="tu-secret-muy-seguro-aqui"
NEXTAUTH_URL="https://tudominio.com"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxx"

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID="xxxxxxxxxxxx"
WHATSAPP_ACCESS_TOKEN="xxxxxxxxxxxx"

# Aplicación
NEXT_PUBLIC_BASE_URL="https://tudominio.com"
```

---

## PARTE 6: DEPENDENCIAS A INSTALAR

```bash
# Seguridad
npm install bcryptjs @types/bcryptjs

# Email
npm install resend

# PDF
npm install @react-pdf/renderer

# Excel (opcional)
npm install exceljs
```

---

## CONCLUSIÓN

El sistema tiene una base sólida con la mayoría de la lógica de negocio implementada correctamente. Las prioridades críticas son:

1. **SEGURIDAD**: Hashear passwords y proteger rutas (URGENTE)
2. **INVITACIONES**: Completar flujo de invitación de usuarios
3. **PDF**: Generar recibos descargables
4. **NOTIFICACIONES**: Automatizar recordatorios

El backend de pagos, compromisos, contenido académico y reportes está mayormente completo. El trabajo principal es en:
- Seguridad de autenticación
- Conectar UI existente con APIs
- Completar integraciones (email, PDF)
- Automatización de notificaciones

**Tiempo estimado total: 4-5 semanas de desarrollo**

---

*Última actualización: 2026-01-27*
*Estado: Fase 5 completada, Fase 6.1 completada, Fase 6.2 (Dashboard por Roles) completada*
*Basado en análisis del código fuente y archivos de verificación*
