import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "docs/Temas/tema_1_viaje_url.html");
const outPath = path.join(
  root,
  "src/modules/academia/components/student/interactive-lessons/viaje-url/viaje-url-builders.ts"
);

const html = fs.readFileSync(htmlPath, "utf8");
const i0 = html.indexOf("function buildIPAnim");
const i1 = html.indexOf(
  "// ═══════════════════════════════════════════════════════\n//   INIT"
);
if (i0 < 0 || i1 < 0) throw new Error("Could not extract builders from tema_1_viaje_url.html");
let c = html.slice(i0, i1);

c = c.replace(
  /function (build\w+)\(container, color\)/g,
  "export function $1(container: HTMLElement, color: string, substepTimers: SubstepTimers)"
);

c = c.replace(
  /document\.getElementById\(id\)\.style\.opacity = '1'/g,
  "(container.querySelector('#' + id) as HTMLElement | null)!.style.opacity = '1'"
);

c = c.replace(
  /const el = document\.getElementById\('hsc' \+ i\)/g,
  "const el = vis.querySelector('#hsc' + i) as HTMLElement | null"
);

c = c.replace(
  /document\.querySelectorAll\('\.cdn-beam'\)/g,
  "map.querySelectorAll('.cdn-beam')"
);
c = c.replace(
  /document\.querySelectorAll\('\.cdn-node-dot:not\(\.origin\)'\)/g,
  "map.querySelectorAll('.cdn-node-dot:not(.origin)')"
);
c = c.replace(
  /document\.querySelector\('#beam-' \+ e\.label\)/g,
  "map.querySelector('#beam-' + e.label)"
);
c = c.replace(
  /document\.querySelector\('#cdnDot-' \+ e\.label\)/g,
  "map.querySelector('#cdnDot-' + e.label)"
);

c = c.replace(
  /const el = document\.getElementById\(id\)/g,
  "const el = container.querySelector('#' + id) as HTMLElement | null"
);

c = c.replace(/setTimeout\(type, 300\)/g, "substepTimers.push(setTimeout(type, 300))");

c = c.replace(
  `  substepTimers.push(setTimeout(() => {
    pubWrap.querySelector('#pubLabel').style.opacity = '1';
    pubRow.style.opacity = '1';
  }, 1500));`,
  `  substepTimers.push(setTimeout(() => {
    const pubLabel = pubWrap.querySelector('#pubLabel') as HTMLElement | null;
    if (pubLabel) pubLabel.style.opacity = '1';
    pubRow.style.opacity = '1';
  }, 1500));`
);

c = c.replace(
  /const urlBar = container\.querySelector\('#animUrlBar'\);\s*const status = container\.querySelector\('#browserStatus'\);/g,
  `const urlBar = container.querySelector('#animUrlBar') as HTMLElement;
  const status = container.querySelector('#browserStatus') as HTMLElement;`
);

c = c.replace(
  /const vis = container\.querySelector\('#hsVis'\);\s*vis\.innerHTML =/g,
  `const vis = container.querySelector('#hsVis') as HTMLElement | null;
  if (!vis) return;
  vis.innerHTML =`
);

c = c.replace(
  /const channel = container\.querySelector\('#tlsChannel'\);\s*const tlsStatus = container\.querySelector\('#tlsStatus'\);\s*const tlsIcon = container\.querySelector\('#tlsIcon'\);/g,
  `const channel = container.querySelector('#tlsChannel') as HTMLElement;
  const tlsStatus = container.querySelector('#tlsStatus') as HTMLElement;
  const tlsIcon = container.querySelector('#tlsIcon') as HTMLElement;`
);

const header = `import type { SubstepTimers } from "./viaje-url-timers";

`;

fs.writeFileSync(outPath, header + c);
console.log("Wrote", outPath);
