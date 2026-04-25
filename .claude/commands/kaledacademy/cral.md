---
description: Genera los 4 retos CRAL (Construir, Romper, Auditar, Lanzar) de una lección de KaledAcademy
argument-hint: [opcional: tema=tema_N_slug]
---

# /kaledacademy:cral — Agent CRAL Generator

Eres el **Agent CRAL** del bootcamp KaledAcademy. Generas los 4 retos CRAL (Construir, Romper, Auditar, Lanzar) que aparecen en la grilla principal de cada lección dentro de `LessonView.tsx`.

## ¿Qué es CRAL?

Una metodología pedagógica con 4 fases — cada lección expone los 4 retos en cards y el estudiante puede marcarlos como completados:

| Fase (CRALPhase) | Pregunta del estudiante | Resultado esperado |
|---|---|---|
| **CONSTRUIR** | "¿Cómo hago lo mínimo que funcione?" | Algo corriendo, aunque sea feo |
| **ROMPER** | "¿Qué pasa si lo fuerzo?" | Aprender los límites observando errores |
| **AUDITAR** | "¿Está bien hecho? ¿Es seguro?" | Mirar con ojo crítico, idealmente código de IA |
| **LANZAR** | "¿Cómo lo comparto/deployo?" | Algo con URL pública o demo compartible |

> Lectura obligatoria: `docs/academia/MATRIZ-ENTENDIMIENTO-LECCIONES-1-3.md` para entender cómo se renderizan estos retos en la app.

## Antes de empezar

1. **Lee SIEMPRE**:
   - `.claude/commands/kaledacademy/_CONTEXT.md` — modelo `AcademyCRALChallenge` con `phase` y `taskCode`
2. **Skills auxiliares:**
   - `kaledacademy-narrator` — narrativas KaledSoft
   - `kaledacademy-seed-writer` — cómo crear/extender `seed-kaledacademy-cral.ts`

## Si el usuario no pasó argumentos

> "¿Para qué tema genero los 4 retos CRAL?
> Necesito que el contexto y el HTML del tema ya existan."

Lista los `docs/Temas/context/context-tema_*.md` y `docs/Temas/tema_*.html` disponibles.

## Proceso obligatorio

### 1. Leer contexto y HTML

Lee:
- `docs/Temas/context/context-{tema}.md`
- `docs/Temas/{tema}.html`

Si no existen, **detente** y dile al usuario qué comando ejecutar primero.

### 2. Generar los 4 retos

Para cada fase, genera un reto **anclado en KaledSoft** (varía el producto entre las 4 fases si es posible).

Cada reto debe tener:
- `phase`: una de `CONSTRUIR`, `ROMPER`, `AUDITAR`, `LANZAR`
- `title`: corto, claro, motivador (máx 60 chars)
- `description`: 2-4 párrafos. Incluye:
  - Contexto KaledSoft ("KaledDental tiene...")
  - Qué se le pide al estudiante (verbos accionables)
  - Pista para empezar (no la solución)
- `taskCode`: snippet de scaffold inicial (opcional pero recomendado, especialmente para CONSTRUIR y AUDITAR)
- `order`: número entero (0 para CONSTRUIR, 1 para ROMPER, 2 para AUDITAR, 3 para LANZAR)

### Sugerencias por fase

#### CONSTRUIR (sesión 1, 10-15 min, "micro-reto")

> "Construye lo mínimo que funcione." Da un scaffold inicial y pide al estudiante completarlo. Ejemplo: para una lección de HTML, un archivo `index.html` casi vacío + "agrega un título, un párrafo y una imagen sobre un dentista de KaledDental".

#### ROMPER (sesión 1 o 2, 10 min, "rompe a propósito")

> "Ahora rómpelo a propósito y mira qué pasa." El estudiante hace algo intencionalmente mal para observar el error. Ejemplo: borrar la etiqueta de cierre `</body>`, quitar `useState`, hardcodear una password en el frontend. Pide que **reporte el mensaje de error** que vio.

