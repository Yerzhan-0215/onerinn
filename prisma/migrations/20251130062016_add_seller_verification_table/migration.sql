-- CreateEnum
CREATE TYPE "public"."SellerVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."SellerVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."SellerType",
    "iinOrBin" TEXT,
    "fullName" TEXT,
    "companyName" TEXT,
    "status" "public"."SellerVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "adminComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerVerification_userId_key" ON "public"."SellerVerification"("userId");

-- AddForeignKey
ALTER TABLE "public"."SellerVerification" ADD CONSTRAINT "SellerVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
