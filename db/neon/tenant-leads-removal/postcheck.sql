-- Postcheck de integridad y salud mínima tras drop de tablas de leads tenant.

-- 1) Confirmar ausencia de tablas removidas.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'Prospect',
    'ProspectInteraction',
    'WhatsAppMessage',
    'EmailLog',
    'EmailSequence',
    'EmailSequenceStep',
    'EmailTemplate',
    'Masterclass'
  )
ORDER BY table_name;

-- 2) Confirmar que no queden FKs colgantes hacia tablas removidas.
SELECT
  con.conname AS constraint_name,
  src.relname AS source_table,
  tgt.relname AS target_table
FROM pg_constraint con
JOIN pg_class src ON src.oid = con.conrelid
JOIN pg_namespace src_ns ON src_ns.oid = src.relnamespace
JOIN pg_class tgt ON tgt.oid = con.confrelid
JOIN pg_namespace tgt_ns ON tgt_ns.oid = tgt.relnamespace
WHERE con.contype = 'f'
  AND src_ns.nspname = 'public'
  AND tgt_ns.nspname = 'public'
  AND tgt.relname IN (
    'Prospect',
    'ProspectInteraction',
    'WhatsAppMessage',
    'EmailLog',
    'EmailSequence',
    'EmailSequenceStep',
    'EmailTemplate',
    'Masterclass'
  );

-- 3) Salud mínima: confirmar que tablas core de EDUTEC/KaledSoft siguen accesibles.
SELECT COUNT(*)::bigint AS tenant_count FROM "Tenant";
SELECT COUNT(*)::bigint AS user_count FROM "User";
SELECT COUNT(*)::bigint AS student_count FROM "Student";
SELECT COUNT(*)::bigint AS payment_count FROM "Payment";
SELECT COUNT(*)::bigint AS kaled_campaign_count FROM "KaledCampaign";
SELECT COUNT(*)::bigint AS kaled_lead_count FROM "KaledLead";
