import { prisma } from '@/lib/prisma';
import { WhatsAppService } from './whatsapp.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export class WhatsAppTemplateService {
    /**
     * Enviar bienvenida a nuevo lead
     */
    static async sendWelcome(prospectId: string, tenantId: string): Promise<void> {
        const prospect = await prisma.prospect.findUnique({
            where: { id: prospectId },
            include: { program: true },
        });

        if (!prospect) {
            throw new Error('Prospect not found');
        }

        const message = `¡Hola ${prospect.name}! 👋

Bienvenido a Calet Academy. Estamos emocionados de acompañarte en tu camino para convertirte en un desarrollador de software excepcional.

¿Te gustaría conocer más sobre nuestro bootcamp intensivo?`;

        await WhatsAppService.sendAndLog({
            to: prospect.phone,
            message,
            prospectId: prospect.id,
            templateName: 'bienvenida_calet',
            tenantId,
        });
    }

    /**
     * Enviar recordatorio de masterclass (24h antes)
     */
    static async sendMasterclassReminder24h(prospectId: string, tenantId: string): Promise<void> {
        const prospect = await prisma.prospect.findUnique({
            where: { id: prospectId },
        });

        if (!prospect || !prospect.masterclassId) {
            throw new Error('Prospect or masterclass not found');
        }

        const masterclass = await prisma.masterclass.findUnique({
            where: { id: prospect.masterclassId },
        });

        if (!masterclass) {
            throw new Error('Masterclass not found');
        }

        const fechaFormateada = format(masterclass.scheduledAt, "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es });

        const message = `Hola ${prospect.name}! 🚀

Te recordamos que mañana ${fechaFormateada} tenemos la masterclass gratuita:

"${masterclass.title}"

${masterclass.meetingUrl ? `📹 Link: ${masterclass.meetingUrl}` : ''}

¡No te la pierdas! Aprenderás las estrategias que usan los mejores desarrolladores.

¿Nos vemos mañana?`;

        await WhatsAppService.sendAndLog({
            to: prospect.phone,
            message,
            prospectId: prospect.id,
            templateName: 'recordatorio_masterclass',
            tenantId,
        });
    }

    /**
     * Enviar recordatorio de masterclass (1h antes)
     */
    static async sendMasterclassReminder1h(prospectId: string, tenantId: string): Promise<void> {
        const prospect = await prisma.prospect.findUnique({
            where: { id: prospectId },
        });

        if (!prospect || !prospect.masterclassId) {
            throw new Error('Prospect or masterclass not found');
        }

        const masterclass = await prisma.masterclass.findUnique({
            where: { id: prospect.masterclassId },
        });

        if (!masterclass) {
            throw new Error('Masterclass not found');
        }

        const message = `${prospect.name}, ¡la masterclass comienza en 1 hora! ⏰

${masterclass.title}

${masterclass.meetingUrl ? `📹 Ingresa aquí: ${masterclass.meetingUrl}` : ''}

Prepárate para tomar notas. Será intenso y muy valioso.

¡Te esperamos!`;

        await WhatsAppService.sendAndLog({
            to: prospect.phone,
            message,
            prospectId: prospect.id,
            templateName: 'recordatorio_masterclass',
            tenantId,
        });
    }

    /**
     * Enviar seguimiento post-masterclass
     */
    static async sendPostMasterclassFollowUp(prospectId: string, tenantId: string): Promise<void> {
        const prospect = await prisma.prospect.findUnique({
            where: { id: prospectId },
            include: { program: true },
        });

        if (!prospect) {
            throw new Error('Prospect not found');
        }

        const message = `Hola ${prospect.name}! 🎯

Esperamos que hayas disfrutado la masterclass. ¿Qué te pareció?

Si estás listo para dar el siguiente paso y unirte al bootcamp completo, me encantaría agendar una llamada rápida de 15 minutos para resolver tus dudas.

¿Cuándo te viene mejor? Mañana o pasado mañana?`;

        await WhatsAppService.sendAndLog({
            to: prospect.phone,
            message,
            prospectId: prospect.id,
            templateName: 'seguimiento_calet',
            tenantId,
        });
    }

    /**
     * Enviar seguimiento general
     */
    static async sendGeneralFollowUp(prospectId: string, message: string, tenantId: string): Promise<void> {
        const prospect = await prisma.prospect.findUnique({
            where: { id: prospectId },
        });

        if (!prospect) {
            throw new Error('Prospect not found');
        }

        await WhatsAppService.sendAndLog({
            to: prospect.phone,
            message,
            prospectId: prospect.id,
            tenantId,
        });
    }

    /**
     * Enviar confirmación de aplicación recibida
     */
    static async sendApplicationConfirmation(prospectId: string, tenantId: string): Promise<void> {
        const prospect = await prisma.prospect.findUnique({
            where: { id: prospectId },
            include: { program: true },
        });

        if (!prospect) {
            throw new Error('Prospect not found');
        }

        const message = `¡Excelente ${prospect.name}! ✅

Hemos recibido tu aplicación para el bootcamp${prospect.program ? ` de ${prospect.program.name}` : ''}.

En las próximas 24 horas, uno de nuestros asesores revisará tu perfil y te contactará para agendar la llamada de admisión.

Mientras tanto, ¿tienes alguna pregunta que quieras resolver?`;

        await WhatsAppService.sendAndLog({
            to: prospect.phone,
            message,
            prospectId: prospect.id,
            templateName: 'aplicacion_confirmacion',
            tenantId,
        });
    }

    /**
     * Enviar recordatorio de llamada agendada
     */
    static async sendCallReminder(prospectId: string, callDate: Date, tenantId: string): Promise<void> {
        const prospect = await prisma.prospect.findUnique({
            where: { id: prospectId },
        });

        if (!prospect) {
            throw new Error('Prospect not found');
        }

        const fechaFormateada = format(callDate, "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es });

        const message = `Hola ${prospect.name}! 📞

Te confirmo nuestra llamada programada para ${fechaFormateada}.

Te llamaremos a este número. Por favor estate atento.

Prepara tus preguntas sobre el bootcamp. ¡Será una conversación muy valiosa!`;

        await WhatsAppService.sendAndLog({
            to: prospect.phone,
            message,
            prospectId: prospect.id,
            tenantId,
        });
    }
}
