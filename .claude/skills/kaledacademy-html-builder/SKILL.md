---
name: kaledacademy-html-builder
description: Patrones JavaScript modernos reutilizables para construir los elementos interactivos más comunes en las lecciones HTML del bootcamp KaledAcademy (toggles, diagramas paso a paso, quizzes inmediatos, animaciones escalonadas, dispatchers de reset). Úsalo cuando estés generando HTML interactivo con /kaledacademy:animate.
---

# Skill: Constructor de Lecciones HTML

## Propósito

Snippets JS modernos listos para copiar dentro del HTML de una lección. Todos respetan el sistema de diseño definido en `.claude/commands/kaledacademy/_design-system.md` (paleta, tipografía, JS moderno con const/let/arrow/template literals).

## Cuándo usar cada patrón

| Concepto a enseñar         | Patrón                          |
|---------------------------|---------------------------------|
| Comparaciones (A vs B)    | Toggle A/B                      |
| Flujos paso a paso        | Diagrama paso a paso (stepper)  |
| Validación de comprensión | Quiz con feedback inmediato     |
| Métricas / contadores     | Contador animado                |
| Arquitecturas             | Diagrama con tooltips           |
| Línea de tiempo           | Stepper horizontal              |

---

## Patrón 1: Toggle A/B (comparación)

Para enseñar comparaciones (GET vs POST, SQL vs NoSQL, SSR vs SSG, var vs let, etc.).

```html
<div class="toggle-container">
  <button class="toggle-btn active" data-option="a">Opción A</button>
  <button class="toggle-btn" data-option="b">Opción B</button>
</div>
<div id="panel-a" class="panel"><!-- contenido A --></div>
<div id="panel-b" class="panel" style="display:none"><!-- contenido B --></div>
```

```javascript
const setToggle = (option) => {
  document.getElementById('panel-a').style.display = option === 'a' ? 'block' : 'none';
  document.getElementById('panel-b').style.display = option === 'b' ? 'block' : 'none';
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.option === option);
  });
};

document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => setToggle(btn.dataset.option));
});
```

---

## Patrón 2: Diagrama paso a paso (stepper)

Para flujos como ciclo request/response, pipeline de datos, vida de un commit, etc.

```html
<div class="stepper-container">
  <div id="step-display"><!-- contenido del paso actual --></div>
  <div class="step-counter">Paso <span id="step-num">1</span> de <span id="step-total">5</span></div>
  <div class="step-controls">
    <button id="step-prev">← Anterior</button>
    <button id="step-next">Siguiente →</button>
  </div>
</div>
```

```javascript
const stepsData5 = [
  { titulo: 'Tu PC', descripcion: 'Escribes la URL y presionas Enter.', icon: '💻' },
  { titulo: 'DNS', descripcion: 'El navegador pregunta: ¿qué IP es kaleddental.com?', icon: '🌐' },
  // ...
];

let currentStep5 = 0;

const renderStep5 = (idx) => {
  const step = stepsData5[idx];
  document.getElementById('step-display').innerHTML = `
    <div class="step-icon">${step.icon}</div>
    <h3>${step.titulo}</h3>
    <p>${step.descripcion}</p>
  `;
  document.getElementById('step-num').textContent = idx + 1;
  document.getElementById('step-total').textContent = stepsData5.length;
  document.getElementById('step-prev').disabled = idx === 0;
  document.getElementById('step-next').disabled = idx === stepsData5.length - 1;
};

const nextStep5 = () => {
  if (currentStep5 < stepsData5.length - 1) {
    currentStep5++;
    renderStep5(currentStep5);
  }
};

const prevStep5 = () => {
  if (currentStep5 > 0) {
    currentStep5--;
    renderStep5(currentStep5);
  }
};

const resetSlide5 = () => {
  currentStep5 = 0;
  renderStep5(0);
};

document.getElementById('step-next').addEventListener('click', nextStep5);
document.getElementById('step-prev').addEventListener('click', prevStep5);
```

---

## Patrón 3: Quiz con feedback inmediato

Para validar comprensión dentro de la lección antes del quiz formal.

```html
<div class="quiz-block">
  <div class="quiz-question">¿Qué pasaría si KaledDental no validara los datos del paciente?</div>
  <div class="quiz-options">
    <button class="quiz-opt" data-correct="false">No pasa nada</button>
    <button class="quiz-opt" data-correct="true">La BD se llena de datos basura y los reportes mienten</button>
    <button class="quiz-opt" data-correct="false">Carga más rápido</button>
  </div>
  <div id="quiz-feedback" class="quiz-feedback"></div>
</div>
```

