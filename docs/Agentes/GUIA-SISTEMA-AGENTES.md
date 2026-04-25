# Guía del Sistema de Agentes — KaledAcademy

> Documento maestro que explica cómo funciona el sistema de agentes `/kaledacademy:*`, cómo se construyó, y cómo replicarlo para otros tenants del mismo repo o para otros proyectos.
>
> **Para humanos.** Si eres un agente de Claude Code buscando instrucciones de ejecución, lee `.claude/commands/kaledacademy/_CONTEXT.md` en lugar de este archivo.

---

## Sección 1 — Qué construimos y por qué

### El problema

KaledAcademy es un bootcamp de **4 meses · 16 semanas · 48 sesiones**. Crear cada lección a mano implicaba:

1. Investigar el tema (1-2 horas)
2. Diseñar el outline pedagógico (1 hora)
3. Escribir un HTML interactivo de 8-12 slides (3-5 horas)
4. Incrustarlo en el seed de Prisma (15 min, propenso a errores)
5. Generar quiz de comprensión (1 hora)
6. Diseñar los 4 retos CRAL (2 horas)
7. Diseñar el reto de criterio sobre IA (2 horas)
8. Diseñar el entregable formal semanal con rúbrica (1-2 horas)

**Total:** ~12 horas por lección × 48 lecciones = **576 horas** de trabajo manual altamente repetitivo.

### La solución

Un sistema de **7 slash commands** (4 base + 3 extra) que transforma cada paso del trabajo en una invocación de Claude Code. Los comandos comparten contexto, skills y convenciones, y dejan archivos auditables (Markdown/JSON) antes de tocar la base de datos.

### El diferencial

Uno de los 7 agentes — `/kaledacademy:ai-criterion` — codifica el **pitch de marketing** del bootcamp en código:

> "La IA escribe el código. Tú tienes que saber si está bien escrito."

Cada lección termina con un reto donde el estudiante recibe un snippet "que generó una IA" y tiene que decidir si se puede mandar a producción. Ese momento es lo que separa KaledAcademy del resto de bootcamps de "vibe coding".

---

## Sección 2 — Arquitectura del sistema

### Pipeline completo

```
PIPELINE BASE
┌──────────────────────────────┐
│ /kaledacademy:research       │ → docs/Temas/context/context-tema_N_{slug}.md
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ /kaledacademy:animate        │ → docs/Temas/tema_N_{slug}.html
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ /kaledacademy:embed          │ → entry en prisma/seed-kaledacademy-v3.ts
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ /kaledacademy:quiz           │ → JSON + entry en prisma/seed-kaledacademy-quizzes.ts
└──────────────────────────────┘

EXTENSIONES (alineadas al ADN del bootcamp)
┌──────────────────────────────┐
│ /kaledacademy:cral           │ → 4 retos en prisma/seed-kaledacademy-cral.ts
└──────────────────────────────┘
┌──────────────────────────────┐
│ /kaledacademy:ai-criterion ⭐│ → reto AUDITAR con bug sutil + checklist socrático
└──────────────────────────────┘
┌──────────────────────────────┐
│ /kaledacademy:deliverable    │ → entregable semanal en prisma/seed-kaledacademy-deliverables.ts
└──────────────────────────────┘
```

### Mapa de archivos

```
.claude/
├── commands/
│   └── kaledacademy/
│       ├── _CONTEXT.md                  ← identidad + stack + ADN del bootcamp
│       ├── _design-system.md            ← paleta + JS moderno + patrones
│       ├── _ai-criterion-philosophy.md  ← el diferencial codificado
│       ├── research.md                  ← /kaledacademy:research
│       ├── animate.md                   ← /kaledacademy:animate
│       ├── embed.md                     ← /kaledacademy:embed
│       ├── quiz.md                      ← /kaledacademy:quiz
│       ├── cral.md                      ← /kaledacademy:cral
│       ├── ai-criterion.md              ← /kaledacademy:ai-criterion
│       └── deliverable.md               ← /kaledacademy:deliverable
└── skills/
    ├── kaledacademy-narrator/SKILL.md         ← narrativas KaledSoft
    ├── kaledacademy-html-builder/SKILL.md     ← snippets HTML interactivos
    ├── kaledacademy-seed-writer/SKILL.md      ← edición de los 4 seeds
    └── kaledacademy-ai-bug-injector/SKILL.md  ← catálogo de bugs y plantilla socrática

docs/Temas/
├── context/                             ← outputs de /research
├── quizzes/                             ← outputs de /quiz
├── cral/                                ← outputs de /cral y /ai-criterion
└── deliverables/                        ← outputs de /deliverable

prisma/
├── seed-kaledacademy-v3.ts              ← (existente) array INTERACTIVE_ANIMATIONS_SEED
├── seed-kaledacademy-quizzes.ts         ← (creado por /quiz)
├── seed-kaledacademy-cral.ts            ← (creado por /cral y /ai-criterion)
└── seed-kaledacademy-deliverables.ts    ← (creado por /deliverable)
```

