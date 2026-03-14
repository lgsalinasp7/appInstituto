# KaledAcademy — Arquitectura dentro de KaledSoft

## 1. Relación Tenant ↔ KaledAcademy

KaledAcademy es un **tenant específico** dentro de la plataforma KaledSoft.
Igual que "Lavadero Pro" tiene sus propios modelos prefijados con `Lavadero`,
la academia usa el prefijo `Academy` y aprovecha los modelos base existentes.

```
KaledSoft Platform
├── Tenant { slug: "kaledacademy" }   ← El tenant de la academia
│   ├── Tenant.academyCourses[]        ← Los cursos del bootcamp
│   ├── Tenant.academyCohorts[]        ← Las cohortes (grupos de estudiantes)
│   ├── Tenant.users[]                 ← Estudiantes, instructores, admins
│   ├── Tenant.aiConversations[]       ← Chats con Kaled (tutor IA)
│   └── Tenant.aiUsage[]               ← Control de tokens de IA
│
├── User.platformRole = ACADEMY_STUDENT | ACADEMY_TEACHER | ACADEMY_ADMIN
└── Invitation.academyRole = "ACADEMY_STUDENT" | "ACADEMY_TEACHER"
```

## 2. Modelos existentes que usa KaledAcademy SIN modificar

| Modelo KaledSoft | Uso en KaledAcademy |
|---|---|
| `Tenant` | El tenant `kaledacademy` con su branding |
| `User` | Estudiantes (platformRole=ACADEMY_STUDENT), instructores |
| `Role` | Roles internos del tenant academia |
| `AcademyCourse` | El bootcamp AI SaaS Engineering (1 curso activo) |
| `AcademyModule` | Módulos 1-4 del bootcamp |
| `AcademyLesson` | Las 48 sesiones (S1..S48) |
| `AcademyLessonTask` | Tareas CONSTRUIR/ROMPER/AUDITAR/LANZAR |
| `AcademyTaskCompletion` | Registro de completado |
| `AcademyEnrollment` | Matrícula estudiante → curso → cohorte |
| `AcademyStudentProgress` | Progreso por lección (video %, tiempo) |
| `AcademyCohort` | Cohorte activa (grupo Lun/Mié/Vie) |
| `AcademyCohortEvent` | Eventos del calendario |
| `AcademyAssessment` | Evaluaciones del bootcamp |
| `AcademyAssessmentResult` | Resultados por estudiante |
| `AiConversation` | Conversaciones con Kaled tutor IA |
| `AiMessage` | Mensajes + tracking de tokens |
| `AiUsage` | Consumo de IA por tenant/período |
| `AgentMemory` | Memoria del agente Kaled (agentType=KALED) |
| `Invitation` | Invitar estudiantes (academyRole field) |
| `TenantBranding` | Branding oscuro #161A22 de KaledAcademy |

## 3. Modelos NUEVOS que agrega KaledAcademy (academy.prisma)

| Modelo nuevo | Propósito |
|---|---|
| `AcademyLessonMeta` | Metadata de sesión: semana, día, analogía, intro Kaled |
| `AcademyCRALChallenge` | Reto CRAL por sesión (Construir/Romper/Auditar/Lanzar) |
| `AcademyCRALCompletion` | Registro de completado CRAL por estudiante |
| `AcademyQuiz` | Quiz de verificación de comprensión |
| `AcademyQuizOption` | Opciones A/B/C/D del quiz |
| `AcademyQuizResult` | Respuesta del estudiante |
| `AcademyDeliverable` | Entregable semanal con checklist |
| `AcademyDeliverableItem` | Ítem del checklist |
| `AcademyDeliverableSubmission` | Envío + calificación del instructor |
| `AcademyKaledSession` | Contexto academia para conversación con Kaled |
| `AcademyStudentSnapshot` | Dashboard aggregado por estudiante (eficiencia) |
| `AcademySaasProject` | Proyecto SaaS del estudiante |
| `AcademySaasUpdate` | Actualización semanal del proyecto |
| `AcademyDemoDayResult` | Resultado de la defensa técnica final |
| `AcademyBadge` | Badges de gamificación |
| `AcademyBadgeEarned` | Badges ganados por estudiante |
| `AcademyAnnouncement` | Anuncios del instructor a la cohorte |

## 4. Estructura de carpetas sugerida en KaledSoft

```
apps/
└── kaledacademy/
    ├── app/
    │   ├── (auth)/                     ← Login/Register (comparte con KaledSoft)
    │   ├── dashboard/                  ← Dashboard del estudiante
    │   │   ├── page.tsx
    │   │   ├── layout.tsx
    │   │   └── components/
    │   ├── cursos/
    │   │   ├── [courseId]/
    │   │   │   └── modulos/
    │   │   │       └── [moduleId]/
    │   │   │           └── sesiones/
    │   │   │               └── [lessonId]/
    │   │   │                   └── page.tsx  ← Vista de sesión con Kaled
    │   ├── proyecto/                   ← Mi proyecto SaaS
    │   ├── comunidad/
    │   └── api/
    │       ├── courses/route.ts
    │       ├── lessons/[lessonId]/
    │       │   ├── route.ts
    │       │   ├── complete/route.ts
    │       │   └── video/route.ts
    │       ├── quizzes/[quizId]/answer/route.ts
    │       ├── cral/[challengeId]/complete/route.ts
    │       ├── deliverables/
    │       │   ├── [deliverableId]/submit/route.ts
    │       │   └── [submissionId]/review/route.ts
    │       ├── cohorts/
    │       │   ├── active/route.ts
    │       │   └── [cohortId]/
    │       │       ├── ranking/route.ts
    │       │       └── analytics/route.ts
    │       ├── projects/route.ts
    │       ├── ai/kaled/route.ts       ← Streaming con Kaled
    │       ├── badges/route.ts
    │       └── demo-day/[projectId]/result/route.ts
    ├── services/
    │   ├── academy.service.ts          ← Lógica de negocio
    │   └── academy.api.ts              ← Handlers de API Routes
    ├── schema/
    │   └── academy.prisma              ← Extensión del schema KaledSoft
    ├── components/
    │   ├── KaledChat/                  ← Widget del tutor IA
    │   ├── LessonView/                 ← Vista de sesión completa
    │   ├── CRALCard/                   ← Tarjetas CRAL
    │   ├── QuizCard/                   ← Quiz interactivo
    │   ├── DeliverableChecklist/
    │   ├── ProgressSidebar/
    │   └── StudentDashboard/
    └── lib/
        └── academy-types.ts            ← Tipos TypeScript específicos

prisma/
└── schema.prisma                       ← Schema unificado KaledSoft + Academy
    (agregar contenido de academy.prisma al final del schema existente,
     y agregar las relaciones inversas a User, Tenant, AcademyLesson, etc.)
```

