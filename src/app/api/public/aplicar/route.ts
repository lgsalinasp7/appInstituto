/**
 * Public API - Aplicar Cohorte Form
 * POST /api/public/aplicar
 * Captura leads del formulario de aplicación de la página web
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const aplicarSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  age: z.number().positive('La edad debe ser positiva'),
  city: z.string().min(2, 'Ciudad inválida').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  technicalLevel: z.string().optional(),
  motivation: z.string().optional(),
  hasSaasIdea: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  fbclid: z.string().optional(),
  gclid: z.string().optional(),
  ttclid: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validation = aplicarSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Preparar observaciones con la información del formulario
    const observations = [
      `[APLICACIÓN COHORTE]`,
      `Edad: ${data.age} años`,
      data.city && `Ciudad: ${data.city}`,
      data.technicalLevel && `Nivel: ${data.technicalLevel}`,
      data.motivation && `Motivación: ${data.motivation}`,
      data.hasSaasIdea && `SaaS: ${data.hasSaasIdea}`,
    ]
      .filter(Boolean)
      .join('\n');

    // Preparar filteringData
    const filteringData = {
      age: data.age,
      city: data.city,
      technicalLevel: data.technicalLevel,
      motivation: data.motivation,
      hasSaasIdea: data.hasSaasIdea,
      formType: 'APLICAR_COHORTE',
      attribution: {
        fbclid: data.fbclid || null,
        gclid: data.gclid || null,
        ttclid: data.ttclid || null,
      },
    };

    // Verificar si ya existe el lead por email (si se proporciona)
    let lead = null;
    if (data.email) {
      lead = await prisma.kaledLead.findUnique({
        where: { email: data.email },
      });
    }

    if (lead) {
      // Actualizar lead existente
      lead = await prisma.kaledLead.update({
        where: { id: lead.id },
        data: {
          name: data.name || lead.name,
          phone: data.phone || lead.phone,
          city: data.city || lead.city,
          utmSource: data.utmSource || lead.utmSource,
          utmMedium: data.utmMedium || lead.utmMedium,
          utmCampaign: data.utmCampaign || lead.utmCampaign,
          utmContent: data.utmContent || lead.utmContent,
          observations: `${lead.observations || ''}\n\n${observations}`.trim(),
          filteringData: filteringData as any,
          updatedAt: new Date(),
        },
      });
    } else {
      // Crear nuevo lead
      // Si no tiene email, generar uno temporal basado en el nombre
      const email = data.email || `${data.name.toLowerCase().replace(/\s+/g, '.')}.temp.${Date.now()}@kaledsoft.temp`;

      lead = await prisma.kaledLead.create({
        data: {
          name: data.name,
          email: email,
          phone: data.phone,
          city: data.city,
          status: 'NUEVO',
          source: 'APLICAR_COHORTE',
          observations: observations,
          filteringData: filteringData as any,
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          utmContent: data.utmContent,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: { leadId: lead.id },
      message: 'Solicitud recibida correctamente',
    });
  } catch (error: any) {
    console.error('Error capturing aplicar lead:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al procesar la solicitud. Por favor intenta de nuevo.',
      },
      { status: 500 }
    );
  }
}
