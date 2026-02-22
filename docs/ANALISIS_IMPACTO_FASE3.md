# Análisis de Impacto - Fase 3: Landing Pages

**Fecha:** 2026-02-21
**Build Status:** ✅ Exitoso (0 errores, 137 tests passing)
**Tenant Afectado:** edutec (en producción)

---

## 📊 RESUMEN EJECUTIVO

### Cambios Implementados (Fase 3)
- ✅ 13 archivos nuevos para Landing Pages de Masterclass
- ✅ 4 APIs públicas (sin autenticación)
- ✅ Nuevo módulo `masterclass` con servicios completos
- ✅ Formularios de captura de leads con UTM tracking

### Estado del Build
- **Compilación:** ✅ Exitosa
- **Tests:** ✅ 137/137 passing
- **TypeScript:** ✅ Sin errores
- **Rutas generadas:** 94 rutas

### Impacto en EDUTEC
- 🟢 **Bajo riesgo** - Archivos nuevos, sin modificaciones a funcionalidad existente
- ⚠️ **1 problema identificado** - Webhook WhatsApp multi-tenant

---

## 🔍 ANÁLISIS DETALLADO

### Archivos Creados (NO modifican funcionalidad existente)

#### Módulo Masterclass (5 archivos)
```
src/modules/masterclass/
├── types/index.ts              [NUEVO]
├── schemas/index.ts            [NUEVO]
├── services/
│   ├── masterclass.service.ts  [NUEVO]
│   └── public-lead.service.ts  [NUEVO]
└── index.ts                    [NUEVO]
```

#### APIs Públicas (4 archivos)
```
src/app/api/
├── public/
│   ├── leads/route.ts                    [NUEVO]
│   └── masterclass/[slug]/route.ts       [NUEVO]
└── masterclasses/
    ├── route.ts                          [NUEVO]
    └── [id]/route.ts                     [NUEVO]
```

#### Componentes Landing (4 archivos)
```
src/components/landing/
├── LeadCaptureForm.tsx         [NUEVO]
├── MasterclassCountdown.tsx    [NUEVO]
├── ThankYouCard.tsx            [NUEVO]
└── CtaButton.tsx               [NUEVO]
```

#### Páginas (2 archivos)
```
src/app/lp/
├── masterclass/[slug]/page.tsx [NUEVO]
└── gracias/page.tsx            [NUEVO]
```

#### Utilidades (1 archivo)
```
src/lib/tenant-utils.ts         [NUEVO]
```

### Archivos Modificados

#### ✅ Sin Impacto en EDUTEC
- `src/proxy.ts` - Solo agregó `/lp` y `/api/public` a rutas públicas (no afecta rutas existentes)

---

## ⚠️ PROBLEMA IDENTIFICADO

### 🔴 WhatsApp Webhook - Multi-Tenant Issue

**Ubicación:** `src/app/api/whatsapp/webhook/route.ts` línea 65-69

**Problema:**
```typescript
async function getDefaultTenantId(): Promise<string> {
    // Por ahora retornamos un tenant fijo
    // TODO: Implementar lógica para multi-tenant basado en número de teléfono
    return process.env.DEFAULT_TENANT_ID || 'default-tenant';
}
```

**Impacto:**
- ❌ Todos los mensajes de WhatsApp se asignan al mismo tenant
- ❌ Si EDUTEC usa WhatsApp en producción, podría recibir leads de otros tenants o viceversa
- ❌ No hay forma de identificar el tenant correcto desde un mensaje WhatsApp entrante

**Solución Requerida (URGENTE antes de producción):**

Opción 1: **Un número de WhatsApp por tenant**
```typescript
async function getTenantIdByPhone(businessPhoneId: string): Promise<string> {
    // Mapeo de teléfonos WhatsApp Business -> tenant
    const phoneToTenant = {
        'PHONE_ID_EDUTEC': 'tenant-id-edutec',
        'PHONE_ID_OTRO': 'tenant-id-otro',
    };
    return phoneToTenant[businessPhoneId] || process.env.DEFAULT_TENANT_ID;
}
```

Opción 2: **Tabla de configuración en BD**
```prisma
model WhatsAppConfig {
  id              String @id @default(cuid())
  tenantId        String @unique
  phoneNumberId   String @unique
  accessToken     String
  tenant          Tenant @relation(fields: [tenantId], references: [id])
}
```

