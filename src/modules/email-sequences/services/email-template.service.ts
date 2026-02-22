import { prisma } from '@/lib/prisma';
import type { EmailTemplate } from '@prisma/client';
import type { CreateTemplateInput, UpdateTemplateInput } from '../types';

export class EmailTemplateService {
    /**
     * Crear plantilla de email
     */
    static async create(data: CreateTemplateInput, tenantId: string): Promise<EmailTemplate> {
        return prisma.emailTemplate.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    /**
     * Obtener todas las plantillas
     */
    static async getAll(tenantId: string): Promise<EmailTemplate[]> {
        return prisma.emailTemplate.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Obtener plantilla por ID
     */
    static async getById(id: string, tenantId: string): Promise<EmailTemplate | null> {
        return prisma.emailTemplate.findFirst({
            where: { id, tenantId },
        });
    }

    /**
     * Obtener plantilla por nombre
     */
    static async getByName(name: string, tenantId: string): Promise<EmailTemplate | null> {
        return prisma.emailTemplate.findFirst({
            where: { name, tenantId },
        });
    }

    /**
     * Actualizar plantilla
     */
    static async update(id: string, data: UpdateTemplateInput, tenantId: string): Promise<EmailTemplate> {
        return prisma.emailTemplate.update({
            where: { id, tenantId },
            data,
        });
    }

    /**
     * Eliminar plantilla
     */
    static async delete(id: string, tenantId: string): Promise<void> {
        await prisma.emailTemplate.delete({
            where: { id, tenantId },
        });
    }

    /**
     * Renderizar plantilla reemplazando {{variables}}
     */
    static renderTemplate(htmlContent: string, variables: Record<string, string>): string {
        let rendered = htmlContent;

        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            rendered = rendered.replace(regex, value || '');
        }

        return rendered;
    }

    /**
     * Preview: renderizar con datos de ejemplo
     */
    static async preview(id: string, sampleData: Record<string, string>, tenantId: string): Promise<string> {
        const template = await this.getById(id, tenantId);

        if (!template) {
            throw new Error('Template not found');
        }

        return this.renderTemplate(template.htmlContent, sampleData);
    }

    /**
     * Validar que todas las variables estén proporcionadas
     */
    static validateVariables(template: EmailTemplate, providedVariables: Record<string, string>): boolean {
        for (const variable of template.variables) {
            if (!providedVariables[variable]) {
                console.warn(`Missing variable: ${variable}`);
                return false;
            }
        }
        return true;
    }
}
