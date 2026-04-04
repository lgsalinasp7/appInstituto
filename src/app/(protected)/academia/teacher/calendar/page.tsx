import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminCalendarView } from "@/modules/academia/components/admin/AdminCalendarView";

export default async function AcademiaTeacherCalendarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white font-display">Mi Calendario</h1>
        <p className="text-slate-400 mt-1 text-base">
          Sesiones programadas de tus cohortes asignados.
        </p>
      </header>
      <AdminCalendarView />
    </div>
  );
}
