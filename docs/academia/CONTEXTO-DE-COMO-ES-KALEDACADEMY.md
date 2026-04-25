La analogía del GPS y conducir
Imagina que quieres llegar a un destino. El GPS (la IA) te da todas las instrucciones paso a paso. Pero si no sabes conducir — no entiendes qué es el freno, el acelerador, las marchas, las señales de tráfico — el GPS es inútil. Peor aún, es peligroso.
Puedes llegar a tu destino en condiciones ideales. Pero cuando algo sale mal — una calle cerrada, el GPS falla, necesitas hacer una maniobra especial — te quedas completamente bloqueado sin saber qué hacer.

Aplicado a programación con IA:

La IA genera el código (el GPS da las instrucciones)
Tú tienes que saber leerlo, evaluarlo y corregirlo (tienes que saber conducir)
Si no entiendes qué es un componente de React, qué hace un useEffect, o por qué hay un problema de hidratación en Next.js, no puedes decirle a la IA qué está mal ni cómo arreglarlo


Lo que sí cambió con la IA:
La IA redujo el umbral de lo que necesitas memorizar. Antes tenías que saber escribir todo de memoria. Ahora el estándar mínimo es distinto:
AntesAhoraMemorizar sintaxisEntender conceptosSaber escribir el códigoSaber leer y evaluar el códigoAños de práctica para producirMeses para producir con criterio

La conclusión práctica:
La gente que dice "no necesitas saber nada" generalmente está haciendo apps muy simples, en condiciones ideales, o simplemente aún no se ha topado con el muro. Ese muro llega cuando hay un bug raro, cuando necesitas optimizar, cuando el proyecto escala, o cuando tienes que tomar una decisión de arquitectura.
Los fundamentos no son para escribir código sin IA — son para no ser rehén de la IA.
Los muros que aparecen en la realidad
1. Control de versiones
Si no sabes qué es Git o GitHub, cuando algo se rompe no puedes volver atrás. Trabajas en un solo archivo, sin historial, sin ramas. Un error puede borrar semanas de trabajo y no tienes manera de recuperarlo.
2. Colaboración en equipo
En un equipo real hay múltiples personas tocando el mismo código al mismo tiempo. Si no entiendes qué es un merge, un pull request, o un conflicto de ramas, eres un riesgo para el equipo, no un aporte.
3. Environments y variables de entorno
La IA genera código con process.env.API_KEY pero si no sabes qué es eso, subes tu API key directamente al repositorio, la expones públicamente en GitHub y en horas alguien la roba. Esto pasa constantemente con principiantes.
4. Deploy y hosting
Vercel, Railway, Fly.io, un VPS — cada uno tiene sus reglas. Si no entiendes la diferencia entre un frontend estático, un servidor SSR y un backend con API, no sabes dónde deployar cada cosa ni por qué tu app funciona en local pero falla en producción.
5. Base de datos en producción
La IA te ayuda a escribir queries de Supabase o Prisma. Pero si no entiendes qué son migraciones, qué pasa si modificas una tabla en producción con usuarios reales, o qué es un índice, puedes corromper datos reales de clientes.
6. Debugging real
La IA puede sugerir soluciones, pero para debuggear necesitas saber leer un stack trace, entender qué es un error 500 vs 404 vs CORS, abrir DevTools, leer logs del servidor. Sin eso, copias el error en el chat y esperas que la IA adivine el contexto completo, lo cual muchas veces no funciona.
7. Seguridad básica
Sin fundamentos no detectas que el código generado tiene una SQL injection abierta, que estás exponiendo rutas sin autenticación, o que estás guardando contraseñas en texto plano. La IA no siempre genera código seguro por defecto.
8. Performance y calidad
No sabes por qué tu app carga lento. No entiendes qué es un re-render innecesario en React, qué es lazy loading, qué significa que una query no tiene índice. La IA puede generar código que funciona pero que es lento o costoso en escala.
9. Testing
Sin saber qué son pruebas unitarias, de integración o E2E, shipeas código sin ninguna red de seguridad. Cada cambio puede romper algo que no ves. En producción lo descubren los usuarios, no tú.
10. Code reviews y estándares
En un equipo real te van a pedir que expliques tu código, que justifiques decisiones, que sigas convenciones. Si todo lo generó la IA y no lo entiendes, no puedes defenderlo ni adaptarlo cuando alguien te pide un cambio específico.

