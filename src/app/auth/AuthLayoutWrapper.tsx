/**
 * AuthLayoutWrapper - Server Component
 * Obtiene el branding del tenant y lo pasa al AuthLayoutClient.
 * Redirige a /suspended si el tenant está suspendido o cancelado.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTenantBrandingCached } from "@/components/providers/TenantThemeProvider";
import { prisma } from "@/lib/prisma";
import AuthLayoutClient from "./AuthLayoutClient";

async function getTenantFromHeaders() {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug");

  if (!tenantSlug) {
    return null;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
    },
  });

  return tenant;
}

export default async function AuthLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantFromHeaders();

  // Redirigir a /suspended si el tenant está suspendido o cancelado
  if (tenant && (tenant.status === "SUSPENDIDO" || tenant.status === "CANCELADO")) {
    redirect("/suspended");
  }

  // Si no hay tenant, usar valores por defecto
  const branding = tenant
    ? await getTenantBrandingCached(tenant.id)
    : {
        logoUrl: null,
        primaryColor: "#1e3a5f",
        secondaryColor: "#3b82f6",
        accentColor: "#10b981",
        loginBgGradient: "linear-gradient(135deg, #0f2847 0%, #1e3a5f 50%, #2d4a6f 100%)",
        footerText: null,
      };

  const tenantName = tenant?.name || "Plataforma Educativa";

  return (
    <AuthLayoutClient branding={branding} tenantName={tenantName}>
      {children}
    </AuthLayoutClient>
  );
}
