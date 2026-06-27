/** Build a Google Maps link that opens the listing location by address. */
export function buildGoogleMapsUrl(listing: {
  address: string;
  latitude: number | null;
  longitude: number | null;
}): string {
  const address = listing.address.trim();
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  if (listing.latitude != null && listing.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`;
  }
  return "https://www.google.com/maps";
}
