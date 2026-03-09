export function extractLatLngFromRouteUrl(routeUrl: string) {
  try {
    const url = new URL(routeUrl);
    const destination = url.searchParams.get('destination');

    if (!destination) return null;

    const [latStr, lngStr] = destination.split(',');
    const lat = Number(latStr);
    const lng = Number(lngStr);

    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}