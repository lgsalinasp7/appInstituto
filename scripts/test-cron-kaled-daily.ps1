# Test del cron kaled-daily
# Uso: .\scripts\test-cron-kaled-daily.ps1
# Requiere: $env:CRON_SECRET (o pasarlo como argumento)
# Ejemplo: $env:CRON_SECRET="tu-secret"; .\scripts\test-cron-kaled-daily.ps1

param([string]$Secret = $env:CRON_SECRET)

if (-not $Secret) {
  Write-Host "ERROR: CRON_SECRET no definido." -ForegroundColor Red
  Write-Host "Uso: `$env:CRON_SECRET='tu-secret'; .\scripts\test-cron-kaled-daily.ps1" -ForegroundColor Yellow
  Write-Host "O: .\scripts\test-cron-kaled-daily.ps1 -Secret 'tu-secret'" -ForegroundColor Yellow
  exit 1
}

$url = "https://www.kaledsoft.tech/api/cron/kaled-daily"
$headers = @{
  "Authorization" = "Bearer $Secret"
}

try {
  $resp = Invoke-WebRequest -Uri $url -Headers $headers -Method GET -UseBasicParsing
  Write-Host "HTTP $($resp.StatusCode)" -ForegroundColor Green
  Write-Host $resp.Content
  if ($resp.StatusCode -eq 200) { exit 0 } else { exit 1 }
} catch {
  Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
  if ($_.Exception.Response) {
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $body = $reader.ReadToEnd()
    Write-Host "Body: $body"
  }
  exit 1
}
