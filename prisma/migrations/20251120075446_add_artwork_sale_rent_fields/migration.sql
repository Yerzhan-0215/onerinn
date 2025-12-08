-- CreateEnum
CREATE TYPE "public"."ArtworkStatus" AS ENUM ('ACTIVE', 'HIDDEN', 'SOLD', 'ARCHIVED');

-- AlterTable
ALTER TABLE "public"."Artwork" ADD COLUMN     "forRent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "forSale" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lifecycleStatus" "public"."ArtworkStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "rentPerDayKzt" INTEGER,
ADD COLUMN     "rentPerMonthKzt" INTEGER,
ADD COLUMN     "rentPerWeekKzt" INTEGER,
ADD COLUMN     "salePriceKzt" INTEGER;
