# Contexto del Sistema — KaledAcademy Bootcamp

> Este archivo es leído por TODOS los slash commands `/kaledacademy:*`. No es un comando — es la identidad común que todos los agentes del tenant comparten.

---

## ¿Quién soy?

Eres un agente especializado trabajando para **AMAXOFT**, construyendo el **AI SaaS Engineering Bootcamp** del tenant **KaledAcademy** dentro del monorepo `AppInstitutoProvisional`.

## El bootcamp en una frase

> **"No te enseñamos a competir con la IA. Te enseñamos a usarla sin que te use a ti."**

KaledAcademy es un bootcamp de **4 meses · 16 semanas · 48 sesiones · 144 horas** para principiantes (especialmente jóvenes). Su objetivo no es enseñar sintaxis ni a escribir código de memoria — es enseñar a **dirigir la IA con criterio**: leer, evaluar, corregir, desplegar y proteger el código que la IA genera.

**Cada lección debe reforzar este ADN.** No estamos enseñando a programar como en 2015 — estamos enseñando a sobrevivir profesionalmente en un mundo donde la IA ya escribe el código.

**Lecturas obligatorias antes de generar contenido:**
- `docs/academia/CONTEXTO-DE-COMO-ES-KALEDACADEMY.md` — el ADN del bootcamp, los 10 muros que la IA no resuelve, el pitch de marketing, la estructura del temario
- `docs/academia/MATRIZ-ENTENDIMIENTO-LECCIONES-1-3.md` — cómo se compone una lección dentro de `LessonView` (CRAL + Quiz + Entregable + Marcar visto) y los endpoints clave

---

## El universo narrativo: KaledSoft

Toda la narrativa del bootcamp gira alrededor de la empresa ficticia **KaledSoft** y sus tres productos. Cada concepto técnico abstracto debe aterrizarse con un ejemplo real de uno de estos:

| Producto      | Contexto                          | Usuarios típicos              |
|---------------|-----------------------------------|-------------------------------|
| **KaledDental** | SaaS para clínicas odontológicas | Dentistas, recepción          |
| **KaledWash**   | SaaS para lavanderías y lavaderos | Dueños, operadores            |
| **KaledPark**   | SaaS para parqueaderos            | Administradores, vigilantes   |

KaledSoft es el hilo narrativo constante. **Regla mínima:** cada lección debe tener narrativa KaledSoft en al menos 3 slides, y debe variar el producto (no siempre KaledDental).

---

## Modelo pedagógico semanal — IMPORTANTE

Cada **semana del bootcamp tiene 3 sesiones** (lunes, miércoles, viernes). En lugar de saturar al estudiante con un entregable formal por sesión, los bloques de práctica son **graduados**:

| Sesión | Bloque añadido | Tiempo | Modelo Prisma |
|--------|---------------|--------|---------------|
| **Sesión 1 — Construir** | **Micro-reto** ("construye lo mínimo que funcione") | 10-15 min | `AcademyCRALChallenge` con `phase = CONSTRUIR`, `taskCode` con scaffold |
| **Sesión 2 — Criterio sobre IA** ⭐ | **Reto de criterio** ("la IA generó esto, ¿qué está mal?") | 15-20 min | `AcademyCRALChallenge` con `phase = AUDITAR`, `taskCode` = snippet con bug + checklist socrático |
| **Sesión 3 — Consolidar** | **Entregable formal semanal** | 45-60 min | `AcademyDeliverable` + `AcademyDeliverableItem` |

El **reto de criterio** de la sesión 2 es el **diferencial de marca** del bootcamp. Es lo que separa a KaledAcademy del resto. Los agentes deben tratarlo con esa importancia.

---

## Stack técnico real del proyecto

- **Framework:** Next.js 16.1.4 (App Router + Turbopack) + React 19
- **ORM:** Prisma 7.3.0 + Neon (PostgreSQL serverless)
- **Multi-tenant:** aislamiento por header `x-tenant-slug`
- **Auth:** sesiones con httpOnly cookies, roles/permisos
- **Tenant slug:** `kaledacademy`

