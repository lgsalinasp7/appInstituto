# PLAN: Módulo de Matrículas - Flujo Completo

> Documento de especificación para el módulo de matrículas con registro de pago integrado.

---

## 1. CONTEXTO DEL PROBLEMA

### Situación Actual (Incorrecta)
```
VENTAS registra datos → Estudiante queda "Matrícula Pendiente" → ❌ NO SE REGISTRA PAGO
```

### Situación Correcta (A Implementar)
```
VENTAS registra datos + pago → Estudiante queda "Matrícula Pagada" → ✅ RECIBO GENERADO
```

---

## 2. ROLES Y RESPONSABILIDADES

### 2.1 Rol: VENTAS (Asesor Comercial)

| Acción | Descripción |
|--------|-------------|
| ✅ Registrar estudiante | Datos personales, contacto, acudiente |
| ✅ Seleccionar programa | El sistema autocompleta valores |
| ✅ Recibir pago de matrícula | $50,000 o $60,000 según programa |
| ✅ Registrar método de pago | Efectivo, Nequi, Bancolombia, etc. |
| ✅ Generar recibo | PDF descargable |
| ✅ Enviar recibo por WhatsApp | Opcional |
| ❌ NO cobra módulos | Eso es responsabilidad de CARTERA |

### 2.2 Rol: CARTERA (Cobranza)

| Acción | Descripción |
|--------|-------------|
| ✅ Ver compromisos pendientes | Filtrados por fecha, estado, asesor |
| ✅ Enviar recordatorios | WhatsApp antes del vencimiento |
| ✅ Registrar pago de módulo | Cuando el estudiante paga |
| ✅ Reprogramar compromisos | Si el estudiante solicita |
| ✅ Ver cartera en mora | Estudiantes con pagos vencidos |
| ❌ NO matricula estudiantes | Eso es responsabilidad de VENTAS |

### 2.3 Rol: ADMINISTRADOR

| Acción | Descripción |
|--------|-------------|
| ✅ Configurar programas | Nombre, valor total, matrícula, módulos |
| ✅ Gestionar usuarios | Crear asesores, asignar roles |
| ✅ Ver reportes globales | Todos los asesores |
| ✅ Configurar sistema | Meta mensual, parámetros |

---

## 3. FLUJO DE MATRÍCULA (VENTAS)

### 3.1 Flujo Visual

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROCESO DE MATRÍCULA (VENTAS)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PASO 1: DATOS DEL ESTUDIANTE                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ • Nombre completo                                                    │   │
│  │ • Tipo y número de documento                                         │   │
│  │ • Teléfono (WhatsApp)                                                │   │
│  │ • Email (opcional)                                                   │   │
│  │ • Dirección (opcional)                                               │   │
│  │ • Datos del acudiente (opcional)                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  PASO 2: PROGRAMA ACADÉMICO                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ • Seleccionar programa → Autocompleta:                               │   │
│  │   - Valor total del programa                                         │   │
│  │   - Valor de matrícula (a pagar HOY)                                 │   │
│  │   - Cantidad de módulos                                              │   │
│  │   - Valor por módulo (calculado)                                     │   │
│  │ • Frecuencia de pago: Mensual / Quincenal                            │   │
│  │ • Fecha primer compromiso (Módulo 1)                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  PASO 3: PAGO DE MATRÍCULA  ← ← ← NUEVO (Integrado)                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │ │  💰 PAGO DE MATRÍCULA                                           │ │   │
│  │ │                                                                 │ │   │
│  │ │  Valor a pagar:  $60,000  (según programa)                      │ │   │
│  │ │                                                                 │ │   │
│  │ │  Método de pago:  [Efectivo ▾]                                  │ │   │
│  │ │                                                                 │ │   │
│  │ │  Referencia:      [________________] (opcional)                 │ │   │
│  │ │                                                                 │ │   │
│  │ └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  PASO 4: CONFIRMACIÓN Y RECIBO                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  ✅ Matrícula registrada exitosamente                               │   │
│  │                                                                     │   │
│  │  Estudiante: Juan Pérez García                                      │   │
│  │  Programa: Técnico en Enfermería                                    │   │
│  │  Matrícula: $60,000 ✓ PAGADA                                        │   │
│  │  Recibo: REC-2026-00001                                             │   │
│  │                                                                     │   │
│  │  Próximo pago: Módulo 1 - $290,000                                  │   │
│  │  Fecha límite: 15 de Febrero de 2026                                │   │
│  │                                                                     │   │
│  │  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐          │   │
│  │  │ 📄 Descargar │  │ 📱 Enviar por    │  │ ✓ Finalizar  │          │   │
│  │  │    PDF       │  │    WhatsApp      │  │              │          │   │
│  │  └──────────────┘  └──────────────────┘  └──────────────┘          │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Lo que sucede al guardar matrícula

