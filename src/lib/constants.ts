import type { CampusArea, Term } from "@/generated/prisma/enums";

export const CAMPUS_AREAS: { value: CampusArea; label: string; hint: string }[] = [
  { value: "NORTH", label: "North Campus", hint: "Engineering Quad" },
  { value: "SOUTH", label: "South Campus", hint: "South Quad" },
  { value: "URBANA", label: "Urbana side", hint: "East of campus" },
  { value: "CHAMPAIGN", label: "Champaign side", hint: "West of campus" },
];

export const TERMS: { value: Term; label: string }[] = [
  { value: "FALL", label: "Fall semester" },
  { value: "SPRING", label: "Spring semester" },
  { value: "SUMMER", label: "Summer term" },
  { value: "WINTER", label: "Winter term" },
];

/** Popular Champaign-Urbana MTD bus lines near campus. */
export const BUS_ROUTES = [
  "22 Illini",
  "220 Illini Limited",
  "24 Link",
  "100 Yellow",
  "1 Yellow",
  "4 Blue",
  "5 Green",
  "21 Raven",
  "13 Silver",
  "12 Teal",
  "9 Brown",
  "10 Gold",
  "2 Red",
  "120 Teal Late Night",
] as const;

export const ROOMMATE_GENDER_OPTIONS = [
  "Co-ed / mixed",
  "Female roommates",
  "Male roommates",
  "No roommates",
] as const;

export const PRICE_MIN = 200;
export const PRICE_MAX = 3000;

export function campusAreaLabel(value: CampusArea) {
  return CAMPUS_AREAS.find((c) => c.value === value)?.label ?? value;
}
export function termLabel(value: Term) {
  return TERMS.find((t) => t.value === value)?.label ?? value;
}
export function roomLayoutLabel(value: string) {
  return value;
}
