# Guía docente — Lección 5: Git, ramas, Pull Requests y colaboración

Guía detallada para clase virtual (Zoom + plataforma + animación interactiva + Visual Studio Code). Contenido alineado con la animación **Git: Ramas, Pull Requests y Colaboración** (11 diapositivas).

**Nota:** En el HTML del tema aparece la etiqueta “Tema 6 · Git Ramas & PRs”; en el plan docente se trata como **Lección 5** (secuencia Git tras control de versiones).

**Animación:** `public/interactive/git-ramas-pr.html`  
**Fuente HTML tema:** `docs/Temas/tema_5_git_ramas_pr.html`

---

## 1. Mapa de la lección (diapositivas)

| # | Título / tema | Qué deben retener los estudiantes |
|---|----------------|-----------------------------------|
| **1** | Portada | Colaboración profesional: ramas y PR para no pisarse ni romper producción; contexto KaledDental / KaledWash / KaledPark. |
| **2** | El problema | Sin ramas: varios devs en el mismo archivo → commits a `main` → sobrescritura y caída; con ramas: trabajo independiente y unión ordenada. |
| **3** | ¿Qué es una rama? | Copia paralela del código; `main` = oficial; tu rama = espacio seguro; **merge** = integrar cuando está listo y revisado. |
| **4** | Convención de nombres | `tipo/descripcion-corta`: `feature/`, `fix/`, `chore/`, `hotfix/` con ejemplos KaledSoft. |
| **5** | Comandos esenciales | `git checkout -b` (crear y cambiar), `git status`, `git add`, `git commit`, `git push origin <rama>`; `git checkout <rama>` para cambiar; `git branch` para ver rama actual. |
| **6** | Pull Request | Propuesta formal: “revisen antes de unir a main”; autor, rama origen/destino, diff, comentarios, aprobación, botón merge (la animación incluye simulación). |
| **7** | Merge conflict | Misma línea editada en dos sitios; marcadores `<<<<<<<`, `=======`, `>>>>>>>`; no es “error fatal”; 4 pasos: abrir en VS Code, decidir, borrar marcadores, `add` + `commit`. |
| **8** | Flujo completo KaledSoft | `checkout main && pull && checkout -b feature/...` → commits → `push` → PR en GitHub → review → merge → (mención) deploy Vercel. |
| **9** | Regla de oro | Nunca commit directo a `main`; siempre rama; siempre PR; `main` → producción real; PR como protección. |
| **10** | Resumen | Ramas; checkout/merge; PR; conflictos; convención; regla de oro. |
| **11** | Cierre | Práctica sugerida en animación: `feature/mi-primera-rama` → cambio → commit → push → abrir PR; próximo tema CI/CD (según cierre del HTML). |

---

## 2. Prerrequisitos recomendados

- Haber visto o practicado **Lección 4**: `git init` o clone, `status`, `add`, `commit`, idea de remoto.
- Cuenta **GitHub** (u host Git compatible con PR/MR).
- Git y VS Code instalados; opcional **GitLens**.

---

## 3. Estructura sugerida de la sesión (90–120 min)

| Fase | Duración | Actividad |
|------|----------|-----------|
| Apertura | ~5 min | Diapositiva 1–2: contraste “sin ramas / con ramas” con ejemplo de los tres productos. |
| Concepto | ~20 min | Diapositivas 3–4 (rama + nombres); 6 (PR — usar botón “Simular revisión” en vivo). |
| Conflicto | ~15 min | Diapositiva 7: leer el archivo de ejemplo; mostrar resolución en VS Code. |
| Flujo y regla | ~10 min | Diapositivas 8–9: un solo guion verbal que conecte con L4 (`pull`, `push`, `main` protegida). |
| Demo + práctica | ~35–45 min | Docente en GitHub + VS Code; estudiantes replican sección 5. |
| Cierre | ~5 min | Diapositivas 10–11 + quiz si aplica. |

---

## 4. Parte “aprender” — Demo del docente

### 4.1 Crear rama desde `main` actualizado (diapositivas 5 y 8)

En un repo clonado o local ya con `main`:

```bash
git switch main
git pull origin main
git switch -c feature/demo-saludo
```

*Alternativa clásica:* `git checkout main && git pull && git checkout -b feature/demo-saludo`

Mensaje clave: siempre partir de `main` (o `develop`, si el equipo usa GitFlow) **actualizado**.

### 4.2 Trabajar, commit, push (diapositiva 5)

```bash
# editar un archivo, por ejemplo README o src/demo.ts
git status
git add .
git commit -m "feat(demo): mensaje de bienvenida en consola"
git push -u origin feature/demo-saludo
```

En VS Code: mostrar la **rama actual** en la barra inferior y el panel Source Control al hacer commit.

### 4.3 Abrir Pull Request (diapositiva 6)

1. En GitHub: **Compare & pull request** o **New pull request**.
2. Base: `main` (o `develop`), compare: `feature/demo-saludo`.
3. Título y descripción claros; asignar revisor si es ejercicio en parejas.
4. Mostrar pestaña **Files changed** (+/- líneas).

