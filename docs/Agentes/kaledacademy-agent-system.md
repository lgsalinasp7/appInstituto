# KaledAcademy — Sistema de Agentes `.agent`

> Documento de arquitectura y configuración del sistema de agentes Claude para el tenant **KaledAcademy** dentro del monorepo AMAXOFT SaaS.

---

## Visión General

El sistema `.agent` convierte la creación de un tema de bootcamp en un pipeline de 4 agentes especializados. Cada agente tiene un propósito único, recibe un input definido y produce un output concreto que alimenta al siguiente.

```
[Usuario solicita tema]
        │
        ▼
┌─────────────────┐
│  agent-researcher │  → Investiga el tema y genera contexto estructurado
└────────┬────────┘
         │ context-{tema}.md
         ▼
┌─────────────────┐
│  agent-animator  │  → Convierte el contexto en HTML animado interactivo
└────────┬────────┘
         │ tema_N_{slug}.html  (se muestra para revisión)
         ▼
┌─────────────────┐
│  agent-embedder  │  → Incrusta el HTML en el proyecto Next.js
└────────┬────────┘
         │ seed entry + link function
         ▼
┌─────────────────┐
│  agent-quizmaster│  → Genera preguntas de repaso para el estudiante
└─────────────────┘
         │ quiz-{tema}.json
```

---

## Estructura de Carpetas

```
tenants/
└── kaledacademy/
    ├── .agent/
    │   ├── README.md                    ← Este documento (versión corta)
    │   ├── CONTEXT.md                   ← Contexto del tenant y del bootcamp
    │   ├── mcp.json                     ← Configuración de servidores MCP
    │   ├── commands/
    │   │   ├── research.md              ← Comando: investigar tema
    │   │   ├── animate.md               ← Comando: generar animación HTML
    │   │   ├── embed.md                 ← Comando: incrustar en el proyecto
    │   │   └── quiz.md                  ← Comando: generar preguntas
    │   ├── skills/
    │   │   ├── html-lesson-builder.md   ← Skill: cómo construir lecciones HTML
    │   │   ├── kaledsoft-narrator.md    ← Skill: narrativa con KaledSoft
    │   │   └── prisma-seed-writer.md    ← Skill: cómo escribir el seed
    │   └── context/
    │       └── bootcamp-design-system.md ← Sistema de diseño completo
    └── docs/
        └── Temas/
            ├── context/                 ← Archivos generados por agent-researcher
            └── *.html                   ← Animaciones generadas por agent-animator
```

---

## Paso 1 — Crear `CONTEXT.md`

**Ruta:** `tenants/kaledacademy/.agent/CONTEXT.md`

Este archivo le dice a Claude quién es, dónde está y para qué existe este sistema de agentes.

```markdown
# Contexto del Sistema — KaledAcademy Bootcamp

## ¿Quién soy?
Eres un agente especializado trabajando para **AMAXOFT**, construyendo el
**AI SaaS Engineering Bootcamp** del tenant **KaledAcademy**.

## El Bootcamp
Un bootcamp de ingeniería de software para principiantes (especialmente jóvenes).
Todas las lecciones usan la empresa ficticia **KaledSoft** con sus tres productos:
- **KaledDental** — SaaS para clínicas odontológicas
- **KaledWash** — SaaS para lavanderías y lavaderos
- **KaledPark** — SaaS para parqueaderos y estacionamientos

KaledSoft es el hilo narrativo constante. Cada concepto técnico abstracto
debe aterrizarse con un ejemplo real de uno de estos tres productos.

## Stack Técnico del Proyecto
- **Framework:** Next.js (App Router)
- **ORM:** Prisma + PostgreSQL
- **Arquitectura:** Multi-tenant
- **Carpeta de temas:** `tenants/kaledacademy/docs/Temas/`
- **Seed:** `prisma/seed/kaledacademy-interactive-animations.ts`

## Principios Pedagógicos Inamovibles
1. Beginner-first: nunca asumir conocimiento previo
2. KaledSoft como ancla narrativa en cada slide
3. Revelar progresivamente: un concepto a la vez
4. Ritmo lento y secuencial
5. Interactividad con propósito, no decorativa

## Sistema de Diseño (HTML Lecciones)
Ver: `.agent/context/bootcamp-design-system.md`
```