### Flujo de datos entre agentes

| Agente | Lee | Produce | Lo consume |
|---|---|---|---|
| `research` | (web + context7) + `_CONTEXT.md` | `context-tema_N.md` | `animate`, `quiz`, `cral`, `ai-criterion`, `deliverable` |
| `animate` | `context-tema_N.md` + `_design-system.md` + skills `narrator` y `html-builder` | `tema_N.html` | `embed`, `quiz`, `cral`, `ai-criterion` |
| `embed` | `tema_N.html` + `seed-kaledacademy-v3.ts` (estado actual) | seed-v3 modificado | El usuario corre el seed contra dev |
| `quiz` | contexto + HTML + (MCP Neon dev) | `quiz-tema_N.json` + `seed-kaledacademy-quizzes.ts` | El usuario corre el seed contra dev |
| `cral` | contexto + HTML | `cral-tema_N.md` + `seed-kaledacademy-cral.ts` | El usuario corre el seed contra dev. `ai-criterion` puede reemplazar el item AUDITAR |
| `ai-criterion` ⭐ | contexto + skill `ai-bug-injector` + `_ai-criterion-philosophy.md` | `ai-criterion-tema_N.md` + edición de `seed-kaledacademy-cral.ts` | El usuario corre el seed contra dev |
| `deliverable` | contexto + matriz de entendimiento + (MCP Neon dev) | `deliverable-semana-N.md` + `seed-kaledacademy-deliverables.ts` | El usuario corre el seed contra dev |

### Cómo Claude Code descubre los archivos

- **Slash commands**: cualquier `.md` con frontmatter (`---\ndescription: ...\n---`) en `.claude/commands/{namespace}/{name}.md` se expone como `/{namespace}:{name}`. Los archivos que empiezan con `_` (como `_CONTEXT.md`, `_design-system.md`) **también se exponen** como comandos en Claude Code, pero por convención los tratamos como archivos de contexto y los referimos desde otros comandos vía Read.
- **Skills**: cualquier carpeta con `SKILL.md` con frontmatter `name` y `description` en `.claude/skills/{name}/SKILL.md` se expone como skill. Claude las "carga" automáticamente cuando un comando dice "invoca el skill X" o cuando la descripción del skill matchea el contexto actual.

### Qué se almacena en BD vs. en archivos

- **Archivos** (auditable, versionable en Git): contexto, HTML, JSON de quizzes, Markdown de CRAL/criterio/entregables. Todo lo "humano".
- **Base de datos** (vía seeds): los registros estructurados en `AcademyInteractiveAnimation`, `AcademyQuiz`, `AcademyCRALChallenge`, `AcademyDeliverable`. Lo que la app necesita para renderizar.

Los seeds son **el puente**: leen los archivos auditables (o tienen el contenido inline) y los insertan en BD con `deleteMany` previo para idempotencia.

---

## Sección 3 — Cómo se hizo (postmortem técnico)

### Decisiones clave y por qué se tomaron

#### 1. Adaptación del doc original al repo real

El doc original (`docs/Agentes/kaledacademy-agent-system.md`) asumía una estructura `tenants/kaledacademy/.agent/...` que **no existe** en este repo (es un monorepo, no multi-repo). La adaptación:

