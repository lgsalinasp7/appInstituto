import { prisma } from '@/lib/prisma';
import { KaledInteractionType } from '@prisma/client';

export interface CreateInteractionData {
  type: KaledInteractionType;
  content: string;
  metadata?: Record<string, any>;
  kaledLeadId: string;
  userId?: string;
}

export class KaledInteractionService {
  /**
   * Crea una nota en el timeline del lead
   */
  static async createNote(
    leadId: string,
    userId: string,
    content: string
  ) {
    return prisma.kaledLeadInteraction.create({
      data: {
        type: 'NOTA',
        content,
        kaledLeadId: leadId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Registra el envío de un email
   */
  static async logEmail(
    leadId: string,
    userId: string | null,
    emailLogId: string
  ) {
    return prisma.kaledLeadInteraction.create({
      data: {
        type: 'CORREO',
        content: 'Email enviado',
        metadata: { emailLogId },
        kaledLeadId: leadId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Registra una interacción por WhatsApp
   */
  static async logWhatsApp(
    leadId: string,
    userId: string,
    content: string,
    metadata?: Record<string, any>
  ) {
    return prisma.kaledLeadInteraction.create({
      data: {
        type: 'WHATSAPP',
        content,
        metadata,
        kaledLeadId: leadId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Registra una llamada telefónica
   */
  static async logCall(
    leadId: string,
    userId: string,
    content: string,
    duration?: number // en minutos
  ) {
    return prisma.kaledLeadInteraction.create({
      data: {
        type: 'LLAMADA',
        content,
        metadata: duration ? { duration } : undefined,
        kaledLeadId: leadId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Registra una reunión
   */
  static async logMeeting(
    leadId: string,
    userId: string,
    content: string,
    date: Date,
    duration?: number // en minutos
  ) {
    return prisma.kaledLeadInteraction.create({
      data: {
        type: 'REUNION',
        content,
        metadata: {
          meetingDate: date.toISOString(),
          duration,
        },
        kaledLeadId: leadId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Registra un cambio de estado automáticamente
   */
  static async logStatusChange(
    leadId: string,
    oldStatus: string,
    newStatus: string,
    userId?: string
  ) {
    return prisma.kaledLeadInteraction.create({
      data: {
        type: 'CAMBIO_ESTADO',
        content: `Estado cambiado de "${oldStatus}" a "${newStatus}"`,
        metadata: {
          oldStatus,
          newStatus,
        },
        kaledLeadId: leadId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Crea una tarea de seguimiento
   */
  static async createTask(
    leadId: string,
    userId: string,
    content: string,
    dueDate: Date
  ) {
    return prisma.kaledLeadInteraction.create({
      data: {
        type: 'TAREA',
        content,
        metadata: {
          dueDate: dueDate.toISOString(),
          completed: false,
        },
        kaledLeadId: leadId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene el timeline completo de un lead
   */
  static async getTimeline(leadId: string) {
    return prisma.kaledLeadInteraction.findMany({
      where: {
        kaledLeadId: leadId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Obtiene estadísticas de interacciones de un lead
   */
  static async getStats(leadId: string) {
    const interactions = await prisma.kaledLeadInteraction.findMany({
      where: { kaledLeadId: leadId },
      select: { type: true },
    });

    const stats: Record<KaledInteractionType, number> = {
      NOTA: 0,
      CORREO: 0,
      WHATSAPP: 0,
      LLAMADA: 0,
      REUNION: 0,
      CAMBIO_ESTADO: 0,
      TAREA: 0,
    };

    interactions.forEach((interaction) => {
      stats[interaction.type]++;
    });

    return stats;
  }

  /**
   * Crea una interacción genérica
   */
  static async create(data: CreateInteractionData) {
    return prisma.kaledLeadInteraction.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
