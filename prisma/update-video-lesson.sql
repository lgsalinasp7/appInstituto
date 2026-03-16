-- Actualizar video de la lección "El viaje de una URL: cómo funciona internet"
-- Nuevo video: https://www.youtube.com/watch?v=GkA5WOeLWbM (en español)

UPDATE "AcademyLesson"
SET "videoUrl" = 'https://www.youtube.com/watch?v=GkA5WOeLWbM'
WHERE title = 'El viaje de una URL: cómo funciona internet'
  AND "videoUrl" != 'https://www.youtube.com/watch?v=GkA5WOeLWbM';

UPDATE "AcademyLessonMeta" m
SET "videoUrl" = 'https://www.youtube.com/watch?v=GkA5WOeLWbM',
    "videoTitle" = '¿Cómo funciona internet? — Explicación en español'
FROM "AcademyLesson" l
WHERE m."lessonId" = l.id
  AND l.title = 'El viaje de una URL: cómo funciona internet'
  AND (m."videoUrl" IS NULL OR m."videoUrl" != 'https://www.youtube.com/watch?v=GkA5WOeLWbM');
