---
description: Genera el "reto de criterio sobre IA" — el diferencial de marca del bootcamp KaledAcademy. Snippet con bug sutil + checklist socrático
argument-hint: [opcional: tema=tema_N_slug]
---

# /kaledacademy:ai-criterion — Agent del Reto de Criterio ⭐

> **Este es el agente más importante del sistema.** Codifica el diferencial de marca del bootcamp KaledAcademy: enseñar a los estudiantes a leer código de IA con criterio. Si fallas en este agente, el bootcamp pierde lo que lo separa del resto.

## El pitch

> "La IA escribe el código. Tú tienes que saber si está bien escrito."
> "El que no tiene fundamentos le cree todo a la IA. El que tiene fundamentos sabe cuándo la IA está mintiendo."

Cada lección merece un momento donde el estudiante reciba código que "una IA generó" y tenga que decidir si se puede mandar a producción. Ese momento es **este reto**, que va en la sesión 2 de la semana.

## Antes de empezar

1. **Lee SIEMPRE** (en este orden):
   - `.claude/commands/kaledacademy/_CONTEXT.md` — modelo `AcademyCRALChallenge`, BDs
   - `.claude/commands/kaledacademy/_ai-criterion-philosophy.md` — los 10 muros, reglas socráticas, el "por qué"
2. **Skills auxiliares (críticos):**
   - `kaledacademy-ai-bug-injector` — catálogo de bugs realistas y plantilla de output
   - `kaledacademy-narrator` — para anclar en KaledSoft
   - `kaledacademy-seed-writer` — cómo extender `seed-kaledacademy-cral.ts`

## Si el usuario no pasó argumentos

> "¿Para qué tema genero el reto de criterio?
> Recuerda: este es el reto de la sesión 2 que entrena al estudiante a leer código de IA con criterio. Es lo que separa KaledAcademy del resto de bootcamps."

Lista los `docs/Temas/context/context-tema_*.md` disponibles.

## Proceso obligatorio

### 1. Leer contexto y verificar viabilidad

Lee `docs/Temas/context/context-{tema}.md` y `docs/Temas/{tema}.html`.

**No todos los temas son aptos** para un reto de criterio. Si el tema es:
- Pura teoría histórica (historia del internet, evolución de JS) sin código
- Conceptos de la semana 1-2 donde el estudiante todavía no entiende sintaxis básica
- Algo que requiere conocer un concepto NO enseñado todavía

→ Genera un reto de **criterio sobre proceso** en lugar de código: "una IA te dice que para hacer X tienes que Y. ¿Qué le preguntarías antes de obedecer?"

En cualquier otro caso, procede con código.

### 2. Elegir UN bug del catálogo

Lee el catálogo en `kaledacademy-ai-bug-injector` (Bug 1 a Bug 10) y elige el que mejor encaje con el tema de la lección. **UN solo bug** — más confunde.

Criterio de elección:
- Debe ser plausible que una IA lo genere para este tema
- Debe ser sutil pero no imposible
- Debe enseñar uno de los 10 muros del bootcamp
- Debe poder ambientarse en KaledDental, KaledWash o KaledPark

### 3. Construir el snippet

Sigue las reglas del skill `kaledacademy-ai-bug-injector`:

- **15-30 líneas** de código
- Sintaxis correcta (debe correr/compilar)
- UN solo bug del catálogo
- **Ambientado en KaledSoft** (uno de los 3 productos)
- Plausible: parece código que una IA realmente generaría con el prompt habitual

### 4. Construir el checklist socrático

**6 preguntas** que invitan al estudiante a mirar el código sin spoilear el bug. Sigue las plantillas socráticas del skill:

- "¿Qué pasaría si...?"
- "¿Quién puede ver/leer/escribir esto?"
- "¿Qué falta validar antes de...?"
- "Si esto se ejecuta 1000 veces por segundo, ¿qué crece?"
- "¿Esta variable existe en el cliente o solo en el servidor?"
- "¿Qué le pasaría a un usuario real de [KaledSoft producto] si esto fallara?"
- "Si fueras el atacante, ¿cómo aprovecharías esto?"

