import { CplDashboard } from "@/modules/campaigns/components/CplDashboard";
import { CampaignCostImporter } from "@/modules/campaigns/components/CampaignCostImporter";
import { TelegramConfig } from "@/modules/telegram/components/TelegramConfig";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";

export default function AdminCampaignsPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <DashboardHeader
        title="Dashboard de"
        titleHighlight="Campañas"
        subtitle="Monitorea CPL, leads estancados y rendimiento por campaña"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CampaignCostImporter />
        <TelegramConfig />
      </div>

      <CplDashboard />
    </div>
  );
}
