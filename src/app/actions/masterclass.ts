"use server";

import { KaledLeadService, publicLeadCaptureSchema } from "@/modules/masterclass";
import { sendTemplateEmail } from "@/lib/email";
import { redirect } from "next/navigation";

export async function captureMasterclassLead(formData: FormData) {
    try {
        // Extraer datos del FormData
        const rawData = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            studyStatus: formData.get("studyStatus") as string,
            programmingLevel: formData.get("programmingLevel") as string,
            saasInterest: formData.get("saasInterest") as string,
            investmentReady: formData.get("investmentReady") as string,
            masterclassSlug: formData.get("masterclassSlug") as string || "masterclass-ia",
            utmSource: formData.get("utmSource") as string,
            utmMedium: formData.get("utmMedium") as string,
            utmCampaign: formData.get("utmCampaign") as string,
        };

        // Validar con Zod
        const validated = publicLeadCaptureSchema.parse(rawData);

        // Capturar Lead usando el servicio dedicado de KaledSoft
        const result = await KaledLeadService.captureLead(validated);

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

        return { success: true, leadId: result.leadId };
    } catch (error: any) {
        console.error("Error en captureMasterclassLead:", error);
        return {
            success: false,
            error: error.message || "Error al procesar el registro"
        };
    }
}
