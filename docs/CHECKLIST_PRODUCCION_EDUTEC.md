# Checklist Pre-Producción EDUTEC

**Fecha:** 2026-02-21
**Deploy Target:** Vercel Production
**Tenant:** edutec (Instituto EDUTEC)

---

## 🔴 CRÍTICO - BLOQUEANTES (Hacer ANTES de deploy)

### 1. Fix WhatsApp Multi-Tenant ✅ IMPLEMENTADO
- [x] **URGENTE:** Revisar `src/app/api/whatsapp/webhook/route.ts`
- [x] Implementar solución multi-tenant
- [x] Build exitoso (0 errores, 137 tests passing)
- [ ] **PENDIENTE:** Configurar `DEFAULT_TENANT_ID` en Vercel (ver paso 3)

**Solución implementada:**
```typescript
// getTenantIdFromWebhook() ahora soporta:
// 1. Mapeo PHONE_TO_TENANT (para múltiples tenants)
// 2. Fallback a DEFAULT_TENANT_ID (para tenant único)
// 3. Error claro si ninguno está configurado
```

**Documentación completa:**
- Ver `docs/FIX_WHATSAPP_MULTI_TENANT.md` para guía de configuración
- Incluye tests, troubleshooting y rollback plan

- [x] Verificar que `tenantId` se obtiene correctamente
- [ ] Configurar variable en Vercel (siguiente paso)

### 2. Backup de Base de Datos
```bash
# Hacer backup ANTES de cualquier deploy
npx prisma db pull --url="postgresql://..." > schema_backup.prisma

# O desde Neon dashboard:
# 1. Ir a tu proyecto Neon
# 2. Branches → Main → ... → Fork branch
# 3. Nombre: "backup-pre-fase3-20260221"
```

- [ ] Backup creado
- [ ] Branch de respaldo en Neon
- [ ] SQL dump descargado localmente

### 3. Variables de Entorno en Vercel ⚠️ CRÍTICO
```bash
# Verificar que TODAS estén configuradas:

DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://edutec.kaledsoft.tech

# WhatsApp (si está en uso)
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_APP_SECRET=...

# AI Models (para agentes)
GROQ_API_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
OPENROUTER_API_KEY=...

# 🚨 CRÍTICO: Tenant por defecto (OBLIGATORIO para WhatsApp)
DEFAULT_TENANT_ID=<id-real-de-edutec>
# ⬆️ Obtener ID real ejecutando en BD:
#    SELECT id FROM "Tenant" WHERE slug = 'edutec';
# Ejemplo: cl_abc123def456ghi789

# Meta Pixel (opcional, si usan Meta Ads)
NEXT_PUBLIC_META_PIXEL_ID=...

# Agente Margy (OPCIONAL - solo si cliente aprueba)
MARGY_AUTO_RESPONSE_ENABLED=false  # true para activar auto-respuestas
```

**Cómo configurar en Vercel:**
1. Ir a: https://vercel.com/settings/environment-variables
2. Click "Add Variable"
3. Nombre: `DEFAULT_TENANT_ID`
4. Valor: Copiar ID de edutec desde BD (query arriba)
5. Entornos: ✓ Production ✓ Preview ✓ Development
6. Guardar → Vercel re-deploya automáticamente

- [ ] Todas las variables verificadas
- [ ] `DEFAULT_TENANT_ID` es el ID correcto de edutec (NO "default-tenant")
- [ ] No hay secrets expuestos en repo

---

## 🟠 IMPORTANTE - Verificar antes de deploy

### 4. Tests de Regresión Locales
```bash
# 1. Instalar deps
npm install

# 2. Ejecutar tests
npm run test

# Esperado: ✅ 137/137 tests passing
```

- [ ] Tests ejecutados
- [ ] Todos pasando (137/137)
- [ ] No hay warnings críticos

### 5. Build Local Exitoso
```bash
npm run build

# Esperado:
# ✅ Compiled successfully
# ✅ 0 errors
# ✅ ~94 routes generated
```

- [ ] Build completado sin errores
- [ ] No hay TypeScript errors
- [ ] Todas las rutas generadas correctamente

