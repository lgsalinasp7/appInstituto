"use server";

import { track } from "@vercel/analytics/server";
import { KaledLeadService, publicLeadCaptureSchema } from "@/modules/masterclass";
import { sendTemplateEmail } from "@/lib/email";
import { resolveKaledTenantId } from "@/lib/kaled-tenant";

function formStr(formData: FormData, key: string): string | undefined {
    const v = formData.get(key);
    if (v == null || v === "") return undefined;
    return String(v);
}

function formStrRequired(formData: FormData, key: string): string {
    return (formData.get(key) as string | null) ?? "";
}

export async function captureMasterclassLead(formData: FormData) {
    try {
        // Extraer datos del FormData (null/empty → undefined para campos opcionales)
        const rawData = {
            name: formStrRequired(formData, "name"),
            email: formStrRequired(formData, "email"),
            phone: formStrRequired(formData, "phone"),
            city: formStr(formData, "city"),
            studyStatus: formStr(formData, "studyStatus"),
            programmingLevel: formStr(formData, "programmingLevel"),
            saasInterest: formStr(formData, "saasInterest"),
            investmentReady: formStr(formData, "investmentReady"),
            masterclassSlug: (formData.get("masterclassSlug") as string) || "masterclass-ia",
            utmSource: formStr(formData, "utmSource"),
            utmMedium: formStr(formData, "utmMedium"),
            utmCampaign: formStr(formData, "utmCampaign"),
            utmContent: formStr(formData, "utmContent"),
            fbclid: formStr(formData, "fbclid"),
            gclid: formStr(formData, "gclid"),
            ttclid: formStr(formData, "ttclid"),
        };

        // Validar con Zod
        const validated = publicLeadCaptureSchema.parse(rawData);

        // Resolver tenantId de forma segura (no debe bloquear la captura)
        let tenantId: string | undefined;
        try {
            tenantId = await resolveKaledTenantId();
        } catch (e) {
            console.error("Error resolviendo tenant para lead masterclass, capturando sin tenantId:", e);
        }

        // Capturar Lead usando el servicio dedicado de KaledSoft
        const result = await KaledLeadService.captureLead(validated, tenantId);

        // Enviar Email de Notificación (Opcional pero recomendado)
        try {
            await sendTemplateEmail({
                to: "lgsal@kaledsoft.tech", // Email del administrador
                subject: `NUEVO LEAD MASTERCLASS: ${validated.name}`,
                html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Nuevo Lead Registrado</h2>
            <p><strong>Nombre:</strong> ${validated.name}</p>
            <p><strong>Email:</strong> ${validated.email}</p>
            <p><strong>WhatsApp:</strong> ${validated.phone}</p>
            <p><strong>Ciudad:</strong> ${validated.city || 'N/A'}</p>
            <hr />
            <h3>Respuestas de Filtrado:</h3>
            <ul>
              <li><strong>Estudio:</strong> ${validated.studyStatus}</li>
              <li><strong>Nivel:</strong> ${validated.programmingLevel}</li>
              <li><strong>SaaS:</strong> ${validated.saasInterest}</li>
              <li><strong>Invierte:</strong> ${validated.investmentReady}</li>
            </ul>
            <p><strong>UTM Source:</strong> ${validated.utmSource || 'N/A'}</p>
          </div>
        `
            });
        } catch (emailError) {
            console.error("Error al enviar email de notificación:", emailError);
        }

        await track("Masterclass Lead", {
            campaign: "masterclass-ia",
            source: "server",
        });

        return { success: true, leadId: result.leadId };
    } catch (error: unknown) {
        console.error("Error en captureMasterclassLead:", error);
        const message = error instanceof Error ? error.message : "Error al procesar el registro";
        return {
            success: false,
            error: message
        };
    }
}
