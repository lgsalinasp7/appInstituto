# Casos de Uso Reales - Sistema de Embudo de Ventas

**Proyecto:** Instituto EDUTEC - Sistema Multi-Tenant
**Fecha:** 2026-02-21

---

## 🎯 CASOS DE USO QUE PUEDES PROBAR AHORA

### 🔵 Caso 1: Captura de Lead desde Landing Page

**Actor:** Estudiante prospecto
**Precondiciones:** Masterclass creada en BD
**Flujo:**

1. **Visitante** accede a landing:
   ```
   URL: https://edutec.kaledsoft.tech/lp/masterclass/bootcamp-ia-2026
   ```

2. **Visitante** ve:
   - ✨ Hero section con título llamativo
   - ⏱️ Countdown en tiempo real para la masterclass
   - 📝 Formulario de registro
   - ✅ Beneficios del bootcamp

3. **Visitante** llena formulario:
   ```
   Nombre: Ana María González
   Email: ana@gmail.com
   Teléfono: 3001234567
   ```

4. **Sistema** captura:
   - UTM parameters automáticos (si vino de Meta Ads)
   - Crea Prospect en BD
   - Asigna al primer advisor disponible
   - Calcula score inicial
   - Marca stage: MASTERCLASS_REGISTRADO

5. **Visitante** es redirigido a:
   ```
   /lp/gracias - Página de confirmación
   ```

**Resultado:**
- ✅ Lead en base de datos
- ✅ Visible en `/pipeline` para el equipo de ventas
- ✅ Score calculado automáticamente
- ✅ Interacción registrada en timeline

---

### 🟢 Caso 2: Gestión del Pipeline de Ventas

**Actor:** Asesor comercial (Juan Pérez)
**Precondiciones:** Usuario con rol VENTAS, leads existentes
**Flujo:**

1. **Asesor** hace login:
   ```
   URL: https://edutec.kaledsoft.tech/auth/login
   Email: juan@edutec.edu.co
   Password: [su contraseña]
   ```

2. **Asesor** navega a Pipeline:
   ```
   URL: /pipeline
   ```

3. **Asesor** ve tablero Kanban con 11 columnas:
   ```
   NUEVO → CONTACTADO → INTERESADO →
   MASTERCLASS_REGISTRADO → MASTERCLASS_ASISTIO →
   APLICACION → LLAMADA_AGENDADA → LLAMADA_REALIZADA →
   NEGOCIACION → MATRICULADO → PERDIDO
   ```

4. **Asesor** identifica lead "Ana María González":
   - 🟠 Temperatura: TIBIO
   - 📊 Score: 45/100
   - 📅 Creado: Hace 2 horas
   - 📱 Teléfono: 3001234567

5. **Asesor** hace clic en la tarjeta → se abre drawer lateral:
   - Datos completos del lead
   - Timeline de interacciones
   - Botones de acción rápida

6. **Asesor** realiza acciones:
   - 📞 Click "Llamar" → marca el teléfono
   - 💬 Click "WhatsApp" → abre chat WhatsApp
   - ✍️ Agrega nota: "Contactado vía WhatsApp, interesado en bootcamp"
   - ➡️ Mueve la tarjeta a columna "CONTACTADO"

7. **Sistema** actualiza automáticamente:
   - ✅ Crea interacción tipo "CAMBIO_ETAPA"
   - ✅ Actualiza lastContactAt = NOW()
   - ✅ Recalcula score (+10 por contacto)

**Resultado:**
- Lead movido a siguiente etapa
- Historia completa en timeline
- Score actualizado a 55/100

---

### 🟣 Caso 3: Agente IA "Margy" - Calificación Automática

**Actor:** Sistema (Agente IA Margy)
**Precondiciones:** Agente activado, lead con WhatsApp
**Flujo:**

1. **Lead** envía mensaje WhatsApp:
   ```
   "Hola, vi la publicidad del bootcamp.
   ¿Cuánto cuesta y cuándo empieza?"
   ```

2. **Webhook WhatsApp** recibe mensaje:
   ```
   POST /api/whatsapp/webhook
   ```

3. **Sistema** identifica/crea Prospect:
   - Busca por teléfono
   - Si no existe, crea nuevo con source=WHATSAPP
   - Asigna a advisor

4. **Agente Margy** se activa automáticamente:
   - Lee contexto del lead
   - Analiza el mensaje
   - Genera respuesta personalizada con IA

