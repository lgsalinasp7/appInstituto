# Refactor ALL remaining tsx files in modules
$files = Get-ChildItem -Path "src\modules" -Recurse -Filter "*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Primary colors
    $content = $content -replace 'text-\[#1e3a5f\]', 'text-primary'
    $content = $content -replace 'bg-\[#1e3a5f\]', 'bg-primary'
    $content = $content -replace 'border-\[#1e3a5f\]', 'border-primary'
    $content = $content -replace 'hover:text-\[#1e3a5f\]', 'hover:text-primary'
    $content = $content -replace 'hover:bg-\[#1e3a5f\]', 'hover:bg-primary'
    $content = $content -replace 'hover:border-\[#1e3a5f\]', 'hover:border-primary'
    $content = $content -replace 'focus:border-\[#1e3a5f\]', 'focus:border-primary'
    $content = $content -replace 'focus:ring-\[#1e3a5f\]', 'focus:ring-primary'
    $content = $content -replace 'shadow-\[#1e3a5f\]', 'shadow-primary'
    $content = $content -replace 'from-\[#1e3a5f\]', 'from-primary'
    $content = $content -replace 'to-\[#1e3a5f\]', 'to-primary'
    $content = $content -replace 'border-\[#1e3a5f\]/10', 'border-primary/10'
    $content = $content -replace 'bg-\[#1e3a5f\]/5', 'bg-primary/5'
    $content = $content -replace 'to-\[#1e3a5f\]/10', 'to-primary/10'
    $content = $content -replace 'bg-\[#1e3a5f\]/10', 'bg-primary/10'
    $content = $content -replace 'text-\[#1e3a5f\]/80', 'text-primary/80'

    # Primary light
    $content = $content -replace 'bg-\[#2d4a6f\]', 'bg-primary-light'
    $content = $content -replace 'hover:bg-\[#2d4a6f\]', 'hover:bg-primary-light'
    $content = $content -replace 'from-\[#2d4a6f\]', 'from-primary-light'
    $content = $content -replace 'to-\[#2d4a6f\]', 'to-primary-light'
    
    # Primary dark
    $content = $content -replace 'bg-\[#0f2847\]', 'bg-primary-dark'
    
    # Grays
    $content = $content -replace 'text-\[#64748b\]', 'text-gray-500'
    $content = $content -replace 'text-\[#94a3b8\]', 'text-gray-400'
    $content = $content -replace 'hover:text-\[#94a3b8\]', 'hover:text-gray-400'
    $content = $content -replace 'text-\[#334155\]', 'text-gray-700'
    $content = $content -replace 'bg-\[#f8fafc\]', 'bg-gray-50'
    $content = $content -replace 'hover:bg-\[#f8fafc\]', 'hover:bg-gray-50'
    $content = $content -replace 'border-\[#e2e8f0\]', 'border-gray-200'

    # Blues
    $content = $content -replace 'text-\[#3b82f6\]', 'text-blue-500'
    $content = $content -replace 'via-\[#3b82f6\]', 'via-blue-500'

    # Additional patterns found
    $content = $content -replace 'hover:border-\[#1e3a5f\]/30', 'hover:border-primary/30'
    $content = $content -replace 'shadow-\[#1e3a5f\]/20', 'shadow-primary/20'
    $content = $content -replace 'shadow-\[#1e3a5f\]/25', 'shadow-primary/25'
    $content = $content -replace 'hover:shadow-\[#1e3a5f\]/30', 'hover:shadow-primary/30'
    $content = $content -replace 'focus:ring-\[#1e3a5f\]/20', 'focus:ring-primary/20'
    $content = $content -replace 'hover:bg-\[#1e3a5f\]/10', 'hover:bg-primary/10'

    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "[OK] $($file.Name) refactored" -ForegroundColor Green
    }
}
Write-Host "Batch refactoring complete." -ForegroundColor Cyan
