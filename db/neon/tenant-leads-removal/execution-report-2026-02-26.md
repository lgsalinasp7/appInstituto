# Neon SQL Safe Drop Report (EDUTEC)

## Scope
- Target DB project: `polished-recipe-25817067` (`neon-app-tecnico`)
- Parent branch: `br-weathered-queen-ahqj8sxe` (`main`)
- Backup branch (snapshot): `br-dark-scene-ahie6xbm`
- Execution dry-run branch: `br-orange-block-ah57wzrl`

## Phase 1 - Live diagnosis (read-only)
- Tenant `edutec` exists: `cmlv08zcg0000vst88b39ztk5`.
- Row counts (edutec):
  - `Prospect`: 6
  - `ProspectInteraction`: 0
  - `WhatsAppMessage`: 0
  - `EmailTemplate`: 0
  - `EmailSequence`: 0
  - `EmailSequenceStep`: 0
  - `EmailLog`: 0
  - `Masterclass`: 0
  - `AgentTask` linked by `prospectId`: 0
- Orphan checks and tenant mismatch checks: all 0 issues.

## FK map (relevant)
- `AgentTask.prospectId -> Prospect.id` (`ON DELETE SET NULL`)
- `EmailLog.prospectId -> Prospect.id` (`ON DELETE SET NULL`)
- `WhatsAppMessage.prospectId -> Prospect.id` (`ON DELETE SET NULL`)
- `ProspectInteraction.prospectId -> Prospect.id` (`ON DELETE CASCADE`)
- Tenant FKs in lead tables are mostly `RESTRICT`.

## Phase 2 - Pre-cut safety
- Backup branch created before any destructive test: `br-dark-scene-ahie6xbm`.
- No writes executed on `main` branch in this run.

## Phase 3 - Controlled SQL scripts
- `db/neon/tenant-leads-removal/precheck.sql`
- `db/neon/tenant-leads-removal/drop_order.sql`
- `db/neon/tenant-leads-removal/postcheck.sql`

## Phase 4 - Controlled execution (dry-run branch)
- `precheck.sql`: passed.
- `drop_order.sql`: executed successfully in `br-orange-block-ah57wzrl`.
- `postcheck.sql`: passed.
  - Target tables absent in dry-run branch.
  - No FKs remain to dropped tables.
  - Core tables still queryable (`Tenant`, `User`, `Student`, `Payment`, `KaledCampaign`, `KaledLead`).

## Additional production risk check (codebase references)
- There are still runtime/service references to tenant lead tables/models in app code (`Prospect`, `Masterclass`, email/whatsapp lead services).
- Applying the drop directly on `main` DB right now can break remaining routes/services that still query those models.

## Safe production rollout recommendation
1. Keep current DB changes as dry-run validated only.
2. Remove/guard remaining runtime reads of removed models.
3. Re-run same 3 scripts in a maintenance window.
4. After successful app smoke tests, execute on `main`.

## Exact drop order validated
1. Drop FK `AgentTask_prospectId_fkey`
2. Drop `ProspectInteraction`
3. Drop `WhatsAppMessage`
4. Drop `EmailLog`
5. Drop `EmailSequenceStep`
6. Drop `EmailSequence`
7. Drop `EmailTemplate`
8. Drop `Masterclass`
9. Drop `Prospect`

## Production execution (completed)
- Date: 2026-02-26
- New pre-main backup branch: `br-young-truth-ah6kvnhh`
- Executed in `main` branch: `br-weathered-queen-ahqj8sxe`
- Sequence executed:
  1. `precheck` (re-run) -> passed
  2. `drop_order` -> success
  3. `postcheck` -> passed
- Postcheck evidence:
  - Target tables not present in `public` schema.
  - No FK constraints remain pointing to dropped tables.
  - Core counts after execution:
    - `Tenant`: 1
    - `User`: 10
    - `Student`: 8
    - `Payment`: 11
    - `KaledCampaign`: 0
    - `KaledLead`: 3