| Doc original | Realidad del repo |
|---|---|
| `tenants/kaledacademy/.agent/commands/research.md` | `.claude/commands/kaledacademy/research.md` |
| `tenants/kaledacademy/.agent/skills/...` | `.claude/skills/kaledacademy-*/SKILL.md` |
| `tenants/kaledacademy/docs/Temas/` | `docs/Temas/` (raíz) |
| `prisma/seed/kaledacademy-interactive-animations.ts` | `prisma/seed-kaledacademy-v3.ts` |

#### 2. Respetar `sourceDocHint` en lugar de `htmlContent + readFileSync`

El doc original proponía:

```typescript
htmlContent: fs.readFileSync(path.join(__dirname, '../tenants/.../tema.html'), 'utf-8'),
```

Pero `seed-kaledacademy-v3.ts` ya usaba:

```typescript
sourceDocHint: "docs/Temas/tema_1_viaje_url.html",
```

Cambiar el patrón habría obligado a refactorizar los 6 temas existentes (1-6). Decidimos respetar el patrón existente: `/embed` solo agrega entries con `sourceDocHint`.

#### 3. Descarte de la regla "solo var" del doc original

El doc original prohibía `const`/`let`, arrow functions y template literals "porque causan fallos silenciosos". Verificamos contra `docs/Temas/tema_1_viaje_url.html`:

```bash
grep -c "const \|let \|=>" docs/Temas/tema_1_viaje_url.html  # 112
grep -c "var "             docs/Temas/tema_1_viaje_url.html  # 0
```

El HTML que ya estaba en producción usa **JS moderno** sin problemas. La regla del doc original era obsoleta, así que la sobreescribimos en `_design-system.md` para permitir JS moderno.

#### 4. Cero migraciones de Prisma

Investigamos `prisma/schema.prisma` y encontramos que **todos los modelos necesarios ya existen**:

- `AcademyInteractiveAnimation` (línea ~70 en relations)
- `AcademyQuiz` (1809) + `AcademyQuizOption` (1825)
- `AcademyCRALChallenge` (1766) con enum `CRALPhase` y campo `taskCode`
- `AcademyDeliverable` (1857) + `AcademyDeliverableItem` (1876)

Particularmente importante: `AcademyCRALChallenge` ya tenía `taskCode` (text) y `phase` (enum CONSTRUIR/ROMPER/AUDITAR/LANZAR). Eso significa que **el reto de criterio sobre IA se modela como un `AcademyCRALChallenge` con `phase = AUDITAR` y `taskCode` = snippet con bug**, sin necesidad de tabla nueva.

#### 5. `/embed` nunca toca prod automáticamente

Hay dos branches en Neon:
- **dev**: `ep-billowing-dream-anjlrgrr` — único target permitido
- **prod**: `ep-calm-firefly-ankd2x8e` — nunca automático

Ningún slash command corre `npx tsx` por sí mismo. Todos:
1. Modifican el archivo del seed
2. Reportan al usuario el comando exacto para correr manualmente

Esto previene accidentes destructivos y mantiene al humano en el loop para decisiones que tocan datos reales.

#### 6. Modelo pedagógico semanal graduado

El usuario inicialmente pidió "un entregable formal por lección". Lo desaconsejé porque:
- 3 entregables formales por semana × 16 semanas = 48 entregables → satura estudiante y docente
- La estructura actual (s1+s2 construyen, s3 consolida) ya es buena pedagogía

En su lugar, propuse y aprobó este modelo graduado:

| Sesión | Bloque | Modelo Prisma |
|---|---|---|
| s1 | Micro-reto | `AcademyCRALChallenge` con `phase = CONSTRUIR` |
| s2 | Reto de criterio sobre IA ⭐ | `AcademyCRALChallenge` con `phase = AUDITAR` y `taskCode` con bug |
| s3 | Entregable formal | `AcademyDeliverable` (lo existente) |

Cero migraciones, cada sesión produce algo tangible, y el reto de criterio (el diferencial de marca) tiene su lugar fijo en cada semana.

---

## Sección 4 — Cómo crear agentes para OTRO tenant en este mismo repo

> Caso de uso: ya tienes `/kaledacademy:*` funcionando. Ahora quieres `/edutec:*` para otro tenant del mismo monorepo (ej. `edutec`, `lavadero`, etc.).

