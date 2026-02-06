-- CreateTable
CREATE TABLE "PublicReview" (
    "id" TEXT NOT NULL,
    "cottageId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "author" TEXT,
    "comment" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicReview_cottageId_idx" ON "PublicReview"("cottageId");

-- CreateIndex
CREATE INDEX "PublicReview_slug_idx" ON "PublicReview"("slug");

-- CreateIndex
CREATE INDEX "PublicReview_status_idx" ON "PublicReview"("status");

-- AddForeignKey
ALTER TABLE "PublicReview" ADD CONSTRAINT "PublicReview_cottageId_fkey" FOREIGN KEY ("cottageId") REFERENCES "Cottage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