### 6. Verificación de Rutas Públicas
```typescript
// En src/proxy.ts línea 80, verificar:
const publicTenantPaths = [
  '/auth',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/suspended',
  '/api-docs',
  '/api/openapi',
  '/api/auth',
  '/lp',            // ← Fase 3
  '/api/public'     // ← Fase 3
];
```

- [ ] `/lp` en rutas públicas
- [ ] `/api/public` en rutas públicas
- [ ] Resto de rutas intactas

### 7. Modelo Prisma Sincronizado
```bash
# Generar cliente Prisma
npx prisma generate

# Verificar que modelo Masterclass existe
npx prisma studio
# → Ver tabla Masterclass en la lista
```

- [ ] Cliente Prisma generado
- [ ] Modelo Masterclass visible
- [ ] No hay warnings de schema

---

## 🟡 RECOMENDADO - Mejorar experiencia

### 8. Crear Datos de Prueba
```bash
# Opción A: Crear masterclass manualmente en Prisma Studio
npx prisma studio
# → Ir a Masterclass → Add record

# Datos de ejemplo:
{
  "title": "Masterclass: Introducción al Bootcamp IA",
  "slug": "bootcamp-ia-intro",
  "description": "Conoce todo sobre nuestro bootcamp",
  "scheduledAt": "2026-03-01T18:00:00Z",
  "duration": 60,
  "isActive": true,
  "tenantId": "<id-de-edutec>"
}
```

- [ ] Al menos 1 masterclass de prueba creada
- [ ] Slug válido (solo minúsculas y guiones)
- [ ] Fecha futura
- [ ] `isActive = true`

### 9. Documentar URLs Nuevas
```
# Landing pages:
https://edutec.kaledsoft.tech/lp/masterclass/[slug]
https://edutec.kaledsoft.tech/lp/gracias

# APIs públicas (sin auth):
https://edutec.kaledsoft.tech/api/public/leads
https://edutec.kaledsoft.tech/api/public/masterclass/[slug]

# Admin APIs (con auth):
https://edutec.kaledsoft.tech/api/masterclasses
https://edutec.kaledsoft.tech/api/masterclasses/[id]
```

- [ ] URLs documentadas
- [ ] Compartidas con equipo EDUTEC
- [ ] Cliente informado de nueva funcionalidad

### 10. Verificar Permisos de Agentes
```
Los agentes IA (Margy/Kaled) están en DESARROLLO según cliente.

Si cliente NO ha aprobado:
- [ ] Verificar que MARGY_AUTO_RESPONSE_ENABLED no esté en .env
- [ ] O que esté en 'false'
- [ ] Agentes solo visibles en /admin (platform admin)

Si cliente YA aprobó:
- [ ] Configurar MARGY_AUTO_RESPONSE_ENABLED=true
- [ ] Verificar que Margy responde a WhatsApp
- [ ] Informar al cliente del comportamiento
```

- [ ] Estado de agentes confirmado con cliente
- [ ] Variables de entorno configuradas según aprobación

---

## 🟢 OPCIONAL - Nice to have

### 11. Configurar Meta Pixel
```env
# Si edutec va a usar Meta Ads:
NEXT_PUBLIC_META_PIXEL_ID=1234567890

# Verificar en landing con Meta Pixel Helper:
# https://chrome.google.com/webstore/detail/meta-pixel-helper
```

- [ ] Meta Pixel ID obtenido de cliente
- [ ] Variable configurada en Vercel
- [ ] Probado en landing con Pixel Helper

### 12. Crear Landing de Ejemplo
```
Tres landings según LANDING_PAGES_GUIA.md:

1. /lp/super-programmer
2. /lp/accelerated-learning
3. /lp/professional-freedom

Estas ya existen (implementadas antes).
```

- [ ] Landings existentes verificadas
- [ ] Funcionan correctamente
- [ ] No interfieren con nuevas landings de masterclass

### 13. Monitoreo Post-Deploy
```bash
# Configurar en Vercel:
- Error tracking
- Performance monitoring
- Web analytics

# O conectar servicio externo:
- Sentry para errors
- LogRocket para sessions
- Plausible para analytics
```

- [ ] Monitoring configurado
- [ ] Alerts configuradas
- [ ] Dashboard de métricas accesible

---

## 🚀 PROCESO DE DEPLOY

