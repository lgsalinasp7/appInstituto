# Instrucciones para Claude Code

> Este archivo se carga automáticamente en CADA conversación. Mantenerlo conciso.
> Documentación detallada del proyecto en `docs/CLAUDE.md`

## Stack

- **Next.js 16.1.4** (App Router + Turbopack) + **React 19** + **Prisma ORM** + **Neon PostgreSQL**
- Multi-tenant SaaS (Colombia) con aislamiento por `x-tenant-slug` header
- Auth: sesiones con httpOnly cookies, roles/permisos

## REGLAS OBLIGATORIAS DE CÓDIGO

### 1. Antes de escribir código

- **SIEMPRE leer el archivo** antes de editarlo (usar Read tool)
- **SIEMPRE seguir los patrones** del código existente en el archivo
- **SIEMPRE ejecutar `npm run build`** después de cambios significativos (>3 archivos o cambios de tipos)
- Consultar `context7` MCP para documentación de librerías antes de usar APIs

### 2. TypeScript estricto

- **PROHIBIDO `any`** — usar tipos específicos de Prisma (`Prisma.InputJsonValue`, `Prisma.XWhereInput`) o `unknown` con type guards
- Si `any` es inevitable (AI SDK types complejos), agregar `// eslint-disable-next-line @typescript-eslint/no-explicit-any` con comentario explicando por qué
- Prisma JSON fields: usar double-cast `as unknown as TargetType` (no cast directo)
- Context params en App Router: usar `context!.params` (non-null assertion)

### 3. React 19

- **PROHIBIDO `forwardRef`** — usar `ref` como prop regular con `ComponentProps<typeof X>`
- **PROHIBIDO `import * as React`** — importar solo lo necesario: `import { useState, type ComponentProps } from "react"`
- `useMemo`/`useCallback` son opcionales en React 19 pero no prohibidos

### 4. Validación con Zod v4

- **PROHIBIDO `z.string().email()`** — usar `z.email()` (shorthand de Zod v4)
- Schemas en `src/modules/{modulo}/schemas/index.ts`

### 5. API Routes

- Respuestas: `{ success: boolean, data?, message?, error? }`
- Auth wrappers: `withTenantAuth`, `withTenantAuthAndCSRF`, `withPlatformAdmin`, `withAcademyAuth`, `withLavaderoAuth`
- Logging estructurado: `logApiStart()`, `logApiSuccess()`, `logApiError()` desde `@/lib/api-logger`
- **PROHIBIDO `console.log`/`console.error` directo** en API routes — usar las funciones de api-logger
- Services server-side deben tener `import "server-only"` al inicio

### 6. Client-side

- **PROHIBIDO `fetch()` raw** en componentes client — usar `tenantFetch()` de `@/lib/tenant-fetch`
- `tenantFetch()` incluye automáticamente el header `x-tenant-slug` del subdominio
- `next/dynamic` con `ssr: false` REQUIERE `'use client'` en el archivo

### 7. Base de datos

- Archivo: `prisma/schema.prisma`
- Después de cambios al schema: `npx prisma generate && npx prisma db push`
- NO modificar migraciones existentes

### 8. Seguridad

- NUNCA hardcodear secrets, API keys, o slugs de tenants
- NUNCA commitear archivos `.env`
- NUNCA exponer datos de otros tenants (validar siempre `tenantId`)

## Estructura de Módulos

```
src/modules/{nombre}/
├── components/    # React components
├── schemas/       # Zod validation schemas
├── services/      # Lógica de negocio (server-side, con "server-only")
├── types/         # TypeScript interfaces
└── hooks/         # Custom hooks (client-side)
```

## Formato de Imports (en orden)

```typescript
// 1. Server-only (si es service)
import "server-only";

// 2. React/Next
import { useState, useEffect } from "react";
import { NextResponse } from "next/server";

// 3. Librerías externas
import { z } from "zod";
import { format } from "date-fns";

// 4. Lib interno
import prisma from "@/lib/prisma";
import { logApiStart, logApiSuccess, logApiError } from "@/lib/api-logger";

// 5. Módulos
import { StudentService } from "@/modules/students/services";

// 6. Types (import type)
import type { Student } from "@/modules/students/types";
```

## Desarrollo Local

- Subdominio Academia: `kaledacademy.localhost:3000`
- Otros tenants: `{slug}.localhost:3000`
- Hosts file: `127.0.0.1 kaledacademy.localhost`

## Archivos de Referencia

| Archivo | Contenido |
|---------|-----------|
| `docs/CLAUDE.md` | Documentación completa del proyecto |
| `REFACTOR_PROGRESS.md` | Progreso de refactorización |
| `docs/IMPLEMENTACION_LAVADERO_PRO.md` | Módulo Lavadero Pro |
| `prisma/schema.prisma` | Schema de base de datos |
