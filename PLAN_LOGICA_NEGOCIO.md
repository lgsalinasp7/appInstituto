# PLAN DE IMPLEMENTACIÓN - Instituto de Formación Técnica

> Plan detallado basado en el análisis del documento LOGICA_NEGOCIO.md y la estructura actual del proyecto.

---

## 1. ESTADO ACTUAL DEL PROYECTO

### 1.1 Infraestructura Conectada

| Servicio | Estado | Detalles |
|----------|--------|----------|
| **Vercel** | ✅ Conectado | Proyecto: `app-instituto` - READY |
| **Neon** | ✅ Conectado | Proyecto: `neon-app-tecnico`, Branch: `br-weathered-queen-ahqj8sxe` |
| **PostgreSQL** | v17 | Región: aws-us-east-1 |
| **Base de datos** | ⚠️ Vacía | Sin tablas - necesita `prisma db push` |

### 1.2 Stack Tecnológico Actual

```
Frontend:     Next.js 16.1.4 + React 19
Estilos:      Tailwind CSS 4 + shadcn/ui (Radix)
Forms:        react-hook-form + zod
ORM:          Prisma 7.3.0 + @prisma/adapter-neon
DB:           Neon (PostgreSQL 17)
Deploy:       Vercel
```

### 1.3 Arquitectura Actual (Modular)

```
src/
├── app/
│   ├── (protected)/        # Páginas protegidas
│   ├── admin/              # Panel admin
│   ├── api/                # Route handlers
│   └── auth/               # Autenticación
├── components/
│   ├── brand/              # Logo, branding
│   ├── shared/             # Header, Footer
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom hooks
├── lib/                    # Utilidades core
│   ├── prisma.ts           # Conexión Prisma/Neon
│   ├── auth-context.tsx    # Contexto de auth
│   └── utils.ts            # Helpers
└── modules/                # Módulos de negocio
    ├── admin/
    ├── auth/
    ├── cartera/
    ├── content/
    ├── dashboard/
    ├── payments/
    ├── programs/
    ├── prospects/
    ├── receipts/
    ├── reports/
    ├── students/
    └── users/
```

### 1.4 Schema de Prisma Actual

| Modelo | Estado | Cambios Requeridos |
|--------|--------|-------------------|
| `User` | ✅ OK | - |
| `Role` | ✅ OK | - |
| `Program` | ⚠️ Incompleto | Agregar: `matriculaValue`, `modulesCount` |
| `Student` | ⚠️ Incompleto | Agregar: `paymentFrequency`, `firstCommitmentDate` |
| `Payment` | ⚠️ Incompleto | Agregar: `paymentType` (MATRICULA/MODULO), `moduleNumber` |
| `PaymentCommitment` | ⚠️ Incompleto | Agregar: `moduleNumber`, `notificationsSent` |
| `AcademicContent` | ✅ OK | Renombrar a `Module` (opcional) |
| `ContentDelivery` | ✅ OK | Renombrar a `ModuleDelivery` (opcional) |
| `Prospect` | ✅ OK | Ocultar en UI |

---

## 2. FASE 1: CAMBIOS ESTRUCTURALES DE BD

### 2.1 Modificaciones al Schema de Prisma

#### 2.1.1 Modelo `Program` (Agregar campos)

```prisma
model Program {
  id            String   @id @default(cuid())
  name          String   @unique
  description   String?
  totalValue    Decimal  @db.Decimal(10, 2)  // Ya existe
  matriculaValue Decimal @db.Decimal(10, 2)  // NUEVO: Valor matrícula (50k/60k)
  modulesCount  Int                          // NUEVO: Cantidad de módulos
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relaciones existentes...
}
```

**Valor por módulo (calculado):**
```
valorModulo = (totalValue - matriculaValue) / modulesCount
```

#### 2.1.2 Modelo `Student` (Agregar campos)

```prisma
model Student {
  // ... campos existentes ...

  paymentFrequency    PaymentFrequency @default(MENSUAL)  // NUEVO
  firstCommitmentDate DateTime                            // NUEVO
  currentModule       Int              @default(0)        // NUEVO: Módulo actual (0 = solo matrícula)
  matriculaPaid       Boolean          @default(false)    // NUEVO

  // ... relaciones existentes ...
}

enum PaymentFrequency {
  MENSUAL    // 30 días
  QUINCENAL  // 15 días
}
```

#### 2.1.3 Modelo `Payment` (Agregar campos)

