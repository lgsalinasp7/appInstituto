import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminCalendarAndCohortsView } from "@/modules/academia/components/admin/AdminCalendarAndCohortsView";

export default async function AcademiaAdminCalendarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return <AdminCalendarAndCohortsView />;
}
