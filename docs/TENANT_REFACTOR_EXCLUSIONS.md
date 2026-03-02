# Zona de Exclusión - Refactor Patrón Tenant

**Fecha:** 2026-03-01  
**Motivo:** Protección de la campaña activa en Facebook Ads. No se modifican archivos del flujo de captura de leads.

## Archivos y rutas excluidos

| Archivo | Razón |
|---------|-------|
| `src/app/actions/masterclass.ts` | Server action de captura. Usa `resolveKaledTenantId()` en try/catch; si falla, captura con `tenantId=undefined` para no perder leads. |
| `src/app/api/public/aplicar/route.ts` | API pública de aplicación. Mismo patrón: try/catch en resolución de tenant. |
| `src/modules/masterclass/services/kaled-lead.service.ts` | Método `captureLead(data, tenantId?)` - tenantId OPCIONAL por diseño. |
| `src/modules/kaled-crm/services/kaled-automation.service.ts` | `triggerSequenceByStage` llamado desde captureLead. |
| `src/lib/kaled-tenant.ts` | `resolveKaledTenantId()` usado por rutas de lead capture. |

## Flujo protegido

```
Facebook Ads → /masterclass-ia → captureMasterclassLead() → KaledLeadService.captureLead()
/aplicar → POST /api/public/aplicar → KaledLead (directo)
```

Si la resolución del tenant falla, el lead se captura igual (tenantId=null). Esto evita perder leads por errores de infraestructura.

## Referencia

Ver `docs/IMPLEMENTACION_PRODUCTOS_AISLAMIENTO.md` sección "Protección de Campaña Activa".
