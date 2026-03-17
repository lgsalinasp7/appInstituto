# Validación Schema Prisma vs Neon (neon-app-tecnico)

**Proyecto Neon:** `polished-recipe-25817067` (neon-app-tecnico)  
**Última actualización:** 2026-03-17

## Estado general (post-correcciones)

### Rama main (producción)

| Aspecto | Estado |
|---------|--------|
| Enum FinancePaymentStatus | OK |
| AcademyEnrollment.paymentStatus | OK (tipo enum) |
| Tablas kaled (kaled_code_reviews, kaled_deliverable_evaluations) | OK |

### Rama develop (desarrollo)

| Aspecto | Estado |
|---------|--------|
| Enum FinancePaymentStatus | OK |
| AcademyEnrollment.paymentStatus | OK (tipo enum) |
| Tablas kaled (kaled_code_reviews, kaled_deliverable_evaluations) | OK |

## Correcciones aplicadas (2026-03-17)

1. **Rama main:** Se aplicó la migración `20260317220000_add_finance_payment_status_enum` que crea el enum `FinancePaymentStatus` y convierte `AcademyEnrollment.paymentStatus` de text a enum.
2. **Rama develop:** Se crearon las tablas `kaled_code_reviews` y `kaled_deliverable_evaluations` que faltaban.

## Sincronización futura

Para mantener schema y BD alineados:
- Usar `prisma migrate deploy` en CI/CD contra la URL de cada rama (ver `.github/workflows/deploy-dev.yml` y `deploy-prod.yml`)
- Si Vercel usa otra base de datos y ves errores P2021 ("tabla no existe"), ver [FIX_DATABASE_URL_VERCEL.md](./FIX_DATABASE_URL_VERCEL.md).

## Verificación rápida

```sql
-- Verificar enum en main
SELECT typname FROM pg_type WHERE typname = 'FinancePaymentStatus';

-- Verificar tablas kaled en develop
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('kaled_code_reviews', 'kaled_deliverable_evaluations');
