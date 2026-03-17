-- Fix: El enum FinancePaymentStatus no existe en la BD (columna paymentStatus está como text)
-- Crea el enum si no existe y convierte las columnas a usarlo

DO $$ BEGIN
  CREATE TYPE "public"."FinancePaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'WRITTEN_OFF');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AcademyEnrollment: convertir paymentStatus de text a enum
ALTER TABLE "AcademyEnrollment"
  ALTER COLUMN "paymentStatus" DROP DEFAULT,
  ALTER COLUMN "paymentStatus" TYPE "public"."FinancePaymentStatus"
  USING (
    CASE
      WHEN "paymentStatus"::text IN ('PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'WRITTEN_OFF')
      THEN "paymentStatus"::text::"public"."FinancePaymentStatus"
      ELSE 'PENDING'::"public"."FinancePaymentStatus"
    END
  ),
  ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING'::"public"."FinancePaymentStatus";

-- SoftwareSale: solo si la tabla existe (no en todas las BDs)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'SoftwareSale') THEN
    ALTER TABLE "SoftwareSale"
      ALTER COLUMN "paymentStatus" TYPE "public"."FinancePaymentStatus"
      USING (
        CASE
          WHEN "paymentStatus"::text IN ('PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'WRITTEN_OFF')
          THEN "paymentStatus"::text::"public"."FinancePaymentStatus"
          ELSE 'PENDING'::"public"."FinancePaymentStatus"
        END
      );
  END IF;
END $$;
