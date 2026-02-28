# Funnel Masterclass -> Citas (Playbook Operativo)

## 1) Objetivo del funnel
Convertir leads de masterclass en citas calificadas y luego en ventas, con un proceso simple y medible para volumen bajo (`1-10 leads/dia`).

## 2) Que YA esta implementado

### Tracking y atribucion
- Eventos unificados en frontend:
  - `lead_submit`
  - `thank_you_view`
  - `whatsapp_click`
  - `call_booked`
  - `lead_qualified`
- Captura y persistencia de atribucion:
  - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`
  - `fbclid`, `gclid`, `ttclid`
- La atribucion se arrastra entre landing, formulario, thank-you y click a WhatsApp.

### CRM y automatizacion
- Se dispara automatizacion por etapa:
  - al crear lead nuevo
  - al cambiar `status` del lead
- Cron de emails corregido:
  - procesa `PENDING` y `SCHEDULED`
  - respeta hora programada
  - evita duplicar logs de correos
- Regla automatica de seguimiento:
  - si lead de alta intencion no tiene gestion en 24h, crea tarea de seguimiento.

### KPIs de validacion
- Endpoint nuevo para control semanal del funnel:
  - `GET /api/admin/analytics/funnel-validation`
- Devuelve:
  - `leadsThisWeek`
  - `contactRate24h`
  - `contactToDemoRate`
  - `demoToClosedRate`
  - `whatsappResponse48hRate`
  - `averageHoursToFirstContact`
  - `appointmentsBookedThisWeek`
  - `conversionsThisWeek`

## 3) Donde revisar en dashboard y sistema

### Operacion comercial (dia a dia)
- Panel de leads: `/admin/leads`
  - revisar estado por lead (`NUEVO`, `CONTACTADO`, `DEMO`, `CONVERTIDO`, `PERDIDO`)
  - registrar llamadas, notas, reuniones y correos

### Correos y entregabilidad
- Correos comerciales: `/admin/comercial/correos`
  - verificar enviados, pendientes, fallidos
- Plantillas de correo: `/admin/email-templates`
  - revisar copys activos por etapa

### Analitica
- Resumen: `GET /api/admin/analytics/overview`
- Conversion: `GET /api/admin/analytics/conversion`
- Validacion de funnel: `GET /api/admin/analytics/funnel-validation`

### Automatizacion tecnica
- Cron de envio:
  - `/api/cron/process-kaled-emails`
- Webhook de Resend:
  - `/api/webhooks/resend`

## 4) Paso a paso operativo (checklist diario)

### Paso 1: iniciar dia (15 min)
1. Abrir `/admin/leads`.
2. Filtrar leads nuevos de las ultimas 24h.
3. Priorizar por:
   - `interestLevel=high` o `leadScore >= 61`
   - apertura/click reciente de email
   - origen de campana activa.

### Paso 2: ejecucion comercial (bloque principal)
1. Contactar todos los leads nuevos antes de 24h.
2. Si no responde:
   - segundo intento antes de 48h
   - dejar nota de intento en timeline.
3. Mover estado correctamente:
   - `NUEVO -> CONTACTADO`
   - `CONTACTADO -> DEMO`
   - `DEMO -> CONVERTIDO` o `PERDIDO`.

### Paso 3: control de emails (10 min)
1. Revisar correos fallidos o pendientes en `/admin/comercial/correos`.
2. Confirmar que secuencias esten activas.
3. Ajustar copy si baja apertura/click.

### Paso 4: cierre del dia (10 min)
1. Revisar tareas automaticas creadas por leads de alta intencion.
2. Validar que no queden leads sin gestion >24h.
3. Preparar lista de seguimiento del dia siguiente.

## 5) Estrategia por escenarios (casos)

### Caso A: muchos leads, pocas citas
**Sintoma**
- `leadsThisWeek` alto
- `contactToDemoRate` bajo

**Accion**
- mejorar script de calificacion inicial
- reducir friccion en CTA de agenda
- reforzar prueba social en email 1 y 2
- hacer seguimiento mas rapido (misma hora si es posible)

### Caso B: buenas citas, pocas ventas
**Sintoma**
- `contactToDemoRate` correcto
- `demoToClosedRate` bajo

**Accion**
- revisar oferta, objection handling y cierre en demo
- incluir urgencia real y siguiente paso claro post-demo
- reforzar secuencia de post-demo (autoridad + casos + deadline)

### Caso C: buena conversion, bajo volumen
**Sintoma**
- `demoToClosedRate` alto
- pocas oportunidades nuevas

**Accion**
- escalar presupuesto gradualmente
- testear 2 angulos de anuncio
- sostener misma promesa y mismo perfil de lead ganador

### Caso D: baja respuesta en WhatsApp
**Sintoma**
- `whatsappResponse48hRate` bajo

**Accion**
- cambiar primer mensaje de WhatsApp a formato corto (beneficio + pregunta)
- usar recordatorio en 24h con CTA unico
- revisar que el trafico este trayendo el perfil correcto

## 6) Cadencia recomendada de 7 dias (por lead)
- Dia 0: formulario + mensaje WhatsApp + email 1
- Dia 1: seguimiento comercial + email 2
- Dia 2/3: empujar agenda de cita + email 3
- Dia 4/5: cierre de objeciones
- Dia 6/7: decision de estado final

## 7) Umbrales para decidir escalar o iterar
- Escalar anuncios si durante 2 semanas:
  - sube `contactToDemoRate`, y
  - sube `demoToClosedRate`.
- Iterar mensaje/oferta si:
  - hay leads pero no agendan cita.
- Corregir operacion comercial si:
  - `averageHoursToFirstContact > 24`.

## 8) Comando util para activar secuencia enfocada en citas
```bash
npx tsx prisma/seed-funnel-cita-sequences.ts
```
