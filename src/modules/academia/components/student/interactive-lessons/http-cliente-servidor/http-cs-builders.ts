import type { SubstepTimers } from "./http-cs-timers";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildTimelineAnim(container: HTMLElement, color: string, sub: SubstepTimers) {
  container.style.padding = "12px 8px";
  const items = [
    { y: "1969", t: "ARPANET", d: "Primeros nodos conectados: la idea de una red que no depende de un solo punto." },
    { y: "1974", t: "TCP/IP", d: "Los datos viajan en paquetes con dirección de origen y destino: base de internet." },
    { y: "1983", t: "DNS", d: "Los nombres (ej. sitio.com) se traducen a números que las máquinas entienden." },
    { y: "1991", t: "HTTP + HTML", d: "Tim Berners-Lee: el idioma con el que el navegador pide y recibe páginas." },
  ];
  container.innerHTML = `
    <div style="font-family:'Space Mono',monospace;font-size:9px;letter-spacing:0.15em;color:${esc(color)};margin-bottom:12px;text-align:center;">LÍNEA DEL TIEMPO</div>
    <div class="http-cs-timeline">${items
      .map(
        (it, i) => `
      <div class="http-cs-tl-item" data-i="${i}" style="opacity:0.25;transition:opacity 0.5s;border-left:2px solid ${esc(color)}33;padding:8px 0 8px 14px;margin-left:8px;">
        <div style="font-family:'Space Mono',monospace;font-size:10px;color:${esc(color)};">${esc(it.y)}</div>
        <div style="font-weight:700;font-size:13px;margin-top:2px;">${esc(it.t)}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px;line-height:1.45;">${esc(it.d)}</div>
      </div>`
      )
      .join("")}</div>`;
  items.forEach((_, i) => {
    sub.push(
      globalThis.setTimeout(() => {
        const el = container.querySelector(`[data-i="${i}"]`) as HTMLElement | null;
        if (el) el.style.opacity = "1";
      }, 400 + i * 500)
    );
  });
}

export function buildTcpPacketAnim(container: HTMLElement, color: string, sub: SubstepTimers) {
  container.style.padding = "8px";
  container.innerHTML = `
    <div style="text-align:center;font-family:'Space Mono',monospace;font-size:10px;color:${esc(color)};margin-bottom:10px;">PAQUETES EN LA RED</div>
    <div style="position:relative;height:100px;background:#070711;border:1px solid var(--border);border-radius:12px;overflow:hidden;">
      <svg viewBox="0 0 400 100" style="width:100%;height:100%;display:block;">
        <line x1="40" y1="50" x2="360" y2="50" stroke="#1e1e3a" stroke-width="2"/>
        <circle cx="40" cy="50" r="14" fill="#0f0f1a" stroke="#2d2d4a"/>
        <text x="40" y="55" text-anchor="middle" font-size="14">💻</text>
        <circle cx="360" cy="50" r="14" fill="#0f0f1a" stroke="#2d2d4a"/>
        <text x="360" y="55" text-anchor="middle" font-size="14">🖥️</text>
        <g id="httpCsPkt" transform="translate(40,50)">
          <circle r="12" fill="none" stroke="#f59e0b" stroke-width="6" opacity="0.2"/>
          <rect x="-14" y="-8" width="28" height="16" rx="4" fill="#f59e0b"/>
        </g>
      </svg>
      <div style="position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:10px;color:var(--muted);font-family:'Space Mono',monospace;" id="httpCsTcpLbl">El paquete lleva datos y la dirección de destino</div>
    </div>`;
  const g = container.querySelector("#httpCsPkt") as SVGGElement | null;
  const lbl = container.querySelector("#httpCsTcpLbl") as HTMLElement | null;
  if (!g) return;
  let x = 40;
  const target = 320;
  const step = () => {
    x += 8;
    if (x >= target) {
      x = target;
      g.setAttribute("transform", `translate(${x},50)`);
      if (lbl) lbl.textContent = "El servidor recibe, procesa y puede enviar una respuesta";
      sub.push(
        globalThis.setTimeout(() => {
          let bx = target;
          const home = 40;
          const back = () => {
            bx -= 10;
            if (bx <= home) {
              bx = home;
              g.setAttribute("transform", `translate(${bx},50)`);
              const rect = g.querySelector("rect");
              if (rect) {
                rect.setAttribute("fill", "#00f5c4");
              }
              if (lbl) lbl.textContent = "Respuesta de vuelta al navegador (simplificado)";
              return;
            }
            g.setAttribute("transform", `translate(${bx},50)`);
            sub.push(globalThis.setTimeout(back, 40));
          };
          sub.push(globalThis.setTimeout(back, 600));
        }, 400)
      );
      return;
    }
    g.setAttribute("transform", `translate(${x},50)`);
    sub.push(globalThis.setTimeout(step, 45));
  };
  sub.push(globalThis.setTimeout(step, 500));
}

