-- CreateEnum
CREATE TYPE "public"."RentalStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'RENTED', 'MAINTENANCE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."RentalItem" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "brand" TEXT,
    "modelName" TEXT,
    "description" TEXT,
    "condition" TEXT,
    "rentPerDayKzt" INTEGER,
    "rentPerWeekKzt" INTEGER,
    "rentPerMonthKzt" INTEGER,
    "depositKzt" INTEGER,
    "coverUrl" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "public"."RentalStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RentalItem_ownerId_idx" ON "public"."RentalItem"("ownerId");

-- CreateIndex
CREATE INDEX "RentalItem_status_isActive_idx" ON "public"."RentalItem"("status", "isActive");

-- AddForeignKey
ALTER TABLE "public"."RentalItem" ADD CONSTRAINT "RentalItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
