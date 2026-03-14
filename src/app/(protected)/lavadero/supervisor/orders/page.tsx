"use client";

import dynamic from "next/dynamic";

const OrdersKanbanView = dynamic(
  () => import("@/modules/lavadero/components/OrdersKanbanView").then((m) => m.OrdersKanbanView),
  { ssr: false }
);

export default function LavaderoSupervisorOrdersPage() {
  return <OrdersKanbanView readOnly />;
}
