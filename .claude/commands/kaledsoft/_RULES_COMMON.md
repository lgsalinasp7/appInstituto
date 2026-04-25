# Kaledsoft Admin — Reglas Comunes para Todos los Agentes

> Fuente unica de reglas transversales. Todo agente (PO, Dev, QA, Infra, Certy) las aplica.
> Referenciado desde cada archivo de rol.

## 1. Sincronia obligatoria al iniciar

1. Leer `_PRIORITIES.md` **primero**. Es la fuente de verdad del estado actual.
2. Consultar Cerebro Notion (`340bdce7-ef3f-81ce-b3d8-dba46dfbd416`) filtrando por tu rol + `Activo = true`.
3. Si `query-data-source` de Notion falla (bug MCP conocido), trabajar con `_PRIORITIES.md` + memoria local como fuente unica.
4. Si hay discrepancia entre `_PRIORITIES.md` y lo que te piden, pausa y consulta al usuario/PO.

## 2. Auditoria antes de ejecutar (OBLIGATORIO)

Antes de ejecutar cualquier brief, auditar 5-15 min:
- Estado real del codigo (grep del feature, leer archivos mencionados)
- `git status` y `git log` para WIP de otros agentes + merges recientes
- Verificar que el scope del brief aun aplica (puede estar parcialmente hecho o desactualizado)

Reportar al PO con:
1. Que ya esta hecho (scope parcialmente implementado)
2. Riesgos de coordinacion (WIP ajeno, archivos compartidos)
3. Propuesta de ajuste (reducir scope, worktree, stash, esperar merge)

**Esperar OK del PO si hay riesgos antes de ejecutar.** Si no hay riesgos, arrancar y mencionar en el reporte final que se audito sin cambios.

## 3. Paralelismo multi-agente: git worktree

Si otros agentes estan activos, trabaja en worktree aislado. NO stashear WIP ajeno, NO pisar archivos compartidos.

```bash
git worktree add ../amaxoft-admin-<agente>-<tarea> develop
cd ../amaxoft-admin-<agente>-<tarea>
git checkout -b <prefijo>/<tarea>
```

Prefijos: `dev/`, `qa/`, `infra/`, `po/` (segun el agente).

Al terminar, push branch desde el worktree. Usuario/PO decide merge. Limpiar worktree con `git worktree remove ../amaxoft-admin-<agente>-<tarea>` una vez merged.

## 4. Auto-identificacion en reportes

Todo reporte empieza con "Soy <Rol>" (ej: "Soy Dev-1", "Soy Infra", "Soy QA"). Evita confusion cuando el usuario reenvia mensajes entre sesiones.

## 5. Criterio de calidad: skills sobre lineas

Auditar por skills cumplidas, NO por conteo de lineas. Un archivo de 600L bien estructurado (hooks extraidos, responsabilidad unica, cumple skills) es mejor que 4 archivos de 150L mal separados.

Skills relevantes del proyecto: `react-19`, `nextjs-15`, `typescript`, `tailwind-4`, `zod-4`, `zustand-5`, `senior-logging-pattern`, `amaxoft-spinner-implementation`.

Solo refactorizar si violan multiples skills + responsabilidad difusa. Inventarios de lineas se desactualizan tras cada oleada — re-verificar tamanos reales antes de planear refactors.

## 6. Arquitectura DB multi-tenant (CRITICO)

- **Control plane** (`prisma/schema.prisma`, singleton `prisma-main.ts`): User, Tenant, Membership, Quotation, Payment, Invoice, PasswordResetToken, Role, Permission, audit_logs, jobs.
- **Tenant DBs** (`prisma/tenant/` unificado, factory `getTenantPrisma(slug)` con LRU): clientes, empleados, reservas, menu, mesas, ordenes.
- Regla: auth/facturacion/usuarios globales -> main. Negocio -> tenant. NO mezclar.
- Nombres Neon: `dev-tenant-{slug}` o `prod-tenant-{slug}`. Org: `amaxoft-core`.

## 7. Git Flow

- Prefijo por agente: `po/`, `dev/`, `qa/`, `infra/`.
- Commits firmados con `[Rol]` + `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`.
- NUNCA `git push origin main` ni `git push --force` sin autorizacion explicita.
- NUNCA merge a develop sin autorizacion del usuario/PO.
- Responsabilidad tests rotos tras merge: el agente que mergea y rompe tests ajenos es responsable de arreglarlos.

## 8. Gestion de sesion

- Max 2h o 3 modulos por sesion. No forzar mas tareas en racha buena.
- **Checkpoint en Cerebro antes de cerrar**: guardar Progreso + 2-3 aprendizajes clave (Leccion Aprendida, Patron Descubierto, Error Resuelto, Decision Tomada). Marcar Progreso viejo como `Activo = false`.
- Borrar `.playwright-mcp/` al cerrar si se uso (regla proyecto).
- No emojis en codigo, emails, PDFs, scripts, commits.

## 9. Certificacion: 5 Quality Gates

Framework estandar para certificar modulos:

1. **Funcional**: happy path + edge cases, E2E + QA manual documentado
2. **Seguridad**: OWASP top 10, permisos, rate limiting, audit log
3. **Calidad codigo**: 0 errores TS, skills cumplidas, cobertura minima
4. **Observabilidad**: logs estructurados, Sentry en 5xx, metricas utiles
5. **Operacional**: docs (guia + runbook), seeds, migraciones reversibles

PO hace pre-auditoria identificando gaps por gate → crea tareas Dev/QA/Infra/PO-DOCS → Certy valida formalmente.

## 10. NUNCA matar procesos globalmente (Node/npm)

Al correr `npm run dev` el puerto 3000 puede estar ocupado (otro agente lo tiene). Next.js cambia a 3001, 3002, etc. Si necesitas liberar el puerto 3000, **JAMAS** uses comandos que maten todos los procesos Node — matas las sesiones de Claude Code y los otros agentes.

**PROHIBIDO**:
```bash
killall node          # mata TODO proceso node, incluye Claude Code
pkill node            # idem
taskkill /F /IM node.exe    # Windows, idem
pkill -f "npm"        # mata npm incluyendo Claude
```

**CORRECTO** — identificar PID especifico del puerto y matar solo ese:

```bash
# Windows
netstat -ano | findstr :3000
# Copiar el PID (ultima columna) y:
taskkill /PID <pid-especifico> /F

# Unix/Mac
lsof -i :3000 | grep LISTEN
# Tomar el PID (segunda columna) y:
kill -9 <pid-especifico>
```

**Mejor aun**: NO matar. Si el puerto 3000 esta ocupado por otro agente, usa el puerto alterno que Next.js te asigna automaticamente (3001, 3002). Tu trabajo no depende de 3000 especifico — depende de tener el servidor corriendo.

**Antes de matar**: verifica que el proceso NO sea tuyo ni de Claude. `ps` / `tasklist` + filtro por comando (`npm run dev` vs `claude`).

## 11. Optimizacion de tokens

- Haiku: tareas mecanicas (renombres, busquedas simples, actualizaciones de texto)
- Sonnet: refactor estandar, implementacion de features, fixes medianos
- Opus: solo arquitectura, bugs complejos, decisiones de diseno

No usar Opus para mecanicas — es derroche.
