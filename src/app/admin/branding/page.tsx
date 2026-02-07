import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { BrandingClient } from "./BrandingClient";

export const metadata: Metadata = {
  title: "Branding | Admin KaledSoft",
  description: "Personalización visual de tenants",
};

export const dynamic = "force-dynamic";

export default async function BrandingPage() {
  // server-serialization: only pass minimal data
  const tenants = await prisma.tenant.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
    },
  });

  const serializedTenants = tenants.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    status: t.status,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Branding por Tenant</h1>
        <p className="text-slate-400 mt-1">
          Personaliza la apariencia visual de cada empresa en la plataforma
        </p>
      </div>

      <BrandingClient tenants={serializedTenants} />
    </div>
  );
}
