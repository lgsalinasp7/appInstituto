import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LessonViewClient } from "@/modules/academia/components/student/LessonViewClient";

export default async function AcademiaStudentLessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { id: courseId, lessonId } = await params;

  return (
    <LessonViewClient
      courseId={courseId}
      lessonId={lessonId}
      userId={user.id}
    />
  );
}