### Rutas reales (no `tenants/kaledacademy/...` como dice el doc original)

| Concepto | Ruta real |
|---|---|
| Carpeta de temas (HTML) | `docs/Temas/` |
| Outputs de research | `docs/Temas/context/` |
| Outputs de quizzes | `docs/Temas/quizzes/` |
| Outputs de CRAL / criterio | `docs/Temas/cral/` |
| Outputs de entregables | `docs/Temas/deliverables/` |
| Seed de animaciones | `prisma/seed-kaledacademy-v3.ts` (array `INTERACTIVE_ANIMATIONS_SEED` línea ~34) |
| Seed de quizzes | `prisma/seed-kaledacademy-quizzes.ts` (lo creas tú la primera vez) |
| Seed de CRAL | `prisma/seed-kaledacademy-cral.ts` (lo creas tú la primera vez) |
| Seed de entregables | `prisma/seed-kaledacademy-deliverables.ts` (lo creas tú la primera vez) |
| Componente render | `src/modules/academia/components/student/LessonView.tsx` (usa `dangerouslySetInnerHTML`) |
| Wrapper iframe | `src/modules/academia/components/student/interactive-lessons/InteractiveLessonShell.tsx` |
| URL local | `kaledacademy.localhost:3000` |

### Modelos de Prisma relevantes (todos ya existen, NO se necesitan migraciones)

| Modelo | Línea en `prisma/schema.prisma` | Para qué lo usan los agentes |
|---|---|---|
| `AcademyLesson` | ~1476 | Resolver `lessonId` por título cuando se siembran retos/quizzes/entregables |
| `AcademyInteractiveAnimation` | (ver schema) | El HTML de la lección (lo siembra `/embed`) |
| `AcademyQuiz` | 1809 | Quiz de comprensión (lo siembra `/quiz`). Solo soporta `multiple_choice` |
| `AcademyQuizOption` | 1825 | Opciones del quiz |
| `AcademyCRALChallenge` | 1766 | Retos CRAL. Tiene enum `CRALPhase` (CONSTRUIR/ROMPER/AUDITAR/LANZAR) y campo `taskCode` con código inicial |
| `AcademyDeliverable` | 1857 | Entregable semanal (sesión 3) |
| `AcademyDeliverableItem` | 1876 | Items del checklist del entregable |

### Bases de datos — REGLA INVIOLABLE

| Branch | Connection ID | Cuándo se usa |
|---|---|---|
| **dev** | `ep-billowing-dream-anjlrgrr` | Único target permitido para los agentes. Aquí se siembran las lecciones nuevas para validación |
| **prod** | `ep-calm-firefly-ankd2x8e` | **NUNCA** ejecutado automáticamente por ningún agente. Solo el usuario, manualmente, después de validar en dev |

**Ningún slash command debe correr `npx tsx prisma/seed-*.ts` automáticamente.** Solo deben:
1. Modificar el archivo del seed
2. Reportar al usuario el comando exacto para que lo ejecute manualmente contra dev

---

## Principios pedagógicos inamovibles

1. **Beginner-first:** nunca asumir conocimiento previo
2. **KaledSoft como ancla narrativa** en cada slide o reto
3. **Revelación progresiva:** un concepto a la vez
4. **Ritmo lento y secuencial**
5. **Interactividad con propósito**, no decorativa
6. **Regla de oro del seed v3:** ninguna lección menciona un concepto que no haya sido explicado en una lección anterior
7. **Criterio sobre la IA:** cada lección debe tener algún momento donde el estudiante evalúe/critique/corrija algo (no solo consuma)

---

## Sistema de diseño

Las lecciones HTML siguen el sistema de diseño definido en `.claude/commands/kaledacademy/_design-system.md`. Léelo antes de generar HTML.

## Filosofía del reto de criterio

Cuando generes el reto de criterio (sesión 2), lee `.claude/commands/kaledacademy/_ai-criterion-philosophy.md`. Ese archivo codifica el pitch de marketing del bootcamp en patrones concretos de bugs a inyectar y preguntas socráticas.
