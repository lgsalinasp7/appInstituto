# Setup: Sistema de Email Automation con Plantillas Pre-diseñadas

Este documento explica cómo implementar el sistema completo de email automation con 11 plantillas pre-diseñadas, secuencias automáticas, scoring de leads y analytics.

## 🚀 Pasos de Implementación

### 1. Ejecutar Migración de Schema

Primero, genera y ejecuta la migración de Prisma para actualizar la base de datos con los nuevos campos:

```bash
npx prisma migrate dev --name add_email_automation_fields
```

Esto agregará:
- **KaledLead:** campos de tracking (emailOpens, emailClicks, leadScore, interestLevel, etc.)
- **KaledCampaign:** campos de enlaces (eventUrl, checkoutUrl, calendlyUrl, recordingUrl, eventDate, eventTime)
- **KaledEmailTemplate:** campos isLibraryTemplate y phase
- **KaledEmailLog:** campos de tracking (deliveredAt, openedAt, clickedAt, openCount, clickCount)

### 2. Seed de Plantillas Pre-diseñadas

Ejecuta el seed para crear las 11 plantillas con copywriting optimizado:

```bash
npx tsx prisma/seed-email-templates.ts
```

Esto creará:
- **Fase 1 (3 emails):** Pre-Masterclass Nurturing
  - Email 1: Confirmación Inmediata
  - Email 2: Construcción de Tensión
  - Email 3: Prueba Social

- **Fase 2 (2 emails):** Event Reminders
  - Email 4: Día del Evento
  - Email 5: 1 Hora Antes

- **Fase 3 (4 emails):** Sales Sequence (Attended)
  - Email 6: Oferta Inmediata
  - Email 7: Urgencia Suave
  - Email 8: Objeción Económica
  - Email 9: Último Aviso

- **Fase 4 (2 emails):** No-Show Recovery
  - Email NS-1: Te lo Perdiste
  - Email NS-2: Última Oportunidad Grabación

### 3. Seed de Secuencias Automáticas

Ejecuta el seed para crear las 4 secuencias que automatizan el funnel:

```bash
npx tsx prisma/seed-email-sequences.ts
```

Esto creará:
- **Pre-Masterclass Nurturing** (STAGE_BASED: applied)
- **Event Reminders** (TIME_BASED: eventDate)
- **Sales Sequence - Attended** (STAGE_BASED: attended)
- **No-Show Recovery** (STAGE_BASED: no_show)

### 4. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# Resend (ya debería existir)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hola@kaledsoft.com

# Webhooks de Resend (nuevo)
RESEND_WEBHOOK_SECRET=whsec_...
```

### 5. Configurar Webhook en Resend

1. Ve a tu dashboard de Resend: https://resend.com/webhooks
2. Crea un nuevo webhook con la URL: `https://tusaas.com/api/webhooks/resend`
3. Selecciona los siguientes eventos:
   - ✅ email.sent
   - ✅ email.delivered
   - ✅ email.opened
   - ✅ email.clicked
   - ✅ email.bounced
4. Copia el "Signing Secret" y guárdalo en `RESEND_WEBHOOK_SECRET`

### 6. Configurar Campaña con Enlaces

Para que las variables dinámicas funcionen, cada campaña debe tener configurados sus enlaces:

1. Ve a `/admin/campanas`
2. Edita o crea una campaña
3. Completa los campos:
   - **Event URL:** Link de Zoom/Google Meet para la masterclass
   - **Checkout URL:** Link de pago/checkout
   - **Calendly URL:** Link para agendar llamadas
   - **Recording URL:** Link de grabación (para no-show)
   - **Event Date:** Fecha de la masterclass
   - **Event Time:** Hora de la masterclass (ej: "7:00 PM COT")

**Nota:** Si estos campos no existen en el formulario de campañas, deberás agregarlos.

### 7. Actualizar Cron Job de Emails

