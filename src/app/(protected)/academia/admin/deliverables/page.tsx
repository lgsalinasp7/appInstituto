import type { Metadata } from "next";
import { AdminDeliverablesClient } from "@/modules/academia/components/admin/AdminDeliverablesClient";

export const metadata: Metadata = {
  title: "Entregables | Academia",
  description: "Revisión de entregables por cohorte",
  robots: { index: false, follow: true },
};

export default function AdminDeliverablesPage() {
  return <AdminDeliverablesClient />;
}
