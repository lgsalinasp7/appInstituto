import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "docs/Temas/tema_1_viaje_url.html");
const outPath = path.join(
  root,
  "src/modules/academia/components/student/interactive-lessons/viaje-url/viaje-url-steps.ts"
);

const h = fs.readFileSync(htmlPath, "utf8");
const start = h.indexOf("const STEPS = [");
const state = h.indexOf(
  "// ═══════════════════════════════════════════════════════\n//   STATE"
);
if (start < 0 || state < 0) throw new Error("markers not found");
let block = h.slice(start + "const STEPS = ".length, state).trim();
if (!block.startsWith("[")) throw new Error("expected STEPS to start with [");
block = block.slice(1).trim();
if (block.endsWith("];")) block = block.slice(0, -2).trim();
else if (block.endsWith("]")) block = block.slice(0, -1).trim();
else throw new Error("expected STEPS to end with ];");

block = block.replace(/buildAnim: (build\w+)/g, "buildAnim: B.$1");
block = block.replace(/extraContent: (build\w+)/g, "extraContent: B.$1");

const file = `import type { SubstepTimers } from "./viaje-url-timers";
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
${block}
];
`;

fs.writeFileSync(outPath, file);
console.log("Wrote", outPath);
