import type { SubstepTimers } from "./lang-ide-timers";
import * as B from "./lang-ide-builders";

export type LangIdeStep = {
  badge: string;
  color: string;
  title: string;
  tagline: string;
  explanation: string;
  substeps: { color: string; text: string }[];
  ctrlInfo: string;
  buildAnim: (container: HTMLElement, color: string, substepTimers: SubstepTimers) => void;
  extraContent?: (container: HTMLElement, color: string, substepTimers: SubstepTimers) => void;
};

export const LENGUAJES_IDE_STEPS: LangIdeStep[] = [
  {
    badge: "🗺️",
    color: "#fbbf24",
    title: "Del bit al lenguaje que entiendes",
    tagline: "Nadie memoriza todos los lenguajes: se aprende el mapa",
    explanation: `
      <p>Los programas empezaron como <strong>ceros y unos</strong> y cadenas de instrucciones opacas. Con el tiempo aparecieron <strong>lenguajes de alto nivel</strong>: escribes de forma más cercana al pensamiento humano y una herramienta (compilador o intérprete) traduce a lo que la máquina ejecuta.</p>
      <p>Hoy hay muchos lenguajes porque hay muchos problemas: web, datos, móvil, sistemas embebidos… En el bootcamp irás de <strong>HTML, CSS y JavaScript</strong> hacia un stack moderno paso a paso.</p>`,
    substeps: [
      { color: "#fbbf24", text: "<strong>Sintaxis</strong> — reglas de escritura; si te equivocas en un símbolo, el entorno te avisa." },
      { color: "#fbbf24", text: "<strong>Semántica</strong> — qué significa cada construcción; es lo que estudias con la práctica." },
      { color: "#fbbf24", text: "<strong>Ecosistema</strong> — bibliotecas, comunidad y herramientas alrededor del lenguaje." },
    ],
    ctrlInfo: "Historia y mapa",
    buildAnim: B.buildHistoryAnim,
  },
  {
    badge: "⚖️",
    color: "#06b6d4",
    title: "Compilado, interpretado, tipado",
    tagline: "Tres ideas que suenan en entrevistas y en el día a día",
    explanation: `
      <p><strong>Compilado</strong> suele implicar una fase previa que traduce todo el programa a código máquina o intermedio. <strong>Interpretado</strong> suele leer y ejecutar al vuelo (aunque muchos lenguajes modernos mezclan técnicas).</p>
      <p><strong>Tipado fuerte / estático</strong> vs <strong>débil / dinámico</strong> describe cuánto te obliga el lenguaje a declarar tipos y cuándo se detectan errores. No hay un “ganador universal”: hay equipos y productos que privilegian velocidad de escritura o seguridad de tipos.</p>`,
    substeps: [
      { color: "#06b6d4", text: "JavaScript en el navegador es dinámico y muy flexible; TypeScript (más adelante) añade capas de tipo sobre JS." },
      { color: "#06b6d4", text: "Python, que verás de refilón hoy, suele enseñarse como dinámico y legible para humanos." },
    ],
    ctrlInfo: "Clasificación didáctica",
    buildAnim: B.buildTypesAnim,
  },
  {
    badge: "🌐",
    color: "#facc15",
    title: "JavaScript en el navegador",
    tagline: "La tríada: HTML + CSS + JS",
    explanation: `
      <p><strong>HTML</strong> define la <strong>estructura</strong> (títulos, párrafos, enlaces). <strong>CSS</strong> define la <strong>presentación</strong> (colores, tipografías, layout). <strong>JavaScript</strong> añade <strong>comportamiento</strong>: reaccionar a clics, validar formularios, pedir datos sin recargar toda la página.</p>
      <p>En el módulo 1 usarás sobre todo HTML y un poco de JS a medida que avances; el foco ahora es que sepas <strong>dónde encaja cada capa</strong>.</p>`,
    substeps: [
      { color: "#facc15", text: "Sin HTML no hay “página” que estilizar; sin CSS todo se ve plano; sin JS la página no reacciona." },
      { color: "#facc15", text: "Más adelante verás JS también en el servidor (Node) para lógica de backend." },
    ],
    ctrlInfo: "Stack web cliente",
    buildAnim: B.buildWebStackAnim,
  },
  {
    badge: "🐍",
    color: "#38bdf8",
    title: "Python: otro mundo, misma disciplina",
    tagline: "Datos, scripts e IA — sin instalar nada hoy",
    explanation: `
      <p><strong>Python</strong> es muy popular en <strong>ciencia de datos</strong>, <strong>automatización</strong> e <strong>inteligencia artificial</strong>. No “compite” con JavaScript en el navegador: cada uno brilla en su entorno.</p>
      <p>En este bootcamp lo cruzarás cuando hablemos de herramientas de IA y flujos de datos. Por ahora solo necesitas <strong>reconocerlo en el mapa</strong>.</p>`,
    substeps: [
      { color: "#38bdf8", text: "Misma disciplina: leer documentación, depurar errores, versionar código." },
      { color: "#38bdf8", text: "No hace falta dominar Python en la semana 1." },
    ],
    ctrlInfo: "Ecosistema Python",
    buildAnim: B.buildPythonPeekAnim,
  },
  {
    badge: "🛠️",
    color: "#a855f7",
    title: "¿Qué es un IDE?",
    tagline: "Tu taller: editor + terminal + ayudas",
    explanation: `
      <p>Un <strong>IDE</strong> (entorno de desarrollo integrado) agrupa lo que necesitas para construir software en un solo lugar: <strong>editor</strong> con resaltado y autocompletado, <strong>terminal</strong> para comandos, a veces <strong>depurador</strong>, y <strong>extensiones</strong> (Git, linters, temas).</p>
      <p>Puedes escribir código en un bloc de notas, pero perderías velocidad y cometerías más errores evitables. El IDE es tu <strong>mesa de trabajo profesional</strong>.</p>`,
    substeps: [
      { color: "#a855f7", text: "Extensiones convierten un editor genérico en una herramienta a medida para tu stack." },
      { color: "#a855f7", text: "La terminal integrada evita saltar entre ventanas constantemente." },
    ],
    ctrlInfo: "IDE",
    buildAnim: B.buildIdeWorkshopAnim,
  },
  {
    badge: "💠",
    color: "#34d399",
    title: "Visual Studio Code",
    tagline: "Gratis, multiplataforma, estándar en web",
    explanation: `
      <p><strong>Visual Studio Code</strong> (VS Code) es el editor que usamos como referencia en el bootcamp. Es gratuito, funciona en Windows, macOS y Linux, y tiene un marketplace enorme de extensiones.</p>
      <p>Existen <strong>forks</strong> (Cursor, Windsurf, VSCodium) basados en el mismo núcleo; el flujo de carpetas, archivos y terminal es muy parecido.</p>`,
    substeps: [
      { color: "#34d399", text: "Descarga desde <code>code.visualstudio.com</code> si aún no lo tienes." },
      { color: "#34d399", text: "Abre siempre una <strong>carpeta</strong> del proyecto, no archivos sueltos, para que Git y rutas funcionen bien." },
    ],
    ctrlInfo: "VS Code",
    buildAnim: B.buildVscodeMiniAnim,
  },
  {
    badge: "📄",
    color: "#f472b6",
    title: "Cierra con index.html mínimo",
    tagline: "Listo para Git la semana siguiente",
    explanation: `
      <p>En la práctica de la lección crearás un <strong>index.html</strong> con la estructura mínima: <code>DOCTYPE</code>, <code>html</code>, <code>head</code> con <code>charset</code> y <code>title</code>, <code>body</code> con un <code>h1</code> y un <code>p</code> con tu nombre.</p>
      <p>Guárdalo en la <strong>carpeta del bootcamp</strong> que versionarás con Git. Así la sesión de repositorios no empieza desde cero.</p>`,
    substeps: [
      { color: "#f472b6", text: "Comprueba la extensión real del archivo: debe ser <code>.html</code>, no <code>.txt</code> oculto en Windows." },
      { color: "#f472b6", text: "Abre el archivo en el navegador (doble clic o arrastrar) y verifica que ves tu nombre." },
    ],
    ctrlInfo: "Entregable ligero",
    buildAnim: B.buildIndexHtmlPracticeAnim,
  },
];