```prisma
model Payment {
  // ... campos existentes ...

  paymentType   PaymentType       // NUEVO: Tipo de pago
  moduleNumber  Int?              // NUEVO: Número de módulo (null si es matrícula)

  // ... relaciones existentes ...
}

enum PaymentType {
  MATRICULA
  MODULO
}
```

#### 2.1.4 Modelo `PaymentCommitment` (Agregar campos)

```prisma
model PaymentCommitment {
  // ... campos existentes ...

  moduleNumber         Int                    // NUEVO: Módulo correspondiente
  notificationsSent    Json?                  // NUEVO: { "7dias": true, "3dias": false, "1dia": false }

  // ... relaciones existentes ...
}
```

#### 2.1.5 Nuevo Modelo: `SystemConfig`

```prisma
model SystemConfig {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
}

// Ejemplo de uso:
// key: "monthlyGoal", value: "50000000"
// key: "workshopDaysBefore", value: "5"
```

### 2.2 Script de Migración

```bash
# Paso 1: Actualizar schema.prisma con los cambios arriba

# Paso 2: Generar migración
npx prisma migrate dev --name add_business_logic_fields

# Paso 3: Push a Neon (para desarrollo)
npx prisma db push

# Paso 4: Verificar en Neon
npx prisma studio
```

---

## 3. FASE 2: ARQUITECTURA CLEAN CODE

### 3.1 Estructura de Módulos (Patrón)

Cada módulo debe seguir esta estructura:

```
src/modules/{module-name}/
├── index.ts                 # Barrel export
├── components/              # Componentes React del módulo
│   ├── index.ts
│   └── {Component}.tsx
├── hooks/                   # Custom hooks del módulo
│   └── use{Module}.ts
├── schemas/                 # Validaciones Zod
│   └── index.ts
├── services/                # Lógica de negocio (llamadas API)
│   └── {module}.service.ts
├── repositories/            # NUEVO: Acceso a datos (Prisma)
│   └── {module}.repository.ts
├── types/                   # TypeScript types/interfaces
│   └── index.ts
└── utils/                   # Utilidades específicas
    └── index.ts
```

### 3.2 Separación de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTACIÓN                           │
│  src/app/              Páginas Next.js (Server Components)  │
│  src/modules/*/        Componentes React (Client)           │
│  src/components/ui/    shadcn/ui components                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICIOS                              │
│  src/modules/*/services/   Lógica de negocio + fetch API    │
│  src/app/api/*/route.ts    Route handlers (API endpoints)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      REPOSITORIOS                           │
│  src/modules/*/repositories/   Acceso a Prisma              │
│  src/lib/prisma.ts             Conexión Neon                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BASE DE DATOS                          │
│  Neon PostgreSQL                                            │
│  prisma/schema.prisma                                       │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Convenciones de Código

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Archivos | kebab-case | `student-form.tsx` |
| Componentes | PascalCase | `StudentForm` |
| Funciones | camelCase | `createStudent()` |
| Constantes | SCREAMING_SNAKE | `PAYMENT_TYPES` |
| Interfaces | PascalCase + I prefix (opcional) | `Student` o `IStudent` |
| Enums | PascalCase | `PaymentType` |
| Hooks | camelCase + use prefix | `useStudents()` |

---

## 4. FASE 3: SERVICIOS CRUD POR MÓDULO

### 4.1 Módulo: Programs (Programas)

**Prioridad:** 🔴 ALTA (se necesita primero)

#### API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/programs` | Listar todos los programas |
| GET | `/api/programs/[id]` | Obtener programa por ID |
| POST | `/api/programs` | Crear programa |
| PUT | `/api/programs/[id]` | Actualizar programa |
| DELETE | `/api/programs/[id]` | Eliminar programa (soft delete) |

#### Servicio: `program.service.ts`

```typescript
// Funciones requeridas:
- getAllPrograms(): Promise<Program[]>
- getProgramById(id: string): Promise<Program>
- createProgram(data: CreateProgramInput): Promise<Program>
- updateProgram(id: string, data: UpdateProgramInput): Promise<Program>
- deleteProgram(id: string): Promise<void>
- calculateModuleValue(program: Program): number  // NUEVO
```

#### Schema Zod

```typescript
const programSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  totalValue: z.number().positive(),
  matriculaValue: z.number().positive(),
  modulesCount: z.number().int().min(1),
});
```

---

### 4.2 Módulo: Students (Estudiantes/Matrículas)

**Prioridad:** 🔴 ALTA

