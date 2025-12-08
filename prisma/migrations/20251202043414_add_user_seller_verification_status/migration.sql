-- AlterTable
ALTER TABLE "public"."User"
  ADD COLUMN "sellerVerificationStatus" "public"."SellerVerificationStatus" NOT NULL DEFAULT 'PENDING';
