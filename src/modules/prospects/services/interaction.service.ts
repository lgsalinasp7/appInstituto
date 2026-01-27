import prisma from "@/lib/prisma";

export interface CreateInteractionData {
    type: string;
    content: string;
    prospectId: string;
    advisorId: string;
    date?: Date;
}

export class InteractionService {
    static async getInteractionsByProspect(prospectId: string) {
        return await prisma.prospectInteraction.findMany({
            where: { prospectId },
            include: {
                advisor: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { date: "desc" }
        });
    }

    static async createInteraction(data: CreateInteractionData) {
        return await prisma.prospectInteraction.create({
            data: {
                type: data.type,
                content: data.content,
                prospectId: data.prospectId,
                advisorId: data.advisorId,
                date: data.date || new Date(),
            },
            include: {
                advisor: {
                    select: { id: true, name: true }
                }
            }
        });
    }

    static async deleteInteraction(id: string) {
        return await prisma.prospectInteraction.delete({
            where: { id }
        });
    }
}
