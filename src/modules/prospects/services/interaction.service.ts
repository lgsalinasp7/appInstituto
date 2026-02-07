/**
 * InteractionService
 * 
 * NOTA: El modelo ProspectInteraction no existe aún en el schema de Prisma.
 * Este servicio es un placeholder para cuando se agregue el modelo.
 * Por ahora, las interacciones se manejan mediante el campo `observations` del Prospect.
 */

export interface CreateInteractionData {
    type: string;
    content: string;
    prospectId: string;
    advisorId: string;
    date?: Date;
}

export interface ProspectInteraction {
    id: string;
    type: string;
    content: string;
    prospectId: string;
    advisorId: string;
    date: Date;
    advisor?: { id: string; name: string | null };
}

export class InteractionService {
    static async getInteractionsByProspect(_prospectId: string): Promise<ProspectInteraction[]> {
        // TODO: Implementar cuando se agregue el modelo ProspectInteraction al schema
        return [];
    }

    static async createInteraction(_data: CreateInteractionData): Promise<ProspectInteraction> {
        throw new Error("ProspectInteraction model not yet implemented in schema");
    }

    static async deleteInteraction(_id: string): Promise<void> {
        throw new Error("ProspectInteraction model not yet implemented in schema");
    }
}