```typescript
// Transacción atómica - Todo o nada
async function registrarMatricula(data) {
  return prisma.$transaction(async (tx) => {

    // 1. Crear estudiante
    const student = await tx.student.create({
      data: {
        fullName: data.fullName,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        phone: data.phone,
        email: data.email,
        address: data.address,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        programId: data.programId,
        advisorId: data.advisorId,  // El vendedor actual
        paymentFrequency: data.paymentFrequency,
        firstCommitmentDate: data.firstCommitmentDate,
        enrollmentDate: new Date(),  // HOY
        matriculaPaid: true,  // ✅ Ya pagó
        currentModule: 0,     // Aún no tiene módulos
        status: "MATRICULADO",
        totalProgramValue: program.totalValue,
        initialPayment: program.matriculaValue,
      }
    });

    // 2. Registrar pago de matrícula
    const payment = await tx.payment.create({
      data: {
        studentId: student.id,
        amount: program.matriculaValue,
        paymentDate: new Date(),
        method: data.paymentMethod,
        reference: data.paymentReference,
        paymentType: "MATRICULA",  // Tipo: Matrícula
        moduleNumber: null,         // No aplica para matrícula
        receiptNumber: generateReceiptNumber(),
        registeredById: data.advisorId,
      }
    });

    // 3. Crear primer compromiso (Módulo 1)
    const valorModulo = (program.totalValue - program.matriculaValue) / program.modulesCount;

    await tx.paymentCommitment.create({
      data: {
        studentId: student.id,
        amount: valorModulo,
        scheduledDate: data.firstCommitmentDate,
        moduleNumber: 1,
        status: "PENDIENTE",
      }
    });

    // 4. Retornar datos para el recibo
    return {
      student,
      payment,
      program,
    };
  });
}
```

---

## 4. CAMBIOS REQUERIDOS EN EL FORMULARIO

### 4.1 Formulario Actual vs Nuevo

| Sección | Actual | Nuevo |
|---------|--------|-------|
| Datos personales | ✅ OK | Sin cambios |
| Datos de contacto | ✅ OK | Sin cambios |
| Datos del acudiente | ✅ OK | Sin cambios |
| Información académica | ✅ OK | Sin cambios |
| Información financiera | ⚠️ Incompleto | Agregar sección de pago |
| **Pago de matrícula** | ❌ NO EXISTE | **AGREGAR** |

### 4.2 Nueva Sección: Pago de Matrícula

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  💰 PAGO DE MATRÍCULA                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  El estudiante debe pagar la matrícula para completar la            │   │
│  │  inscripción. Este pago se registra automáticamente.                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Valor de Matrícula *                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  $ 60,000                                          (Solo lectura)   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Método de Pago *                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Efectivo ▾]                                                       │   │
│  │   - Efectivo                                                        │   │
│  │   - Nequi                                                           │   │
│  │   - Bancolombia                                                     │   │
│  │   - Daviplata                                                       │   │
│  │   - Transferencia                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Referencia / Comprobante (opcional)                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Ej: Número de transacción Nequi                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. MODAL DE CONFIRMACIÓN (Nuevo)

