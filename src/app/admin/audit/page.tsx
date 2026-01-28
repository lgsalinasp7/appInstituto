
import { AdminService } from "@/modules/admin/services/admin.service";
import { AuditLogTable } from "@/modules/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  // Fetch latest 100 logs
  const { logs } = await AdminService.getAuditLogs({ limit: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Registro de Auditoría</h2>
        <p className="text-muted-foreground">
          Historial de todas las acciones del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input placeholder="Filtrar por acción..." className="max-w-xs" />
            <Input placeholder="Filtrar por entidad..." className="max-w-xs" />
            <Input type="date" className="max-w-xs" />
          </div>
        </CardContent>
      </Card>

      <AuditLogTable logs={logs} />
    </div>
  );
}
