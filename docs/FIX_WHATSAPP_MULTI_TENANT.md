# Fix WhatsApp Multi-Tenant - Guía de Configuración

**Fecha:** 2026-02-21
**Status:** ✅ IMPLEMENTADO
**Build:** ✅ Exitoso (0 errores, 137 tests passing)

---

## 🎯 PROBLEMA RESUELTO

**Antes:**
```typescript
async function getDefaultTenantId(): Promise<string> {
    return process.env.DEFAULT_TENANT_ID || 'default-tenant';
}
```
❌ **Problema:** Todos los mensajes WhatsApp se asignaban al mismo tenant

**Después:**
```typescript
async function getTenantIdFromWebhook(webhookData: any): Promise<string> {
    // 1. Intenta obtener phoneNumberId del webhook
    // 2. Busca en mapeo PHONE_TO_TENANT
    // 3. Fallback a DEFAULT_TENANT_ID
    // 4. Error si ninguno está configurado
}
```
✅ **Solución:** Multi-tenant real basado en número de WhatsApp Business

---

## 📋 CONFIGURACIÓN EN VERCEL (PRODUCCIÓN)

### Opción 1: Tenant Único (EDUTEC por ahora)

**Pasos:**

1. **Ir a Vercel Dashboard**
   ```
   https://vercel.com/your-team/app-instituto/settings/environment-variables
   ```

2. **Obtener el ID real del tenant EDUTEC**
   ```bash
   # Conectarse a Prisma Studio o ejecutar query SQL:
   SELECT id, slug, name FROM "Tenant" WHERE slug = 'edutec';

   # Copiar el ID (formato: clxxxxxxxxxxxx)
   ```

3. **Agregar variable de entorno en Vercel**
   ```
   Nombre: DEFAULT_TENANT_ID
   Valor: <ID-REAL-DE-EDUTEC-COPIADO-ARRIBA>
   Entornos: ✓ Production ✓ Preview ✓ Development
   ```

4. **Guardar y re-deploy**
   ```bash
   # Vercel automáticamente re-deploya cuando cambias variables
   # O forzar re-deploy:
   git commit --allow-empty -m "chore: trigger redeploy for env vars"
   git push origin main
   ```

**Resultado:**
- ✅ Todos los mensajes WhatsApp se asignan a EDUTEC
- ✅ Funciona inmediatamente
- ✅ No requiere cambios en código

---

### Opción 2: Multi-Tenant (Futuro - cuando haya más tenants)

**Pasos:**

1. **Obtener Phone Number ID de cada tenant**
   ```
   Meta Business Suite → WhatsApp → API Setup → Phone Number ID

   Ejemplo EDUTEC: 123456789012345
   Ejemplo Otro:   987654321098765
   ```

2. **Editar archivo de webhook**
   ```typescript
   // src/app/api/whatsapp/webhook/route.ts línea 72-75

   const PHONE_TO_TENANT: Record<string, string> = {
     '123456789012345': 'cl_tenant_id_edutec',    // EDUTEC
     '987654321098765': 'cl_tenant_id_otro',      // Otro Instituto
     // Agregar más según sea necesario
   };
   ```

3. **Commit y deploy**
   ```bash
   git add src/app/api/whatsapp/webhook/route.ts
   git commit -m "feat: add WhatsApp phone to tenant mapping"
   git push origin main
   ```

**Resultado:**
- ✅ Cada tenant tiene su propio número WhatsApp
- ✅ Mensajes se asignan automáticamente al tenant correcto
- ✅ Escalable a N tenants

---

## 🧪 PRUEBAS POST-CONFIGURACIÓN

### Test 1: Verificar Variable de Entorno

```bash
# En terminal de Vercel (Functions → Runtime Logs):
# Buscar línea de log al procesar webhook:

[WhatsApp] Usando DEFAULT_TENANT_ID: cl_tenant_id_edutec

# O con mapeo:
[WhatsApp] Tenant resuelto desde mapeo: cl_tenant_id_edutec
```

