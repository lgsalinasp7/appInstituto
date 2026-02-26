-- Precheck SQL (solo validaciones) para retiro de tablas de leads tenant.
-- No ejecuta cambios destructivos.

-- 1) Tenant EDUTEC debe existir.
SELECT id, slug, name, status
FROM "Tenant"
WHERE slug = 'edutec';

-- 2) Inventario de filas en tablas objetivo por tenant edutec.
WITH t AS (SELECT id FROM "Tenant" WHERE slug = 'edutec')
SELECT 'Prospect' AS table_name, COUNT(*)::bigint AS row_count
FROM "Prospect" p, t
WHERE p."tenantId" = t.id
UNION ALL
SELECT 'ProspectInteraction', COUNT(*)::bigint
FROM "ProspectInteraction" pi, t
WHERE pi."tenantId" = t.id
UNION ALL
SELECT 'WhatsAppMessage', COUNT(*)::bigint
FROM "WhatsAppMessage" wm, t
WHERE wm."tenantId" = t.id
UNION ALL
SELECT 'EmailTemplate', COUNT(*)::bigint
FROM "EmailTemplate" et, t
WHERE et."tenantId" = t.id
UNION ALL
SELECT 'EmailSequence', COUNT(*)::bigint
FROM "EmailSequence" es, t
WHERE es."tenantId" = t.id
UNION ALL
SELECT 'EmailSequenceStep (via tenant sequences)', COUNT(*)::bigint
FROM "EmailSequenceStep" ess
JOIN "EmailSequence" es ON es.id = ess."sequenceId"
JOIN t ON es."tenantId" = t.id
UNION ALL
SELECT 'EmailLog', COUNT(*)::bigint
FROM "EmailLog" el, t
WHERE el."tenantId" = t.id
UNION ALL
SELECT 'Masterclass', COUNT(*)::bigint
FROM "Masterclass" m, t
WHERE m."tenantId" = t.id
UNION ALL
SELECT 'AgentTask (tenantId=edutec)', COUNT(*)::bigint
FROM "AgentTask" at, t
WHERE at."tenantId" = t.id
UNION ALL
SELECT 'AgentTask (prospectId linked to edutec)', COUNT(*)::bigint
FROM "AgentTask" at
JOIN "Prospect" p ON p.id = at."prospectId"
JOIN t ON p."tenantId" = t.id
ORDER BY table_name;

-- 3) Verificación de huérfanos/mismatch previos.
SELECT 'ProspectInteraction->Prospect missing' AS check_name, COUNT(*)::bigint AS issues
FROM "ProspectInteraction" pi
LEFT JOIN "Prospect" p ON p.id = pi."prospectId"
WHERE p.id IS NULL
UNION ALL
SELECT 'WhatsAppMessage->Prospect missing', COUNT(*)::bigint
FROM "WhatsAppMessage" wm
LEFT JOIN "Prospect" p ON p.id = wm."prospectId"
WHERE wm."prospectId" IS NOT NULL AND p.id IS NULL
UNION ALL
SELECT 'EmailLog->Prospect missing', COUNT(*)::bigint
FROM "EmailLog" el
LEFT JOIN "Prospect" p ON p.id = el."prospectId"
WHERE el."prospectId" IS NOT NULL AND p.id IS NULL
UNION ALL
SELECT 'AgentTask->Prospect missing', COUNT(*)::bigint
FROM "AgentTask" at
LEFT JOIN "Prospect" p ON p.id = at."prospectId"
WHERE at."prospectId" IS NOT NULL AND p.id IS NULL
UNION ALL
SELECT 'WhatsAppMessage tenant mismatch vs Prospect', COUNT(*)::bigint
FROM "WhatsAppMessage" wm
JOIN "Prospect" p ON p.id = wm."prospectId"
WHERE wm."tenantId" <> p."tenantId"
UNION ALL
SELECT 'EmailLog tenant mismatch vs Prospect', COUNT(*)::bigint
FROM "EmailLog" el
JOIN "Prospect" p ON p.id = el."prospectId"
WHERE el."tenantId" <> p."tenantId"
UNION ALL
SELECT 'AgentTask tenant mismatch vs Prospect (both non-null)', COUNT(*)::bigint
FROM "AgentTask" at
JOIN "Prospect" p ON p.id = at."prospectId"
WHERE at."tenantId" IS NOT NULL AND at."tenantId" <> p."tenantId";

-- 4) FK graph para tablas objetivo.
SELECT
  con.conname AS constraint_name,
  src.relname AS source_table,
  array_agg(src_col.attname ORDER BY u.ord) AS source_columns,
  tgt.relname AS target_table,
  array_agg(tgt_col.attname ORDER BY u.ord) AS target_columns,
  CASE con.confdeltype
    WHEN 'a' THEN 'NO ACTION'
    WHEN 'r' THEN 'RESTRICT'
    WHEN 'c' THEN 'CASCADE'
    WHEN 'n' THEN 'SET NULL'
    WHEN 'd' THEN 'SET DEFAULT'
  END AS on_delete
FROM pg_constraint con
JOIN pg_class src ON src.oid = con.conrelid
JOIN pg_namespace src_ns ON src_ns.oid = src.relnamespace
JOIN pg_class tgt ON tgt.oid = con.confrelid
JOIN pg_namespace tgt_ns ON tgt_ns.oid = tgt.relnamespace
JOIN LATERAL unnest(con.conkey, con.confkey) WITH ORDINALITY AS u(src_attnum, tgt_attnum, ord) ON TRUE
JOIN pg_attribute src_col ON src_col.attrelid = src.oid AND src_col.attnum = u.src_attnum
JOIN pg_attribute tgt_col ON tgt_col.attrelid = tgt.oid AND tgt_col.attnum = u.tgt_attnum
WHERE con.contype = 'f'
  AND src_ns.nspname = 'public'
  AND tgt_ns.nspname = 'public'
  AND (
    src.relname IN ('Prospect','ProspectInteraction','WhatsAppMessage','EmailLog','EmailSequence','EmailSequenceStep','EmailTemplate','Masterclass')
    OR
    tgt.relname IN ('Prospect','ProspectInteraction','WhatsAppMessage','EmailLog','EmailSequence','EmailSequenceStep','EmailTemplate','Masterclass')
  )
GROUP BY con.conname, src.relname, tgt.relname, con.confdeltype
ORDER BY source_table, target_table, constraint_name;
