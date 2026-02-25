import type { Metadata } from "next";
import { KaledLeadService } from "@/modules/masterclass";
import LeadsClient from "./LeadsClient";

export const metadata: Metadata = {
  title: "Leads | Admin KaledSoft",
  description: "Pipeline comercial de la plataforma KaledSoft",
};

export default async function LeadsPage() {
  const leads = await KaledLeadService.getAllLeads();

  return <LeadsClient initialLeads={leads} />;
}