5. **Margy** responde:
   ```
   "¡Hola! 👋 Qué bueno que te interese el bootcamp.

   El bootcamp tiene un costo de $1.500.000 COP y
   comenzamos el 15 de marzo. Es un programa intensivo
   de 12 semanas donde aprenderás desarrollo Full Stack
   con IA.

   ¿Te gustaría que agendemos una llamada para contarte
   más detalles?"
   ```

6. **Sistema** registra:
   - ✅ Interacción WHATSAPP_RECIBIDO
   - ✅ Interacción WHATSAPP_ENVIADO
   - ✅ Tarea del agente creada
   - ✅ Score actualizado (+15 por respuesta)

7. **Lead** continúa conversación → Margy califica:
   ```
   Si lead muestra interés alto → Temperatura = CALIENTE
   Si pregunta por precio/fecha → Score +20
   Si da email → Score +10
   ```

8. **Margy** crea tarea para Kaled (agente cerrador):
   ```
   "Lead calificado, listo para llamada de cierre.
   Interés alto en bootcamp IA."
   ```

**Resultado:**
- Lead calificado automáticamente
- Temperatura actualizada a CALIENTE
- Score: 80/100
- Tarea asignada a asesor humano

---

### 🔴 Caso 4: Agente IA "Kaled" - Análisis y Cierre

**Actor:** Sistema (Agente IA Kaled)
**Precondiciones:** Lead en etapa NEGOCIACION o superior
**Flujo:**

1. **Asesor** marca lead para análisis:
   ```
   URL: /admin/agentes-kanban
   Crear tarea: "Analizar lead Ana María González"
   Asignar a: KALED
   ```

2. **Kaled** genera briefing del lead:
   ```
   Análisis completo:
   - Temperatura: CALIENTE (80/100)
   - Fuente: Landing Page (UTM: facebook-ads-bootcamp)
   - Interacciones: 5 (3 WhatsApp, 2 llamadas)
   - Objeciones: Ninguna detectada
   - Interés: Muy alto
   - Probabilidad de cierre: 85%

   Recomendación:
   Ofrecer descuento por pronto pago.
   Agendar llamada de cierre esta semana.
   ```

3. **Kaled** identifica patrón:
   ```
   "Leads de Facebook Ads en horario 6-9pm
   tienen 40% más conversión que otros."
   ```

4. **Sistema** guarda insight en memoria:
   ```
   Categoría: CONVERSION_PATTERN
   Score: 85
   Content: "Facebook evening ads convert better"
   ```

5. **Asesor** usa el briefing para cerrar venta

**Resultado:**
- Briefing completo del lead
- Patrones identificados
- Tasa de cierre mejorada

---

### 🟡 Caso 5: Conversión Final - De Lead a Estudiante

**Actor:** Asesor comercial + Sistema
**Precondiciones:** Lead en etapa NEGOCIACION, decidió matricularse
**Flujo:**

1. **Asesor** confirma matrícula del lead:
   ```
   Ana María decidió inscribirse al bootcamp
   ```

2. **Asesor** va a `/matriculas`:
   - Click "Nueva Matrícula"
   - Sistema pre-llena datos desde Prospect:
     * Nombre: Ana María González
     * Teléfono: 3001234567
     * Email: ana@gmail.com
     * Programa: Bootcamp Full Stack IA

3. **Asesor** completa datos:
   ```
   Documento: 1234567890
   Frecuencia de pago: MENSUAL
   Primera cuota: 15/03/2026
   ```

4. **Sistema** crea Student:
   - Migra datos de Prospect
   - Mantiene referencia al prospect original
   - Genera plan de pagos automático

5. **Sistema** actualiza Prospect:
   ```
   funnelStage = MATRICULADO
   ```

6. **Sistema** crea interacción:
   ```
   Tipo: CAMBIO_ETAPA
   Content: "Convertido en estudiante - Matrícula confirmada"
   ```

7. **Sistema** actualiza métricas:
   - ✅ Tasa de conversión del mes
   - ✅ Valor cerrado: $1.500.000
   - ✅ Time to close: 5 días (desde NUEVO)

**Resultado:**
- Lead convertido a estudiante
- Plan de pagos generado
- Métricas actualizadas
- Ciclo completo del embudo cerrado

---

### 🟠 Caso 6: Análisis de Embudo (Dashboard)

**Actor:** Director académico / Admin
**Precondiciones:** Datos de ventas del mes
**Flujo:**

1. **Admin** accede a analytics:
   ```
   URL: /admin/agentes-kanban → Tab "Estadísticas"
   O
   URL: /reportes → Sección Embudo
   ```

