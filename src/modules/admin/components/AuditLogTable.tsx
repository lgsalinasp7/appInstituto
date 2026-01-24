"use client";

/**
 * Audit Log Table Component
 * Displays audit logs in a table format
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AuditLogEntry } from "../types";

interface AuditLogTableProps {
  logs: AuditLogEntry[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("create")) return "default";
    if (action.includes("update")) return "secondary";
    if (action.includes("delete")) return "destructive";
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Auditoría</CardTitle>
        <CardDescription>Historial de acciones del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Fecha</th>
                <th className="text-left py-3 px-2">Acción</th>
                <th className="text-left py-3 px-2">Entidad</th>
                <th className="text-left py-3 px-2">ID Entidad</th>
                <th className="text-left py-3 px-2">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay registros de auditoría
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2 text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">{log.entity}</td>
                    <td className="py-3 px-2 font-mono text-xs">
                      {log.entityId || "-"}
                    </td>
                    <td className="py-3 px-2 font-mono text-xs">
                      {log.userId || "Sistema"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