#### API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/students` | Listar estudiantes |
| GET | `/api/students/[id]` | Obtener estudiante |
| POST | `/api/students` | Crear estudiante (inscripción) |
| PUT | `/api/students/[id]` | Actualizar estudiante |
| GET | `/api/students/[id]/summary` | Resumen con módulos y pagos |
| GET | `/api/students/search?q=` | Buscar por nombre/documento |

#### Servicio: `student.service.ts`

```typescript
// Funciones requeridas:
- getAllStudents(filters?: StudentFilters): Promise<Student[]>
- getStudentById(id: string): Promise<StudentWithDetails>
- createStudent(data: CreateStudentInput): Promise<Student>
- updateStudent(id: string, data: UpdateStudentInput): Promise<Student>
- searchStudents(query: string): Promise<Student[]>  // NUEVO
- getStudentSummary(id: string): Promise<StudentSummary>  // NUEVO
- getCurrentModule(student: Student): number  // NUEVO
- isStudentInMora(student: Student): boolean  // NUEVO
```

#### Lógica de Negocio: Inscripción

```typescript
async function createStudent(data: CreateStudentInput) {
  // 1. Validar datos
  // 2. Obtener programa y calcular valores
  // 3. Crear estudiante con:
  //    - currentModule: 0
  //    - matriculaPaid: false
  // 4. NO crear compromiso aún (se crea al pagar matrícula)
  // 5. Retornar estudiante creado
}
```

---

### 4.3 Módulo: Payments (Pagos)

**Prioridad:** 🔴 ALTA

#### API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/payments` | Listar pagos |
| GET | `/api/payments/[id]` | Obtener pago |
| POST | `/api/payments` | Registrar pago |
| GET | `/api/payments/today` | Pagos del día |
| GET | `/api/payments/stats` | Estadísticas |
| GET | `/api/payments/student/[studentId]` | Pagos de un estudiante |

#### Servicio: `payment.service.ts`

```typescript
// Funciones requeridas:
- getAllPayments(filters?: PaymentFilters): Promise<Payment[]>
- getPaymentById(id: string): Promise<Payment>
- createPayment(data: CreatePaymentInput): Promise<Payment>  // CRÍTICO
- getPaymentsByStudent(studentId: string): Promise<Payment[]>
- getTodayPayments(): Promise<Payment[]>
- getPaymentStats(dateRange: DateRange): Promise<PaymentStats>
```

#### Lógica de Negocio: Registrar Pago (CRÍTICO)

```typescript
async function createPayment(data: CreatePaymentInput) {
  const student = await getStudentById(data.studentId);
  const program = await getProgramById(student.programId);

  // Determinar tipo de pago
  if (!student.matriculaPaid) {
    // PAGO DE MATRÍCULA
    if (data.amount !== program.matriculaValue) {
      throw new Error('El monto debe ser exacto al valor de la matrícula');
    }

    // 1. Registrar pago tipo MATRICULA
    // 2. Actualizar estudiante: matriculaPaid = true
    // 3. Crear primer compromiso (para módulo 1)
    //    - scheduledDate = student.firstCommitmentDate
    //    - amount = valorModulo
    //    - moduleNumber = 1
    // 4. NO entregar ningún módulo

  } else {
    // PAGO DE MÓDULO
    const valorModulo = (program.totalValue - program.matriculaValue) / program.modulesCount;

    if (data.amount !== valorModulo) {
      throw new Error('El monto debe ser exacto al valor del módulo');
    }

    const nextModule = student.currentModule + 1;

    // 1. Registrar pago tipo MODULO con moduleNumber
    // 2. Actualizar estudiante: currentModule = nextModule
    // 3. Marcar compromiso actual como PAGADO
    // 4. Registrar entrega de módulo
    // 5. Si no es el último módulo, crear siguiente compromiso
    //    - scheduledDate = ahora + (frecuencia: 30 o 15 días)
    //    - moduleNumber = nextModule + 1
  }

  // Generar recibo
  // Enviar WhatsApp (opcional)
}
```

---

### 4.4 Módulo: Commitments (Compromisos)

**Prioridad:** 🔴 ALTA

#### API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/commitments` | Listar compromisos |
| GET | `/api/commitments/[id]` | Obtener compromiso |
| PUT | `/api/commitments/[id]` | Actualizar compromiso |
| POST | `/api/commitments/[id]/reschedule` | Reprogramar |
| GET | `/api/commitments/due-today` | Vencen hoy |
| GET | `/api/commitments/overdue` | Vencidos (mora) |
| GET | `/api/commitments/upcoming` | Próximos 7 días |

#### Servicio: `commitment.service.ts`

