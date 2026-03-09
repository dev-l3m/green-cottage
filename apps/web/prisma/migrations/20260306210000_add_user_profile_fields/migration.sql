-- AlterTable
ALTER TABLE "User"
ADD COLUMN "phone" TEXT,
ADD COLUMN "addressLine1" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "postalCode" TEXT,
ADD COLUMN "country" TEXT,
ADD COLUMN "isProfessional" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "companyName" TEXT,
ADD COLUMN "vatNumber" TEXT;
