---
name: kaledacademy-seed-writer
description: Cómo editar los seeds de Prisma de KaledAcademy (animaciones interactivas, quizzes, retos CRAL, entregables) sin romper el patrón existente. Úsalo cuando un comando de KaledAcademy necesite agregar entries a un seed o crear un seed nuevo. Documenta también cómo ejecutarlos contra la base de dev (nunca prod).
---

# Skill: Escritor de Seeds de KaledAcademy

## Propósito

Guía operativa para editar/crear los seeds de Prisma usados por los agentes `/kaledacademy:embed`, `/kaledacademy:quiz`, `/kaledacademy:cral`, `/kaledacademy:ai-criterion`, `/kaledacademy:deliverable`. Respeta los patrones existentes y nunca toca la base de producción automáticamente.

## Mapa de seeds

| Seed | Quién lo edita | Modelos Prisma | Estado actual |
|---|---|---|---|
| `prisma/seed-kaledacademy-v3.ts` | `/embed` | `AcademyInteractiveAnimation` | YA EXISTE — solo agregar entries |
| `prisma/seed-kaledacademy-quizzes.ts` | `/quiz` | `AcademyQuiz`, `AcademyQuizOption` | NO existe — créalo la primera vez |
| `prisma/seed-kaledacademy-cral.ts` | `/cral`, `/ai-criterion` | `AcademyCRALChallenge` | NO existe — créalo la primera vez |
| `prisma/seed-kaledacademy-deliverables.ts` | `/deliverable` | `AcademyDeliverable`, `AcademyDeliverableItem` | NO existe — créalo la primera vez |

## Constantes compartidas

Todos los seeds nuevos deben empezar con el mismo header (igual que `seed-kaledacademy-v3.ts`):

```typescript
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";

const root = process.cwd();
loadEnv({ path: path.join(root, ".env") });
loadEnv({ path: path.join(root, ".env.local"), override: true });

const prisma = new PrismaClient();

const KALEDACADEMY_SLUG = "kaledacademy";

async function getTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findUnique({ where: { slug: KALEDACADEMY_SLUG } });
  if (!tenant) throw new Error(`Tenant ${KALEDACADEMY_SLUG} no existe en la base de datos`);
  return tenant.id;
}
```

---

## 1. Editar `seed-kaledacademy-v3.ts` (agente `/embed`)

### Paso 1 — Localizar el array

El archivo tiene un array llamado `INTERACTIVE_ANIMATIONS_SEED` (~línea 34) con esta forma:

```typescript
const INTERACTIVE_ANIMATIONS_SEED: Array<{
  slug: string;
  title: string;
  description?: string;
  sourceDocHint: string;
  sortOrder: number;
}> = [
  {
    slug: "viaje_url",
    title: "El viaje de una URL",
    description: "Desde la IP en tu PC hasta el render en el navegador.",
    sourceDocHint: "docs/Temas/tema_1_viaje_url.html",
    sortOrder: 1,
  },
  // ... entradas existentes
];
```

### Paso 2 — Calcular el siguiente `sortOrder`

Lee el archivo, encuentra el `sortOrder` máximo actual y suma 1.

### Paso 3 — Insertar el entry nuevo al final del array

```typescript
{
  slug: "{slug-del-tema}",
  title: "{Título Legible}",
  description: "{Una oración describiendo qué aprende el estudiante}",
  sourceDocHint: "docs/Temas/tema_{N}_{slug}.html",
  sortOrder: {N},
},
```

**REGLAS:**
- ⚠️ NO uses `htmlContent` con `fs.readFileSync` — el patrón actual del seed es **solo `sourceDocHint`** (string con la ruta)
- ⚠️ NO modifiques entries existentes
- ⚠️ NO renumeres `sortOrder` de los existentes

---

## 2. Crear/extender `seed-kaledacademy-quizzes.ts` (agente `/quiz`)

### Si el archivo NO existe, créalo así

