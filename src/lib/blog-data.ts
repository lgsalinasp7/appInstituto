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
