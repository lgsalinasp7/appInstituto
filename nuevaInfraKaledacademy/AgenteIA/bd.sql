-- ── Habilitar pgvector ────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Caché semántico de preguntas ─────────────────────
CREATE TABLE kaled_semantic_cache (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id     TEXT NOT NULL,
  question      TEXT NOT NULL,
  embedding     VECTOR(1536) NOT NULL,
  response      TEXT NOT NULL,
  intent        TEXT NOT NULL,
  cral_phase    TEXT,           -- CONSTRUIR | ROMPER | AUDITAR | LANZAR
  model_used    TEXT NOT NULL,
  tokens_saved  INT  DEFAULT 0,
  hit_count     INT  DEFAULT 0,
  lesson_id     TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX kaled_cache_embedding_idx
  ON kaled_semantic_cache
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX kaled_cache_tenant_idx
  ON kaled_semantic_cache(tenant_id);

-- ── Log de intenciones y uso ──────────────────────────
CREATE TABLE kaled_intent_log (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id     TEXT NOT NULL,
  user_id       TEXT NOT NULL,
  question      TEXT NOT NULL,
  intent        TEXT NOT NULL,
  cral_phase    TEXT,
  complexity    TEXT NOT NULL,
  model_routed  TEXT NOT NULL,
  cache_hit     BOOLEAN DEFAULT false,
  tokens_used   INT     DEFAULT 0,
  lesson_id     TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX kaled_intent_tenant_idx ON kaled_intent_log(tenant_id);
CREATE INDEX kaled_intent_user_idx   ON kaled_intent_log(user_id);
CREATE INDEX kaled_intent_date_idx   ON kaled_intent_log(created_at);

-- ── Historial de revisiones de código ────────────────
CREATE TABLE kaled_code_reviews (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       TEXT NOT NULL,
  user_id         TEXT NOT NULL,
  lesson_id       TEXT,
  cral_phase      TEXT NOT NULL,
  code_submitted  TEXT NOT NULL,
  feedback        TEXT NOT NULL,
  error_patterns  TEXT[],        -- patrones de error detectados
  week_number     INT,
  session_number  INT,
  status          TEXT DEFAULT 'PENDING_APPROVAL', -- PENDING | APPROVED | REJECTED
  approved_by     TEXT,          -- instructor user_id
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX kaled_reviews_user_idx
  ON kaled_code_reviews(user_id);
CREATE INDEX kaled_reviews_tenant_idx
  ON kaled_code_reviews(tenant_id);
CREATE INDEX kaled_reviews_status_idx
  ON kaled_code_reviews(status);

-- ── Memoria de errores recurrentes por estudiante ─────
CREATE TABLE kaled_student_error_patterns (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       TEXT NOT NULL,
  user_id         TEXT NOT NULL,
  error_pattern   TEXT NOT NULL,  -- ej: "mutacion_estado_react"
  error_label     TEXT NOT NULL,  -- ej: "Mutación directa de estado en React"
  occurrences     INT DEFAULT 1,
  first_seen_at   TIMESTAMPTZ DEFAULT now(),
  last_seen_at    TIMESTAMPTZ DEFAULT now(),
  lesson_ids      TEXT[],         -- en qué sesiones apareció
  resolved        BOOLEAN DEFAULT false,
  resolved_at     TIMESTAMPTZ
);

CREATE INDEX kaled_errors_user_idx
  ON kaled_student_error_patterns(user_id, tenant_id);

-- ── Tareas del instructor (alertas de Kaled) ──────────
CREATE TABLE kaled_instructor_tasks (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       TEXT NOT NULL,
  instructor_id   TEXT NOT NULL,
  student_id      TEXT NOT NULL,
  type            TEXT NOT NULL,  -- BLOCKED | LOW_PROGRESS | TOKEN_ALERT | PATTERN_DETECTED | DELIVERABLE_REVIEW
  priority        TEXT DEFAULT 'MEDIUM', -- HIGH | MEDIUM | LOW
  title           TEXT NOT NULL,
  diagnosis       TEXT NOT NULL,  -- diagnóstico completo de Kaled
  suggestion      TEXT NOT NULL,  -- sugerencia de acción
  metadata        JSONB,          -- datos adicionales
  status          TEXT DEFAULT 'PENDING', -- PENDING | REVIEWED | RESOLVED | DISMISSED
  reviewed_at     TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX kaled_tasks_instructor_idx
  ON kaled_instructor_tasks(instructor_id, status);
CREATE INDEX kaled_tasks_tenant_idx
  ON kaled_instructor_tasks(tenant_id);
CREATE INDEX kaled_tasks_priority_idx
  ON kaled_instructor_tasks(priority, status);

-- ── Evaluaciones pre-aprobadas de entregables ─────────
CREATE TABLE kaled_deliverable_evaluations (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id         TEXT NOT NULL,
  submission_id     TEXT NOT NULL,  -- → AcademyDeliverableSubmission.id
  user_id           TEXT NOT NULL,
  cral_phase        TEXT NOT NULL,
  code_reviewed     TEXT,           -- código que pegó el estudiante
  feedback_construir TEXT,
  feedback_romper    TEXT,
  feedback_auditar   TEXT,
  feedback_lanzar    TEXT,
  overall_feedback   TEXT NOT NULL,
  strengths          TEXT[],
  improvements       TEXT[],
  socratic_questions TEXT[],        -- preguntas para el estudiante
  status            TEXT DEFAULT 'PENDING_APPROVAL',
  approved_by       TEXT,
  approved_at       TIMESTAMPTZ,
  visible_to_student BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX kaled_evals_submission_idx
  ON kaled_deliverable_evaluations(submission_id);
CREATE INDEX kaled_evals_status_idx
  ON kaled_deliverable_evaluations(status);

-- ── Métricas de cohorte para marketing ───────────────
CREATE TABLE kaled_cohort_metrics (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id             TEXT NOT NULL,
  cohort_id             TEXT NOT NULL,
  snapshot_date         DATE NOT NULL,
  total_students        INT DEFAULT 0,
  students_on_track     INT DEFAULT 0,  -- progreso >= promedio
  students_at_risk      INT DEFAULT 0,  -- bloqueados o inactivos
  saas_deployed_count   INT DEFAULT 0,  -- proyectos en producción
  avg_progress          DECIMAL(5,2),
  total_kaled_queries   INT DEFAULT 0,
  cache_hit_rate        DECIMAL(5,2),   -- % de preguntas respondidas sin tokens
  tokens_saved          INT DEFAULT 0,
  deliverables_approved INT DEFAULT 0,
  UNIQUE(cohort_id, snapshot_date)
);