El patrón común de todos estos casos
La IA resuelve el qué escribir. Pero no resuelve el dónde va, cómo se protege, cómo se prueba, cómo se mantiene ni cómo se trabaja en equipo. Todo eso es contexto profesional que solo viene de entender el ecosistema completo.
La IA es un acelerador brutal para alguien con fundamentos. Para alguien sin ellos, es una máquina de generar deuda técnica y problemas invisibles.
El concepto central del bootcamp
No estás enseñando a programar. Estás enseñando a dirigir la IA con criterio. Esa es la diferencia entre un usuario de IA y un profesional que usa IA.

Frases para marketing
La frase base ya la tienes. Aquí más en la misma línea:

"La IA escribe el código. Tú tienes que saber si está bien escrito."


"Cualquiera puede pedirle código a la IA. No cualquiera sabe qué hacer cuando ese código falla en producción."


"Aprender a programar hoy no es memorizar sintaxis. Es saber qué preguntar, cómo evaluar la respuesta, y cuándo la IA está equivocada."


"La IA democratizó escribir código. Los fundamentos son lo que separa a quien construye productos reales de quien construye demos que nunca llegan a producción."


"No te enseñamos a competir con la IA. Te enseñamos a usarla sin que te use a ti."


"El que no tiene fundamentos le cree todo a la IA. El que tiene fundamentos sabe cuándo la IA está mintiendo."


El ángulo de mercado que puedes explotar
Hay dos tipos de bootcamps ahora mismo:

Los que dicen "con IA no necesitas saber nada" → forman gente que hace demos
Los que dicen "los fundamentos te hacen invencible con IA" → forman gente que consigue trabajo y construye productos reales

Tú estás en el segundo grupo, y ese es el posicionamiento ganador porque el mercado ya está lleno del primero y sus egresados están frustrados.

El currículo resuelto problema por problema
Problema realQué enseñarNo sabe qué generó la IAHTML, CSS, JS como lectura, no como memorizaciónRompe el proyecto y no sabe volverGit y GitHub desde el primer díaFunciona local, falla en producciónVariables de entorno, environments, deploy realExpone credencialesSeguridad básica, .env, secretsNo puede trabajar en equipoPull requests, ramas, code reviewLa app escala y se rompeBases de datos, índices, queries eficientesNadie confía en su códigoTesting unitario y E2E básicoNo sabe debuggearDevTools, logs, stack traces, errores HTTPHace demos pero no productosArquitectura: frontend, backend, API, hostingLa IA genera código inseguroOWASP básico, autenticación, autorización

La narrativa completa para el pitch
El mundo cambió. Antes necesitabas 3 años para construir algo. Hoy la IA te da el código en segundos.
Pero hay un problema que nadie está resolviendo: miles de personas están construyendo sobre arena. Generan código que no entienden, lo suben sin saber cómo, y cuando algo falla no tienen idea por dónde empezar.
Este bootcamp existe para darte lo único que la IA no puede darte: criterio. Saber leer código, evaluarlo, corregirlo, desplegarlo, protegerlo y mantenerlo. No para escribir sin IA, sino para que la IA trabaje para ti y no al revés.
Estructura sugerida con los ajustes
MesEnfoqueAñadir1Fundamentos, HTML, CSS, JS básicoGit como hábito desde día 12JS profundo, React, Next.jsDeploy a Vercel desde el primer proyecto, variables de entorno3APIs REST, backend, bases de datos, PrismaTesting básico, autenticación, seguridad4IA: agentes, AI SDK, APIs de modelos, prompting técnicoCode review, buenas prácticas profesionales

