-- AlterTable
ALTER TABLE "public"."Artwork" ADD COLUMN     "district" TEXT,
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "public"."RentalItem" ADD COLUMN     "district" TEXT;
