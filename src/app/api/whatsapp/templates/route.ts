import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/api-auth';

const AVAILABLE_TEMPLATES = [
    {
        name: 'bienvenida_calet',
        description: 'Mensaje de bienvenida a nuevo lead',
        category: 'onboarding',
        variables: ['nombre'],
    },
    {
        name: 'recordatorio_masterclass',
        description: 'Recordatorio de masterclass (24h y 1h antes)',
        category: 'eventos',
        variables: ['nombre', 'titulo_masterclass', 'fecha', 'hora', 'enlace'],
    },
    {
        name: 'seguimiento_calet',
        description: 'Seguimiento post-masterclass',
        category: 'seguimiento',
        variables: ['nombre', 'enlace_aplicacion'],
    },
    {
        name: 'aplicacion_confirmacion',
        description: 'Confirmación de aplicación recibida',
        category: 'aplicacion',
        variables: ['nombre', 'programa'],
    },
];

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
    try {
        return NextResponse.json({
            success: true,
            data: AVAILABLE_TEMPLATES,
        });
    } catch (error) {
        console.error('Error fetching WhatsApp templates:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener plantillas' },
            { status: 500 }
        );
    }
});