### Receta paso a paso (15-30 min)

#### 1. Identifica el tenant

- ¿Cuál es su slug en BD? (ej. `edutec`, `lavadero`)
- ¿Qué modelos de Prisma usa? Busca con `grep -i "model {Tenant}" prisma/schema.prisma`
- ¿Qué seeds existentes tiene? Busca `prisma/seed-{tenant}*.ts`
- ¿Qué componentes Next.js renderizan su contenido? `src/modules/{tenant}/`

#### 2. Crea el `_CONTEXT.md` del nuevo tenant

```bash
mkdir -p .claude/commands/{tenant}/
```

Copia `.claude/commands/kaledacademy/_CONTEXT.md` a `.claude/commands/{tenant}/_CONTEXT.md` y reemplaza:

| Buscar | Reemplazar |
|---|---|
| `KaledAcademy`, `kaledacademy` | Nombre y slug del nuevo tenant |
| Bootcamp pitch | El "para qué existe" del nuevo tenant |
| KaledSoft + 3 productos | La narrativa del nuevo tenant |
| Modelos `Academy*` | Modelos del nuevo tenant |
| Rutas `docs/Temas/`, `seed-kaledacademy-*` | Rutas reales del nuevo tenant |
| BDs (si comparten Neon, las connection IDs son las mismas) | Ajustar si usan otra BD |

#### 3. Decide qué agentes necesitas

No todos los tenants necesitan los 7 agentes. Cada tenant tiene su propio dominio:

- **Bootcamp educativo** (tipo KaledAcademy): los 7 agentes aplican
- **SaaS de operaciones** (tipo Lavadero): probablemente solo necesitas agentes para generar plantillas/configuraciones
- **CRM/Marketing**: agentes para generar campañas, A/B tests, etc.

Empieza con **los 4 base** (research/produce/embed/evaluate) y agrega extras según el dominio.

#### 4. Adapta los slash commands

Copia los `.md` de `.claude/commands/kaledacademy/` a `.claude/commands/{tenant}/` y adapta cada uno:

- Cambia los paths de seeds
- Cambia los nombres de modelos Prisma
- Cambia las narrativas del producto
- Mantén la estructura y el flujo

#### 5. Decide si reusas o duplicas las skills

**Reusa** si la skill es genuinamente genérica (poco probable):
- Apunta a `.claude/skills/kaledacademy-*` desde el comando

**Duplica con prefijo** si la skill tiene contenido específico del tenant (lo más común):
- `.claude/skills/{tenant}-narrator/SKILL.md`
- `.claude/skills/{tenant}-seed-writer/SKILL.md`

El prefijo `{tenant}-*` evita colisiones cuando hay muchos tenants.

#### 6. Crea las carpetas de output del nuevo tenant

Define dónde van los archivos auditables del nuevo tenant. Sugerencia:

```
docs/{tenant}/context/
docs/{tenant}/quizzes/
docs/{tenant}/...
```

O si el tenant ya tiene su propia carpeta de docs (`src/modules/{tenant}/docs/`), usa esa.

#### 7. Verificación con un caso dummy

Corre los nuevos comandos con un caso de prueba simple. Verifica:
- Que aparecen tipeando `/{tenant}:`
- Que leen el `_CONTEXT.md` correcto
- Que escriben en las rutas del nuevo tenant, no en las de KaledAcademy
- Que el seed del nuevo tenant se modifica correctamente

### Checklist de adaptación

| Lo que cambia entre tenants | Lo que se reusa |
|---|---|
| Slug del tenant | Estructura `.claude/commands/{namespace}/` |
| Modelos de Prisma | Convención de namespaced commands |
| Narrativa del producto | Pipeline manual paso a paso |
| Branding y paleta | Patrón de "modificar archivo, no ejecutar seed" |
| Carpetas de output | Frontmatter de slash commands |
| Catálogo de bugs (si aplica) | Reglas de idempotencia |

---

## Sección 5 — Cómo portar este sistema a OTRO proyecto / repo

> Caso de uso: tienes otro repo (no este monorepo) y quieres replicar la arquitectura del sistema de agentes ahí. Por ejemplo, otra plataforma educativa, o un CMS, o un generador de contenido.

