export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    date: string;
    author: string;
    category: string;
    image: string;
    content: string;
}

export const blogPosts: BlogPost[] = [
    {
        slug: "claude-code-mejoras-recientes-2026",
        title: "Claude Code en 2026: mejoras que sí notarás en el día a día",
        description:
            "Desde /powerup y el modo automático hasta rendimiento en sesiones largas, hooks avanzados y soporte Windows: un resumen de lo último en el CLI de Anthropic según sus notas de versión.",
        date: "2026-04-02",
        author: "KaledSoft Engineering",
        category: "IA",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200",
        content: `
# Claude Code no para de madurar: qué trae el producto ahora

Anthropic sigue iterando **Claude Code** a un ritmo muy alto. Más allá del ruido de redes, lo que importa para equipos de desarrollo está en el **changelog oficial** ([documentación de Claude Code](https://docs.anthropic.com/en/docs/claude-code/changelog)): correcciones de fricción real, seguridad en la terminal y menos tokens desperdiciados. Aquí van las líneas que más impactan si ya lo usas o estás evaluándolo.

## Aprender la herramienta sin tutoriales eternos: \`/powerup\`

Una de las novedades más claras para onboarding es **\`/powerup\`**: lecciones interactivas sobre funciones de Claude Code con **demos animadas**. Reduce curva de aprendizaje para el resto del equipo sin depender solo de “el que ya lo domina”.

## Modo automático más usable (y más alineado con tu intención)

El **modo automático** —pensado para aprobar acciones de bajo riesgo y frenar las peligrosas sin frenarte a cada rato— ha recibido matices importantes: por ejemplo, **respeta mejor límites explícitos** del usuario (“no hagas push”, “espera antes de X”). Los comandos denegados pueden **notificarse** y revisarse en **\`/permissions\`** (pestaña Reciente) para reintentar. Si tu plan no lo incluye, el mensaje ahora indica **“no disponible en tu plan”** en lugar de un aviso genérico.

Para el fondo de producto y seguridad del enfoque, vale la pena leer el artículo de ingeniería de Anthropic sobre [Claude Code auto mode](https://www.anthropic.com/engineering/claude-code-auto-mode).

## Rendimiento cuando el proyecto crece y la sesión se alarga

Varios cambios van directo al dolor de cabeza de sesiones largas y repos grandes:

- **Menos coste de CPU/memoria** en aspectos como esquemas MCP, transporte SSE con tramas grandes, y escritura de transcripciones en el SDK cuando el historial crece.
- **\`/resume\`** más ágil: carga de sesiones por proyecto en paralelo cuando tienes muchos proyectos.
- Ajustes en **compactación** y caché de prompt para evitar bucles que queman llamadas a la API sin avanzar.

En la práctica: menos “se puso lento” y menos sorpresas al retomar trabajo del día anterior.

## Hooks y automatización seria

Si integras Claude Code en pipelines o flujos propios, las notas destacan capacidades como la decisión de permiso **\`defer\`** en hooks **PreToolUse** (sesiones headless que pueden pausar y reanudar con \`-p --resume\`), el hook **PermissionDenied** tras denegaciones del clasificador en auto mode (con opción de **\`retry\`**), y **PreToolUse** que puede satisfacer **AskUserQuestion** en integraciones sin UI nativa. Son señales de que Anthropic está cerrando el círculo para uso **empresarial y scriptable**.

## Windows y PowerShell dejan de ser “segunda clase”

Hay un hilo constante de mejoras para **Windows**: herramienta **PowerShell** (preview u opt-in según versión), correcciones de **CRLF** en Edit/Write, endurecimiento ante patrones peligrosos en PowerShell, y arreglos de **voz** o WebSocket en entornos que antes fallaban. Si tu equipo está mixto macOS/Linux/Windows, esto reduce fricción real.

## MCP, VS Code y detalles que ahorran tokens

- **MCP:** conexiones acotadas en tiempo, OAuth con descubrimiento más estándar, deduplicación cuando mezclas servidores locales y conectores de claude.ai, límites en descripciones para no hinchar el contexto.
- **Extensión VS Code:** menos estados falsos de “Not responding”, mejor comportamiento para planes Max tras refresco de token.
- **Herramienta Read:** formato más compacto y menos re-lecturas redundantes → **menos tokens** en cada turno.

## Qué hacer con esto en KaledSoft

Actualizar el CLI con frecuencia (\`claude --version\` vs lo que indica el changelog), probar **\`/powerup\`** con el equipo, y si usáis auto mode, revisar **\`/permissions\`** como panel de control. Para proyectos Next.js, agentes y SaaS, cada mejora de sesión larga y de hooks se traduce en **menos tiempo perdido** y **gobernanza** más clara.

**Conclusión:** Claude Code dejó de ser solo “un chat en la terminal”: es un producto de **agente de código** con ciclo de release agresivo. Seguir el changelog es la forma más fiable de no quedarse atrás sin depender solo del hype.
        `
    },
    {
        slug: "anthropic-filtracion-codigo-claude-code-2026",
        title: "Filtración de Claude Code: qué pasó en Anthropic y qué implica para quienes construyen con IA",
        description:
            "Un error de empaquetado en npm expuso miles de archivos TypeScript del asistente de código de Anthropic. Resumen del incidente, la respuesta de la empresa y lecciones para pipelines y propiedad intelectual.",
        date: "2026-03-31",
        author: "KaledSoft Lab",
        category: "Seguridad",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200",
        content: `
# Cuando el mapa del bundle delata el tesoro: la filtración de Claude Code

A finales de marzo de 2026, la comunidad de seguridad y desarrollo se enteró de algo poco habitual: el código fuente interno de **Claude Code**, la herramienta de programación asistida por IA de Anthropic, quedó accesible de forma accidental. No fue un ataque a la base de datos de clientes: según la propia compañía, se trató de un **fallo humano en el empaquetado** de un release.

## Qué ocurrió, en términos concretos

El paquete oficial de Claude Code en **npm** incluyó un **archivo de source map** pensado para depurar código empaquetado. Ese mapa apuntaba a un **ZIP con TypeScript sin ofuscar** alojado en un bucket de **Cloudflare R2** de Anthropic. Quien descargaba el paquete podía seguir la pista hasta el archivo y descomprimirlo.

Según reportes de medios especializados (por ejemplo, [The Register](https://www.theregister.com/2026/03/31/anthropic_claude_code_source_code/)), el archivo contenía del orden de **1.900 archivos TypeScript** y **más de 512.000 líneas de código**, incluyendo bibliotecas de comandos con barra y herramientas integradas. El hallazgo se atribuye al investigador **Chaofan Shou**; el material se replicó rápidamente en **GitHub** (decenas de miles de forks en poco tiempo), lo que hizo prácticamente imposible “volver atrás” la difusión.

## La postura de Anthropic

En declaraciones recogidas por la prensa, Anthropic calificó el suceso como **problema de empaquetado por error humano**, no como una brecha de seguridad en el sentido clásico, y afirmó que **no se expusieron datos ni credenciales de clientes**. La empresa indicó que estaba aplicando medidas para evitar repeticiones.

Es un recordatorio de que, para una empresa de IA líder, el riesgo no solo está en el modelo: también en **CI/CD, políticas de publicación y qué archivos nunca deben salir en un artefacto de producción**.

## Contexto: esto no “inventa” el interés por el interior de Claude Code

Varios proyectos ya habían **ingeniería inversa** o analizado comportamientos de Claude Code antes de este incidente; la filtración aporta sobre todo una **instantánea actualizada** del código tal como lo construye Anthropic, útil para comparar, auditar enfoques de agentes y entender decisiones de producto — siempre dentro del marco legal y ético que corresponda en cada jurisdicción.

## Lección para equipos que usan IA en producción (y para nosotros en KaledSoft)

1. **Source maps y paquetes públicos:** revisar \`package.json\`, \`.npmignore\` y pipelines para que los mapas y artefactos de debug no se publiquen sin querer.
2. **Secretos y URLs en builds:** cualquier referencia a buckets, rutas internas o zips de código en configuraciones de bundler puede terminar en manos de terceros si el release no se audita.
3. **Dependencia de proveedores:** seguir confiando en Claude u otras APIs, pero con **modelo de amenazas** claro: incidentes de cadena de suministro y filtraciones afectan reputación, cumplimiento y confianza.

**Conclusión:** La noticia no invalida el valor de las herramientas de codificación con IA, pero sí refuerza que **la excelencia operativa** (releases, seguridad de empaquetado y gobernanza) es parte del producto. En KaledSoft seguimos apostando por arquitecturas con agentes y SaaS modernas — con pipelines revisados y criterio de qué exponemos al mundo exterior.
        `
    },
    {
        slug: "guerra-modelos-ia-2026",
        title: "Guerra de Modelos 2026: Anthropic, OpenAI y Google en el límite",
        description: "Análisis profundo de los nuevos lanzamientos de esta semana: Claude 4, GPT-5/o2 y Gemini 2 Ultra.",
        date: "2026-02-24",
        author: "KaledSoft Lab",
        category: "Tecnología",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200",
        content: `
# Guerra de Modelos 2026: El Estado del Arte

Esta semana ha sido testigo de uno de los hitos más importantes en la historia de la computación. Los tres gigantes —Anthropic, OpenAI y Google— han liberado sus modelos insignia de próxima generación casi de forma simultánea.

## Claude 4: El Pináculo del Razonamiento
Anthropic ha sorprendido con Claude 4, un modelo que no solo supera todas las pruebas de codificación existentes, sino que demuestra una "consciencia de contexto" sin precedentes. Su capacidad para manejar repositorios de código completos en una sola ventana de contexto lo convierte en el aliado definitivo para las SaaS Factories.

## GPT-5 (o2): Más Humano que Nunca
OpenAI, con su nueva arquitectura o2, ha enfocado sus esfuerzos en la multimodalidad nativa. GPT-5 ya no solo 'procesa' video o audio, sino que vive dentro de ellos, permitiendo interacciones en tiempo real con latencias inferiores a los 100ms.

## Gemini 2 Ultra: La Ventaja de la Infraestructura
Google ha aprovechado su superioridad en hardware (TPU v6) para ofrecer un modelo que destaca en el razonamiento matemático y la integración profunda con todo el ecosistema de productividad.

**Conclusión:** Para KaledSoft, esta guerra de modelos significa que las barreras técnicas para construir agentes inteligentes complejos han caído. Estamos en la era de la arquitectura, no solo del código.
        `
    },
    {
        slug: "claudebot-adquisicion-tendencia",
        title: "La tendencia ClaudeBot: ¿Por qué OpenAI está moviendo fichas?",
        description: "La reciente 'movida' estratégica en torno a la arquitectura de ClaudeBot y cómo está redefiniendo el mercado de los agentes autónomos.",
        date: "2026-02-23",
        author: "KaledSoft Engineering",
        category: "IA",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
        content: `
# El Fenómeno ClaudeBot y la Reconfiguración del Mercado

El ecosistema de la IA ha quedado en shock tras las crecientes tendencias que apuntan a una integración masiva de tecnologías similares a ClaudeBot dentro del ecosistema de OpenAI.

## ¿Qué es ClaudeBot?
ClaudeBot no es solo un asistente; es una infraestructura de orquestación de agentes que ha demostrado una autonomía superior en tareas de largo aliento. Su arquitectura, basada en 'micro-memorias' compartidas, permite que múltiples agentes trabajen en paralelo sobre un mismo objetivo complejo.

## La Tendencia de Adquisición
En el mundo tech de 2026, la velocidad de ejecución es el único foso. Los rumores y tendencias sobre la integración de este tipo de sistemas reflejan una verdad innegable: las empresas ya no quieren 'chatbots', quieren 'trabajadores digitales'.

## Impacto en Colombia y Latam
Para el mercado en Colombia y la región, esto abre una ventana de oportunidad. Ser los primeros en implementar arquitecturas tipo ClaudeBot nos permite ofrecer soluciones de automatización empresarial que antes solo estaban al alcance de presupuestos multimillonarios.
        `
    },
    {
        slug: "programacion-ia-tendencia-4-0",
        title: "Programación 4.0: El fin del 'Coder' y el inicio del Arquitecto de Agentes",
        description: "Cómo la IA ha transformado la programación de una tarea sintáctica a un ejercicio de orquestación de sistemas complejos.",
        date: "2026-02-22",
        author: "KaledSoft Academy",
        category: "Educación",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200",
        content: `
# Programación 4.0: La Nueva Realidad

Hace apenas unos años, programar consistía en aprender sintaxis y algoritmos básicos. Hoy, en 2026, la IA escribe el código. Entonces, ¿cuál es nuestro rol?

## De la Sintaxis a la Orquestación
El desarrollador moderno se ha transformado en un Arquitecto de Agentes. Nuestra labor ya no es escribir bucles \`for\`, sino diseñar cómo se comunican las diferentes IAs para resolver problemas de negocio.

## El Stack de 2026
En nuestra academia, enfocamos la enseñanza en:
- **Diseño de Prompt Engineering Avanzado**
- **Sistemas de Memoria para Agentes**
- **Integración de AI SDK y Orquestadores**

## Por qué es Vital para el SEO Local
Ser un referente en este tema posiciona a KaledSoft como la única autoridad técnica en la Costa Caribe capaz de formar a la élite tecnológica que el mercado global demanda. Estamos pasando de ser 'operarios' a ser 'directores de orquesta'.
        `
    }
];
