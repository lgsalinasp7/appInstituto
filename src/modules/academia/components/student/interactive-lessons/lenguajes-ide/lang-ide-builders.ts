import type { SubstepTimers } from "./lang-ide-timers";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildHistoryAnim(container: HTMLElement, color: string, sub: SubstepTimers) {
  container.style.padding = "12px 8px";
  const items = [
    { y: "1950s", t: "Tarjetas y ensamblador", d: "Instrucciones muy cercanas al hardware: pocos abstraían el pensamiento humano." },
    { y: "1970s", t: "Lenguajes de alto nivel", d: "C, Pascal, Fortran: escribes más como humano; un compilador traduce a máquina." },
    { y: "1995", t: "JavaScript en el navegador", d: "La web necesitaba comportamiento en la página, no solo texto estático." },
    { y: "Hoy", t: "Muchos ecosistemas", d: "Elegimos lenguaje según el problema: web, datos, móvil, servidor…" },
  ];
  container.innerHTML = `
    <div style="font-family:'Space Mono',monospace;font-size:9px;letter-spacing:0.15em;color:${esc(color)};margin-bottom:12px;text-align:center;">MAPA RÁPIDO</div>
    <div>${items
      .map(
        (it, i) => `
      <div data-li="${i}" style="opacity:0.25;transition:opacity 0.5s;border-left:2px solid ${esc(color)}33;padding:8px 0 8px 14px;margin-left:8px;">
        <div style="font-family:'Space Mono',monospace;font-size:10px;color:${esc(color)};">${esc(it.y)}</div>
        <div style="font-weight:700;font-size:13px;margin-top:2px;">${esc(it.t)}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px;line-height:1.45;">${esc(it.d)}</div>
      </div>`
      )
      .join("")}</div>`;
  items.forEach((_, i) => {
    sub.push(
      globalThis.setTimeout(() => {
        const el = container.querySelector(`[data-li="${i}"]`) as HTMLElement | null;
        if (el) el.style.opacity = "1";
      }, 400 + i * 480)
    );
  });
}

export function buildTypesAnim(container: HTMLElement, color: string, sub: SubstepTimers) {
  container.style.padding = "8px";
  const cards = [
    { k: "Compilado", d: "Traducción previa a ejecución (p. ej. C, Rust). Errores de tipo a menudo antes de correr." },
    { k: "Interpretado", d: "Se lee y ejecuta al vuelo (p. ej. Python clásico, JS en el navegador)." },
    { k: "Tipado fuerte", d: "El lenguaje exige tipos claros; menos sorpresas en tiempo de ejecución." },
    { k: "Tipado dinámico", d: "Las variables no llevan tipo fijo escrito; más flexibilidad, más cuidado en equipos grandes." },
  ];
  container.innerHTML = `
    <div style="text-align:center;font-family:'Space Mono',monospace;font-size:10px;color:${esc(color)};margin-bottom:10px;">NO ES UNA CARRERA: SON DIMENSIONES</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      ${cards
        .map(
          (c, i) => `
        <div data-lt="${i}" style="background:#0f0f1a;border:1px solid var(--border);border-radius:12px;padding:12px;opacity:0.2;transform:translateY(6px);transition:all 0.45s ease;">
          <div style="font-weight:800;font-size:12px;color:${esc(color)};">${esc(c.k)}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:6px;line-height:1.5;">${esc(c.d)}</div>
        </div>`
        )
        .join("")}
    </div>`;
  cards.forEach((_, i) => {
    sub.push(
      globalThis.setTimeout(() => {
        const el = container.querySelector(`[data-lt="${i}"]`) as HTMLElement | null;
        if (el) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      }, 350 + i * 320)
    );
  });
}

export function buildWebStackAnim(container: HTMLElement, color: string, sub: SubstepTimers) {
  container.style.padding = "8px 12px";
  container.innerHTML = `
    <div style="text-align:center;font-family:'Space Mono',monospace;font-size:10px;color:${esc(color)};margin-bottom:12px;">TRÍADA WEB (CLIENTE)</div>
    <div style="display:flex;flex-direction:column;gap:8px;max-width:320px;margin:0 auto;">
      <div id="liStack0" style="padding:14px;border-radius:12px;border:1px solid #f9731644;background:#f9731610;opacity:0.3;transition:all 0.5s;">
        <div style="font-weight:800;font-size:13px;color:#fb923c;">HTML</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px;">Estructura: títulos, párrafos, enlaces…</div>
      </div>
      <div id="liStack1" style="padding:14px;border-radius:12px;border:1px solid #38bdf844;background:#38bdf810;opacity:0.3;transition:all 0.5s;">
        <div style="font-weight:800;font-size:13px;color:#38bdf8;">CSS</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px;">Presentación: colores, tipografías, layout…</div>
      </div>
      <div id="liStack2" style="padding:14px;border-radius:12px;border:1px solid #facc1544;background:#facc1510;opacity:0.3;transition:all 0.5s;">
        <div style="font-weight:800;font-size:13px;color:#facc15;">JavaScript</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px;">Comportamiento: clics, validación, peticiones…</div>
      </div>
    </div>`;
  [0, 1, 2].forEach((i) => {
    sub.push(
      globalThis.setTimeout(() => {
        const el = container.querySelector(`#liStack${i}`) as HTMLElement | null;
        if (el) {
          el.style.opacity = "1";
          el.style.boxShadow = `0 0 0 1px ${color}33`;
        }
      }, 400 + i * 550)
    );
  });
}

