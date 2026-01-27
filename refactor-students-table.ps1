# Simple batch replacement script
$file = "src\modules\dashboard\components\StudentsTable.tsx"
$content = Get-Content $file -Raw

# Remove useMemo import and usage (React 19 compliance)
$content = $content -replace 'import \{ useState, useMemo \} from "react";', 'import { useState } from "react";'
$content = $content -replace '  const filteredStudents = useMemo\(\(\) => \{[\s\S]*?\}\, \[students, searchTerm, statusFilter\]\);', @'
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.document.includes(searchTerm) ||
      s.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
'@

# Replace hex colors with theme classes
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
$content = $content -replace 'bg-\[#2d4a6f\]', 'bg-primary-light'
$content = $content -replace 'hover:bg-\[#2d4a6f\]', 'hover:bg-primary-light'
$content = $content -replace 'text-\[#64748b\]', 'text-gray-500'
$content = $content -replace 'text-\[#94a3b8\]', 'text-gray-400'
$content = $content -replace 'text-\[#334155\]', 'text-gray-700'
$content = $content -replace 'bg-\[#f8fafc\]', 'bg-gray-50'
$content = $content -replace 'hover:bg-\[#f8fafc\]', 'hover:bg-gray-50'

Set-Content -Path $file -Value $content -NoNewline
Write-Host "[OK] StudentsTable.tsx refactored" -ForegroundColor Green
