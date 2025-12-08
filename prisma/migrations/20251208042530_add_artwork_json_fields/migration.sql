-- AlterTable
ALTER TABLE "public"."Artwork" ADD COLUMN     "acquisition" JSONB,
ADD COLUMN     "pricing" JSONB,
ADD COLUMN     "specs" JSONB;
