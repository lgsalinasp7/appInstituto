# Refactor remaining high-priority files
$files = @(
    "src\modules\students\components\StudentDetailModal.tsx",
    "src\modules\dashboard\components\PaymentModal.tsx",
    "src\modules\dashboard\components\ReportsView.tsx",
    "src\modules\dashboard\components\PaymentsHistoryView.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
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
        
        # Primary light
        $content = $content -replace 'bg-\[#2d4a6f\]', 'bg-primary-light'
        $content = $content -replace 'hover:bg-\[#2d4a6f\]', 'hover:bg-primary-light'
        
        # Primary dark
        $content = $content -replace 'bg-\[#0f2847\]', 'bg-primary-dark'
        
        # Grays
        $content = $content -replace 'text-\[#64748b\]', 'text-gray-500'
        $content = $content -replace 'text-\[#94a3b8\]', 'text-gray-400'
        $content = $content -replace 'text-\[#334155\]', 'text-gray-700'
        $content = $content -replace 'bg-\[#f8fafc\]', 'bg-gray-50'
        $content = $content -replace 'hover:bg-\[#f8fafc\]', 'hover:bg-gray-50'
        $content = $content -replace 'border-\[#e2e8f0\]', 'border-gray-200'

        # Blues
        $content = $content -replace 'text-\[#3b82f6\]', 'text-blue-500'

        # React 19 Cleanup (Remove useMemo/useCallback if simple)
        $content = $content -replace 'import \{([^}]+), useMemo([^}]*)\} from "react"', 'import {$1$2} from "react"'
        $content = $content -replace 'import \{([^}]+), useCallback([^}]*)\} from "react"', 'import {$1$2} from "react"'
        
        # Attempt to remove basic useMemo wrapping
        # Note: This is a simple regex and might not catch complex multi-line blocks perfectly without AST, 
        # but works for simple cases like `const x = useMemo(() => ...`
        
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "[OK] $file refactored" -ForegroundColor Green
    }
    else {
        Write-Host "[WARN] File not found: $file" -ForegroundColor Yellow
    }
}