Después de guardar exitosamente, mostrar un modal con:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                        [X]  │
│                                                                             │
│                           ✅ ¡Matrícula Exitosa!                            │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  RECIBO DE PAGO                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │  Recibo No:        REC-2026-00001                                   │   │
│  │  Fecha:            27 de Enero de 2026                              │   │
│  │                                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │  Estudiante:       Juan Pérez García                                │   │
│  │  Documento:        CC 1234567890                                    │   │
│  │  Programa:         Técnico en Enfermería                            │   │
│  │                                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │  Concepto:         Pago de Matrícula                                │   │
│  │  Método:           Efectivo                                         │   │
│  │                                                                     │   │
│  │  TOTAL PAGADO:     $60,000                                    ✓    │   │
│  │                                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │  📅 PRÓXIMO PAGO                                                    │   │
│  │  Módulo 1: $290,000                                                 │   │
│  │  Fecha límite: 27 de Febrero de 2026                                │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐   │
│  │  📄 Descargar PDF  │  │  📱 Enviar por     │  │  ✓ Finalizar       │   │
│  │                    │  │     WhatsApp       │  │                    │   │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. CAMBIOS EN LA TABLA DE MATRÍCULAS

### 6.1 Columnas Actualizadas

| Columna | Antes | Después |
|---------|-------|---------|
| Estudiante | ✅ OK | Sin cambios |
| Programa | ✅ OK | Sin cambios |
| Matrícula | "Pendiente/Pagada" | Siempre "Pagada" ✅ (porque se paga al inscribir) |
| Módulo Actual | "1/6" | Sin cambios |
| Estado | "matriculado" | Sin cambios |
| Acciones | Ver, Editar, Eliminar | Agregar: **Ver Recibo** |

### 6.2 Nueva Acción: Ver Recibo de Matrícula

En el modal de detalle del estudiante, agregar botones para:
- 📄 Descargar PDF del recibo de matrícula
- 📱 Reenviar recibo por WhatsApp

---

## 7. API ENDPOINTS AFECTADOS

### 7.1 Endpoint a Modificar: POST /api/students

**Antes:**
- Solo crea el estudiante
- No registra pago
- No crea compromiso

**Después:**
- Crea estudiante con `matriculaPaid: true`
- Registra pago tipo MATRICULA
- Crea primer compromiso (Módulo 1)
- Retorna datos del recibo

### 7.2 Nuevo Payload del Endpoint

```typescript
// POST /api/students
{
  // Datos del estudiante (existentes)
  fullName: "Juan Pérez García",
  documentType: "CC",
  documentNumber: "1234567890",
  phone: "3001234567",
  email: "juan@email.com",
  address: "Calle 123",
  guardianName: "María García",
  guardianPhone: "3009876543",
  programId: "clxxxx",
  paymentFrequency: "MENSUAL",
  firstCommitmentDate: "2026-02-27",

  // NUEVOS - Datos del pago de matrícula
  paymentMethod: "EFECTIVO",      // Método de pago
  paymentReference: "TX123456",   // Referencia (opcional)
}
```

### 7.3 Nueva Respuesta del Endpoint

```typescript
// Respuesta exitosa
{
  success: true,
  data: {
    student: { ... },
    payment: {
      id: "clxxxx",
      receiptNumber: "REC-2026-00001",
      amount: 60000,
      paymentDate: "2026-01-27T...",
      method: "EFECTIVO",
    },
    commitment: {
      id: "clxxxx",
      moduleNumber: 1,
      amount: 290000,
      scheduledDate: "2026-02-27",
    }
  },
  message: "Matrícula registrada exitosamente"
}
```

---

## 8. ARCHIVOS A MODIFICAR

### 8.1 Frontend

| Archivo | Cambio |
|---------|--------|
| `src/modules/students/components/StudentForm.tsx` | Agregar sección de pago de matrícula |
| `src/modules/students/schemas/index.ts` | Agregar campos de pago al schema |
| `src/modules/students/components/ReceiptConfirmationModal.tsx` | **CREAR** - Modal de confirmación con recibo |
| `src/app/(protected)/matriculas/page.tsx` | Integrar modal de confirmación |