### Paso 1: Pre-Deploy
```bash
# 1. Asegurar que estás en rama main
git checkout main
git pull origin main

# 2. Verificar estado limpio
git status

# 3. Último build local
npm run build
```

- [ ] Rama main actualizada
- [ ] Sin cambios uncommitted
- [ ] Build local exitoso

### Paso 2: Deploy a Preview (Opcional pero recomendado)
```bash
# Crear rama temporal
git checkout -b preview/fase3-landing-pages

# Push a GitHub
git push origin preview/fase3-landing-pages

# Vercel creará preview automáticamente
# URL: https://app-instituto-xxx-kaledsoft.vercel.app
```

- [ ] Preview creado
- [ ] URL de preview probada
- [ ] Funcionalidad verificada en preview

### Paso 3: Deploy a Producción
```bash
# Si preview OK, mergear a main:
git checkout main
git merge preview/fase3-landing-pages
git push origin main

# Vercel auto-deploys main a producción
```

- [ ] Merge a main completado
- [ ] Push exitoso
- [ ] Deploy iniciado en Vercel

### Paso 4: Verificación Post-Deploy
```
Inmediatamente después del deploy:

1. Abrir https://edutec.kaledsoft.tech
2. Login con credenciales de prueba
3. Verificar que dashboard carga
4. Ir a /matriculas → verificar que funciona
5. Ir a /pipeline → verificar que funciona
6. Ir a /lp/masterclass/[slug] → verificar landing
```

- [ ] Dashboard funcional
- [ ] Matrícula funcionando
- [ ] Pipeline sin errores
- [ ] Landing pages cargando

### Paso 5: Rollback Plan
```
Si algo falla:

1. Ir a Vercel Dashboard
2. Deployments → Click en deployment anterior
3. Click "Promote to Production"
4. Confirmar rollback

Tiempo estimado de rollback: < 2 minutos
```

- [ ] Equipo informado del plan de rollback
- [ ] Acceso a Vercel dashboard verificado
- [ ] Deployment anterior identificado

---

## 📊 POST-DEPLOY MONITORING

### Primera Hora
- [ ] Revisar logs en Vercel (cada 15 min)
- [ ] Verificar que no hay errores 500
- [ ] Probar login desde diferentes dispositivos
- [ ] Verificar métricas de performance

### Primer Día
- [ ] Monitorear error rate
- [ ] Revisar feedback del cliente EDUTEC
- [ ] Verificar que WhatsApp funciona (si está en uso)
- [ ] Comprobar que leads se capturan correctamente

### Primera Semana
- [ ] Analizar conversión de landing pages
- [ ] Revisar score de leads capturados
- [ ] Verificar que agentes (si activos) funcionan bien
- [ ] Optimizar based en métricas reales

---

## 🆘 CONTACTOS DE EMERGENCIA

**Desarrollador:**
- Claude Code AI (asistente)

**Cliente EDUTEC:**
- [Contacto del cliente]
- [Email de soporte]

**Servicios Críticos:**
- Vercel: https://vercel.com/dashboard
- Neon DB: https://console.neon.tech
- Meta Business: https://business.facebook.com

---

## ✅ SIGN-OFF

### Checklist Completion
- [ ] **Todos los items CRÍTICOS completados**
- [ ] **Todos los items IMPORTANTES completados**
- [ ] **Backup de BD creado**
- [ ] **Variables de entorno verificadas**
- [ ] **Build exitoso**
- [ ] **Tests pasando**

### Aprobaciones
- [ ] **Developer:** Revisión técnica completa
- [ ] **QA:** Tests de regresión pasados
- [ ] **Product Owner:** Funcionalidad aprobada
- [ ] **Cliente EDUTEC:** Notificado del deploy

### Deploy Authorization
- [ ] **Ready for Production:** SÍ / NO
- [ ] **Fecha planeada:** ___________
- [ ] **Hora planeada:** ___________
- [ ] **Responsable:** ___________

---

**Última actualización:** 2026-02-21 06:25
**Status:** ✅ FIX IMPLEMENTADO - Listo para producción después de configurar variable
**Next Steps:**
1. Configurar `DEFAULT_TENANT_ID` en Vercel (obtener ID real de edutec)
2. Ejecutar tests de regresión (Fase 1 del checklist)
3. Deploy a producción
