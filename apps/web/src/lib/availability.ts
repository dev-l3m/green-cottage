import { prisma } from './prisma';
import type { BookingStatus } from '@prisma/client';

export async function checkAvailability(
  cottageId: string,
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string
): Promise<boolean> {
  // Check for conflicting bookings
  const conflictingBookings = await prisma.booking.findFirst({
    where: {
      cottageId,
      status: {
        in: ['PENDING', 'PAID'] as BookingStatus[],
      },
      OR: [
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gt: startDate } },
          ],
        },
        {
          AND: [
            { startDate: { lt: endDate } },
            { endDate: { gte: endDate } },
          ],
        },
        {
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } },
          ],
        },
      ],
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
  });

  if (conflictingBookings) {
    return false;
  }

  // Check for availability blocks
  const conflictingBlocks = await prisma.availabilityBlock.findFirst({
    where: {
      cottageId,
      OR: [
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gt: startDate } },
          ],
        },
        {
          AND: [
            { startDate: { lt: endDate } },
            { endDate: { gte: endDate } },
          ],
        },
        {
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } },
          ],
        },
      ],
    },
  });

  if (conflictingBlocks) {
    return false;
  }

  return true;
}

export async function createTemporaryLock(
  cottageId: string,
  startDate: Date,
  endDate: Date,
  ttlMinutes = 15
): Promise<string> {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  const block = await prisma.availabilityBlock.create({
    data: {
      cottageId,
      startDate,
      endDate,
      source: 'INTERNAL',
      sourceRef: `temp-lock-${Date.now()}`,
    },
  });

  // Schedule cleanup (in production, use a job queue)
  setTimeout(async () => {
    try {
      await prisma.availabilityBlock.delete({
        where: { id: block.id },
      });
    } catch (error) {
      // Block may have been deleted already
    }
  }, ttlMinutes * 60 * 1000);

  return block.id;
}
