# Documento de Cambios en Prisma — KaledAcademy v2
## Para compartir con IA en nuevas sesiones

---

## Contexto
Este documento describe los cambios realizados en el schema de Prisma de KaledSoft
para la versión 2 de KaledAcademy. Úsalo al iniciar una nueva sesión con IA para
que entienda el estado actual del sistema.

---

## Cambio principal: AMAXOFT → KaledSoft

**Versión 1:** Los ejemplos del bootcamp usaban "AMAXOFT" como empresa de referencia.
**Versión 2:** Todos los ejemplos usan "KaledSoft Technologies" y sus productos reales:
- **KaledDental** — SaaS de gestión para consultorios odontológicos
- **KaledWash** — SaaS de gestión para lavaderos de autos
- **KaledPark** — SaaS de gestión para parqueaderos
- **KaledSchool** — SaaS de gestión para academias y escuelas

---

## Cambios en el Schema de Prisma

### 1. NO hay cambios estructurales al schema.prisma

Los modelos del schema existente NO requieren modificación. Los cambios son
únicamente en el **seed data** (contenido de las lecciones, analogías, quizzes).

```
✅ Sin nuevas tablas
✅ Sin nuevas columnas
✅ Sin nuevas relaciones
✅ Sin nuevos enums
✅ Sin migración de base de datos requerida
```

### 2. Lo que sí cambia: los datos del seed

El archivo `prisma/seed-kaledacademy-v2.ts` reemplaza al `seed-kaledacademy.ts`
original con los siguientes cambios en los datos:

#### En `AcademyLessonMeta.kaledIntro`
- **Antes:** Referencias a AMAXOFT (empresa colombiana de PYMEs)
- **Ahora:** Referencias a KaledSoft con sus productos reales

**Ejemplo:**
```
ANTES: "...Diagrama de AMAXOFT como caso real..."
AHORA: "...KaledSoft construye SaaS para odontología, lavaderos y parqueaderos.
         KaledDental, KaledWash y KaledPark son los productos de referencia..."
```

#### En `AcademyLessonMeta.analogyText`
- **Antes:** Analogías genéricas sin contexto colombiano específico
- **Ahora:** Analogías usando los productos de KaledSoft como referencia

**Ejemplo:**
```
ANTES: "Un monolito es como un edificio enorme donde todo está adentro..."
AHORA: "KaledSoft usa monolito modular para todos sus productos.
         Un solo repositorio Next.js atiende a KaledDental, KaledWash
         y KaledPark. Simple de desplegar, suficiente para el equipo actual."
```

#### En `AcademyQuiz.question` y opciones
- **Antes:** Preguntas con casos genéricos o con AMAXOFT
- **Ahora:** Preguntas con escenarios reales de KaledDental, KaledWash, KaledPark

**Ejemplo:**
```
ANTES: "¿Cuál es la función principal del DNS?"
AHORA: "KaledWash está en producción. Un cliente reporta que el sistema
         carga muy lento solo para usuarios de Cali pero rápido en Montería.
         ¿Qué componente del viaje DNS→HTTP sospecharías primero?"
```

#### En `AcademyCRALChallenge.description`
- **Antes:** Ejercicios con WhatsApp, Instagram, GitHub API como ejemplos
- **Ahora:** Ejercicios usando el contexto de KaledSoft

**Ejemplo:**
```
ANTES: "Dibuja la arquitectura de WhatsApp: cliente móvil, servidor..."
AHORA: "Diseña el sistema completo de KaledWash: app web para el dueño del
         lavadero, app móvil para el cliente, servidor Next.js, BD Neon,
         integración con WhatsApp para notificaciones, pasarela de pago (Wompi)."
```

#### En `AgentMemory` (memoria de Kaled)
Nueva memoria agregada:
```typescript
{
  category: "empresa_referencia",
  content: `KaledSoft Technologies es la empresa de referencia del bootcamp.
    Construye SaaS para múltiples industrias:
    - KaledDental: gestión de consultorios odontológicos
    - KaledWash: gestión de lavaderos de autos
    - KaledPark: gestión de parqueaderos
    - KaledSchool: gestión de academias y escuelas
    El estudiante construye SaaS propios inspirados en los problemas
    reales que KaledSoft resuelve.`,
  score: 100
}
```

---

## Instrucciones para ejecutar el seed v2

### Opción A: Seed limpio (base de datos vacía)
```bash
# Borrar datos existentes de lecciones del bootcamp
npx prisma db execute --file prisma/cleanup-academy.sql

# Ejecutar seed v2
npx tsx prisma/seed-kaledacademy-v2.ts
```

### Opción B: Seed incremental (preservar datos de estudiantes)
```bash
# Solo actualizar el contenido de lecciones existentes
# (preserva progreso de estudiantes, quizzes respondidos, entregables)
npx tsx prisma/seed-kaledacademy-v2.ts --update-content-only
```

