-- DROP controlado de tablas de leads tenant.
-- Ejecutar solo tras validar precheck.sql y ventana de mantenimiento.

BEGIN;

-- 1) Desacoplar FK a Prospect desde tablas que se conservan.
ALTER TABLE "AgentTask" DROP CONSTRAINT IF EXISTS "AgentTask_prospectId_fkey";

-- 2) Eliminar primero tablas hoja/hijas.
DROP TABLE IF EXISTS "ProspectInteraction";
DROP TABLE IF EXISTS "WhatsAppMessage";
DROP TABLE IF EXISTS "EmailLog";
DROP TABLE IF EXISTS "EmailSequenceStep";
DROP TABLE IF EXISTS "EmailSequence";
DROP TABLE IF EXISTS "EmailTemplate";
DROP TABLE IF EXISTS "Masterclass";

-- 3) Eliminar raíz final.
DROP TABLE IF EXISTS "Prospect";

COMMIT;
