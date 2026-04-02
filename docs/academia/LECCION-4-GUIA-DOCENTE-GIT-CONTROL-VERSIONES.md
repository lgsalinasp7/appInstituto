# Guía docente — Lección 4: Git, control de versiones

Guía detallada para clase virtual (Zoom + plataforma + animación interactiva + Visual Studio Code). Contenido alineado con la animación **Git: Control de Versiones** (11 diapositivas).

**Animación:** `public/interactive/git-control-versiones.html`  
**Fuente HTML tema:** `docs/Temas/tema_4_git_control_versiones.html`

---

## 1. Mapa de la lección (diapositivas)

| # | Título / tema | Qué deben retener los estudiantes |
|---|----------------|-----------------------------------|
| **1** | Portada | Git sustituye el caos de `*_final_v3.zip`; el historial ordenado es `git log`. |
| **2** | Antes de Git | Carpetas duplicadas, email/FTP; CVS/SVN centralizados; problema: quién cambió qué, cuándo, y trabajo en paralelo sin destruir nada. |
| **3** | Historia (Linus, 2005) | BitKeeper → crisis → Git en ~10 días; distribuido, ramas baratas, hash, GitHub 2008; por qué ganó frente a centralizados. |
| **4** | Configuración | `user.name`, `user.email`, `git config --list`, editor `code --wait`, `git init`, contenido de `.git/`, `git clone`. |
| **5** | Las 3 áreas | Working directory → Staging → Repository; `git status`, `git add`, `git restore` y `git restore --staged`. |
| **6** | Commits | Instantánea + SHA; **Conventional Commits** (`feat`, `fix`, `docs`, `refactor`, `chore`); `git log`, `git show`, `git diff`, `git commit --amend`. |
| **7** | Ramas / GitFlow | `main` (producción), `develop`, `feature/`, `hotfix/`; no commit directo a `main`; `switch -c`, `merge`, `stash`, `log --graph`. |
| **8** | `.gitignore` | `.env`, `node_modules`, `.next`, logs, basura de SO; historia del `.env` filtrado; **`.env.example`**. |
| **9** | Comandos diarios | `pull` → rama → trabajo → `status` → `add` → `commit` → `push`; `blame`, `revert`, `cherry-pick`; cuidado con `reset --hard`. |
| **10** | GitHub | Git ≠ GitHub; `remote add`, `push`/`pull`; flujo de **Pull Request** (pasos en la animación). |
| **11** | Resumen | Checklist mental + “un día en KaledSoft” (`pull`, `switch -c`, `add`, `commit`, `push`, PR). |

---

## 2. Estructura sugerida de la sesión (90–120 min)

| Fase | Duración | Actividad |
|------|----------|-----------|
| Apertura | ~5 min | Diapositiva 1: pregunta motivadora (“¿quién tuvo un `proyecto_final_definitivo`?”). |
| Concepto | ~20–25 min | Diapositivas 2–3 (historia), 5 (tres áreas), 7–8 (ramas + `.gitignore`). Pausar en 5 y 8. |
| Demo en vivo | ~15 min | Docente en VS Code: configuración + `init` + primer commit (sección 4). |
| Práctica guiada | ~25–35 min | Estudiantes repiten; ejercicios sección 6. |
| Refuerzo | ~15–20 min | Retos cortos + quiz en plataforma si existe. |
| Cierre | ~5 min | Diapositiva 11: repetir el flujo del día. |

**Zoom:** compartir animación en pantallas 2–3 y 5–7; para práctica, **VS Code a pantalla completa** o terminal integrada visible.

---

## 3. Parte “aprender” — Demo del docente en VS Code

### 3.1 Prerrequisitos

- Git instalado.
- Visual Studio Code.
- Opcional: extensión **GitLens** (historial y blame visual).

### 3.2 Configuración (diapositiva 4)

