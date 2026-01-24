# Script PowerShell para eliminar archivos SSH del historial de Git
# Ejecutar desde el directorio raíz del repositorio

Write-Host "⚠️  ADVERTENCIA: Este script reescribirá el historial de Git" -ForegroundColor Red
Write-Host "Asegúrate de haber rotado tus claves SSH antes de continuar" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "¿Continuar? (s/N)"

if ($confirm -notmatch "^[Ss]$") {
    Write-Host "Operación cancelada" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "🗑️  Eliminando archivos SSH del historial..." -ForegroundColor Yellow

# Eliminar archivos específicos del historial
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch id_github_lgsalinasp id_github_lgsalinasp.pub" --prune-empty --tag-name-filter cat -- --all

Write-Host ""
Write-Host "🧹 Limpiando referencias..." -ForegroundColor Yellow

# Limpiar referencias
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host ""
Write-Host "✅ Archivos eliminados del historial local" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Ahora debes hacer force push:" -ForegroundColor Red
Write-Host "   git push origin --force --all" -ForegroundColor Cyan
Write-Host "   git push origin --force --tags" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  ADVERTENCIA: Coordina con tu equipo antes del force push" -ForegroundColor Red