**Anti-patrón:** las preguntas NO deben ser respuestas disfrazadas. Si la pregunta es "¿Notas que `$queryRawUnsafe` está concatenando el ID?" — eso es revelar el bug. Reescribe.

### 5. Construir la sección oculta de análisis

Una sección colapsable que contiene:
- **El problema**: descripción técnica clara del bug
- **Por qué es peligroso**: consecuencia concreta con números/escenario KaledSoft
- **Cómo corregirlo**: snippet corregido lado a lado
- **Fundamento que demuestra**: cuál de los 10 muros
- **Por qué la IA falló**: 1 oración de meta-aprendizaje

### 6. Output 1 — Markdown auditable

Crea (asegúrate que la carpeta existe):
```
docs/Temas/cral/ai-criterion-{tema}.md
```

Sigue **literalmente** la plantilla de la sección "Plantilla del output completo" del skill `kaledacademy-ai-bug-injector`.

### 7. Output 2 — Reemplazar el reto AUDITAR en el seed CRAL

Lee `prisma/seed-kaledacademy-cral.ts`. Localiza el bloque `CRAL_DATA` para esta lección (matching por `lessonHint`).

**Caso A — el bloque existe** (porque el usuario corrió `/cral` antes):
Reemplaza el item del array `challenges` que tiene `phase: CRALPhase.AUDITAR` con la nueva versión:

```typescript
{
  phase: CRALPhase.AUDITAR,
  title: "Reto de criterio: ¿Está bien lo que la IA generó?",
  description: `[contenido completo del checklist socrático + contexto KaledSoft + análisis oculto]`,
  taskCode: `[snippet de 15-30 líneas con el bug]`,
  order: 2,
},
```

**Caso B — el bloque NO existe** (porque el usuario corrió `/ai-criterion` sin haber corrido `/cral`):
Crea un bloque mínimo en `CRAL_DATA` con SOLO el reto AUDITAR:

```typescript
{
  lessonHint: "[palabra clave]",
  challenges: [
    {
      phase: CRALPhase.AUDITAR,
      title: "Reto de criterio: ¿Está bien lo que la IA generó?",
      description: `[...]`,
      taskCode: `[...]`,
      order: 2,
    },
  ],
},
```

Y avisa al usuario: "Solo creé el reto AUDITAR. Si quieres los 4 retos completos (CONSTRUIR/ROMPER/AUDITAR/LANZAR), corre también `/kaledacademy:cral`."

### 8. Reporte final

```
⭐ Reto de criterio generado para: tema_{N}_{slug}

📄 Markdown: docs/Temas/cral/ai-criterion-{tema}.md
📝 Seed actualizado: prisma/seed-kaledacademy-cral.ts (reto AUDITAR)

🎯 Bug elegido del catálogo: {nombre del bug}
🏛️ Muro que entrena: {cuál de los 10 muros}
🛒 Producto KaledSoft: {KaledDental / KaledWash / KaledPark}

📋 Checklist socrático (6 preguntas, sin revelar el bug):
1. ...
2. ...
...

🔧 PARA ACTIVAR EN LA APP — corre el seed contra DEV:

   $env:DATABASE_URL="postgresql://...ep-billowing-dream-anjlrgrr..."
   $env:DIRECT_URL=$env:DATABASE_URL
   npx tsx prisma/seed-kaledacademy-cral.ts

🌐 Validar en: http://kaledacademy.localhost:3000 → ir a la lección → ver la card AUDITAR

⚠️  REVISIÓN HUMANA RECOMENDADA: lee el snippet y el checklist antes de correr el seed.
   El reto de criterio es el corazón del bootcamp. Si el bug no es lo suficientemente
   sutil o la pregunta socrática revela la respuesta, vale la pena iterar.
```

## Reglas anti-error

- **NUNCA** generes un reto con más de un bug (confunde)
- **NUNCA** escribas preguntas socráticas que sean la respuesta disfrazada
- **NUNCA** olvides ambientar en KaledSoft — un snippet genérico no engancha
- **NUNCA** uses bugs imposibles o demasiado obvios (typos, sintaxis rota)
- **SIEMPRE** verifica que el bug es uno de los del catálogo o claramente derivado
- **SIEMPRE** escribe el análisis oculto con números concretos (12.000 pacientes, 200 órdenes, $400.000 perdidos)
