/**
 * ProtectedLayoutWrapper - Server Component
 * 
 * Responsabilidades:
 * 1. Resolver tenant desde x-tenant-slug
 * 2. Redirigir a /suspended si el tenant está SUSPENDIDO/CANCELADO
 * 3. Inyectar TenantThemeProvider + BrandingProvider
 */

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TenantThemeProvider, getTenantBrandingCached } from "@/components/providers/TenantThemeProvider";
import { BrandingProvider } from "@/components/providers/BrandingContext";
import { prisma } from "@/lib/prisma";
import ProtectedLayoutClient from "./ProtectedLayoutClient";

// React.cache() deduplicates within the same request render tree
const getTenantData = cache(async () => {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug");

  if (!tenantSlug) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true, name: true, slug: true, status: true, subscriptionEndsAt: true },
  });

  return tenant;
});

export default async function ProtectedLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantData();

  // Las rutas protegidas tenant deben ejecutarse solo con tenant resuelto.
  if (!tenant) {
    redirect("/auth/login");
  }

  // Redirigir a /suspended si el tenant está SUSPENDIDO o CANCELADO
  if (tenant.status === "SUSPENDIDO" || tenant.status === "CANCELADO") {
    redirect("/suspended");
  }

  // Calcular días restantes de suscripción
  let daysRemaining = Infinity;
  if (tenant.subscriptionEndsAt) {
    const now = new Date();
    const end = new Date(tenant.subscriptionEndsAt);
    const diffTime = end.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Obtener branding cacheado
  const branding = await getTenantBrandingCached(tenant.id);

  // Importación dinámica para evitar problemas de componentes servidor-cliente
  const { SubscriptionWarningBanner } = await import("@/components/ui/subscription-banner");

  // Inyectar TenantThemeProvider (CSS vars) + BrandingProvider (React Context)
  return (
    <TenantThemeProvider tenantId={tenant.id}>
      <BrandingProvider
        branding={{
          tenantName: tenant.name,
          logoUrl: branding.logoUrl,
          primaryColor: branding.primaryColor,
          secondaryColor: branding.secondaryColor,
          accentColor: branding.accentColor,
          fontFamily: branding.fontFamily,
          footerText: branding.footerText,
          darkMode: branding.darkMode,
        }}
      >
        <ProtectedLayoutClient>
          <SubscriptionWarningBanner daysRemaining={daysRemaining} />
          {children}
        </ProtectedLayoutClient>
      </BrandingProvider>
    </TenantThemeProvider>
  );
}
