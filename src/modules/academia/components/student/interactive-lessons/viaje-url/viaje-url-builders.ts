import type { SubstepTimers } from "./viaje-url-timers";

export function buildIPAnim(container: HTMLElement, color: string, substepTimers: SubstepTimers) {
  container.style.background = 'linear-gradient(135deg, #060c1a, #030610)';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.padding = '20px';
  container.style.gap = '16px';

  // Private IP
  const privWrap = document.createElement('div');
  privWrap.innerHTML = `<div class="ip-label">IP PRIVADA (tu PC)</div>`;
  const privRow = document.createElement('div');
  privRow.className = 'ip-display';
  const privOctets = ['192', '168', '1', '5'];
  privOctets.forEach((o, i) => {
    if (i > 0) { const s = document.createElement('span'); s.className = 'ip-sep'; s.textContent = '.'; privRow.appendChild(s); }
    const oc = document.createElement('div'); oc.className = 'ip-octet'; oc.textContent = o;
    privRow.appendChild(oc);
    substepTimers.push(globalThis.setTimeout(() => oc.classList.add('lit'), 300 + i * 200));
  });
  privWrap.appendChild(privRow);
  container.appendChild(privWrap);

  // Arrow
  const arrow = document.createElement('div');
  arrow.style.cssText = `color:var(--muted);font-size:18px;animation:none;opacity:0;transition:opacity .5s ease;`;
  arrow.textContent = '↓ NAT (router) ↓';
  arrow.style.fontFamily = "'Space Mono',monospace"; arrow.style.fontSize = '11px'; arrow.style.letterSpacing = '2px';
  container.appendChild(arrow);
  substepTimers.push(globalThis.setTimeout(() => arrow.style.opacity = '1', 1200));

  // Public IP
  const pubWrap = document.createElement('div');
  pubWrap.innerHTML = `<div class="ip-label" style="opacity:0;transition:opacity .5s ease" id="pubLabel">IP PÚBLICA (router)</div>`;
  const pubRow = document.createElement('div');
  pubRow.className = 'ip-display';
  pubRow.style.opacity = '0'; pubRow.style.transition = 'opacity .5s ease';
  const pubOctets = ['181', '52', '34', '10'];
  pubOctets.forEach((o, i) => {
    if (i > 0) { const s = document.createElement('span'); s.className = 'ip-sep'; s.textContent = '.'; pubRow.appendChild(s); }
    const oc = document.createElement('div'); oc.className = 'ip-octet'; oc.textContent = o; oc.style.borderColor = '#38bdf888'; oc.style.color = '#38bdf8';
    pubRow.appendChild(oc);
  });
  pubWrap.appendChild(pubRow);
  container.appendChild(pubWrap);
  substepTimers.push(globalThis.setTimeout(() => {
    const pubLabel = pubWrap.querySelector('#pubLabel') as HTMLElement | null;
    if (pubLabel) pubLabel.style.opacity = '1';
    pubRow.style.opacity = '1';
  }, 1500));
}

