# Estructura de Lección — KaledAcademy

Documento de referencia para mantener la armonía entre backend (API/seed) y frontend (LessonView).

## Fuente de datos

- **Seed v2**: `prisma/seed-kaledacademy-v2.ts` + `seed-kaledacademy-v2-data.ts`
- **API**: `GET /api/academy/lessons/[id]` → `courseService.getLessonWithProgress`
- **Frontend**: `LessonViewClient` → `LessonView`

## Estructura esperada por LessonView

### `lesson` (objeto principal)

| Campo | Tipo | Origen | Descripción |
|-------|------|--------|-------------|
| `id` | string | AcademyLesson.id | ID de la lección |
| `title` | string | AcademyLesson.title | Título de la sesión |
| `description` | string | AcademyLesson.description | Descripción breve |
| `videoUrl` | string? | meta.videoUrl \|\| lesson.videoUrl | URL del video recomendado |
| `duration` | number | AcademyLesson.duration | Duración en minutos |
| `moduleTitle` | string | module.title | Título del módulo |
| `moduleOrder` | number | module.order | Orden del módulo (1-4) |
| `courseTitle` | string | module.course.title | Título del curso |
| `weekNumber` | number | meta.weekNumber | Semana (1-16) |
| `dayOfWeek` | string | meta.dayOfWeek | LUNES, MIERCOLES, VIERNES |
| `sessionType` | string | meta.sessionType | TEORIA, PRACTICA, ENTREGABLE, LIVE |
| `videoTitle` | string? | meta.videoTitle | Título del video |
| `analogyText` | string? | meta.analogyText | Analogía de Kaled |
| `kaledIntro` | string? | meta.kaledIntro | Introducción de Kaled AI |
| `concepts` | ConceptItem[] | meta.concepts | Conceptos clave |
| `cralChallenges` | CRALChallenge[] | lesson.cralChallenges | Fases CRAL |
| `quizzes` | QuizData[] | lesson.quizzes | Preguntas de verificación |
| `deliverable` | DeliverableData? | lesson.deliverables[0] | Entregable (si aplica) |

### `concepts` (AcademyLessonMeta.concepts — JSON)

```ts
{ key: string; title: string; body: string }[]
```

- **key**: Identificador único (ej: `dns`, `tcp`, `rest`)
- **title**: Título del concepto (puede incluir " — " para subtítulo)
- **body**: Contenido en markdown (`**negrita**`, `` `código` ``)

### `cralChallenges`

```ts
{ id: string; phase: string; title: string; description: string; isDone: boolean }[]
```

- **phase**: CONSTRUIR | ROMPER | AUDITAR | LANZAR
- **description**: En seed v2 se usa `desc` → se mapea a `description`

### `quizzes`

```ts
{
  id: string;
  question: string;
  options: { id: string; label: string; text: string; isCorrect: boolean; feedback?: string }[];
  result: { isCorrect: boolean; selectedOptionId?: string } | null;
}[]
```

### `deliverable`

```ts
{
  id: string;
  title: string;
  description: string;
  isFinal: boolean;
  items: { id: string; text: string }[];
  submission: { status: string; githubUrl?: string; deployUrl?: string; checkedItems: string[] } | null;
} | null
```

## Contenido por tipo de sesión

| Tipo | kaledIntro | analogyText | concepts | cral | quiz | entregable |
|------|------------|-------------|----------|------|------|------------|
| Módulos 1-2 (completo) | ✓ | ✓ | ✓ | ✓ | ✓ | Si ENTREGABLE |
| Módulos 3-4 (simplificado) | Algunas | - | - | CRAL genérico | - | - |

## Convenciones de diseño (LessonView)

- **Colores por módulo**: 1=cyan, 2=violeta, 3=verde, 4=ámbar
- **Badges de sesión**: TEORIA, PRACTICA, ENTREGABLE, LIVE
- **Formato markdown**: `**texto**` → negrita, `` `código` `` → code
- **Responsive**: Mobile-first, sidebar colapsable en lg, Sheet en móvil