---

## Paso 2 — Crear `bootcamp-design-system.md`

**Ruta:** `tenants/kaledacademy/.agent/context/bootcamp-design-system.md`

Contiene las reglas exactas de diseño, paleta, patrones JS y estructura HTML que todos los agentes deben respetar.

````markdown
# Sistema de Diseño — HTML Lecciones AMAXOFT Bootcamp

## Paleta de Colores (CSS Variables)
```css
--bg-primary: #0a0a0f;
--bg-secondary: #111827;
--bg-card: #1a1f2e;
--accent-cyan: #06b6d4;
--accent-blue: #3b82f6;
--accent-purple: #8b5cf6;
--text-primary: #f1f5f9;
--text-secondary: #94a3b8;
--text-muted: #64748b;
--border: #1e293b;
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
```

## Tipografía
- Títulos: `'Syne', sans-serif` (Google Fonts)
- Código: `'JetBrains Mono', monospace` (Google Fonts)
- Cuerpo: `'Inter', sans-serif` como fallback

## Estructura Obligatoria del HTML
- Un solo archivo `.html` autocontenido
- Dark theme con la paleta AMAXOFT
- Navegación por slides con dots y teclado (flechas ← →)
- Solo un slide visible a la vez
- Animaciones de entrada escalonadas con `setTimeout`
- 8-10 slides por lección

## Reglas Críticas de JavaScript
CORRECTO — usar siempre:
- `var` en lugar de `const` o `let`
- Funciones nombradas: `function miFuncion() {}`
- Concatenación: `'Texto ' + variable + ' más texto'`
- IIFEs para closures en loops

PROHIBIDO — causa fallos silenciosos:
- Arrow functions: `const x = () => {}`
- Template literals: `` `Hola ${nombre}` ``
- `const` y `let`
- Métodos de array modernos sin polyfill

## Patrón de Animación de Entrada
```javascript
function animateSlideIn(slideEl) {
  var elements = slideEl.querySelectorAll('.animate-item');
  for (var i = 0; i < elements.length; i++) {
    (function(el, idx) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      setTimeout(function() {
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, idx * 150);
    })(elements[i], i);
  }
}
```

## Patrón de Reset de Estado (CRÍTICO)
Cada slide interactivo debe tener una función `resetSlideN()` que:
1. Reinicie todas las variables de estado
2. Restaure el DOM al estado inicial
3. Se llame automáticamente al entrar al slide

```javascript
function resetSlide4() {
  currentStep = 0;
  // restaurar DOM...
}
// En goToSlide():
if (n === 4) resetSlide4();
```

## Elementos Interactivos por Tipo de Concepto
| Concepto        | Elemento sugerido                              |
|-----------------|------------------------------------------------|
| Flujos de datos | Diagrama paso a paso con botón "siguiente"     |
| Comparaciones   | Toggle A/B                                     |
| Métricas        | Barra de progreso animada o contador           |
| Arquitectura    | Diagrama de cajas con hover-tooltips           |
| Código          | Bloque con syntax highlight simulado           |
| Simuladores     | Mini-formulario con resultado en tiempo real   |
````

---

## Paso 3 — Crear `mcp.json`

**Ruta:** `tenants/kaledacademy/.agent/mcp.json`

Define los servidores MCP disponibles para los agentes. Ajusta las URLs a las de tu proyecto.

```json
{
  "mcpServers": {
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./"],
      "description": "Acceso al sistema de archivos del repositorio"
    },
    "web-search": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      },
      "description": "Búsqueda web para el agente researcher"
    },
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
      },
      "description": "Acceso a la base de datos para verificar estado del seed"
    }
  }
}
```

---

## Paso 4 — Los 4 Comandos (Agents)

### 4.1 — `commands/research.md` — Agent Researcher

