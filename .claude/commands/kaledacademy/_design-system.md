# Sistema de Diseño — HTML Lecciones KaledAcademy

> Reglas de diseño que TODOS los HTML generados por `/kaledacademy:animate` deben respetar. Verificadas contra `docs/Temas/tema_1_viaje_url.html` (que ya funciona en producción).

---

## Paleta de colores (CSS Variables)

```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #111827;
  --bg-card: #1a1f2e;
  --accent-cyan: #06b6d4;
  --accent-blue: #3b82f6;
  --accent-purple: #8b5cf6;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border: #1e293b;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
}
```

## Tipografía

- **Títulos:** `'Syne', sans-serif` (Google Fonts)
- **Código:** `'JetBrains Mono', monospace` (Google Fonts)
- **Cuerpo:** `'Inter', sans-serif` como fallback

Importa desde Google Fonts en el `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400..800&family=JetBrains+Mono&family=Inter:wght@400..700&display=swap" rel="stylesheet">
```

---

## Estructura obligatoria del HTML

- Un solo archivo `.html` autocontenido (sin dependencias locales)
- `<!DOCTYPE html>` + `<html lang="es">`
- Dark theme con la paleta de arriba
- Navegación por slides con dots clicables y teclado (flechas ← →)
- Solo un slide visible a la vez (`display: none` en los demás)
- Animaciones de entrada escalonadas con `setTimeout`
- **Variable según complejidad: 7-12 slides por lección**

### Esqueleto base

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>[Título de la lección]</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400..800&family=JetBrains+Mono&family=Inter:wght@400..700&display=swap" rel="stylesheet">
  <style>/* CSS variables, reset, layout, slides, dots, animaciones */</style>
</head>
<body>
  <div class="lesson-shell">
    <div id="slide-1" class="slide active">...</div>
    <div id="slide-2" class="slide">...</div>
    <!-- etc -->

    <nav class="dots">
      <button data-slide="1" class="dot active"></button>
      <button data-slide="2" class="dot"></button>
      <!-- etc -->
    </nav>
  </div>
  <script>/* JS moderno: const, let, arrow, template literals */</script>
</body>
</html>
```

---

## Reglas de JavaScript — JS MODERNO

> ⚠️ El doc original del proyecto decía "solo `var`, sin arrow functions, sin template literals". **ESO ESTÁ OBSOLETO.** Verificado contra `docs/Temas/tema_1_viaje_url.html` que usa 112+ ocurrencias de const/let/arrow sin problema en producción.

### CORRECTO (usar siempre)

- ✅ `const` y `let` (no `var`)
- ✅ Arrow functions: `const handler = () => { ... }`
- ✅ Template literals: `` `Hola ${nombre}` ``
- ✅ Destructuring: `const { id, name } = data`
- ✅ Spread/rest: `[...items]`
- ✅ Métodos modernos de array: `.map()`, `.filter()`, `.reduce()`, `.find()`
- ✅ `addEventListener` para todos los handlers (mejor que `onclick=` inline cuando se puede)

### EVITAR

- ❌ Dependencias externas vía `<script src="">` que apunte a algo que no sea CDN público
- ❌ Globals contaminantes — envolver todo en una IIFE o módulo si es muy largo
- ❌ Frameworks (jQuery, React, Vue) — el HTML es 100% vanilla

---

## Patrón de animación de entrada (escalonada)

Cada slide tiene elementos con clase `.animate-item` que aparecen escalonados al entrar:

```javascript
function animateSlideIn(slideEl) {
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
}
```

---

## Patrón de reset de estado (CRÍTICO)

**Cualquier slide interactivo** (con contadores, toggles, simuladores, etc.) debe tener una función `resetSlideN()` que:

1. Reinicie todas las variables de estado del slide
2. Restaure el DOM al estado inicial
3. Se llame automáticamente en `goToSlide(N)` cuando el usuario navega de vuelta a ese slide

```javascript
let currentStep4 = 0;

function resetSlide4() {
  currentStep4 = 0;
  document.getElementById('step-display').innerHTML = stepsData[0].html;
  document.getElementById('step-num').textContent = '1';
}

function goToSlide(n) {
  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
  document.getElementById(`slide-${n}`).classList.add('active');
  document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
  document.querySelector(`.dot[data-slide="${n}"]`).classList.add('active');

  // Resets por slide
  if (n === 4) resetSlide4();
  if (n === 6) resetSlide6();
  // etc

  // Animación de entrada
  animateSlideIn(document.getElementById(`slide-${n}`));
}
```

---

## Navegación obligatoria

```javascript
// Click en dots
document.querySelectorAll('.dot').forEach(dot => {
  dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.slide, 10)));
});

// Flechas del teclado
document.addEventListener('keydown', (e) => {
  const current = parseInt(document.querySelector('.dot.active').dataset.slide, 10);
  if (e.key === 'ArrowRight' && current < TOTAL_SLIDES) goToSlide(current + 1);
  if (e.key === 'ArrowLeft' && current > 1) goToSlide(current - 1);
});
```

---

## Elementos interactivos por tipo de concepto

| Concepto                | Elemento sugerido                                |
|-------------------------|--------------------------------------------------|
| Flujos de datos         | Diagrama paso a paso con botón "siguiente"      |
| Comparaciones           | Toggle A/B                                       |
| Métricas                | Barra de progreso animada o contador             |
| Arquitectura            | Diagrama de cajas con hover-tooltips             |
| Código                  | Bloque con syntax highlight simulado             |
| Simuladores             | Mini-formulario con resultado en tiempo real     |
| Línea de tiempo         | Stepper horizontal con eventos                   |
| Comparativa de tiempos  | Dos contadores animados lado a lado              |

Snippets concretos de cada uno → `kaledacademy-html-builder` skill.

---

## Checklist final antes de entregar el HTML

- [ ] Es un solo archivo `.html` autocontenido
- [ ] Usa la paleta de colores definida arriba
- [ ] Importa Syne, JetBrains Mono e Inter desde Google Fonts
- [ ] Tiene entre 7 y 12 slides según complejidad del tema
- [ ] Navegación por dots funciona
- [ ] Navegación por flechas ← → funciona
- [ ] Solo un slide visible a la vez
- [ ] Cada slide interactivo tiene su `resetSlideN()` y se llama en `goToSlide()`
- [ ] Animación de entrada escalonada en cada slide
- [ ] **Mínimo 3 slides con narrativa KaledSoft** (varía el producto: KaledDental, KaledWash, KaledPark)
- [ ] JS moderno: const/let/arrow/template literals (NO var)
- [ ] Cero dependencias locales (ok CDN público)
- [ ] El archivo abre directo en navegador con doble clic
