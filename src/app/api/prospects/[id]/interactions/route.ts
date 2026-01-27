import { NextRequest, NextResponse } from "next/server";
import { InteractionService } from "@/modules/prospects/services/interaction.service";
import { z } from "zod";

const createInteractionSchema = z.object({
    type: z.enum(["CALL", "WHATSAPP", "EMAIL", "MEETING", "OTHER"]),
    content: z.string().min(1, "El contenido de la interacción es requerido"),
    advisorId: z.string().min(1, "El ID del asesor es requerido"),
    date: z.string().optional().transform(val => val ? new Date(val) : new Date()),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const interactions = await InteractionService.getInteractionsByProspect(params.id);
        return NextResponse.json({ success: true, data: interactions });
    } catch (error) {
        console.error("Error fetching interactions:", error);
        return NextResponse.json({ success: false, error: "Error al obtener interacciones" }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const validation = createInteractionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                error: "Datos inválidos",
                details: validation.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const interaction = await InteractionService.createInteraction({
            ...validation.data,
            prospectId: params.id,
        });

        return NextResponse.json({ success: true, data: interaction }, { status: 201 });
    } catch (error) {
        console.error("Error creating interaction:", error);
        return NextResponse.json({ success: false, error: "Error al registrar interacción" }, { status: 500 });
    }
}
