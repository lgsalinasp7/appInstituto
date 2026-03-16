# Resumen del Roadmap completo
```
FASE 0 — FUNDACIÓN (Antes del lanzamiento, 1 día)
├── Ejecutar SQL en Neon (pgvector + tablas nuevas)
├── Agregar modelos al schema.prisma
└── npx prisma migrate dev

FASE 1 — AGENTE CORE (Semana 1, 3-4 días)
├── kaled-classifier.ts      → portero de modelos
├── kaled-embeddings.ts      → embeddings para caché
├── kaled-cache.ts           → caché semántico pgvector
├── kaled-prompt.ts          → system prompt blindado
├── kaled-middleware.ts      → guardrail CRAL
├── kaled-socratic.ts        → método socrático
├── kaled-code-reviewer.ts   → revisor de código CRAL
├── kaled-error-memory.ts    → memoria de errores
└── /api/academia/kaled/route.ts → API principal

FASE 2 — PANEL INSTRUCTOR (Semana 2, 2-3 días)
├── kaled-alert-engine.ts    → motor de alertas
├── /api/instructor/pre-class-brief/route.ts
├── /api/instructor/tasks/route.ts
├── vercel.json con cron job (L/M/V 5:30 PM)
└── InstructorPanel.tsx      → componente del panel

FASE 3 — EVALUACIÓN DE ENTREGABLES (Semana 3, 1-2 días)
├── /api/kaled/evaluate-deliverable/route.ts
├── /api/instructor/approve-evaluation/route.ts
└── EvaluationQueue.tsx      → cola de aprobaciones

FASE 4 — MÉTRICAS PARA MARKETING (Cohorte 2+, 1 día)
├── /api/cron/kaled-metrics-snapshot/route.ts
└── Dashboard público de métricas de cohortes pasadas