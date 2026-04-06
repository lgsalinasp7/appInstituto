#!/bin/bash
# Hook: Check banned patterns after Edit/Write on .ts/.tsx files
# Receives JSON via stdin with tool_input.file_path

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | cut -d'"' -f4)

# Skip if no file path or not a TS/TSX file
if [ -z "$FILE_PATH" ]; then exit 0; fi
case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

# Skip if file doesn't exist (deleted)
if [ ! -f "$FILE_PATH" ]; then exit 0; fi

ERRORS=""

# Check: import * as React (banned in React 19)
if grep -q 'import \* as React' "$FILE_PATH" 2>/dev/null; then
  ERRORS="$ERRORS\n  - PROHIBIDO: 'import * as React' encontrado. Usar imports especificos."
fi

# Check: React.forwardRef (banned in React 19)
if grep -q 'forwardRef' "$FILE_PATH" 2>/dev/null; then
  ERRORS="$ERRORS\n  - PROHIBIDO: 'forwardRef' encontrado. Usar ref como prop regular."
fi

# Check: z.string().email() (should be z.email() in Zod v4)
if grep -q 'z\.string()\.email(' "$FILE_PATH" 2>/dev/null; then
  ERRORS="$ERRORS\n  - PROHIBIDO: 'z.string().email()' encontrado. Usar 'z.email()' (Zod v4)."
fi

# Check: raw fetch() in client components (should use tenantFetch)
if grep -q "'use client'" "$FILE_PATH" 2>/dev/null; then
  # Only check client files, skip if it's the tenantFetch file itself
  case "$FILE_PATH" in
    *tenant-fetch*) ;;
    *)
      if grep -qP '(?<!tenant)fetch\(' "$FILE_PATH" 2>/dev/null; then
        RAWFETCH=$(grep -n 'fetch(' "$FILE_PATH" | grep -v 'tenantFetch' | grep -v 'import' | grep -v '//' | head -3)
        if [ -n "$RAWFETCH" ]; then
          ERRORS="$ERRORS\n  - ADVERTENCIA: fetch() raw detectado en componente client. Considerar tenantFetch()."
        fi
      fi
      ;;
  esac
fi

# Check: console.log in API routes
case "$FILE_PATH" in
  */api/*)
    if grep -qP 'console\.(log|error|warn)\(' "$FILE_PATH" 2>/dev/null; then
      # Exclude api-logger itself
      case "$FILE_PATH" in
        *api-logger*) ;;
        *)
          ERRORS="$ERRORS\n  - ADVERTENCIA: console.log/error directo en API route. Usar logApiStart/logApiSuccess/logApiError."
          ;;
      esac
    fi
    ;;
esac

# Report
if [ -n "$ERRORS" ]; then
  echo "PATRON CHECK en $(basename "$FILE_PATH"):"
  echo -e "$ERRORS"
  # Exit 0 to not block, just warn
  exit 0
fi

exit 0
