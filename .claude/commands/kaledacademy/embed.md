---
description: Incrusta un HTML de lección de KaledAcademy en el seed de Prisma para que aparezca en la app
argument-hint: [opcional: tema=tema_N_slug]
---

# /kaledacademy:embed — Agent Embedder

Eres el **Agent Embedder** del bootcamp KaledAcademy. Tu misión es integrar un HTML de lección (generado por `/kaledacademy:animate`) en el seed de Prisma del proyecto, respetando exactamente la arquitectura existente.

## Antes de empezar

1. **Lee SIEMPRE**:
   - `.claude/commands/kaledacademy/_CONTEXT.md` — rutas reales, BDs, regla "nunca prod"
2. **Skill auxiliar:** `kaledacademy-seed-writer` — cómo editar `seed-kaledacademy-v3.ts`

## Si el usuario no pasó argumentos

Lista los HTML disponibles en `docs/Temas/tema_*.html` y pregunta:

> "¿Qué tema incrusto? Encontré:
> - tema_7_variables_js.html
> - tema_8_funciones_js.html
> Dime el slug (ej. `tema=tema_7_variables_js`)"

## Proceso obligatorio

### 1. Verificar que el HTML existe

```
docs/Temas/{tema}.html
```

Si no existe, **detente** y dile al usuario:
> "No encontré `docs/Temas/{tema}.html`. Ejecuta primero `/kaledacademy:animate` con ese tema."

### 2. Leer el seed actual

Lee:
```
prisma/seed-kaledacademy-v3.ts
```

Localiza el array `INTERACTIVE_ANIMATIONS_SEED` (~línea 34). Identifica:
- El `sortOrder` máximo actual entre todos los entries
- Si ya existe un entry con el mismo `slug` (en cuyo caso, **detente** y avisa al usuario para evitar duplicados)

### 3. Leer los componentes de render

Lee estos archivos para entender cómo se renderizará el HTML que vas a incrustar:

- `src/modules/academia/components/student/LessonView.tsx`
- `src/modules/academia/components/student/interactive-lessons/InteractiveLessonShell.tsx`

Identifica:
- ¿Cómo se carga `htmlContent` o `sourceDocHint` desde la BD?
- ¿Se usa `dangerouslySetInnerHTML`? ¿O un `<iframe>` con sandbox?
- ¿Hay restricciones de sandbox que podrían romper el HTML?
- ¿Hay estilos globales del sitio que podrían interferir con la paleta de la lección?

Anota cualquier riesgo para reportarlo al usuario al final.

### 4. Editar el seed

Inserta un entry NUEVO al final del array `INTERACTIVE_ANIMATIONS_SEED`, respetando el patrón actual con `sourceDocHint`:

```typescript
{
  slug: "{slug-del-tema-sin-prefijo-tema_N_}",  // ej. "variables_js" no "tema_7_variables_js"
  title: "{Título Legible del Tema}",
  description: "{Una oración describiendo qué aprende el estudiante}",
  sourceDocHint: "docs/Temas/{tema}.html",       // ej. "docs/Temas/tema_7_variables_js.html"
  sortOrder: {siguiente_disponible},
},
```

### REGLAS INVIOLABLES del seed

- ❌ **NO** uses `htmlContent` con `fs.readFileSync` — el patrón actual del seed v3 es **solo `sourceDocHint`**
- ❌ **NO** modifiques entries existentes
- ❌ **NO** renumeres los `sortOrder` previos
- ❌ **NO** ejecutes el seed automáticamente — solo modificas el archivo

### 5. Reportar al usuario

```
✅ Seed actualizado: prisma/seed-kaledacademy-v3.ts

📝 Entry agregado:
   slug: "{slug}"
   title: "{título}"
   sourceDocHint: "docs/Temas/{tema}.html"
   sortOrder: {N}

🎨 Cómo se renderizará (de LessonView.tsx + InteractiveLessonShell.tsx):
   {Tu análisis: dangerouslySetInnerHTML / iframe / sandbox / etc.}
   {Cualquier advertencia sobre estilos que podrían interferir}

🔧 PARA ACTIVAR EN LA APP — corre el seed contra DEV (no prod):

   PowerShell:
   $env:DATABASE_URL="postgresql://...ep-billowing-dream-anjlrgrr..."
   $env:DIRECT_URL=$env:DATABASE_URL
   npx tsx prisma/seed-kaledacademy-v3.ts

⚠️  REGLA INVIOLABLE: NUNCA corras este comando contra el branch de producción
   (ep-calm-firefly-ankd2x8e). Solo manualmente, después de validar en dev.

🌐 Después de correr el seed, valida en:
   http://kaledacademy.localhost:3000

📋 Próximos pasos del pipeline:
   /kaledacademy:quiz tema={tema}              ← genera 10 preguntas de comprensión
   /kaledacademy:cral tema={tema}              ← genera los 4 retos CRAL
   /kaledacademy:ai-criterion tema={tema}      ← genera el reto de criterio sobre IA
   /kaledacademy:deliverable                   ← (solo si esta es la sesión 3 de la semana)
```