En terminal de VS Code:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
git config --global core.editor "code --wait"
git config --list
```

Mensaje clave: la identidad queda en la máquina y etiqueta cada commit.

### 3.3 Primer repositorio y tres áreas (diapositivas 4–5)

1. **File → Open Folder** → carpeta vacía, por ejemplo `practica-git-clase4`.
2. Terminal:

```bash
cd ruta\a\practica-git-clase4
git init
```

3. Crear `README.md` con una línea; guardar.
4. Mostrar el panel **Source Control** (icono de rama).
5. En terminal:

```bash
git status
git add README.md
git status
git commit -m "docs: inicializa README del proyecto demo"
git status
```

Enfatizar: editar = working directory; `git add` = staging; `git commit` = repositorio.

### 3.4 Conventional Commits (diapositiva 6)

1. Editar `README.md`.
2. `git add README.md`
3. `git commit -m "docs(demo): describe objetivos del taller"`
4. `git log --oneline`

### 3.5 Rama feature local (diapositiva 7, sin remoto obligatorio)

```bash
git switch -c feature/agregar-licencia
```

Añadir archivo o sección, `git add`, `commit` con mensaje `feat` o `docs`. Luego:

```bash
git switch main
git merge feature/agregar-licencia
git log --oneline --graph
```

### 3.6 `.gitignore` (diapositiva 8)

1. Crear `.env` con texto ficticio, por ejemplo `SECRET=fake123`.
2. Crear `.gitignore`:

```gitignore
.env
node_modules/
```

3. `git add .gitignore` (sin añadir `.env`).
4. `git status` → comprobar que `.env` no queda en staging.
5. Explicar **`.env.example`** solo con nombres de variables.

### 3.7 GitHub opcional (diapositiva 10, si hay tiempo)

- Repo vacío en GitHub; `git remote add origin <url>`.
- `git push -u origin main` (o la rama inicial que usen).

---

## 4. Parte “reforzar” — Ejercicios para estudiantes

### Ejercicio 1 — Tres áreas (~10 min)

- Crear `app.js` con `console.log("v1")`; commit: `feat(demo): primera versión de app`.
- Cambiar a `v2` **sin** `add`; preguntar qué muestra `git diff`.
- Luego `add` + `commit` apropiado.

**Respuesta esperada (docente):**

- Tras el primer commit, `app.js` en el repositorio coincide con `v1`.
- Si cambian el archivo a `v2` sin `git add`, `git diff` (o `git diff app.js`) muestra las líneas que difieren entre el **working directory** y el **último commit** (HEAD): verán el cambio de `v1` a `v2` como contenido modificado aún no preparado para commit.
- `git status` debe indicar `modified: app.js` y “not staged”.
- Después de `git add app.js` y `git commit -m "feat(demo): segunda versión de app"` (o mensaje equivalente en Conventional Commits), `git diff` sin argumentos queda vacío y el historial incluye dos commits; el último refleja `v2`.

### Ejercicio 2 — Staging selectivo (~10 min)

- Archivos `a.txt` y `b.txt`; modificar ambos.
- `git add` **solo** `a.txt` y un commit; después commit de `b.txt`.

**Respuesta esperada (docente):**

- Con ambos archivos editados, `git status` lista `a.txt` y `b.txt` como modificados.
- Tras `git add a.txt` solo, la zona de staging contiene **únicamente** los cambios de `a.txt`; `b.txt` sigue como “modified” sin stagear.
- El primer commit solo graba el snapshot de `a.txt` (y el resto del repo); `b.txt` no entra en ese commit.
- Tras ese commit, `git status` sigue mostrando `b.txt` modificado; el segundo `add` + `commit` incorpora solo `b.txt`. Mensaje clave: el staging permite **elegir** qué va en cada commit.

### Ejercicio 3 — Deshacer sin pánico (~10 min)

- Cambio sin commit: `git restore archivo.txt`.
- Archivo en staging: `git restore --staged archivo.txt`.

**Respuesta esperada (docente):**

- **Solo cambios en working directory (sin `add`):** `git restore archivo.txt` descarta esas ediciones y deja el archivo **igual que en el último commit** (irrecuperable salvo que el editor tenga historial local). Es la herramienta para “volver atrás” sin tocar el historial de commits.
- **Archivo ya en staging:** `git restore --staged archivo.txt` **saca el archivo del staging**; el contenido en disco **no** se revierte por ese comando solo — siguen viendo sus ediciones en el working directory. Si además quieren deshacer el contenido: `git restore archivo.txt` después del `--staged`, o explicar el flujo en dos pasos según el objetivo pedagógico.

### Ejercicio 4 — Rama y merge local (~15 min)

- `main` con commit base.
- `git switch -c feature/lista-tareas`.
- Añadir `tareas.md`, commit `feat(demo): lista inicial`.
- `git switch main`, `git merge feature/lista-tareas`, `git log --oneline --graph`.

**Respuesta esperada (docente):**

- En `feature/lista-tareas`, el nuevo commit añade `tareas.md`; `main` no lo tenía hasta el merge.
- Tras `git switch main` y `git merge feature/lista-tareas`, Git suele hacer **fast-forward** si `main` no avanzó (historial lineal) o un **merge commit** si hubo commits en ambas ramas; en el escenario típico del ejercicio (solo avanzó la feature), a menudo es fast-forward.
- `git log --oneline --graph` muestra la línea de commits; con fast-forward verán `main` y la feature apuntando al mismo commit o una línea simple; con merge commit verán el carácter `*` y ramas uniéndose. Lo importante: **`tareas.md` aparece en `main`** y el trabajo de la rama quedó integrado.

### Ejercicio 5 — GitHub (~15 min, opcional)

- Clonar o crear repo; `push`; si la política del curso lo permite, abrir un PR de prueba.

**Respuesta esperada (docente):**

- **Clonar:** `git clone <url>` crea carpeta con `origin` configurado; `git push` en rama nueva requiere `git push -u origin <rama>` la primera vez.
- **Repo local nuevo:** `git remote add origin <url>`, luego `git push -u origin main` (o la rama que usen).
- **PR de prueba:** rama feature → `push` → en GitHub “Compare & pull request” → título y descripción breves → crear PR. Sirve para practicar revisión sin mezclar a producción si no quieren mergear; pueden cerrar el PR después.

---

## 5. Preguntas de refuerzo (oral o chat)

- ¿Qué diferencia hay entre `git fetch` y `git pull`?
- ¿Por qué no subimos `.env`?
- ¿Cuáles son las tres áreas y qué comando mueve al staging?
- ¿Por qué en muchos equipos `main` está “protegida”?

**Respuestas orientativas (docente):**

- **`fetch` vs `pull`:** `git fetch` trae commits del remoto y actualiza referencias remotas (`origin/main`, etc.) **sin** fusionar con la rama actual. `git pull` es, en la práctica, `fetch` + integración (merge o rebase según configuración) en la rama en la que estás: actualiza tu copia local y mezcla de una vez.
- **No subir `.env`:** contiene secretos (API keys, contraseñas, URLs con credenciales). Subirlo al repositorio los expone en el historial para siempre, incluso si luego se borra el archivo. Se usa `.env.example` sin valores sensibles.
- **Tres áreas:** (1) **Working directory** — archivos en disco; (2) **Staging (index)** — lo que irá en el próximo commit; (3) **Repository (HEAD)** — commits guardados. El comando que mueve al staging es **`git add`** (y `git add -p` para trozos). `git commit` pasa de staging a repositorio.
- **`main` protegida:** evita commits directos que rompan producción; obliga a pasar por **PR**, revisión y CI; mantiene historial limpio y reduce errores humanos en la rama de despliegue.

---

## 6. Si alguien se atasca (triage rápido)

- ¿Están en la carpeta correcta? (`cd`, ruta en explorador de VS Code).
- ¿Guardaron el archivo? (punto blanco en pestaña = sin guardar).
- ¿Configuraron `user.name` y `user.email`?
- ¿Confunden “no hay cambios” con “no hay commits”? (`git status` vs `git log`).

---

## 7. Enlace con la Lección 5

La Lección 5 profundiza **ramas con equipo**, **Pull Requests**, **conflictos** y la **regla de oro** (nunca commit directo a `main`). Ver [LECCION-5-GUIA-DOCENTE-GIT-RAMAS-PR.md](./LECCION-5-GUIA-DOCENTE-GIT-RAMAS-PR.md).

Índice de las tres sesiones Git: [LECCIONES-4-6-GUIA-DOCENTE-RESUMEN.md](./LECCIONES-4-6-GUIA-DOCENTE-RESUMEN.md).

---

*Contenido alineado con la animación interactiva del repositorio (11 slides).*
