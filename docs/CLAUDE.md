# CLAUDE.md - Guía para IA/Desarrolladores

> Este archivo contiene las instrucciones y contexto necesario para que cualquier IA o desarrollador pueda trabajar correctamente en este proyecto.

---

## 1. DESCRIPCIÓN DEL PROYECTO

**Nombre:** App Instituto
**Tipo:** Sistema de gestión de matrículas y recaudo para instituto de formación técnica
**Stack:** Next.js 16 + React 19 + Prisma + Neon (PostgreSQL) + Vercel

### Funcionalidades Principales
- Inscripción de estudiantes a programas académicos
- Gestión de pagos (matrícula + módulos)
- Control de cartera y compromisos de pago
- Entrega de módulos/contenido académico
- Reportes de recaudo y cartera
- Notificaciones por WhatsApp

---

## 2. ARQUITECTURA DEL PROYECTO

```
src/
├── app/                    # Next.js App Router
│   ├── (protected)/        # Rutas protegidas (requieren auth)
│   ├── admin/              # Panel de administración
│   ├── api/                # API Route Handlers
│   └── auth/               # Autenticación (login/register)
├── components/
│   ├── brand/              # Logo, branding
│   ├── shared/             # Header, Footer, Layout
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilidades core
│   ├── prisma.ts           # Conexión Prisma + Neon
│   ├── auth-context.tsx    # Contexto de autenticación
│   └── utils.ts            # Helpers generales
└── modules/                # Módulos de negocio (feature-based)
    ├── students/
    ├── payments/
    ├── programs/
    ├── commitments/
    ├── reports/
    └── ...
```

### Estructura de un Módulo

```
src/modules/{nombre}/
├── index.ts                # Barrel exports
├── components/             # Componentes React del módulo
├── hooks/                  # Hooks específicos
├── schemas/                # Validaciones Zod
├── services/               # Lógica de negocio (fetch a API)
├── repositories/           # Acceso directo a Prisma (server-side)
├── types/                  # TypeScript interfaces
└── utils/                  # Utilidades específicas
```

---

## 3. BASE DE DATOS

### Conexión
- **Proveedor:** Neon (PostgreSQL serverless)
- **ORM:** Prisma 7.3.0 con adapter Neon
- **Archivo:** `prisma/schema.prisma`
- **Conexión:** `src/lib/prisma.ts`

### Modelos Principales

| Modelo | Descripción |
|--------|-------------|
| `User` | Usuarios del sistema (asesores, admin) |
| `Role` | Roles y permisos |
| `Program` | Programas académicos con precio y módulos |
| `Student` | Estudiantes matriculados |
| `Payment` | Pagos realizados (matrícula o módulo) |
| `PaymentCommitment` | Compromisos de pago pendientes |
| `Module` | Contenido académico por programa |
| `ModuleDelivery` | Registro de entrega de módulos |
| `SystemConfig` | Configuración del sistema |

### Enums Importantes

```prisma
enum PaymentFrequency {
  MENSUAL    // 30 días entre pagos
  QUINCENAL  // 15 días entre pagos
}

enum PaymentType {
  MATRICULA  // Pago inicial, NO entrega módulo
  MODULO     // Pago de módulo, SÍ entrega módulo
}

enum CommitmentStatus {
  PENDIENTE
  PAGADO
  VENCIDO
}

enum StudentStatus {
  MATRICULADO
  ACTIVO
  INACTIVO
  GRADUADO
}
```

### Comandos de BD

```bash
npx prisma generate      # Regenerar cliente Prisma
npx prisma db push       # Push schema a Neon (desarrollo)
npx prisma migrate dev   # Crear migración (producción)
npx prisma studio        # Abrir UI visual de BD
```

---

## 4. REGLAS DE NEGOCIO CRÍTICAS

### 4.1 Flujo de Pagos

```
INSCRIPCIÓN
    └── Estudiante paga MATRÍCULA
        └── NO se entrega ningún módulo
        └── Se crea compromiso para Módulo 1
        └── Fecha = firstCommitmentDate del estudiante

PAGO MÓDULO 1
    └── Estudiante paga valor COMPLETO del módulo
        └── Se entrega Módulo 1
        └── Se crea compromiso para Módulo 2
        └── Fecha = fecha actual + frecuencia (30 o 15 días)

... (repite hasta último módulo)

ÚLTIMO MÓDULO
    └── Estudiante paga
        └── Se entrega último módulo
        └── Saldo = $0, programa completado
```

