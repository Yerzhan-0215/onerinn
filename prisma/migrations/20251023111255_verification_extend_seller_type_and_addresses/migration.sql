-- CreateEnum
CREATE TYPE "public"."SellerType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- AlterTable
ALTER TABLE "public"."UserVerification" ADD COLUMN     "actualAddress" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "legalAddress" TEXT,
ADD COLUMN     "sellerType" "public"."SellerType" NOT NULL DEFAULT 'INDIVIDUAL';

-- AlterTable
ALTER TABLE "public"."VerificationDocument" ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "size" INTEGER;
