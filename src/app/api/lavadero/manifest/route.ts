import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug");

  let tenantName = "Lavadero Pro";
  let primaryColor = "#0e7490";
  let secondaryColor = "#06b6d4";

  if (tenantSlug) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: { branding: true },
    });
    if (tenant) {
      tenantName = tenant.name;
      if (tenant.branding) {
        primaryColor = tenant.branding.primaryColor;
        secondaryColor = tenant.branding.secondaryColor;
      }
    }
  }

  const manifest = {
    name: tenantName,
    short_name: tenantName,
    description: "Sistema de gestión de lavadero de autos",
    start_url: "/lavadero",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: primaryColor,
    icons: [
      { src: "/logo-instituto.png", sizes: "192x192", type: "image/png" },
      { src: "/logo-instituto.png", sizes: "512x512", type: "image/png" },
    ],
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