// ── BROWSER ANIM ──
export function buildBrowserAnim(container: HTMLElement, color: string, substepTimers: SubstepTimers) {
  container.style.padding = '20px 28px';
  container.innerHTML = `
    <div style="background:#020408;border-radius:14px;overflow:hidden;border:1px solid #0f1a30;">
      <div style="padding:10px 16px;background:#060c1a;display:flex;align-items:center;gap:8px;border-bottom:1px solid #0f1a30;">
        <div style="display:flex;gap:5px"><div style="width:10px;height:10px;border-radius:50%;background:#ff5f57"></div><div style="width:10px;height:10px;border-radius:50%;background:#febc2e"></div><div style="width:10px;height:10px;border-radius:50%;background:#28c840"></div></div>
        <div id="animUrlBar" style="flex:1;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:5px 12px;font-family:'Space Mono',monospace;font-size:11px;color:var(--muted);"></div>
      </div>
      <div style="padding:16px;min-height:80px;display:flex;align-items:center;justify-content:center;">
        <div id="browserStatus" style="font-family:'Space Mono',monospace;font-size:12px;color:var(--muted);text-align:center;line-height:1.8;"></div>
      </div>
    </div>
  `;
  const urlBar = container.querySelector('#animUrlBar') as HTMLElement;
  const status = container.querySelector('#browserStatus') as HTMLElement;
  const url = 'https://kaledsoft.tech/dashboard';
  let typed = '';
  const type = () => {
    if (typed.length < url.length) {
      typed += url[typed.length];
      urlBar.innerHTML = `<span style="color:${color}">${typed}</span><span class="cursor"></span>`;
      substepTimers.push(globalThis.setTimeout(type, 55));
    } else {
      urlBar.innerHTML = `<span style="color:${color}">${typed}</span>`;
      substepTimers.push(globalThis.setTimeout(() => {
        status.innerHTML = `⌛ Revisando cache del browser…`;
        substepTimers.push(globalThis.setTimeout(() => {
          status.innerHTML = `🌐 Parseando URL…<br><span style="color:#445588;font-size:10px">protocolo: https · dominio: kaledsoft.tech · ruta: /dashboard</span>`;
          substepTimers.push(globalThis.setTimeout(() => {
            status.innerHTML = `🔍 Necesita IP para kaledsoft.tech<br><span style="color:#445588;font-size:10px">→ consultando DNS del sistema operativo…</span>`;
          }, 1200));
        }, 900));
      }, 400));
    }
  };
  substepTimers.push(globalThis.setTimeout(type, 300));
}

