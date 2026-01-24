/**
 * Admin Audit Page
 * Audit log viewer for administrators
 */

import { AuditLogTable, type AuditLogEntry } from "@/modules/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Mock audit logs - replace with actual data from AdminService.getAuditLogs()
const mockLogs: AuditLogEntry[] = [
  {
    id: "1",
    action: "user.create",
    entity: "User",
    entityId: "user_123",
    userId: "admin_1",
    metadata: { email: "new@example.com" },
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    action: "user.update",
    entity: "User",
    entityId: "user_456",
    userId: "admin_1",
    metadata: { fields: ["name", "email"] },
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "3",
    action: "role.update",
    entity: "Role",
    entityId: "role_2",
    userId: "admin_1",
    metadata: { permissions: ["added: users:delete"] },
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "4",
    action: "user.login",
    entity: "Session",
    entityId: null,
    userId: "user_789",
    metadata: null,
    ipAddress: "10.0.0.5",
    userAgent: "Chrome/120",
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
  },
];

export default function AdminAuditPage() {
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

      <AuditLogTable logs={mockLogs} />
    </div>
  );
}
