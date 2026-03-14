"use client";

import dynamic from "next/dynamic";

const ServicesCatalogView = dynamic(
  () => import("@/modules/lavadero/components/ServicesCatalogView").then((m) => m.ServicesCatalogView),
  { ssr: false }
);

export default function LavaderoAdminServicesPage() {
  return <ServicesCatalogView />;
}
