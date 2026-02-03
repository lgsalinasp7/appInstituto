/**
 * Tenant Detail Page
 * Super-admin tenant management detail view
 */

import { notFound } from "next/navigation";
import { TenantsService } from "@/modules/tenants";
import { TenantDetailView } from "@/modules/tenants/components/TenantDetailView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tenant = await TenantsService.getById(id);

  if (!tenant) {
    notFound();
  }

  return <TenantDetailView tenant={tenant} />;
}
