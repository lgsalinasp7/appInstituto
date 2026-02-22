import { useState, useEffect, useRef } from "react";

// ============================================================
// SIMULACIÓN DE DATOS (reemplaza con tu Neon DB + Groq real)
// ============================================================

const GROQ_FREE_LIMIT = 100_000; // tokens/día gratis (ajusta según tu plan)
const COST_PER_1K_INPUT = 0.00; // Groq gratis = $0
const COST_PER_1K_OUTPUT = 0.00;

function generateFakeHistory() {
  const models = ["llama3-8b-8192", "mixtral-8x7b-32768", "gemma2-9b-it"];
  const features = ["chat", "resumen", "FAQ"];
  const users = ["user_001", "user_002", "user_003", "user_004"];
  const now = Date.now();
  return Array.from({ length: 60 }, (_, i) => {
    const inputT = 80 + Math.floor(Math.random() * 400);
    const outputT = 40 + Math.floor(Math.random() * 300);
    return {
      id: `evt_${i}`,
      customerId: users[i % users.length],
      model: models[i % models.length],
      feature: features[i % features.length],
      inputTokens: inputT,
      outputTokens: outputT,
      totalTokens: inputT + outputT,
      costUsd: ((inputT / 1000) * COST_PER_1K_INPUT + (outputT / 1000) * COST_PER_1K_OUTPUT),
      cached: Math.random() > 0.75,
      createdAt: new Date(now - i * 18 * 60_000).toISOString(),
    };
  });
}

const fakeHistory = generateFakeHistory();

function computeStats(history) {
  const totalTokens = history.reduce((s, e) => s + e.totalTokens, 0);
  const totalInput = history.reduce((s, e) => s + e.inputTokens, 0);
  const totalOutput = history.reduce((s, e) => s + e.outputTokens, 0);
  const cached = history.filter((e) => e.cached).length;
  const avgTokens = Math.round(totalTokens / history.length) || 0;
  const burnRateDaily = Math.round((totalTokens / history.length) * 30);

  const byFeature = {};
  history.forEach((e) => {
    byFeature[e.feature] = (byFeature[e.feature] || 0) + e.totalTokens;
  });

  const byModel = {};
  history.forEach((e) => {
    byModel[e.model] = (byModel[e.model] || 0) + e.totalTokens;
  });

  const byUser = {};
  history.forEach((e) => {
    if (!byUser[e.customerId]) byUser[e.customerId] = 0;
    byUser[e.customerId] += e.totalTokens;
  });

  const freePct = Math.min(100, Math.round((totalTokens / GROQ_FREE_LIMIT) * 100));

  return {
    totalTokens, totalInput, totalOutput, cached,
    avgTokens, burnRateDaily, freePct,
    byFeature, byModel, byUser,
    events: history.length,
  };
}

// ============================================================
// MINI CHAT SIMULADO
// ============================================================

const MOCK_RESPONSES = [
  "¡Claro! Eso es exactamente lo que necesitas. Permíteme explicarte paso a paso cómo funciona el sistema.",
  "Entiendo tu pregunta. En este caso, la mejor opción sería implementar el caché en el lado del servidor para reducir tokens.",
  "Basándome en los datos que me compartes, el promedio de consumo está dentro del rango esperado para un chat continuo.",
  "Perfecto, con Groq gratuito puedes manejar aproximadamente 100 conversaciones diarias antes de escalar.",
  "Eso es correcto. El resumen automático cada 20 mensajes reduce el consumo de contexto hasta un 80%.",
];

let msgCounter = 0;

function simulateLLMCall(userMsg) {
  const inputT = Math.floor(userMsg.length / 3.5) + 60 + Math.floor(Math.random() * 80);
  const response = MOCK_RESPONSES[msgCounter % MOCK_RESPONSES.length];
  const outputT = Math.floor(response.length / 3.5) + Math.floor(Math.random() * 60);
  msgCounter++;
  return {
    text: response,
    usage: {
      inputTokens: inputT,
      outputTokens: outputT,
      totalTokens: inputT + outputT,
    },
    model: "llama3-8b-8192",
    cached: Math.random() > 0.8,
  };
}

