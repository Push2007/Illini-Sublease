export const ALLOWED_EMAIL_DOMAIN =
  process.env.ALLOWED_EMAIL_DOMAIN?.trim().toLowerCase() || "illinois.edu";

/** Only real UIUC students (e.g. netid@illinois.edu) may register or sign in. */
export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at === -1) return false;
  const domain = normalized.slice(at + 1);
  return domain === ALLOWED_EMAIL_DOMAIN || domain.endsWith(`.${ALLOWED_EMAIL_DOMAIN}`);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
