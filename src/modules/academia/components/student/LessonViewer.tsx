"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Play } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string;
  videoUrl: string | null;
  duration: number;
  order: number;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseData {
  enrollment: { course: { title: string; modules: Module[] } };
  completedLessonIds: string[];
}

interface LessonViewerProps {
  courseId: string;
}

export function LessonViewer({ courseId }: LessonViewerProps) {
  const router = useRouter();
  const [data, setData] = useState<CourseData | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/academy/progress/${courseId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId]);

  const handleComplete = async (lessonId: string) => {
    const res = await fetch("/api/academy/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });
    if (res.ok && data) {
      setData({
        ...data,
        completedLessonIds: [...data.completedLessonIds, lessonId],
      });
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Cargando curso...</p>
      </div>
    );
  }

  const { course } = data.enrollment;
  const completedSet = new Set(data.completedLessonIds);

  return (
    <div className="flex gap-6">
      <aside className="w-80 shrink-0 space-y-4">
        <h2 className="font-semibold">{course.title}</h2>
        {course.modules.map((mod) => (
          <div key={mod.id}>
            <p className="text-sm font-medium text-muted-foreground mb-2">{mod.title}</p>
            <div className="space-y-1">
              {mod.lessons.map((lesson) => {
                const isCompleted = completedSet.has(lesson.id);
                const isSelected = selectedLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                      isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 shrink-0 text-green-500" />
                    ) : (
                      <Play className="w-4 h-4 shrink-0" />
                    )}
                    <span className="truncate">{lesson.title}</span>
                    <span className="text-xs opacity-70 ml-auto">{lesson.duration}m</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </aside>
      <div className="flex-1 min-w-0">
        {selectedLesson ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedLesson.title}</h3>
              <Button
                size="sm"
                onClick={() => handleComplete(selectedLesson.id)}
                disabled={completedSet.has(selectedLesson.id)}
              >
                {completedSet.has(selectedLesson.id) ? "Completada" : "Marcar como completada"}
              </Button>
            </CardHeader>
            <CardContent>
              {selectedLesson.videoUrl && (
                <div className="mb-4 rounded-lg overflow-hidden bg-black">
                  <video
                    src={selectedLesson.videoUrl}
                    controls
                    className="w-full"
                  />
                </div>
              )}
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <ChevronRight className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Selecciona una lección para comenzar</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
