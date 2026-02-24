import { CplDashboard } from "@/modules/campaigns/components/CplDashboard";
import { CampaignCostImporter } from "@/modules/campaigns/components/CampaignCostImporter";
import { TelegramConfig } from "@/modules/telegram/components/TelegramConfig";

export default function AdminCampaignsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Campañas</h1>
        <p className="text-slate-400 mt-1">
          Monitorea CPL, leads estancados y rendimiento por campaña
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CampaignCostImporter />
        <TelegramConfig />
      </div>

      <CplDashboard />
    </div>
  );
}
