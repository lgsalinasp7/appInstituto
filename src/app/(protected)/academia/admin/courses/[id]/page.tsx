import { AdminCourseManageView } from "@/modules/academia/components/admin/AdminCourseManageView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCoursePage({ params }: PageProps) {
  const { id } = await params;
  return <AdminCourseManageView courseId={id} />;
}