En resumen
El temario está bien. El tiempo es suficiente si el estudiante se compromete. Los dos ajustes críticos son Git desde el día uno y al menos una sesión seria de testing. Todo lo demás está en el lugar correcto.
Curso 1 reestructurado
Mes 1 — Fundamentos
Historia del internet, cómo funciona la web, HTML, CSS, JavaScript básico, Git desde el día 1 como hábito, primer deploy real en Vercel al final del mes.
Mes 2 — Frontend profesional
JavaScript profundo, React, Next.js, consumo de APIs externas, manejo de estado, buenas prácticas de componentes.
Mes 3 — Backend y arquitectura real
APIs REST, Node.js, bases de datos con Prisma, autenticación, variables de entorno, manejo de environments (development, staging, production), integración con GitHub para gestionar secrets en Vercel, medios de pago con Stripe, deploy completo fullstack.
Mes 4 — Calidad e introducción a IA
Primeras dos semanas: testing unitario y E2E con Playwright o Vitest, qué son y por qué existen, escribir al menos un flujo crítico con pruebas. Últimas dos semanas: primer vistazo a IA, consumir API de OpenAI o Anthropic, construir algo simple con IA integrada, introducción a prompting técnico.
Bootcamp — Curso 1: El Desarrollador Moderno
Duración: 4 meses | Lunes, Miércoles y Viernes | 2 horas por clase
Premisa: Se asume cero conocimiento previo. Cada tema construye sobre el anterior.

Mes 1 — Fundamentos de la Web y Git
La meta del mes: El estudiante entiende cómo funciona internet, cómo se comunican los sistemas, y ya tiene el hábito de versionar su código desde el primer día.
#TemaContenido1El viaje de una URLQué pasa desde que escribes una URL hasta que ves la página. DNS, servidores, respuesta.2HTTP y el modelo cliente-servidorQué es un cliente, qué es un servidor, cómo se comunican, métodos HTTP, códigos de respuesta.3TCP/IP y la infraestructura de internetCómo viajan los datos, qué es una IP, qué es un puerto, capas de red explicadas sin complejidad.4Historia de los lenguajes de programaciónPor qué existen, cómo evolucionaron, qué problema resuelve cada generación, dónde encaja JavaScript.5Introducción a GitQué es el control de versiones, por qué existe, historia de Git, cómo funciona localmente.6Git en la prácticainit, add, commit, status, log. El estudiante versiona su primer proyecto desde esta clase.7Ramas en GitQué es una rama, por qué existen, branch, checkout, merge, resolver conflictos básicos.8GitHub y trabajo remotoQué es GitHub, push, pull, clone, cómo colaborar, primer repositorio público.9Flujo profesional con GitPull requests, code review básico, convenciones de commits, cómo trabajan los equipos reales.10HTML — Estructura de la webQué es HTML, historia, estructura de un documento, etiquetas semánticas, accesibilidad básica.11CSS — Estilos y diseñoQué es CSS, selectores, box model, flexbox, grid, responsividad básica.12Frameworks de CSSPor qué existen, Tailwind CSS como herramienta principal, utilidades, configuración básica.

Mes 2 — JavaScript y React
La meta del mes: El estudiante programa con lógica real, entiende por qué nació React y construye interfaces con componentes propios.
#TemaContenido13Historia de JavaScript y ECMAScriptCómo nació JS, qué es ECMAScript, por qué ES6 fue un antes y un después.14JavaScript moderno — FundamentosVariables, tipos de datos, funciones, condicionales, bucles. Código real desde el primer día.15JavaScript — Arrays y objetosMétodos esenciales: map, filter, reduce, destructuring, spread operator.16JavaScript — AsincroníaQué es el event loop, callbacks, promesas, async/await. Por qué JavaScript funciona así.17El DOM y la manipulación del navegadorQué es el DOM, cómo JS interactúa con HTML, eventos, listeners.18AJAX y el problema que resolvióQué era la web antes de AJAX, qué cambió, fetch API, consumir una API pública por primera vez.19Por qué nació ReactProblemas del DOM manual, qué es el Virtual DOM, qué resolvieron los componentes.20React — FundamentosComponentes, JSX, props, estado con useState, renderizado condicional.21React — Efectos y ciclo de vidauseEffect, cuándo y cómo usarlo, dependencias, limpieza.22React — Manejo de estado avanzadouseContext, useReducer, cuándo cada uno tiene sentido.23React — Buenas prácticas y estructuraCómo organizar carpetas en un proyecto real, separación de responsabilidades, componentes reutilizables.24React — OptimizaciónLazy loading, React.memo, useMemo, useCallback, cuándo optimizar y cuándo no.