El cron job existente en `/api/cron/process-kaled-emails` ya debería procesar emails pendientes. Si no existe, créalo con el siguiente código:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTemplateEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    // Buscar emails pendientes o programados cuyo scheduledFor ya pasó
    const now = new Date();
    const pendingEmails = await prisma.kaledEmailLog.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          {
            status: 'SCHEDULED',
            metadata: {
              path: ['scheduledFor'],
              lte: now.toISOString(),
            },
          },
        ],
      },
      take: 50, // Procesar máximo 50 por ejecución
    });

    let sent = 0;
    for (const emailLog of pendingEmails) {
      try {
        const metadata = emailLog.metadata as any;
        const htmlContent = metadata?.htmlContent || '';

        // Enviar email
        const result = await sendTemplateEmail({
          to: emailLog.to,
          subject: emailLog.subject,
          html: htmlContent,
        });

        // Actualizar log
        await prisma.kaledEmailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'SENT',
            resendId: result.id,
            sentAt: new Date(),
          },
        });

        // Actualizar lead
        if (emailLog.kaledLeadId && emailLog.templateId) {
          await prisma.kaledLead.update({
            where: { id: emailLog.kaledLeadId },
            data: {
              lastEmailSentAt: new Date(),
              lastEmailTemplateId: emailLog.templateId,
            },
          });
        }

        sent++;
      } catch (error) {
        console.error(`Error sending email ${emailLog.id}:`, error);
        await prisma.kaledEmailLog.update({
          where: { id: emailLog.id },
          data: { status: 'FAILED' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: pendingEmails.length,
      sent,
    });
  } catch (error) {
    console.error('Error in email cron:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### 8. Configurar Cron en Vercel (Producción)

Agrega en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-kaled-emails",
      "schedule": "0 * * * *"
    }
  ]
}
```

Esto ejecuta el cron cada hora.

## 📋 Uso del Sistema

### 1. Usar Plantillas de la Librería

1. Ve a `/admin/email-templates/library`
2. Explora las 11 plantillas pre-diseñadas
3. Click en "👁 Ver" para preview rápido
4. Click en "📋 Usar" para duplicar a tu lista personal
5. Edita variables si necesitas personalizar

### 2. Activar Secuencias Automáticas

Las secuencias se activan automáticamente cuando:

**Pre-Masterclass:** Lead cambia status a "applied"
```typescript
await prisma.kaledLead.update({
  where: { id: leadId },
  data: { status: 'applied' }
});
// Esto trigger automáticamente la secuencia Pre-Masterclass (3 emails)
```

**Event Reminders:** Basado en eventDate de la campaña
```typescript
// El cron job revisa campañas con eventDate próximo y envía recordatorios
```

**Sales Sequence:** Lead cambia status a "attended"
```typescript
await prisma.kaledLead.update({
  where: { id: leadId },
  data: { status: 'attended', masterclassAttendedAt: new Date() }
});
// Esto trigger la secuencia de ventas (4 emails)
```

**No-Show Recovery:** Lead cambia status a "no_show"
```typescript
await prisma.kaledLead.update({
  where: { id: leadId },
  data: { status: 'no_show' }
});
// Esto trigger la secuencia de recuperación (2 emails)
```

### 3. Ver Analytics

1. Ve a `/admin/email-templates/analytics`
2. Revisa métricas:
   - Total emails enviados
   - Open rate promedio
   - Click rate promedio
   - Conversion rate
3. Filtra por fase del funnel
4. Ordena por métrica
5. Identifica plantillas ganadoras

### 4. Lead Scoring Automático

El sistema calcula automáticamente el score de cada lead:

**Puntos Positivos:**
- +10 por cada email abierto
- +20 por cada click en email
- +30 por registrarse a masterclass
- +40 por asistir a masterclass
- +50 por agendar llamada
- +100 por compra

**Puntos Negativos:**
- -10 si no abre email en 48h

**Interest Levels:**
- **Low (0-30):** Lead frío
- **Medium (31-60):** Lead tibio
- **High (61-100):** Lead caliente

## 🔧 Troubleshooting

### Las plantillas no aparecen en la librería
```bash
# Re-run el seed
npx tsx prisma/seed-email-templates.ts
```

### Las secuencias no se activan
1. Verifica que las secuencias existan: `npx tsx prisma/seed-email-sequences.ts`
2. Revisa que `isActive = true` en la tabla `KaledEmailSequence`
3. Verifica que el status del lead coincida con `targetStage` de la secuencia

### Los webhooks no funcionan
1. Verifica que `RESEND_WEBHOOK_SECRET` esté configurado
2. Revisa logs en Resend dashboard
3. Prueba el endpoint: `curl https://tusaas.com/api/webhooks/resend`

### Los emails no se envían
1. Verifica que el cron esté ejecutándose
2. Revisa la tabla `KaledEmailLog` para ver status
3. Verifica que `resendId` se esté guardando correctamente

## 🎯 Próximos Pasos

1. **Personalizar Copywriting:** Edita las plantillas de la librería según tu audiencia
2. **Ajustar Delays:** Modifica `delayHours` en las secuencias según tu funnel
3. **A/B Testing:** Crea variantes de subject lines y mide performance
4. **Integración WhatsApp:** Complementa emails con mensajes de WhatsApp
5. **Predicción de Conversión:** Agregar ML model para predecir qué leads comprarán

## 📊 Métricas Esperadas

**Industria Standard:**
- Open Rate: 20-30%
- Click Rate: 2-5%
- Conversion Rate: 1-3%

**Optimización Continua:**
- Revisa analytics semanalmente
- Identifica plantillas con bajo performance
- Ajusta copywriting y timing
- Experimenta con diferentes CTAs

## 🆘 Soporte

Si tienes problemas con la implementación:
1. Revisa los logs de la consola
2. Verifica que todas las migraciones se ejecutaron
3. Asegúrate que las variables de entorno estén configuradas
4. Contacta al equipo de desarrollo

---

**Desarrollado por:** KaledSoft
**Fecha:** 2026-02-25
**Versión:** 1.0.0