**Propósito:** Investigar un tema técnico y producir un archivo de contexto estructurado listo para ser consumido por el agente animador.

**Ruta:** `tenants/kaledacademy/.agent/commands/research.md`

````markdown
# Comando: research — Investigar y Contextualizar un Tema

## Invocación
```
/research tema="[nombre del tema]" numero=[N]
```
Ejemplo: `/research tema="HTTP y URLs" numero=2`

## Tu Rol
Eres el **Agent Researcher** del bootcamp KaledAcademy. Tu misión es
investigar exhaustivamente el tema solicitado y producir un archivo de
contexto que será usado por el Agent Animator para generar la lección.

## Proceso Obligatorio

### 1. Investigación
Busca en la web información actualizada sobre el tema. Recopila:
- Definición clara y precisa del concepto
- Historia y contexto (¿cuándo surgió? ¿por qué existe?)
- Cómo funciona técnicamente (nivel intermedio)
- Casos de uso reales en producción
- Errores y confusiones comunes de principiantes
- Mejores prácticas actuales (2024-2025)
- Recursos visuales o diagramas relevantes que puedan inspirar slides

### 2. Anclaje en KaledSoft
Para cada concepto encontrado, crea al menos 2 narrativas concretas
usando KaledDental, KaledWash o KaledPark como contexto. Sigue el patrón:
> "Imagina que KaledDental tiene X... sin [concepto] pasaría Y...
> con [concepto] ocurre Z..."

### 3. Propuesta de Slides
Propón una estructura de 9 slides con:
- Título del slide
- Concepto central
- Elemento interactivo sugerido
- Qué producto KaledSoft se usa como ejemplo
- Complejidad estimada (baja / media / alta)

### 4. Output
Crea el archivo:
`tenants/kaledacademy/docs/Temas/context/context-tema_{N}_{slug}.md`

## Estructura del Archivo de Contexto Output

```markdown
# Contexto: [Título del Tema]
**Tema número:** N
**Slug:** tema_N_{slug}
**Fecha de investigación:** YYYY-MM-DD

## Resumen Ejecutivo
[2-3 oraciones describiendo el tema para un estudiante sin experiencia]

## Conceptos Clave
### [Concepto 1]
- Definición: ...
- Por qué importa: ...
- Analogía para principiantes: ...

[repetir para cada concepto]

## Narrativas KaledSoft
### Narrativa 1 — [KaledDental/KaledWash/KaledPark]
[Párrafo completo siguiendo el patrón "Imagina que..."]

### Narrativa 2 — [producto]
[...]

## Errores Comunes de Principiantes
1. ...
2. ...
3. ...

## Estructura de Slides Propuesta
| # | Título | Concepto | Interactivo | Producto KaledSoft |
|---|--------|----------|-------------|-------------------|
| 1 | ...    | ...      | ...         | ...               |
[9 filas]

## Recursos Adicionales
- [enlaces relevantes, documentación oficial, etc.]
```
````

---

### 4.2 — `commands/animate.md` — Agent Animator

**Propósito:** Tomar el archivo de contexto y generar el HTML interactivo completo de la lección.

**Ruta:** `tenants/kaledacademy/.agent/commands/animate.md`

````markdown
# Comando: animate — Generar Animación HTML de la Lección

## Invocación
```
/animate tema=tema_N_{slug}
```
Ejemplo: `/animate tema=tema_2_http_urls`

## Tu Rol
Eres el **Agent Animator** del bootcamp KaledAcademy. Recibes un archivo
de contexto investigado y produces el archivo HTML interactivo completo.

## Proceso Obligatorio

### 1. Leer el Contexto
Lee el archivo:
`tenants/kaledacademy/docs/Temas/context/context-{tema}.md`

Si no existe, detente y pide al usuario que ejecute primero `/research`.

### 2. Leer el Sistema de Diseño
Lee SIEMPRE antes de generar:
`tenants/kaledacademy/.agent/context/bootcamp-design-system.md`