export function buildClientServerAnim(container: HTMLElement, color: string, sub: SubstepTimers) {
  container.style.padding = "12px 4px";
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;max-width:100%;">
      <div id="httpCsCli" style="background:#0f0f1a;border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;opacity:0.35;transition:all 0.4s;">
        <div style="font-size:28px;">🧑‍💻</div>
        <div style="font-weight:700;margin-top:6px;font-size:13px;">Cliente</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px;">Navegador o app: pide algo</div>
      </div>
      <div style="font-size:20px;color:${esc(color)};">⇄</div>
      <div id="httpCsSrv" style="background:#0f0f1a;border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;opacity:0.35;transition:all 0.4s;">
        <div style="font-size:28px;">🖥️</div>
        <div style="font-weight:700;margin-top:6px;font-size:13px;">Servidor</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px;">Otra computadora: responde</div>
      </div>
    </div>`;
  const cli = container.querySelector("#httpCsCli") as HTMLElement | null;
  const srv = container.querySelector("#httpCsSrv") as HTMLElement | null;
  sub.push(
    globalThis.setTimeout(() => {
      if (cli) {
        cli.style.opacity = "1";
        cli.style.borderColor = color;
        cli.style.boxShadow = `0 0 20px ${color}22`;
      }
    }, 300)
  );
  sub.push(
    globalThis.setTimeout(() => {
      if (srv) {
        srv.style.opacity = "1";
        srv.style.borderColor = color;
        srv.style.boxShadow = `0 0 20px ${color}22`;
      }
    }, 900)
  );
}

export function buildHttpIntroAnim(container: HTMLElement, color: string, _sub: SubstepTimers) {
  container.style.padding = "14px";
  container.innerHTML = `
    <div style="text-align:center;margin-bottom:12px;">
      <span style="font-family:'Space Mono',monospace;font-size:11px;letter-spacing:0.2em;color:${esc(color)};">HTTP</span>
    </div>
    <p style="font-size:13px;line-height:1.55;color:var(--muted);text-align:center;">
      <strong style="color:var(--text);">HyperText Transfer Protocol</strong> — el convenio con el que tu navegador
      le pide la página al servidor y el servidor devuelve el resultado (HTML, errores, etc.).
    </p>
    <div style="display:flex;justify-content:center;gap:16px;margin-top:16px;flex-wrap:wrap;">
      <div style="background:#070711;border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-family:'Space Mono',monospace;font-size:11px;">GET /inicio</div>
      <div style="color:var(--muted);align-self:center;">→</div>
      <div style="background:#070711;border:1px solid ${esc(color)}44;border-radius:8px;padding:10px 14px;font-family:'Space Mono',monospace;font-size:11px;color:${esc(color)};">200 OK</div>
    </div>`;
}

export function buildRequestResponseAnim(container: HTMLElement, color: string, sub: SubstepTimers) {
  container.style.padding = "8px";
  container.innerHTML = `
    <div style="font-size:10px;font-family:'Space Mono',monospace;color:var(--muted);text-align:center;margin-bottom:10px;">PETICIÓN Y RESPUESTA</div>
    <div style="display:flex;align-items:stretch;gap:8px;min-height:140px;">
      <div style="flex:1;background:#0f0f1a;border:1px solid var(--border);border-radius:10px;padding:8px;display:flex;flex-direction:column;align-items:center;">
        <div style="font-size:9px;color:var(--muted);font-family:'Space Mono',monospace;">NAVEGADOR</div>
        <div style="margin-top:8px;width:100%;max-width:120px;height:70px;background:#070711;border-radius:6px;border:1px solid #2d2d4a;display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--muted);">Página</div>
      </div>
      <div style="flex:1;position:relative;min-width:80px;">
        <div style="position:absolute;top:32px;left:0;right:0;height:2px;background:#1e1e3a;"></div>
        <div style="position:absolute;top:52px;left:0;right:0;height:2px;background:#1e1e3a;"></div>
        <div id="httpCsReqDot" style="position:absolute;top:26px;left:0;width:36px;height:18px;background:#f59e0b;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:8px;font-weight:700;color:#0a0a0f;box-shadow:0 0 8px #f59e0b88;transform:translateX(0);transition:transform 1.2s cubic-bezier(0.4,0,0.2,1);">GET</div>
        <div id="httpCsResDot" style="position:absolute;top:46px;right:0;width:36px;height:18px;background:${esc(color)};border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:8px;font-weight:700;color:#0a0a0f;box-shadow:0 0 8px ${esc(color)}66;transform:translateX(0);transition:transform 1s cubic-bezier(0.4,0,0.2,1);opacity:0;">200</div>
      </div>
      <div style="flex:1;background:#0f0f1a;border:1px solid var(--border);border-radius:10px;padding:8px;display:flex;flex-direction:column;align-items:center;">
        <div style="font-size:9px;color:var(--muted);font-family:'Space Mono',monospace;">SERVIDOR</div>
        <div id="httpCsSrvBusy" style="margin-top:8px;font-size:10px;color:var(--muted);text-align:center;opacity:0;transition:opacity 0.3s;">Procesando…</div>
      </div>
    </div>`;
  const wire = container.children[1]?.children[1] as HTMLElement | undefined;
  const req = container.querySelector("#httpCsReqDot") as HTMLElement | null;
  const res = container.querySelector("#httpCsResDot") as HTMLElement | null;
  const busy = container.querySelector("#httpCsSrvBusy") as HTMLElement | null;
  if (!wire || !req || !res) return;
  const w = () => wire.getBoundingClientRect().width;
  sub.push(
    globalThis.setTimeout(() => {
      const dist = Math.max(0, w() - 44);
      req.style.transform = `translateX(${dist}px)`;
    }, 400)
  );
  sub.push(
    globalThis.setTimeout(() => {
      if (busy) busy.style.opacity = "1";
    }, 1600)
  );
  sub.push(
    globalThis.setTimeout(() => {
      if (busy) busy.style.opacity = "0";
      res.style.opacity = "1";
      const dist = Math.max(0, w() - 44);
      res.style.transform = `translateX(-${dist}px)`;
    }, 2400)
  );
}

export function buildVerbsAnim(container: HTMLElement, color: string, sub: SubstepTimers) {
  container.style.padding = "10px 4px";
  container.innerHTML = `
    <p style="font-size:12px;color:var(--muted);text-align:center;margin-bottom:12px;">En la web, la <strong style="color:var(--text);">dirección</strong> dice <em>qué recurso</em> pides; el <strong style="color:var(--text);">método</strong> dice <em>qué quieres hacer</em> con él.</p>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
      ${["GET", "POST", "PUT", "DELETE"]
        .map(
          (v, i) => `
      <div class="http-cs-verb" data-v="${i}" style="background:#070711;border:1px solid var(--border);border-radius:8px;padding:10px;text-align:center;font-family:'Space Mono',monospace;font-size:11px;opacity:0.3;transition:all 0.35s;">
        <span style="color:${esc(color)};">${esc(v)}</span>
      </div>`
        )
        .join("")}
    </div>`;
  container.querySelectorAll(".http-cs-verb").forEach((el, i) => {
    sub.push(
      globalThis.setTimeout(() => {
        const h = el as HTMLElement;
        h.style.opacity = "1";
        h.style.borderColor = color + "55";
      }, 250 + i * 200)
    );
  });
}

export function buildFutureAnim(container: HTMLElement, color: string, sub: SubstepTimers) {
  container.style.padding = "16px 12px";
  container.innerHTML = `
    <div style="text-align:center;font-size:13px;line-height:1.6;color:var(--muted);">
      Más adelante en el bootcamp profundizarás en cómo se organizan las <strong style="color:var(--text);">peticiones en aplicaciones reales</strong>,
      datos estructurados y capas de seguridad. Por ahora basta con la imagen mental:
      <span style="color:${esc(color)};">cliente ↔ mensaje HTTP ↔ servidor</span>.
    </div>`;
  sub.push(
    globalThis.setTimeout(() => {
      container.style.transition = "opacity 0.5s";
      container.style.opacity = "1";
    }, 100)
  );
}