// ── DNS ANIM ──
export function buildDNSAnim(container: HTMLElement, color: string, substepTimers: SubstepTimers) {
  container.style.padding = '16px 28px';
  const nodes = [
    { label: 'Tu PC', icon: '💻', x: '5%' },
    { label: 'Resolver', icon: '📡', x: '28%' },
    { label: 'Root', icon: '🌍', x: '51%' },
    { label: '.tech TLD', icon: '📋', x: '74%' },
    { label: 'Autoritativo', icon: '✅', x: '91%' },
  ];
  container.style.position = 'relative';
  container.style.height = '130px';

  // lines
  for (let i = 0; i < nodes.length - 1; i++) {
    const line = document.createElement('div');
    line.style.cssText = `position:absolute;top:52px;height:1px;background:var(--border);`;
    const lx = parseFloat(nodes[i].x) + 4;
    const rx = parseFloat(nodes[i+1].x) + 4;
    line.style.left = lx + '%'; line.style.width = (rx - lx) + '%';
    line.id = 'dnsLine' + i;
    container.appendChild(line);
  }

  // nodes
  nodes.forEach((n, i) => {
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;top:20px;display:flex;flex-direction:column;align-items:center;gap:5px;`;
    el.style.left = n.x;
    el.innerHTML = `
      <div style="width:44px;height:44px;border-radius:12px;background:var(--card);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:20px;transition:all .4s ease" id="dnsNode${i}">${n.icon}</div>
      <div style="font-family:'Space Mono',monospace;font-size:8px;color:var(--muted);white-space:nowrap">${n.label}</div>
    `;
    container.appendChild(el);
  });

  // packet animation
  const packet = document.createElement('div');
  packet.style.cssText = `position:absolute;top:44px;width:16px;height:16px;border-radius:50%;background:${color};box-shadow:0 0 10px ${color};transition:left 1s ease,opacity .3s ease;opacity:0;z-index:5;`;
  container.appendChild(packet);

  // animate
  const positions = ['5%', '28%', '51%', '74%', '91%', '74%', '5%'];
  let pi = 0;
  const advance = () => {
    if (pi >= positions.length) return;
    packet.style.opacity = '1';
    packet.style.left = positions[pi];
    const nodeIdx = Math.min(pi, nodes.length - 1);
    const node = container.querySelector("#dnsNode" + nodeIdx) as HTMLElement | null;
    if (node) {
      node.style.borderColor = color;
      node.style.boxShadow = `0 0 12px ${color}66`;
    }
    if (pi < nodes.length - 1) {
      const line = container.querySelector("#dnsLine" + Math.min(pi, nodes.length - 2)) as HTMLElement | null;
      if (line) {
        line.style.background = color;
        line.style.boxShadow = `0 0 4px ${color}`;
      }
    }
    pi++;
    if (pi < positions.length) substepTimers.push(globalThis.setTimeout(advance, pi < 5 ? 900 : 700));
    else packet.style.opacity = '0';
  };
  substepTimers.push(globalThis.setTimeout(advance, 500));
}

// extra: DNS tree
export function buildDNSTree(container: HTMLElement, color: string, substepTimers: SubstepTimers) {
  container.innerHTML = `<div class="dns-tree" id="dnsTreeRows"></div>`;
  const rows = [
    { from: 'Tu PC', to: 'Resolver (8.8.8.8)', desc: 'Pregunta: ¿IP de kaledsoft.tech?' },
    { from: 'Resolver', to: 'Root Server', desc: '¿Quién maneja .tech?' },
    { from: 'Root Server', to: 'Servidor TLD .tech', desc: 'Ve a ns.nic.tech' },
    { from: 'TLD .tech', to: 'ns1.vercel-dns.com', desc: 'Ese dominio está aquí' },
    { from: 'Autoritativo', to: 'Tu PC', desc: '✅ 76.76.21.21 · TTL 300s' },
  ];
  const wrap = container.querySelector("#dnsTreeRows") as HTMLElement | null;
  if (!wrap) return;
  rows.forEach((r, i) => {
    const div = document.createElement('div');
    div.className = 'dns-row';
    div.innerHTML = `<span class="dns-from">${r.from}</span><span class="dns-arrow">→</span><span class="dns-to">${r.to}</span><span class="dns-desc">${r.desc}</span>`;
    wrap.appendChild(div);
    substepTimers.push(globalThis.setTimeout(() => div.classList.add('show'), 400 + i * 600));
  });
}

// ── TCP ANIM ──
export function buildTCPAnim(container: HTMLElement, color: string, substepTimers: SubstepTimers) {
  container.style.padding = '20px 28px';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.gap = '16px';

  container.innerHTML = `
    <div style="text-align:center">
      <div style="font-size:28px">💻</div>
      <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);margin-top:4px">Tu Browser</div>
    </div>
    <div style="flex:1;position:relative;height:70px;display:flex;flex-direction:column;justify-content:space-around">
      <div class="tcp-msg" id="tcpSyn"  style="display:flex;align-items:center;gap:6px;opacity:0;transition:all .5s ease;justify-content:flex-start">
        <div style="padding:3px 10px;border-radius:5px;font-family:'Space Mono',monospace;font-size:10px;font-weight:700;background:#34d39920;color:var(--tcp);border:1px solid var(--tcp)">SYN</div>
        <div style="flex:1;height:1px;background:var(--tcp);position:relative"><div style="position:absolute;right:-6px;top:-5px;color:var(--tcp);font-size:10px">▶</div></div>
      </div>
      <div class="tcp-msg" id="tcpSynAck" style="display:flex;align-items:center;gap:6px;opacity:0;transition:all .5s ease;justify-content:flex-end">
        <div style="flex:1;height:1px;background:#fbbf24;position:relative"><div style="position:absolute;left:-6px;top:-5px;color:#fbbf24;font-size:10px">◀</div></div>
        <div style="padding:3px 10px;border-radius:5px;font-family:'Space Mono',monospace;font-size:10px;font-weight:700;background:#fbbf2420;color:#fbbf24;border:1px solid #fbbf24">SYN-ACK</div>
      </div>
      <div class="tcp-msg" id="tcpAck"   style="display:flex;align-items:center;gap:6px;opacity:0;transition:all .5s ease;justify-content:flex-start">
        <div style="padding:3px 10px;border-radius:5px;font-family:'Space Mono',monospace;font-size:10px;font-weight:700;background:#f472b620;color:#f472b6;border:1px solid #f472b6">ACK</div>
        <div style="flex:1;height:1px;background:#f472b6;position:relative"><div style="position:absolute;right:-6px;top:-5px;color:#f472b6;font-size:10px">▶</div></div>
      </div>
    </div>
    <div style="text-align:center">
      <div style="font-size:28px">🌐</div>
      <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);margin-top:4px">Servidor</div>
    </div>
  `;
  ['tcpSyn','tcpSynAck','tcpAck'].forEach((id, i) => {
    substepTimers.push(globalThis.setTimeout(() => {
      (container.querySelector('#' + id) as HTMLElement | null)!.style.opacity = '1';
    }, 500 + i * 900));
  });
}

// extra: handshake detail
export function buildHandshake(container: HTMLElement, color: string, substepTimers: SubstepTimers) {
  container.innerHTML = `<div class="hs-visual" id="hsVis"></div>`;
  const vis = container.querySelector('#hsVis') as HTMLElement | null;
  if (!vis) return;
  vis.innerHTML = `
    <div class="hs-col">
      <div class="hs-peer-label" style="color:var(--ip)">💻 Browser</div>
      <div class="hs-steps" style="display:flex;flex-direction:column;gap:8px;width:100%">
        <div class="hs-step syn"  id="hsc1" style="font-family:'Space Mono',monospace;font-size:11px;padding:6px 10px;border-radius:7px;background:var(--card);border:1px solid var(--border);opacity:.3;transition:all .4s ease;color:var(--tcp)">→ SYN</div>
        <div class="hs-step ack"  id="hsc3" style="font-family:'Space Mono',monospace;font-size:11px;padding:6px 10px;border-radius:7px;background:var(--card);border:1px solid var(--border);opacity:.3;transition:all .4s ease;color:var(--tls)">← SYN-ACK ✓</div>
        <div class="hs-step data" id="hsc5" style="font-family:'Space Mono',monospace;font-size:11px;padding:6px 10px;border-radius:7px;background:var(--card);border:1px solid var(--border);opacity:.3;transition:all .4s ease;color:var(--http)">→ ACK + GET /</div>
      </div>
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center">
      <div style="font-family:'Space Mono',monospace;font-size:10px;color:var(--muted);text-align:center;line-height:2">RTT<br>~80ms</div>
    </div>
    <div class="hs-col">
      <div class="hs-peer-label" style="color:var(--tcp)">🌐 Servidor</div>
      <div class="hs-steps" style="display:flex;flex-direction:column;gap:8px;width:100%">
        <div id="hsc2" style="font-family:'Space Mono',monospace;font-size:11px;padding:6px 10px;border-radius:7px;background:var(--card);border:1px solid var(--border);opacity:.3;transition:all .4s ease;color:var(--tcp)">SYN recibido ✓</div>
        <div id="hsc4" style="font-family:'Space Mono',monospace;font-size:11px;padding:6px 10px;border-radius:7px;background:var(--card);border:1px solid var(--border);opacity:.3;transition:all .4s ease;color:var(--tls)">← SYN-ACK</div>
        <div id="hsc6" style="font-family:'Space Mono',monospace;font-size:11px;padding:6px 10px;border-radius:7px;background:var(--card);border:1px solid var(--border);opacity:.3;transition:all .4s ease;color:var(--http)">ACK recibido · 200 OK</div>
      </div>
    </div>
  `;
  [1,2,3,4,5,6].forEach(i => {
    substepTimers.push(globalThis.setTimeout(() => {
      const el = vis.querySelector('#hsc' + i) as HTMLElement | null;
      if (el) { el.style.opacity = '1'; el.style.borderColor = 'currentColor'; }
    }, 400 + i * 500));
  });
}

// ── TLS ANIM ──
export function buildTLSAnim(container: HTMLElement, color: string, substepTimers: SubstepTimers) {
  container.style.padding = '16px 28px';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.gap = '0';
  container.style.flexDirection = 'column';

  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;gap:20px;width:100%">
      <div style="text-align:center">
        <div style="font-size:28px">💻</div>
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted)">Browser</div>
      </div>
      <div style="flex:1;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;position:relative" id="tlsChannel">
        <div style="font-family:'Space Mono',monospace;font-size:10px;color:var(--muted)" id="tlsStatus">Negoción TLS 1.3…</div>
        <div style="font-size:20px;margin-top:4px" id="tlsIcon">⚙️</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:28px">🌐</div>
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted)">Servidor</div>
      </div>
    </div>
  `;
  const channel = container.querySelector('#tlsChannel') as HTMLElement;
  const tlsStatus = container.querySelector('#tlsStatus') as HTMLElement;
  const tlsIcon = container.querySelector('#tlsIcon') as HTMLElement;
  const stages = [
    { status: 'ClientHello → cipher suites…', icon: '👋', color2: color },
    { status: 'ServerHello + Certificado…', icon: '📜', color2: color },
    { status: 'Verificando CA…', icon: '🔍', color2: color },
    { status: '🔒 Canal cifrado establecido', icon: '🔐', color2: '#34d399', border: '#34d399' },
  ];
  stages.forEach((st, i) => {
    substepTimers.push(globalThis.setTimeout(() => {
      tlsStatus.textContent = st.status;
      tlsStatus.style.color = st.color2;
      tlsIcon.textContent = st.icon;
      if (st.border) {
        channel.style.borderColor = st.border;
        channel.style.boxShadow = `0 0 16px ${st.border}44`;
      }
    }, 600 + i * 900));
  });
}