### Script de limpieza (cleanup-academy.sql)
```sql
-- Borrar solo el contenido de lecciones, NO datos de estudiantes
DELETE FROM kaled_student_error_patterns;
DELETE FROM kaled_intent_log;
DELETE FROM kaled_semantic_cache;
DELETE FROM "AcademyCRALCompletion";
DELETE FROM "AcademyQuizResult";
DELETE FROM "AcademyDeliverableSubmission";
DELETE FROM "AcademyDeliverableItem";
DELETE FROM "AcademyDeliverable";
DELETE FROM "AcademyQuizOption";
DELETE FROM "AcademyQuiz";
DELETE FROM "AcademyCRALChallenge";
DELETE FROM "AcademyLessonMeta";
DELETE FROM "AcademyStudentProgress";
DELETE FROM "AcademyLesson";
DELETE FROM "AcademyModule";
-- NO borrar: AcademyEnrollment, AcademyCohort, AcademyCourse, User, Tenant
```

---

## Contexto para IA en nuevas sesiones

Copia este bloque al inicio de cualquier nueva sesión de IA:

```
Hola. Estoy desarrollando KaledAcademy, una plataforma de bootcamp
integrada en KaledSoft Technologies.

EMPRESA DE REFERENCIA DEL BOOTCAMP:
KaledSoft Technologies (kaledsoft.tech) construye SaaS para múltiples industrias:
- KaledDental: SaaS para consultorios odontológicos (citas, historiales, facturación)
- KaledWash: SaaS para lavaderos de autos (órdenes, servicios, clientes, pagos)
- KaledPark: SaaS para parqueaderos (espacios, tarifas, reportes)
- KaledSchool: SaaS para academias (matrículas, pagos, seguimiento)

STACK TÉCNICO:
- Framework: Next.js 16 (App Router, TypeScript)
- Estilos: Tailwind CSS v4
- UI: shadcn/ui
- ORM: Prisma + PostgreSQL en Neon
- Auth: Sistema propio (bcrypt + sessions) — NO Clerk en esta versión
- IA: Vercel AI SDK v6 con AI Gateway
- Pagos: MercadoPago + Wompi
- Deploy: Vercel + Fluid compute

METODOLOGÍA DEL BOOTCAMP:
CRAL = Construir (70%) · Romper (10%) · Auditar (10%) · Lanzar (10%)

ENFOQUE PEDAGÓGICO:
Los desarrolladores en la era de la IA son ARQUITECTOS DE SISTEMAS.
No solo codifican — entienden el sistema completo, usan IA como asistente,
y toman decisiones de arquitectura fundamentadas.

CAMBIO RECIENTE (v2):
AMAXOFT fue reemplazado por KaledSoft como empresa de referencia.
Todos los ejemplos, analogías y ejercicios usan KaledDental, KaledWash
y KaledPark como casos reales de SaaS colombiano.

MODELOS PRISMA RELEVANTES PARA ACADEMIA:
- AcademyCourse, AcademyModule, AcademyLesson, AcademyLessonMeta
- AcademyCRALChallenge, AcademyCRALCompletion
- AcademyQuiz, AcademyQuizOption, AcademyQuizResult
- AcademyDeliverable, AcademyDeliverableItem, AcademyDeliverableSubmission
- AcademyEnrollment, AcademyCohort, AcademyStudentProgress, AcademyStudentSnapshot
- KaledSemanticCache, KaledIntentLog, KaledInstructorTask, KaledCodeReview
- KaledStudentErrorPattern, KaledDeliverableEvaluation, KaledCohortMetrics

Para continuar con: [indica lo que necesitas]
```

---

## Impacto en otros módulos de KaledSoft

El cambio de AMAXOFT a KaledSoft NO afecta:
- Los modelos de Prisma del sistema general (Tenant, User, Role, etc.)
- El sistema de pagos de la plataforma principal
- El CRM (KaledLeads, KaledCampaigns, etc.)
- El módulo de Lavadero Pro (LavaderoCustomer, etc.)
- La autenticación y autorización

Solo afecta el contenido educativo de la academia (los datos del seed).

---

## Remotion — Plan de implementación (próxima fase)

Pendiente implementar en la siguiente sesión:

```
Carpetas a crear:
src/remotion/
├── index.ts
├── Root.tsx
└── compositions/
    ├── shared/ (KaledTheme, CRALCard, CodeBlock)
    ├── modulo1/ (DNSJourney, HTTPFlow, Architecture, GitTimeMachine)
    ├── modulo2/ (ReactVsVanilla, UseStateFlow, NextjsRouter)
    ├── modulo3/ (PrismaORM, N1Problem, AuthVsAuthz, IDOR)
    └── modulo4/ (TokenFlow, WebhookFlow, SaaSPlans)

Dependencias a instalar:
npm install --save-exact remotion@4.0.435 @remotion/player@4.0.435

Uso en la plataforma:
- Las animaciones se muestran inline en la vista de sesión (LessonView.tsx)
- Reemplazan los videos de YouTube que están caídos
- Son editables y versionables en el mismo repositorio de KaledSoft
```

---

*Documento generado: Marzo 2026 — KaledSoft Technologies*
*Próxima actualización: Cuando se implemente Remotion o cambien los modelos de Prisma*
