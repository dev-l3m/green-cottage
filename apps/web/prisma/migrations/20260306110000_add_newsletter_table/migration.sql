-- CreateEnum
CREATE TYPE "NewsletterStatus" AS ENUM ('PENDING', 'SUBSCRIBED', 'UNSUBSCRIBED');

-- CreateTable
CREATE TABLE "newsletter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'eco-booklet-popup',
    "gdprConsentAt" TIMESTAMP(3) NOT NULL,
    "status" "NewsletterStatus" NOT NULL DEFAULT 'PENDING',
    "confirmedAt" TIMESTAMP(3),
    "doubleOptInTokenHash" TEXT,
    "doubleOptInTokenExpiresAt" TIMESTAMP(3),
    "downloadTokenHash" TEXT,
    "downloadTokenExpiresAt" TIMESTAMP(3),
    "lastDownloadEmailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_email_key" ON "newsletter"("email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_doubleOptInTokenHash_key" ON "newsletter"("doubleOptInTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_downloadTokenHash_key" ON "newsletter"("downloadTokenHash");

-- CreateIndex
CREATE INDEX "newsletter_status_idx" ON "newsletter"("status");
