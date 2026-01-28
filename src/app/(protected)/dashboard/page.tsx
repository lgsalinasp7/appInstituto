
import { EnrollmentDashboard } from "@/modules/dashboard/components/EnrollmentDashboard";
import { DashboardService } from "@/modules/dashboard/services/dashboard.service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await DashboardService.getDashboardStats();

  return <EnrollmentDashboard stats={stats} />;
}