---

## ✅ FUNCIONALIDAD EXISTENTE NO AFECTADA

### Flujos de EDUTEC que SIGUEN funcionando:

1. **Matrícula de Estudiantes** ✅
   - `/matriculas` - Sin cambios
   - API `/api/students` - Sin cambios
   - PaymentService - Sin cambios

2. **Gestión de Recaudos** ✅
   - `/recaudos` - Sin cambios
   - API `/api/payments` - Sin cambios
   - Receipt generation - Sin cambios

3. **Pipeline de Ventas** ✅
   - `/pipeline` - Sin cambios
   - API `/api/funnel/*` - Sin cambios
   - FunnelService - Sin cambios

4. **Dashboard y Reportes** ✅
   - `/dashboard` - Sin cambios
   - `/reportes` - Sin cambios
   - ReportsService - Sin cambios

5. **Agentes IA (en desarrollo)** ✅
   - `/admin/agentes` - Sin cambios
   - Margy/Kaled services - Sin cambios
   - ⚠️ Aún no en producción según cliente

---

## 🧪 PLAN DE PRUEBAS PARA EDUTEC

### Pre-requisitos
```bash
# 1. Backup de BD (OBLIGATORIO)
pg_dump -h neon-host -U user -d db > backup_pre_fase3.sql

# 2. Variable de entorno para tenant por defecto
DEFAULT_TENANT_ID=<edutec-tenant-id>
```

### Fase 1: Pruebas de Regresión (Funcionalidad Existente)

#### Test 1.1: Login y Autenticación
```
URL: https://edutec.kaledsoft.tech/auth/login
Credenciales: superadmin@edutec.edu.co / Admin123!

✓ Login exitoso
✓ Dashboard carga correctamente
✓ Sidebar muestra todas las secciones
✓ Perfil de usuario accesible
```

#### Test 1.2: Gestión de Estudiantes
```
1. Ir a /matriculas
2. Crear nuevo estudiante de prueba
   - Nombre: "TEST REGRESION FASE3"
   - Documento: 1234567890
   - Teléfono: 3001234567
   - Programa: Seleccionar cualquiera
   - Frecuencia: MENSUAL

✓ Estudiante se crea correctamente
✓ Aparece en la lista
✓ Se puede editar
✓ Se puede ver detalle
```

#### Test 1.3: Pagos y Recaudos
```
1. Ir a /recaudos
2. Registrar pago para estudiante de prueba
   - Monto: 50000
   - Método: BANCOLOMBIA
   - Referencia: TEST123

✓ Pago se registra
✓ Recibo se genera
✓ Saldo actualiza
✓ WhatsApp de recibo funciona (si está configurado)
```

#### Test 1.4: Pipeline de Ventas
```
1. Ir a /pipeline
2. Verificar que carga el Kanban
3. Crear nuevo lead de prueba
4. Mover entre etapas (drag & drop)

✓ Pipeline carga sin errores
✓ Leads existentes se muestran
✓ Drag & drop funciona
✓ Timeline de interacciones accesible
```

#### Test 1.5: Reportes
```
1. Ir a /reportes
2. Generar reporte de recaudo del mes
3. Exportar a Excel

✓ Reporte se genera
✓ Datos correctos
✓ Export funciona
```

### Fase 2: Pruebas de Nueva Funcionalidad

#### Test 2.1: Landing Pages Públicas
```
URL: https://edutec.kaledsoft.tech/lp/masterclass/test-slug

Esperado:
❌ 404 Not Found (normal, no hay masterclasses creadas todavía)

Crear masterclass de prueba:
1. Como platform admin, crear masterclass en BD manualmente:
   - title: "Test Masterclass"
   - slug: "test-masterclass"
   - scheduledAt: fecha futura
   - isActive: true
   - tenantId: <edutec-tenant-id>

2. Visitar: /lp/masterclass/test-masterclass

✓ Landing carga correctamente
✓ Countdown funciona
✓ Formulario de captura visible
```