export function buildPythonPeekAnim(container: HTMLElement, color: string, sub: SubstepTimers) {
  container.style.padding = "12px";
  container.innerHTML = `
    <div style="text-align:center;font-family:'Space Mono',monospace;font-size:10px;color:${esc(color)};margin-bottom:12px;">VISTAZO — OTRO ECOSISTEMA</div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
      <div id="liPyBadge" style="font-family:'Space Mono',monospace;font-size:28px;font-weight:800;color:#38bdf8;border:2px solid #38bdf888;border-radius:16px;padding:16px 28px;opacity:0.2;transform:scale(0.92);transition:all 0.5s;">Py</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:280px;" id="liPyTags"></div>
      <div style="font-size:12px;color:var(--muted);text-align:center;line-height:1.55;max-width:320px;">Python brilla en datos, automatización e IA. En este bootcamp lo cruzarás más adelante; hoy solo fija el mapa.</div>
    </div>`;
  const tags = ["ciencia de datos", "scripts", "IA / ML", "backend posible"];
  sub.push(
    globalThis.setTimeout(() => {
      const b = container.querySelector("#liPyBadge") as HTMLElement | null;
      if (b) {
        b.style.opacity = "1";
        b.style.transform = "scale(1)";
      }
    }, 400)
  );
  const wrap = container.querySelector("#liPyTags") as HTMLElement | null;
  tags.forEach((t, i) => {
    sub.push(
      globalThis.setTimeout(() => {
        if (!wrap) return;
        const span = document.createElement("span");
        span.textContent = t;
        span.style.cssText =
          "font-size:10px;font-family:'Space Mono',monospace;padding:4px 10px;border-radius:999px;background:var(--card);border:1px solid var(--border);color:var(--muted);";
        wrap.appendChild(span);
      }, 700 + i * 220)
    );
  });
}

export function buildIdeWorkshopAnim(container: HTMLElement, color: string, sub: SubstepTimers) {
  container.style.padding = "10px 8px";
  const tools = [
    { icon: "📝", n: "Editor", d: "Resaltado, autocompletado, refactor" },
    { icon: "⌨️", n: "Terminal", d: "Comandos sin salir de la ventana" },
    { icon: "🐛", n: "Depuración", d: "Pausar y inspeccionar variables" },
    { icon: "🧩", n: "Extensiones", d: "Git, linters, temas, snippets…" },
  ];
  container.innerHTML = `
    <div style="text-align:center;font-family:'Space Mono',monospace;font-size:10px;color:${esc(color)};margin-bottom:10px;">IDE = TALLER INTEGRADO</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      ${tools
        .map(
          (t, i) => `
        <div data-ide="${i}" style="background:#0c0c16;border:1px solid var(--border);border-radius:12px;padding:12px;display:flex;gap:10px;align-items:flex-start;opacity:0.25;transition:opacity 0.45s;">
          <div style="font-size:22px;">${t.icon}</div>
          <div>
            <div style="font-weight:800;font-size:12px;">${esc(t.n)}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:4px;line-height:1.45;">${esc(t.d)}</div>
          </div>
        </div>`
        )
        .join("")}
    </div>`;
  tools.forEach((_, i) => {
    sub.push(
      globalThis.setTimeout(() => {
        const el = container.querySelector(`[data-ide="${i}"]`) as HTMLElement | null;
        if (el) el.style.opacity = "1";
      }, 350 + i * 280)
    );
  });
}

