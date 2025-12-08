-- CreateEnum
CREATE TYPE "public"."AccountType" AS ENUM ('IBAN', 'CARD');

-- AlterTable
ALTER TABLE "public"."PayoutAccount" ADD COLUMN     "accountType" "public"."AccountType" NOT NULL DEFAULT 'IBAN';