// extra: TLS stack
export function buildTLSStack(container: HTMLElement, color: string, substepTimers: SubstepTimers) {
  container.innerHTML = `<div class="tls-stack" id="tlsStackRows"></div>`;
  const rows = [
    { icon: '👋', name: 'ClientHello', desc: 'Browser envía versiones TLS + cipher suites soportados', time: '0ms' },
    { icon: '📜', name: 'ServerHello', desc: 'Servidor elige cipher + envía certificado X.509', time: '+20ms' },
    { icon: '🔍', name: 'Verify cert', desc: 'Browser valida firma de CA (Let\'s Encrypt, DigiCert…)', time: '+10ms' },
    { icon: '🔑', name: 'Key Exchange', desc: 'Ambos derivan clave simétrica (ECDHE). Nadie más puede calcularla.', time: '+20ms' },
    { icon: '🔒', name: 'Cifrado activo', desc: 'Todo el tráfico cifrado con AES-256-GCM a partir de aquí', time: '+0ms' },
  ];
  const wrap = container.querySelector("#tlsStackRows") as HTMLElement | null;
  if (!wrap) return;
  rows.forEach((r, i) => {
    const div = document.createElement('div');
    div.className = 'tls-layer-row';
    div.style.borderColor = i === rows.length - 1 ? '#34d39966' : '';
    div.innerHTML = `<div class="tls-layer-icon">${r.icon}</div><div class="tls-layer-name" style="color:${color}">${r.name}</div><div class="tls-layer-desc">${r.desc}</div><div class="tls-layer-time">${r.time}</div>`;
    wrap.appendChild(div);
    substepTimers.push(globalThis.setTimeout(() => div.classList.add('show'), 300 + i * 500));
  });
}