### 4.2 Cálculos Importantes

```typescript
// Valor por módulo
const valorModulo = (program.totalValue - program.matriculaValue) / program.modulesCount;

// Fecha de taller (5 días antes del próximo pago)
const fechaTaller = addDays(commitment.scheduledDate, -5);

// Siguiente compromiso según frecuencia
const diasSiguiente = student.paymentFrequency === 'MENSUAL' ? 30 : 15;
const siguienteFecha = addDays(new Date(), diasSiguiente);
```

### 4.3 Reglas Estrictas

| Regla | Descripción |
|-------|-------------|
| **NO abonos parciales** | El pago debe ser exacto al valor del módulo |
| **Matrícula NO entrega módulo** | Solo registra al estudiante |
| **Pago completo = Entrega** | Solo se entrega módulo si paga completo |
| **Compromisos uno a uno** | Se genera el siguiente al pagar el actual |
| **Sin intereses** | Los compromisos no generan mora monetaria |

---

## 5. API ENDPOINTS

### Estructura de APIs

```
/api/
├── programs/           # CRUD programas
├── students/           # CRUD estudiantes
│   └── [id]/
│       ├── payments/   # Pagos del estudiante
│       └── summary/    # Resumen con módulos
├── payments/           # CRUD pagos
│   ├── today/          # Pagos del día
│   └── stats/          # Estadísticas
├── commitments/        # Compromisos de pago
│   ├── [id]/
│   │   ├── paid/       # Marcar como pagado
│   │   └── reschedule/ # Reprogramar
│   ├── overdue/        # Vencidos (mora)
│   └── upcoming/       # Próximos
├── reports/            # Reportes
│   ├── recaudo/
│   ├── cartera/
│   └── export/
├── config/             # Configuración sistema
└── whatsapp/           # Notificaciones
```

### Formato de Respuesta

```typescript
// Éxito
{ success: true, data: {...} }

// Error
{ success: false, error: "mensaje", code: "ERROR_CODE" }

// Lista con paginación
{ success: true, data: [...], pagination: { page, limit, total } }
```

---

## 6. CONVENCIONES DE CÓDIGO

### Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Archivos | kebab-case | `student-form.tsx` |
| Componentes | PascalCase | `StudentForm` |
| Funciones | camelCase | `createStudent()` |
| Constantes | SCREAMING_SNAKE | `PAYMENT_TYPES` |
| Interfaces | PascalCase | `Student`, `CreateStudentInput` |
| Hooks | use + PascalCase | `useStudents()` |

### Imports

```typescript
// 1. React/Next
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Librerías externas
import { format } from 'date-fns';
import { z } from 'zod';

// 3. Componentes UI
import { Button } from '@/components/ui/button';

// 4. Módulos internos
import { StudentService } from '@/modules/students/services';

// 5. Types
import type { Student } from '@/modules/students/types';
```

### Componentes React

```typescript
// Preferir function components con TypeScript
interface Props {
  student: Student;
  onSave: (data: StudentInput) => void;
}

export function StudentCard({ student, onSave }: Props) {
  // hooks primero
  const [loading, setLoading] = useState(false);

  // handlers
  const handleSubmit = async () => { ... };

  // render
  return ( ... );
}
```

---

## 7. SERVICIOS Y REPOSITORIOS

### Service (Cliente - fetch a API)

```typescript
// src/modules/students/services/student.service.ts
export const StudentService = {
  async getAll(): Promise<Student[]> {
    const res = await fetch('/api/students');
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async create(data: CreateStudentInput): Promise<Student> {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },
};
```

### Repository (Servidor - Prisma directo)

```typescript
// src/modules/students/repositories/student.repository.ts
import { prisma } from '@/lib/prisma';

export const StudentRepository = {
  async findAll() {
    return prisma.student.findMany({
      include: { program: true, advisor: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: { program: true, payments: true, commitments: true },
    });
  },

  async create(data: Prisma.StudentCreateInput) {
    return prisma.student.create({ data });
  },
};
```

### API Route Handler

