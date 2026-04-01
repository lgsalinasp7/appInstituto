# Matriz de Entendimiento - Lecciones 1 a 3

## Contexto

Este documento aclara que lo que el estudiante ve dentro de cada leccion en `LessonView` tiene 3 capas distintas:

1. Retos de aprendizaje CRAL (Construir, Romper, Auditar, Lanzar).
2. Quiz de comprension.
3. Entregable formal (solo si la leccion trae `lesson.deliverable`).

Adicionalmente, existe el boton de "Marcar como visto" para completar la sesion.

---

## Matriz por leccion (primeras 3)

| Leccion | Tema | CRAL visible | Quiz visible | Entregable formal visible | Que espera la app del estudiante | Endpoint(s) clave |
|---|---|---|---|---|---|---|
| 1 | El viaje de una URL | Si (4 cards CRAL) | Si | No | Completar retos CRAL opcionalmente, responder quiz, y marcar sesion como vista | `POST /api/academy/cral/[challengeId]/complete`, quiz answer, `POST /api/academy/lessons/[id]/complete` |
| 2 | HTTP y modelo cliente-servidor | Si (4 cards CRAL) | Si | No | Igual que leccion 1 (CRAL + quiz + marcar sesion) | `POST /api/academy/cral/[challengeId]/complete`, quiz answer, `POST /api/academy/lessons/[id]/complete` |
| 3 | VS Code y primer HTML | Si (4 cards CRAL) | Si | Si (entregable semanal) | Marcar checklist del entregable, enviar entrega, y opcionalmente actualizarla; luego marcar sesion | `POST /api/academy/deliverables/[id]/submit`, `POST /api/academy/cral/[challengeId]/complete`, quiz answer, `POST /api/academy/lessons/[id]/complete` |

---

## Detalle funcional por bloque de UI

### 1) Cards CRAL (las 4 que ves en la grilla)

- Son `lesson.cralChallenges` y representan metodologia, no entregable final por si mismas.
- Cada card se marca con "Marcar completado", y eso crea/actualiza `AcademyCRALCompletion`.
- Se renderizan en `LessonView` en el bloque "Construir · Romper · Auditar · Lanzar".

**Implicacion:** completar CRAL no equivale automaticamente a "entregable aprobado".

### 2) Quiz de comprension

- Se renderiza por cada item en `lesson.quizzes`.
- Al responder, guarda resultado por pregunta del quiz para el estudiante.

**Implicacion:** quiz correcto ayuda a evaluacion de comprension, pero no reemplaza envio de entregable.

### 3) Entregable formal (si existe en la leccion)

- Solo aparece cuando `lesson.deliverable` existe.
- En leccion 3 del seed V3, si existe un entregable semanal (`entregable: { ... }`).
- Para enviar, backend exige minimo 1 item marcado en `checkedItems`.
- Al enviar, estado inicial de la entrega: `ENTREGADO`.

**Estados posibles de entrega:**

- `PENDIENTE`
- `ENTREGADO`
- `EN_REVISION`
- `APROBADO`
- `RECHAZADO`

### 4) Marcar sesion como vista

- Es independiente del entregable.
- Actualiza progreso de leccion completada en `AcademyStudentProgress` para esa leccion.

---

## Reglas importantes para QA funcional

1. **Leccion 1 y 2** no deben exigir entregable formal para mostrarse como trabajables (solo CRAL + quiz + marcar sesion).
2. **Leccion 3** si tiene entregable formal; el estudiante debe poder:
   - marcar checklist,
   - enviar entrega,
   - volver a editar y re-enviar (upsert).
3. El estado de "Entregables" en dashboard no debe inferirse solo por CRAL o quiz.
4. "Aprobado" depende de revision docente/admin (`review`), no del estudiante.

---

## Referencias tecnicas (codigo)

- `src/modules/academia/components/student/LessonView.tsx`
  - Render CRAL, quiz, entregable y acciones de envio.
- `src/modules/academy/api/handlers.ts`
  - `POST /api/academy/cral/[challengeId]/complete`
  - `POST /api/academy/deliverables/[id]/submit`
  - `POST /api/academy/deliverables/[id]/review`
- `src/modules/academy/services/academy.service.ts`
  - `deliverableService.submit(...)` (guarda `ENTREGADO`)
  - `deliverableService.review(...)` (cambia a `APROBADO/RECHAZADO/EN_REVISION`)
- `prisma/seed-kaledacademy-v3.ts`
  - Sesion 1, 2 y 3 del modulo 1 (incluye entregable en sesion 3).