#### Test 2.2: Captura de Leads Públicos
```
1. En landing de masterclass, llenar formulario:
   - Nombre: "Lead Prueba Fase 3"
   - Email: test@test.com
   - Teléfono: 3009998877

2. Submit

✓ Formulario envía correctamente
✓ Redirige a /lp/gracias
✓ Lead aparece en /pipeline
✓ Tiene source=LANDING_PAGE
✓ Tiene funnelStage=MASTERCLASS_REGISTRADO
✓ Score calculado automáticamente
```

#### Test 2.3: Admin de Masterclasses
```
Como platform admin:

1. GET /api/masterclasses
   ✓ Retorna lista de masterclasses

2. POST /api/masterclasses
   Body: {
     "title": "Test API",
     "slug": "test-api",
     "scheduledAt": "2026-03-01T18:00:00Z",
     "duration": 90,
     "isActive": true
   }
   ✓ Crea masterclass

3. PUT /api/masterclasses/[id]
   ✓ Actualiza correctamente

4. DELETE /api/masterclasses/[id]
   ✓ Elimina correctamente
```

### Fase 3: Pruebas de Integración

#### Test 3.1: WhatsApp Webhook (CRÍTICO)
```
⚠️ NO PROBAR EN PRODUCCIÓN SIN FIX

Problema conocido: tenantId hardcodeado

Pasos si se va a probar:
1. Verificar DEFAULT_TENANT_ID en .env
2. Enviar mensaje de prueba al número WhatsApp Business
3. Verificar que lead se crea en tenant correcto

Riesgo: Lead podría crearse en tenant incorrecto
```

#### Test 3.2: Flujo Completo: Lead → Matrícula
```
1. Capturar lead desde landing
2. Ver lead en /pipeline
3. Mover a través de etapas del embudo
4. Convertir en estudiante
5. Registrar matrícula

✓ Flujo completo funciona
✓ Datos se mantienen consistentes
✓ Score actualiza en cada etapa
```

---

## 📋 CHECKLIST PRE-PRODUCCIÓN

### Crítico (Bloqueante)
- [ ] **FIX WhatsApp multi-tenant** (línea 65-69 de webhook/route.ts)
- [ ] Verificar variable `DEFAULT_TENANT_ID` en Vercel
- [ ] Backup de base de datos realizado
- [ ] Tests de regresión completados (Fase 1)

### Importante (Recomendado)
- [ ] Crear al menos 1 masterclass de prueba para EDUTEC
- [ ] Verificar Meta Pixel ID en .env (si se usa Meta Ads)
- [ ] Probar captura de lead desde landing
- [ ] Verificar que leads se asignan al primer advisor del tenant

### Opcional (Mejoras futuras)
- [ ] Implementar WhatsAppConfig model en Prisma
- [ ] Admin UI para gestión de masterclasses
- [ ] Analytics de conversión de landings
- [ ] A/B testing de landings

---

## 🚀 PLAN DE DESPLIEGUE A PRODUCCIÓN

### Opción A: Deploy Inmediato (RIESGO BAJO)
Si EDUTEC NO usa WhatsApp activamente:
```bash
git add .
git commit -m "feat: landing pages masterclass + fix imports"
git push origin main
# Vercel auto-deploy
```

### Opción B: Deploy con Fix WhatsApp (RECOMENDADO)
Si EDUTEC usa WhatsApp:
```bash
# 1. Implementar fix de multi-tenant en webhook
# 2. Probar en desarrollo
# 3. Commit + push
# 4. Deploy
```

### Opción C: Deploy Gradual
```
1. Deploy a preview en Vercel
2. Probar con URL preview
3. Promover a producción si todo OK
```

---

## 📞 CONTACTO Y SOPORTE

**Si algo falla en producción:**
1. Rollback inmediato en Vercel (botón "Rollback to this deployment")
2. Revisar logs en Vercel dashboard
3. Verificar errores en /api-docs
4. Contactar equipo de desarrollo

**Variables críticas en Vercel:**
```
DEFAULT_TENANT_ID=<edutec-tenant-id>
WHATSAPP_PHONE_NUMBER_ID=<edutec-whatsapp>
WHATSAPP_ACCESS_TOKEN=<meta-token>
WHATSAPP_VERIFY_TOKEN=<verify-token>
```

---

**Última actualización:** 2026-02-21 23:30
**Responsable:** Claude Code AI
**Estado:** ⚠️ REQUIERE FIX WHATSAPP ANTES DE PRODUCCIÓN