```typescript
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";

const root = process.cwd();
loadEnv({ path: path.join(root, ".env") });
loadEnv({ path: path.join(root, ".env.local"), override: true });

const prisma = new PrismaClient();

const KALEDACADEMY_SLUG = "kaledacademy";

async function getTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findUnique({ where: { slug: KALEDACADEMY_SLUG } });
  if (!tenant) throw new Error("Tenant kaledacademy no existe");
  return tenant.id;
}

async function findLessonByTitleHint(tenantId: string, hint: string) {
  const lesson = await prisma.academyLesson.findFirst({
    where: { tenantId, title: { contains: hint, mode: "insensitive" } },
  });
  if (!lesson) throw new Error(`No encontré AcademyLesson con título que contenga "${hint}"`);
  return lesson;
}

type QuizSeed = {
  lessonHint: string;
  questions: Array<{
    question: string;
    options: Array<{ label: string; text: string; isCorrect: boolean; feedback?: string }>;
  }>;
};

const QUIZZES: QuizSeed[] = [
  // ← los agentes /quiz agregan bloques aquí
];

async function main() {
  const tenantId = await getTenantId();

  for (const quiz of QUIZZES) {
    const lesson = await findLessonByTitleHint(tenantId, quiz.lessonHint);

    // Idempotencia: borrar quizzes previos de esta lección antes de re-sembrar
    await prisma.academyQuiz.deleteMany({ where: { lessonId: lesson.id } });

    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      await prisma.academyQuiz.create({
        data: {
          lessonId: lesson.id,
          tenantId,
          question: q.question,
          order: i,
          options: {
            create: q.options.map(o => ({
              label: o.label,
              text: o.text,
              isCorrect: o.isCorrect,
              feedback: o.feedback ?? null,
            })),
          },
        },
      });
    }

    console.log(`✅ Quiz sembrado para lección "${lesson.title}" (${quiz.questions.length} preguntas)`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

### Para extender (cada vez que /quiz corre)

Solo agrega un objeto nuevo al array `QUIZZES` con `lessonHint` (palabra clave del título) y las preguntas. NO duplicar — si ya existe entry para esa lección, reemplázalo.

---

## 3. Crear/extender `seed-kaledacademy-cral.ts` (agentes `/cral` y `/ai-criterion`)

### Estructura inicial

```typescript
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { PrismaClient, CRALPhase } from "@prisma/client";

const root = process.cwd();
loadEnv({ path: path.join(root, ".env") });
loadEnv({ path: path.join(root, ".env.local"), override: true });

const prisma = new PrismaClient();

const KALEDACADEMY_SLUG = "kaledacademy";

async function getTenantId(): Promise<string> {
  const t = await prisma.tenant.findUnique({ where: { slug: KALEDACADEMY_SLUG } });
  if (!t) throw new Error("Tenant kaledacademy no existe");
  return t.id;
}

async function findLessonByTitleHint(tenantId: string, hint: string) {
  const l = await prisma.academyLesson.findFirst({
    where: { tenantId, title: { contains: hint, mode: "insensitive" } },
  });
  if (!l) throw new Error(`No encontré lección con "${hint}"`);
  return l;
}

type CRALSeed = {
  lessonHint: string;
  challenges: Array<{
    phase: CRALPhase;
    title: string;
    description: string;
    taskCode?: string;
    order: number;
  }>;
};

const CRAL_DATA: CRALSeed[] = [
  // ← los agentes /cral y /ai-criterion agregan bloques aquí
];

