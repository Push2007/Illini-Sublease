import { Resend } from "resend";
import { escapeHtml, sanitizeSubjectLine } from "@/lib/validation";

const apiKey = process.env.RESEND_API_KEY?.trim();
const from = process.env.EMAIL_FROM?.trim() || "UIUC Sublease <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

type SendArgs = { to: string; subject: string; html: string; text?: string };
type SendResult = { delivered: boolean; error?: string };

function logToConsole(to: string, subject: string, body: string, reason: string) {
  console.log("\n========== EMAIL (console fallback) ==========");
  console.log(`Reason:  ${reason}`);
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(body);
  console.log("==============================================\n");
}

async function send({ to, subject, html, text }: SendArgs): Promise<SendResult> {
  const body = text ?? html.replace(/<[^>]+>/g, "");

  if (!resend) {
    logToConsole(to, subject, body, "no RESEND_API_KEY set");
    return { delivered: false };
  }

  try {
    const { error } = await resend.emails.send({ from, to, subject, html, text });
    if (error) {
      // Common cause: Resend test mode (onboarding@resend.dev) only delivers to
      // your own account email. Verify a domain and set EMAIL_FROM to send freely.
      const message = `${error.name}: ${error.message}`;
      console.error(`[email] Resend rejected send to ${to}: ${message}`);
      logToConsole(to, subject, body, `Resend error — ${message}`);
      return { delivered: false, error: message };
    }
    return { delivered: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`[email] Failed to send to ${to}: ${message}`);
    logToConsole(to, subject, body, `exception — ${message}`);
    return { delivered: false, error: message };
  }
}

export async function sendReportNotification(
  listingId: string,
  listingTitle: string,
  reason: string,
  reporterEmail?: string
) {
  const admin = process.env.ADMIN_EMAIL?.trim();
  if (!admin) {
    console.log(`[REPORT] Listing ${listingId} ("${listingTitle}") reported: ${reason} (by ${reporterEmail ?? "unknown"})`);
    return { delivered: false as const };
  }
  // Escape user-controlled values before embedding in HTML email.
  const safeTitle = escapeHtml(listingTitle);
  const safeReason = escapeHtml(reason);
  const safeReporter = escapeHtml(reporterEmail ?? "unknown");
  const safeId = escapeHtml(listingId);
  const subjectTitle = sanitizeSubjectLine(listingTitle);
  return send({
    to: admin,
    subject: `[Report] Listing flagged: ${subjectTitle}`,
    text: `Listing ${listingId} ("${listingTitle}") was reported.\nReason: ${reason}\nReporter: ${reporterEmail ?? "unknown"}`,
    html: `
      <div style="font-family:system-ui,sans-serif">
        <h3>Listing reported</h3>
        <p><strong>Listing:</strong> ${safeTitle} (${safeId})</p>
        <p><strong>Reason:</strong> ${safeReason}</p>
        <p><strong>Reporter:</strong> ${safeReporter}</p>
        <p><a href="/listings/${encodeURIComponent(listingId)}">View listing</a></p>
      </div>`,
  });
}