### 8.2 Backend

| Archivo | Cambio |
|---------|--------|
| `src/app/api/students/route.ts` | Modificar POST para incluir pago y compromiso |
| `src/modules/students/services/student.service.ts` | Actualizar lógica de creación |
| `src/modules/students/repositories/student.repository.ts` | Agregar transacción con pago |

### 8.3 Componentes Compartidos

| Archivo | Cambio |
|---------|--------|
| `src/modules/receipts/components/ReceiptPDF.tsx` | Ya existe ✅ |
| `src/modules/receipts/services/receipt.service.ts` | Verificar generación de número de recibo |

---

## 9. TAREAS DE IMPLEMENTACIÓN

### Sprint: Flujo de Matrícula Completo

| # | Tarea | Prioridad | Estimación |
|---|-------|-----------|------------|
| 1 | Agregar campos de pago al schema Zod | 🔴 Alta | - |
| 2 | Agregar sección "Pago de Matrícula" al formulario | 🔴 Alta | - |
| 3 | Modificar API POST /api/students para registrar pago | 🔴 Alta | - |
| 4 | Crear modal de confirmación con recibo | 🔴 Alta | - |
| 5 | Implementar descarga de PDF desde el modal | 🔴 Alta | - |
| 6 | Implementar envío por WhatsApp desde el modal | 🟡 Media | - |
| 7 | Agregar botones de recibo en StudentDetailModal | 🟡 Media | - |
| 8 | Probar flujo completo | 🔴 Alta | - |

---

## 10. VALIDACIONES DE NEGOCIO

### 10.1 Reglas de Validación

| Regla | Descripción |
|-------|-------------|
| Documento único | No puede existir otro estudiante con el mismo documento |
| Programa activo | El programa seleccionado debe estar activo |
| Método de pago | Debe seleccionar un método de pago válido |
| Fecha compromiso | Debe ser una fecha futura |
| Teléfono válido | Formato de teléfono colombiano (10 dígitos) |

### 10.2 Mensajes de Error

| Error | Mensaje |
|-------|---------|
| Documento duplicado | "Ya existe un estudiante con este número de documento" |
| Programa inactivo | "El programa seleccionado no está disponible" |
| Sin método de pago | "Debe seleccionar un método de pago" |
| Fecha inválida | "La fecha del primer compromiso debe ser futura" |

---

## 11. PERMISOS POR ROL

```typescript
// Configuración de permisos
const PERMISSIONS = {
  VENTAS: {
    matriculas: ['create', 'read', 'update'],  // Puede matricular
    recaudos: [],                               // NO puede cobrar módulos
    reportes: ['read_own'],                     // Solo sus matrículas
  },
  CARTERA: {
    matriculas: ['read'],                       // Solo ver
    recaudos: ['create', 'read', 'update'],    // Puede cobrar módulos
    reportes: ['read_own'],                     // Solo su cartera
  },
  ADMINISTRADOR: {
    matriculas: ['create', 'read', 'update', 'delete'],
    recaudos: ['create', 'read', 'update', 'delete'],
    reportes: ['read_all', 'export'],
    config: ['read', 'update'],
  },
  SUPERADMIN: {
    // Todos los permisos
    '*': ['*'],
  },
};
```

---

## 12. RESUMEN EJECUTIVO

### El problema:
El rol de VENTAS registra estudiantes pero NO registra el pago de matrícula, dejando al estudiante como "Matrícula Pendiente" cuando en realidad ya pagó.

### La solución:
Integrar el registro de pago de matrícula directamente en el formulario de inscripción, para que al guardar:
1. Se cree el estudiante
2. Se registre el pago
3. Se genere el recibo
4. Se cree el primer compromiso

### Beneficios:
- Flujo más natural para el vendedor (un solo paso)
- El estudiante se va con su recibo
- La cartera tiene datos completos desde el inicio
- Reportes de recaudo precisos

---

*Documento creado: 2026-01-27*
*Versión: 1.0*