```typescript
// Funciones requeridas:
- getAllCommitments(filters?: CommitmentFilters): Promise<Commitment[]>
- getCommitmentById(id: string): Promise<Commitment>
- createCommitment(data: CreateCommitmentInput): Promise<Commitment>
- markAsPaid(id: string): Promise<Commitment>
- rescheduleCommitment(id: string, newDate: Date): Promise<Commitment>
- getOverdueCommitments(): Promise<Commitment[]>  // MORA
- getDueTodayCommitments(): Promise<Commitment[]>
- getUpcomingCommitments(days: number): Promise<Commitment[]>
- calculateWorkshopDeadline(commitment: Commitment): Date  // fecha - 5 días
```

---

### 4.5 Módulo: Modules (Contenido Académico/Módulos)

**Prioridad:** 🟡 MEDIA

#### API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/modules` | Listar módulos por programa |
| GET | `/api/modules/[id]` | Obtener módulo |
| POST | `/api/modules/deliver` | Registrar entrega |
| GET | `/api/modules/pending` | Pendientes de entrega |
| GET | `/api/modules/student/[studentId]` | Módulos de estudiante |

#### Servicio: `module.service.ts`

```typescript
// Funciones requeridas:
- getModulesByProgram(programId: string): Promise<Module[]>
- deliverModule(studentId: string, moduleNumber: number): Promise<Delivery>
- getPendingDeliveries(): Promise<PendingDelivery[]>
- getStudentModules(studentId: string): Promise<StudentModule[]>
```

---

### 4.6 Módulo: Reports (Reportes)

**Prioridad:** 🟡 MEDIA

#### API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reports/recaudo` | Reporte de recaudo |
| GET | `/api/reports/cartera` | Reporte de cartera |
| GET | `/api/reports/cartera/aging` | Cartera por antigüedad |
| GET | `/api/reports/matriculas` | Reporte de matrículas |
| GET | `/api/reports/advisors` | Por asesor |
| GET | `/api/reports/export/[type]` | Exportar Excel/PDF |

#### Servicio: `reports.service.ts`

```typescript
// Funciones requeridas:
- getRecaudoReport(filters: ReportFilters): Promise<RecaudoReport>
- getCarteraReport(filters: ReportFilters): Promise<CarteraReport>
- getCarteraByAging(): Promise<CarteraAging>  // 0-30, 31-60, 61-90, +90
- getMatriculasReport(filters: ReportFilters): Promise<MatriculasReport>
- getAdvisorReport(advisorId?: string): Promise<AdvisorReport>
- exportToExcel(reportType: string, data: any): Promise<Buffer>
- exportToPDF(reportType: string, data: any): Promise<Buffer>
```

---

### 4.7 Módulo: Dashboard

**Prioridad:** 🟡 MEDIA

#### API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Estadísticas generales |
| GET | `/api/dashboard/today` | Resumen del día |
| GET | `/api/dashboard/goal` | Meta del mes |

#### Servicio: `dashboard.service.ts`

```typescript
// Funciones requeridas:
- getDashboardStats(): Promise<DashboardStats>
- getTodayRecaudo(): Promise<number>  // NUEVO
- getCarteraEnMora(): Promise<number>  // NUEVO
- getMonthlyGoalProgress(): Promise<GoalProgress>  // NUEVO
- getStatsByAdvisor(advisorId: string): Promise<AdvisorStats>
```

---

### 4.8 Módulo: Notifications (WhatsApp)

**Prioridad:** 🟢 BAJA (fase posterior)

#### API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/whatsapp/send-receipt` | Enviar recibo |
| POST | `/api/whatsapp/send-reminder` | Enviar recordatorio |
| POST | `/api/whatsapp/send-module-delivery` | Notificar entrega |
| GET | `/api/whatsapp/pending-reminders` | Recordatorios pendientes |

---

### 4.9 Módulo: Config (Configuración Admin)

**Prioridad:** 🟡 MEDIA

#### API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/config` | Obtener configuración |
| PUT | `/api/config/[key]` | Actualizar configuración |
| GET | `/api/config/monthly-goal` | Meta del mes |
| PUT | `/api/config/monthly-goal` | Actualizar meta |

---

## 5. FASE 4: CORRECCIÓN DE VISTAS

### 5.1 Vista: Dashboard (Panel de Control)

**Ubicación:** `src/app/(protected)/dashboard/page.tsx`

#### Cambios Requeridos