### 3. Confirmar el Outline
Antes de generar el HTML completo, muestra la tabla de 9 slides al usuario
y espera confirmación. Solo procede cuando el usuario diga "aprobado" o
"continúa" o equivalente.

### 4. Generar el HTML
Genera el archivo HTML completo siguiendo ESTRICTAMENTE:
- Sistema de diseño del bootcamp (paleta, tipografía, estructura)
- Reglas críticas de JavaScript (sin arrow functions, sin template literals)
- Patrón de animaciones de entrada
- Patrón de reset de estado para slides interactivos
- Mínimo 9 slides
- Narrativas KaledSoft presentes en al menos 3 slides

### 5. Guardar y Mostrar
Guarda el archivo en:
`tenants/kaledacademy/docs/Temas/{tema}.html`

Luego muéstraselo al usuario indicando:
- Número de slides generados
- Elementos interactivos incluidos
- Slides con reset de estado implementado
- Cualquier decisión de diseño notable

Espera feedback antes de continuar al siguiente paso.

## Reglas de Calidad (Checklist Interno)
Antes de entregar, verifica:
- [ ] ¿Usa `var` en lugar de `const`/`let`?
- [ ] ¿Cero arrow functions?
- [ ] ¿Cero template literals?
- [ ] ¿Cada slide interactivo tiene función `resetSlideN()`?
- [ ] ¿Los resets se llaman en `goToSlide()`?
- [ ] ¿Hay narrativa KaledSoft en al menos 3 slides?
- [ ] ¿Los dots de navegación funcionan?
- [ ] ¿Las flechas de teclado funcionan?
- [ ] ¿El archivo es autocontenido (sin dependencias locales)?
````

---

### 4.3 — `commands/embed.md` — Agent Embedder

**Propósito:** Revisar la vista en el proyecto Next.js y escribir el código seed de Prisma para incrustar la animación correctamente.

**Ruta:** `tenants/kaledacademy/.agent/commands/embed.md`

````markdown
# Comando: embed — Incrustar Animación en el Proyecto

## Invocación
```
/embed tema=tema_N_{slug}
```
Ejemplo: `/embed tema=tema_2_http_urls`

## Tu Rol
Eres el **Agent Embedder** del bootcamp KaledAcademy. Tu misión es
integrar el HTML generado en el proyecto Next.js respetando exactamente
la arquitectura existente.

## Proceso Obligatorio

### 1. Verificar que el HTML existe
Confirma que existe:
`tenants/kaledacademy/docs/Temas/{tema}.html`

Si no existe, detente y pide ejecutar `/animate` primero.

### 2. Leer el Seed Existente
Lee el archivo de seed actual para entender el patrón y el último
`sortOrder` usado:
`prisma/seed/kaledacademy-interactive-animations.ts`

### 3. Leer la Vista de Lecciones
Lee los componentes Next.js que renderizan las lecciones interactivas.
Busca en:
- `tenants/kaledacademy/app/` — rutas y páginas
- `tenants/kaledacademy/components/` — componentes de lección
- `components/academy/` — componentes compartidos

Identifica:
- ¿Cómo se carga `htmlContent` desde la base de datos?
- ¿Se usa `dangerouslySetInnerHTML`? ¿O un iframe?
- ¿Hay restricciones de sandbox?
- ¿Hay estilos globales que podrían interferir?

### 4. Generar el Entry del Seed
Escribe el entry para `INTERACTIVE_ANIMATIONS_SEED`:

```typescript
{
  tenantId: KALEDACADEMY_TENANT_ID,
  slug: 'tema_N_{slug}',
  title: '[Título Legible]',
  description: '[Una oración describiendo qué aprende el estudiante.]',
  htmlContent: fs.readFileSync(
    path.join(__dirname, '../tenants/kaledacademy/docs/Temas/{tema}.html'),
    'utf-8'
  ),
  sortOrder: [siguiente número disponible],
},
```

