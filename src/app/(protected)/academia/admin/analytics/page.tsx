import { AdminAnalyticsOverview } from "@/modules/academia/components/admin/AdminAnalyticsOverview";

export default function AcademiaAdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black tracking-tight text-white font-display">Analytics</h1>
      <AdminAnalyticsOverview />
    </div>
  );
}
