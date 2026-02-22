import { prisma } from '@/lib/prisma';
import type { EmailSequence, EmailSequenceStep } from '@prisma/client';
import type { CreateSequenceInput, UpdateSequenceInput, CreateStepInput, UpdateStepInput, EmailSequenceWithSteps } from '../types';

export class EmailSequenceService {
    /**
     * Crear secuencia de email
     */
    static async create(data: CreateSequenceInput, tenantId: string): Promise<EmailSequenceWithSteps> {
        const { steps, ...sequenceData } = data;

        const sequence = await prisma.emailSequence.create({
            data: {
                name: sequenceData.name,
                triggerStage: sequenceData.triggerStage as any,
                isActive: sequenceData.isActive,
                tenantId,
                steps: {
                    create: steps.map(step => ({
                        templateId: step.templateId,
                        orderIndex: step.orderIndex,
                        delayHours: step.delayHours,
                    })),
                },
            },
            include: {
                steps: {
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });

        return sequence;
    }

    /**
     * Obtener todas las secuencias
     */
    static async getAll(tenantId: string): Promise<EmailSequenceWithSteps[]> {
        return prisma.emailSequence.findMany({
            where: { tenantId },
            include: {
                steps: {
                    orderBy: { orderIndex: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Obtener secuencia por ID
     */
    static async getById(id: string, tenantId: string): Promise<EmailSequenceWithSteps | null> {
        return prisma.emailSequence.findFirst({
            where: { id, tenantId },
            include: {
                steps: {
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });
    }

    /**
     * Obtener secuencias por trigger stage
     */
    static async getByTriggerStage(triggerStage: string, tenantId: string): Promise<EmailSequenceWithSteps[]> {
        return prisma.emailSequence.findMany({
            where: {
                triggerStage: triggerStage as any,
                isActive: true,
                tenantId,
            },
            include: {
                steps: {
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });
    }

    /**
     * Actualizar secuencia
     */
    static async update(id: string, data: UpdateSequenceInput, tenantId: string): Promise<EmailSequence> {
        const updateData: any = { ...data };
        if (updateData.triggerStage) {
            updateData.triggerStage = updateData.triggerStage as any;
        }

        return prisma.emailSequence.update({
            where: { id, tenantId },
            data: updateData,
        });
    }

    /**
     * Eliminar secuencia
     */
    static async delete(id: string, tenantId: string): Promise<void> {
        await prisma.emailSequence.delete({
            where: { id, tenantId },
        });
    }

    /**
     * Agregar paso a secuencia
     */
    static async addStep(sequenceId: string, data: CreateStepInput, tenantId: string): Promise<EmailSequenceStep> {
        // Verificar que la secuencia pertenece al tenant
        const sequence = await prisma.emailSequence.findFirst({
            where: { id: sequenceId, tenantId },
        });

        if (!sequence) {
            throw new Error('Sequence not found');
        }

        return prisma.emailSequenceStep.create({
            data: {
                sequenceId,
                templateId: data.templateId,
                orderIndex: data.orderIndex,
                delayHours: data.delayHours,
            },
        });
    }

    /**
     * Actualizar paso
     */
    static async updateStep(stepId: string, data: UpdateStepInput): Promise<EmailSequenceStep> {
        return prisma.emailSequenceStep.update({
            where: { id: stepId },
            data,
        });
    }

    /**
     * Eliminar paso
     */
    static async deleteStep(stepId: string): Promise<void> {
        await prisma.emailSequenceStep.delete({
            where: { id: stepId },
        });
    }

    /**
     * Reordenar pasos de una secuencia
     */
    static async reorderSteps(sequenceId: string, stepIds: string[]): Promise<void> {
        const updates = stepIds.map((stepId, index) =>
            prisma.emailSequenceStep.update({
                where: { id: stepId },
                data: { orderIndex: index },
            })
        );

        await prisma.$transaction(updates);
    }
}