// ============================================================
// SPARKLINE COMPONENT
// ============================================================

function Sparkline({ data, color = "#22d3ee", height = 32 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120, h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`${color}18`}
        stroke="none"
      />
    </svg>
  );
}

// ============================================================
// DONUT CHART
// ============================================================

function DonutChart({ data, colors }) {
  const total = Object.values(data).reduce((s, v) => s + v, 0);
  let angle = -90;
  const r = 36, cx = 50, cy = 50;
  const slices = Object.entries(data).map(([key, val], i) => {
    const pct = val / total;
    const a1 = (angle * Math.PI) / 180;
    angle += pct * 360;
    const a2 = (angle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const large = pct > 0.5 ? 1 : 0;
    return { key, pct, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, color: colors[i % colors.length] };
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg viewBox="0 0 100 100" width={80} height={80}>
        {slices.map((s) => <path key={s.key} d={s.path} fill={s.color} opacity={0.9} />)}
        <circle cx={cx} cy={cy} r={22} fill="#0f172a" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {slices.map((s, i) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94a3b8" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span style={{ color: "#e2e8f0" }}>{s.key}</span>
            <span style={{ color: "#64748b" }}>{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================

export default function TokenTracker() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy?", usage: null }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionTokens, setSessionTokens] = useState({ input: 0, output: 0, total: 0, calls: 0, cached: 0 });
  const [liveEvents, setLiveEvents] = useState([...fakeHistory]);
  const [sparkData, setSparkData] = useState([120, 200, 150, 300, 180, 250, 340, 200, 280, 320]);
  const bottomRef = useRef(null);

  const stats = computeStats(liveEvents);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userMsg, usage: null }]);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));

    const result = simulateLLMCall(userMsg);

    setMessages((m) => [...m, {
      role: "assistant",
      text: result.text,
      usage: result.usage,
      model: result.model,
      cached: result.cached,
    }]);

    setSessionTokens((s) => ({
      input: s.input + result.usage.inputTokens,
      output: s.output + result.usage.outputTokens,
      total: s.total + result.usage.totalTokens,
      calls: s.calls + 1,
      cached: s.cached + (result.cached ? 1 : 0),
    }));

    const newEvent = {
      id: `evt_live_${Date.now()}`,
      customerId: "user_001",
      model: result.model,
      feature: "chat",
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      totalTokens: result.usage.totalTokens,
      costUsd: 0,
      cached: result.cached,
      createdAt: new Date().toISOString(),
    };

    setLiveEvents((prev) => [newEvent, ...prev]);
    setSparkData((prev) => [...prev.slice(-9), result.usage.totalTokens]);
    setLoading(false);
  };

  const featureColors = ["#22d3ee", "#818cf8", "#34d399"];
  const modelColors = ["#f472b6", "#fb923c", "#a78bfa"];

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "chat", label: "Chat" },
    { id: "logs", label: "Eventos" },
    { id: "routing", label: "Routing" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070d1a",
      color: "#e2e8f0",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      padding: "24px",
      boxSizing: "border-box",
    }}>
      {/* HEADER */}
      <div style={{ marginBottom: 24, borderBottom: "1px solid #1e293b", paddingBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#22d3ee", textTransform: "uppercase", marginBottom: 6 }}>
            ◈ TOKEN INTELLIGENCE
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: -0.5 }}>
            LLM Cost Monitor
          </h1>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
            Groq Free Tier · Neon DB · Vercel AI SDK
          </div>
        </div>
        <div style={{
          background: "#0f172a",
          border: "1px solid #1e3a5f",
          borderRadius: 8,
          padding: "8px 14px",
          fontSize: 11,
          color: "#22d3ee",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee", animation: "pulse 2s infinite" }} />
          LIVE
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #1e293b" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? "#1e293b" : "transparent",
            border: "none",
            borderBottom: activeTab === t.id ? "2px solid #22d3ee" : "2px solid transparent",
            color: activeTab === t.id ? "#22d3ee" : "#64748b",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
            fontFamily: "inherit",
            marginBottom: -1,
            transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* =================== DASHBOARD =================== */}
      {activeTab === "dashboard" && (
        <div>
          {/* KPI CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total Tokens", value: stats.totalTokens.toLocaleString(), accent: "#22d3ee", sub: `${stats.events} llamadas` },
              { label: "Avg / Turno", value: stats.avgTokens.toLocaleString(), accent: "#818cf8", sub: `p/mensaje` },
              { label: "Free Tier", value: `${stats.freePct}%`, accent: stats.freePct > 80 ? "#f87171" : "#34d399", sub: `de ${GROQ_FREE_LIMIT.toLocaleString()} día` },
              { label: "Caché Hits", value: `${stats.cached}`, accent: "#fb923c", sub: `de ${stats.events} eventos` },
              { label: "Burn / Mes", value: (stats.burnRateDaily * 30).toLocaleString(), accent: "#f472b6", sub: `tokens proyectados` },
            ].map((k) => (
              <div key={k.label} style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 10,
                padding: "14px 16px",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: k.accent, opacity: 0.7 }} />
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#475569", textTransform: "uppercase", marginBottom: 8 }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: k.accent, letterSpacing: -1 }}>{k.value}</div>
                <div style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* FREE TIER BAR */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 11 }}>
              <span style={{ color: "#94a3b8" }}>Groq Free Tier Usage (hoy)</span>
              <span style={{ color: stats.freePct > 80 ? "#f87171" : "#22d3ee" }}>{stats.freePct}% usado</span>
            </div>
            <div style={{ background: "#1e293b", borderRadius: 4, height: 8, overflow: "hidden" }}>
              <div style={{
                width: `${stats.freePct}%`,
                height: "100%",
                background: stats.freePct > 80 ? "linear-gradient(90deg,#f87171,#ef4444)" : "linear-gradient(90deg,#22d3ee,#818cf8)",
                borderRadius: 4,
                transition: "width 0.5s ease",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#475569", marginTop: 8 }}>
              <span>0</span>
              <span style={{ color: "#64748b" }}>⚠ 80%: considera routing</span>
              <span>{GROQ_FREE_LIMIT.toLocaleString()}</span>
            </div>
          </div>

          {/* CHARTS ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Por Feature</div>
              <DonutChart data={stats.byFeature} colors={featureColors} />
            </div>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Por Modelo</div>
              <DonutChart data={stats.byModel} colors={modelColors} />
            </div>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Trend (tokens)</div>
              <Sparkline data={sparkData} color="#22d3ee" height={50} />
              <div style={{ fontSize: 10, color: "#334155", marginTop: 8 }}>últimas {sparkData.length} llamadas</div>
            </div>
          </div>

          {/* TOP USERS */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Top usuarios por consumo</div>
            {Object.entries(stats.byUser).sort((a, b) => b[1] - a[1]).map(([uid, toks], i) => {
              const pct = Math.round((toks / stats.totalTokens) * 100);
              return (
                <div key={uid} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: "#475569", width: 20 }}>#{i + 1}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", width: 80 }}>{uid}</div>
                  <div style={{ flex: 1, background: "#1e293b", borderRadius: 3, height: 6, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: featureColors[i % featureColors.length], borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", width: 60, textAlign: "right" }}>{toks.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: "#334155", width: 30, textAlign: "right" }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================== CHAT =================== */}
      {activeTab === "chat" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 12, height: "60vh" }}>
          {/* Chat Window */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#475569" }}>
              <span style={{ letterSpacing: 2, textTransform: "uppercase" }}>Chat · llama3-8b-8192</span>
              <span>{sessionTokens.calls} llamadas · {sessionTokens.total.toLocaleString()} tokens</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "80%",
                    background: m.role === "user" ? "#1e3a5f" : "#131d2e",
                    border: `1px solid ${m.role === "user" ? "#1d4ed8" : "#1e293b"}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 12,
                    color: "#e2e8f0",
                    lineHeight: 1.5,
                  }}>
                    {m.text}
                  </div>
                  {m.usage && (
                    <div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 10, color: "#334155" }}>
                      <span style={{ color: m.cached ? "#34d399" : "#475569" }}>{m.cached ? "⚡ cached" : "↑ live"}</span>
                      <span>in:{m.usage.inputTokens}</span>
                      <span>out:{m.usage.outputTokens}</span>
                      <span style={{ color: "#22d3ee" }}>={m.usage.totalTokens}tk</span>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#475569" }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[0, 1, 2].map((j) => (
                      <div key={j} style={{
                        width: 5, height: 5, borderRadius: "50%", background: "#22d3ee",
                        animation: `bounce 1s ease ${j * 0.15}s infinite`,
                      }} />
                    ))}
                  </div>
                  procesando...
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: 12, borderTop: "1px solid #1e293b", display: "flex", gap: 8 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Escribe un mensaje..."
                style={{
                  flex: 1, background: "#131d2e", border: "1px solid #1e293b", borderRadius: 6,
                  padding: "8px 12px", color: "#e2e8f0", fontSize: 12, fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
                background: loading ? "#1e293b" : "#1d4ed8",
                border: "none", borderRadius: 6, padding: "8px 16px",
                color: "#e2e8f0", fontSize: 11, cursor: loading ? "default" : "pointer",
                fontFamily: "inherit", letterSpacing: 1,
              }}>
                SEND
              </button>
            </div>
          </div>

          {/* Session Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#475569", textTransform: "uppercase", marginBottom: 12 }}>Sesión actual</div>
              {[
                { label: "Input tokens", value: sessionTokens.input, color: "#818cf8" },
                { label: "Output tokens", value: sessionTokens.output, color: "#22d3ee" },
                { label: "Total tokens", value: sessionTokens.total, color: "#f472b6" },
                { label: "Llamadas LLM", value: sessionTokens.calls, color: "#34d399" },
                { label: "Caché hits", value: sessionTokens.cached, color: "#fb923c" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
                  <span style={{ color: "#64748b" }}>{s.label}</span>
                  <span style={{ color: s.color, fontWeight: 700 }}>{s.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>Costo sesión</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#34d399" }}>$0.00</div>
              <div style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>Groq free tier activo</div>
            </div>
            <div style={{ background: "#0f1a0f", border: "1px solid #14532d", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, color: "#16a34a", marginBottom: 6 }}>💡 Consejo</div>
              <div style={{ fontSize: 10, color: "#4ade80", lineHeight: 1.5 }}>
                Cada turno consume ~{sessionTokens.calls > 0 ? Math.round(sessionTokens.total / sessionTokens.calls) : 0} tokens en promedio. Implementa resumen cada 20 mensajes para ahorrar 70%+.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================== LOGS =================== */}
      {activeTab === "logs" && (
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #1e293b", fontSize: 10, color: "#475569", letterSpacing: 2, textTransform: "uppercase", display: "flex", justifyContent: "space-between" }}>
            <span>Eventos recientes</span>
            <span>{liveEvents.length} registros</span>
          </div>
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1e293b" }}>
                  {["Tiempo", "Usuario", "Modelo", "Feature", "Input", "Output", "Total", "Caché"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#475569", fontWeight: 400, letterSpacing: 1, fontSize: 10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liveEvents.slice(0, 40).map((e, i) => (
                  <tr key={e.id} style={{ borderBottom: "1px solid #0f172a", background: i === 0 ? "#0d1f3c" : "transparent" }}>
                    <td style={{ padding: "8px 12px", color: "#475569" }}>{new Date(e.createdAt).toLocaleTimeString()}</td>
                    <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{e.customerId}</td>
                    <td style={{ padding: "8px 12px", color: "#818cf8", fontSize: 10 }}>{e.model}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ background: "#1e293b", borderRadius: 4, padding: "2px 6px", color: "#94a3b8", fontSize: 10 }}>{e.feature}</span>
                    </td>
                    <td style={{ padding: "8px 12px", color: "#64748b" }}>{e.inputTokens}</td>
                    <td style={{ padding: "8px 12px", color: "#64748b" }}>{e.outputTokens}</td>
                    <td style={{ padding: "8px 12px", color: "#22d3ee", fontWeight: 700 }}>{e.totalTokens}</td>
                    <td style={{ padding: "8px 12px" }}>
                      {e.cached ? <span style={{ color: "#34d399" }}>⚡ hit</span> : <span style={{ color: "#334155" }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================== ROUTING =================== */}
      {activeTab === "routing" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Lógica de routing actual</div>
            {[
              { cond: "estimatedTokens < 500 && feature === 'chat'", model: "groq/llama3-8b", color: "#34d399", label: "GRATIS" },
              { cond: "feature === 'resumen' || feature === 'FAQ'", model: "groq/gemma2-9b", color: "#34d399", label: "GRATIS" },
              { cond: "freePct > 80 || userPlan === 'pro'", model: "openai/gpt-4o-mini", color: "#fb923c", label: "PAGO" },
              { cond: "taskType === 'reasoning' || complexity === 'high'", model: "anthropic/claude-haiku", color: "#f472b6", label: "PAGO" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, padding: "10px 14px", background: "#0a1628", borderRadius: 8, border: "1px solid #1e293b" }}>
                <div style={{ fontSize: 10, color: "#334155", width: 20 }}>if</div>
                <div style={{ flex: 1, fontSize: 11, color: "#818cf8", fontFamily: "monospace" }}>{r.cond}</div>
                <div style={{ fontSize: 10, color: "#475569" }}>→</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.model}</div>
                <span style={{ background: r.color === "#34d399" ? "#052e16" : "#2d1a0e", color: r.color, fontSize: 9, borderRadius: 4, padding: "2px 6px", letterSpacing: 1 }}>
                  {r.label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>SQL para guardar eventos (Neon)</div>
            <pre style={{ background: "#070d1a", padding: 14, borderRadius: 8, fontSize: 10, color: "#22d3ee", overflowX: "auto", lineHeight: 1.6, margin: 0 }}>{`CREATE TABLE ai_usage_events (
  id          BIGSERIAL PRIMARY KEY,
  customer_id TEXT NOT NULL,
  user_id     TEXT,
  conv_id     TEXT,
  feature     TEXT DEFAULT 'chat',
  model       TEXT NOT NULL,
  input_tks   INT,
  output_tks  INT,
  total_tks   INT,
  cost_usd    NUMERIC(10,6) DEFAULT 0,
  cached      BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries rápidas
CREATE INDEX ON ai_usage_events (customer_id, created_at);
CREATE INDEX ON ai_usage_events (created_at);`}</pre>
          </div>

          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Código de integración (Vercel AI SDK)</div>
            <pre style={{ background: "#070d1a", padding: 14, borderRadius: 8, fontSize: 10, color: "#a5f3fc", overflowX: "auto", lineHeight: 1.6, margin: 0 }}>{`// lib/track-usage.ts
export async function trackUsage(db, data) {
  const { customerId, model, feature,
          inputTokens, outputTokens,
          cached, convId } = data;
  
  const total = inputTokens + outputTokens;
  const cost  = (inputTokens / 1000) * MODEL_PRICES[model]?.input
              + (outputTokens / 1000) * MODEL_PRICES[model]?.output;

  await db.sql\`
    INSERT INTO ai_usage_events
      (customer_id, model, feature,
       input_tks, output_tks, total_tks,
       cost_usd, cached, conv_id)
    VALUES (\${customerId}, \${model}, \${feature},
            \${inputTokens}, \${outputTokens}, \${total},
            \${cost}, \${cached}, \${convId})
  \`;
}

// En tu ruta de chat:
const result = await agent.generate({ prompt });
await trackUsage(db, {
  customerId: session.userId,
  model: "llama3-8b-8192",
  feature: "chat",
  inputTokens: result.usage.inputTokens,
  outputTokens: result.usage.outputTokens,
  cached: false,
  convId: conversationId,
});`}</pre>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
      `}</style>
    </div>
  );
}