### 5. Generar la Función `link*`
```typescript
async function linkTemaN_{Slug}(lessonMetas: AcademyLessonMeta[]) {
  const lesson = lessonMetas.find(l =>
    l.title.includes('[Palabra Clave Del Título]')
  );
  if (!lesson) {
    console.warn('⚠️ Lesson not found: [Título]');
    return;
  }
  await prisma.academyInteractiveAnimation.updateMany({
    where: {
      tenantId: KALEDACADEMY_TENANT_ID,
      slug: 'tema_N_{slug}',
    },
    data: { lessonMetaId: lesson.id },
  });
}
```

### 6. Instrucciones de Integración
Muestra al usuario exactamente:
1. Dónde insertar el entry en el array del seed
2. Dónde agregar la llamada a `linkTemaN_{Slug}()` en la función principal
3. El comando para correr el seed: `npx prisma db seed`
4. Cualquier advertencia sobre estilos o sandbox detectada en el paso 3
````

---

### 4.4 — `commands/quiz.md` — Agent Quizmaster

**Propósito:** Generar preguntas de repaso estructuradas para que el estudiante consolide lo aprendido.

**Ruta:** `tenants/kaledacademy/.agent/commands/quiz.md`

````markdown
# Comando: quiz — Generar Preguntas de Repaso

## Invocación
```
/quiz tema=tema_N_{slug} [dificultad=basica|mixta|avanzada]
```
Ejemplo: `/quiz tema=tema_2_http_urls dificultad=mixta`

## Tu Rol
Eres el **Agent Quizmaster** del bootcamp KaledAcademy. Generas preguntas
de repaso pedagógicamente sólidas para estudiantes principiantes.

## Proceso Obligatorio

### 1. Leer el Contexto del Tema
Lee:
- `tenants/kaledacademy/docs/Temas/context/context-{tema}.md`
- `tenants/kaledacademy/docs/Temas/{tema}.html` (para ver qué se cubrió)

### 2. Generar las Preguntas
Crea 10 preguntas siguiendo esta distribución:
- 3 preguntas de comprensión conceptual (definiciones, qué es, para qué sirve)
- 3 preguntas de aplicación práctica (¿qué pasaría si...? ¿cuál usarías?)
- 2 preguntas de identificación de errores (¿qué está mal aquí?)
- 2 preguntas de escenario KaledSoft (problemas contextualizados)

### Tipos de Pregunta Permitidos
- `multiple_choice` — 4 opciones, 1 correcta
- `true_false` — verdadero o falso con explicación
- `fill_blank` — completar la oración
- `scenario` — analizar un caso de KaledSoft y elegir la mejor solución

### 3. Output JSON
Guarda en:
`tenants/kaledacademy/docs/Temas/quizzes/quiz-{tema}.json`

```json
{
  "tema": "tema_N_{slug}",
  "titulo": "[Título Legible]",
  "generado": "YYYY-MM-DD",
  "dificultad": "mixta",
  "preguntas": [
    {
      "id": 1,
      "tipo": "multiple_choice",
      "categoria": "comprension",
      "pregunta": "¿Qué es [concepto]?",
      "opciones": ["A...", "B...", "C...", "D..."],
      "respuesta_correcta": "B",
      "explicacion": "B es correcta porque... Las otras opciones son incorrectas porque...",
      "slide_referencia": 3
    }
  ]
}
```

### 4. Mostrar Resumen
Muestra una tabla con las 10 preguntas (sin las respuestas) para que el
usuario revise la calidad antes de guardar el archivo final.

## Principios de Calidad Pedagógica
- Las preguntas deben medir comprensión, no memorización
- Los distractores (opciones incorrectas) deben ser plausibles
- Cada explicación debe enseñar, no solo decir "incorrecto"
- Al menos 2 preguntas deben referenciar KaledSoft explícitamente
- El lenguaje debe ser claro para alguien sin experiencia técnica
````

---

## Paso 5 — Crear las Skills de Apoyo

### `skills/kaledsoft-narrator.md`

**Ruta:** `tenants/kaledacademy/.agent/skills/kaledsoft-narrator.md`