// ── HTTP ANIM ──
export function buildHTTPAnim(container: HTMLElement, color: string, substepTimers: SubstepTimers) {
  container.style.padding = '16px 28px';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'space-between';
  container.style.gap = '14px';

  container.innerHTML = `
    <div style="text-align:center;flex-shrink:0">
      <div style="font-size:28px">💻</div>
      <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted)">Browser</div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;gap:10px;align-items:center">
      <div id="reqArrow" style="display:flex;align-items:center;gap:8px;width:100%;opacity:0;transition:opacity .5s ease">
        <div style="padding:3px 10px;border-radius:5px;font-family:'Space Mono',monospace;font-size:10px;font-weight:700;background:#f472b620;color:#f472b6;border:1px solid #f472b6;white-space:nowrap">GET /dashboard</div>
        <div style="flex:1;height:1px;background:#f472b6;position:relative"><div style="position:absolute;right:-6px;top:-5px;color:#f472b6;font-size:10px">▶</div></div>
      </div>
      <div id="resArrow" style="display:flex;align-items:center;gap:8px;width:100%;opacity:0;transition:opacity .5s ease">
        <div style="flex:1;height:1px;background:#34d399;position:relative"><div style="position:absolute;left:-6px;top:-5px;color:#34d399;font-size:10px">◀</div></div>
        <div style="padding:3px 10px;border-radius:5px;font-family:'Space Mono',monospace;font-size:10px;font-weight:700;background:#34d39920;color:#34d399;border:1px solid #34d399;white-space:nowrap">200 OK + HTML</div>
      </div>
    </div>
    <div style="text-align:center;flex-shrink:0">
      <div style="font-size:28px">🌐</div>
      <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted)">Servidor</div>
    </div>
  `;
  substepTimers.push(
    globalThis.setTimeout(() => {
      (container.querySelector("#reqArrow") as HTMLElement | null)!.style.opacity = "1";
    }, 400)
  );
  substepTimers.push(
    globalThis.setTimeout(() => {
      (container.querySelector("#resArrow") as HTMLElement | null)!.style.opacity = "1";
    }, 1400)
  );
}

