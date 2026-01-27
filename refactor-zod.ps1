# Refactor Zod Schemas to Zod 4 Syntax
$files = Get-ChildItem -Path "src\modules" -Recurse -Include "*.ts", "*.tsx" | Select-String -Pattern "z.string\(\).email\(\)" | Select-Object -ExpandProperty Path -Unique

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Replace z.string().email() with z.email()
        # This regex handles simple cases. 
        # Note: z.string().email({...}) should become z.email({...})
        # Note: z.string({..}).email() might be trickier, but the skill pattern shown is simple z.string().email()
        
        $originalContent = $content
        
        # Simple case: z.string().email() -> z.email()
        $content = $content -replace 'z\.string\(\)\.email\(', 'z.email('
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "[OK] $file refactored" -ForegroundColor Green
        }
    }
}
Write-Host "Zod refactoring complete." -ForegroundColor Cyan
