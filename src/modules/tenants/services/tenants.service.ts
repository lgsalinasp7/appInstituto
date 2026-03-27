/**
 * Tenants Service
 * Service for super-admin tenant management
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type {
  Tenant,
  TenantWithDetails,
  CreateTenantData,
  UpdateTenantData,
  TenantFilters,
  TenantsListResponse,
  TenantStats,
} from '../types';

/** Valor por defecto de invitationLimit para el usuario admin al crear un tenant. */
const DEFAULT_ADMIN_INVITATION_LIMIT = 10;

export const TenantsService = {
  /**
   * Get all tenants with pagination and filters
   */
  async getAll(filters: TenantFilters = {}): Promise<TenantsListResponse> {
    const { search, status, plan, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.TenantWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (plan) {
      where.plan = plan;
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              students: true,
              payments: true,
            },
          },
          branding: {
            select: { logoUrl: true },
          },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    return {
      tenants: tenants as Tenant[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get tenant by ID or slug with full details (for detail page)
   * Slug lookup is case-insensitive. Also accepts "kaledacademy" -> "kaled-academy".
   */
  async getByIdOrSlug(idOrSlug: string): Promise<TenantWithDetails | null> {
    const slugVariants =
      idOrSlug.toLowerCase() === 'kaledacademy'
        ? ['kaledacademy', 'kaled-academy']
        : [idOrSlug];

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          ...slugVariants.map((s) => ({ slug: { equals: s, mode: 'insensitive' as const } })),
        ],
      },
      include: {
        users: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
            academyEnrollments: {
              where: { isTrial: true },
              take: 1,
              select: { id: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            users: true,
            students: true,
            payments: true,
          },
        },
        branding: {
          select: { logoUrl: true },
        },
      },
    });

    if (!tenant) return null;

    const adminUser = tenant.users.find(
      (u) => u.role?.name?.toLowerCase().includes('admin')
    ) || tenant.users[0] || null;

    return {
      ...tenant,
      adminUser: adminUser ? {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        isActive: adminUser.isActive,
        role: adminUser.role!,
        createdAt: adminUser.createdAt,
      } : null,
    } as TenantWithDetails;
  },

  /**
   * Get tenant by ID with details
   */
  async getById(id: string): Promise<TenantWithDetails | null> {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            users: true,
            students: true,
            payments: true,
          },
        },
        branding: {
          select: { logoUrl: true },
        },
      },
    });

    if (!tenant) return null;

    // Find admin user (first user or user with admin role)
    const adminUser = tenant.users.find(
      (u) => u.role?.name?.toLowerCase().includes('admin')
    ) || tenant.users[0] || null;

    return {
      ...tenant,
      adminUser: adminUser ? {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        isActive: adminUser.isActive,
        role: adminUser.role!,
        createdAt: adminUser.createdAt,
      } : null,
    } as TenantWithDetails;
  },

  /**
   * Get tenant by slug
   */
  async getBySlug(slug: string): Promise<Tenant | null> {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            users: true,
            students: true,
            payments: true,
          },
        },
      },
    });

    return tenant as Tenant | null;
  },

  /**
   * Create a new tenant with optional admin user
   */
  async create(data: CreateTenantData): Promise<TenantWithDetails> {
    const {
      name,
      slug,
      domain,
      email,
      plan = 'BASICO',
      adminName,
      adminPassword,
      autoGenerateAdminPassword = false,
      adminInvitationLimit,
    } = data;

    const generatedPassword =
      autoGenerateAdminPassword && !adminPassword ? this.generateTemporaryPassword() : undefined;
    const effectiveAdminPassword = adminPassword || generatedPassword;

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        domain,
        email,
        plan,
        status: 'ACTIVO',
        subscriptionEndsAt: data.subscriptionEndsAt || null,
      },
    });

    // Create default admin role for tenant
    const adminRole = await prisma.role.create({
      data: {
        name: 'Administrador',
        description: 'Administrador del tenant',
        tenantId: tenant.id,
      },
    });

    // Create optional "Usuario" role so admin can invite users with a non-admin role
    await prisma.role.create({
      data: {
        name: 'Usuario',
        description: 'Usuario estándar del tenant',
        tenantId: tenant.id,
      },
    });

    // Create admin user if credentials provided
    let adminUser = null;
    const effectiveInvitationLimit = adminInvitationLimit ?? DEFAULT_ADMIN_INVITATION_LIMIT;

    if (email && effectiveAdminPassword) {
      // Import bcrypt for password hashing
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(effectiveAdminPassword, 10);

      adminUser = await prisma.user.create({
        data: {
          name: adminName || name,
          email,
          password: hashedPassword,
          roleId: adminRole.id,
          tenantId: tenant.id,
          isActive: true,
          mustChangePassword: true,
          invitationLimit: effectiveInvitationLimit,
        },
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    return {
      ...tenant,
      _count: { users: adminUser ? 1 : 0, students: 0, payments: 0 },
      users: adminUser ? [{
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        isActive: adminUser.isActive,
        role: adminUser.role!,
        createdAt: adminUser.createdAt,
      }] : [],
      adminUser: adminUser ? {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        isActive: adminUser.isActive,
        role: adminUser.role!,
        createdAt: adminUser.createdAt,
      } : null,
      generatedAdminPassword: generatedPassword,
    } as TenantWithDetails;
  },

  /**
   * Update tenant
   */
  async update(id: string, data: UpdateTenantData): Promise<Tenant> {
    const tenant = await prisma.tenant.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            users: true,
            students: true,
            payments: true,
          },
        },
      },
    });

    return tenant as Tenant;
  },

  /**
   * Suspend tenant
   */
  async suspend(id: string): Promise<Tenant> {
    return this.update(id, { status: 'SUSPENDIDO' });
  },

  /**
   * Activate tenant
   */
  async activate(id: string): Promise<Tenant> {
    return this.update(id, { status: 'ACTIVO' });
  },

  /**
   * Cancel tenant
   */
  async cancel(id: string): Promise<Tenant> {
    return this.update(id, { status: 'CANCELADO' });
  },

  /**
   * Delete tenant (soft delete by setting status to CANCELADO)
   */
  async delete(id: string): Promise<void> {
    await prisma.tenant.update({
      where: { id },
      data: { status: 'CANCELADO' },
    });
  },

  /**
   * Get tenant statistics
   */
  async getStats(): Promise<TenantStats> {
    const [total, activos, pendientes, suspendidos, cancelados] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVO' } }),
      prisma.tenant.count({ where: { status: 'PENDIENTE' } }),
      prisma.tenant.count({ where: { status: 'SUSPENDIDO' } }),
      prisma.tenant.count({ where: { status: 'CANCELADO' } }),
    ]);

    return {
      total,
      activos,
      pendientes,
      suspendidos,
      cancelados,
    };
  },

  /**
   * Reset admin password for tenant
   * Acepta id (cuid) o slug del tenant
   */
  async resetAdminPassword(tenantIdOrSlug: string, newPassword: string): Promise<{ email: string; tempPassword: string }> {
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { id: tenantIdOrSlug },
          { slug: { equals: tenantIdOrSlug, mode: 'insensitive' } },
        ],
      },
      include: {
        users: {
          include: { role: true },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    if (!tenant || tenant.users.length === 0) {
      throw new Error('Tenant o usuario admin no encontrado');
    }

    const adminUser = tenant.users[0];
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
      },
    });

    return {
      email: adminUser.email,
      tempPassword: newPassword,
    };
  },

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.tenant.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    return !existing;
  },

  generateTemporaryPassword(length = 12): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  },

  /**
   * Update a tenant user (name, email, and optionally set temp password)
   */
  async updateTenantUser(
    tenantId: string,
    userId: string,
    data: { name?: string; email?: string; setTempPassword?: boolean }
  ): Promise<{ tempPassword?: string }> {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      throw new Error('Usuario no encontrado o no pertenece al tenant');
    }

    const updateData: { name?: string; email?: string; password?: string; mustChangePassword?: boolean } = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim() || undefined;
    }
    if (data.email !== undefined) {
      const email = data.email.trim();
      if (!email) throw new Error('El email no puede estar vacío');
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (existing) throw new Error('Ya existe un usuario con ese email');
      updateData.email = email;
    }

    let tempPassword: string | undefined;
    if (data.setTempPassword) {
      tempPassword = this.generateTemporaryPassword(12);
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.hash(tempPassword, 10);
      updateData.mustChangePassword = true;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return tempPassword ? { tempPassword } : {};
  },

  /**
   * Eliminación definitiva de un usuario del instituto (solo SUPER_ADMIN de plataforma vía API).
   * Reasigna pagos, prospectos, cursos y anuncios a otro usuario del mismo tenant.
   * Bloquea si el usuario es asesor de estudiantes del instituto.
   */
  async deleteTenantUserPermanently(
    tenantIdOrSlug: string,
    targetUserId: string,
    options: { actorUserId: string }
  ): Promise<void> {
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { id: tenantIdOrSlug },
          { slug: { equals: tenantIdOrSlug, mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    });
    if (!tenant) {
      throw new Error('Tenant no encontrado');
    }

    if (options.actorUserId === targetUserId) {
      throw new Error('No puedes eliminar tu propio usuario con esta acción');
    }

    const target = await prisma.user.findFirst({
      where: { id: targetUserId, tenantId: tenant.id },
    });
    if (!target) {
      throw new Error('Usuario no encontrado o no pertenece al instituto');
    }

    const studentAdvisorCount = await prisma.student.count({
      where: { tenantId: tenant.id, advisorId: targetUserId },
    });
    if (studentAdvisorCount > 0) {
      throw new Error(
        `No se puede eliminar: el usuario es asesor de ${studentAdvisorCount} estudiante(s). Reasigna los estudiantes a otro asesor primero.`
      );
    }

    const fallback = await prisma.user.findFirst({
      where: { tenantId: tenant.id, NOT: { id: targetUserId } },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (!fallback) {
      throw new Error(
        'Debe existir al menos otro usuario en el instituto para reasignar pagos, prospectos y cursos vinculados a este usuario.'
      );
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.invitation.deleteMany({
          where: { tenantId: tenant.id, inviterId: targetUserId },
        });
        await tx.invitation.deleteMany({
          where: {
            tenantId: tenant.id,
            email: { equals: target.email, mode: 'insensitive' },
          },
        });

        await tx.payment.updateMany({
          where: { tenantId: tenant.id, registeredById: targetUserId },
          data: { registeredById: fallback.id },
        });
        await tx.prospect.updateMany({
          where: { tenantId: tenant.id, advisorId: targetUserId },
          data: { advisorId: fallback.id },
        });
        await tx.prospectInteraction.updateMany({
          where: { tenantId: tenant.id, advisorId: targetUserId },
          data: { advisorId: null },
        });
        await tx.academyCourse.updateMany({
          where: { tenantId: tenant.id, createdById: targetUserId },
          data: { createdById: fallback.id },
        });
        await tx.academyAnnouncement.updateMany({
          where: { tenantId: tenant.id, authorId: targetUserId },
          data: { authorId: fallback.id },
        });
        await tx.academyDeliverableSubmission.updateMany({
          where: { reviewedById: targetUserId },
          data: { reviewedById: null },
        });
        await tx.kaledLeadInteraction.updateMany({
          where: { userId: targetUserId },
          data: { userId: null },
        });
        await tx.lavaderoOrder.updateMany({
          where: { tenantId: tenant.id, createdBy: targetUserId },
          data: { createdBy: fallback.id },
        });
        await tx.lavaderoPayment.updateMany({
          where: { tenantId: tenant.id, createdBy: targetUserId },
          data: { createdBy: fallback.id },
        });

        await tx.user.delete({ where: { id: targetUserId } });
      });
    } catch (e: unknown) {
      const code = typeof e === 'object' && e !== null && 'code' in e ? String((e as { code: string }).code) : '';
      if (code === 'P2003') {
        throw new Error(
          'No se puede eliminar: aún hay registros en el sistema que referencian a este usuario. Contacta soporte o revisa pagos, prospectos y contenido de academia.'
        );
      }
      throw e;
    }
  },
};