// extra: HTTP terminal
export function buildHTTPTerminal(container: HTMLElement, color: string, substepTimers: SubstepTimers) {
  container.innerHTML = `
    <div class="http-terminal">
      <div class="http-bar">
        <div class="http-dot" style="background:#ff5f57"></div>
        <div class="http-dot" style="background:#febc2e"></div>
        <div class="http-dot" style="background:#28c840"></div>
        <div class="http-title">HTTP REQUEST / RESPONSE</div>
      </div>
      <div class="http-body" id="httpBody"></div>
    </div>
  `;
  const body = container.querySelector("#httpBody") as HTMLElement | null;
  if (!body) return;
  const lines = [
    { cls: 'http-method', text: 'GET ', extra: '<span class="http-path">/dashboard</span><span class="http-ver"> HTTP/2</span>' },
    { cls: 'http-key', text: 'Host: ', extra: '<span class="http-val">kaledsoft.tech</span>' },
    { cls: 'http-key', text: 'Authorization: ', extra: '<span class="http-val">Bearer eyJhbGciOiJIUzI1NiJ9…</span>' },
    { cls: 'http-key', text: 'Accept-Encoding: ', extra: '<span class="http-val">gzip, br</span>' },
    { cls: 'http-blank', text: '─────────────────────────────────────', extra: '' },
    { cls: 'http-status', text: 'HTTP/2 200 OK', extra: '' },
    { cls: 'http-key', text: 'Content-Type: ', extra: '<span class="http-val">text/html; charset=utf-8</span>' },
    { cls: 'http-key', text: 'Cache-Control: ', extra: '<span class="http-val">public, s-maxage=86400</span>' },
    { cls: 'http-key', text: 'X-Vercel-Cache: ', extra: '<span class="http-val">HIT</span>' },
  ];
  lines.forEach((l, i) => {
    const div = document.createElement('div');
    div.className = 'http-line';
    div.innerHTML = `<span class="${l.cls}">${l.text}</span>${l.extra}`;
    body.appendChild(div);
    substepTimers.push(globalThis.setTimeout(() => div.classList.add('show'), 200 + i * 350));
  });
}

// ── CDN ANIM ──
export function buildCDNAnim(container: HTMLElement, color: string, substepTimers: SubstepTimers) {
  container.style.padding = '16px 28px';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.gap = '20px';

  container.innerHTML = `
    <div style="text-align:center">
      <div style="font-size:30px">💻</div>
      <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);margin-top:4px">Bogotá</div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;gap:12px">
      <div id="cdnRouteA" style="display:flex;align-items:center;gap:8px;opacity:0;transition:all .5s ease">
        <div style="padding:3px 10px;border-radius:5px;font-family:'Space Mono',monospace;font-size:9px;background:#a78bfa20;color:#a78bfa;border:1px solid #a78bfa;white-space:nowrap">CDN Edge · Miami</div>
        <div style="flex:1;height:1.5px;background:#a78bfa;position:relative"><div style="position:absolute;right:-6px;top:-5px;color:#a78bfa;font-size:10px">▶</div></div>
        <div style="padding:3px 8px;border-radius:5px;font-family:'Space Mono',monospace;font-size:9px;color:#34d399">~15ms ✓</div>
      </div>
      <div id="cdnRouteB" style="display:flex;align-items:center;gap:8px;opacity:.2">
        <div style="padding:3px 10px;border-radius:5px;font-family:'Space Mono',monospace;font-size:9px;background:var(--dim);color:var(--muted);border:1px solid var(--border);white-space:nowrap">Sin CDN · us-east-1</div>
        <div style="flex:1;height:1px;background:var(--muted);position:relative;border-top:1px dashed var(--muted)"></div>
        <div style="padding:3px 8px;border-radius:5px;font-family:'Space Mono',monospace;font-size:9px;color:var(--http)">~160ms ✗</div>
      </div>
    </div>
    <div style="text-align:center">
      <div style="font-size:30px">🏠</div>
      <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);margin-top:4px">Servidor</div>
    </div>
  `;
  substepTimers.push(
    globalThis.setTimeout(() => {
      (container.querySelector("#cdnRouteA") as HTMLElement | null)!.style.opacity = "1";
    }, 400)
  );
}

