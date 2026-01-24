# Script PowerShell para verificar archivos sensibles

Write-Host "🔍 Buscando archivos sensibles..." -ForegroundColor Yellow

# Buscar archivos de claves SSH
$patterns = @("id_rsa", "id_rsa.pub", "id_ed25519", "id_ed25519.pub", "*.pem", "*.key")
$excludeDirs = @("node_modules", ".git", ".next", "dist", "build")

foreach ($pattern in $patterns) {
    Get-ChildItem -Path . -Filter $pattern -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { 
            $excluded = $false
            foreach ($dir in $excludeDirs) {
                if ($_.FullName -like "*\$dir\*") {
                    $excluded = $true
                    break
                }
            }
            -not $excluded
        } | 
        Select-Object FullName
}

Write-Host "`n📜 Buscando en el historial de Git..." -ForegroundColor Yellow
git log --all --full-history --source -- "*id_rsa*" "*id_ed25519*" "*.pem" "*.key" 2>$null

Write-Host "`n✅ Verificación completada" -ForegroundColor Green
Write-Host "`nSi encontraste archivos sensibles, NO los subas a Git." -ForegroundColor Red
Write-Host "Usa el archivo SECURITY_FIX.md para eliminarlos del historial." -ForegroundColor Yellow
