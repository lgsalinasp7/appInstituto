import { LessonViewer } from "@/modules/academia/components/student/LessonViewer";

export default async function AcademiaStudentCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LessonViewer courseId={id} />;
}
