"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LessonView } from "./LessonView";
import { fetchLesson, fetchCourseSidebar } from "@/modules/academia/lib/academy-api";

interface LessonViewClientProps {
  courseId: string;
  lessonId: string;
  userId: string;
}

interface ApiLesson {
  id: string;
  title: string;
  description: string | null;
  content: string;
  videoUrl: string | null;
  duration: number;
  order: number;
  moduleId: string;
  meta: {
    sessionType: string;
    weekNumber: number;
    dayOfWeek: string;
    videoUrl: string | null;
    videoTitle: string | null;
    analogyText: string | null;
    kaledIntro: string | null;
    concepts: unknown;
  } | null;
  module: {
    title: string;
    order: number;
    course: { title: string };
  };
  quizzes: Array<{
    id: string;
    question: string;
    options: Array<{
      id: string;
      label: string;
      text: string;
      isCorrect: boolean;
      feedback: string | null;
    }>;
  }>;
  cralChallenges: Array<{
    id: string;
    phase: string;
    title: string;
    description: string;
  }>;
  deliverables: Array<{
    id: string;
    title: string;
    description: string;
    isFinal: boolean;
    checkItems: Array<{ id: string; text: string }>;
  }>;
}

interface ApiSidebarModule {
  id: string;
  title: string;
  order: number;
  lessons: Array<{
    id: string;
    title: string;
    order: number;
    meta: { weekNumber: number; dayOfWeek: string } | null;
    isCompleted: boolean;
  }>;
}

function parseConcepts(concepts: unknown): Array<{ key: string; title: string; body: string }> {
  if (!concepts || !Array.isArray(concepts)) return [];
  return concepts
    .filter((c): c is Record<string, unknown> => c && typeof c === "object")
    .map((c, i) => ({
      key: (c.key as string) ?? `c${i}`,
      title: (c.title as string) ?? "",
      body: (c.body as string) ?? "",
    }));
}

export function LessonViewClient({ courseId, lessonId, userId }: LessonViewClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    lesson: Parameters<typeof LessonView>[0]["lesson"];
    isCompleted: boolean;
    videoProgress: number;
    moduleLessons: Parameters<typeof LessonView>[0]["moduleLessons"];
    prevLessonId?: string;
    nextLessonId?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [lessonRes, sidebarRes] = await Promise.all([
          fetchLesson(lessonId),
          fetchCourseSidebar(courseId),
        ]);

        if (cancelled) return;

        if (!lessonRes.lesson) {
          setError("Lección no encontrada");
          return;
        }

        const lesson = lessonRes.lesson as ApiLesson;
        const modules = Array.isArray(sidebarRes)
          ? (sidebarRes as ApiSidebarModule[])
          : ((sidebarRes as { modules?: ApiSidebarModule[] }).modules ?? []);

        const cralDoneMap = new Set(
          (lessonRes.cralCompletions ?? []).map((c: { challengeId: string }) => c.challengeId)
        );
        interface QuizResultItem {
          selectedOptionId: string | null;
          isCorrect: boolean;
        }
        const quizResultMap = new Map<string, QuizResultItem>(
          (lessonRes.quizResults ?? []).map((r: { quizId: string; selectedOptionId: string | null; isCorrect: boolean }) => [
            r.quizId,
            { selectedOptionId: r.selectedOptionId, isCorrect: r.isCorrect },
          ])
        );
        const delivery = lessonRes.deliverySubmission as {
          status: string;
          githubUrl?: string;
          deployUrl?: string;
          checkedItems: string[];
        } | null;

        const allLessons: Array<{
          id: string;
          title: string;
          weekNumber: number;
          dayOfWeek: string;
          isCompleted: boolean;
          isCurrent: boolean;
        }> = [];
        let prevId: string | undefined;
        let nextId: string | undefined;
        let found = false;

        for (const mod of modules) {
          for (const l of mod.lessons) {
            const isCurrent = l.id === lessonId;
            if (isCurrent) found = true;
            else if (found) {
              nextId = l.id;
              break;
            } else {
              prevId = l.id;
            }
            allLessons.push({
              id: l.id,
              title: l.title,
              weekNumber: l.meta?.weekNumber ?? 1,
              dayOfWeek: l.meta?.dayOfWeek ?? "LUNES",
              isCompleted: l.isCompleted,
              isCurrent,
            });
          }
          if (nextId) break;
        }

        const meta = lesson.meta;
        const videoUrl = meta?.videoUrl ?? lesson.videoUrl ?? undefined;

        const deliverable = lesson.deliverables[0];
        const deliverableData = deliverable
          ? {
              id: deliverable.id,
              title: deliverable.title,
              description: deliverable.description,
              isFinal: deliverable.isFinal,
              items: deliverable.checkItems.map((ci) => ({ id: ci.id, text: ci.text })),
              submission: delivery
                ? {
                    status: delivery.status,
                    githubUrl: delivery.githubUrl,
                    deployUrl: delivery.deployUrl,
                    checkedItems: delivery.checkedItems ?? [],
                  }
                : null,
            }
          : null;

        setData({
          lesson: {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description ?? "",
            videoUrl: videoUrl ?? undefined,
            duration: lesson.duration,
            moduleTitle: lesson.module.title,
            moduleOrder: lesson.module.order,
            courseTitle: lesson.module.course.title,
            weekNumber: meta?.weekNumber ?? 1,
            dayOfWeek: meta?.dayOfWeek ?? "LUNES",
            sessionType: meta?.sessionType ?? "TEORIA",
            videoTitle: meta?.videoTitle ?? undefined,
            analogyText: meta?.analogyText ?? undefined,
            kaledIntro: meta?.kaledIntro ?? undefined,
            concepts: parseConcepts(meta?.concepts),
            cralChallenges: lesson.cralChallenges.map((c) => ({
              id: c.id,
              phase: c.phase,
              title: c.title,
              description: c.description,
              isDone: cralDoneMap.has(c.id),
            })),
            quizzes: lesson.quizzes.map((q) => {
              const res = quizResultMap.get(q.id);
              return {
                id: q.id,
                question: q.question,
                options: q.options.map((o) => ({
                  id: o.id,
                  label: o.label,
                  text: o.text,
                  isCorrect: o.isCorrect,
                  feedback: o.feedback ?? undefined,
                })),
                result: res
                  ? { isCorrect: res.isCorrect, selectedOptionId: res.selectedOptionId }
                  : null,
              };
            }),
            deliverable: deliverableData,
          },
          isCompleted: lessonRes.progress?.completed ?? false,
          videoProgress: lessonRes.progress?.videoProgress ?? 0,
          moduleLessons: allLessons,
          prevLessonId: prevId,
          nextLessonId: nextId,
        });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error al cargar la lección");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId]);

  if (loading) {
    return (
      <div className="academy-card-dark p-8">
        <p className="text-slate-400">Cargando lección...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="academy-card-dark p-8">
        <p className="text-red-400">{error ?? "Error desconocido"}</p>
        <button
          type="button"
          onClick={() => router.push(`/academia/student/courses/${courseId}`)}
          className="mt-4 text-cyan-400 hover:underline"
        >
          Volver al curso
        </button>
      </div>
    );
  }

  return (
    <LessonView
      userId={userId}
      lesson={data.lesson}
      isCompleted={data.isCompleted}
      videoProgress={data.videoProgress}
      courseId={courseId}
      moduleLessons={data.moduleLessons}
      prevLessonId={data.prevLessonId}
      nextLessonId={data.nextLessonId}
    />
  );
}
