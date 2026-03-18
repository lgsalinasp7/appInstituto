# Setup: Cron Jobs + Backup Google Drive

## Resumen

- **Keep-alive** (cada 4-5 min): cron-job.org → `/api/cron/keep-alive` (evita cold starts Neon)
- **Crons de negocio**: GitHub Actions → endpoints en Vercel
- **Backup nocturno**: GitHub Actions → pg_dump → Google Drive (workflow **Backup Neon a Google Drive**)

---

## 1. Repo privado

En GitHub: **Settings → General → Danger Zone → Change repository visibility → Make private**

---

## 2. Secrets y variables en GitHub

**Settings → Secrets and variables → Actions**

### Secrets (valores sensibles)

| Nombre | Valor | Uso |
|--------|-------|-----|
| `CRON_SECRET` | Mismo que en Vercel | Autoriza las llamadas a los crons |
| `DATABASE_URL_PROD` | URL PostgreSQL producción | Backup pg_dump |
| `DIRECT_DATABASE_URL_PROD` | (Opcional) URL **directa** Neon sin `-pooler` | Si el backup sale casi vacío (~20 bytes), configura esta; el workflow la usa con prioridad |
| `RCLONE_DRIVE_TOKEN` | JSON completo de `rclone.conf` (línea `token = {...}`) | Subida a Drive |

### Variables (no sensibles)

| Nombre | Valor | Ejemplo |
|--------|-------|---------|
| `VERCEL_CRON_URL` | URL base de tu app en producción | `https://kaledsoft.tech` o `https://app-instituto-xxx.vercel.app` |

**Backup a Drive:** configura `rclone` en local (`rclone config` → remote `gdrive`), copia el JSON de `token =` a `RCLONE_DRIVE_TOKEN`. Ver [.github/workflows/backup-gdrive.yml](../.github/workflows/backup-gdrive.yml).

---

## 3. cron-job.org (keep-alive cada 4-5 min)

1. Crear cuenta en [cron-job.org](https://cron-job.org)
2. **Create cronjob**
3. **URL**: `https://TU-DOMINIO/api/cron/keep-alive`
4. **Schedule**: Every 5 minutes (o Every 4 minutes)
5. **Request settings** → **Headers**:
   - Name: `Authorization`
   - Value: `Bearer TU_CRON_SECRET`
6. Guardar

Usa un `CRON_SECRET` distinto al de los otros crons si quieres aislar el keep-alive.

---

## 4. Verificación

- **GitHub Actions**: Tras push, los workflows aparecen en la pestaña Actions (el de Drive debe estar en la rama por defecto, p. ej. `main`)
- **cron-job.org**: En el dashboard verás el historial de ejecuciones
- **Backup**: Ejecutar **Backup Neon a Google Drive** y comprobar carpeta `Instituto-Backups/prod/` en tu Google Drive

---

## 5. Retención de backups

El workflow elimina en Drive archivos de **más de 30 días** en `Instituto-Backups/prod/`.