```typescript
// src/app/api/students/route.ts
import { NextResponse } from 'next/server';
import { StudentRepository } from '@/modules/students/repositories';

export async function GET() {
  try {
    const students = await StudentRepository.findAll();
    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener estudiantes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validar con Zod
    const validated = studentSchema.parse(body);
    const student = await StudentRepository.create(validated);
    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Error al crear estudiante' },
      { status: 500 }
    );
  }
}
```

---

## 8. VALIDACIONES (ZOD)

```typescript
// src/modules/students/schemas/index.ts
import { z } from 'zod';

export const createStudentSchema = z.object({
  fullName: z.string().min(3, 'Nombre muy corto'),
  documentType: z.enum(['CC', 'TI', 'CE']),
  documentNumber: z.string().min(6),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  programId: z.string().cuid(),
  paymentFrequency: z.enum(['MENSUAL', 'QUINCENAL']),
  firstCommitmentDate: z.coerce.date(),
});

export const createPaymentSchema = z.object({
  studentId: z.string().cuid(),
  amount: z.number().positive(),
  method: z.enum(['BANCOLOMBIA', 'NEQUI', 'DAVIPLATA', 'EFECTIVO']),
  reference: z.string().optional(),
});
```

---

## 9. VISTAS PRINCIPALES

| Vista | Ruta | Descripción |
|-------|------|-------------|
| Dashboard | `/dashboard` | Panel con métricas y resumen |
| Matrículas | `/matriculas` | CRUD de estudiantes |
| Recaudos | `/recaudos` | Pagos + Historial + Cartera (tabs) |
| Reportes | `/reportes` | Reportes con exportación |
| Config | `/admin` | Programas, usuarios, config |

---

## 10. INFRAESTRUCTURA

### Servicios Conectados

| Servicio | Propósito | Config |
|----------|-----------|--------|
| **Vercel** | Hosting/Deploy | Auto-deploy desde `main` |
| **Neon** | PostgreSQL | Branch: `br-weathered-queen-ahqj8sxe` |
| **GitHub** | Repositorio | `lgsalinasp7/appInstituto` |

### Variables de Entorno

```env
# Requeridas
DATABASE_URL="postgresql://..."  # Neon connection string

# Opcionales
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="..."
```

### Deploy

```bash
# El deploy es automático al hacer push a main
git add .
git commit -m "feat: descripción"
git push origin main
# Vercel detecta el push y hace deploy
```

---

## 11. COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev              # Iniciar servidor desarrollo
npm run build            # Build producción
npm run lint             # Verificar código

# Base de datos
npx prisma generate      # Regenerar cliente
npx prisma db push       # Push a Neon
npx prisma studio        # UI visual

# Git
git status               # Ver cambios
git add .                # Agregar cambios
git commit -m "msg"      # Commit
git push origin main     # Push y deploy
```

---

## 12. ARCHIVOS IMPORTANTES

| Archivo | Propósito |
|---------|-----------|
| `prisma/schema.prisma` | Definición de modelos de BD |
| `src/lib/prisma.ts` | Conexión a Neon |
| `src/lib/auth-context.tsx` | Contexto de autenticación |
| `LOGICA_NEGOCIO.md` | Especificación funcional completa |
| `PLAN_LOGICA_NEGOCIO.md` | Plan de implementación |
| `CLAUDE.md` | Este archivo (guía para IA) |

---

## 13. NOTAS PARA IA

### Al modificar la BD
1. Editar `prisma/schema.prisma`
2. Ejecutar `npx prisma db push`
3. Actualizar types en los módulos afectados
4. Actualizar este archivo si hay cambios estructurales

### Al crear nuevos endpoints
1. Crear route handler en `src/app/api/`
2. Crear/actualizar repository en el módulo
3. Crear/actualizar service en el módulo
4. Agregar validación Zod si es necesario

### Al crear componentes
1. Usar componentes de `@/components/ui/` (shadcn)
2. Seguir convenciones de nomenclatura
3. Tipar props con interfaces
4. Manejar estados de loading/error

### Lógica de pagos (CRÍTICO)
- Siempre verificar si es matrícula o módulo
- Validar monto exacto
- Crear compromiso siguiente automáticamente
- Registrar entrega de módulo si aplica

---

*Última actualización: 2026-01-24*
