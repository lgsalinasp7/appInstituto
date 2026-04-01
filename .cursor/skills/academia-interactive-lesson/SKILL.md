---
name: academia-interactive-lesson
description: >
  Reemplaza el video de YouTube de una leccion de KaledAcademy por una animacion
  interactiva HTML y genera quizzes. Usar cuando el usuario pide implementar una nueva
  leccion interactiva, reemplazar un video por animacion, o agregar quizzes a una leccion.
  Cubre: copiar HTML, crear componente React, registrar en registry, actualizar seed,
  insertar en BD DEV y PROD, y agregar fallback en el servicio.
---

# Implementar Leccion Interactiva en KaledAcademy

Workflow completo para reemplazar el video de YouTube de una leccion por una animacion HTML interactiva y generar quizzes de comprension.

## Prerequisitos

- HTML de la animacion listo (normalmente en `docs/`)
- `lessonId` de la leccion destino
- Acceso a BD DEV (`ep-billowing-dream-anjlrgrr`) y PROD (`ep-calm-firefly-ankd2x8e`)
- `tenantId` de KaledAcademy: `cmm76nr4a0000vstwszautln3`

## Pasos

### 1. Copiar HTML a public/interactive/

```bash
cp docs/NOMBRE_TEMA.html public/interactive/SLUG-CON-GUIONES.html
```

Convencion de nombres:
- Slug en BD y registry: `snake_case` (ej: `git_control_versiones`)
- Archivo HTML: `kebab-case` (ej: `git-control-versiones.html`)

### 2. Crear componente React wrapper

Crear `src/modules/academia/components/student/interactive-lessons/SLUG-KEBAB/NombreAnimation.tsx`:

```tsx
"use client";

export type NombreAnimationProps = {
  embedded?: boolean;
  titleFromLesson?: string;
  className?: string;
};

export function NombreAnimation({
  embedded,
  titleFromLesson: _titleFromLesson,
  className,
}: NombreAnimationProps) {
  const frameHeight = embedded ? "min(85vh, 900px)" : "calc(100vh - 160px)";
  return (
    <div className={`relative w-full ${className ?? ""}`}>
      <iframe
        title="Titulo de la Leccion"
        src="/interactive/SLUG-CON-GUIONES.html"
        className="w-full rounded-xl border border-white/10 bg-slate-950"
        style={{ height: frameHeight }}
      />
    </div>
  );
}
```

### 3. Registrar en registry.tsx

Archivo: `src/modules/academia/components/student/interactive-lessons/registry.tsx`

Agregar lazy import y entrada en REGISTRY:

```tsx
const NombreAnimation = lazy(() =>
  import("./slug-kebab/NombreAnimation").then((m) => ({
    default: m.NombreAnimation,
  }))
);

// En REGISTRY:
const REGISTRY = {
  // ... existentes ...
  slug_snake: NombreAnimation,
} satisfies Record<string, LazyInteractive>;
```

### 4. Agregar fallback en academy.service.ts

Archivo: `src/modules/academy/services/academy.service.ts`

En la funcion `attachInteractiveAnimationFallbackIfMissing`, agregar deteccion por titulo:

```ts
if (t.includes("palabra_clave_del_titulo")) {
  lesson.meta.interactiveAnimation = await loadInteractiveOrFallback(
    tenantId,
    "slug_snake",
    "Titulo Completo"
  );
  return;
}
```

Esto permite que lecciones sin FK directo al catalogo sigan mostrando la animacion (migraciones parciales).

### 5. Actualizar seed-kaledacademy-v3.ts

Archivo: `prisma/seed-kaledacademy-v3.ts`

**5a.** Agregar al array `INTERACTIVE_ANIMATIONS_SEED`:

```ts
{
  slug: "slug_snake",
  title: "Titulo de la Leccion",
  description: "Descripcion breve.",
  sourceDocHint: "docs/archivo_original.html",
  sortOrder: N,  // siguiente numero
},
```

**5b.** Agregar llamada a `linkInteractiveLessonByModuleOrder` en AMBAS funciones `main()` y `mainContentOnly()`:

```ts
await linkInteractiveLessonByModuleOrder(prisma, tenant.id, course.id, MODULO, ORDEN_LECCION, "slug_snake");
```

**5c.** Actualizar el mensaje de console.log para incluir el nuevo slug.

### 6. Insertar en BD DEV y PROD

Crear script temporal `scripts/update-lessonN-animation.js`:

```js
const { PrismaClient } = require("@prisma/client");

async function updateDatabase(label, dbUrl) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  try {
    console.log(`\n========== ${label} ==========`);
    const tenantId = "cmm76nr4a0000vstwszautln3";

    // 1) Buscar leccion por modulo y orden
    const lesson = await prisma.academyLesson.findFirst({
      where: { module: { order: MODULO }, order: ORDEN_LECCION },
      include: { meta: { include: { interactiveAnimation: { select: { id: true, slug: true } } } } },
    });
    if (!lesson) { console.log("  SKIP: Lesson not found"); return; }

    // 2) Upsert animacion
    const anim = await prisma.academyInteractiveAnimation.upsert({
      where: { tenantId_slug: { tenantId, slug: "slug_snake" } },
      create: { tenantId, slug: "slug_snake", title: "...", description: "...", sourceDocHint: "...", sortOrder: N, isActive: true },
      update: { title: "...", description: "...", sourceDocHint: "...", sortOrder: N, isActive: true },
    });

    // 3) Vincular LessonMeta
    if (lesson.meta) {
      await prisma.academyLessonMeta.update({
        where: { lessonId: lesson.id },
        data: { interactiveAnimationId: anim.id },
      });
    }

    // 4) Insertar quizzes si faltan (ver seccion de quizzes)
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const dotenv = require("dotenv");
  const path = require("path");
  dotenv.config({ path: path.join(process.cwd(), ".env") });
  const devUrl = process.env.DATABASE_URL;
  const prodEnv = dotenv.config({ path: path.join(process.cwd(), ".env.prod.tmp") });
  const prodUrl = prodEnv.parsed?.DATABASE_URL;
  if (devUrl) await updateDatabase("LOCAL-DEV", devUrl);
  if (prodUrl) await updateDatabase("PROD", prodUrl);
}
main().catch((e) => { console.error(e); process.exit(1); });
```

Para obtener `.env.prod.tmp`:

```bash
npx vercel link --yes --project app-instituto
npx vercel env pull --environment=production --yes .env.prod.tmp
```

Ejecutar y luego borrar archivos temporales:

```bash
node scripts/update-lessonN-animation.js
del scripts/update-lessonN-animation.js
del .env.prod.tmp
```

### 7. Generar quizzes (5 preguntas)

Cada leccion del Modulo 1 usa `sequentialMasteryMode` (una pregunta a la vez, 5/5 para completar).

Estructura de cada quiz en la BD:

```js
{
  lessonId: "...",
  tenantId: "cmm76nr4a0000vstwszautln3",
  question: "Pregunta clara basada en el contenido de la animacion",
  order: 0,  // 0-4 para 5 preguntas
  options: {
    create: [
      { label: "A", text: "Opcion A", isCorrect: false, feedback: "Retroalimentacion que explica por que es incorrecta." },
      { label: "B", text: "Opcion B", isCorrect: true, feedback: "Retroalimentacion positiva que refuerza el concepto." },
      { label: "C", text: "Opcion C", isCorrect: false, feedback: "Retroalimentacion educativa." },
      { label: "D", text: "Opcion D", isCorrect: false, feedback: "Retroalimentacion educativa." },
    ],
  },
}
```

Reglas para quizzes:
- Exactamente 4 opciones (A, B, C, D) por pregunta
- Solo 1 correcta por pregunta
- Feedback educativo en TODAS las opciones (correctas e incorrectas)
- Basados en el contenido real de la animacion HTML
- Usar `order: 0` a `order: 4`
- Una leccion existente puede tener 1 quiz previo (seed v1); verificar antes de insertar

### 8. Verificar en navegador

Navegar a la leccion y confirmar:
- [ ] La animacion interactiva reemplaza al video de YouTube
- [ ] Las slides/contenido de la animacion funcionan correctamente
- [ ] Los quizzes se muestran en modo secuencial (1 de 5, con dots)
- [ ] Cada opcion muestra feedback al responder

## Archivos involucrados

| Archivo | Rol |
|---------|-----|
| `public/interactive/*.html` | HTMLs estaticos de animaciones |
| `src/modules/academia/components/student/interactive-lessons/*/` | Componentes React wrapper |
| `src/modules/academia/components/student/interactive-lessons/registry.tsx` | Registry de slugs a componentes |
| `src/modules/academia/components/student/interactive-lessons/interactive-lesson-types.ts` | Props base del componente |
| `src/modules/academy/services/academy.service.ts` | Fallback por titulo (sin FK directo) |
| `src/modules/academia/components/student/LessonView.tsx` | Vista de leccion (renderiza animacion y quizzes) |
| `prisma/seed-kaledacademy-v3.ts` | Seed idempotente con catalogo y vinculos |

## Modelo de datos (Prisma)

```
AcademyInteractiveAnimation
  - id, tenantId, slug (unique con tenantId), title, description, sourceDocHint, isActive, sortOrder

AcademyLessonMeta
  - lessonId (FK a AcademyLesson), interactiveAnimationId (FK a AcademyInteractiveAnimation)
  - videoUrl (se mantiene como fallback; la animacion tiene prioridad en el UI)

AcademyQuiz
  - lessonId, tenantId, question, order

AcademyQuizOption
  - quizId, label, text, isCorrect, feedback
```

## Logica de renderizado (LessonView.tsx)

```
if (meta.interactiveAnimation && isRegisteredInteractiveSlug(slug))
  -> Renderizar InteractiveLessonRenderer (iframe)
else if (meta.interactiveAnimation && slug no registrado)
  -> Warning en dev, renderizar video
else
  -> Renderizar video de YouTube
```

El modo `sequentialMasteryMode` (quiz una por una) se activa para todo el Modulo 1:

```ts
const enforceQuizMastery = lesson.moduleOrder === 1;
const sequentialMasteryMode = enforceQuizMastery && lesson.quizzes.length >= 5;
```
