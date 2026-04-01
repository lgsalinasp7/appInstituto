# Guía docente — Lecciones 4, 5 y 6 (Git y Git con IA)

Documento índice para clases virtuales (Zoom + plataforma KaledAcademy). El detalle por lección:

- [Guía Lección 4 — Git: control de versiones](./LECCION-4-GUIA-DOCENTE-GIT-CONTROL-VERSIONES.md)
- [Guía Lección 5 — Git: ramas, PR y colaboración](./LECCION-5-GUIA-DOCENTE-GIT-RAMAS-PR.md)
- [Guía Lección 6 — Git con IA (criterio técnico)](./LECCION-6-GUIA-DOCENTE-GIT-CON-IA.md)

*(El archivo histórico `LECCIONES-4-5-GUIA-DOCENTE-RESUMEN.md` quedó obsoleto; usar este como índice único.)*

---

## Cómo encajan las tres sesiones

| Aspecto | L4 | L5 | L6 |
|--------|----|----|-----|
| Enfoque | Qué es Git, áreas locales, commits, `.gitignore`, GitHub | Ramas, nombres, PR, conflictos, regla de oro | IA como asistente: riesgos, prompts, checklist, blame, commits asistidos |
| Prerrequisito | — | L4 recomendada | L4 + L5 recomendadas |
| Animación | `git-control-versiones.html` | `git-ramas-pr.html` | `git-con-ia.html` |
| Objetivo práctico | Repo local y flujo básico | PR y colaboración | Criterio técnico + panel “Kaled revisa mi código” |

**Orden:** L4 → L5 → L6 en sesiones separadas (90–120 min cada una es holgado).

---

## Flujo genérico Zoom + plataforma

1. Zoom: audio y pantalla compartida.
2. Plataforma: animación **diapositiva a diapositiva**; en L6, cerrar con el panel de revisión de código si está habilitado.
3. VS Code / Cursor: demos y ejercicios.
4. Cierre: quiz + preguntas del documento de cada lección.

---

## Checklist rápido antes de clase

- [ ] Git, VS Code, cuenta GitHub (L5+).
- [ ] Extensión GitLens opcional (L4/L6).
- [ ] Variables de entorno / API para “Kaled revisa mi código” si se usará en vivo (L6).
- [ ] Recordatorio: **no pegar secretos** en IA ni en el panel de revisión.

---

## Preguntas transversales (L4–L6)

- Tres áreas de Git y comandos entre ellas.
- Por qué no subir `.env`.
- `fetch` vs `pull`.
- Qué es un PR y por qué no merge directo a `main`.
- Marcadores de conflicto `<<<<<<<` / `=======` / `>>>>>>>`.
- Qué revisar antes de ejecutar un comando que sugirió la IA.
- Para qué sirve `git blame` y qué no puede inventar la IA.

---

## Referencia de archivos en el repo

| Lección | HTML interactivo | Componente React |
|---------|------------------|------------------|
| 4 | `public/interactive/git-control-versiones.html` | `GitControlVersionesAnimation.tsx` |
| 5 | `public/interactive/git-ramas-pr.html` | `GitRamasPrAnimation.tsx` |
| 6 | `public/interactive/git-con-ia.html` | `GitConIaAnimation.tsx` |

Panel revisión código: `src/modules/academia/components/student/CodeReviewPanel.tsx`.

---

*Actualizado con lección 6 y panel Kaled revisa mi código.*
