# DOCUMENTO DE IMPLEMENTACION: MVP Embudo de Ventas Calet Academy

## Tabla de Contenidos

0. [Fase 0: Blindaje de Costos de Tokens (Prerrequisito)](#0-fase-0-blindaje-de-costos-de-tokens)
1. [Contexto y Objetivo](#1-contexto-y-objetivo)
2. [Decisiones Tecnicas](#2-decisiones-tecnicas)
3. [Fase 1: Base de Datos + CRM Pipeline](#3-fase-1-base-de-datos--crm-pipeline)
4. [Fase 2: WhatsApp Business API + Email Marketing](#4-fase-2-whatsapp-business-api--email-marketing)
5. [Fase 3: Landing Pages Publicas](#5-fase-3-landing-pages-publicas)
6. [Fase 4: Agentes IA (Margy + Kaled) + Kanban](#6-fase-4-agentes-ia-margy--kaled--kanban)
7. [Variables de Entorno](#7-variables-de-entorno)
8. [Verificacion End-to-End](#8-verificacion-end-to-end)

---

## 0. Fase 0: Blindaje de Costos de Tokens

> **PRERREQUISITO:** Estas 8 capas de proteccion DEBEN estar activas antes de habilitar los agentes Margy/Kaled en produccion.

### Pipeline completo de un request IA:

```
Mensaje del usuario
       |
[1. Session Guard] -> Limite excedido? -> Retornar mensaje amable (0 tokens)
       |
[2. Router Agent] -> Saludo/Spam? -> Respuesta local (0 tokens)
       |
[3. Response Cache] -> Cache hit? -> Retornar cached (0 tokens)
       |
[4. Context Pruning] -> Resumir mensajes viejos (costo minimo)
       |
[5. RAG] -> Agregar fragmentos de documentos relevantes
       |
[6. Model con Fallback] -> Groq -> Gemini -> OpenRouter (con maxTokens cap)
       |
[7. Cache Response] -> Si es cacheable, guardar para futuro
       |
[8. Record Usage] -> Registrar tokens, modelo, costo
```

### Resumen de capas implementadas:

| Capa | Servicio | Ahorro |
|------|----------|--------|
| maxTokens | `MODEL_BUDGETS` en agent.types.ts | 15-25% output |
| Context Pruning | `ContextPruningService` | 40-70% input (convos largas) |
| Model Fallback | `ModelProviderService` (Groq->Gemini->OpenRouter) | Resiliencia |
| OpenRouter Proxy | Limite diario en USD via dashboard | Tope duro de gasto |
| Router Agent | `RouterAgentService` (llama-3.1-8b-instant) | 10-20% (filtra basura) |
| Response Cache | `ResponseCacheService` + AiResponseCache | 30-50% (queries repetidas) |
| Session Limits | `SessionGuardService` (30/conv, 50/dia) | Previene abuso |
| RAG/Embeddings | `RAGService` + pgvector | Contexto relevante sin texto completo |

### Variables de entorno requeridas:

```env
GROQ_API_KEY=gsk_...                    # Proveedor principal (gratis 15M/dia)
GOOGLE_GENERATIVE_AI_API_KEY=AIza...    # Fallback (gratis 250M/mes)
OPENROUTER_API_KEY=sk-or-v1-...         # Fallback pago (limite diario)
OPENROUTER_DAILY_LIMIT=0.50             # USD, configurable en openrouter.ai
```

---

## 1. Contexto y Objetivo

**Problema:** Calet Academy necesita matricular 30 estudiantes en 30 dias. Actualmente KaledSoft tiene un modulo de prospectos basico (4 estados, sin embudo visual) y un servicio de WhatsApp minimo (solo texto plano).

**Solucion:** Construir un MVP completo de embudo de ventas que conecte:
- CRM con pipeline visual Kanban (11 etapas de embudo)
- WhatsApp Business API (Meta Cloud) para comunicacion automatizada
- Landing pages publicas para captura de leads desde Meta Ads
- Secuencias de email automatizadas con Resend
- 2 agentes de IA especializados: **Margy** (captadora) y **Kaled** (cerrador)
- Tablero Kanban de tareas de agentes (solo admin plataforma)

**Matematica del embudo:**
- Meta: 30 matriculados
- Tasa de cierre: 15% -> necesitamos 200 leads calificados en llamada
- Para 200 en llamada necesitamos ~1,000 leads totales
- 30-40 leads diarios durante 30 dias

**Marca:** Calet Academy (valores cristianos implicitos, marketing profesional/aspiracional)
**Mensaje:** "No formamos estudiantes promedio. Formamos desarrolladores con espiritu diferente."

---

## 2. Decisiones Tecnicas

| Decision | Eleccion | Razon |
|----------|----------|-------|
| WhatsApp API | Meta Cloud API | Gratis 1,000 conv/mes, oficial |
| Landing Pages | Dentro de Next.js (`/lp/*`) | Control total, misma BD, leads directo al CRM |
| IA principal | Claude (Anthropic) | Mejor razonamiento para agentes |
| IA fallback | Gemini (Google) | Ya configurado, ahorrar costos |
| Email | Resend + plantillas HTML | Ya configurado, 3,000 gratis/mes |
| Kanban drag&drop | @dnd-kit | Ligero, React 19 compatible |
| Agentes | Margy (captadora) + Kaled (cerrador) | 2 roles especificos del embudo |
| Acceso Kanban agentes | Solo admin plataforma | Simplicidad MVP |

**Dependencias nuevas a instalar:**
```bash
npm install @ai-sdk/anthropic @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## 3. Fase 1: Base de Datos + CRM Pipeline

### Paso 1.1: Nuevos Enums en Prisma

**Archivo:** `prisma/schema.prisma`
**Accion:** Agregar DESPUES de los enums existentes (despues de linea 428)

```prisma
// ============================================
// ENUMS EMBUDO DE VENTAS
// ============================================

enum FunnelStage {
  NUEVO
  CONTACTADO
  INTERESADO
  MASTERCLASS_REGISTRADO
  MASTERCLASS_ASISTIO
  APLICACION
  LLAMADA_AGENDADA
  LLAMADA_REALIZADA
  NEGOCIACION
  MATRICULADO
  PERDIDO
}

enum LeadTemperature {
  FRIO
  TIBIO
  CALIENTE
}

enum LeadSource {
  LANDING_PAGE
  WHATSAPP
  REFERIDO
  REDES_SOCIALES
  LLAMADA
  EMAIL
  OTRO
}

enum InteractionType {
  LLAMADA
  WHATSAPP_ENVIADO
  WHATSAPP_RECIBIDO
  EMAIL_ENVIADO
  EMAIL_RECIBIDO
  NOTA
  CAMBIO_ETAPA
  REUNION
  MASTERCLASS
  SISTEMA
}

enum MessageDirection {
  INBOUND
  OUTBOUND
}

enum WaMessageStatus {
  PENDING
  SENT
  DELIVERED
  READ
  FAILED
}

enum AgentTaskStatus {
  PENDIENTE
  EN_PROCESO
  COMPLETADA
  MEJORA
}

enum AgentType {
  MARGY
  KALED
}
```

### Paso 1.2: Modificar Modelo Prospect

**Archivo:** `prisma/schema.prisma` lineas 274-293
**Accion:** REEMPLAZAR el modelo Prospect completo

```prisma
model Prospect {
  id              String           @id @default(cuid())
  name            String
  phone           String
  email           String?

  // Embudo de ventas
  funnelStage     FunnelStage      @default(NUEVO)
  temperature     LeadTemperature  @default(FRIO)
  source          LeadSource       @default(OTRO)
  sourceDetail    String?          // ej: "Landing Masterclass Feb", "Instagram Ad #123"
  score           Int              @default(0)     // Lead scoring 0-100

  // Campo legacy (mantener compatibilidad)
  status          ProspectStatus   @default(CONTACTADO)

  observations    String?
  programId       String?
  advisorId       String

  // Seguimiento
  lastContactAt   DateTime?
  nextFollowUpAt  DateTime?
  lostReason      String?          // Solo cuando funnelStage=PERDIDO

  // UTM Tracking (para Meta Ads)
  utmSource       String?
  utmMedium       String?
  utmCampaign     String?
  utmContent      String?

  // Datos adicionales
  city            String?
  occupation      String?          // "Estudiante universitario", "Profesional", etc.

  // Masterclass
  masterclassId         String?
  masterclassRegisteredAt DateTime?
  masterclassAttendedAt   DateTime?

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  tenantId        String

  advisor         User             @relation(fields: [advisorId], references: [id])
  program         Program?         @relation(fields: [programId], references: [id])
  tenant          Tenant           @relation(fields: [tenantId], references: [id])

  // Nuevas relaciones
  interactions     ProspectInteraction[]
  whatsappMessages WhatsAppMessage[]
  emailLogs        EmailLog[]
  agentTasks       AgentTask[]

  @@index([funnelStage])
  @@index([temperature])
  @@index([source])
  @@index([score])
  @@index([status])
  @@index([advisorId])
  @@index([programId])
  @@index([tenantId])
  @@index([lastContactAt])
  @@index([nextFollowUpAt])
}
```

### Paso 1.3: Nuevos Modelos

**Archivo:** `prisma/schema.prisma`
**Accion:** Agregar despues del modelo Prospect modificado

```prisma
// ============================================
// MODELO: Interacciones con Prospectos (Timeline)
// ============================================
model ProspectInteraction {
  id          String          @id @default(cuid())
  type        InteractionType
  content     String          @db.Text
  metadata    Json?           // Datos flexibles (duracion llamada, template usado, etc.)
  prospectId  String
  advisorId   String?         // null para interacciones del sistema/agente
  agentType   AgentType?      // Cual agente IA creo esto
  createdAt   DateTime        @default(now())
  tenantId    String

  prospect    Prospect        @relation(fields: [prospectId], references: [id], onDelete: Cascade)
  advisor     User?           @relation("InteractionAdvisor", fields: [advisorId], references: [id])
  tenant      Tenant          @relation(fields: [tenantId], references: [id])

  @@index([prospectId])
  @@index([type])
  @@index([advisorId])
  @@index([tenantId])
  @@index([createdAt])
}

// ============================================
// MODELO: Mensajes de WhatsApp
// ============================================
model WhatsAppMessage {
  id            String          @id @default(cuid())
  waMessageId   String?         @unique   // ID de Meta para tracking
  direction     MessageDirection
  phone         String
  content       String          @db.Text
  templateName  String?         // null para mensajes de texto libre
  status        WaMessageStatus @default(PENDING)
  metadata      Json?           // Respuesta completa de API, errores
  prospectId    String?
  tenantId      String
  sentAt        DateTime        @default(now())
  deliveredAt   DateTime?
  readAt        DateTime?

  prospect      Prospect?       @relation(fields: [prospectId], references: [id])
  tenant        Tenant          @relation(fields: [tenantId], references: [id])

  @@index([waMessageId])
  @@index([phone])
  @@index([prospectId])
  @@index([tenantId])
  @@index([direction])
  @@index([status])
  @@index([sentAt])
}

// ============================================
// MODELO: Plantillas de Email
// ============================================
model EmailTemplate {
  id          String   @id @default(cuid())
  name        String               // "bienvenida", "recordatorio_masterclass", etc.
  subject     String
  htmlContent String   @db.Text    // HTML con {{variable}} placeholders
  variables   String[]             // ["nombre", "fecha_masterclass", "enlace"]
  isActive    Boolean  @default(true)
  tenantId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  emailLogs   EmailLog[]

  @@unique([name, tenantId])
  @@index([name])
  @@index([tenantId])
  @@index([isActive])
}

// ============================================
// MODELO: Secuencias de Email Automatizadas
// ============================================
model EmailSequence {
  id            String              @id @default(cuid())
  name          String              // "Secuencia Post-Registro"
  triggerStage  FunnelStage         // Que etapa dispara esta secuencia
  isActive      Boolean             @default(true)
  tenantId      String
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  tenant        Tenant              @relation(fields: [tenantId], references: [id])
  steps         EmailSequenceStep[]

  @@unique([name, tenantId])
  @@index([triggerStage])
  @@index([tenantId])
}

model EmailSequenceStep {
  id            String        @id @default(cuid())
  sequenceId    String
  templateId    String        // Referencia al EmailTemplate a usar
  orderIndex    Int           // 0, 1, 2... orden de envio
  delayHours    Int           // Horas de espera despues del paso anterior (o del trigger)
  createdAt     DateTime      @default(now())

  sequence      EmailSequence @relation(fields: [sequenceId], references: [id], onDelete: Cascade)

  @@index([sequenceId])
  @@index([orderIndex])
}

// ============================================
// MODELO: Log de Emails Enviados
// ============================================
model EmailLog {
  id          String         @id @default(cuid())
  to          String
  subject     String
  templateId  String?
  prospectId  String?
  status      String         @default("SENT") // SENT, DELIVERED, OPENED, CLICKED, BOUNCED, FAILED
  resendId    String?        // ID de Resend para tracking
  metadata    Json?
  tenantId    String
  sentAt      DateTime       @default(now())

  template    EmailTemplate? @relation(fields: [templateId], references: [id])
  prospect    Prospect?      @relation(fields: [prospectId], references: [id])
  tenant      Tenant         @relation(fields: [tenantId], references: [id])

  @@index([prospectId])
  @@index([templateId])
  @@index([tenantId])
  @@index([status])
  @@index([sentAt])
}

// ============================================
// MODELO: Masterclasses
// ============================================
model Masterclass {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  scheduledAt DateTime
  duration    Int      @default(60)  // minutos
  meetingUrl  String?  // Zoom/Google Meet link
  isActive    Boolean  @default(true)
  slug        String   // URL-friendly para landing page
  tenantId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant   @relation(fields: [tenantId], references: [id])

  @@unique([slug, tenantId])
  @@index([scheduledAt])
  @@index([tenantId])
  @@index([isActive])
}

// ============================================
// MODELO: Tareas de Agentes IA (Kanban)
// ============================================
model AgentTask {
  id            String          @id @default(cuid())
  title         String
  description   String          @db.Text
  status        AgentTaskStatus @default(PENDIENTE)
  agentType     AgentType       // MARGY o KALED
  priority      Int             @default(0)  // 0=normal, 1=alta, 2=urgente
  result        String?         @db.Text     // Resultado de la tarea
  prospectId    String?
  metadata      Json?           // Datos flexibles: que funciono, que no
  completedAt   DateTime?
  tenantId      String
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  prospect      Prospect?       @relation(fields: [prospectId], references: [id])
  tenant        Tenant          @relation(fields: [tenantId], references: [id])

  @@index([status])
  @@index([agentType])
  @@index([prospectId])
  @@index([tenantId])
  @@index([priority])
  @@index([createdAt])
}

// ============================================
// MODELO: Memoria de Agentes (Auto-mejora)
// ============================================
model AgentMemory {
  id          String    @id @default(cuid())
  agentType   AgentType
  category    String    // "estrategia", "manejo_objeciones", "patron_conversion"
  content     String    @db.Text
  score       Int       @default(0) // Puntuacion de efectividad
  metadata    Json?
  tenantId    String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  tenant      Tenant    @relation(fields: [tenantId], references: [id])

  @@index([agentType])
  @@index([category])
  @@index([tenantId])
  @@index([score])
}
```

### Paso 1.4: Actualizar Relaciones en Modelos Existentes

**Archivo:** `prisma/schema.prisma`

**En modelo `Tenant` (linea 10-37)** agregar estas relaciones:
```prisma
  // Agregar despues de aiUsage:
  interactions     ProspectInteraction[]
  whatsappMessages WhatsAppMessage[]
  emailTemplates   EmailTemplate[]
  emailSequences   EmailSequence[]
  emailLogs        EmailLog[]
  masterclasses    Masterclass[]
  agentTasks       AgentTask[]
  agentMemories    AgentMemory[]
```

**En modelo `User` (linea 39-68)** agregar relacion:
```prisma
  // Agregar despues de aiConversations:
  advisorInteractions ProspectInteraction[] @relation("InteractionAdvisor")
```

### Paso 1.5: Ejecutar Migracion

```bash
npx prisma migrate dev --name add_sales_funnel_models
npx prisma generate
```

### Paso 1.6: Modulo Funnel - Tipos

**Archivo NUEVO:** `src/modules/funnel/types/index.ts`

```typescript
import type { FunnelStage, LeadTemperature, LeadSource, InteractionType, AgentType } from '@prisma/client'

export interface PipelineView {
  stages: PipelineStage[]
  totalLeads: number
  totalValue: number // Valor potencial si todos se matriculan
}

export interface PipelineStage {
  stage: FunnelStage
  label: string
  count: number
  leads: PipelineLead[]
}

export interface PipelineLead {
  id: string
  name: string
  phone: string
  email: string | null
  funnelStage: FunnelStage
  temperature: LeadTemperature
  score: number
  source: LeadSource
  programName: string | null
  advisorName: string | null
  lastContactAt: Date | null
  nextFollowUpAt: Date | null
  createdAt: Date
}

export interface LeadTimeline {
  prospectId: string
  interactions: TimelineItem[]
}

export interface TimelineItem {
  id: string
  type: InteractionType
  content: string
  metadata: Record<string, unknown> | null
  advisorName: string | null
  agentType: AgentType | null
  createdAt: Date
}

export interface FunnelMetrics {
  period: string
  stageConversions: StageConversion[]
  overallConversionRate: number // NUEVO -> MATRICULADO
  averageDaysToClose: number
  costPerLead: number
  costPerSale: number
}

export interface StageConversion {
  fromStage: FunnelStage
  toStage: FunnelStage
  count: number
  rate: number // porcentaje
  averageDays: number
}

export interface LeadScoreFactors {
  emailProvided: boolean      // +10
  phoneVerified: boolean      // +10
  programSelected: boolean    // +15
  masterclassRegistered: boolean // +20
  masterclassAttended: boolean   // +25
  applicationSubmitted: boolean  // +30
  respondedFollowUp: boolean    // +15
  recentActivity: boolean       // +10 (ultimas 48h)
  interactionCount: number      // +5 por cada
}

// Labels en espanol para las etapas del embudo
export const FUNNEL_STAGE_LABELS: Record<FunnelStage, string> = {
  NUEVO: 'Nuevo',
  CONTACTADO: 'Contactado',
  INTERESADO: 'Interesado',
  MASTERCLASS_REGISTRADO: 'Masterclass Registrado',
  MASTERCLASS_ASISTIO: 'Masterclass Asistio',
  APLICACION: 'Aplicacion',
  LLAMADA_AGENDADA: 'Llamada Agendada',
  LLAMADA_REALIZADA: 'Llamada Realizada',
  NEGOCIACION: 'Negociacion',
  MATRICULADO: 'Matriculado',
  PERDIDO: 'Perdido',
}

export const TEMPERATURE_LABELS: Record<LeadTemperature, string> = {
  FRIO: 'Frio',
  TIBIO: 'Tibio',
  CALIENTE: 'Caliente',
}

export const SOURCE_LABELS: Record<LeadSource, string> = {
  LANDING_PAGE: 'Landing Page',
  WHATSAPP: 'WhatsApp',
  REFERIDO: 'Referido',
  REDES_SOCIALES: 'Redes Sociales',
  LLAMADA: 'Llamada',
  EMAIL: 'Email',
  OTRO: 'Otro',
}
```

### Paso 1.7: Modulo Funnel - Schemas Zod

**Archivo NUEVO:** `src/modules/funnel/schemas/index.ts`

```typescript
import { z } from 'zod'

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  phone: z.string().min(7, 'Telefono requerido'),
  email: z.string().email('Email invalido').optional().nullable(),
  source: z.enum(['LANDING_PAGE', 'WHATSAPP', 'REFERIDO', 'REDES_SOCIALES', 'LLAMADA', 'EMAIL', 'OTRO']).default('OTRO'),
  sourceDetail: z.string().optional().nullable(),
  programId: z.string().optional().nullable(),
  advisorId: z.string().optional(),
  city: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  utmContent: z.string().optional().nullable(),
})

export const updateLeadSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
  email: z.string().email().optional().nullable(),
  temperature: z.enum(['FRIO', 'TIBIO', 'CALIENTE']).optional(),
  observations: z.string().optional().nullable(),
  programId: z.string().optional().nullable(),
  advisorId: z.string().optional(),
  city: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  nextFollowUpAt: z.string().datetime().optional().nullable(),
  lostReason: z.string().optional().nullable(),
})

export const moveStageSchema = z.object({
  newStage: z.enum([
    'NUEVO', 'CONTACTADO', 'INTERESADO',
    'MASTERCLASS_REGISTRADO', 'MASTERCLASS_ASISTIO',
    'APLICACION', 'LLAMADA_AGENDADA', 'LLAMADA_REALIZADA',
    'NEGOCIACION', 'MATRICULADO', 'PERDIDO'
  ]),
  reason: z.string().optional(),
})

export const pipelineFiltersSchema = z.object({
  stage: z.enum([
    'NUEVO', 'CONTACTADO', 'INTERESADO',
    'MASTERCLASS_REGISTRADO', 'MASTERCLASS_ASISTIO',
    'APLICACION', 'LLAMADA_AGENDADA', 'LLAMADA_REALIZADA',
    'NEGOCIACION', 'MATRICULADO', 'PERDIDO'
  ]).optional(),
  temperature: z.enum(['FRIO', 'TIBIO', 'CALIENTE']).optional(),
  source: z.enum(['LANDING_PAGE', 'WHATSAPP', 'REFERIDO', 'REDES_SOCIALES', 'LLAMADA', 'EMAIL', 'OTRO']).optional(),
  advisorId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

export const publicLeadCaptureSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  phone: z.string().min(7, 'Telefono requerido'),
  email: z.string().email('Email invalido'),
  programId: z.string().optional(),
  masterclassSlug: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
})
```

### Paso 1.8: Modulo Funnel - Servicio Principal

**Archivo NUEVO:** `src/modules/funnel/services/funnel.service.ts`

Metodos a implementar:
```typescript
export class FunnelService {
  // Obtener pipeline completo (todas las etapas con leads)
  static async getPipeline(tenantId: string, filters?: PipelineFilters): Promise<PipelineView>

  // Mover lead a nueva etapa + crear interaccion + trigger automations
  static async moveLeadToStage(prospectId: string, newStage: FunnelStage, tenantId: string, reason?: string): Promise<Prospect>

  // Obtener timeline de actividad de un lead
  static async getLeadTimeline(prospectId: string, tenantId: string): Promise<TimelineItem[]>

  // Asignar lead a asesor
  static async assignToAdvisor(prospectId: string, advisorId: string, tenantId: string): Promise<Prospect>

  // Obtener siguiente asesor disponible (round-robin)
  static async getNextAdvisor(tenantId: string): Promise<string>

  // Bulk update de etapa
  static async bulkUpdateStage(prospectIds: string[], newStage: FunnelStage, tenantId: string): Promise<number>
}
```

**Logica critica de `moveLeadToStage`:**
1. Validar que el prospect existe y pertenece al tenant
2. Actualizar `funnelStage` en BD
3. Si es PERDIDO, guardar `lostReason`
4. Si es MASTERCLASS_REGISTRADO, guardar `masterclassRegisteredAt`
5. Si es MASTERCLASS_ASISTIO, guardar `masterclassAttendedAt`
6. Crear `ProspectInteraction` tipo CAMBIO_ETAPA
7. Llamar a `AutomationService.onStageChange()` (Fase 2)
8. Recalcular score con `LeadScoringService.calculateScore()`

### Paso 1.9: Modulo Funnel - Lead Scoring

**Archivo NUEVO:** `src/modules/funnel/services/lead-scoring.service.ts`

```typescript
export class LeadScoringService {
  // Reglas de puntuacion:
  // Email proporcionado: +10
  // Telefono con codigo pais: +10
  // Programa seleccionado: +15
  // Masterclass registrado: +20
  // Masterclass asistio: +25
  // Aplicacion enviada: +30
  // Respondio seguimiento: +15
  // Actividad reciente (48h): +10
  // Por cada interaccion: +5

  static async calculateScore(prospectId: string, tenantId: string): Promise<number>

  // Actualizar temperatura automaticamente segun score
  // 0-30: FRIO, 31-60: TIBIO, 61+: CALIENTE
  static async updateTemperature(prospectId: string, score: number, tenantId: string): Promise<LeadTemperature>
}
```

### Paso 1.10: Modulo Funnel - Analytics

**Archivo NUEVO:** `src/modules/funnel/services/funnel-analytics.service.ts`

```typescript
export class FunnelAnalyticsService {
  // Metricas generales del embudo
  static async getFunnelMetrics(tenantId: string, period?: string): Promise<FunnelMetrics>

  // Datos para grafico de embudo (leads por etapa)
  static async getConversionFunnel(tenantId: string): Promise<{ stage: string, count: number }[]>

  // Rendimiento por asesor en el embudo
  static async getAdvisorFunnelPerformance(tenantId: string): Promise<any[]>

  // De donde vienen los mejores leads
  static async getLeadSourceBreakdown(tenantId: string): Promise<any[]>

  // Tiempo promedio en cada etapa (identificar cuellos de botella)
  static async getAverageTimeInStage(tenantId: string): Promise<any[]>
}
```

### Paso 1.11: Modulo Funnel - Index

**Archivo NUEVO:** `src/modules/funnel/index.ts`

```typescript
export { FunnelService } from './services/funnel.service'
export { LeadScoringService } from './services/lead-scoring.service'
export { FunnelAnalyticsService } from './services/funnel-analytics.service'
export * from './types'
export * from './schemas'
```

### Paso 1.12: Actualizar ProspectService Existente

**Archivo:** `src/modules/prospects/services/prospect.service.ts`

Cambios necesarios:
1. `createProspect()` - aceptar nuevos campos (source, temperature, UTM, city, occupation)
2. `updateProspect()` - manejar cambios de funnelStage y crear interaccion automatica
3. `getProspects()` - soportar filtros por funnelStage, temperature, source
4. `getStats()` - retornar estadisticas basadas en embudo

### Paso 1.13: Implementar InteractionService Real

**Archivo:** `src/modules/prospects/services/interaction.service.ts`

Actualmente es un placeholder vacio. Implementar con modelo `ProspectInteraction`:
```typescript
export class InteractionService {
  static async getByProspect(prospectId: string, tenantId: string): Promise<ProspectInteraction[]>
  static async create(data: CreateInteractionInput, tenantId: string): Promise<ProspectInteraction>
  // Al crear interaccion, actualizar prospect.lastContactAt
  static async delete(id: string, tenantId: string): Promise<void>
}
```

### Paso 1.14: API Routes CRM

**Archivos NUEVOS:**

| Ruta | Metodo | Auth Wrapper | Funcion |
|------|--------|-------------|---------|
| `src/app/api/funnel/pipeline/route.ts` | GET | `withTenantAuth` | Pipeline completo |
| `src/app/api/funnel/leads/route.ts` | GET, POST | `withTenantAuth` / `withTenantAuthAndCSRF` | Listar/Crear leads |
| `src/app/api/funnel/leads/[id]/route.ts` | GET, PUT, DELETE | `withTenantAuth` / `withTenantAuthAndCSRF` | CRUD lead |
| `src/app/api/funnel/leads/[id]/stage/route.ts` | PATCH | `withTenantAuthAndCSRF` | Mover etapa |
| `src/app/api/funnel/leads/[id]/timeline/route.ts` | GET | `withTenantAuth` | Timeline actividad |
| `src/app/api/funnel/leads/[id]/assign/route.ts` | PATCH | `withTenantAuthAndCSRF` | Asignar asesor |
| `src/app/api/funnel/analytics/route.ts` | GET | `withTenantAuth` | Metricas embudo |
| `src/app/api/funnel/analytics/conversion/route.ts` | GET | `withTenantAuth` | Datos conversion |
| `src/app/api/funnel/scoring/[id]/route.ts` | POST | `withTenantAuthAndCSRF` | Recalcular score |

Todas siguen patron envelope: `{ success: true, data: {...} }`

### Paso 1.15: UI - Pipeline Kanban

**Archivos NUEVOS:**

**Pagina principal:** `src/app/(protected)/prospectos/pipeline/page.tsx`
- Componente `'use client'`
- Usa `PipelineBoard` con fetch a `/api/funnel/pipeline`
- Filtros arriba, Kanban abajo

**Componentes en `src/components/funnel/`:**

1. **`PipelineBoard.tsx`** - Contenedor Kanban con `@dnd-kit`
   - DndContext con sensores de mouse y touch
   - SortableContext para cada columna
   - Maneja `onDragEnd` -> PATCH `/api/funnel/leads/{id}/stage`

2. **`PipelineColumn.tsx`** - Columna de etapa
   - Header con nombre de etapa + conteo
   - Color segun etapa (verde=MATRICULADO, rojo=PERDIDO, etc.)
   - Lista de `LeadCard`

3. **`LeadCard.tsx`** - Tarjeta de lead
   - Nombre, telefono, programa
   - Badge de temperatura (color: azul=FRIO, naranja=TIBIO, rojo=CALIENTE)
   - Score como barra de progreso
   - Click abre `LeadDetailDrawer`

4. **`LeadDetailDrawer.tsx`** - Drawer lateral
   - Info completa del lead
   - Botones de accion: Llamar, WhatsApp, Email, Cambiar etapa
   - Timeline de interacciones
   - Formulario de edicion

5. **`LeadTimeline.tsx`** - Componente de timeline
   - Iconos por tipo de interaccion
   - Fecha relativa (hace 2 horas, ayer, etc.)
   - Contenido del mensaje/nota

6. **`LeadScoreBadge.tsx`** - Indicador visual
   - Circulo con numero de score
   - Color segun temperatura

7. **`FunnelChart.tsx`** - Grafico de embudo
   - Usa `recharts` FunnelChart o BarChart horizontal
   - Muestra leads por etapa con tasas de conversion

8. **`PipelineFilters.tsx`** - Barra de filtros
   - Select de etapa, temperatura, fuente, asesor
   - Input de busqueda por nombre/telefono
   - Rango de fechas

### Paso 1.16: Actualizar Navegacion

**Archivo:** `src/modules/dashboard/components/DashboardSidebar.tsx`
- Agregar item "Pipeline" con icono `Kanban` de lucide apuntando a `/prospectos/pipeline`
- Agregar item "Embudo" con icono `TrendingUp` apuntando a `/prospectos/analytics`

**Archivo:** `src/app/admin/leads/page.tsx`
- Reemplazar placeholder "coming soon" con redirect a Pipeline o contenido real

---

## 4. Fase 2: WhatsApp Business API + Email Marketing

### Paso 2.1: Configurar WhatsApp Business API en Meta

**Prerequisito manual (no codigo):**
1. Ir a developers.facebook.com
2. Crear app tipo "Business"
3. Agregar producto "WhatsApp"
4. Obtener: `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`
5. Configurar webhook URL: `https://tu-tenant.kaledsoft.tech/api/whatsapp/webhook`
6. Suscribirse a eventos: `messages`, `message_status_updates`
7. Crear plantillas de mensaje en Meta Business Suite (requieren aprobacion):
   - `bienvenida_calet` - Mensaje de bienvenida
   - `recordatorio_masterclass` - Recordatorio de masterclass
   - `seguimiento_calet` - Seguimiento post-masterclass

### Paso 2.2: WhatsApp Service Mejorado

**Archivo:** `src/modules/whatsapp/services/whatsapp.service.ts`
**Accion:** REEMPLAZAR contenido completo

Metodos nuevos:
```typescript
export class WhatsAppService {
  // Enviar mensaje de texto libre (dentro de ventana 24h)
  static async sendMessage(payload: { to: string, message: string }): Promise<boolean>

  // Enviar mensaje con plantilla aprobada por Meta
  static async sendTemplateMessage(payload: {
    to: string,
    templateName: string,
    language: string, // "es"
    components?: any[] // Variables de la plantilla
  }): Promise<{ success: boolean, waMessageId?: string }>

  // Procesar webhook entrante de Meta
  static async processWebhook(body: any, tenantId: string): Promise<void>

  // Verificar firma del webhook
  static verifyWebhookSignature(body: string, signature: string): boolean

  // Obtener historial de conversacion por telefono
  static async getConversationHistory(phone: string, tenantId: string): Promise<WhatsAppMessage[]>

  // Enviar mensaje y registrar en BD
  static async sendAndLog(payload: {
    to: string,
    message: string,
    prospectId?: string,
    templateName?: string,
    tenantId: string
  }): Promise<WhatsAppMessage>
}
```

### Paso 2.3: WhatsApp Template Service

**Archivo NUEVO:** `src/modules/whatsapp/services/whatsapp-template.service.ts`

```typescript
export class WhatsAppTemplateService {
  // Enviar bienvenida a nuevo lead
  static async sendWelcome(prospectId: string, tenantId: string): Promise<void>

  // Enviar recordatorio de masterclass (24h antes)
  static async sendMasterclassReminder24h(prospectId: string, tenantId: string): Promise<void>

  // Enviar recordatorio de masterclass (1h antes)
  static async sendMasterclassReminder1h(prospectId: string, tenantId: string): Promise<void>

  // Enviar seguimiento post-masterclass
  static async sendPostMasterclassFollowUp(prospectId: string, tenantId: string): Promise<void>

  // Enviar seguimiento general
  static async sendGeneralFollowUp(prospectId: string, message: string, tenantId: string): Promise<void>
}
```

### Paso 2.4: WhatsApp Webhook Route

**Archivo NUEVO:** `src/app/api/whatsapp/webhook/route.ts`

```typescript
// GET - Verificacion del webhook de Meta
// Meta envia: hub.mode, hub.verify_token, hub.challenge
// Responder con hub.challenge si verify_token coincide con WHATSAPP_VERIFY_TOKEN

// POST - Mensajes entrantes y actualizaciones de estado
// 1. Verificar X-Hub-Signature-256
// 2. Parsear body para extraer mensajes
// 3. Para cada mensaje entrante:
//    a. Buscar Prospect por telefono
//    b. Si no existe, crear Prospect con stage NUEVO, source WHATSAPP
//    c. Crear WhatsAppMessage (INBOUND)
//    d. Crear ProspectInteraction (WHATSAPP_RECIBIDO)
//    e. Si agentes activos y lead en etapa NUEVO-INTERESADO, trigger Margy
// 4. Para status updates (sent, delivered, read):
//    a. Actualizar WhatsAppMessage por waMessageId
```

**IMPORTANTE:** Este endpoint es PUBLICO (sin auth wrapper). La seguridad viene de la verificacion de firma de Meta.

### Paso 2.5: API Routes WhatsApp

**Archivos NUEVOS:**

| Ruta | Metodo | Auth | Funcion |
|------|--------|------|---------|
| `src/app/api/whatsapp/webhook/route.ts` | GET, POST | Ninguno (firma Meta) | Webhook |
| `src/app/api/whatsapp/send/route.ts` | POST | `withTenantAuthAndCSRF` | Enviar mensaje |
| `src/app/api/whatsapp/messages/route.ts` | GET | `withTenantAuth` | Historial por prospect |
| `src/app/api/whatsapp/templates/route.ts` | GET | `withTenantAuth` | Listar plantillas |

### Paso 2.6: Modulo Email Sequences

**Directorio NUEVO:** `src/modules/email-sequences/`

**`services/email-template.service.ts`:**
```typescript
export class EmailTemplateService {
  // CRUD de plantillas
  static async create(data: CreateTemplateInput, tenantId: string): Promise<EmailTemplate>
  static async getAll(tenantId: string): Promise<EmailTemplate[]>
  static async getById(id: string, tenantId: string): Promise<EmailTemplate | null>
  static async update(id: string, data: UpdateTemplateInput, tenantId: string): Promise<EmailTemplate>
  static async delete(id: string, tenantId: string): Promise<void>

  // Renderizar plantilla reemplazando {{variables}}
  static renderTemplate(htmlContent: string, variables: Record<string, string>): string

  // Preview: renderizar con datos de ejemplo
  static async preview(id: string, sampleData: Record<string, string>, tenantId: string): Promise<string>
}
```

**`services/email-sequence.service.ts`:**
```typescript
export class EmailSequenceService {
  // CRUD de secuencias
  static async create(data: CreateSequenceInput, tenantId: string): Promise<EmailSequence>
  static async getAll(tenantId: string): Promise<EmailSequence[]>
  static async getById(id: string, tenantId: string): Promise<EmailSequence>
  static async update(id: string, data: UpdateSequenceInput, tenantId: string): Promise<EmailSequence>
  static async delete(id: string, tenantId: string): Promise<void>

  // Agregar/editar/eliminar pasos
  static async addStep(sequenceId: string, data: CreateStepInput, tenantId: string): Promise<EmailSequenceStep>
  static async updateStep(stepId: string, data: UpdateStepInput): Promise<EmailSequenceStep>
  static async deleteStep(stepId: string): Promise<void>
}
```

**`services/email-engine.service.ts`:**
```typescript
export class EmailEngineService {
  // Disparar secuencia cuando lead entra a una etapa
  static async triggerSequence(prospectId: string, funnelStage: FunnelStage, tenantId: string): Promise<void>

  // Procesar emails pendientes (llamado por cron job)
  static async processScheduledEmails(): Promise<{ sent: number, failed: number }>

  // Enviar email individual con template
  static async sendTemplateEmail(params: {
    to: string,
    templateId: string,
    variables: Record<string, string>,
    prospectId?: string,
    tenantId: string
  }): Promise<EmailLog>
}
```

### Paso 2.7: Plantillas HTML de Email

**Archivos NUEVOS en `src/modules/email-sequences/templates/`:**

5 plantillas HTML profesionales con estilo Calet Academy:
1. **`bienvenida.html`** - Bienvenida al registrarse en landing
   - Variables: `{{nombre}}`, `{{programa}}`, `{{enlace_masterclass}}`
2. **`recordatorio-masterclass.html`** - 24h y 1h antes
   - Variables: `{{nombre}}`, `{{titulo_masterclass}}`, `{{fecha}}`, `{{hora}}`, `{{enlace}}`
3. **`post-masterclass.html`** - Seguimiento despues de masterclass
   - Variables: `{{nombre}}`, `{{enlace_aplicacion}}`
4. **`aplicacion-confirmacion.html`** - Confirmacion de aplicacion recibida
   - Variables: `{{nombre}}`, `{{programa}}`
5. **`seguimiento-indeciso.html`** - Nurturing para leads tibios
   - Variables: `{{nombre}}`, `{{beneficio_clave}}`, `{{enlace}}`

Todas con:
- Diseno responsive (max-width: 600px)
- Colores de marca Calet (gradiente morado/azul como los emails existentes)
- Boton CTA destacado
- Footer con informacion de contacto
- Texto en espanol colombiano

### Paso 2.8: Cron Job Email Sequences

**Archivo NUEVO:** `src/app/api/cron/email-sequences/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { EmailEngineService } from '@/modules/email-sequences'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await EmailEngineService.processScheduledEmails()
  return NextResponse.json({ success: true, data: result })
}
```

### Paso 2.9: Automation Service (Orquestador)

**Archivo NUEVO:** `src/modules/funnel/services/automation.service.ts`

```typescript
export class AutomationService {
  // Llamado cuando un lead cambia de etapa
  static async onStageChange(
    prospectId: string,
    fromStage: FunnelStage,
    toStage: FunnelStage,
    tenantId: string
  ): Promise<void> {
    // 1. Disparar secuencia de email para la nueva etapa
    // 2. Enviar WhatsApp template segun etapa
    // 3. Recalcular score
    // 4. Crear tarea para agente IA si aplica
  }
}
```

### Paso 2.10: API Routes Email

**Archivos NUEVOS:**

| Ruta | Metodo | Auth | Funcion |
|------|--------|------|---------|
| `src/app/api/email-sequences/route.ts` | GET, POST | `withTenantAuth` / `withTenantAuthAndCSRF` | Listar/Crear secuencias |
| `src/app/api/email-sequences/[id]/route.ts` | GET, PUT, DELETE | `withTenantAuth` / `withTenantAuthAndCSRF` | CRUD secuencia |
| `src/app/api/email-sequences/templates/route.ts` | GET, POST | `withTenantAuth` / `withTenantAuthAndCSRF` | Listar/Crear plantillas |
| `src/app/api/email-sequences/templates/[id]/route.ts` | GET, PUT, DELETE | `withTenantAuth` / `withTenantAuthAndCSRF` | CRUD plantilla |
| `src/app/api/email-sequences/templates/[id]/preview/route.ts` | POST | `withTenantAuth` | Preview renderizado |

### Paso 2.11: Actualizar email.ts

**Archivo:** `src/lib/email.ts`

Agregar funcion generica para enviar email con HTML custom:
```typescript
export async function sendTemplateEmail(params: {
  to: string,
  subject: string,
  html: string,
}): Promise<{ id: string }> {
  const resend = getResendClient()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
  })
  if (error) throw new Error(`Failed to send email: ${error.message}`)
  return data!
}
```

---

## 5. Fase 3: Landing Pages Publicas

### Paso 3.1: Actualizar Proxy/Middleware

**Archivo:** `src/proxy.ts` linea 80
**Accion:** Agregar `/lp` y `/api/public` a rutas publicas del tenant

```typescript
// ANTES:
const publicTenantPaths = ['/auth', '/login', '/register', '/forgot-password', '/reset-password', '/suspended', '/api-docs', '/api/openapi', '/api/auth'];

// DESPUES:
const publicTenantPaths = ['/auth', '/login', '/register', '/forgot-password', '/reset-password', '/suspended', '/api-docs', '/api/openapi', '/api/auth', '/lp', '/api/public'];
```

### Paso 3.2: Layout de Landing Pages

**Archivo NUEVO:** `src/app/lp/layout.tsx`

Layout minimo SIN sidebar, SIN auth, SIN header de la app. Solo meta tags, fonts, y PixelScript.

### Paso 3.3: Landing Page Masterclass

**Archivo NUEVO:** `src/app/lp/masterclass/[slug]/page.tsx`

Componente Server que:
1. Lee el slug de la URL
2. Busca la Masterclass en BD por slug + tenantId
3. Si no existe, muestra 404
4. Renderiza la landing page con componentes

Estructura de la pagina:
```
[PixelScript] (Meta Pixel)
[HeroSection] - Headline + Subtitulo + CTA
[ProgramBenefits] - 4-6 beneficios del bootcamp
[TestimonialSection] - Social proof
[LeadCaptureForm] - Formulario de registro
[MasterclassCountdown] - Countdown si hay fecha programada
[Footer simple]
```

### Paso 3.4: Pagina de Gracias

**Archivo NUEVO:** `src/app/lp/gracias/page.tsx`

Confirmacion de registro exitoso + instrucciones de siguiente paso + Pixel CompleteRegistration.

### Paso 3.5: Componentes Landing

**Archivos NUEVOS en `src/components/landing/`:**

1. **`HeroSection.tsx`** - Background con gradiente, headline, CTA
2. **`LeadCaptureForm.tsx`** - Formulario con react-hook-form + Zod + UTM params
3. **`MasterclassCountdown.tsx`** - Countdown dias:horas:minutos:segundos
4. **`TestimonialSection.tsx`** - Grid de testimonios
5. **`ProgramBenefits.tsx`** - Grid de iconos + beneficios
6. **`CtaButton.tsx`** - Boton estilizado con evento pixel
7. **`PixelScript.tsx`** - Meta Pixel via `<Script>` de Next.js
8. **`ThankYouCard.tsx`** - Card de confirmacion

### Paso 3.6: API Publica de Captura de Leads

**Archivo NUEVO:** `src/app/api/public/leads/route.ts`

POST sin auth. Rate limit por IP. Crea Prospect con source=LANDING_PAGE y dispara automations.

**Archivo NUEVO:** `src/app/api/public/masterclass/[slug]/route.ts`

GET info publica + POST registrar lead a masterclass.

### Paso 3.7: Admin Masterclass

| Ruta | Metodo | Auth | Funcion |
|------|--------|------|---------|
| `src/app/api/masterclasses/route.ts` | GET, POST | `withTenantAuth` / `withTenantAuthAndCSRF` | Listar/Crear |
| `src/app/api/masterclasses/[id]/route.ts` | GET, PUT, DELETE | `withTenantAuth` / `withTenantAuthAndCSRF` | CRUD |

### Paso 3.8: Configuracion Meta Pixel

Usar `SystemConfig` existente para guardar `metaPixelId` y `googleTagId`.

---

## 6. Fase 4: Agentes IA (Margy + Kaled) + Kanban

### Paso 4.1: Instalar @ai-sdk/anthropic

```bash
npm install @ai-sdk/anthropic
```

### Paso 4.2: Modulo Agents - Tipos

**Archivo NUEVO:** `src/modules/agents/types/index.ts`

```typescript
import type { AgentType, AgentTaskStatus } from '@prisma/client'

export interface AgentTaskBoard {
  columns: AgentTaskColumn[]
  stats: AgentStats
}

export interface AgentTaskColumn {
  status: AgentTaskStatus
  label: string
  tasks: AgentTaskItem[]
}

export interface AgentTaskItem {
  id: string
  title: string
  description: string
  status: AgentTaskStatus
  agentType: AgentType
  priority: number
  prospectName: string | null
  prospectId: string | null
  result: string | null
  createdAt: Date
  completedAt: Date | null
}

export interface AgentStats {
  margy: {
    totalTasks: number
    completedToday: number
    pendingTasks: number
    leadsQualified: number
    messagesSent: number
  }
  kaled: {
    totalTasks: number
    completedToday: number
    pendingTasks: number
    briefingsGenerated: number
    analyticsRun: number
  }
}

export interface AgentMemoryItem {
  id: string
  agentType: AgentType
  category: string
  content: string
  score: number
  createdAt: Date
}

export const AGENT_MODEL_CONFIG = {
  primary: {
    provider: 'anthropic' as const,
    model: 'claude-sonnet-4-5-20250929',
  },
  fallback: {
    provider: 'google' as const,
    model: 'gemini-2.0-flash',
  },
}
```

### Paso 4.3: Modulo Agents - Schemas

**Archivo NUEVO:** `src/modules/agents/schemas/index.ts`

Schemas Zod para createAgentTask, updateAgentTask, agentChat, createAgentMemory.

### Paso 4.4: Agent Task Service

**Archivo NUEVO:** `src/modules/agents/services/agent-task.service.ts`

CRUD de tareas + tablero Kanban agrupado por status + stats por agente.

### Paso 4.5: Agent Memory Service

**Archivo NUEVO:** `src/modules/agents/services/agent-memory.service.ts`

Guardar/obtener memorias, ranking por score, formatear como contexto para system prompt.

### Paso 4.6: Agent Tools Service

**Archivo NUEVO:** `src/modules/agents/services/agent-tools.service.ts`

Herramientas que los agentes pueden invocar via AI SDK `tool()`:

**Compartidos:** getProspectInfo, updateProspectStage, setLeadTemperature, sendWhatsAppMessage, createAgentTask, logMemory

**Solo Margy:** triggerEmailSequence, createFollowUp

**Solo Kaled:** getProspectBriefing, getFunnelAnalytics, getStagnantLeads, getConversionPatterns, suggestClosingStrategy

### Paso 4.7: Agente Margy Service

**Archivo NUEVO:** `src/modules/agents/services/margy.service.ts`

- System prompt con personalidad colombiana, amigable, profesional
- Capacidades: responder mensajes, calificar leads, enviar secuencias, mover etapas
- Streaming con Claude primary, Gemini fallback
- Auto-respuesta para mensajes WhatsApp entrantes

### Paso 4.8: Agente Kaled Service

**Archivo NUEVO:** `src/modules/agents/services/kaled.service.ts`

- System prompt analitico, data-driven, estrategico
- Capacidades: briefings, analytics, leads estancados, patrones conversion
- Streaming con Claude primary, Gemini fallback
- Generacion de briefings para llamadas de cierre

### Paso 4.9: API Routes Agentes

| Ruta | Metodo | Auth | Funcion |
|------|--------|------|---------|
| `src/app/api/agents/margy/stream/route.ts` | POST | `withTenantAuth` | Chat streaming Margy |
| `src/app/api/agents/margy/auto-respond/route.ts` | POST | Interno (CRON_SECRET) | Auto-respuesta WhatsApp |
| `src/app/api/agents/kaled/stream/route.ts` | POST | `withTenantAuth` | Chat streaming Kaled |
| `src/app/api/agents/kaled/briefing/[prospectId]/route.ts` | GET | `withTenantAuth` | Generar briefing |
| `src/app/api/agents/kaled/analytics/route.ts` | GET | `withTenantAuth` | Reporte analitico |
| `src/app/api/agents/tasks/route.ts` | GET, POST | `withPlatformAdmin` | CRUD tareas |
| `src/app/api/agents/tasks/[id]/route.ts` | GET, PATCH, DELETE | `withPlatformAdmin` | CRUD tarea |
| `src/app/api/agents/tasks/board/route.ts` | GET | `withPlatformAdmin` | Vista Kanban |
| `src/app/api/agents/memory/route.ts` | GET | `withPlatformAdmin` | Memorias |
| `src/app/api/agents/memory/[id]/route.ts` | PATCH | `withPlatformAdmin` | Actualizar score |

### Paso 4.10: Pipeline WhatsApp -> Margy (Auto-respuesta)

Flujo completo:
1. Meta envia POST a /api/whatsapp/webhook
2. Verificar firma
3. Buscar/crear Prospect
4. Registrar mensaje INBOUND
5. Si lead en etapas NUEVO/CONTACTADO/INTERESADO -> Margy auto-responde
6. Margy analiza contexto, genera respuesta, envia por WhatsApp
7. Registrar todo en BD + crear tarea en Kanban

### Paso 4.11: UI Kanban de Agentes (Admin)

**Pagina:** `src/app/admin/agents/board/page.tsx`

**Componentes en `src/components/agents/`:**
1. **`AgentTaskBoard.tsx`** - Kanban con @dnd-kit
2. **`AgentTaskColumn.tsx`** - Columna coloreada por status
3. **`AgentTaskCard.tsx`** - Tarjeta con avatar agente
4. **`AgentPerformanceCards.tsx`** - Stats cards
5. **`AgentMemoryLog.tsx`** - Lista de memorias
6. **`MargyChat.tsx`** - Chat con Margy
7. **`KaledChat.tsx`** - Chat con Kaled

### Paso 4.12: Actualizar Admin Sidebar

Agregar bajo "Inteligencia":
- "Tablero IA" -> `/admin/agents/board`
- "Chat Margy" -> `/admin/agents/margy`
- "Chat Kaled" -> `/admin/agents/kaled`

### Paso 4.13: Modulo Agents Index

```typescript
export { AgentTaskService } from './services/agent-task.service'
export { AgentMemoryService } from './services/agent-memory.service'
export { MargyService } from './services/margy.service'
export { KaledService } from './services/kaled.service'
export { AgentToolsService } from './services/agent-tools.service'
export * from './types'
export * from './schemas'
```

---

## 7. Variables de Entorno

Agregar a `.env` y `.env.local`:

```bash
# ====== WHATSAPP BUSINESS API (Meta Cloud) ======
WHATSAPP_API_URL=https://graph.facebook.com/v24.0
WHATSAPP_PHONE_NUMBER_ID=     # De Meta Developers
WHATSAPP_ACCESS_TOKEN=         # Token permanente de Meta
WHATSAPP_VERIFY_TOKEN=         # Token personalizado para webhook verification
WHATSAPP_APP_SECRET=           # Para verificar firma X-Hub-Signature-256

# ====== ANTHROPIC (Claude) ======
ANTHROPIC_API_KEY=             # API key de console.anthropic.com

# ====== META PIXEL (opcional, configurable por tenant en SystemConfig) ======
META_PIXEL_ID=                 # ID del pixel de Meta para tracking

# ====== YA EXISTENTES (confirmar que estan) ======
RESEND_API_KEY=                # Ya configurado
RESEND_FROM_EMAIL=             # Ya configurado
CRON_SECRET=                   # Ya configurado para cron jobs
GOOGLE_GENERATIVE_AI_API_KEY=  # Ya configurado para Gemini
```

---

## 8. Verificacion End-to-End

### Test Fase 1: CRM Pipeline
1. `npx prisma migrate dev` ejecuta sin errores
2. POST `/api/funnel/leads` crea lead con stage NUEVO, score calculado
3. GET `/api/funnel/pipeline` retorna todas las etapas con conteos
4. PATCH `/api/funnel/leads/{id}/stage` mueve lead y crea interaccion automatica
5. GET `/api/funnel/leads/{id}/timeline` muestra historial completo
6. UI: Pipeline Kanban renderiza con datos, drag & drop funciona
7. UI: Funnel chart muestra datos de conversion

### Test Fase 2: WhatsApp + Email
1. POST `/api/whatsapp/send` envia mensaje de texto a numero de prueba
2. GET webhook verification retorna challenge
3. POST webhook con mensaje simulado crea lead y registra mensaje
4. POST `/api/email-sequences/templates` crea plantilla con variables
5. POST preview renderiza HTML correcto
6. Cambiar lead de etapa dispara secuencia de email
7. Cron job procesa emails pendientes

### Test Fase 3: Landing Pages
1. Acceder a `/lp/masterclass/test` sin login (publico)
2. Formulario captura lead con UTM params
3. POST `/api/public/leads` crea lead con source=LANDING_PAGE
4. Redirect a `/lp/gracias` funciona
5. Meta Pixel dispara eventos PageView y Lead

### Test Fase 4: Agentes IA
1. POST streaming con Margy funciona
2. Margy usa tools durante conversacion
3. Kaled funciona con Claude, fallback a Gemini
4. Briefing se genera completo
5. Tablero Kanban muestra tareas de agentes
6. WhatsApp webhook trigger Margy auto-respuesta
7. Agentes guardan memorias persistentes
8. UI admin funciona con streaming

### Test End-to-End Completo
1. Visitante -> landing page con UTMs
2. Registro -> lead NUEVO creado
3. Email + WhatsApp de bienvenida automaticos
4. Margy califica lead como TIBIO
5. Lead responde WhatsApp -> Margy auto-responde
6. Masterclass -> stage MASTERCLASS_ASISTIO, score sube
7. Kaled genera briefing para cierre
8. Asesor cierra venta -> MATRICULADO
9. Analytics actualizados
10. Kanban muestra tareas completadas

---

## Resumen de Archivos

### Archivos a MODIFICAR (13):
1. `prisma/schema.prisma` - +9 modelos, +8 enums, modificar Prospect/Tenant/User
2. `package.json` - +3 dependencias
3. `src/proxy.ts` - agregar rutas publicas
4. `src/modules/prospects/services/prospect.service.ts` - campos embudo
5. `src/modules/prospects/services/interaction.service.ts` - implementar
6. `src/modules/prospects/types/index.ts` - tipos nuevos
7. `src/modules/prospects/schemas/index.ts` - schemas nuevos
8. `src/modules/whatsapp/services/whatsapp.service.ts` - templates + webhook
9. `src/modules/dashboard/components/DashboardSidebar.tsx` - nav Pipeline
10. `src/modules/admin/components/AdminSidebar.tsx` - nav Tablero IA
11. `src/app/admin/leads/page.tsx` - reemplazar placeholder
12. `src/lib/email.ts` - agregar sendTemplateEmail
13. `.env.local` - variables nuevas

### Archivos NUEVOS (~55):
- **3 modulos:** funnel (6 archivos), email-sequences (7 archivos), agents (8 archivos)
- **~22 API routes** en carpetas funnel/, whatsapp/, email-sequences/, public/, masterclasses/, agents/
- **~15 componentes UI** en carpetas funnel/, landing/, agents/
- **~5 paginas** en lp/, prospectos/pipeline, admin/agents/board
- **5 plantillas HTML** de email
- **1 cron job** para email sequences
