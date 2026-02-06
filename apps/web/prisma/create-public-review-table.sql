-- Run only if PublicReview table is missing (migration already marked applied).
-- Command: pnpm exec prisma db execute --file prisma/create-public-review-table.sql

CREATE TABLE IF NOT EXISTS "PublicReview" (
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

CREATE INDEX IF NOT EXISTS "PublicReview_cottageId_idx" ON "PublicReview"("cottageId");
CREATE INDEX IF NOT EXISTS "PublicReview_slug_idx" ON "PublicReview"("slug");
CREATE INDEX IF NOT EXISTS "PublicReview_status_idx" ON "PublicReview"("status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PublicReview_cottageId_fkey'
  ) THEN
    ALTER TABLE "PublicReview" ADD CONSTRAINT "PublicReview_cottageId_fkey"
      FOREIGN KEY ("cottageId") REFERENCES "Cottage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
