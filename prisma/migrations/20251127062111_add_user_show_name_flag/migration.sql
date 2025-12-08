-- AlterTable
ALTER TABLE "public"."PayoutAccount" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "showName" BOOLEAN NOT NULL DEFAULT false;
