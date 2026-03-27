import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "docs/Temas/tema_1_viaje_url.html"), "utf8");
const start = html.indexOf("// ── IP ANIMATION");
const end = html.indexOf("// ═══════════════════════════════════════════════════════\n//   INIT");
if (start < 0 || end < 0) throw new Error("markers not found");
let chunk = html.slice(start, end);

chunk = chunk.replace(/function build/g, "export function build");
chunk = chunk.replace(/substepTimers\.push\(setTimeout\(/g, "timers.schedule(");
// setTimeout(fn, ms) -> timers.schedule(ms, fn) — swap args for each occurrence manually is hard
// Instead replace pattern: timers.schedule(() => { ... }, 500) wrong order

// Revert wrong: our replace made timers.schedule(() => ..., ms) but schedule expects (ms, fn)
// Original: substepTimers.push(setTimeout(() => oc.classList.add('lit'), 300 + i * 200));
// Target: timers.schedule(300 + i * 200, () => oc.classList.add('lit'));

const wrong = /timers\.schedule\(\(\) => ([^,]+),\s*(\d[^)]*)\)\);/g;
let m;
let out = chunk;
// Manual: use a different approach - replace substepTimers.push(setTimeout(X, Y)) with timers.schedule(Y, X)

chunk = html.slice(start, end);
chunk = chunk.replace(/function build/g, "export function build");
chunk = chunk.replace(
  /substepTimers\.push\(setTimeout\((\(\) => [\s\S]*?),\s*(\d[^)]*)\)\)/g,
  (match, fn, ms) => `timers.schedule(${ms.trim()}, ${fn.trim()})`
);
// Nested setTimeout in buildBrowser - line 1054: substepTimers.push(setTimeout(type, 55));
chunk = chunk.replace(/substepTimers\.push\(setTimeout\(type,\s*55\)\)/g, "timers.schedule(55, type)");
chunk = chunk.replace(/substepTimers\.push\(setTimeout\(\(\) => container\.querySelector\('#reqArrow'\)\.style\.opacity = '1',\s*400\)\)/g, "timers.schedule(400, () => { const el = container.querySelector('#reqArrow'); if (el) el.style.opacity = '1'; })");
chunk = chunk.replace(/substepTimers\.push\(setTimeout\(\(\) => container\.querySelector\('#resArrow'\)\.style\.opacity = '1',\s*1400\)\)/g, "timers.schedule(1400, () => { const el = container.querySelector('#resArrow'); if (el) el.style.opacity = '1'; })");
chunk = chunk.replace(/substepTimers\.push\(setTimeout\(\(\) => container\.querySelector\('#cdnRouteA'\)\.style\.opacity = '1',\s*400\)\)/g, "timers.schedule(400, () => { const el = container.querySelector('#cdnRouteA'); if (el) el.style.opacity = '1'; })");

// setTimeout(type, 300) at end of buildBrowserAnim
chunk = chunk.replace(/\n  setTimeout\(type,\s*300\);\n}/, "\n  timers.schedule(300, type);\n}");

chunk = chunk.replace(
  /document\.getElementById\('tcpSyn'\)/g,
  "container.querySelector('#tcpSyn')"
);
chunk = chunk.replace(
  /\['tcpSyn','tcpSynAck','tcpAck'\]\.forEach\(\(id, i\) => \{\s*substepTimers\.push\(setTimeout\(\(\) => \{\s*document\.getElementById\(id\)/g,
  "['tcpSyn','tcpSynAck','tcpAck'].forEach((id, i) => {\n    timers.schedule(500 + i * 900, () => {\n      const el = container.querySelector('#' + id)"
);
// Fix broken replacement - read file after

const header = `import type { TimerSink } from "./viaje-url-timers";

`;

fs.writeFileSync(
  path.join(root, "src/modules/academia/components/student/interactive-lessons/viaje-url/viaje-url-builders.ts"),
  header + chunk
);
console.log("extracted, length", (header + chunk).length);