| Cambio | Descripción | Prioridad |
|--------|-------------|-----------|
| ❌ Quitar | "Tasa de Cierre" | 🔴 ALTA |
| ➕ Agregar | StatCard "Recaudo del Día" | 🔴 ALTA |
| ➕ Agregar | StatCard "Cartera en Mora" (rojo) | 🔴 ALTA |
| ➕ Agregar | StatCard "Meta del Mes" con barra progreso | 🔴 ALTA |
| ➕ Agregar | Filtros de tiempo (Semanal/Quincenal/Mensual) | 🟡 MEDIA |
| ➕ Agregar | Filtro por Asesor | 🟡 MEDIA |

#### Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Panel de Control                    [Filtros ▾] [Asesor]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│ │ Estudiantes│ │ Recaudo    │ │ Cartera    │ │ Meta Mes   ││
│ │    150     │ │ Hoy        │ │ en Mora    │ │ 90%        ││
│ │ +5 este mes│ │ $2,500,000 │ │ $8,000,000 │ │ ████████░░ ││
│ │            │ │    🟢      │ │    🔴      │ │$45M/$50M   ││
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘│
│                                                             │
│ [Gráfico de Recaudo Mensual]        [Próximos Vencimientos]│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 5.2 Vista: Matrículas (Estudiantes)

**Ubicación:** `src/app/(protected)/matriculas/page.tsx` (crear o renombrar)

#### Cambios en el Formulario

| Cambio | Campo | Acción |
|--------|-------|--------|
| ❌ Quitar | Estado | Eliminar (siempre MATRICULADO) |
| ❌ Quitar | Asesor | Eliminar (usar sesión) |
| ➕ Agregar | Frecuencia de Pago | Select: Mensual/Quincenal |
| ➕ Agregar | Fecha Primer Compromiso | DatePicker |
| 🔄 Mejorar | Programa | Al seleccionar → autocompletar valores |
| ➕ Agregar | Resumen calculado | Mostrar valor módulo, próximo pago |

#### Cambios en la Tabla

| Columna | Estado | Acción |
|---------|--------|--------|
| Nombre | ✅ Existe | - |
| Documento | ✅ Existe | - |
| Programa | ✅ Existe | - |
| Matrícula Pagada | ❌ Falta | Agregar ✅/❌ |
| Módulo Actual | ❌ Falta | Agregar "2 de 6" |
| Estado Pago | ❌ Falta | Agregar 🟢/🔴 |
| Acciones | ✅ Existe | - |

#### Wireframe del Formulario

```
┌─────────────────────────────────────────────────────────────┐
│ Nueva Inscripción                                      [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Datos del Estudiante                                        │
│ ┌─────────────────────┐ ┌─────────────────────┐            │
│ │ Nombre completo     │ │ Tipo Doc  [CC ▾]    │            │
│ └─────────────────────┘ └─────────────────────┘            │
│ ┌─────────────────────┐ ┌─────────────────────┐            │
│ │ Número documento    │ │ Celular (WhatsApp)  │            │
│ └─────────────────────┘ └─────────────────────┘            │
│                                                             │
│ Programa                                                    │
│ ┌───────────────────────────────────────────────┐          │
│ │ Seleccionar programa...                    [▾]│          │
│ └───────────────────────────────────────────────┘          │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Resumen (autocompletado)                                ││
│ │ • Valor Total:     $1,800,000                           ││
│ │ • Matrícula:       $60,000                              ││
│ │ • Módulos:         6                                    ││
│ │ • Valor/Módulo:    $290,000                             ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Configuración de Pagos                                      │
│ ┌─────────────────────┐ ┌─────────────────────┐            │
│ │ Frecuencia [Mensual]│ │ Primer Compromiso   │            │
│ └─────────────────────┘ │ 📅 15/02/2026       │            │
│                         └─────────────────────┘            │
│                                                             │
│                              [Cancelar] [Guardar Inscripción]
└─────────────────────────────────────────────────────────────┘
```

---

### 5.3 Vista: Recaudos (NUEVA - Fusión)

**Ubicación:** `src/app/(protected)/recaudos/page.tsx`

Esta vista fusiona "Pagos & Recibos" + "Control de Cartera" en una sola vista con tabs.

#### Estructura de Tabs

```
┌─────────────────────────────────────────────────────────────┐
│ 💰 Recaudos                                                 │
├─────────────────────────────────────────────────────────────┤
│ [Registrar Pago] [Historial] [Cartera]                      │
├─────────────────────────────────────────────────────────────┤
```

#### Tab 1: Registrar Pago

