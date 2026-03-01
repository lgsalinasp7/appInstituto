# Implementacion: Sistema de Productos + Aislamiento Kaled*

Fecha: 2026-02-28

## Resumen

Se implementaron dos sistemas complementarios:

1. **Aislamiento por Tenant** de los 7 modelos Kaled* (CRM/marketing)
2. **Sistema de ProductTemplate** para desplegar tenants desde plantillas

## Cambios Realizados

### Fase 0: Aislamiento de Datos Kaled*

#### Schema (prisma/schema.prisma)
- Agregado `tenantId String?` a 7 modelos: KaledLead, KaledCampaign, KaledEmailTemplate, KaledEmailSequence, KaledEmailLog, KaledLeadInteraction, KaledEmailSequenceStep
- Unique constraints compuestos: `@@unique([email, tenantId])`, `@@unique([name, tenantId])`
- Indices: `@@index([tenantId])` en todos los modelos
- Relaciones inversas en modelo Tenant

#### Infraestructura
- `src/lib/kaled-tenant.ts` - Helper `resolveKaledTenantId()` con cache
- `src/lib/tenant-guard.ts` - Guard `assertTenantContext()`
- `prisma/migrate-kaled-tenantid.ts` - Script migracion datos existentes
- `src/modules/kaled-crm/types/index.ts` - tenantId en interfaces

#### Servicios (6 archivos modificados)
- `kaled-lead.service.ts` - captureLead con tenantId opcional (protege campana activa)
- `kaled-campaign.service.ts` - Todos los metodos reciben tenantId
- `kaled-email.service.ts` - Templates y emails filtrados por tenant
- `kaled-interaction.service.ts` - Interacciones heredan tenant del lead
- `kaled-automation.service.ts` - Secuencias filtradas por tenant
- `kaled-analytics.service.ts` - Metricas filtradas por tenant

#### Rutas API (27 archivos modificados)
- Rutas de leads: resolveKaledTenantId + paso a servicios
- Rutas de campanas: tenantId en CRUD y analytics
- Rutas de email templates: tenantId en CRUD y preview
- Rutas publicas (masterclass, aplicar): Patron seguro con try/catch
- Ruta cron: Procesa todos los tenants

#### Seguridad (3 archivos corregidos)
- `telegram/config/route.ts` - `withAuth` → `withPlatformAdmin(['SUPER_ADMIN'])`
- `documents/route.ts` - `withAuth` → `withPlatformAdmin(['SUPER_ADMIN'])`
- `agents/memories/[id]/route.ts` - `withAuth` → `withPlatformAdmin(['SUPER_ADMIN'])`

### Fase 1: Modelo ProductTemplate

- Nuevo modelo `ProductTemplate` en schema.prisma
- Seed con 3 plantillas: Kaled Academy, Instituto Educativo, Personalizado
- Script: `prisma/seed-product-templates.ts`

### Fase 2: Backend API de Productos

- `src/modules/products/services/products.service.ts` - CRUD + deploy
- `src/app/api/admin/products/route.ts` - GET (listar) + POST (crear)
- `src/app/api/admin/products/[id]/route.ts` - GET + PUT + DELETE
- `src/app/api/admin/products/[id]/deploy/route.ts` - POST (desplegar tenant)

### Fase 3: Frontend UI

- `src/modules/products/components/EmpresasPageClient.tsx` - Tabs (Empresas | Productos)
- `src/modules/products/components/ProductsGridView.tsx` - Grid de cards
- `src/modules/products/components/ProductDeployModal.tsx` - Modal de deploy
- `src/modules/products/components/ProductEditModal.tsx` - Modal de edicion
- `src/app/admin/empresas/page.tsx` - Integra productos en pagina existente

### Fase 4: Limpieza

- Eliminado boton "Crear Kaled Academy" de TenantsListView
- Deprecado endpoint `POST /api/admin/tenants/bootstrap-academy` (410 Gone)

## Flujo de Deploy de Producto

```
Admin selecciona plantilla → Llena formulario (nombre, slug, admin)
    |
    v
POST /api/admin/products/[id]/deploy
    |
    v
ProductsService.deploy():
  1. Obtiene ProductTemplate
  2. Llama TenantsService.create() con datos del template
  3. Upsert TenantBranding con colores del template
  4. Incrementa deployCount
  5. Retorna tenant + password generada
```

## Proteccion de Campana Activa (Facebook Ads)

El flujo critico `Facebook Ad → /masterclass-ia → captureLead()` esta protegido:

1. `tenantId` es nullable - si falla resolucion, el lead se guarda igual
2. `resolveKaledTenantId()` envuelto en try/catch en rutas publicas
3. PostgreSQL: `NULL != NULL` en unique constraints, no hay conflictos
4. No se modificaron landing pages ni pagina de agradecimiento

## Archivos Totales

| Tipo | Cantidad |
|------|----------|
| Creados | 17 |
| Modificados | 40 |
| **Total** | **57** |