## 5. Adiciones al schema.prisma principal (relaciones inversas)

Al agregar los nuevos modelos, debes extender los modelos existentes:

### En el modelo `Tenant` agregar:
```prisma
// KaledAcademy extensiones
academyLessonMetas     AcademyLessonMeta[]
academyCRALChallenges  AcademyCRALChallenge[]
academyQuizzes         AcademyQuiz[]
academyDeliverables    AcademyDeliverable[]
academyKaledSessions   AcademyKaledSession[]
academyStudentSnapshots AcademyStudentSnapshot[]
academySaasProjects    AcademySaasProject[]
academyDemoDayResults  AcademyDemoDayResult[]
academyBadges          AcademyBadge[]
academyAnnouncements   AcademyAnnouncement[]
```

### En el modelo `User` agregar:
```prisma
// KaledAcademy extensiones
academyCRALCompletions    AcademyCRALCompletion[]
academyQuizResults        AcademyQuizResult[]
academyDeliverableSubmissions AcademyDeliverableSubmission[]
academyDeliverableReviews AcademyDeliverableSubmission[] @relation("DeliverableReviewer")
academyKaledSessions      AcademyKaledSession[]
academyStudentSnapshots   AcademyStudentSnapshot[]
academySaasProjects       AcademySaasProject[]
academyBadgesEarned       AcademyBadgeEarned[]
academyAnnouncements      AcademyAnnouncement[]
```

### En el modelo `AcademyLesson` agregar:
```prisma
meta          AcademyLessonMeta?
cralChallenges AcademyCRALChallenge[]
quizzes       AcademyQuiz[]
deliverables  AcademyDeliverable[]
kaledSessions AcademyKaledSession[]
```

### En el modelo `AcademyModule` agregar:
```prisma
kaledSessions AcademyKaledSession[]
```

### En el modelo `AcademyCohort` agregar:
```prisma
kaledSessions    AcademyKaledSession[]
studentSnapshots AcademyStudentSnapshot[]
saasProjects     AcademySaasProject[]
demoDayResults   AcademyDemoDayResult[]
announcements    AcademyAnnouncement[]
```

### En el modelo `AcademyEnrollment` agregar:
```prisma
snapshot AcademyStudentSnapshot?
```

## 6. Variables de entorno específicas de KaledAcademy

```env
# Heredadas de KaledSoft (ya existen)
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Específicas de KaledAcademy
OPENAI_API_KEY=                 # Para Kaled tutor IA
ANTHROPIC_API_KEY=              # Alternativa Claude para Kaled
KALED_AI_MODEL=gpt-4o-mini     # Modelo por defecto del tutor

# Tenant identificador
ACADEMY_TENANT_SLUG=kaledacademy
```

## 7. Flujo completo de un estudiante en la plataforma

```
Registro/Invitación (Invitation.academyRole = ACADEMY_STUDENT)
    ↓
User creado con platformRole = ACADEMY_STUDENT
    ↓
AcademyEnrollment { userId, courseId, cohortId, status: ACTIVE }
    ↓
AcademyStudentSnapshot creado con progreso 0
    ↓
Estudiante accede a Dashboard → ve Módulos → entra a Sesión
    ↓
Por cada Sesión (AcademyLesson):
  ├── Lee el contenido (AcademyLessonMeta.kaledIntro, analogía)
  ├── Interactúa con conceptos clickeables (AcademyLessonMeta.concepts)
  ├── Ve el video de YouTube recomendado
  ├── Completa retos CRAL (AcademyCRALCompletion)
  ├── Responde el Quiz (AcademyQuizResult)
  ├── Consulta a Kaled (AcademyKaledSession → AiConversation)
  ├── Marca la sesión como vista (AcademyStudentProgress)
  └── Entrega el entregable de la semana (AcademyDeliverableSubmission)
    ↓
Instructor revisa entregable → califica → APROBADO/RECHAZADO
    ↓
Badge checker automático → nuevos badges si aplica
    ↓
AcademyStudentSnapshot recalculado
    ↓
Semana 16 → Demo Day → AcademyDemoDayResult
    ↓
AcademySaasProject.status = LANZADO
    ↓
Badge: DEMO_DAY_PASSED
```

## 8. Configuración del agente Kaled

El agente Kaled usa `AgentMemory` (modelo existente en KaledSoft) con:
- `agentType: KALED`
- `tenantId: <id del tenant kaledacademy>`
- `category: "estrategia_pedagogica" | "analogias" | "respuestas_frecuentes"`

Esto permite que Kaled aprenda de las conversaciones más efectivas
y mejore su estrategia pedagógica automáticamente.
