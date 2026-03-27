import type { SubstepTimers } from "./viaje-url-timers";
import * as B from "./viaje-url-builders";

export type ViajeUrlStep = {
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

export const VIAJE_URL_STEPS: ViajeUrlStep[] = [
// ── 0: IP en tu PC ──────────────────────────────────
  {
    badge: '💻',
    color: '#38bdf8',
    title: 'La dirección IP — Tu computadora',
    tagline: 'Antes de hablar con internet, tu máquina necesita su propia dirección',
    explanation: `
      <p>
        Internet es una red gigante donde cada dispositivo necesita una <strong>dirección única</strong> para enviar y recibir datos — igual que necesitas una dirección física para recibir correo.
        Esa dirección se llama <strong>IP (Internet Protocol)</strong>.
      </p>
      <p>
        Cuando enciendes tu computadora y se conecta al WiFi, el router le asigna automáticamente una <strong>IP privada</strong> como <code>192.168.1.5</code>. Esto lo hace un protocolo llamado <strong>DHCP</strong>. Tu PC no elige su IP — se la dan.
      </p>
    `,
    substeps: [
      { color: '#38bdf8', text: '<strong>IP privada</strong> — Tu PC recibe una dirección como <code>192.168.1.5</code>. Solo existe dentro de tu red local (WiFi de casa u oficina).' },
      { color: '#38bdf8', text: '<strong>IP pública</strong> — Tu router tiene UNA sola IP pública visible en internet (ej. <code>181.52.34.10</code>). Todos los dispositivos de tu red salen por esa misma IP.' },
      { color: '#38bdf8', text: '<strong>IPv4 vs IPv6</strong> — IPv4 tiene formato <code>0-255.0-255.0-255.0-255</code> (4 mil millones de IPs). Ya se acabaron. IPv6 usa 128 bits y tiene billones de billones de direcciones.' },
      { color: '#38bdf8', text: '<strong>¿Por qué importa?</strong> — Sin IP no hay comunicación. Todo lo que viene después (DNS, TCP, TLS, HTTP) depende de que tanto tú como el servidor tengan una IP.' },
    ],
    ctrlInfo: 'Fundamentos de red',
    buildAnim: B.buildIPAnim,
  },

  // ── 1: El Explorador ────────────────────────────────
  {
    badge: '🔍',
    color: '#86efac',
    title: 'El Explorador — Punto de partida',
    tagline: 'Escribes kaledsoft.tech y presionas Enter. ¿Qué pasa en ese instante?',
    explanation: `
      <p>
        El <strong>navegador</strong> (Chrome, Firefox, Safari) es un programa que sabe hablar el idioma de internet. Cuando escribes una URL y presionas Enter, hace exactamente lo siguiente — en este orden:
      </p>
    `,
    substeps: [
      { color: '#86efac', text: '<strong>Paso 1 — Cache del browser:</strong> ¿Ya visitaste esta página? El browser revisa su caché local. Si tiene una copia fresca, la muestra directamente. Sin ir a la red.' },
      { color: '#86efac', text: '<strong>Paso 2 — Parsea la URL:</strong> Descompone <code>https://kaledsoft.tech/dashboard</code> en partes: protocolo (<code>https</code>), dominio (<code>kaledsoft.tech</code>), ruta (<code>/dashboard</code>).' },
      { color: '#86efac', text: '<strong>Paso 3 — Necesita la IP:</strong> El browser no sabe a qué IP conectarse con solo el nombre. Le pide al sistema operativo que resuelva <code>kaledsoft.tech</code> → IP. Aquí entra el DNS.' },
      { color: '#86efac', text: '<strong>Paso 4 — Cache del OS:</strong> Antes de consultar DNS, el SO revisa su propia caché. Si ya resolvió este dominio recientemente (y el TTL no expiró), usa esa IP directamente.' },
    ],
    ctrlInfo: 'Navegador web',
    buildAnim: B.buildBrowserAnim,
  },

  // ── 2: DNS ──────────────────────────────────────────
  {
    badge: '🌐',
    color: '#22d3ee',
    title: 'DNS — La guía telefónica de internet',
    tagline: 'kaledsoft.tech no significa nada para los routers. Necesitan una IP.',
    explanation: `
      <p>
        <strong>DNS (Domain Name System)</strong> es un sistema distribuido de servidores que traduce nombres legibles por humanos (<code>kaledsoft.tech</code>) en direcciones IP que las máquinas entienden (<code>93.184.216.34</code>).
      </p>
      <p>
        No hay un solo servidor con todos los dominios del mundo. Es una jerarquía de 4 niveles. Tu consulta sube y baja por esa jerarquía hasta encontrar la respuesta exacta.
      </p>
    `,
    substeps: [
      { color: '#22d3ee', text: '<strong>Resolver (tu ISP):</strong> Tu OS le pregunta al servidor DNS configurado (normalmente el de Claro, ETB, o 8.8.8.8 de Google). Ese servidor se encarga de ir buscando la respuesta.' },
      { color: '#22d3ee', text: '<strong>Root Server:</strong> El resolver consulta uno de los 13 root servers del mundo. Ellos no saben la IP, pero saben quién tiene info sobre <code>.tech</code>.' },
      { color: '#22d3ee', text: '<strong>TLD Server (.tech):</strong> El servidor del dominio de primer nivel <code>.tech</code> dice: "el dominio <code>kaledsoft.tech</code> está registrado con el Name Server de Vercel/Cloudflare".' },
      { color: '#22d3ee', text: '<strong>Name Server autoritativo:</strong> Este servidor SÍ tiene la respuesta final: <code>kaledsoft.tech → 76.76.21.21</code>. También devuelve el <strong>TTL</strong> (cuántos segundos cachear esa respuesta).' },
    ],
    ctrlInfo: 'Domain Name System',
    buildAnim: B.buildDNSAnim,
    extraContent: B.buildDNSTree,
  },

  // ── 3: TCP ──────────────────────────────────────────
  {
    badge: '🤝',
    color: '#34d399',
    title: 'TCP — El apretón de manos',
    tagline: 'Ya tienes la IP. Ahora necesitas abrir un canal de comunicación confiable.',
    explanation: `
      <p>
        <strong>TCP (Transmission Control Protocol)</strong> es el protocolo que garantiza que los datos lleguen <strong>en orden, completos, y sin errores</strong>. Antes de enviar cualquier dato, los dos extremos deben "presentarse" mutuamente.
      </p>
      <p>
        Este proceso de presentación se llama <strong>3-Way Handshake</strong> (apretón de manos en 3 pasos). Mientras no termine, no se puede enviar una sola petición HTTP.
      </p>
    `,
    substeps: [
      { color: '#34d399', text: '<strong>SYN</strong> — Tu PC envía un paquete al servidor diciéndole: "Quiero conectarme. Mi número de secuencia inicial es X".' },
      { color: '#34d399', text: '<strong>SYN-ACK</strong> — El servidor responde: "Ok, recibí tu SYN. Mi número de secuencia es Y. Confirmo el tuyo (X+1)".' },
      { color: '#34d399', text: '<strong>ACK</strong> — Tu PC confirma: "Recibí tu SYN-ACK. Confirmo Y+1". La conexión está abierta. Ahora sí podemos hablar.' },
      { color: '#34d399', text: '<strong>Costo en tiempo:</strong> Cada paso es un viaje de ida (RTT = Round Trip Time). Bogotá → servidor en US ≈ 80ms por handshake, antes de enviar un solo byte de datos.' },
    ],
    ctrlInfo: '3-Way Handshake',
    buildAnim: B.buildTCPAnim,
    extraContent: B.buildHandshake,
  },

  // ── 4: TLS ──────────────────────────────────────────
  {
    badge: '🔐',
    color: '#fbbf24',
    title: 'TLS — El candado del candado',
    tagline: 'La conexión TCP está abierta. Ahora la ciframos para que nadie espíe.',
    explanation: `
      <p>
        <strong>TLS (Transport Layer Security)</strong> es el protocolo detrás del <code>https://</code> y del candado 🔒. Sin él, cualquier router entre tú y el servidor podría leer (y modificar) todo lo que envías.
      </p>
      <p>
        TLS negocia un canal cifrado <strong>antes</strong> de que se envíe la primera petición HTTP. En TLS 1.3 (el actual), esto cuesta solo <strong>1 RTT adicional</strong> (~120ms).
      </p>
    `,
    substeps: [
      { color: '#fbbf24', text: '<strong>ClientHello:</strong> Tu browser dice qué versiones TLS soporta y qué algoritmos de cifrado (cipher suites) conoce.' },
      { color: '#fbbf24', text: '<strong>ServerHello + Certificado:</strong> El servidor elige el mejor cipher suite, envía su certificado TLS (firmado por una CA como Let\'s Encrypt).' },
      { color: '#fbbf24', text: '<strong>Verificación del certificado:</strong> Tu browser verifica que el cert sea válido, no esté vencido, y esté firmado por una CA de confianza. Si algo falla → ⚠️ "Tu conexión no es segura".' },
      { color: '#fbbf24', text: '<strong>Claves simétricas:</strong> Ambos derivan la misma clave secreta usando criptografía asimétrica. A partir de aquí todo viaja cifrado con AES-256. 🔒' },
    ],
    ctrlInfo: 'Transport Layer Security',
    buildAnim: B.buildTLSAnim,
    extraContent: B.buildTLSStack,
  },

  // ── 5: HTTP/2 ───────────────────────────────────────
  {
    badge: '📡',
    color: '#f472b6',
    title: 'HTTP/2 — La petición real',
    tagline: 'Canal abierto y cifrado. Por fin el browser puede pedir la página.',
    explanation: `
      <p>
        <strong>HTTP (HyperText Transfer Protocol)</strong> es el idioma que usan browser y servidor para pedir y enviar contenido. El browser hace un <strong>GET</strong> a <code>/dashboard</code> y el servidor responde con el HTML.
      </p>
      <p>
        <strong>HTTP/2</strong> (la versión actual) mejora HTTP/1.1 con <strong>multiplexing</strong>: puede enviar 50 requests (JS, CSS, imágenes) en paralelo sobre la misma conexión TCP, sin esperar respuesta una por una.
      </p>
    `,
    substeps: [
      { color: '#f472b6', text: '<strong>Request:</strong> <code>GET /dashboard HTTP/2</code> con headers como <code>Host</code>, <code>Authorization</code>, <code>Accept-Encoding</code>. Todo viaja cifrado por TLS.' },
      { color: '#f472b6', text: '<strong>Response 200 OK:</strong> El servidor procesa la petición (valida sesión, consulta DB, renderiza template) y devuelve el HTML con status <code>200 OK</code>.' },
      { color: '#f472b6', text: '<strong>Multiplexing:</strong> El browser ve el HTML y pide 20 assets más (JS, CSS, imágenes). HTTP/2 los envía todos en paralelo. HTTP/1.1 los habría enviado de 6 en 6.' },
      { color: '#f472b6', text: '<strong>Status codes clave:</strong> <code>200</code> = OK · <code>301</code> = Redirect · <code>401</code> = No autenticado · <code>403</code> = Sin permisos · <code>404</code> = No existe · <code>500</code> = Error del servidor.' },
    ],
    ctrlInfo: 'HTTP Request / Response',
    buildAnim: B.buildHTTPAnim,
    extraContent: B.buildHTTPTerminal,
  },

  // ── 6: CDN ──────────────────────────────────────────
  {
    badge: '🌍',
    color: '#a78bfa',
    title: 'CDN — El servidor más cercano a ti',
    tagline: 'No vas hasta el servidor origen. El CDN ya tiene tu página más cerca.',
    explanation: `
      <p>
        <strong>CDN (Content Delivery Network)</strong> es una red de cientos de servidores distribuidos por todo el mundo. Cuando alguien en Bogotá pide <code>kaledsoft.tech</code>, en vez de ir al servidor en us-east-1, va al <strong>nodo edge de Bogotá o Miami</strong>.
      </p>
      <p>
        Plataformas como <strong>Vercel, Cloudflare y AWS CloudFront</strong> manejan esto automáticamente. Tu app Next.js se despliega en 100+ locations simultáneamente.
      </p>
    `,
    substeps: [
      { color: '#a78bfa', text: '<strong>Sin CDN:</strong> Bogotá → servidor en Virginia, USA → ~160ms de latencia base. Cada request hace ese viaje.' },
      { color: '#a78bfa', text: '<strong>Con CDN:</strong> Bogotá → edge en São Paulo o Miami → ~15ms. El CDN ya tiene el contenido cacheado desde antes.' },
      { color: '#a78bfa', text: '<strong>¿Qué cachea?</strong> Assets estáticos (JS, CSS, imágenes), páginas SSG/ISR, y API responses con header <code>Cache-Control: public, s-maxage=3600</code>.' },
      { color: '#a78bfa', text: '<strong>Cache invalidation:</strong> Cuando haces deploy nuevo en Vercel, el CDN invalida automáticamente el cache. Por eso los cambios se ven inmediatamente.' },
    ],
    ctrlInfo: 'Content Delivery Network',
    buildAnim: B.buildCDNAnim,
    extraContent: B.buildCDNMap,
  },

  // ── 7: Browser Render ───────────────────────────────
  {
    badge: '🖥️',
    color: '#86efac',
    title: 'Browser — Renderizar la página',
    tagline: 'El HTML llegó. Ahora el explorador lo convierte en píxeles.',
    explanation: `
      <p>
        Recibir el HTML es solo el comienzo. El browser tiene que <strong>parsearlo, construir árboles, calcular estilos, posiciones, y finalmente pintar</strong> cada píxel en tu pantalla. Este proceso se llama <strong>Critical Rendering Path</strong>.
      </p>
      <p>
        Cada milisegundo aquí afecta las métricas de <strong>Core Web Vitals</strong> que Google usa para rankear tu sitio: FCP, LCP, CLS, TTI.
      </p>
    `,
    substeps: [
      { color: '#86efac', text: '<strong>HTML → DOM:</strong> El parser lee el HTML de arriba a abajo y construye el árbol DOM (Document Object Model). Cada tag se convierte en un nodo.' },
      { color: '#86efac', text: '<strong>CSS → CSSOM:</strong> El CSS se parsea y forma el CSSOM (CSS Object Model). El browser combina DOM + CSSOM para crear el <strong>Render Tree</strong>.' },
      { color: '#86efac', text: '<strong>Layout + Paint:</strong> Calcula posición y tamaño de cada elemento (Layout/Reflow), luego dibuja los píxeles en capas (Paint), y las combina en la GPU (Composite).' },
      { color: '#86efac', text: '<strong>JavaScript:</strong> El JS puede bloquear el parsing. Por eso usamos <code>defer</code> o <code>async</code>. Frameworks como React/Next.js hacen hydration: el HTML ya llega renderizado, el JS solo lo "activa".' },
    ],
    ctrlInfo: 'Critical Rendering Path',
    buildAnim: B.buildBrowserRenderAnim,
    extraContent: B.buildBrowserMock,
  },
];