### 4.4 Simular revisión (como la animación)

- Comentario del revisor en una línea.
- Autor sube commit adicional a la **misma rama** (el PR se actualiza solo).
- Aprobación y **Merge** (o squash merge, según política que enseñes).

### 4.5 Merge conflict en VS Code (diapositiva 7)

**Preparación (puede hacerse antes de clase con dos cuentas o dos carpetas):**

1. Rama A y Rama B modifican la **misma línea** de un mismo archivo.
2. Merge de B en A (o PR) hasta provocar conflicto.

**Resolución (4 pasos de la animación):**

1. Abrir el archivo con marcadores en VS Code.
2. Usar acciones “Accept Current / Incoming / Both” si aparecen, o editar a mano.
3. Eliminar todas las líneas `<<<<<<<`, `=======`, `>>>>>>>`.
4. Guardar, `git add .`, `git commit` (o completar merge con mensaje por defecto).

Mensaje clave: el conflicto es una **pregunta**, no borrado automático del trabajo ajeno.

---

## 5. Parte “reforzar” — Ejercicios para estudiantes

### Ejercicio 1 — Primera rama y PR (~20 min)

Igual que el cierre de la animación (diapositiva 11):

1. Crear `feature/mi-primera-rama` desde `main` actualizado.
2. Un cambio mínimo (texto en README, `console.log`, etc.).
3. Commit con mensaje claro (`feat:` o `fix:`).
4. `git push -u origin feature/mi-primera-rama`.
5. Abrir PR hacia `main` y **solo observar** la UI (lista de archivos, checks si hay CI).

### Ejercicio 2 — Convención de nombres (~10 min)

Escribir en el chat o en un doc el nombre de rama apropiado para:

- Nueva pantalla de login → `feature/...`
- Bug en citas duplicadas → `fix/...`
- Actualizar dependencia → `chore/...`
- Pago caído en producción → `hotfix/...`

### Ejercicio 3 — Review en parejas (~20 min)

- Estudiante A abre PR; B deja un comentario en una línea.
- A responde y hace un segundo commit en la misma rama.
- B aprueba; A o el docente hace merge (según permisos del repo).

### Ejercicio 4 — Conflicto guiado (~25 min, opcional avanzado)

- Repo de plantilla con dos ramas que chocan en `config.txt` o similar.
- Cada estudiante resuelve en VS Code y hace push; comparar soluciones en clase.

### Ejercicio 5 — Regla de oro (oral, ~5 min)

- “¿Por qué no hacemos `git push` directo a `main` en KaledSoft?”
- Relacionar con Vercel/producción y clientes (diapositiva 9).

---

## 6. Comandos de referencia (tabla rápida)

| Objetivo | Comando |
|----------|---------|
| Crear rama y entrar | `git switch -c nombre-rama` o `git checkout -b nombre-rama` |
| Cambiar de rama | `git switch nombre-rama` o `git checkout nombre-rama` |
| Ver rama actual | `git branch` (asterisco en la activa) |
| Publicar rama | `git push -u origin nombre-rama` |
| Actualizar main | `git switch main` + `git pull origin main` |
| Traer trabajo remoto | `git pull` (en la rama actual) |

*En L4 se introdujo `git merge` local; aquí el merge suele ocurrir en GitHub al aceptar el PR.*

---

## 7. Preguntas de refuerzo

- ¿Qué es un PR en una frase?
- ¿Diferencia entre `feature/` y `hotfix/`?
- ¿Qué indica `<<<<<<< HEAD` en un archivo?
- ¿Por qué el segundo commit en la misma rama actualiza el PR abierto?

---

## 8. Consejos Zoom + plataforma

- En la diapositiva del **PR**, ejecutar **“Simular revisión”** dos o tres veces para que vean el hilo comentario → respuesta → aprobación → merge.
- Tener un repo **de práctica** con permisos controlados (plantilla organización o forks).
- Si el grupo es principiante, posponer el ejercicio de conflicto a una sesión extra o tarea opcional.

---

## 9. Enlace con la Lección 4

La L4 explica **qué es Git**, áreas locales, commits, `.gitignore` y visión de GitHub. Esta lección asume que ya saben hacer commits y pushes básicos y centra el mensaje en **flujo de equipo** y **calidad antes de producción**. Ver [LECCION-4-GUIA-DOCENTE-GIT-CONTROL-VERSIONES.md](./LECCION-4-GUIA-DOCENTE-GIT-CONTROL-VERSIONES.md).

---

## 10. Documento índice

[LECCIONES-4-6-GUIA-DOCENTE-RESUMEN.md](./LECCIONES-4-6-GUIA-DOCENTE-RESUMEN.md) — cómo encajan las sesiones Git (L4–L6) y checklist general.

Siguiente tema relacionado: [Lección 6 — Git con IA](./LECCION-6-GUIA-DOCENTE-GIT-CON-IA.md).

---

*Contenido alineado con la animación interactiva `git-ramas-pr.html` (11 slides).*