### Prerrequisitos

- **Claude Code** instalado (`claude` CLI funcionando)
- Tu repo tiene un `.git/` (los slash commands se versionan junto con el código)
- Tienes una manera de persistir contenido (Prisma + alguna BD, o filesystem, o lo que sea)
- (Opcional pero recomendado) MCPs configurados: `context7` para docs de librerías, `WebSearch` para investigación

### Plantilla genérica del pipeline

Adapta los 4 base a tu dominio:

| Paso | Función | Output |
|---|---|---|
| 1 — Research | Investigar el tema/concepto | Archivo de contexto auditable |
| 2 — Produce | Generar el artefacto principal | El archivo final (HTML, MDX, PDF, JSON, etc.) |
| 3 — Embed | Conectarlo al sistema de persistencia | Modificación del seed/registry/CMS |
| 4 — Evaluate | Generar evaluación o quiz | Archivo + entry de seed |

### Qué copiar tal cual

Estos son **patrones universales**, copialos sin pensar:

- **Estructura de carpetas**: `.claude/commands/{namespace}/{name}.md` y `.claude/skills/{name}/SKILL.md`
- **Frontmatter de slash commands**: `description`, `argument-hint`
- **Frontmatter de skills**: `name`, `description`
- **Convención de archivos `_CONTEXT.md`** y `_*.md` con underscore para "no son slash commands de uso directo, son contexto"
- **Patrón "comandos interactivos"**: si no recibe args, pregunta al usuario
- **Patrón "modificar archivo, no ejecutar"**: nunca tocar BD prod automáticamente
- **Patrón "outputs auditables primero"**: Markdown/JSON antes de tocar BD

### Qué adaptar al proyecto

- **`_CONTEXT.md`** — la identidad, el stack, las rutas, las BDs. Es lo más importante de adaptar bien.
- **Seeds objetivo** — qué archivos modifican los comandos. Identifícalos antes de empezar.
- **Modelos de BD** — los nombres, los campos, las relaciones. Verifica con `grep` o leyendo el schema.
- **Fuentes de investigación** — ¿usas WebSearch? ¿Una API interna? ¿Un wiki?
- **Convenciones de idempotencia** — ¿`deleteMany` previo? ¿`upsert`? ¿`createMany` con `skipDuplicates`?

### Qué reescribir desde cero

- **`_design-system.md`** — cada proyecto tiene su branding, paleta y tipografía. Cero copy-paste útil aquí.
- **`_*-philosophy.md`** — el "diferencial" de tu producto. Si no tienes uno, este archivo no existe en tu adaptación.
- **Catálogo de bugs / patrones específicos del dominio** — el `kaledacademy-ai-bug-injector` solo aplica si tu proyecto enseña a programar. En otros dominios, este skill se reemplaza por catálogos del dominio (ej. catálogo de "errores comunes en cartas de presentación" para una herramienta de HR).
- **Narrativa del producto** — KaledSoft no aplica fuera de KaledAcademy. Inventa tu propio universo narrativo si tu dominio lo necesita.

### Anti-patrones a evitar

| ❌ NO hacer | ✅ Hacer en su lugar |
|---|---|
| Hardcodear paths absolutos del repo original (`C:\KALEDSOFT\...`) | Paths relativos desde la raíz del repo nuevo |
| Asumir que los modelos Prisma se llamen igual | Verificar con `grep "model " prisma/schema.prisma` |
| Copiar el namespace `kaledacademy` a ciegas | Renombrar a tu tenant/dominio |
| Omitir el `_CONTEXT.md` (sin él los agentes pierden anclaje) | Siempre crear el contexto compartido primero |
| Crear los 7 agentes de golpe | Empezar con los 4 base (research/produce/embed/evaluate) |
| Ejecutar seeds contra prod desde un slash command | Solo modificar archivos, reportar el comando al usuario |
| Skills sin frontmatter `name` y `description` | Frontmatter siempre presente — sin él Claude no las descubre |
| Múltiples bugs por reto (en agentes tipo ai-criterion) | UN solo bug por reto, claro pero sutil |

### Recomendación de orden