```javascript
const checkAnswer = (btn) => {
  const isCorrect = btn.dataset.correct === 'true';
  const feedback = document.getElementById('quiz-feedback');

  document.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);

  if (isCorrect) {
    btn.style.background = 'var(--success)';
    feedback.innerHTML = '✅ <strong>Correcto.</strong> Sin validación, cualquier formulario malformado contamina la BD.';
    feedback.style.color = 'var(--success)';
  } else {
    btn.style.background = 'var(--error)';
    feedback.innerHTML = '❌ <strong>No exactamente.</strong> Mira lo que pasaría con los reportes mensuales si los datos son inválidos.';
    feedback.style.color = 'var(--error)';
  }
};

document.querySelectorAll('.quiz-opt').forEach(btn => {
  btn.addEventListener('click', () => checkAnswer(btn));
});

const resetQuizSlide = () => {
  document.querySelectorAll('.quiz-opt').forEach(b => {
    b.disabled = false;
    b.style.background = '';
  });
  document.getElementById('quiz-feedback').innerHTML = '';
};
```

---

## Patrón 4: Contador animado

Para mostrar métricas de impacto (ms ahorrados, $ recuperados, queries reducidas).

```html
<div class="counter-block">
  <div class="counter-label">Tiempo ahorrado por usuario</div>
  <div id="counter-value" class="counter-value">0</div>
  <div class="counter-unit">milisegundos</div>
</div>
```

```javascript
const animateCounter = (target, duration = 2000) => {
  const el = document.getElementById('counter-value');
  const start = 0;
  const startTime = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.floor(start + (target - start) * progress);
    el.textContent = value.toLocaleString('es-CO');
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const resetCounterSlide = () => {
  document.getElementById('counter-value').textContent = '0';
};

// Disparar al entrar al slide
const startCounterSlide = () => {
  animateCounter(1850);
};
```

---

## Patrón 5: Animación de entrada escalonada

Aplicable a cualquier slide. Cada elemento con `.animate-item` aparece con delay creciente.

```javascript
const animateSlideIn = (slideEl) => {
  const elements = slideEl.querySelectorAll('.animate-item');
  elements.forEach((el, idx) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    setTimeout(() => {
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, idx * 150);
  });
};
```

---

## Patrón 6: Dispatcher de reset en `goToSlide`

Función central que conecta todos los resets. Cualquier slide interactivo debe registrar el suyo aquí.

```javascript
const TOTAL_SLIDES = 9;

const goToSlide = (n) => {
  if (n < 1 || n > TOTAL_SLIDES) return;

  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
  document.getElementById(`slide-${n}`).classList.add('active');

  document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
  document.querySelector(`.dot[data-slide="${n}"]`).classList.add('active');

  // Resets registrados por slide
  if (n === 4) resetSlide4();
  if (n === 5) resetSlide5();
  if (n === 6) resetQuizSlide();
  if (n === 7) {
    resetCounterSlide();
    startCounterSlide();
  }

  animateSlideIn(document.getElementById(`slide-${n}`));
};

// Navegación
document.querySelectorAll('.dot').forEach(dot => {
  dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.slide, 10)));
});

document.addEventListener('keydown', (e) => {
  const current = parseInt(document.querySelector('.dot.active').dataset.slide, 10);
  if (e.key === 'ArrowRight') goToSlide(current + 1);
  if (e.key === 'ArrowLeft') goToSlide(current - 1);
});
```

---

## Estilos CSS mínimos para los patrones

```css
.slide { display: none; padding: 2rem; }
.slide.active { display: block; }

.toggle-container { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.toggle-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}
.toggle-btn.active {
  background: var(--accent-cyan);
  color: var(--bg-primary);
  border-color: var(--accent-cyan);
}

.quiz-opt {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  margin: 0.5rem 0;
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}
.quiz-opt:hover:not(:disabled) { border-color: var(--accent-cyan); }
.quiz-opt:disabled { cursor: not-allowed; opacity: 0.7; }

.quiz-feedback { margin-top: 1rem; padding: 0.75rem; border-radius: 0.5rem; }

.counter-value {
  font-family: 'Syne', sans-serif;
  font-size: 4rem;
  color: var(--accent-cyan);
  font-weight: 800;
}

.dots { display: flex; gap: 0.5rem; justify-content: center; padding: 1rem; }
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--border);
  border: none;
  cursor: pointer;
}
.dot.active { background: var(--accent-cyan); }
```
