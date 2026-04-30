-- Ola 2.7b: amplia enum CommitmentStatus con CANCELADO y VENCIDO.
-- Habilita soft-delete (status=CANCELADO) en cancelPaymentCommitment y
-- futura marca de vencidos por cron.

ALTER TYPE "CommitmentStatus" ADD VALUE IF NOT EXISTS 'CANCELADO';
ALTER TYPE "CommitmentStatus" ADD VALUE IF NOT EXISTS 'VENCIDO';
