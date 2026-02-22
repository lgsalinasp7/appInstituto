import { z } from 'zod';

export const createTemplateSchema = z.object({
    name: z.string().min(2, 'Nombre requerido'),
    subject: z.string().min(5, 'Asunto requerido'),
    htmlContent: z.string().min(10, 'Contenido HTML requerido'),
    variables: z.array(z.string()).default([]),
    isActive: z.boolean().default(true),
});

export const updateTemplateSchema = z.object({
    name: z.string().min(2).optional(),
    subject: z.string().min(5).optional(),
    htmlContent: z.string().min(10).optional(),
    variables: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
});

export const createSequenceSchema = z.object({
    name: z.string().min(2, 'Nombre requerido'),
    triggerStage: z.enum([
        'NUEVO', 'CONTACTADO', 'INTERESADO',
        'MASTERCLASS_REGISTRADO', 'MASTERCLASS_ASISTIO',
        'APLICACION', 'LLAMADA_AGENDADA', 'LLAMADA_REALIZADA',
        'NEGOCIACION', 'MATRICULADO', 'PERDIDO'
    ]),
    isActive: z.boolean().default(true),
    steps: z.array(z.object({
        templateId: z.string().cuid(),
        orderIndex: z.number().int().min(0),
        delayHours: z.number().int().min(0),
    })).min(1, 'Al menos un paso requerido'),
});

export const updateSequenceSchema = z.object({
    name: z.string().min(2).optional(),
    triggerStage: z.enum([
        'NUEVO', 'CONTACTADO', 'INTERESADO',
        'MASTERCLASS_REGISTRADO', 'MASTERCLASS_ASISTIO',
        'APLICACION', 'LLAMADA_AGENDADA', 'LLAMADA_REALIZADA',
        'NEGOCIACION', 'MATRICULADO', 'PERDIDO'
    ]).optional(),
    isActive: z.boolean().optional(),
});

export const sendTemplateEmailSchema = z.object({
    to: z.string().email('Email inválido'),
    templateId: z.string().cuid(),
    variables: z.record(z.string(), z.string()),
    prospectId: z.string().cuid().optional(),
});
