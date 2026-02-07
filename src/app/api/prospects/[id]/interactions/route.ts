import { NextRequest, NextResponse } from "next/server";
import { InteractionService } from "@/modules/prospects/services/interaction.service";
import { z } from "zod";
import { withTenantAuth, withTenantAuthAndCSRF } from "@/lib/api-auth";

const createInteractionSchema = z.object({
    type: z.enum(["CALL", "WHATSAPP", "EMAIL", "MEETING", "OTHER"]),
    content: z.string().min(1, "El contenido de la interacción es requerido"),
    advisorId: z.string().min(1, "El ID del asesor es requerido"),
    date: z.string().optional().transform(val => val ? new Date(val) : new Date()),
});

export const GET = withTenantAuth(async (
    request: NextRequest,
    user,
    tenantId,
    context?: { params: Promise<Record<string, string>> }
) => {
    const { id } = await context!.params;
    const interactions = await InteractionService.getInteractionsByProspect(id);
    return NextResponse.json({ success: true, data: interactions });
});

export const POST = withTenantAuthAndCSRF(async (
    request: NextRequest,
    user,
    tenantId,
    context?: { params: Promise<Record<string, string>> }
) => {
    const { id } = await context!.params;
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
        prospectId: id,
    });

    return NextResponse.json({ success: true, data: interaction }, { status: 201 });
});
