import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AcademyEnrollmentService } from "@/modules/academia";
import { CourseList } from "@/modules/academia/components/student/CourseList";

export default async function AcademiaStudentCoursesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const enrollments = await AcademyEnrollmentService.listByUser(user.id);

  const data = enrollments.map((e) => ({
    id: e.id,
    courseId: e.courseId,
    cohortId: e.cohortId,
    status: e.status,
    progress: Number(e.progress),
    course: {
      id: e.course.id,
      title: e.course.title,
      description: e.course.description ?? "",
      level: e.course.level,
    },
  }));

  return <CourseList initialEnrollments={data} />;
}