### Test 2: Simular Webhook Local

```bash
# Crear archivo test-webhook.json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WABA_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "573001234567",
          "phone_number_id": "123456789012345"
        },
        "messages": [{
          "from": "573009998877",
          "id": "wamid.test",
          "timestamp": "1234567890",
          "text": {
            "body": "Hola, quiero información"
          },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}

# Enviar a webhook local (desarrollo):
curl -X POST http://localhost:3000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d @test-webhook.json

# Verificar en logs:
# 1. Tenant correcto identificado
# 2. Prospect creado en tenant correcto
# 3. Sin errores
```

### Test 3: Mensaje Real de WhatsApp

1. **Enviar mensaje desde un teléfono real al número WhatsApp Business de EDUTEC**
   ```
   Mensaje: "Hola, quiero información sobre el bootcamp"
   ```

2. **Verificar en Vercel Logs**
   ```
   Functions → Runtime Logs → Filtrar por "whatsapp"

   Esperado:
   ✓ [WhatsApp] Tenant resuelto desde mapeo: cl_xxx_edutec
   ✓ Prospect creado/actualizado
   ✓ Interacción WHATSAPP_RECIBIDO creada
   ✓ (Si Margy está activo) Auto-respuesta enviada
   ```

3. **Verificar en Base de Datos**
   ```sql
   -- Ver prospect creado
   SELECT id, name, phone, source, "tenantId"
   FROM "Prospect"
   WHERE phone = '573009998877';

   -- Verificar que tenantId es correcto (edutec)
   -- Verificar que source = 'WHATSAPP'
   ```

---

## ⚙️ CONFIGURACIÓN COMPLETA DE WHATSAPP

### Variables de Entorno Requeridas

```env
# Tenant (OBLIGATORIO - una de estas dos opciones)
DEFAULT_TENANT_ID=cl_tenant_id_edutec              # Opción 1: Tenant único
# O configurar mapeo en código (Opción 2)           # Opción 2: Multi-tenant

# WhatsApp Business API (desde Meta Developer Console)
WHATSAPP_PHONE_NUMBER_ID=123456789012345           # Phone Number ID
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx     # Permanent Token
WHATSAPP_VERIFY_TOKEN=mi_token_secreto_123         # Cualquier string (para verificación)
WHATSAPP_APP_SECRET=abc123def456ghi789             # App Secret (para firma)

# Agente Margy (OPCIONAL - solo si quieres auto-respuestas)
MARGY_AUTO_RESPONSE_ENABLED=false                  # true para activar, false para desactivar
```

### Cómo Obtener Credenciales de Meta

1. **Ir a Meta Developer Console**
   ```
   https://developers.facebook.com/apps/
   ```

2. **Seleccionar tu app → WhatsApp → API Setup**

3. **Copiar valores:**
   - **Phone Number ID:** En "Phone Number ID" (número largo)
   - **Access Token:** Generar "Permanent Token" (NO usar temporary)
   - **App Secret:** Settings → Basic → App Secret (click "Show")
   - **Verify Token:** Lo defines tú (cualquier string seguro)

4. **Configurar Webhook en Meta:**
   ```
   Callback URL: https://edutec.kaledsoft.tech/api/whatsapp/webhook
   Verify Token: <el-mismo-que-configuraste-en-WHATSAPP_VERIFY_TOKEN>

   Subscriptions:
   ✓ messages
   ✓ message_status
   ```

---

## 🚨 TROUBLESHOOTING

### Error: "No se pudo determinar el tenant"

**Causa:** `DEFAULT_TENANT_ID` no está configurado y no hay mapeo

**Solución:**
```bash
# Verificar variable en Vercel:
vercel env ls

# Si no existe, agregar:
vercel env add DEFAULT_TENANT_ID production
# Pegar el ID del tenant cuando pida el valor

# Re-deploy:
vercel --prod
```

### Error: "phoneNumberId no encontrado en mapeo"

