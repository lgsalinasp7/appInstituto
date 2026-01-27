# Refactor RegisterForm.tsx
$file = "src\modules\auth\components\RegisterForm.tsx"
$content = Get-Content $file -Raw

# Replace hex colors
$content = $content -replace 'text-\[#1e3a5f\]', 'text-primary'
$content = $content -replace 'bg-\[#1e3a5f\]', 'bg-primary'
$content = $content -replace 'border-\[#1e3a5f\]', 'border-primary'
$content = $content -replace 'hover:text-\[#1e3a5f\]', 'hover:text-primary'
$content = $content -replace 'hover:bg-\[#1e3a5f\]', 'hover:bg-primary'
$content = $content -replace 'focus:border-\[#1e3a5f\]', 'focus:border-primary'
$content = $content -replace 'focus:ring-\[#1e3a5f\]', 'focus:ring-primary'
$content = $content -replace 'shadow-\[#1e3a5f\]', 'shadow-primary'
$content = $content -replace 'from-\[#1e3a5f\]', 'from-primary'
$content = $content -replace 'to-\[#1e3a5f\]', 'to-primary'
$content = $content -replace 'via-\[#3b82f6\]', 'via-blue-500'
$content = $content -replace 'bg-\[#2d4a6f\]', 'bg-primary-light'
$content = $content -replace 'hover:bg-\[#2d4a6f\]', 'hover:bg-primary-light'
$content = $content -replace 'from-\[#2d4a6f\]', 'from-primary-light'
$content = $content -replace 'to-\[#2d4a6f\]', 'to-primary-light'
$content = $content -replace 'text-\[#64748b\]', 'text-gray-500'
$content = $content -replace 'text-\[#94a3b8\]', 'text-gray-400'
$content = $content -replace 'hover:text-\[#94a3b8\]', 'hover:text-gray-400'
$content = $content -replace 'text-\[#3b82f6\]', 'text-blue-500'
$content = $content -replace 'bg-\[#f8fafc\]', 'bg-gray-50'
$content = $content -replace 'border-\[#e2e8f0\]', 'border-gray-200'

Set-Content -Path $file -Value $content -NoNewline
Write-Host "[OK] RegisterForm.tsx refactored" -ForegroundColor Green
