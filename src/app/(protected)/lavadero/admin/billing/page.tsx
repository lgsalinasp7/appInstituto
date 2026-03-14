"use client";

import dynamic from "next/dynamic";

const BillingView = dynamic(
  () => import("@/modules/lavadero/components/BillingView").then((m) => m.BillingView),
  { ssr: false }
);

export default function LavaderoAdminBillingPage() {
  return <BillingView />;
}