**Causa:** El `phone_number_id` del webhook no está en `PHONE_TO_TENANT`

**Solución:**
1. Ver logs para identificar el `phoneNumberId`:
   ```
   [WhatsApp] phoneNumberId 123456789012345 no encontrado en mapeo
   ```

2. Agregar al mapeo en código (línea 72-75):
   ```typescript
   const PHONE_TO_TENANT: Record<string, string> = {
     '123456789012345': 'cl_tenant_id_edutec',  // ← Agregar esta línea
   };
   ```

3. Commit + push + deploy

### Webhook recibe pero no responde (Margy inactivo)

**Causa:** `MARGY_AUTO_RESPONSE_ENABLED` está en `false` o no configurado

**Comportamiento esperado:**
- ✅ Prospect se crea correctamente
- ✅ Mensaje se guarda en BD
- ❌ No hay auto-respuesta

**Para activar Margy:**
```env
MARGY_AUTO_RESPONSE_ENABLED=true
```

**Nota:** Según el cliente, Margy está en desarrollo. Solo activar cuando el cliente lo apruebe.

---

## 📊 MONITOREO POST-IMPLEMENTACIÓN

### Qué revisar en las primeras 24h

**Logs de Vercel:**
```bash
# Buscar errores de webhook
vercel logs --prod | grep "whatsapp"

# Buscar asignaciones exitosas
vercel logs --prod | grep "Tenant resuelto"
```

**Base de Datos:**
```sql
-- Prospects creados desde WhatsApp hoy
SELECT COUNT(*), "tenantId"
FROM "Prospect"
WHERE source = 'WHATSAPP'
  AND "createdAt" >= NOW() - INTERVAL '1 day'
GROUP BY "tenantId";

-- Debe mostrar solo el tenant correcto (edutec)
```

**Métricas esperadas:**
- ✅ Todos los prospects en tenant correcto
- ✅ Sin errores 500 en webhook
- ✅ Response time < 2 segundos
- ✅ 100% de webhooks procesados exitosamente

---

## 🔄 ROLLBACK (Si algo falla)

**Si el webhook falla después del deploy:**

1. **Rollback en Vercel (< 2 minutos)**
   ```
   Vercel Dashboard → Deployments →
   Click deployment anterior (antes del fix) →
   "Promote to Production"
   ```

2. **Verificar que volvió a funcionar**
   ```bash
   # Enviar mensaje WhatsApp de prueba
   # Debe crear prospect (aunque en tenant incorrecto, al menos funciona)
   ```

3. **Investigar el problema localmente**
   ```bash
   git log  # Ver commits recientes
   git checkout <commit-anterior>
   npm run dev
   # Probar con test-webhook.json
   ```

---

## ✅ CHECKLIST FINAL

### Antes de Deploy a Producción

- [x] Fix implementado en `src/app/api/whatsapp/webhook/route.ts`
- [x] Build exitoso (0 errores)
- [x] Tests pasando (137/137)
- [ ] **`DEFAULT_TENANT_ID` configurado en Vercel** (CRÍTICO)
- [ ] Valor de `DEFAULT_TENANT_ID` es el ID real de EDUTEC (no "default-tenant")
- [ ] Variables WhatsApp configuradas (PHONE_NUMBER_ID, ACCESS_TOKEN, etc.)
- [ ] Webhook configurado en Meta Developer Console
- [ ] Test local exitoso con webhook simulado

### Después de Deploy

- [ ] Verificar logs: "Tenant resuelto desde..." aparece
- [ ] Enviar mensaje real de prueba
- [ ] Verificar prospect en BD con tenantId correcto
- [ ] Monitorear logs por 1 hora
- [ ] Informar al cliente que WhatsApp está funcionando

---

**Última actualización:** 2026-02-21 06:20
**Implementado por:** Claude Code AI
**Status:** ✅ LISTO PARA PRODUCCIÓN (después de configurar DEFAULT_TENANT_ID)
