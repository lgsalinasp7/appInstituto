import type { Metadata } from "next";
import { KaledLeadService } from "@/modules/masterclass";
import { resolveKaledTenantId } from '@/lib/kaled-tenant';
import LeadsClient from "./LeadsClient";

export const metadata: Metadata = {
  title: "Leads | Admin KaledSoft",
  description: "Pipeline comercial de la plataforma KaledSoft",
};

export default async function LeadsPage() {
  const tenantId = await resolveKaledTenantId();
  const leads = await KaledLeadService.getAllLeads(tenantId);

  return <LeadsClient initialLeads={leads} />;
}