```markdown
# Skill: Narrador de KaledSoft

## Propósito
Guía para construir narrativas concretas usando los tres productos de KaledSoft
como ancla de cada concepto técnico.

## Los Tres Productos
| Producto     | Contexto                      | Usuarios Típicos      |
|--------------|-------------------------------|-----------------------|
| KaledDental  | Clínicas odontológicas        | Dentistas, recepción  |
| KaledWash    | Lavanderías y lavaderos       | Dueños, operadores    |
| KaledPark    | Parqueaderos, estacionamientos| Administradores       |

## Patrón de Narrativa
```
"Imagina que [Producto] tiene [situación concreta con número].
Cada vez que [acción del usuario], el servidor [qué hace sin el concepto].
Sin [concepto], eso significa [consecuencia negativa concreta].
Con [concepto], [beneficio concreto con métricas si es posible]."
```

## Ejemplos por Categoría de Concepto

### Performance / Velocidad
> "KaledDental tiene 500 dentistas haciendo login a las 8am. Sin caché,
> eso son 500 queries simultáneas a la base de datos. Con Redis, la segunda
> consulta responde en 1ms en vez de 200ms."

### Seguridad
> "KaledPark necesita que solo el administrador pueda ver los reportes de
> ingresos. Sin autenticación JWT, cualquier persona con la URL podría
> ver los datos financieros del parqueadero."

### Datos / APIs
> "KaledWash quiere que sus clientes vean el estado de su ropa en tiempo
> real desde el celular. La app móvil le pregunta al servidor cada 5 segundos:
> '¿ya terminó la lavadora?'. Eso es una API REST en acción."

## Regla de Uso
Cada lección debe tener narrativa KaledSoft en mínimo 3 slides.
Varía el producto usado — no siempre KaledDental.
```

---

### `skills/html-lesson-builder.md`

**Ruta:** `tenants/kaledacademy/.agent/skills/html-lesson-builder.md`

```markdown
# Skill: Constructor de Lecciones HTML

## Propósito
Referencia rápida de patrones de código para construir los elementos
interactivos más comunes en las lecciones del bootcamp.

## Patrón: Toggle A/B
Usado para comparaciones (ej. GET vs POST, SQL vs NoSQL)

```html
<div class="toggle-container">
  <button onclick="setToggle('a')" id="btn-a" class="toggle-btn active">Opción A</button>
  <button onclick="setToggle('b')" id="btn-b" class="toggle-btn">Opción B</button>
</div>
<div id="panel-a" class="panel"><!-- contenido A --></div>
<div id="panel-b" class="panel" style="display:none"><!-- contenido B --></div>
<script>
function setToggle(option) {
  document.getElementById('panel-a').style.display = option === 'a' ? 'block' : 'none';
  document.getElementById('panel-b').style.display = option === 'b' ? 'block' : 'none';
  document.getElementById('btn-a').className = 'toggle-btn' + (option === 'a' ? ' active' : '');
  document.getElementById('btn-b').className = 'toggle-btn' + (option === 'b' ? ' active' : '');
}
</script>
```

## Patrón: Diagrama Paso a Paso
Usado para flujos (ej. ciclo request/response, pipeline de datos)

```html
<div id="step-display"><!-- contenido del paso actual --></div>
<div class="step-counter">Paso <span id="step-num">1</span> de 5</div>
<button onclick="nextStep()">Siguiente →</button>
<script>
var currentStep = 0;
var steps = [ /* array de objetos con título, descripción, etc. */ ];
function nextStep() {
  if (currentStep < steps.length - 1) {
    currentStep++;
    renderStep(currentStep);
  }
}
function renderStep(idx) {
  document.getElementById('step-num').innerHTML = idx + 1;
  // actualizar display...
}
function resetStepDiagram() {
  currentStep = 0;
  renderStep(0);
}
</script>
```

## Patrón: Quiz con Feedback Inmediato
```html
<div class="question">¿Cuál es...?</div>
<div class="options">
  <button onclick="checkAnswer(this, false)">Opción A</button>
  <button onclick="checkAnswer(this, true)">Opción B ✓</button>
  <button onclick="checkAnswer(this, false)">Opción C</button>
