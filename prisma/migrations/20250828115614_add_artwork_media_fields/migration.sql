-- AlterTable
ALTER TABLE "public"."Artwork" ADD COLUMN     "category" TEXT,
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "quantity" INTEGER DEFAULT 1;

-- CreateTable
CREATE TABLE "public"."Media" (
    "id" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Media_artworkId_type_idx" ON "public"."Media"("artworkId", "type");

-- CreateIndex
CREATE INDEX "Artwork_ownerId_idx" ON "public"."Artwork"("ownerId");

-- AddForeignKey
ALTER TABLE "public"."Media" ADD CONSTRAINT "Media_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "public"."Artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;