1. **Día 1:** crea solo `_CONTEXT.md` y los 4 base. Pruébalos con un caso real.
2. **Día 2:** ajusta basándote en lo que aprendiste del día 1. Agrega skills si ves que repites instrucciones largas en varios comandos.
3. **Día 3+:** agrega los extras del dominio (ai-criterion, deliverable, cral, etc.). Solo agregas agentes que resuelven problemas reales que ya viste.

---

## Sección 6 — Convenciones y reglas de oro

### Convenciones de naming

- **Slash commands**: kebab-case dentro del namespace. `/kaledacademy:research`, no `/kaledacademy:Research` ni `/kaledacademy:research_command`.
- **Skills**: prefijo del tenant + capacidad. `kaledacademy-narrator`, `kaledacademy-seed-writer`. Evita colisiones cuando hay muchos tenants.
- **Carpetas de output**: agrupa por tipo bajo la carpeta del dominio. `docs/Temas/context/`, `docs/Temas/quizzes/`.
- **Seeds**: `seed-{tenant}-{tipo}.ts`. Permite tener muchos seeds del mismo tenant sin pisarse.

### Comandos siempre interactivos

Si el usuario invoca el comando sin argumentos, **pregunta antes de asumir**. Nunca elijas un default arbitrario para parámetros importantes (tema, número, dificultad).

### Outputs auditables siempre

Antes de tocar BD, deja un archivo Markdown/JSON que el humano pueda leer, comentar y revisar. Los seeds leen de esos archivos (o tienen el contenido inline). Esto:
- Permite revisión asincrónica
- Permite versionado en Git
- Permite revertir sin tocar BD

### Nunca ejecutar seeds contra prod automáticamente

Hard rule. Los slash commands SOLO modifican archivos. El humano corre `npx tsx ...` manualmente, después de validar.

### Idempotencia obligatoria en seeds

Cada seed debe poder correrse N veces sin duplicar registros. Patrones:
- `deleteMany({ where: { lessonId } })` antes de `create`
- `upsert` cuando hay clave única natural
- `createMany({ data, skipDuplicates: true })` cuando aplica

### Nombres de skills sin colisiones

`{tenant}-{capacidad}` siempre. Si dos tenants necesitan la "misma" skill, **duplícala** con prefijos distintos en lugar de compartir. Las skills son baratas, las colisiones son caras.

---

## Sección 7 — Troubleshooting

### Los slash commands no aparecen al tipear `/`

- **Causa probable:** Claude Code no recargó. **Solución:** reinicia Claude Code (`exit` y vuelve a entrar) o ejecuta `/reload` si está disponible.
- **Causa probable:** falta el frontmatter en el `.md`. **Solución:** verifica que el archivo empieza con `---\ndescription: ...\n---\n`.
- **Causa probable:** el archivo está en la ruta equivocada. **Solución:** debe estar en `.claude/commands/{namespace}/{name}.md`, no en `.claude/{name}.md`.

### El skill no se carga / no se encuentra

- **Causa probable:** falta `name` o `description` en el frontmatter del `SKILL.md`. **Solución:** verifica el frontmatter.
- **Causa probable:** el archivo se llama distinto a `SKILL.md`. **Solución:** debe ser exactamente `SKILL.md` en mayúsculas.
- **Causa probable:** la carpeta está en `.claude/skill/` (singular) en lugar de `.claude/skills/`. **Solución:** plural.

### El seed falla contra dev

- Verifica las variables de entorno en tu shell:
  ```powershell
  echo $env:DATABASE_URL
  echo $env:DIRECT_URL
  ```
- Asegúrate que ambas apuntan al branch dev (`ep-billowing-dream-anjlrgrr`)
- Si el error es de conexión, prueba con `npx prisma db pull` para verificar que la BD es alcanzable
- Si el error es de schema, regenera el cliente: `npx prisma generate`

### El HTML rompe en producción pero funciona local

- Revisa cómo `LessonView.tsx` está renderizando el HTML:
  - Si usa `dangerouslySetInnerHTML`, los `<script>` SÍ se ejecutan, pero hereda los estilos globales del sitio (puede haber colisiones de CSS)
  - Si usa `<iframe>` con sandbox, los `<script>` corren en contexto aislado pero las restricciones de sandbox pueden bloquear cosas (`allow-scripts`, `allow-same-origin`, etc.)