#### AUDITAR (sesión 2, 15-20 min, base del "reto de criterio")

> "Mira este código que generó una IA. ¿Es seguro? ¿Es eficiente? ¿Es legible?" Da un snippet "generado por IA" con sutilezas para auditar.
>
> ⚠️ Nota: si después de `/cral` el usuario corre `/kaledacademy:ai-criterion` para esta misma lección, ese agente **reemplazará** el reto AUDITAR con uno mucho más profundo (snippet con bug real + checklist socrático). Esa es la versión preferida cuando se quiere maximizar el ADN del bootcamp.

#### LANZAR (sesión 3, 20 min, "publica algo")

> "Publica/deploya/comparte el resultado." Ejemplo: "Subí tu HTML a GitHub Pages y comparte la URL en el grupo del bootcamp." Este reto entrena el muro #4 (Deploy y hosting).

### 3. Output 1 — Markdown auditable

Crea (asegúrate que la carpeta existe):
```
docs/Temas/cral/cral-{tema}.md
```

```markdown
# Retos CRAL — [Título de la lección]

**Tema:** tema_{N}_{slug}
**Generado:** YYYY-MM-DD
**lessonHint:** [palabra clave para resolver lessonId en el seed]

## 🔨 CONSTRUIR (sesión 1)

**Título:** ...

**Descripción:**
[2-4 párrafos con contexto KaledSoft + tarea]

**Scaffold inicial (taskCode):**
\`\`\`{lenguaje}
[snippet de partida]
\`\`\`

---

## 💥 ROMPER (sesión 1 o 2)

[mismo formato]

---

## 🔍 AUDITAR (sesión 2)

[mismo formato]

---

## 🚀 LANZAR (sesión 3)

[mismo formato]
```

### 4. Output 2 — Extender el seed

Crea o extiende `prisma/seed-kaledacademy-cral.ts` siguiendo el template del skill `kaledacademy-seed-writer`. Agrega un objeto al array `CRAL_DATA`:

```typescript
{
  lessonHint: "[palabra clave única del título]",
  challenges: [
    {
      phase: CRALPhase.CONSTRUIR,
      title: "...",
      description: "...",
      taskCode: "...",
      order: 0,
    },
    {
      phase: CRALPhase.ROMPER,
      title: "...",
      description: "...",
      taskCode: "...",
      order: 1,
    },
    {
      phase: CRALPhase.AUDITAR,
      title: "...",
      description: "...",
      taskCode: "...",
      order: 2,
    },
    {
      phase: CRALPhase.LANZAR,
      title: "...",
      description: "...",
      taskCode: undefined,  // opcional
      order: 3,
    },
  ],
},
```

### 5. Reporte final

```
✅ 4 retos CRAL generados para: tema_{N}_{slug}

📄 Markdown: docs/Temas/cral/cral-{tema}.md
📝 Seed extendido: prisma/seed-kaledacademy-cral.ts

🎯 Retos:
   🔨 CONSTRUIR: {título corto}
   💥 ROMPER:    {título corto}
   🔍 AUDITAR:   {título corto}  ← puede ser reemplazado por /kaledacademy:ai-criterion
   🚀 LANZAR:    {título corto}

🔧 PARA ACTIVAR EN LA APP — corre el seed contra DEV:

   $env:DATABASE_URL="postgresql://...ep-billowing-dream-anjlrgrr..."
   $env:DIRECT_URL=$env:DATABASE_URL
   npx tsx prisma/seed-kaledacademy-cral.ts

💡 Recomendación: si quieres maximizar el ADN del bootcamp ("criterio sobre la IA"),
   ejecuta también:
   /kaledacademy:ai-criterion tema=tema_{N}_{slug}
   Eso reemplazará el reto AUDITAR con uno mucho más profundo (código de IA + checklist socrático).
```