</div>
<div id="feedback" class="feedback"></div>
<script>
function checkAnswer(btn, isCorrect) {
  var feedback = document.getElementById('feedback');
  if (isCorrect) {
    btn.style.background = '#10b981';
    feedback.innerHTML = '✅ ¡Correcto! ...explicación...';
    feedback.style.color = '#10b981';
  } else {
    btn.style.background = '#ef4444';
    feedback.innerHTML = '❌ No exactamente. ...explicación...';
    feedback.style.color = '#ef4444';
  }
}
</script>
```
```

---

## Paso 6 — Crear el `README.md` del `.agent`

**Ruta:** `tenants/kaledacademy/.agent/README.md`

```markdown
# KaledAcademy — Sistema de Agentes

Sistema de 4 agentes especializados para crear temas del bootcamp.

## Pipeline Completo (orden obligatorio)

```
/research tema="[nombre]" numero=[N]
     ↓ genera: context/context-tema_N_{slug}.md
/animate tema=tema_N_{slug}
     ↓ genera: Temas/tema_N_{slug}.html  (revisar antes de continuar)
/embed tema=tema_N_{slug}
     ↓ genera: entrada del seed + función link
/quiz tema=tema_N_{slug} dificultad=mixta
     ↓ genera: quizzes/quiz-tema_N_{slug}.json
```

## Comandos

| Comando     | Archivo                    | Descripción                        |
|-------------|----------------------------|------------------------------------|
| `/research` | `commands/research.md`     | Investigar y contextualizar tema   |
| `/animate`  | `commands/animate.md`      | Generar HTML animado interactivo   |
| `/embed`    | `commands/embed.md`        | Incrustar en proyecto Next.js      |
| `/quiz`     | `commands/quiz.md`         | Generar preguntas de repaso        |

## Contexto y Skills

- `CONTEXT.md` — Quién soy, para qué existo, stack técnico
- `context/bootcamp-design-system.md` — Paleta, JS rules, patrones de código
- `skills/kaledsoft-narrator.md` — Cómo construir narrativas KaledSoft
- `skills/html-lesson-builder.md` — Patrones de elementos interactivos
- `skills/prisma-seed-writer.md` — Cómo escribir el seed de Prisma

## MCP Disponibles

Configurados en `mcp.json`:
- **filesystem** — Leer/escribir archivos del repositorio
- **web-search** — Búsqueda web (usado por `/research`)
- **postgres** — Consultar BD (usado por `/embed` para verificar)

## Outputs Generados

```
tenants/kaledacademy/docs/Temas/
├── context/
│   └── context-tema_N_{slug}.md     ← salida de /research
├── quizzes/
│   └── quiz-tema_N_{slug}.json      ← salida de /quiz
└── tema_N_{slug}.html               ← salida de /animate
```
```

---

## Resumen: Estructura Final de Archivos a Crear

```
tenants/kaledacademy/.agent/
├── README.md
├── CONTEXT.md
├── mcp.json
├── commands/
│   ├── research.md
│   ├── animate.md
│   ├── embed.md
│   └── quiz.md
├── skills/
│   ├── html-lesson-builder.md
│   ├── kaledsoft-narrator.md
│   └── prisma-seed-writer.md
└── context/
    └── bootcamp-design-system.md
```

**Total:** 11 archivos. Todos son Markdown o JSON — sin código ejecutable.
El sistema funciona en cualquier cliente Claude que soporte lectura de archivos
del repositorio vía MCP filesystem o Claude Code.

---

## Notas de Implementación

- **Claude Code** es el cliente ideal para este sistema: puede leer los comandos, ejecutar búsquedas web, escribir archivos y correr seeds directamente.
- Los comandos usan `/` como prefijo por convención, pero en Claude.ai se invocan mencionando el archivo de comando en el prompt.
- El archivo `mcp.json` requiere tener instalado Node.js y las dependencias MCP correspondientes.
- La variable `BRAVE_API_KEY` debe estar en el `.env` del repositorio para que el MCP de búsqueda web funcione.
