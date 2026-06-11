export type GeocodeResult = { lat: number; lon: number; displayName: string };

/**
 * Geocode a free-text address with OpenStreetMap Nominatim (no API key needed).
 * Returns null if the address can't be resolved. We bias results toward the
 * Champaign-Urbana area to improve accuracy for short inputs.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const query = /champaign|urbana|il\b|illinois/i.test(address)
    ? address
    : `${address}, Champaign-Urbana, IL`;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "us");

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "UIUC-Sublease/1.0 (sublease matchmaking app)" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (!Array.isArray(data) || data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch {
    return null;
  }
}
