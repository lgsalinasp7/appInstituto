# Setup: Cron Jobs + Backup S3

## Resumen

- **Keep-alive** (cada 4-5 min): cron-job.org → `/api/cron/keep-alive` (evita cold starts Neon)
- **Crons de negocio**: GitHub Actions → endpoints en Vercel
- **Backup nocturno**: GitHub Actions → pg_dump → AWS S3

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
| `DATABASE_URL` | URL **directa** de Neon (sin -pooler) | Backup pg_dump. En Neon Console → Connect → copiar la conexión directa |
| `AWS_ACCESS_KEY_ID` | Tu access key de AWS | Backup S3 |
| `AWS_SECRET_ACCESS_KEY` | Tu secret key de AWS | Backup S3 |

### Variables (no sensibles)

| Nombre | Valor | Ejemplo |
|--------|-------|---------|
| `VERCEL_CRON_URL` | URL base de tu app en producción | `https://kaledsoft.tech` o `https://app-instituto-xxx.vercel.app` |
| `AWS_REGION` | Región del bucket S3 | `us-east-1` |
| `AWS_S3_BUCKET` | Nombre del bucket | `mi-app-backups` |

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

## 4. AWS S3 (backup nocturno)

### Crear cuenta AWS

1. [aws.amazon.com](https://aws.amazon.com) → Create an AWS Account
2. Capa gratuita: 5 GB S3, 20.000 GET, 2.000 PUT al mes (12 meses)

### Crear bucket S3

1. S3 → Create bucket
2. Nombre único (ej: `app-instituto-backups-2025`)
3. Región: `us-east-1` (o la más cercana)
4. Block Public Access: mantener activado
5. Crear

### Usuario IAM para GitHub Actions

1. IAM → Users → Create user
2. Nombre: `github-backup`
3. Attach policies: `AmazonS3FullAccess` (o una policy custom más restrictiva)
4. Create user → Security credentials → Create access key
5. Tipo: Application running outside AWS
6. Copiar Access Key ID y Secret Access Key → añadirlos a GitHub Secrets

### Policy restrictiva (opcional)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::TU-BUCKET/backups/*"
    }
  ]
}
```

---

## 5. Verificación

- **GitHub Actions**: Tras push, los workflows aparecen en la pestaña Actions
- **cron-job.org**: En el dashboard verás el historial de ejecuciones
- **Backup**: Ejecutar manualmente el workflow "Backup Neon a S3" y comprobar que el archivo aparece en S3

---

## 6. Retención de backups

Por defecto los backups se acumulan en `s3://bucket/backups/neon-YYYY-MM-DD.dump`. Para limitar espacio:

- Crear lifecycle rule en S3: eliminar objetos tras X días (ej: 30)
- O un workflow que borre backups antiguos
