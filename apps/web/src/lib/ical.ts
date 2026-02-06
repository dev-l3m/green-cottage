import ICAL from 'ical.js';
import { prisma } from './prisma';
import type { AvailabilityBlock } from '@prisma/client';

export async function parseICalFeed(url: string): Promise<Array<{ start: Date; end: Date; uid?: string }>> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Green Cottage Calendar Sync',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch iCal feed: ${response.statusText}`);
    }

    const icsText = await response.text();
    const jcalData = ICAL.parse(icsText);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');

    const events = vevents.map((vevent) => {
      const event = new ICAL.Event(vevent);
      const start = event.startDate.toJSDate();
      const end = event.endDate.toJSDate();
      const uid = vevent.getFirstPropertyValue('uid');

      return { start, end, uid };
    });

    return events;
  } catch (error) {
    console.error('Error parsing iCal feed:', error);
    throw error;
  }
}

export async function syncICalFeed(cottageId: string, importUrl: string): Promise<void> {
  const events = await parseICalFeed(importUrl);

  // Delete existing ICAL blocks for this cottage
  await prisma.availabilityBlock.deleteMany({
    where: {
      cottageId,
      source: 'ICAL',
    },
  });

  // Create new blocks from iCal events
  for (const event of events) {
    await prisma.availabilityBlock.create({
      data: {
        cottageId,
        startDate: event.start,
        endDate: event.end,
        source: 'ICAL',
        sourceRef: event.uid || undefined,
      },
    });
  }

  // Update last synced timestamp
  await prisma.icalFeed.updateMany({
    where: {
      cottageId,
      importUrl,
    },
    data: {
      lastSyncedAt: new Date(),
    },
  });
}

export function generateICalExport(blocks: AvailabilityBlock[]): string {
  const comp = new ICAL.Component(['vcalendar', [], []]);
  comp.updatePropertyWithValue('version', '2.0');
  comp.updatePropertyWithValue('prodid', '-//Green Cottage//Booking Calendar//EN');
  comp.updatePropertyWithValue('calscale', 'GREGORIAN');

  for (const block of blocks) {
    const vevent = new ICAL.Component('vevent');
    const start = ICAL.Time.fromJSDate(block.startDate, true);
    const end = ICAL.Time.fromJSDate(block.endDate, true);

    vevent.updatePropertyWithValue('uid', `green-cottage-${block.id}@green-cottage.com`);
    vevent.updatePropertyWithValue('dtstart', start);
    vevent.updatePropertyWithValue('dtend', end);
    vevent.updatePropertyWithValue('summary', 'Réservé - Green Cottage');
    vevent.updatePropertyWithValue('description', 'Cette période est réservée');

    comp.addSubcomponent(vevent);
  }

  return comp.toString();
}