export function buildVscodeMiniAnim(container: HTMLElement, color: string, sub: SubstepTimers) {
  container.style.padding = "8px";
  container.innerHTML = `
    <div style="text-align:center;font-family:'Space Mono',monospace;font-size:10px;color:${esc(color)};margin-bottom:10px;">VS CODE (ESQUEMA)</div>
    <div style="display:flex;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:#0a0a12;min-height:140px;">
      <div style="width:28px;background:#12121c;display:flex;flex-direction:column;align-items:center;padding:8px 0;gap:10px;border-right:1px solid var(--border);">
        <span style="opacity:0.5;font-size:12px;">📁</span><span style="opacity:0.35;font-size:12px;">🔍</span><span style="opacity:0.35;font-size:12px;">🧩</span>
      </div>
      <div style="width:120px;background:#0e0e18;border-right:1px solid var(--border);padding:8px;font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);">
        <div style="margin-bottom:6px;opacity:0.6;">EXPLORADOR</div>
        <div id="liVsFile" style="padding:4px 6px;border-radius:4px;opacity:0.3;transition:all 0.4s;">index.html</div>
      </div>
      <div style="flex:1;padding:10px 12px;font-family:'Space Mono',monospace;font-size:10px;line-height:1.6;color:#94a3b8;">
        <div id="liVsL1" style="opacity:0;">&lt;!DOCTYPE html&gt;</div>
        <div id="liVsL2" style="opacity:0;">&lt;html lang="es"&gt;</div>
        <div id="liVsL3" style="opacity:0;color:${esc(color)};">…</div>
      </div>
    </div>`;
  sub.push(
    globalThis.setTimeout(() => {
      const f = container.querySelector("#liVsFile") as HTMLElement | null;
      if (f) {
        f.style.opacity = "1";
        f.style.background = `${color}22`;
        f.style.color = color;
      }
    }, 500)
  );
  ;["liVsL1", "liVsL2", "liVsL3"].forEach((id, i) => {
    sub.push(
      globalThis.setTimeout(() => {
        const el = container.querySelector(`#${id}`) as HTMLElement | null;
        if (el) el.style.opacity = "1";
      }, 900 + i * 350)
    );
  });
}

export function buildIndexHtmlPracticeAnim(container: HTMLElement, color: string, sub: SubstepTimers) {
  container.style.padding = "6px";
  container.innerHTML = `
    <div style="text-align:center;font-family:'Space Mono',monospace;font-size:10px;color:${esc(color)};margin-bottom:8px;">PRÁCTICA MÍNIMA</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:stretch;">
      <div style="background:#080810;border:1px solid var(--border);border-radius:10px;overflow:hidden;">
        <div style="padding:6px 10px;background:#0f0f18;font-size:9px;font-family:'Space Mono',monospace;color:var(--muted);border-bottom:1px solid var(--border);">index.html</div>
        <pre id="liPre" style="margin:0;padding:10px;font-size:9px;line-height:1.55;color:#a5b4fc;font-family:'Space Mono',monospace;white-space:pre-wrap;"></pre>
      </div>
      <div style="background:#020408;border:1px solid #0f1a30;border-radius:10px;overflow:hidden;display:flex;flex-direction:column;">
        <div style="padding:6px 10px;background:#060c1a;display:flex;gap:6px;align-items:center;border-bottom:1px solid #0f1a30;">
          <span style="width:8px;height:8px;border-radius:50%;background:#ff5f57;"></span>
          <span style="width:8px;height:8px;border-radius:50%;background:#febc2e;"></span>
          <span style="width:8px;height:8px;border-radius:50%;background:#28c840;"></span>
          <span style="flex:1;text-align:center;font-size:9px;font-family:'Space Mono',monospace;color:var(--muted);">navegador</span>
        </div>
        <div id="liBv" style="flex:1;padding:14px;display:flex;flex-direction:column;gap:8px;min-height:120px;">
          <div style="height:18px;border-radius:4px;background:var(--dim);width:55%;opacity:0.35;"></div>
          <div style="height:12px;border-radius:4px;background:var(--dim);width:85%;opacity:0.25;"></div>
        </div>
      </div>
    </div>`;
  const lines = [
    '<!DOCTYPE html>',
    '<html lang="es">',
    "<head>",
    '  <meta charset="UTF-8">',
    "  <title>Mi página</title>",
    "</head>",
    "<body>",
    "  <h1>Hola</h1>",
    "  <p>Bootcamp.</p>",
    "</body>",
    "</html>",
  ];
  const pre = container.querySelector("#liPre") as HTMLElement | null;
  const bv = container.querySelector("#liBv") as HTMLElement | null;
  let acc = "";
  lines.forEach((line, i) => {
    sub.push(
      globalThis.setTimeout(() => {
        acc += (i ? "\n" : "") + line;
        if (pre) pre.textContent = acc;
      }, 200 + i * 120)
    );
  });
  sub.push(
    globalThis.setTimeout(() => {
      if (bv) {
        bv.innerHTML = `
          <h1 style="margin:0;font-size:16px;color:${esc(color)};font-family:var(--font-outfit,sans-serif);">Hola</h1>
          <p style="margin:0;font-size:12px;color:var(--muted);font-family:var(--font-outfit,sans-serif);">Bootcamp.</p>
          <div style="font-size:9px;font-family:'Space Mono',monospace;color:#34d399;margin-top:8px;">✓ archivo local abierto</div>`;
      }
    }, 200 + lines.length * 120 + 400)
  );
}
