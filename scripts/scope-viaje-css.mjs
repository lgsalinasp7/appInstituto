import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "docs/Temas/tema_1_viaje_url.html"), "utf8");
const m = html.match(/<style>([\s\S]*?)<\/style>/);
if (!m) throw new Error("no style");
let c = m[1].replace(/@import[^;]+;/, "").trim();
c = c.replace(/^:root\s*\{/m, ".viajeUrlAnim {");
c = c.replace(/^body\s*\{/m, ".viajeUrlAnim {");
c = c.replace(/^body::before/m, ".viajeUrlAnim::before");
c = c.replace(/position:fixed;inset:0/g, "position:absolute;inset:0");

const lines = c.split("\n");
const out = [];
for (const line of lines) {
  const t = line.trim();
  if (!t || t.startsWith("/*")) {
    out.push(line);
    continue;
  }
  if (/^@keyframes/.test(t)) {
    out.push(line);
    continue;
  }
  if (t.startsWith(".viajeUrlAnim")) {
    out.push(line);
    continue;
  }
  if (/^\.([\w-]|\\.|#|:)/.test(t) || t.startsWith(".cursor")) {
    out.push(line.replace(/^\./, ".viajeUrlAnim ."));
    continue;
  }
  if (t.startsWith("*")) {
    out.push(`.viajeUrlAnim ${t}`);
    continue;
  }
  out.push(line);
}

const dir = path.join(root, "src/modules/academia/components/student/interactive-lessons/viaje-url");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "viaje-url.css"), out.join("\n"));
console.log("Wrote viaje-url.css");
