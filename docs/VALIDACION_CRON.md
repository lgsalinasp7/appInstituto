# Validación del Cron kaled-daily

## Estado actual (17 mar 2026)

### ✅ Completado

1. **Fix P2021 aplicado**: Script `ensure-kaled-tables.ts` crea las tablas Kaled en cada build de Vercel.
2. **Deploy en producción**: `dpl_GD5qvmDKhTsvRMAYMexWa9akN5ry` — READY.
3. **Base de datos Neon**: Tablas `kaled_cohort_metrics`, `kaled_instructor_tasks`, `kaled_student_error_patterns` verificadas en proyecto `polished-recipe-25817067`.
4. **Script de prueba**: `scripts/test-cron-kaled-daily.ps1` para validar el endpoint localmente.

### Cómo probar el cron

**Opción A — Script local (con CRON_SECRET de Vercel):**

```powershell
$env:CRON_SECRET = "tu-secret-de-vercel"
.\scripts\test-cron-kaled-daily.ps1
```

**Opción B — GitHub Actions (workflow manual):**

1. Ir a https://github.com/lgsalinasp7/appInstituto/actions/workflows/cron-vercel.yml
2. Clic en "Run workflow"
3. Seleccionar `cron: kaled-daily`
4. Clic en "Run workflow"
5. Revisar el resultado del job (debe ser verde, HTTP 200)

**Opción C — Cron programado:**

El cron se ejecuta automáticamente a las 05:00 UTC (kaled-daily).

### Verificación con MCP

- **Vercel**: Deploy READY, runtime logs sin errores 500 en kaled-daily tras el fix.
- **Neon**: Tablas Kaled presentes en `neon-app-tecnico` / `polished-recipe-25817067`.
- **GitHub**: Commits `f8e697b` (fix) y `1d1abc7` (script de prueba) en main.
