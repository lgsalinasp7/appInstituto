import type { EmailTemplate, EmailSequence, EmailSequenceStep, EmailLog } from '@prisma/client';

export interface EmailTemplateWithLogs extends EmailTemplate {
    emailLogs: EmailLog[];
}

export interface EmailSequenceWithSteps extends EmailSequence {
    steps: EmailSequenceStep[];
}

export interface CreateTemplateInput {
    name: string;
    subject: string;
    htmlContent: string;
    variables: string[];
    isActive?: boolean;
}

export interface UpdateTemplateInput {
    name?: string;
    subject?: string;
    htmlContent?: string;
    variables?: string[];
    isActive?: boolean;
}

export interface CreateSequenceInput {
    name: string;
    triggerStage: string;
    isActive?: boolean;
    steps: CreateStepInput[];
}

export interface UpdateSequenceInput {
    name?: string;
    triggerStage?: string;
    isActive?: boolean;
}

export interface CreateStepInput {
    templateId: string;
    orderIndex: number;
    delayHours: number;
}

export interface UpdateStepInput {
    templateId?: string;
    orderIndex?: number;
    delayHours?: number;
}

export interface SendTemplateEmailParams {
    to: string;
    templateId: string;
    variables: Record<string, string>;
    prospectId?: string;
    tenantId: string;
}
