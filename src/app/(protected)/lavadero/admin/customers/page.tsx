"use client";

import dynamic from "next/dynamic";

const CustomersView = dynamic(
  () => import("@/modules/lavadero/components/CustomersView").then((m) => m.CustomersView),
  { ssr: false }
);

export default function LavaderoAdminCustomersPage() {
  return <CustomersView />;
}
