# Script to batch replace hex colors with Tailwind theme classes
# This script performs safe, pattern-based replacements

$files = Get-ChildItem -Path "src\modules" -Recurse -Filter "*.tsx"

$replacements = @{
    # Primary colors
    'text-\[#1e3a5f\]' = 'text-primary'
    'bg-\[#1e3a5f\]' = 'bg-primary'
    'border-\[#1e3a5f\]' = 'border-primary'
    'hover:text-\[#1e3a5f\]' = 'hover:text-primary'
    'hover:bg-\[#1e3a5f\]' = 'hover:bg-primary'
    'hover:border-\[#1e3a5f\]' = 'hover:border-primary'
    'focus:border-\[#1e3a5f\]' = 'focus:border-primary'
    'focus:ring-\[#1e3a5f\]' = 'focus:ring-primary'
    'shadow-\[#1e3a5f\]' = 'shadow-primary'
    'from-\[#1e3a5f\]' = 'from-primary'
    'to-\[#1e3a5f\]' = 'to-primary'
    'via-\[#1e3a5f\]' = 'via-primary'
    
    # Primary light
    'bg-\[#2d4a6f\]' = 'bg-primary-light'
    'hover:bg-\[#2d4a6f\]' = 'hover:bg-primary-light'
    'to-\[#2d4a6f\]' = 'to-primary-light'
    'from-\[#2d4a6f\]' = 'from-primary-light'
    
    # Primary dark
    'bg-\[#0f2847\]' = 'bg-primary-dark'
    
    # Gray 500 (#64748b)
    'text-\[#64748b\]' = 'text-gray-500'
    
    # Gray 400 (#94a3b8)
    'text-\[#94a3b8\]' = 'text-gray-400'
    
    # Gray 700 (#334155)
    'text-\[#334155\]' = 'text-gray-700'
    
    # Gray 50 (#f8fafc)
    'bg-\[#f8fafc\]' = 'bg-gray-50'
    'hover:bg-\[#f8fafc\]' = 'hover:bg-gray-50'
    
    # Gray 200 (#e2e8f0)
    'border-\[#e2e8f0\]' = 'border-gray-200'
    
    # Blue 500 (#3b82f6)
    'text-\[#3b82f6\]' = 'text-blue-500'
    'via-\[#3b82f6\]' = 'via-blue-500'
}

$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    foreach ($pattern in $replacements.Keys) {
        $replacement = $replacements[$pattern]
        # Escape special regex characters except for already escaped brackets
        $escapedPattern = $pattern -replace '\\', '\\' -replace '\[', '\[' -replace '\]', '\]' -replace '#', '\#'
        $matches = ([regex]$escapedPattern).Matches($content)
        if ($matches.Count -gt 0) {
            $content = $content -replace $escapedPattern, $replacement
            $fileReplacements += $matches.Count
        }
    }
    
    if ($fileReplacements -gt 0) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "[OK] $($file.Name): $fileReplacements replacements" -ForegroundColor Green
        $totalReplacements += $fileReplacements
    }
}

Write-Host ""
Write-Host "[DONE] Total replacements: $totalReplacements" -ForegroundColor Cyan
