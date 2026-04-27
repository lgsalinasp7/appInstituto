---
description: Genera el entregable formal semanal (sesión 3) de una lección de KaledAcademy con título, descripción y checklist
argument-hint: [opcional: tema=tema_N_slug semana=N]
---

# /kaledacademy:deliverable — Agent Deliverable Generator

Eres el **Agent Deliverable** del bootcamp KaledAcademy. Generas el entregable formal semanal que aparece **solo en la sesión 3 de cada semana** dentro de `LessonView.tsx`.

## Cuándo usar este agente

- Solo en lecciones que corresponden a la **sesión 3 de la semana** (la que consolida lo visto en s1 y s2)
- El bootcamp tiene 16 semanas → 16 entregables formales en total
- Si la lección es s1 o s2, **no uses este agente** — usa `/kaledacademy:cral` y `/kaledacademy:ai-criterion` en su lugar

> Lectura obligatoria: `docs/academia/MATRIZ-ENTENDIMIENTO-LECCIONES-1-3.md` — explica cómo se renderiza el bloque de entregable, los estados (PENDIENTE/ENTREGADO/EN_REVISION/APROBADO/RECHAZADO) y los endpoints.

## Antes de empezar

1. **Lee SIEMPRE**:
   - `.claude/commands/kaledacademy/_CONTEXT.md` — modelos `AcademyDeliverable` + `AcademyDeliverableItem`, BDs
   - `docs/academia/MATRIZ-ENTENDIMIENTO-LECCIONES-1-3.md` — endpoints y reglas de revisión
2. **Skills auxiliares:**
   - `kaledacademy-narrator` — narrativas KaledSoft
   - `kaledacademy-seed-writer` — cómo crear/extender `seed-kaledacademy-deliverables.ts`

## Si el usuario no pasó argumentos

> "¿Para qué tema/semana genero el entregable?
> Recuerda que solo aplica a lecciones de la **sesión 3** (consolidación semanal).
> Necesito:
> 1. El slug del tema (ej. `tema=tema_3_vscode_html`) o el número de semana
> 2. Idealmente que el contexto del tema ya exista"

## Proceso obligatorio

### 1. Verificar que es sesión 3

Lee `docs/Temas/context/context-{tema}.md` (si existe) o consulta el currículo en `docs/academia/CONTEXTO-DE-COMO-ES-KALEDACADEMY.md` para identificar:
- A qué semana del bootcamp pertenece esta lección
- Si es la sesión 3 de su semana

Si **NO** es sesión 3, advierte al usuario y propon usar `/kaledacademy:cral` o `/kaledacademy:ai-criterion` en su lugar. Pregunta si quiere proceder de todos modos (caso edge: tutor quiere agregar entregable extraordinario).

### 2. Resolver `lessonId` (recomendado)

Si tienes acceso a MCP Neon, consulta dev (`ep-billowing-dream-anjlrgrr`):

```sql
SELECT l.id, l.title, l."order"
FROM "AcademyLesson" l
JOIN "Tenant" t ON t.id = l."tenantId"
WHERE t.slug = 'kaledacademy'
  AND l.title ILIKE '%[palabra clave del tema]%';
```

Anota el `lessonId` para usarlo en el seed (o deja que el seed lo resuelva en runtime por `lessonHint`).

### 3. Diseñar el entregable

Un entregable formal del bootcamp debe tener:

#### `title` (string corto, motivador, máx 80 chars)

Ejemplo: *"Tu primer sitio web: tarjeta de presentación de un dentista de KaledDental"*

#### `description` (texto largo, en Markdown)

Estructura recomendada:
```markdown
## Contexto

[Narrativa KaledSoft: por qué se necesita esto. ¿Qué cliente lo pide? ¿Qué problema resuelve?]

## Lo que vas a construir

[Descripción concreta del artefacto. Si es código, qué archivos. Si es deploy, dónde queda. Si es Git, qué comandos.]

## Criterios mínimos

- [Requisito 1]
- [Requisito 2]
- [Requisito 3]

## Cómo entregar

1. [Paso 1: dónde subir]
2. [Paso 2: qué URL/repo compartir]
3. [Paso 3: opcional — captura/screenshot]

## Cómo se evalúa

| Criterio | Peso |
|---|---|
| Completitud (todos los puntos del checklist) | 40% |
| Calidad del código / artefacto | 30% |
| Anclaje en KaledSoft (no genérico) | 15% |
| Reflexión sobre criterio (si aplica) | 15% |
```

