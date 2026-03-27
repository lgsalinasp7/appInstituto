import type { SubstepTimers } from "./http-cs-timers";
import * as B from "./http-cs-builders";

export type HttpCsStep = {
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

export const HTTP_CS_STEPS: HttpCsStep[] = [
  {
    badge: "📜",
    color: "#00f5c4",
    title: "Una historia corta",
    tagline: "De la red de investigación al idioma de las páginas web",
    explanation: `
      <p>Antes de hablar de HTTP, conviene ver el hilo: primero hubo una <strong>red</strong> que conecta computadoras,
      luego una forma de <strong>dirigir los datos en paquetes</strong>, y después un sistema para que los humanos no tengan que memorizar números.</p>
      <p>En la sesión anterior viste el <strong>viaje de una URL</strong>. Hoy cerramos el círculo: cómo el navegador y el servidor se <strong>hablan</strong> usando HTTP.</p>`,
    substeps: [
      { color: "#00f5c4", text: "<strong>Red</strong> — muchas máquinas enlazadas; si un camino falla, los datos pueden tomar otro." },
      { color: "#00f5c4", text: "<strong>TCP/IP</strong> — los mensajes se trocean en paquetes etiquetados con origen y destino." },
      { color: "#00f5c4", text: "<strong>DNS</strong> — nombres amigables ↔ direcciones numéricas que la red entiende." },
      { color: "#00f5c4", text: "<strong>HTTP</strong> — el formato de la <em>petición</em> y la <em>respuesta</em> de una página web." },
    ],
    ctrlInfo: "Contexto histórico",
    buildAnim: B.buildTimelineAnim,
  },
  {
    badge: "📦",
    color: "#f59e0b",
    title: "Paquetes en el cable",
    tagline: "No viaja un archivo entero de un solo golpe",
    explanation: `
      <p>La información se divide en <strong>paquetes</strong> pequeños. Cada uno lleva datos y pistas de enrutamiento.</p>
      <p>La animación es esquemática: en la realidad hay muchos saltos y confirmaciones; la idea es fijar la imagen mental de <strong>ida y vuelta</strong>.</p>`,
    substeps: [
      { color: "#f59e0b", text: "<strong>Cliente</strong> — tu navegador (o app) inicia la conversación." },
      { color: "#f59e0b", text: "<strong>Red</strong> — los paquetes atraviesan routers hasta el destino." },
      { color: "#f59e0b", text: "<strong>Servidor</strong> — recibe, interpreta y puede contestar con otra tanda de paquetes." },
    ],
    ctrlInfo: "TCP/IP (simplificado)",
    buildAnim: B.buildTcpPacketAnim,
  },
  {
    badge: "⚖️",
    color: "#7c3aed",
    title: "Cliente y servidor",
    tagline: "Dos roles, no dos marcas de computador",
    explanation: `
      <p><strong>Cliente</strong> es quien <em>pide</em> (normalmente tu navegador). <strong>Servidor</strong> es un programa en otra máquina que <em>atiende</em> esas peticiones.</p>
      <p>No importa la marca del PC: lo que define el rol es <strong>quién inicia la petición</strong> y quién está escuchando en la red para responder.</p>`,
    substeps: [
      { color: "#7c3aed", text: "El mismo dispositivo puede actuar como cliente al pedir una página y como servidor en otro contexto (más adelante)." },
      { color: "#7c3aed", text: "Separar cliente y servidor permite escalar y actualizar cada parte por separado." },
    ],
    ctrlInfo: "Modelo cliente-servidor",
    buildAnim: B.buildClientServerAnim,
  },
  {
    badge: "🌐",
    color: "#38bdf8",
    title: "¿Qué es HTTP?",
    tagline: "El convenio de la World Wide Web",
    explanation: `
      <p><strong>HTTP</strong> (HyperText Transfer Protocol) es el <strong>idioma estándar</strong> en el que el navegador formula un pedido y el servidor devuelve un resultado: a menudo HTML, a veces un error o una redirección.</p>
      <p>Cada vez que cargas una página, ocurre al menos un intercambio HTTP (y muchas veces, varios en cadena para imágenes y estilos).</p>`,
    substeps: [
      { color: "#38bdf8", text: "<strong>Pedido</strong> — método (ej. obtener recurso), ruta y cabeceras mínimas." },
      { color: "#38bdf8", text: "<strong>Respuesta</strong> — código (éxito, error, redirección) y cuerpo con el contenido." },
    ],
    ctrlInfo: "Protocolo de aplicación",
    buildAnim: B.buildHttpIntroAnim,
  },
  {
    badge: "↔️",
    color: "#f472b6",
    title: "Petición y respuesta",
    tagline: "Un viaje de ida y otro de vuelta",
    explanation: `
      <p>El navegador envía una <strong>petición</strong>. El servidor la procesa (valida, lee archivos o datos, etc.) y envía una <strong>respuesta</strong>.</p>
      <p>En la animación verás un <strong>GET</strong> (pedir algo) y un <strong>200</strong> (todo bien, aquí tienes el contenido). Los códigos de error los verás con calma más adelante.</p>`,
    substeps: [
      { color: "#f472b6", text: "<strong>GET</strong> — en la web pública, el caso más común: “dame este recurso”." },
      { color: "#f472b6", text: "<strong>200 OK</strong> — la respuesta indica éxito; el cuerpo trae lo pedido (p. ej. HTML)." },
    ],
    ctrlInfo: "Ciclo request / response",
    buildAnim: B.buildRequestResponseAnim,
  },
  {
    badge: "🔤",
    color: "#a78bfa",
    title: "Más allá de “abrir la página”",
    tagline: "Otros “verbos” para otras acciones",
    explanation: `
      <p>Además de <strong>obtener</strong> algo (GET), existen métodos para <strong>crear o enviar datos</strong> (POST), <strong>reemplazar</strong> (PUT) o <strong>borrar</strong> (DELETE), entre otros.</p>
      <p>En el módulo 1 no usamos aún aplicaciones que los exploten todos; basta reconocer que <strong>la misma dirección puede usarse con intenciones distintas</strong> según el método.</p>`,
    substeps: [
      { color: "#a78bfa", text: "<strong>GET</strong> — consultar; no debe cambiar estado en el servidor (idealmente)." },
      { color: "#a78bfa", text: "<strong>POST</strong> — enviar un formulario o crear algo nuevo." },
      { color: "#a78bfa", text: "<strong>PUT / DELETE</strong> — actualizar o eliminar recursos (patrones típicos en apps con datos)." },
    ],
    ctrlInfo: "Métodos HTTP (visión general)",
    buildAnim: B.buildVerbsAnim,
  },
  {
    badge: "🎓",
    color: "#34d399",
    title: "Siguiente capítulo",
    tagline: "Lo que viene en el bootcamp",
    explanation: `
      <p>Ya tienes el mapa: <strong>red → paquetes → cliente/servidor → HTTP → petición/respuesta</strong>.</p>
      <p>En módulos posteriores conectarás esto con <strong>herramientas de desarrollo</strong>, <strong>formularios</strong>, <strong>datos</strong> y <strong>seguridad</strong>, siempre sobre esta base.</p>`,
    substeps: [
      { color: "#34d399", text: "Repite en voz alta: el navegador pide con HTTP; el servidor responde con HTTP." },
      { color: "#34d399", text: "Si algo “no carga”, piensa: ¿falló la red, el servidor o la respuesta (código)?" },
    ],
    ctrlInfo: "Cierre del recorrido",
    buildAnim: B.buildFutureAnim,
  },
];
