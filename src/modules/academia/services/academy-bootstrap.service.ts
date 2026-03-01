import { TenantsService } from "@/modules/tenants/services/tenants.service";
import { KALED_ACADEMY_CONFIG } from "../config/academy-tenant.config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function applyAcademyBranding(tenantId: string) {
  await prisma.tenantBranding.upsert({
    where: { tenantId },
    update: {
      logoUrl: KALED_ACADEMY_CONFIG.branding.logoUrl,
      primaryColor: KALED_ACADEMY_CONFIG.branding.primaryColor,
      secondaryColor: KALED_ACADEMY_CONFIG.branding.secondaryColor,
      accentColor: KALED_ACADEMY_CONFIG.branding.accentColor,
      darkMode: KALED_ACADEMY_CONFIG.branding.darkMode,
      footerText: KALED_ACADEMY_CONFIG.branding.footerText,
    },
    create: {
      tenantId,
      logoUrl: KALED_ACADEMY_CONFIG.branding.logoUrl,
      primaryColor: KALED_ACADEMY_CONFIG.branding.primaryColor,
      secondaryColor: KALED_ACADEMY_CONFIG.branding.secondaryColor,
      accentColor: KALED_ACADEMY_CONFIG.branding.accentColor,
      darkMode: KALED_ACADEMY_CONFIG.branding.darkMode,
      footerText: KALED_ACADEMY_CONFIG.branding.footerText,
    },
  });
}

async function ensureAcademyRoles(tenantId: string) {
  const roleNames = ["Administrador", "Usuario"];
  for (const name of roleNames) {
    const existing = await prisma.role.findFirst({
      where: { tenantId, name },
    });
    if (!existing) {
      await prisma.role.create({
        data: {
          tenantId,
          name,
          description: name === "Usuario" ? "Usuario de Academia" : "Administrador del tenant",
        },
      });
    }
  }
}

async function ensureAcademyAdmin(tenantId: string) {
  const configuredAdminEmail = KALED_ACADEMY_CONFIG.admin.email;
  const tenantAdmin = await prisma.user.findFirst({
    where: { tenantId, email: configuredAdminEmail },
  });

  if (tenantAdmin) {
    return null;
  }

  const role =
    (await prisma.role.findFirst({
      where: { tenantId, name: "Administrador" },
    })) ||
    (await prisma.role.create({
      data: {
        tenantId,
        name: "Administrador",
        description: "Administrador del tenant",
      },
    }));

  const existingEmail = await prisma.user.findUnique({
    where: { email: configuredAdminEmail },
    select: { id: true, tenantId: true },
  });

  if (existingEmail && existingEmail.tenantId !== tenantId) {
    throw new Error(
      `El email ${configuredAdminEmail} ya existe en otro tenant. Usa otro correo para el admin de Kaled Academy.`
    );
  }

  const tempPassword = TenantsService.generateTemporaryPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  await prisma.user.create({
    data: {
      tenantId,
      roleId: role.id,
      name: KALED_ACADEMY_CONFIG.admin.name,
      email: configuredAdminEmail,
      password: hashedPassword,
      isActive: true,
      mustChangePassword: true,
      platformRole: "ACADEMY_ADMIN",
    },
  });

  return tempPassword;
}

export const AcademyBootstrapService = {
  async createOrGetBaseTenant() {
    const slug = KALED_ACADEMY_CONFIG.tenant.slug;
    const existing = await TenantsService.getBySlug(slug);

    if (existing) {
      await prisma.tenant.update({
        where: { id: existing.id },
        data: {
          domain: KALED_ACADEMY_CONFIG.tenant.domain,
          status: KALED_ACADEMY_CONFIG.tenant.status,
        },
      });

      await applyAcademyBranding(existing.id);
      await ensureAcademyRoles(existing.id);
      const tempPassword = await ensureAcademyAdmin(existing.id);

      return { tenant: existing, created: false as const, tempPassword };
    }

    const created = await TenantsService.create({
      name: KALED_ACADEMY_CONFIG.tenant.name,
      slug: KALED_ACADEMY_CONFIG.tenant.slug,
      domain: KALED_ACADEMY_CONFIG.tenant.domain,
      email: KALED_ACADEMY_CONFIG.admin.email,
      adminName: KALED_ACADEMY_CONFIG.admin.name,
      plan: KALED_ACADEMY_CONFIG.tenant.plan,
      autoGenerateAdminPassword: true,
    });

    await applyAcademyBranding(created.id);
    await ensureAcademyRoles(created.id);

    return {
      tenant: created,
      created: true as const,
      tempPassword: created.generatedAdminPassword || null,
    };
  },
};