2. **Admin** ve métricas:
   ```
   Embudo del Mes:
   - NUEVO: 120 leads
   - CONTACTADO: 85 (71% conversión)
   - INTERESADO: 60 (71%)
   - MASTERCLASS_REGISTRADO: 45 (75%)
   - MASTERCLASS_ASISTIO: 30 (67%)
   - APLICACION: 25 (83%)
   - LLAMADA_AGENDADA: 20 (80%)
   - LLAMADA_REALIZADA: 18 (90%)
   - NEGOCIACION: 15 (83%)
   - MATRICULADO: 12 (80%)
   - PERDIDO: 35
   ```

3. **Admin** identifica cuellos de botella:
   ```
   ⚠️ MASTERCLASS_ASISTIO → APLICACION: 67%
   Problema: Muchos se registran pero no asisten

   Acción: Implementar recordatorios 24h y 1h antes
   ```

4. **Admin** analiza fuentes:
   ```
   Mejores fuentes (conversión a MATRICULADO):
   1. Referidos: 25% (6/24)
   2. Landing Pages: 15% (12/80)
   3. WhatsApp directo: 10% (2/20)
   4. Redes Sociales: 5% (1/20)
   ```

5. **Admin** ve ROI:
   ```
   Inversión Meta Ads: $500.000 COP
   Leads generados: 80
   Matrículas: 12
   Ingreso: $18.000.000
   ROI: 3,500%
   ```

**Resultado:**
- Decisiones basadas en datos
- Optimización de presupuesto
- Identificación de mejoras

---

## 🛠️ CASOS DE USO TÉCNICOS (Para QA/Desarrollo)

### Test 1: Rate Limiting API Pública

```bash
# Intentar spam a API pública
for i in {1..100}; do
  curl -X POST https://edutec.kaledsoft.tech/api/public/leads \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","phone":"3001234567","email":"test@test.com"}'
done

# Esperado: Rate limit después de ~20 requests
```

### Test 2: Validación Zod en APIs

```bash
# Datos inválidos
curl -X POST https://edutec.kaledsoft.tech/api/public/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"A","phone":"123","email":"invalid"}'

# Esperado: 400 Bad Request con detalles de error Zod
```

### Test 3: Multi-Tenant Isolation

```bash
# Lead creado en tenant A no debe verse en tenant B

# 1. Crear lead en edutec
curl -X POST https://edutec.kaledsoft.tech/api/public/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Lead Edutec","phone":"3001111111","email":"edutec@test.com"}'

# 2. Intentar ver desde otro tenant (debe fallar o no mostrar)
curl -X GET https://otrotenant.kaledsoft.tech/api/funnel/pipeline \
  -H "Cookie: session_token=<token-otro-tenant>"

# Esperado: Lead NO visible en otro tenant
```

### Test 4: WhatsApp Signature Verification

```bash
# Simular webhook con firma inválida (debe rechazar)
curl -X POST https://edutec.kaledsoft.tech/api/whatsapp/webhook \
  -H "x-hub-signature-256: sha256=fakesignature" \
  -d '{"object":"whatsapp_business_account"}'

# Esperado: 403 Forbidden (en producción)
```

---

## 📊 MÉTRICAS A MONITOREAR

### En Desarrollo
- [ ] Response time APIs < 500ms
- [ ] Error rate < 1%
- [ ] Build time < 2 minutos
- [ ] Test coverage > 80%

### En Producción
- [ ] Leads capturados por día
- [ ] Tasa de conversión por etapa
- [ ] Tiempo promedio en cada etapa
- [ ] ROI de Meta Ads
- [ ] Uptime > 99.9%
- [ ] P95 latency < 1s

---

## 🎯 OBJETIVOS DE NEGOCIO (30 días)

**Meta:** 30 estudiantes matriculados

**Plan:**
- Leads diarios necesarios: 35-40
- Masterclasses por semana: 2
- Tasa de asistencia target: 70%
- Tasa de cierre target: 15%

**Estrategia:**
1. Invertir $500k/mes en Meta Ads
2. 3 landings diferentes (A/B testing)
3. Automatizar con Margy/Kaled
4. Seguimiento agresivo post-masterclass

**KPIs:**
- CPL (Cost Per Lead): < $7,000
- CPA (Cost Per Acquisition): < $50,000
- Time to Close: < 10 días
- Lead Response Time: < 5 minutos

---

**Última actualización:** 2026-02-21
