"use client";

import { Outfit, Space_Mono } from "next/font/google";
import { useCallback, useEffect, useRef, useState } from "react";
import { HTTP_CS_STEPS } from "./http-cs-steps";
import { createSubstepTimers } from "./http-cs-timers";
import "./http-cliente-servidor.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export type HttpClienteServidorAnimationProps = {
  embedded?: boolean;
  titleFromLesson?: string;
  className?: string;
};

export function HttpClienteServidorAnimation({
  embedded,
  titleFromLesson,
  className,
}: HttpClienteServidorAnimationProps) {
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
    HTTP_CS_STEPS.forEach((s, i) => {
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

    const s = HTTP_CS_STEPS[currentStep];
    const isLast = currentStep === HTTP_CS_STEPS.length - 1;
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

    stepNumber.textContent = `PASO ${currentStep + 1} DE ${HTTP_CS_STEPS.length}`;
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
    if (next >= HTTP_CS_STEPS.length) {
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

  const t = titleFromLesson?.toLowerCase() ?? "";
  const hideHero =
    embedded && (t.includes("http") || t.includes("cliente") || t.includes("servidor"));

  return (
    <div
      className={`httpCsAnim relative ${outfit.variable} ${spaceMono.variable} ${className ?? ""}`}
    >
      <div className="shell">
        {!hideHero && (
          <div className="hero">
            <div className="hero-eyebrow">AI SaaS Engineering Bootcamp · Módulo 1</div>
            <h1>HTTP y el modelo cliente-servidor</h1>
            <p className="hero-desc">
              Cómo se hablan el navegador y el servidor. Sin jerga innecesaria.
            </p>
          </div>
        )}

        <div ref={dotBarRef} className="step-counter" />

        <div ref={stageRef} className="stage">
          <div className="stage-top">
            <div ref={stageBadgeRef} className="step-badge">
              📜
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
          <div className="summary-title">Resumen: HTTP en contexto</div>
          <div className="summary-row">
            <div className="sum-icon">📜</div>
            <div className="sum-body">
              <div className="sum-name" style={{ color: "#00f5c4" }}>
                Historia mínima
              </div>
              <div className="sum-desc">
                Red → paquetes (TCP/IP) → nombres (DNS) → conversaciones web (HTTP).
              </div>
            </div>
          </div>
          <div className="summary-row">
            <div className="sum-icon">📦</div>
            <div className="sum-body">
              <div className="sum-name" style={{ color: "#f59e0b" }}>
                Paquetes
              </div>
              <div className="sum-desc">
                Los datos van troceados con origen y destino; hay ida y vuelta entre cliente y servidor.
              </div>
            </div>
          </div>
          <div className="summary-row">
            <div className="sum-icon">⚖️</div>
            <div className="sum-body">
              <div className="sum-name" style={{ color: "#7c3aed" }}>
                Cliente / servidor
              </div>
              <div className="sum-desc">
                El navegador pide; el servidor atiende. Los roles dependen de quién inicia la petición.
              </div>
            </div>
          </div>
          <div className="summary-row">
            <div className="sum-icon">🌐</div>
            <div className="sum-body">
              <div className="sum-name" style={{ color: "#38bdf8" }}>
                HTTP
              </div>
              <div className="sum-desc">
                Formato estándar de petición y respuesta en la web (p. ej. pedir una página y recibir HTML).
              </div>
            </div>
          </div>
          <div className="summary-row">
            <div className="sum-icon">↔️</div>
            <div className="sum-body">
              <div className="sum-name" style={{ color: "#f472b6" }}>
                Request / response
              </div>
              <div className="sum-desc">
                Un ciclo: envío (GET u otro método) y respuesta con código (200 éxito, errores después).
              </div>
            </div>
          </div>
          <div className="summary-row">
            <div className="sum-icon">🔤</div>
            <div className="sum-body">
              <div className="sum-name" style={{ color: "#a78bfa" }}>
                Métodos
              </div>
              <div className="sum-desc">
                GET, POST, PUT, DELETE… la misma ruta puede usarse con intenciones distintas.
              </div>
            </div>
          </div>
          <div className="summary-row">
            <div className="sum-icon">🎓</div>
            <div className="sum-body">
              <div className="sum-name" style={{ color: "#34d399" }}>
                Siguiente
              </div>
              <div className="sum-desc">
                Más adelante: herramientas de desarrollo, formularios, datos y seguridad sobre esta base.
              </div>
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