async function main() {
  const tenantId = await getTenantId();

  for (const item of CRAL_DATA) {
    const lesson = await findLessonByTitleHint(tenantId, item.lessonHint);

    // Idempotencia
    await prisma.academyCRALChallenge.deleteMany({ where: { lessonId: lesson.id } });

    for (const c of item.challenges) {
      await prisma.academyCRALChallenge.create({
        data: {
          lessonId: lesson.id,
          tenantId,
          phase: c.phase,
          title: c.title,
          description: c.description,
          taskCode: c.taskCode ?? null,
          order: c.order,
        },
      });
    }

    console.log(`✅ ${item.challenges.length} retos CRAL para "${lesson.title}"`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

### Convención de orden

- `order: 0` → CONSTRUIR (sesión 1)
- `order: 1` → ROMPER (sesión 1 o 2)
- `order: 2` → AUDITAR (sesión 2 — aquí va el reto de criterio del agente `/ai-criterion`)
- `order: 3` → LANZAR (sesión 3)

### Diferencia entre `/cral` y `/ai-criterion`

- `/cral` genera **los 4 retos básicos** (uno por fase) con escenarios genéricos en KaledSoft.
- `/ai-criterion` **reemplaza el reto AUDITAR** (`order: 2`) con uno que tiene `taskCode` cargado con código de IA buggy + checklist socrático en `description`.

Cuando `/ai-criterion` corre después de `/cral`, debe localizar el bloque CRAL existente para esa lección y reemplazar el item con `phase: AUDITAR`.

---

## 4. Crear/extender `seed-kaledacademy-deliverables.ts` (agente `/deliverable`)

```typescript
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";

const root = process.cwd();
loadEnv({ path: path.join(root, ".env") });
loadEnv({ path: path.join(root, ".env.local"), override: true });

const prisma = new PrismaClient();

const KALEDACADEMY_SLUG = "kaledacademy";

async function getTenantId(): Promise<string> {
  const t = await prisma.tenant.findUnique({ where: { slug: KALEDACADEMY_SLUG } });
  if (!t) throw new Error("Tenant kaledacademy no existe");
  return t.id;
}

async function findLessonByTitleHint(tenantId: string, hint: string) {
  const l = await prisma.academyLesson.findFirst({
    where: { tenantId, title: { contains: hint, mode: "insensitive" } },
  });
  if (!l) throw new Error(`No encontré lección con "${hint}"`);
  return l;
}

type DeliverableSeed = {
  lessonHint: string;
  weekNumber: number;
  isFinal: boolean;
  title: string;
  description: string;
  items: Array<{ text: string; order: number }>;
};

const DELIVERABLES: DeliverableSeed[] = [
  // ← el agente /deliverable agrega bloques aquí
];

async function main() {
  const tenantId = await getTenantId();

  for (const d of DELIVERABLES) {
    const lesson = await findLessonByTitleHint(tenantId, d.lessonHint);

    // Idempotencia
    await prisma.academyDeliverable.deleteMany({ where: { lessonId: lesson.id } });

    await prisma.academyDeliverable.create({
      data: {
        lessonId: lesson.id,
        tenantId,
        weekNumber: d.weekNumber,
        isFinal: d.isFinal,
        title: d.title,
        description: d.description,
        checkItems: {
          create: d.items.map(i => ({
            text: i.text,
            order: i.order,
          })),
        },
      },
    });

    console.log(`✅ Entregable semana ${d.weekNumber}: "${d.title}"`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

> ⚠️ **VERIFICAR** los nombres exactos de los campos `AcademyDeliverableItem` (label, description, order) leyendo `prisma/schema.prisma:1876` antes de la primera ejecución. Ajustar si difieren.

---

## Cómo correr cualquier seed (PowerShell — solo dev)

```powershell
$env:DATABASE_URL="postgresql://...ep-billowing-dream-anjlrgrr..."
$env:DIRECT_URL=$env:DATABASE_URL
npx tsx prisma/seed-kaledacademy-v3.ts          # o el seed que toque
```

### REGLAS INVIOLABLES

1. **NUNCA** corras un seed contra `ep-calm-firefly-ankd2x8e` (prod) automáticamente
2. **SIEMPRE** verifica que `DATABASE_URL` apunta a `ep-billowing-dream-anjlrgrr` (dev) antes de ejecutar
3. **Los slash commands NO ejecutan seeds** — solo los modifican y reportan al usuario el comando exacto
4. **Idempotencia obligatoria**: cada seed debe poder correrse N veces sin duplicar (usar `deleteMany` previo o `upsert`)
