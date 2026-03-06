/**
 * Tenant Detail Page
 * Super-admin tenant management detail view
 */

import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { TenantsService } from "@/modules/tenants";
import { TenantDetailView } from "@/modules/tenants/components/TenantDetailView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [tenant, user] = await Promise.all([
    TenantsService.getByIdOrSlug(id),
    getCurrentUser(),
  ]);

  if (!tenant) {
    notFound();
  }

  const isSuperAdmin =
    user?.role?.name?.toUpperCase() === "SUPERADMIN" ||
    user?.platformRole === "SUPER_ADMIN";
  const canInviteAcademy =
    tenant.slug === "kaledacademy" && isSuperAdmin;

  return (
    <TenantDetailView
      tenant={tenant}
      canInviteAcademy={canInviteAcademy}
    />
  );
}