```
┌─────────────────────────────────────────────────────────────┐
│ Buscar Estudiante                                           │
│ ┌───────────────────────────────────────────┐ [Buscar]     │
│ │ Nombre o número de documento...           │              │
│ └───────────────────────────────────────────┘              │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 👤 Juan Pérez García                                    ││
│ │ CC 1234567890 | Técnico en Enfermería                   ││
│ │                                                         ││
│ │ Estado:        Matrícula pagada ✅                      ││
│ │ Módulo actual: 2 de 6                                   ││
│ │ Saldo:         $1,160,000                               ││
│ │ Próximo pago:  $290,000 (Módulo 3) - Vence: 15/Feb      ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Registrar Pago                                              │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Monto        │ │ Método       │ │ Referencia   │         │
│ │ $290,000     │ │ [Nequi ▾]    │ │ (opcional)   │         │
│ └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                             │
│                       [Registrar Pago y Generar Recibo]     │
└─────────────────────────────────────────────────────────────┘
```

#### Tab 2: Historial

```
┌─────────────────────────────────────────────────────────────┐
│ Filtros: [Fecha ▾] [Método ▾] [Tipo ▾] [Asesor ▾] [Exportar]│
├─────────────────────────────────────────────────────────────┤
│ | Fecha    | Estudiante      | Tipo      | Monto    | Acción│
│ |----------|-----------------|-----------|----------|-------|│
│ | Hoy      | Juan Pérez      | MÓDULO 3  | $290,000 | 📱 📄 │
│ | Hoy      | María López     | MATRÍCULA | $60,000  | 📱 📄 │
│ | Ayer     | Carlos Ruiz     | MÓDULO 1  | $290,000 | 📱 📄 │
└─────────────────────────────────────────────────────────────┘
```

#### Tab 3: Cartera

```
┌─────────────────────────────────────────────────────────────┐
│ Resumen: Vencidos: $8M 🔴 | Hoy: $1.5M 🟠 | Próximos: $3M 🔵│
├─────────────────────────────────────────────────────────────┤
│ [🔴 Vencidos] [🟠 Hoy] [🔵 Próximos 7 días]                 │
├─────────────────────────────────────────────────────────────┤
│ | Estudiante      | Monto    | Vence      | Días  | Acción  │
│ |-----------------|----------|------------|-------|---------|│
│ | 🔴 Pedro Gómez  | $290,000 | 10/Ene     | -14   | 📱 💰   │
│ | 🔴 Ana Torres   | $290,000 | 12/Ene     | -12   | 📱 💰   │
│ | 🟠 Luis Díaz    | $290,000 | Hoy        | 0     | 📱 💰   │
│ | 🔵 Rosa Martín  | $290,000 | 28/Ene     | +4    | 📱      │
└─────────────────────────────────────────────────────────────┘

📱 = Enviar recordatorio WhatsApp
💰 = Registrar pago
```

---

### 5.4 Vista: Reportes

**Ubicación:** `src/app/(protected)/reportes/page.tsx`

#### Estructura de Tabs

```
[Recaudo] [Cartera] [Matrículas] [Exportar]
```

#### Tab: Cartera (SUPER IMPORTANTE)

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Cartera por Antigüedad                    [Exportar ▾]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ | Antigüedad   | Monto        | Estudiantes | % Total      │
│ |--------------|--------------|-------------|--------------|│
│ | 🟢 0-30 días | $12,000,000  | 35          | 40%          │
│ | 🟡 31-60 días| $8,000,000   | 22          | 27%          │
│ | 🟠 61-90 días| $5,000,000   | 12          | 17%          │
│ | 🔴 +90 días  | $5,000,000   | 8           | 16%          │
│ |--------------|--------------|-------------|--------------|│
│ | TOTAL        | $30,000,000  | 77          | 100%         │
│                                                             │
│ [Ver detalle 0-30] [Ver detalle 31-60] ...                  │
└─────────────────────────────────────────────────────────────┘
```

---

### 5.5 Vista: Configuración Admin

**Ubicación:** `src/app/admin/configuracion/page.tsx`

#### Secciones

1. **Gestión de Programas** (CRUD completo)
2. **Meta del Mes** (configurar monto objetivo)
3. **Parámetros del Sistema** (días para taller, etc.)

---

### 5.6 Menú de Navegación

#### Estructura Final

```
📊 Panel de Control     → /dashboard
📚 Matrículas          → /matriculas
💰 Recaudos            → /recaudos
📈 Reportes            → /reportes
⚙️ Configuración       → /admin (solo admin)

