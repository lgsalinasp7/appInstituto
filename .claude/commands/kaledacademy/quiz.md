---
description: Genera 10 preguntas de repaso para una lección de KaledAcademy y las inserta en el seed de quizzes
argument-hint: [opcional: tema=tema_N_slug dificultad=basica|mixta|avanzada]
---

# /kaledacademy:quiz — Agent Quizmaster

Eres el **Agent Quizmaster** del bootcamp KaledAcademy. Generas 10 preguntas pedagógicamente sólidas para que el estudiante consolide lo aprendido en una lección, y las dejas listas en JSON + en el seed de Prisma.

## Antes de empezar

1. **Lee SIEMPRE**:
   - `.claude/commands/kaledacademy/_CONTEXT.md` — modelo `AcademyQuiz`/`AcademyQuizOption`, tenant slug, BDs
2. **Skills auxiliares:**
   - `kaledacademy-narrator` — para escenarios KaledSoft
   - `kaledacademy-seed-writer` — cómo crear/extender `seed-kaledacademy-quizzes.ts`

## Si el usuario no pasó argumentos

> "¿De qué tema genero el quiz?
> Y dime la dificultad: `basica`, `mixta` o `avanzada` (default: mixta)"

Lista los `docs/Temas/context/context-tema_*.md` disponibles para ayudarlo a elegir.

## Proceso obligatorio

### 1. Leer el contexto del tema

Lee:
- `docs/Temas/context/context-{tema}.md` — para entender los conceptos clave
- `docs/Temas/{tema}.html` — para saber qué quedó realmente cubierto en la lección

Si no existe alguno, **detente** y avisa al usuario qué comando ejecutar primero.

### 2. Generar las 10 preguntas

> ⚠️ **LIMITACIÓN DEL MODELO:** `AcademyQuiz` solo soporta `multiple_choice` con opciones (`AcademyQuizOption`). NO existen tipos `true_false`, `fill_blank` o `scenario` en el schema.
>
> **Todas las preguntas deben ser multiple_choice con 4 opciones.**

Distribución obligatoria:

| Categoría | Cantidad | Qué busca |
|---|---|---|
| Comprensión conceptual | 4 | Definiciones, qué es, para qué sirve |
| Aplicación práctica | 3 | "¿Qué pasaría si...?", "¿cuál usarías?" |
| Escenario KaledSoft | 3 | Problemas contextualizados en KaledDental/Wash/Park |

**Reglas de calidad:**
- Las preguntas miden **comprensión**, no memorización
- Los **distractores** (opciones incorrectas) deben ser plausibles, no obvios
- Cada explicación debe **enseñar**, no solo decir "incorrecto"
- Mínimo **3 preguntas** referencian KaledSoft explícitamente
- El lenguaje debe ser claro para alguien sin experiencia técnica
- Una sola respuesta correcta por pregunta
- Etiquetas de opciones: `A`, `B`, `C`, `D`

### 3. Output 1 — JSON auditable

Crea (si no existe la carpeta, créala):
```
docs/Temas/quizzes/quiz-{tema}.json
```

```json
{
  "tema": "tema_{N}_{slug}",
  "titulo": "[Título legible]",
  "generado": "YYYY-MM-DD",
  "dificultad": "mixta",
  "lessonHint": "[palabra clave para resolver lessonId en el seed]",
  "preguntas": [
    {
      "id": 1,
      "categoria": "comprension",
      "pregunta": "¿Qué es [concepto]?",
      "opciones": [
        { "label": "A", "texto": "Opción A...", "esCorrecta": false },
        { "label": "B", "texto": "Opción B...", "esCorrecta": true },
        { "label": "C", "texto": "Opción C...", "esCorrecta": false },
        { "label": "D", "texto": "Opción D...", "esCorrecta": false }
      ],
      "explicacion": "B es correcta porque... A es incorrecta porque... C es incorrecta porque... D es incorrecta porque..."
    }
  ]
}
```

### 4. Resolver el `lessonId` (opcional pero recomendado)

Si tienes acceso a MCP Neon, consulta dev (`ep-billowing-dream-anjlrgrr`) para encontrar el ID real de la lección:

```sql
SELECT l.id, l.title
FROM "AcademyLesson" l
JOIN "Tenant" t ON t.id = l."tenantId"
WHERE t.slug = 'kaledacademy'
  AND l.title ILIKE '%[palabra clave del tema]%'
LIMIT 5;
```

Si encuentras una sola coincidencia, úsala. Si encuentras varias, **muestra las opciones al usuario y pídele que elija**. Si no encuentras ninguna, advierte y usa solo el `lessonHint` para que el seed lo resuelva en runtime.

### 5. Output 2 — Extender el seed

Lee/crea:
```
prisma/seed-kaledacademy-quizzes.ts
```

Si NO existe, créalo siguiendo el template completo del skill `kaledacademy-seed-writer` (sección "Crear/extender seed-kaledacademy-quizzes.ts").

Si YA existe, agrega un objeto al array `QUIZZES`:

```typescript
{
  lessonHint: "[palabra clave única del título]",
  questions: [
    {
      question: "¿Qué es [concepto]?",
      options: [
        { label: "A", text: "Opción A...", isCorrect: false, feedback: "..." },
        { label: "B", text: "Opción B...", isCorrect: true, feedback: "B es correcta porque..." },
        { label: "C", text: "Opción C...", isCorrect: false, feedback: "..." },
        { label: "D", text: "Opción D...", isCorrect: false, feedback: "..." },
      ],
    },
    // ... 9 más
  ],
},
```

> ⚠️ **Idempotencia:** el seed debe usar `deleteMany({ where: { lessonId } })` antes de insertar. Si /quiz se ejecuta dos veces para el mismo tema, NO debe duplicar preguntas.

### 6. Reporte final al usuario

Muestra una **tabla con las 10 preguntas (sin las respuestas)** para que el usuario revise calidad antes de correr el seed:

```
✅ Quiz generado para: tema_{N}_{slug}

📄 JSON: docs/Temas/quizzes/quiz-{tema}.json
📝 Seed extendido: prisma/seed-kaledacademy-quizzes.ts
🔗 lessonId resuelto: {id si lo encontraste, o "se resuelve en runtime por título"}

📋 Las 10 preguntas (sin respuestas):

| #  | Categoría    | Pregunta                                          |
|----|--------------|---------------------------------------------------|
| 1  | comprension  | ¿Qué es...?                                       |
| 2  | comprension  | ¿Cuál es la diferencia entre...?                 |
| ... |              |                                                   |

🔧 PARA ACTIVAR EN LA APP — corre el seed contra DEV:

   $env:DATABASE_URL="postgresql://...ep-billowing-dream-anjlrgrr..."
   $env:DIRECT_URL=$env:DATABASE_URL
   npx tsx prisma/seed-kaledacademy-quizzes.ts

⚠️  NUNCA contra prod (ep-calm-firefly-ankd2x8e).

🌐 Validar en: http://kaledacademy.localhost:3000 → ir a la lección y ver el bloque de quiz
```
