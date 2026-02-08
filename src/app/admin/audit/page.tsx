
import { AdminService } from "@/modules/admin/services/admin.service";
import { AuditLogTable } from "@/modules/admin";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  // Fetch latest 100 logs
  const { logs } = await AdminService.getAuditLogs({ limit: 100 });

  return (
    <div className="space-y-14 animate-fade-in-up">
      {/* Header */}
      <DashboardHeader
        title="Registro de"
        titleHighlight="Auditoría"
        subtitle="Monitorización completa y trazabilidad de todas las acciones del ecosistema."
      />

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-[2rem] border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Filtrar por acción (login, update...)"
            className="flex-1 bg-slate-950/40 border-white/5 h-12 rounded-xl text-white placeholder:text-slate-500 focus:ring-cyan-500/20"
          />
          <Input
            placeholder="Entidad (User, Tenant...)"
            className="flex-1 bg-slate-950/40 border-white/5 h-12 rounded-xl text-white placeholder:text-slate-500 focus:ring-cyan-500/20"
          />
          <Input
            type="date"
            className="w-full md:w-[200px] bg-slate-950/40 border-white/5 h-12 rounded-xl text-white focus:ring-cyan-500/20"
          />
        </div>
      </div>

      <AuditLogTable logs={logs} />
    </div>
  );
}