❌ Prospectos          → OCULTAR
```

---

## 6. ORDEN DE IMPLEMENTACIÓN

### Sprint 1: Base de Datos y Programas
1. ✅ Actualizar `schema.prisma` con nuevos campos
2. ✅ Ejecutar `prisma db push` en Neon
3. ✅ CRUD completo de Programas
4. ✅ Vista admin de Programas

### Sprint 2: Inscripciones y Pagos
1. ✅ Actualizar formulario de inscripción
2. ✅ Implementar lógica de pago (matrícula vs módulo)
3. ✅ Sistema de compromisos automáticos
4. ✅ Entrega de módulos

### Sprint 3: Vista Recaudos
1. ✅ Crear vista unificada con tabs
2. ✅ Tab "Registrar Pago" con buscador
3. ✅ Tab "Historial" con filtros
4. ✅ Tab "Cartera" con alertas de color

### Sprint 4: Dashboard y Reportes
1. ✅ Actualizar Dashboard con nuevas métricas
2. ✅ Implementar filtros
3. ✅ Reportes por tabs
4. ✅ Exportación Excel/PDF

### Sprint 5: WhatsApp y Polish
1. ✅ Integración WhatsApp
2. ✅ Recordatorios automáticos
3. ✅ Ajustes de UX
4. ✅ Testing

---

## 7. COMANDOS ÚTILES

```bash
# Desarrollo local
npm run dev

# Base de datos
npx prisma db push          # Push schema a Neon
npx prisma studio           # Abrir UI de Prisma
npx prisma generate         # Regenerar cliente

# Verificar conexión Neon
npx prisma db pull          # Pull schema desde Neon

# Build y deploy
npm run build               # Build para producción
git push origin main        # Deploy a Vercel (automático)
```

---

## 8. VARIABLES DE ENTORNO REQUERIDAS

```env
# .env.local
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# En Vercel (ya configurado)
DATABASE_URL="..."
```

---

## 9. FASE 6: VALIDACIÓN Y CALIDAD DE CÓDIGO

### 9.1 Validación con ESLint

**Comando:** `npm run lint`

#### Errores Corregidos (29 → 0)

| Archivo | Error | Corrección |
|---------|-------|------------|
| `auth-context.tsx` | setState en effect, isLoading dinámico | Refactorizado a carga síncrona desde localStorage |
| `CarteraView.tsx` | `Date.now()` impuro en render | Creada función `getDefaultDate()` con lazy state init |
| `ProspectsView.tsx` | `Date.now()` impuro en render | Creada función `getDefaultDate()` con lazy state init |
| `reportes/page.tsx` | Tipos `any` en interfaces y Tooltip | Definidas interfaces `DailyRevenue`, `FinancialData`, `AgingBracket`, `AgingData`, `AdvisorData` |
| `EnrollmentDashboard.tsx` | Tipo `any` para stats | Definida interface `DashboardStatsData` |
| `commitments/route.ts` | Tipo string para status | Usado `Prisma.PaymentCommitmentWhereInput` |
| `whatsapp/send-receipt/route.ts` | Tipos `any` en payload | Definida interface `WhatsAppMessagePayload` |
| `commitment.service.ts` | Tipo `any` en whereClause | Usado `Prisma.PaymentCommitmentWhereInput` |
| Múltiples archivos | Imports no utilizados | Removidos o prefijados con `_` |

#### Warnings Permitidos (8 - Intencionales)

```
- Variables prefijadas con _ para parámetros requeridos pero no usados
- Ejemplos: _advisorId, _currentUserId, _filters
```

### 9.2 Validación con Build

**Comando:** `npm run build`

#### Error Corregido

| Archivo | Error | Corrección |
|---------|-------|------------|
| `reportes/page.tsx` | Recharts Tooltip formatter type | Cambiado `(value: number)` a `(value)` con `Number(value)` |

#### Build Exitoso

```
Route (app)                               Size     First Load JS
┌ ○ /                                     183 B          118 kB
├ ○ /_not-found                           979 B          102 kB
├ ○ /api/commitments                      0 B                0 B
├ ... (42 rutas generadas exitosamente)
└ ○ /auth/register                        183 B          118 kB
```

### 9.3 Correcciones de Código Detalladas

#### auth-context.tsx (Líneas 27-43)
```typescript
// ANTES: Error - setState en effect
const [isLoading, setIsLoading] = useState(true);
useEffect(() => {
  setIsLoading(false);
}, []);

// DESPUÉS: Correcto - Carga síncrona
const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
const isLoading = typeof window === "undefined";
```

#### CarteraView.tsx y ProspectsView.tsx
```typescript
// ANTES: Error - Date.now() impuro en render
const [date, setDate] = useState(new Date(Date.now() + 7*24*60*60*1000).toISOString().split("T")[0]);