// extra: CDN map
export function buildCDNMap(container: HTMLElement, color: string, substepTimers: SubstepTimers) {
  container.innerHTML = `<div class="cdn-map" id="cdnMapBox"><div class="cdn-grid"></div></div>
  <div style="font-family:'Space Mono',monospace;font-size:10px;color:var(--muted);text-align:center;padding:6px 28px 4px" id="cdnMapInfo">↑ Click en un nodo para ver la latencia</div>`;

  const map = container.querySelector("#cdnMapBox") as HTMLElement | null;
  const info = container.querySelector("#cdnMapInfo") as HTMLElement | null;
  if (!map || !info) return;

  const origin = { x: 50, y: 50, label: 'us-east-1', icon: '🏠', color: color };
  const edges = [
    { x: 22, y: 65, label: 'Bogotá',  latency: '15ms', icon: '📍' },
    { x: 28, y: 42, label: 'Miami',   latency: '22ms', icon: '📍' },
    { x: 50, y: 22, label: 'London',  latency: '12ms', icon: '📍' },
    { x: 62, y: 30, label: 'Fráncfort', latency: '10ms', icon: '📍' },
    { x: 78, y: 48, label: 'Mumbai',  latency: '20ms', icon: '📍' },
    { x: 82, y: 68, label: 'Sydney',  latency: '25ms', icon: '📍' },
    { x: 14, y: 35, label: 'Seattle', latency: '30ms', icon: '📍' },
  ];

  // origin
  const orig = document.createElement('div');
  orig.className = 'cdn-node';
  orig.style.left = origin.x + '%'; orig.style.top = origin.y + '%';
  orig.style.transform = 'translate(-50%,-50%)';
  orig.innerHTML = `<div class="cdn-node-dot origin lit" style="color:${color};background:${color}44;border-color:${color}"></div><div class="cdn-node-lbl" style="color:${color}">${origin.label}</div>`;
  map.appendChild(orig);

  edges.forEach(e => {
    // beam
    const ox = origin.x, oy = origin.y;
    const dx = e.x - ox, dy = e.y - oy;
    const w = map.offsetWidth || 600, h = 160;
    const len = Math.sqrt((dx/100*w)**2 + (dy/100*h)**2);
    const angle = Math.atan2(dy/100*h, dx/100*w) * 180 / Math.PI;
    const beam = document.createElement('div');
    beam.className = 'cdn-beam'; beam.id = 'beam-' + e.label;
    beam.style.left = (ox/100*w) + 'px';
    beam.style.top = (oy/100*h) + 'px';
    beam.style.width = len + 'px';
    beam.style.transform = `rotate(${angle}deg)`;
    map.insertBefore(beam, map.firstChild?.nextSibling ?? null);

    // node
    const node = document.createElement('div');
    node.className = 'cdn-node';
    node.style.left = e.x + '%'; node.style.top = e.y + '%';
    node.style.transform = 'translate(-50%,-50%)';
    node.style.cursor = 'pointer';
    node.innerHTML = `<div class="cdn-node-dot" style="color:var(--tcp)" id="cdnDot-${e.label}"></div><div class="cdn-node-lbl">${e.label}</div>`;
    node.onclick = () => {
      map.querySelectorAll(".cdn-beam").forEach((b) => b.classList.remove("lit"));
      map.querySelectorAll(".cdn-node-dot:not(.origin)").forEach((d) => d.classList.remove("lit"));
      map.querySelector("#beam-" + e.label)?.classList.add("lit");
      map.querySelector("#cdnDot-" + e.label)?.classList.add("lit");
      info.innerHTML = `📍 <b style="color:var(--cdn)">${e.label}</b> → 🏠 us-east-1 · <b style="color:var(--tcp)">${e.latency}</b> con CDN · <span style="color:var(--muted)">vs ~160ms directo</span>`;
    };
    map.appendChild(node);
  });
}

