import prisma from "@/lib/prisma";
import { AdminService } from "@/modules/admin/services/admin.service";
import type { Metadata } from "next";
import { ConfigClient } from "./ConfigClient";

export const metadata: Metadata = {
  title: "Configuración | Admin KaledSoft",
  description: "Configuración general de la plataforma KaledSoft",
};

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  // Promise.all for parallel data loading (async-parallel)
  const [roles, platformConfigs] = await Promise.all([
    AdminService.getRoles().catch(() => []),
    prisma.systemConfig.findMany({
      where: { tenantId: null as unknown as string },
      select: { key: true, value: true },
    }).catch(() => []),
  ]);

  // server-serialization: only pass serializable data
  const configMap: Record<string, string> = {};
  for (const cfg of platformConfigs) {
    configMap[cfg.key] = cfg.value;
  }

  const serializedRoles = roles.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    permissions: r.permissions as string[],
    usersCount: r._count?.users ?? 0,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Configuración</h1>
        <p className="text-slate-400 mt-1">
          Ajustes generales de la plataforma KaledSoft
        </p>
      </div>

      <ConfigClient roles={serializedRoles} platformConfig={configMap} />
    </div>
  );
}
