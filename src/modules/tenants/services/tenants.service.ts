/**
 * Tenants Service
 * Service for super-admin tenant management
 */

import { prisma } from '@/lib/prisma';
import type {
  Tenant,
  TenantWithDetails,
  CreateTenantData,
  UpdateTenantData,
  TenantFilters,
  TenantsListResponse,
  TenantStats,
} from '../types';

export const TenantsService = {
  /**
   * Get all tenants with pagination and filters
   */
  async getAll(filters: TenantFilters = {}): Promise<TenantsListResponse> {
    const { search, status, plan, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

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
    const { name, slug, email, plan = 'BASICO', adminName, adminPassword } = data;

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
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

    // Create admin user if credentials provided
    let adminUser = null;
    if (email && adminPassword) {
      // Import bcrypt for password hashing
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      adminUser = await prisma.user.create({
        data: {
          name: adminName || name,
          email,
          password: hashedPassword,
          roleId: adminRole.id,
          tenantId: tenant.id,
          isActive: true,
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
   */
  async resetAdminPassword(tenantId: string, newPassword: string): Promise<{ email: string; tempPassword: string }> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
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
      data: { password: hashedPassword },
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
};
