import ICAL from 'ical.js';
import { prisma } from './prisma';
import type { AvailabilityBlock } from '@prisma/client';

export class ICalSyncError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ICalSyncError';
    this.status = status;
  }
}

export async function parseICalFeed(url: string): Promise<Array<{ start: Date; end: Date; uid?: string }>> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new ICalSyncError('URL iCal invalide. Vérifiez le lien fourni.', 400);
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new ICalSyncError('URL iCal invalide. Seuls les liens HTTP/HTTPS sont acceptés.', 400);
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Green Cottage Calendar Sync',
      },
    });

    if (!response.ok) {
      const statusMessage =
        response.status === 404
          ? 'Le flux iCal est introuvable (404). Vérifiez l’URL de partage.'
          : response.status === 401 || response.status === 403
          ? 'Accès refusé au flux iCal (401/403). Vérifiez que le lien est public.'
          : `Impossible de récupérer le flux iCal (HTTP ${response.status}).`;
      throw new ICalSyncError(statusMessage, 502);
    }

    const icsText = await response.text();
    if (!icsText.includes('BEGIN:VCALENDAR')) {
      throw new ICalSyncError(
        'Le contenu reçu ne semble pas être un fichier iCal valide (VCALENDAR manquant).',
        422
      );
    }

    const jcalData = ICAL.parse(icsText);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');
    if (vevents.length === 0) {
      throw new ICalSyncError('Le flux iCal ne contient aucun événement.', 422);
    }

    const events = vevents.map((vevent) => {
      const event = new ICAL.Event(vevent);
      const start = event.startDate.toJSDate();
      const end = event.endDate.toJSDate();
      const uid = vevent.getFirstPropertyValue('uid');

      return { start, end, uid };
    });

    return events;
  } catch (error) {
    if (error instanceof ICalSyncError) {
      throw error;
    }
    console.error('Error parsing iCal feed:', error);
    throw new ICalSyncError('Erreur technique lors de la lecture du flux iCal.', 500);
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
