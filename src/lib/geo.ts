import { CAMPUS_RADIUS_MILES } from "@/lib/constants";

/** UIUC campus reference point — 901 W. Illinois St., Urbana, IL 61801. */
export const CAMPUS_LAT = 40.1106;
export const CAMPUS_LON = -88.2272;

/** Great-circle distance in miles between two coordinates (Haversine). */
export function milesBetween(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function milesFromCampus(lat: number, lon: number) {
  return milesBetween(CAMPUS_LAT, CAMPUS_LON, lat, lon);
}

export function isWithinCampusRadius(lat: number, lon: number) {
  return milesFromCampus(lat, lon) <= CAMPUS_RADIUS_MILES;
}