- Verifica `InteractiveLessonShell.tsx` para ver el wrapper exacto

### `/kaledacademy:embed` reporta `slug duplicado`

Significa que ya existe un entry con ese slug en el seed. Soluciones:
- Si quieres reemplazarlo: edita el seed manualmente para borrar el viejo y vuelve a correr `/embed`
- Si quieres convivir: elige un slug distinto (ej. `tema_7_variables_js_v2`)

### `/kaledacademy:quiz` o `/deliverable` no encuentran la lección

- Significa que el `lessonHint` (palabra clave del título) no matchea ninguna `AcademyLesson` en dev
- Verifica que ya corriste `seed-kaledacademy-v3.ts` para crear las lecciones base
- Cambia el `lessonHint` a algo más específico
- O resuelve manualmente con MCP Neon: `SELECT id, title FROM "AcademyLesson" WHERE "tenantId" = ...`

---

## Sección 8 — Roadmap

### Agentes pendientes (fase 2)

| Agente | Para qué |
|---|---|
| `/kaledacademy:coherence-check` | Auditor de la regla de oro: verifica que una lección nueva no menciona conceptos no enseñados antes en el seed |
| `/kaledacademy:reviewer` | Asistente de revisión docente: dada una `AcademyDeliverableSubmission`, genera un review estructurado contra la rúbrica para que el docente solo apruebe/edite. Escala la operación docente 10x |

### Hooks de Claude Code para auto-encadenado

Los hooks de Claude Code (`.claude/settings.json`) permiten ejecutar automáticamente un comando antes/después de otro. Posibilidades:

- Hook post-`/embed`: corre automáticamente `/coherence-check` para verificar que la nueva lección no rompió la regla de oro
- Hook pre-`/quiz`: verifica que ya existe el HTML del tema (sino interrumpe)
- Hook post-todo: actualiza un índice de cobertura del bootcamp (`docs/Temas/INDEX.md` con qué temas tienen qué bloques)

### UI web futura (fuera de Claude Code)

A largo plazo, los slash commands son un MVP. Una posible evolución:
- Una página `/admin/agents` dentro del panel de KaledAcademy
- Que invoque los mismos prompts de los slash commands vía la API de Anthropic
- Que maneje la BD directamente con permisos por rol
- Que muestre el estado del pipeline para cada lección (research ✅ animate ✅ embed ⏳ quiz ❌ ...)

Pero antes de eso: usar los slash commands hasta que duela, descubrir los puntos de fricción reales, y solo entonces mover a UI.

---

## Apéndice — Glosario

| Término | Definición |
|---|---|
| **Slash command** | Un archivo `.md` en `.claude/commands/{namespace}/{name}.md` que se invoca con `/{namespace}:{name}` en Claude Code |
| **Skill** | Un archivo `SKILL.md` en `.claude/skills/{name}/` que provee patrones, snippets o reglas reutilizables. Claude las descubre por su `name` y `description` |
| **Namespace** | El primer segmento del slash command. En este sistema = nombre del tenant (`kaledacademy`, `edutec`, etc.) |
| **Seed** | Un script TypeScript en `prisma/seed-*.ts` que inserta datos en la BD. Se ejecuta con `npx tsx prisma/seed-*.ts` |
| **CRAL** | Metodología pedagógica del bootcamp: 4 fases por lección — Construir, Romper, Auditar, Lanzar |
| **Reto de criterio** | El reto AUDITAR especial generado por `/kaledacademy:ai-criterion`. Snippet con bug + checklist socrático. Es el diferencial del bootcamp |
| **KaledSoft** | El universo narrativo ficticio del bootcamp con 3 productos: KaledDental, KaledWash, KaledPark |
| **Regla de oro** (del seed v3) | Ninguna lección menciona un concepto que no haya sido explicado en una lección anterior |
| **Idempotencia** (de seeds) | Que se puedan correr N veces sin duplicar registros |

---

**Versión:** 1.0
**Mantenedor:** El equipo de KaledAcademy
**Última actualización:** 2026-04-08
