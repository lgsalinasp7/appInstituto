# Guía docente — Lección 6: Git con IA (criterio técnico)

Guía detallada para clase virtual (Zoom + plataforma + animación interactiva + Visual Studio Code / Cursor). Contenido alineado con la animación **Git con IA** (10 diapositivas en `git-con-ia.html`).

**Animación:** `public/interactive/git-con-ia.html`  
**Componente React:** `src/modules/academia/components/student/interactive-lessons/git-con-ia/GitConIaAnimation.tsx`  
**Producto en plataforma:** panel **Kaled revisa mi código** (revisión asistida por IA del código que el estudiante pega), alineado con el espíritu de la lección: la IA asiste; el criterio humano decide.

---

## 1. Mapa de la lección (10 slides)

| # | Tema | Qué deben retener los estudiantes |
|---|------|-----------------------------------|
| **1** | Portada | Git + IA: la IA es herramienta, no piloto; criterio técnico sobre cada sugerencia. |
| **2** | Par de programación | La IA complementa; no sustituye el juicio ni es la autoridad final. |
| **3** | Comandos peligrosos | Comandos que la IA sugiere a menudo y pueden **destruir trabajo**; no ejecutar sin entender (p. ej. `reset --hard`, force push, etc., según el guion de la animación). |
| **4** | 6 problemas frecuentes | Patrones reales cuando se usa IA para Git **sin supervisión** (mensajes confusos, historial roto, secretos, etc.). |
| **5** | Checklist pre-ejecución | **5 preguntas** antes de pulsar Enter en cualquier comando sugerido por IA. |
| **6** | Prompts correctos | Cómo **preguntar bien** a la IA sobre Git; calidad de la respuesta = calidad del contexto y de la pregunta. |
| **7** | Revertir errores | “Kit de supervivencia”: Git casi siempre ofrece salida (`revert`, `restore`, etc. — coherente con L4/L5). |
| **8** | `git blame` | Arqueología: quién escribió la línea y en qué commit (debug en productos tipo KaledDental). |
| **9** | Commits con IA | La IA puede **proponer** mensajes tipo Conventional Commits; el dev **valida** precisión y alcance. |
| **10** | Resumen | Balance velocidad vs criterio; repetir reglas de oro de L5 (main, PR) aplicadas al uso de IA. |

---

## 2. Prerrequisitos

- **Lecciones 4 y 5** (o equivalente): tres áreas, commits, ramas, PR, idea de historial y riesgos.
- Herramienta con IA (Cursor, Copilot, ChatGPT, etc.) **solo en modo supervisado** en clase demo.
- Opcional: que la lección en la plataforma tenga CRAL/quiz y el botón **Kaled revisa mi código** activo para practicar el flujo “pego diff o snippet → recibo feedback estructurado”.

---

## 3. Estructura sugerida de la sesión (90 min)

| Fase | Duración | Actividad |
|------|----------|-----------|
| Apertura | ~5 min | Diapositiva 1: “¿Quién ha copiado un comando de la IA sin leerlo?” |
| Marco mental | ~15 min | Diapositivas 2–3: par de programación + zona roja. |
| Patrones y checklist | ~20 min | Diapositivas 4–5: problemas frecuentes y checklist antes de Enter. |
| Práctica de prompts | ~15 min | Diapositiva 6: en vivo, mal vs buen prompt para un mismo error Git ficticio. |
| Recuperación y blame | ~15 min | Diapositivas 7–8: conectar con comandos ya vistos en L4. |
| Commits + IA + cierre | ~10 min | Diapositivas 9–10 + **Kaled revisa mi código** (pegar un `diff` o función y comentar el feedback en grupo). |

---

## 4. Demo docente — uso responsable de IA con Git

1. Mostrar un error típico (p. ej. “commit equivocado en rama equivocada”) y una sugerencia **peligrosa** de la IA en pantalla (sin ejecutarla).
2. Pasar el **checklist** de la diapositiva 5 en voz alta.
3. Reformular el prompt con **contexto**: rama actual, `git status`, objetivo (no solo “arréglalo”).
4. Ejecutar solo comandos **explicados** y preferiblemente reversibles.

---

## 5. Prácticas en VS Code (o Cursor)

### Ejercicio 1 — Checklist (~10 min)

- Inventar o usar un mensaje de IA genérico: “ejecuta `git reset --hard`”.
- Escribir en el chat grupal las 5 respuestas del checklist antes de aceptar o rechazar.

### Ejercicio 2 — Buen prompt (~15 min)

- Situación: “tengo cambios en staging que no quiero commitear todavía”.
- Mal prompt vs buen prompt (incluir `git status` pegado, nombre de rama, si hay remoto).

### Ejercicio 3 — `git blame` (~10 min)

- Abrir un archivo del proyecto, línea de comando o extensión GitLens.
- Preguntar: “¿qué información te da que la IA no puede inventar?”

### Ejercicio 4 — Mensaje de commit (~10 min)

- Pedir a la IA un mensaje para un diff real **pequeño**.
- Corregir el mensaje si el tipo (`feat`/`fix`) o el scope no cuadran (L4).

### Ejercicio 5 — Kaled revisa mi código (~15 min)

- Pegar un snippet (sin secretos) en el panel de la plataforma.
- Leer en voz alta una fortaleza, una mejora y una pregunta socrática; debatir si están acertadas.

---

## 6. Preguntas de refuerzo

- ¿Por qué el prompt “arregla mi git” suele dar peores resultados que uno con `git status` y objetivo claro?
- ¿Qué puede salir mal si ejecutas ciegamente `git push --force`?
- ¿Quién es responsable del historial que queda en el repo: la IA o el dev?
- ¿Cuándo usarías `git revert` frente a editar historia con rebase interactivo en una rama compartida?

---

## 7. Seguridad y ética (recordatorio breve)

- No pegar **`.env`**, tokens ni datos personales en ningún chat de IA ni en “Kaled revisa mi código”.
- La revisión automática es **formativa**, no sustituto de revisión humana en PR (L5).

---

## 8. Enlaces con otras guías

- [Lección 4 — Control de versiones](./LECCION-4-GUIA-DOCENTE-GIT-CONTROL-VERSIONES.md)  
- [Lección 5 — Ramas y PR](./LECCION-5-GUIA-DOCENTE-GIT-RAMAS-PR.md)  
- [Índice lecciones 4–6](./LECCIONES-4-6-GUIA-DOCENTE-RESUMEN.md)

---

*Contenido alineado con `public/interactive/git-con-ia.html` (10 slides).*
