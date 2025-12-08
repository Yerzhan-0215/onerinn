-- AlterTable
ALTER TABLE "public"."Admin" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Artwork" ADD COLUMN     "artist" TEXT,
ADD COLUMN     "size" TEXT,
ADD COLUMN     "style" TEXT;
