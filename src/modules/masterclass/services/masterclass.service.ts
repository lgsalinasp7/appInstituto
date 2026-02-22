/**
 * Masterclass Service
 * Lógica de negocio para gestión de masterclasses
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { MasterclassPublic, MasterclassFull } from '../types';

export class MasterclassService {
  /**
   * Obtener todas las masterclasses de un tenant
   */
  static async getAll(tenantId: string): Promise<MasterclassFull[]> {
    return prisma.masterclass.findMany({
      where: { tenantId },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  /**
   * Obtener una masterclass por ID (admin)
   */
  static async getById(id: string, tenantId: string): Promise<MasterclassFull | null> {
    return prisma.masterclass.findFirst({
      where: { id, tenantId },
    });
  }

  /**
   * Obtener masterclass pública por slug (sin meetingUrl)
   */
  static async getBySlug(slug: string, tenantId: string): Promise<MasterclassPublic | null> {
    const masterclass = await prisma.masterclass.findFirst({
      where: {
        slug,
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        scheduledAt: true,
        duration: true,
        slug: true,
      },
    });

    return masterclass;
  }

  /**
   * Crear nueva masterclass
   */
  static async create(data: Prisma.MasterclassCreateInput): Promise<MasterclassFull> {
    return prisma.masterclass.create({
      data,
    });
  }

  /**
   * Actualizar masterclass
   */
  static async update(id: string, tenantId: string, data: Prisma.MasterclassUpdateInput): Promise<MasterclassFull> {
    // Verificar que la masterclass pertenece al tenant
    const existing = await prisma.masterclass.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new Error('Masterclass no encontrada');
    }

    return prisma.masterclass.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar masterclass
   */
  static async delete(id: string, tenantId: string): Promise<MasterclassFull> {
    return prisma.masterclass.delete({
      where: { id },
    });
  }

  /**
   * Obtener próximas masterclasses activas
   */
  static async getUpcoming(tenantId: string, limit = 5): Promise<MasterclassPublic[]> {
    return prisma.masterclass.findMany({
      where: {
        tenantId,
        isActive: true,
        scheduledAt: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        scheduledAt: true,
        duration: true,
        slug: true,
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
    });
  }
}