// ── BROWSER RENDER ANIM ──
export function buildBrowserRenderAnim(container: HTMLElement, color: string, substepTimers: SubstepTimers) {
  container.style.padding = '16px 28px';
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;gap:20px">
      <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
        <div style="font-size:28px">📄</div>
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted)">HTML</div>
        <div style="font-size:14px;color:var(--muted)" id="htmlCheck" style="opacity:0">→</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
        <div style="font-size:28px">🌳</div>
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted)">DOM</div>
      </div>
      <div style="font-size:14px;color:var(--muted)">+</div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
        <div style="font-size:28px">🎨</div>
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted)">CSSOM</div>
      </div>
      <div style="font-size:14px;color:var(--muted)">→</div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
        <div style="font-size:28px" id="paintIcon">⬜</div>
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted)">Paint</div>
      </div>
      <div style="font-size:14px;color:var(--muted)">→</div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
        <div style="font-size:28px" id="finalIcon">🖥️</div>
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:${color}" id="finalLabel">Cargando…</div>
      </div>
    </div>
  `;
  substepTimers.push(
    globalThis.setTimeout(() => {
      const paint = container.querySelector("#paintIcon") as HTMLElement | null;
      if (paint) paint.textContent = "🖼️";
    }, 800)
  );
  substepTimers.push(
    globalThis.setTimeout(() => {
      const final = container.querySelector("#finalLabel") as HTMLElement | null;
      if (final) {
        final.textContent = "✅ Visible";
        final.style.color = "#34d399";
      }
    }, 1600)
  );
}

// extra: browser mock
export function buildBrowserMock(container: HTMLElement, color: string, substepTimers: SubstepTimers) {
  container.innerHTML = `
    <div class="browser-mock">
      <div class="browser-chrome">
        <div class="b-dots">
          <div class="b-dot" style="background:#ff5f57"></div>
          <div class="b-dot" style="background:#febc2e"></div>
          <div class="b-dot" style="background:#28c840"></div>
        </div>
        <div class="b-url-bar">🔒 kaledsoft.tech/dashboard</div>
      </div>
      <div class="browser-viewport">
        <div class="bv-row bv-nav" id="bvNav" style="height:28px;border-radius:6px;background:var(--dim);transform:scaleX(0);transform-origin:left;transition:transform .6s ease"></div>
        <div class="bv-row bv-hero" id="bvHero" style="height:55px;border-radius:8px;background:var(--dim);transform:scaleX(0);transform-origin:left;transition:transform .7s ease"></div>
        <div style="display:flex;gap:8px">
          ${[0,1,2].map(i=>`<div id="bvCard${i}" style="flex:1;height:36px;border-radius:6px;background:var(--dim);transform:scaleX(0);transform-origin:left;transition:transform .6s ease"></div>`).join('')}
        </div>
        <div class="bv-row" id="bvLine1" style="height:8px;width:70%;border-radius:4px;background:var(--dim);transform:scaleX(0);transform-origin:left;transition:transform .5s ease"></div>
        <div class="bv-row" id="bvLine2" style="height:8px;width:50%;border-radius:4px;background:var(--dim);transform:scaleX(0);transform-origin:left;transition:transform .5s ease"></div>
      </div>
    </div>
  `;
  const order = ['bvNav','bvHero','bvCard0','bvCard1','bvCard2','bvLine1','bvLine2'];
  order.forEach((id, i) => {
    substepTimers.push(globalThis.setTimeout(() => {
      const el = container.querySelector('#' + id) as HTMLElement | null;
      if (el) { el.style.transform = 'scaleX(1)'; el.style.background = id.startsWith('bvCard') ? '#1a2f4a' : id === 'bvHero' ? '#122240' : '#16213a'; }
    }, 300 + i * 250));
  });
}

