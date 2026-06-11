// Fair Housing Act compliance: block listings that express a discriminatory
// preference or limitation based on a protected class. This is a best-effort
// keyword screen — it flags obvious violations so they can be edited before
// posting. It is intentionally conservative to avoid false positives.

const BANNED_PATTERNS: { pattern: RegExp; label: string }[] = [
  // Religion
  { pattern: /\b(christ(ian)?s?|cathol(ic|ics)|muslim|hindu|jewish|jews?)\s+(only|preferred|wanted)\b/i, label: "religious preference" },
  { pattern: /\bno\s+(muslims?|jews?|christians?|hindus?|atheists?)\b/i, label: "religious exclusion" },
  // National origin / race
  { pattern: /\bno\s+(international|foreign|asian|black|white|indian|chinese|hispanic|latino|mexican)\s+(students?|people|tenants?|roommates?)?\b/i, label: "national origin / race exclusion" },
  { pattern: /\b(whites?|asians?|americans?|indians?|chinese)\s+(only|preferred)\b/i, label: "race / national origin preference" },
  { pattern: /\bno\s+(immigrants?|visa\s+holders?)\b/i, label: "national origin exclusion" },
  // Familial status
  { pattern: /\bno\s+(kids|children|families|babies)\b/i, label: "familial status exclusion" },
  { pattern: /\b(adults?\s+only)\b/i, label: "familial status exclusion" },
  // Disability
  { pattern: /\bno\s+(disabled|handicapped|wheelchair)\b/i, label: "disability exclusion" },
  { pattern: /\bno\s+(service|emotional\s+support)\s+animals?\b/i, label: "disability exclusion (assistance animals)" },
  // Sexual orientation / gender identity (protected in Illinois)
  { pattern: /\bno\s+(gays?|lesbians?|lgbtq?|trans(gender)?)\b/i, label: "sexual orientation / gender identity exclusion" },
  { pattern: /\b(straight|hetero(sexual)?)\s+(only|preferred)\b/i, label: "sexual orientation preference" },
];

export type FairHousingViolation = { label: string; match: string };

/**
 * Returns a list of detected Fair Housing violations. Empty array means the
 * text passed the screen. Note: roommate gender preference is NOT screened
 * here because the federal "shared living space" exemption allows it.
 */
export function screenFairHousing(...texts: (string | null | undefined)[]): FairHousingViolation[] {
  const combined = texts.filter(Boolean).join("\n");
  const violations: FairHousingViolation[] = [];
  for (const { pattern, label } of BANNED_PATTERNS) {
    const m = combined.match(pattern);
    if (m) violations.push({ label, match: m[0] });
  }
  return violations;
}
