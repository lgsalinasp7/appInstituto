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
};
