# Notion — Configuracion para Agentes Kaledsoft

> Reusa el MCP server `notion-personal` ya configurado para Amaxoft (mismo workspace personal de Luis). Las DBs de Kaledsoft viven en el mismo Notion pero filtradas por proyecto.

## MCP Server

Mismo MCP que usa Amaxoft. Ya configurado a nivel user. Revisar:

```bash
claude mcp list
# Debe aparecer: notion-personal (stdio) - ✓ Connected
```

Si no aparece, configurar:

```bash
claude mcp add notion-personal -s user --env 'OPENAPI_MCP_HEADERS={"Authorization":"Bearer <TOKEN>","Notion-Version":"2025-09-03"}' -- npx -y @notionhq/notion-mcp-server
```

Reiniciar Claude Code tras configurar (el MCP stdio se spawnea al arranque).

## Database IDs y Data Source IDs

> API 2025-09-03 separa `database_id` (contenedor) de `data_source_id` (la tabla real a consultar). `query-data-source` y `retrieve-a-data-source` requieren **data_source_id**.

### Cerebro Agentes Kaledsoft (compartido o nuevo)

**Decision pendiente PO**: dos opciones para el Cerebro:

#### Opcion A — Reusar Cerebro existente con propiedad `Proyecto`
Mismo `CEREBRO_DB_ID` que Amaxoft, agregando una propiedad `Proyecto` (select: Amaxoft / Kaledsoft) para filtrar.

```
CEREBRO_DB_ID=340bdce7-ef3f-81ce-b3d8-dba46dfbd416
CEREBRO_DS_ID=340bdce7-ef3f-81a4-b720-000b027f7ca5
```

#### Opcion B — Cerebro Kaledsoft separado
Crear nueva DB en el mismo workspace con la misma estructura. IDs a poblar tras crear:

```
CEREBRO_KALEDSOFT_DB_ID=<pendiente>
CEREBRO_KALEDSOFT_DS_ID=<pendiente>
```

**Recomendacion**: Opcion A — menos overhead, filtro por proyecto. Decidir en sesion PO inicial.

### DBs propias Kaledsoft (a crear en sesion PO)

```
# Backlog Kaledsoft (tickets cliente + features + refactor)
BACKLOG_KALEDSOFT_DB_ID=<pendiente>
BACKLOG_KALEDSOFT_DS_ID=<pendiente>

# Bugs Kaledsoft (reportes QA por tenant)
BUGS_KALEDSOFT_DB_ID=<pendiente>
BUGS_KALEDSOFT_DS_ID=<pendiente>

# Inventario por tenant (modulos en uso por kaledsoft / poimensoft / edutec / kaledacademy / lavadero)
INVENTARIO_KALEDSOFT_DB_ID=<pendiente>
INVENTARIO_KALEDSOFT_DS_ID=<pendiente>

# Bootcamp curriculum (lecciones kaledacademy generadas por content-creator)
BOOTCAMP_DB_ID=<pendiente>
BOOTCAMP_DS_ID=<pendiente>
```

### Reglas

- Usar `*_DS_ID` para `API-query-data-source`, `API-retrieve-a-data-source`, `API-update-a-data-source`.
- Usar `*_DB_ID` para `API-retrieve-a-database` y como `parent.database_id` al crear paginas.
- Para obtener un data_source_id nuevo: `curl GET /v1/databases/{id} -H "Notion-Version: 2025-09-03"` y leer `data_sources[0].id`.

## Propiedades sugeridas por DB

### Backlog Kaledsoft
- Name (title), Tenant (multi-select: kaledsoft/poimensoft/edutec/kaledacademy/lavadero-prueba/all), Status (status), Priority (select: P0/P1/P2/P3), Agent (multi-select: PO/Dev/QA/Certy/Infra/Project/ContentCreator), Type (select: feature/bug/refactor/legal/contenido), Description (rich text), GeneraDinero (checkbox: true si destraba cobro)

### Bugs Kaledsoft
- Bug ID (title), Tenant (select), Severity (select: P0/P1/P2/P3), Module (select), Status (status), Steps (rich text), Expected (rich text), Actual (rich text), Found By (select), Fixed By (select), Fix Branch (text), Verified (checkbox)

### Inventario Kaledsoft (por tenant)
- Tenant (select), Modulo (title), Estado (select: prod/wip/congelado), En Uso Real (checkbox), Ultima Validacion (date), Notas (rich text)

### Bootcamp (kaledacademy)
- Leccion (title), Modulo (select), Stack (multi-select: HTML/CSS/JS/React/TS/Next/Prisma/SQL/...), Nivel (select: junior/mid/senior), Status (status: drafting/review/publicado), Duracion min (number), MDX Path (rich text), Generado por (select: ContentCreator/Luis), Fecha (date)

### Cerebro Agentes (extender propiedad Proyecto si Opcion A)
- Entrada (title), **Proyecto (select: Amaxoft / Kaledsoft)**, Agente (select), Tipo (select), Modulo (text), Detalle (text), Siguiente Paso (text), Fecha (date), Activo (checkbox)

## Estado de Configuracion

- [x] MCP server `notion-personal` ya operativo (compartido con Amaxoft).
- [ ] Decision: Cerebro reusado (A) o nuevo (B) — PENDIENTE sesion PO.
- [ ] Si A: agregar propiedad `Proyecto` al Cerebro existente.
- [ ] Crear DBs propias Kaledsoft (backlog, bugs, inventario, bootcamp).
- [ ] Compartir las DBs nuevas con la integracion existente.
- [ ] Poblar IDs en este archivo.
- [ ] Inventario inicial: 1 entrada por modulo confirmado en uso por cada tenant.

## Diferencias vs Amaxoft Notion

| Aspecto | Amaxoft Notion | Kaledsoft Notion |
|---|---|---|
| Cerebro | Existente | Reusar (A) o separar (B) |
| Backlog | Jira (ticket KAN-* / AMX-*) + Notion legacy | **Solo Notion** (Jira NO se usa) |
| Bugs | Jira | Solo Notion |
| Tracker principal | Jira `amaxoftcolombia.atlassian.net` | Notion |