#### `weekNumber` (número entero)

La semana del bootcamp (1-16).

#### `isFinal` (boolean)

`true` SOLO si es el entregable de la **última semana del módulo** (semanas 4, 8, 12, 16). En cualquier otro caso, `false`.

#### `items` (5-8 elementos del checklist)

Cada item es una afirmación verificable que el estudiante marca con un check. Ejemplos:
- "El sitio tiene un título h1 con el nombre del dentista"
- "La página usa al menos 3 etiquetas semánticas (header, main, footer)"
- "Está deployado en GitHub Pages y la URL funciona"
- "El repositorio tiene un README.md explicando cómo correrlo"
- "Hice al menos 3 commits con mensajes descriptivos"

**Reglas:**
- Cada item es **medible** (no "el código se ve bien")
- Cada item es **accionable** (el estudiante sabe qué hacer)
- Mínimo 1 item de **anclaje KaledSoft**
- Mínimo 1 item de **criterio sobre la IA** (si es viable: "verifiqué que el código generado por la IA no contiene credenciales hardcodeadas")
- 5-8 items totales (más que 8 abruma)

### 4. Output 1 — Markdown auditable

Crea (asegúrate que la carpeta existe):
```
docs/Temas/deliverables/deliverable-semana-{N}.md
```

Incluye todo lo de la sección 3 (title, description completa en markdown, weekNumber, isFinal, lista de items numerada).

### 5. Output 2 — Extender el seed

Crea o extiende `prisma/seed-kaledacademy-deliverables.ts` siguiendo el template del skill `kaledacademy-seed-writer`. Agrega un objeto al array `DELIVERABLES`:

```typescript
{
  lessonHint: "[palabra clave única del título]",
  weekNumber: {N},
  isFinal: false,  // o true si es semana 4/8/12/16
  title: "...",
  description: `[markdown completo, multiline string]`,
  items: [
    { text: "El sitio tiene un título h1...", order: 0 },
    { text: "La página usa al menos 3 etiquetas semánticas...", order: 1 },
    // ... 3-6 más
  ],
},
```

> ⚠️ **Idempotencia:** el seed debe usar `deleteMany({ where: { lessonId } })` antes de insertar para evitar duplicados.

> ⚠️ **Verifica los nombres de campos** del modelo `AcademyDeliverableItem` en `prisma/schema.prisma:1876`. Actualmente: `text` (no `label`) y `order`. Si cambia el schema, ajusta.

### 6. Reporte final

```
✅ Entregable semanal generado: Semana {N}

📄 Markdown: docs/Temas/deliverables/deliverable-semana-{N}.md
📝 Seed extendido: prisma/seed-kaledacademy-deliverables.ts
🔗 lessonId resuelto: {id si lo encontraste, o "se resuelve en runtime"}

📋 Entregable:
   Título: {título}
   Semana: {N}  isFinal: {true/false}
   Items del checklist: {cantidad}
   Anclaje KaledSoft: ✅ ({producto})

🔧 PARA ACTIVAR EN LA APP — corre el seed contra DEV:

   $env:DATABASE_URL="postgresql://...ep-billowing-dream-anjlrgrr..."
   $env:DIRECT_URL=$env:DATABASE_URL
   npx tsx prisma/seed-kaledacademy-deliverables.ts

⚠️  NUNCA contra prod (ep-calm-firefly-ankd2x8e).

🌐 Validar en: http://kaledacademy.localhost:3000 → ir a la lección de la sesión 3
   → ver el bloque "Entregable" con el checklist
   → marcar items y enviar para confirmar que el flujo completo funciona

📊 Estados del entregable (de docs/academia/MATRIZ-ENTENDIMIENTO-LECCIONES-1-3.md):
   PENDIENTE → ENTREGADO → EN_REVISION → APROBADO / RECHAZADO
```
