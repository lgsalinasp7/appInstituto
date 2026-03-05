import type { Metadata } from "next";
import { headers } from "next/headers";
import { CohortsManagement } from "@/modules/academia/components/admin/CohortsManagement";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "kaledacademy.kaledsoft.tech";
  const protocol = headersList.get("x-forwarded-proto") === "https" ? "https" : "http";
  const canonical = `${protocol}://${host}/academia/admin/cohorts`;
  return {
    title: "Cohortes | Academia",
    description: "Gestión de cohortes de la academia.",
    alternates: { canonical },
    robots: { index: false, follow: true },
  };
}

export default function AcademiaAdminCohortsPage() {
  return <CohortsManagement />;
}