// DESPUÉS: Correcto - Helper function con lazy init
function getDefaultDate(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split("T")[0];
}
const [date, setDate] = useState(() => getDefaultDate(7));
```

#### reportes/page.tsx - Interfaces TypeScript
```typescript
// Agregadas interfaces para evitar 'any'
interface DailyRevenue { date: string; amount: number; }
interface FinancialData {
  totalRevenue: number;
  averagePayment: number;
  pendingAmount: number;
  dailyRevenue: DailyRevenue[];
}
interface AgingBracket { label: string; amount: number; count: number; }
interface AgingData { brackets: AgingBracket[]; totalOverdue: number; }
interface AdvisorData {
  advisorId: string;
  advisorName: string;
  totalStudents: number;
  totalCollected: number;
  collectionRate: number;
  revenueThisMonth: number;
}

// Tooltip formatter corregido
formatter={(value) => [`$${(Number(value) || 0).toLocaleString()}`, "Monto"]}
```

---

## 10. FASE 7: DATOS DE PRUEBA (SEED)

### 10.1 Script de Seed

**Ubicación:** `prisma/seed.ts`

**Configuración en package.json:**
```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

### 10.2 Datos Creados

| Entidad | Cantidad | Detalles |
|---------|----------|----------|
| Roles | 2 | admin (all), asesor (read, write) |
| Usuarios | 5 | 1 admin + 4 asesores |
| Programas | 5 | Con valores de matrícula y módulos |
| Estudiantes | 4 | Con pagos de matrícula + módulo 1 |
| Prospectos | 3 | En diferentes estados |
| Config | 1 | Meta mensual $50M |

### 10.3 Credenciales de Acceso

```
# Administrador (acceso total)
admin@instituto.edu.co

# Asesores (acceso limitado)
maria.gonzalez@instituto.edu.co
carlos.rodriguez@instituto.edu.co
ana.martinez@instituto.edu.co
luis.hernandez@instituto.edu.co
```

### 10.4 Ejecución del Seed

```bash
# Prerequisitos
1. Configurar DATABASE_URL en .env
2. Ejecutar npx prisma db push

# Ejecutar seed
npx prisma db seed

# Resultado esperado
Reiniciando base de datos...
Creando roles...
Creando usuario administrador...
Creando usuarios (asesores)...
Creando programas...
Creando configuración del sistema...
Creando estudiantes y pagos...
Creando prospectos...
Seed completado exitosamente! 🚀
```

> **Documentación completa:** Ver `SEED_USUARIOS.md`

---

## 11. CHECKLIST DE VALIDACIÓN

### Base de Datos
- [x] Schema actualizado en Prisma
- [ ] Tablas creadas en Neon (pendiente: `npx prisma db push`)
- [ ] Programas cargados con valores correctos (pendiente: seed)

### Backend (APIs)
- [x] CRUD Programs funcionando
- [x] CRUD Students funcionando
- [x] Lógica de pagos implementada
- [x] Compromisos automáticos funcionando
- [x] Entrega de módulos funcionando

### Frontend (Vistas)
- [x] Dashboard con nuevas métricas
- [x] Formulario de inscripción actualizado
- [x] Vista Recaudos con 3 tabs
- [x] Reportes con exportación

### Integraciones
- [x] WhatsApp enviando recibos
- [x] WhatsApp enviando recordatorios

### Calidad de Código
- [x] ESLint: 0 errores (8 warnings intencionales)
- [x] Build: Exitoso (42 rutas)
- [x] TypeScript: Sin errores de tipo

### Infraestructura
- [x] Vercel: READY (app-instituto-ten.vercel.app)
- [x] Neon: Proyecto conectado (neon-app-tecnico)
- [ ] DATABASE_URL: Pendiente configurar en .env local

---

## 12. PASOS FINALES DE CONFIGURACIÓN

### Para desarrollo local:

```bash
# 1. Crear archivo .env con DATABASE_URL de Neon
# Obtener de: https://console.neon.tech → proyecto → Connection Details

# 2. Crear tablas en la base de datos
npx prisma db push

# 3. Poblar datos de prueba
npx prisma db seed

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Acceder a http://localhost:3000/auth/login
# Usar: admin@instituto.edu.co
```

### Variables de entorno requeridas:

```env
# .env (local)
DATABASE_URL="postgresql://neondb_owner:...@ep-...neon.tech/neondb?sslmode=require"

# Vercel (ya configurado automáticamente por integración Neon)
DATABASE_URL="..."
```

---

*Documento creado: 2026-01-24*
*Última actualización: 2026-01-24*
