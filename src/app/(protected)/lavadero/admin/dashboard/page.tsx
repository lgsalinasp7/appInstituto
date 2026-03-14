"use client";

import dynamic from "next/dynamic";

const DashboardView = dynamic(
  () => import("@/modules/lavadero/components/DashboardView").then((m) => m.DashboardView),
  { ssr: false }
);

export default function LavaderoAdminDashboardPage() {
  return <DashboardView />;
}
