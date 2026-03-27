"use client";

import { Outfit, Space_Mono } from "next/font/google";
import { useCallback, useEffect, useRef, useState } from "react";
import { VIAJE_URL_STEPS } from "./viaje-url-steps";
import { createSubstepTimers } from "./viaje-url-timers";
import "./viaje-url.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export type ViajeUrlAnimationProps = {
  embedded?: boolean;
  titleFromLesson?: string;
  className?: string;
};

export function ViajeUrlAnimation({
  embedded,
  titleFromLesson,
  className,
}: ViajeUrlAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [replayKey, setReplayKey] = useState(0);

  const subTimersRef = useRef(createSubstepTimers());

  const dotBarRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageBadgeRef = useRef<HTMLDivElement>(null);
  const stepNumberRef = useRef<HTMLDivElement>(null);
  const stepTitleRef = useRef<HTMLHeadingElement>(null);
  const stepTaglineRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);
  const animAreaRef = useRef<HTMLDivElement>(null);
  const extraContentRef = useRef<HTMLDivElement>(null);
  const substepsContainerRef = useRef<HTMLDivElement>(null);
  const ctrlInfoRef = useRef<HTMLDivElement>(null);
  const btnPrevRef = useRef<HTMLButtonElement>(null);
  const btnNextRef = useRef<HTMLButtonElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const buildDots = useCallback(() => {
    const bar = dotBarRef.current;
    if (!bar) return;
    bar.innerHTML = "";
    VIAJE_URL_STEPS.forEach((s, i) => {
      const d = document.createElement("div");
      d.className =
        "sc-dot" +
        (i < currentStep ? " done" : i === currentStep ? " active" : "");
      d.style.background =
        i === currentStep ? s.color : i < currentStep ? s.color + "66" : "";
      d.onclick = () => {
        setCurrentStep(i);
      };
      bar.appendChild(d);
    });
  }, [currentStep]);

  const renderStep = useCallback(() => {
    subTimersRef.current.clear();

    const s = VIAJE_URL_STEPS[currentStep];
    const isLast = currentStep === VIAJE_URL_STEPS.length - 1;
    const isFirst = currentStep === 0;

    buildDots();

    const badge = stageBadgeRef.current;
    const stepNumber = stepNumberRef.current;
    const title = stepTitleRef.current;
    const tagline = stepTaglineRef.current;
    const explanation = explanationRef.current;
    const ctrlInfo = ctrlInfoRef.current;
    const anim = animAreaRef.current;
    const extra = extraContentRef.current;
    const sc = substepsContainerRef.current;
    const btnPrev = btnPrevRef.current;
    const btnNext = btnNextRef.current;
    const stage = stageRef.current;
    const dotBar = dotBarRef.current;
    const summary = summaryRef.current;

    if (
      !badge ||
      !stepNumber ||
      !title ||
      !tagline ||
      !explanation ||
      !ctrlInfo ||
      !anim ||
      !extra ||
      !sc ||
      !btnPrev ||
      !btnNext ||
      !stage ||
      !dotBar ||
      !summary
    ) {
      return;
    }

    stage.style.display = "";
    dotBar.style.display = "";

    badge.textContent = s.badge;
    badge.style.borderColor = s.color + "88";
    badge.style.boxShadow = `0 0 16px ${s.color}44`;

    stepNumber.textContent = `PASO ${currentStep + 1} DE ${VIAJE_URL_STEPS.length}`;
    title.textContent = s.title;
    title.style.color = s.color;

    tagline.textContent = s.tagline;
    explanation.innerHTML = s.explanation;
    ctrlInfo.textContent = s.ctrlInfo;

    anim.innerHTML = "";
    s.buildAnim(anim, s.color, subTimersRef.current);

    extra.innerHTML = "";
    if (s.extraContent) s.extraContent(extra, s.color, subTimersRef.current);

    sc.innerHTML = "";
    s.substeps.forEach((sub, i) => {
      const div = document.createElement("div");
      div.className = "substep";
      div.style.color = sub.color;
      div.innerHTML = `
      <div class="substep-num">${i + 1}</div>
      <div class="substep-text">${sub.text}</div>
    `;
      sc.appendChild(div);
      subTimersRef.current.push(
        globalThis.setTimeout(() => div.classList.add("visible"), 600 + i * 700)
      );
    });

    btnPrev.style.display = isFirst ? "none" : "";
    btnNext.textContent = isLast ? "✓ Ver Resumen →" : "Siguiente →";
    btnNext.disabled = false;

    summary.classList.remove("show");

    if (!embedded) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [buildDots, currentStep, embedded]);

  useEffect(() => {
    renderStep();
  }, [currentStep, replayKey, renderStep]);

  useEffect(() => {
    return () => subTimersRef.current.clear();
  }, []);

  const goStep = (dir: number) => {
    const next = currentStep + dir;
    if (next < 0) return;
    if (next >= VIAJE_URL_STEPS.length) {
      subTimersRef.current.clear();
      const stage = stageRef.current;
      const dotBar = dotBarRef.current;
      const summary = summaryRef.current;
      if (stage) stage.style.display = "none";
      if (dotBar) dotBar.style.display = "none";
      if (summary) summary.classList.add("show");
      if (!embedded) window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setCurrentStep(next);
  };

  const replayStep = () => setReplayKey((k) => k + 1);

  const restartFromSummary = () => {
    setCurrentStep(0);
    const stage = stageRef.current;
    const dotBar = dotBarRef.current;
    if (stage) stage.style.display = "";
    if (dotBar) dotBar.style.display = "";
    if (summaryRef.current) summaryRef.current.classList.remove("show");
  };

  const hideHero =
    embedded &&
    titleFromLesson &&
    titleFromLesson.toLowerCase().includes("viaje");

  return (
    <div
      className={`viajeUrlAnim relative ${outfit.variable} ${spaceMono.variable} ${className ?? ""}`}
    >
      <div className="shell">
        {!hideHero && (
          <div className="hero">
            <div className="hero-eyebrow">AI SaaS Engineering Bootcamp · Módulo 1</div>
            <h1>El Viaje de una URL</h1>
            <p className="hero-desc">
              Desde que escribes <code>kaledsoft.tech</code> hasta que ves el dashboard.
              <br />
              Paso a paso. Sin saltarnos nada.
            </p>
          </div>
        )}

        <div ref={dotBarRef} className="step-counter" />

        <div ref={stageRef} className="stage">
          <div className="stage-top">
            <div ref={stageBadgeRef} className="step-badge">
              💻
            </div>
            <div className="step-meta">
              <div ref={stepNumberRef} className="step-number">
                PASO 1 DE 7
              </div>
              <h2 ref={stepTitleRef} className="step-title">
                …
              </h2>
              <div ref={stepTaglineRef} className="step-tagline" />
            </div>
          </div>

          <div ref={animAreaRef} className="anim-area" />

          <div ref={explanationRef} className="explanation" />
          <div ref={extraContentRef} />

          <div ref={substepsContainerRef} className="substeps" />

          <div className="controls">
            <div ref={ctrlInfoRef} className="ctrl-info" />
            <div className="ctrl-buttons">
              <button type="button" className="btn btn-replay" onClick={replayStep}>
                ↺
              </button>
              <button
                ref={btnPrevRef}
                type="button"
                className="btn btn-prev"
                onClick={() => goStep(-1)}
              >
                ← Anterior
              </button>
              <button
                ref={btnNextRef}
                type="button"
                className="btn btn-next"
                onClick={() => goStep(1)}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>

        <div ref={summaryRef} className="summary">
          <div className="summary-title">⚡ Resumen: el viaje completo</div>
          <div className="summary-row">
            <div className="sum-icon">💻</div>
            <div className="sum-body">
              <div className="sum-name" style={{ color: "var(--ip)" }}>
                Dirección IP — Tu computadora
              </div>
              <div className="sum-desc">
                Tu PC tiene una IP privada (ej. 192.168.1.5) asignada por el router via DHCP. El
                router tiene una IP pública que es la visible en internet.
              </div>
            </div>
            <div className="sum-time" style={{ color: "var(--ip)" }}>
              ~0ms
            </div>
          </div>
          <div className="summary-row">
            <div className="sum-icon">🌐</div>
            <div className="sum-body">
              <div className="sum-name" style={{ color: "var(--dns)" }}>
                DNS — Traducción de nombre a IP
              </div>
              <div className="sum-desc">
                kaledsoft.tech → 93.184.216.34. Tu OS consulta la jerarquía DNS: cache → resolver →
                root → TLD → autoritativo.
              </div>
            </div>
            <div className="sum-time" style={{ color: "var(--dns)" }}>
              ~10ms
            </div>
          </div>
          <div className="summary-row">
            <div className="sum-icon">🤝</div>
            <div className="sum-body">
              <div className="sum-name" style={{ color: "var(--tcp)" }}>
                TCP — Conexión confiable
              </div>
              <div className="sum-desc">
                3-way handshake (SYN → SYN-ACK → ACK). Garantiza que los paquetes lleguen en orden
                y completos.
              </div>
            </div>
            <div className="sum-time" style={{ color: "var(--tcp)" }}>
              ~80ms
            </div>
          </div>
          <div className="summary-row">
            <div className="sum-icon">🔐</div>
            <div className="sum-body">
              <div className="sum-name" style={{ color: "var(--tls)" }}>
                TLS — Cifrado del canal
              </div>
              <div className="sum-desc">
                El candado 🔒. Negocia claves de cifrado. Nadie en el camino puede leer tus datos.
              </div>
            </div>
            <div className="sum-time" style={{ color: "var(--tls)" }}>
              ~120ms
            </div>
          </div>
          <div className="summary-row">
            <div className="sum-icon">📡</div>
            <div className="sum-body">
              <div className="sum-name" style={{ color: "var(--http)" }}>
                HTTP/2 — La petición
              </div>
              <div className="sum-desc">
                GET /dashboard con headers. El servidor responde 200 OK + HTML. Multiplexing permite
                múltiples assets en paralelo.
              </div>
            </div>
            <div className="sum-time" style={{ color: "var(--http)" }}>
              ~200ms
            </div>
          </div>
          <div className="summary-row">
            <div className="sum-icon">🌍</div>
            <div className="sum-body">
              <div className="sum-name" style={{ color: "var(--cdn)" }}>
                CDN — Servidor más cercano
              </div>
              <div className="sum-desc">
                Cloudflare/Vercel Edge sirve el contenido desde el nodo más cercano a ti. Sin CDN
                serías 150ms+ más lento.
              </div>
            </div>
            <div className="sum-time" style={{ color: "var(--cdn)" }}>
              ~12ms
            </div>
          </div>
          <div className="summary-row">
            <div className="sum-icon">🖥️</div>
            <div className="sum-body">
              <div className="sum-name" style={{ color: "var(--browser)" }}>
                Browser — Render final
              </div>
              <div className="sum-desc">
                HTML → DOM, CSS → CSSOM, JS ejecutado. Paint y composite. Ves la página. Total: ~380ms
                desde el primer keystroke.
              </div>
            </div>
            <div className="sum-time" style={{ color: "var(--browser)" }}>
              ~380ms
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button type="button" className="btn btn-next" onClick={restartFromSummary}>
              ↺ Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