Mes 3 — Next.js, Backend y Arquitectura Real
La meta del mes: El estudiante construye y deploya una aplicación fullstack completa con autenticación, base de datos, variables de entorno correctas y medios de pago.
#TemaContenido25Por qué Next.jsLimitaciones de React puro, qué agrega Next.js, SSR vs SSG vs CSR, App Router.26Next.js — Estructura y routingFile-based routing, layouts, páginas, navegación, metadata.27Next.js — Server Components y Client ComponentsCuándo usar cada uno, diferencias prácticas, errores comunes.28Consumo de APIs en Next.jsfetch en servidor, fetch en cliente, loading states, error handling.29Qué es un backend y por qué existeSeparación frontend/backend, qué no debe vivir en el cliente, seguridad básica.30APIs RESTQué es REST, verbos HTTP en la práctica, estructura de endpoints, buenas convenciones.31Node.js y el servidorCómo funciona Node, qué es Express, crear la primera API propia.32Bases de datos — ConceptosRelacionales vs no relacionales, cuándo usar cada una, qué es un esquema.33PostgreSQL y PrismaModelado de datos, esquemas, migraciones, queries básicas, relaciones.34AutenticaciónQué es autenticación vs autorización, JWT, sesiones, implementación con NextAuth o Clerk.35Variables de entorno y environmentsQué es .env, development vs staging vs production, cómo manejar secrets en Vercel y GitHub.36Deploy fullstack profesionalVercel para frontend/Next.js, base de datos en Supabase o Railway, variables de entorno en producción.37Medios de pago con StripeCómo funciona Stripe, checkout, webhooks, variables de entorno de pago, modo test vs producción.

Mes 4 — Calidad, Testing e Introducción a IA
La meta del mes: El estudiante sabe probar su código, entiende qué es calidad profesional, y construye su primera integración real con IA.
#TemaContenido38Por qué existe el testingQué problema resuelve, tipos de pruebas, qué es una pirámide de testing, cultura de calidad.39Tests unitariosQué es un test unitario, Vitest, escribir los primeros tests sobre funciones reales del proyecto.40Tests de integraciónQué prueban, cómo testear una API, mocking básico.41Pruebas E2E con PlaywrightQué son las pruebas end-to-end, instalar Playwright, escribir el primer flujo crítico automatizado.42QA y flujos de trabajo profesionalesQué hace un QA, cómo se integra el testing en GitHub Actions, CI/CD básico.43Cómo funciona un LLMQué son los tokens, el contexto, las limitaciones reales, alucinaciones, por qué importa entender esto.44Prompting técnicoCómo escribir prompts efectivos para código, system prompts, roles, temperatura, diferencia entre usuario y desarrollador que usa IA.45Consumir la API de IAIntegrar OpenAI o Anthropic en un proyecto Next.js, manejo de respuestas, streaming básico.46Introducción a agentesQué es un agente, tool calling básico, diferencia entre un chatbot y un agente real.47Proyecto final — ConstrucciónAplicación fullstack con IA integrada: Next.js, API propia, base de datos, autenticación, al menos un test.48Proyecto final — Demo y revisiónCada estudiante presenta su proyecto, code review grupal, retroalimentación profesional.

Lo que el estudiante puede hacer al terminar

Construir y deployar una aplicación fullstack completa
Trabajar en equipo con Git y GitHub de manera profesional
Integrar pagos reales con Stripe
Escribir tests básicos sobre su propio código
Consumir APIs de IA e integrarlas en productos reales
Leer, evaluar y corregir código generado por IA con criterio