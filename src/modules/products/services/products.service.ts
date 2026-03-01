import { prisma } from '@/lib/prisma';
import { TenantsService } from '@/modules/tenants/services/tenants.service';
import type {
  CreateProductTemplateData,
  UpdateProductTemplateData,
  DeployProductData,
  DeployResult,
} from '../types';

export class ProductsService {
  /**
   * Obtener todas las plantillas activas
   */
  static async getAll() {
    return prisma.productTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Obtener plantilla por ID
   */
  static async getById(id: string) {
    return prisma.productTemplate.findUnique({
      where: { id },
    });
  }

  /**
   * Crear plantilla
   */
  static async create(data: CreateProductTemplateData) {
    return prisma.productTemplate.create({
      data,
    });
  }

  /**
   * Actualizar plantilla
   */
  static async update(id: string, data: UpdateProductTemplateData) {
    return prisma.productTemplate.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft delete (isActive=false)
   */
  static async delete(id: string) {
    return prisma.productTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Desplegar un tenant desde una plantilla de producto
   */
  static async deploy(productId: string, data: DeployProductData): Promise<DeployResult> {
    const template = await prisma.productTemplate.findUnique({
      where: { id: productId },
    });

    if (!template) {
      throw new Error('Plantilla de producto no encontrada');
    }

    if (!template.isActive) {
      throw new Error('La plantilla de producto no está activa');
    }

    // Verificar disponibilidad del slug
    const slugAvailable = await TenantsService.isSlugAvailable(data.tenantSlug);
    if (!slugAvailable) {
      throw new Error(`El slug "${data.tenantSlug}" ya está en uso`);
    }

    // Crear tenant usando TenantsService
    const tenantResult = await TenantsService.create({
      name: data.tenantName,
      slug: data.tenantSlug,
      domain: data.domain || template.domain || undefined,
      email: data.adminEmail,
      plan: template.plan,
      adminName: data.adminName || template.adminName || data.tenantName,
      adminPassword: data.adminPassword,
      autoGenerateAdminPassword: data.autoGeneratePassword !== false && !data.adminPassword,
    });

    // Aplicar branding desde template
    await prisma.tenantBranding.upsert({
      where: { tenantId: tenantResult.id },
      create: {
        tenantId: tenantResult.id,
        logoUrl: template.logoUrl,
        primaryColor: template.primaryColor,
        secondaryColor: template.secondaryColor,
        accentColor: template.accentColor,
        darkMode: template.darkMode,
        footerText: template.footerText,
      },
      update: {
        logoUrl: template.logoUrl,
        primaryColor: template.primaryColor,
        secondaryColor: template.secondaryColor,
        accentColor: template.accentColor,
        darkMode: template.darkMode,
        footerText: template.footerText,
      },
    });

    // Incrementar deployCount
    await prisma.productTemplate.update({
      where: { id: productId },
      data: { deployCount: { increment: 1 } },
    });

    return {
      tenantId: tenantResult.id,
      tenantSlug: data.tenantSlug,
      adminEmail: data.adminEmail,
      generatedPassword: tenantResult.generatedAdminPassword,
    };
  }
}
