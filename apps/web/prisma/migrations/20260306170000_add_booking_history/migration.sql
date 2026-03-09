-- CreateTable
CREATE TABLE "BookingHistory" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "previousStatus" "BookingStatus",
    "newStatus" "BookingStatus" NOT NULL,
    "note" TEXT,
    "changedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingHistory_bookingId_createdAt_idx" ON "BookingHistory"("bookingId", "createdAt");

-- CreateIndex
CREATE INDEX "BookingHistory_changedByUserId_idx" ON "BookingHistory"("changedByUserId");

-- AddForeignKey
ALTER TABLE "BookingHistory" ADD CONSTRAINT "BookingHistory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingHistory" ADD CONSTRAINT "BookingHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
